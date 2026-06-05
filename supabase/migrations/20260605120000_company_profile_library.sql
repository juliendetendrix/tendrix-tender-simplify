-- =========================================================
-- PROFIL ENTREPRISE COMPLET + LIBRAIRIE DE DOCUMENTS
-- Le "carburant" des réponses : infos administratives, coordonnées,
-- capacités éco/techniques, et documents (KBIS, assurances, références…).
-- Idempotent.
-- =========================================================

-- ── 1. Champs profil sur companies ──────────────────────────────────────────
alter table public.companies
  add column if not exists forme_juridique  text,
  add column if not exists siret            text,
  add column if not exists rcs              text,
  add column if not exists capital_social   text,
  add column if not exists tva_intra        text,
  add column if not exists code_ape         text,
  add column if not exists descriptif       text,
  add column if not exists adresse          text,
  add column if not exists ville            text,
  add column if not exists code_postal      text,
  add column if not exists telephone        text,
  add column if not exists representant     text,
  -- capacités économiques
  add column if not exists ca_n             numeric,
  add column if not exists ca_n1            numeric,
  add column if not exists ca_n2            numeric,
  add column if not exists cloture_n        date,
  add column if not exists cloture_n1       date,
  add column if not exists cloture_n2       date,
  -- capacités techniques
  add column if not exists effectif_n       integer,
  add column if not exists effectif_n1      integer,
  add column if not exists nb_dirigeants    integer,
  add column if not exists tranche_effectif text;

-- ── 2. Librairie de documents ───────────────────────────────────────────────
-- category : admin | assurance | certificats | identite | presentation |
--            methodologies | moyens_humains | moyens_materiels | references | memoires
-- slot     : pour les emplacements prédéfinis (kbis, rib, logo…) ; null = ajout libre
create table if not exists public.library_documents (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  category     text not null,
  slot         text,
  label        text not null,
  file_name    text not null,
  storage_path text not null,
  mime_type    text,
  size_bytes   bigint,
  uploaded_by  uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);
alter table public.library_documents enable row level security;
create index if not exists idx_libdoc_company on public.library_documents(company_id);

-- Le propriétaire gère ses documents ; le CA assigné et l'admin peuvent les lire.
drop policy if exists "Owner manages library" on public.library_documents;
create policy "Owner manages library" on public.library_documents
  for all to authenticated
  using (public.is_company_owner(company_id))
  with check (public.is_company_owner(company_id));

drop policy if exists "CA reads library" on public.library_documents;
create policy "CA reads library" on public.library_documents
  for select to authenticated using (
    exists (select 1 from public.companies c
            where c.id = company_id and c.assigned_charge_affaires = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "Service role manages library" on public.library_documents;
create policy "Service role manages library" on public.library_documents
  for all to service_role using (true) with check (true);

-- ── 3. Bucket privé pour les documents de la librairie ──────────────────────
insert into storage.buckets (id, name, public)
  values ('company-library', 'company-library', false)
  on conflict (id) do nothing;

drop policy if exists "Auth read company library" on storage.objects;
create policy "Auth read company library" on storage.objects
  for select to authenticated using (bucket_id = 'company-library');

drop policy if exists "Auth write company library" on storage.objects;
create policy "Auth write company library" on storage.objects
  for insert to authenticated with check (bucket_id = 'company-library');

drop policy if exists "Auth update company library" on storage.objects;
create policy "Auth update company library" on storage.objects
  for update to authenticated using (bucket_id = 'company-library');

drop policy if exists "Auth delete company library" on storage.objects;
create policy "Auth delete company library" on storage.objects
  for delete to authenticated using (bucket_id = 'company-library');
