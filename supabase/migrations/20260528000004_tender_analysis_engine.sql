-- =========================================================
-- MOTEUR D'ANALYSE DES APPELS D'OFFRES — schéma de base
-- Lie : Entreprise (company) → AO (tender) → Lots → Documents → Rapport IA
-- Idempotent : peut être collé/relancé sans risque dans le SQL Editor.
-- =========================================================

-- ---------------------------------------------------------
-- 0. CRÉDITS sur les entreprises
-- ---------------------------------------------------------
alter table public.companies
  add column if not exists credits integer not null default 3;

-- ---------------------------------------------------------
-- 1. ENUMS de workflow
-- ---------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'analysis_status') then
    create type public.analysis_status as enum (
      'pending',                      -- crédit déduit, en file d'attente
      'scraping',                     -- bot en train de télécharger le DCE
      'analyzing',                    -- documents présents, Claude en cours
      'completed',                    -- rapport prêt
      'manual_intervention_required', -- scraper KO → le CA doit uploader le DCE
      'failed'                        -- erreur irrécupérable
    );
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'analysis_verdict') then
    create type public.analysis_verdict as enum ('go', 'no_go', 'go_with_reserve');
  end if;
end $$;

-- ---------------------------------------------------------
-- 2. TENDER_ANALYSES — une ligne par analyse lancée
-- ---------------------------------------------------------
create table if not exists public.tender_analyses (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references public.companies(id) on delete cascade,
  tender_id         text not null references public.tenders(id) on delete cascade,
  request_id        uuid references public.tender_requests(id) on delete set null,
  launched_by       uuid references auth.users(id) on delete set null,

  -- source / scraping
  buyer_profile_url text,            -- URL profil acheteur (point de départ du scraping)
  platform          text,            -- moteur détecté : aws-achat | achatpublic | dematis | ...

  -- lots
  lots              jsonb default '[]'::jsonb,   -- lots extraits : [{num, intitule, ...}]
  selected_lots     text[] default '{}',         -- lots choisis par l'utilisateur

  -- workflow
  status            public.analysis_status not null default 'pending',
  status_detail     text,            -- message d'erreur scraper / précision

  -- résultat IA
  verdict           public.analysis_verdict,
  report            jsonb,           -- {synthese, points_forts[], points_manquants[], ...}

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  completed_at      timestamptz
);
alter table public.tender_analyses enable row level security;
create index if not exists idx_ta_company on public.tender_analyses(company_id);
create index if not exists idx_ta_tender  on public.tender_analyses(tender_id);
create index if not exists idx_ta_status  on public.tender_analyses(status);

-- ---------------------------------------------------------
-- 3. TENDER_DOCUMENTS — fichiers du DCE (scrapés ou uploadés)
-- ---------------------------------------------------------
create table if not exists public.tender_documents (
  id             uuid primary key default gen_random_uuid(),
  analysis_id    uuid not null references public.tender_analyses(id) on delete cascade,
  file_name      text not null,
  doc_type       text,              -- RC | CCTP | CCAP | DPGF | AE | DUME | autre
  storage_path   text not null,     -- chemin dans le bucket tender-documents
  mime_type      text,
  size_bytes     bigint,
  source         text not null default 'scraper',  -- scraper | manual
  extracted_text text,              -- texte extrait (optionnel ; null pour PDF lus nativement)
  uploaded_by    uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now()
);
alter table public.tender_documents enable row level security;
create index if not exists idx_td_analysis on public.tender_documents(analysis_id);

-- ---------------------------------------------------------
-- 4. CREDIT_TRANSACTIONS — journal des crédits
-- ---------------------------------------------------------
create table if not exists public.credit_transactions (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  amount      integer not null,     -- négatif = dépense, positif = octroi
  reason      text not null,        -- 'analysis' | 'refund' | 'grant' | ...
  analysis_id uuid references public.tender_analyses(id) on delete set null,
  created_at  timestamptz not null default now()
);
alter table public.credit_transactions enable row level security;
create index if not exists idx_ct_company on public.credit_transactions(company_id);

