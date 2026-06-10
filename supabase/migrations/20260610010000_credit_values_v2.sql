-- Révision des valeurs de crédits :
-- Analyse : 50 -> 500 crédits (50 €). Crédits offerts à l'inscription : 50 -> 1500
-- (= 3 analyses possibles, mais < 3500 = pas assez pour une réponse).

alter table public.companies alter column credits set default 1500;

create or replace function public.spend_credit_and_start_analysis(
  _company_id        uuid,
  _tender_id         text,
  _title             text,
  _organisme         text   default null,
  _location          text   default null,
  _budget            text   default null,
  _deadline          date   default null,
  _date_publication  timestamptz default null,
  _famille           text   default null,
  _procedure         text   default null,
  _cpv_codes         text[] default '{}',
  _source_url        text   default null,
  _buyer_profile_url text   default null,
  _raw               jsonb  default '{}'::jsonb,
  _lots              jsonb  default '[]'::jsonb,
  _selected_lots     text[] default '{}',
  _initial_status    public.analysis_status default 'manual_intervention_required'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_remaining integer;
  v_analysis_id uuid;
  v_request_id uuid;
  v_ca_id uuid;
begin
  if not public.is_company_owner(_company_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.companies
     set credits = credits - 500
   where id = _company_id
     and credits >= 500
  returning credits into v_remaining;

  if v_remaining is null then
    raise exception 'insufficient_credits' using errcode = 'P0001';
  end if;

  insert into public.tenders (
    id, title, organisme, location, budget, deadline, date_publication,
    famille, procedure, cpv_codes, source, source_url, raw, created_by
  ) values (
    _tender_id, _title, _organisme, _location, _budget, _deadline, _date_publication,
    _famille, _procedure, coalesce(_cpv_codes, '{}'), 'boamp', _source_url, _raw, auth.uid()
  )
  on conflict (id) do update
    set raw   = excluded.raw,
        title = excluded.title;

  insert into public.tender_analyses (
    company_id, tender_id, launched_by, buyer_profile_url,
    lots, selected_lots, status
  ) values (
    _company_id, _tender_id, auth.uid(), _buyer_profile_url,
    coalesce(_lots, '[]'::jsonb), coalesce(_selected_lots, '{}'), _initial_status
  )
  returning id into v_analysis_id;

  select assigned_charge_affaires into v_ca_id
    from public.companies where id = _company_id;

  select id into v_request_id
    from public.tender_requests
   where tender_id = _tender_id and company_id = _company_id
   limit 1;

  if v_request_id is null then
    insert into public.tender_requests (tender_id, company_id, charge_affaires_id, status)
    values (_tender_id, _company_id, v_ca_id, 'en_cours')
    returning id into v_request_id;
  end if;

  update public.tender_analyses set request_id = v_request_id where id = v_analysis_id;

  insert into public.messages (request_id, sender_user_id, body)
  values (
    v_request_id,
    auth.uid(),
    'Bonjour, je viens de lancer une analyse complète sur cet appel d''offres. ' ||
    'Pouvez-vous récupérer le dossier de consultation (DCE) pour lancer l''analyse IA ? Merci !'
  );

  insert into public.credit_transactions (company_id, amount, reason, analysis_id)
  values (_company_id, -500, 'analysis', v_analysis_id);

  return v_analysis_id;
end $$;

create or replace function public.refund_credit(
  _company_id  uuid,
  _analysis_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if _analysis_id is not null and exists (
    select 1 from public.credit_transactions
    where analysis_id = _analysis_id and reason = 'refund'
  ) then
    return;
  end if;

  update public.companies set credits = credits + 500 where id = _company_id;

  insert into public.credit_transactions (company_id, amount, reason, analysis_id)
  values (_company_id, 500, 'refund', _analysis_id);
end $$;
