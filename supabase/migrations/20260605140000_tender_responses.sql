-- =========================================================
-- GÉNÉRATEUR DE RÉPONSE — l'IA prépare une 1re version du dossier de réponse
-- à partir du profil entreprise + librairie + analyse du DCE.
-- Idempotent.
-- =========================================================

-- ── 1. Dépense de crédits générique (atomique) ──────────────────────────────
create or replace function public.spend_credits(
  _company_id uuid,
  _amount     integer,
  _reason     text default 'response'
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_remaining integer;
begin
  if not public.is_company_owner(_company_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.companies
     set credits = credits - _amount
   where id = _company_id and credits >= _amount
  returning credits into v_remaining;

  if v_remaining is null then
    raise exception 'insufficient_credits' using errcode = 'P0001';
  end if;

  insert into public.credit_transactions (company_id, amount, reason)
  values (_company_id, -_amount, _reason);

  return v_remaining;
end $$;

grant execute on function public.spend_credits(uuid, integer, text) to authenticated;

-- ── 2. Table des réponses générées ──────────────────────────────────────────
create table if not exists public.tender_responses (
  id            uuid primary key default gen_random_uuid(),
  analysis_id   uuid references public.tender_analyses(id) on delete cascade,
  request_id    uuid references public.tender_requests(id) on delete set null,
  company_id    uuid not null references public.companies(id) on delete cascade,
  tender_id     text,
  selected_lots text[] default '{}',
  status        text not null default 'generating',  -- generating | ready | failed
  status_detail text,
  content       jsonb,            -- {avis, memoire[], pieces[], conseils[], ...}
  credits_spent integer default 0,
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);
alter table public.tender_responses enable row level security;
create index if not exists idx_tr_company on public.tender_responses(company_id);
create index if not exists idx_tr_analysis on public.tender_responses(analysis_id);

drop policy if exists "Owner reads own responses" on public.tender_responses;
create policy "Owner reads own responses" on public.tender_responses
  for select to authenticated using (public.is_company_owner(company_id));

drop policy if exists "Owner inserts responses" on public.tender_responses;
create policy "Owner inserts responses" on public.tender_responses
  for insert to authenticated with check (public.is_company_owner(company_id));

drop policy if exists "CA reads assigned responses" on public.tender_responses;
create policy "CA reads assigned responses" on public.tender_responses
  for select to authenticated using (
    exists (select 1 from public.companies c
            where c.id = company_id and c.assigned_charge_affaires = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "Service role manages responses" on public.tender_responses;
create policy "Service role manages responses" on public.tender_responses
  for all to service_role using (true) with check (true);

-- Realtime (statut "génération en cours" en direct)
do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'tender_responses'
  ) then
    alter publication supabase_realtime add table public.tender_responses;
  end if;
end $$;