-- ---------------------------------------------------------
-- 5. HELPER : l'utilisateur courant peut-il accéder à cette analyse ?
-- ---------------------------------------------------------
create or replace function public.can_access_analysis(_analysis_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.tender_analyses ta
    join public.companies c on c.id = ta.company_id
    where ta.id = _analysis_id
      and (
        c.owner_user_id = auth.uid()
        or c.assigned_charge_affaires = auth.uid()
        or public.has_role(auth.uid(), 'admin')
      )
  )
$$;

-- ---------------------------------------------------------
-- 6. RLS — tender_analyses
-- ---------------------------------------------------------
drop policy if exists "Owner reads own analyses"   on public.tender_analyses;
create policy "Owner reads own analyses" on public.tender_analyses
  for select to authenticated using (public.is_company_owner(company_id));

drop policy if exists "CA reads assigned analyses"  on public.tender_analyses;
create policy "CA reads assigned analyses" on public.tender_analyses
  for select to authenticated using (
    exists (select 1 from public.companies c
            where c.id = company_id and c.assigned_charge_affaires = auth.uid())
  );

drop policy if exists "Admins read all analyses"    on public.tender_analyses;
create policy "Admins read all analyses" on public.tender_analyses
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- CA / admin peuvent faire évoluer une analyse (statut, etc.)
drop policy if exists "CA updates assigned analyses" on public.tender_analyses;
create policy "CA updates assigned analyses" on public.tender_analyses
  for update to authenticated using (
    exists (select 1 from public.companies c
            where c.id = company_id and c.assigned_charge_affaires = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

-- service_role (Edge Functions + worker Trigger.dev) : accès complet
drop policy if exists "Service role manages analyses" on public.tender_analyses;
create policy "Service role manages analyses" on public.tender_analyses
  for all to service_role using (true) with check (true);

-- ---------------------------------------------------------
-- 7. RLS — tender_documents
-- ---------------------------------------------------------
drop policy if exists "Access docs of accessible analyses" on public.tender_documents;
create policy "Access docs of accessible analyses" on public.tender_documents
  for select to authenticated using (public.can_access_analysis(analysis_id));

-- Upload manuel par le CA / admin
drop policy if exists "CA inserts docs" on public.tender_documents;
create policy "CA inserts docs" on public.tender_documents
  for insert to authenticated with check (
    public.can_access_analysis(analysis_id)
    and (public.has_role(auth.uid(), 'charge_affaires') or public.has_role(auth.uid(), 'admin'))
  );

drop policy if exists "Service role manages docs" on public.tender_documents;
create policy "Service role manages docs" on public.tender_documents
  for all to service_role using (true) with check (true);

-- ---------------------------------------------------------
-- 8. RLS — credit_transactions (lecture seule côté client)
-- ---------------------------------------------------------
drop policy if exists "Owner reads own credit tx" on public.credit_transactions;
create policy "Owner reads own credit tx" on public.credit_transactions
  for select to authenticated using (public.is_company_owner(company_id));

drop policy if exists "Admins read all credit tx" on public.credit_transactions;
create policy "Admins read all credit tx" on public.credit_transactions
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Service role manages credit tx" on public.credit_transactions;
create policy "Service role manages credit tx" on public.credit_transactions
  for all to service_role using (true) with check (true);

-- ---------------------------------------------------------
-- 9. RPC ATOMIQUE : déduire 1 crédit + créer l'analyse
--    Tout se passe dans une seule transaction (anti double-clic / race).
--    Le paramètre _initial_status vaut 'manual_intervention_required' en
--    phase 1 (pas de scraper) ; il passera à 'pending' quand le worker
--    Trigger.dev sera branché (phase 2).
-- ---------------------------------------------------------
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
  -- 1. autorisation : le caller doit être propriétaire de l'entreprise
  if not public.is_company_owner(_company_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  -- 2. déduction atomique : ne décrémente que s'il reste des crédits
  update public.companies
     set credits = credits - 1
   where id = _company_id
     and credits > 0
  returning credits into v_remaining;

  if v_remaining is null then
    raise exception 'insufficient_credits' using errcode = 'P0001';
  end if;

  -- 3. l'AO doit exister dans public.tenders (upsert depuis les données BOAMP)
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

  -- 4. créer l'analyse
  insert into public.tender_analyses (
    company_id, tender_id, launched_by, buyer_profile_url,
    lots, selected_lots, status
  ) values (
    _company_id, _tender_id, auth.uid(), _buyer_profile_url,
    coalesce(_lots, '[]'::jsonb), coalesce(_selected_lots, '{}'), _initial_status
  )
  returning id into v_analysis_id;

  -- 5. créer (ou réutiliser) le DOSSIER lié → apparaît dans "Mes dossiers"
  --    et chez le chargé d'affaires assigné à l'entreprise.
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

  -- 6. NOTIFIER le chargé d'affaires sur la plateforme (message dans le fil du dossier)
  insert into public.messages (request_id, sender_user_id, body)
  values (
    v_request_id,
    auth.uid(),
    'Bonjour, je viens de lancer une analyse complète sur cet appel d''offres. ' ||
    'Pouvez-vous récupérer le dossier de consultation (DCE) pour lancer l''analyse IA ? Merci !'
  );

  -- 7. journaliser la dépense
  insert into public.credit_transactions (company_id, amount, reason, analysis_id)
  values (_company_id, -1, 'analysis', v_analysis_id);

  return v_analysis_id;
end $$;

grant execute on function public.spend_credit_and_start_analysis(
  uuid, text, text, text, text, text, date, timestamptz, text, text,
  text[], text, text, jsonb, jsonb, text[], public.analysis_status
) to authenticated;

-- ---------------------------------------------------------
-- 9b. RPC : rembourser le crédit si l'analyse échoue
--     (appelée par l'Edge Function analyze-tender en service_role)
-- ---------------------------------------------------------
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
  -- Anti double-remboursement : on ne rembourse que s'il n'existe pas déjà
  -- une transaction 'refund' pour cette analyse.
  if _analysis_id is not null and exists (
    select 1 from public.credit_transactions
    where analysis_id = _analysis_id and reason = 'refund'
  ) then
    return;
  end if;

  update public.companies set credits = credits + 1 where id = _company_id;

  insert into public.credit_transactions (company_id, amount, reason, analysis_id)
  values (_company_id, 1, 'refund', _analysis_id);
end $$;

-- ---------------------------------------------------------
-- 10. Trigger updated_at + Realtime (badge "analyse en cours" live)
-- ---------------------------------------------------------
drop trigger if exists trg_ta_updated on public.tender_analyses;
create trigger trg_ta_updated before update on public.tender_analyses
  for each row execute function public.touch_updated_at();

do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'tender_analyses'
  ) then
    alter publication supabase_realtime add table public.tender_analyses;
  end if;
end $$;

-- ---------------------------------------------------------
-- 11. STORAGE — bucket privé pour les documents du DCE
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('tender-documents', 'tender-documents', false)
  on conflict (id) do nothing;

drop policy if exists "Auth read tender documents" on storage.objects;
create policy "Auth read tender documents" on storage.objects
  for select to authenticated using (bucket_id = 'tender-documents');

-- Upload manuel par CA / admin (le worker passe en service_role)
drop policy if exists "CA insert tender documents" on storage.objects;
create policy "CA insert tender documents" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'tender-documents'
    and (public.has_role(auth.uid(), 'charge_affaires') or public.has_role(auth.uid(), 'admin'))
  );
