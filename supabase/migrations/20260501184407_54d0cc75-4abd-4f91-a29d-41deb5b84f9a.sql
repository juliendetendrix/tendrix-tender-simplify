-- =========================================================
-- 1. ROLES
-- =========================================================
create type public.app_role as enum ('entreprise', 'charge_affaires', 'admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Users can read their own roles ; only admins can manage roles
create policy "Users read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "Admins read all roles" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins insert roles" on public.user_roles
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update roles" on public.user_roles
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete roles" on public.user_roles
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 2. COMPANIES
-- =========================================================
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  siren text,
  sector text,
  zone text,
  certifications text[] default '{}',
  contact_name text,
  contact_phone text,
  assigned_charge_affaires uuid references auth.users(id) on delete set null,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.companies enable row level security;
create index idx_companies_owner on public.companies(owner_user_id);
create index idx_companies_charge on public.companies(assigned_charge_affaires);

create policy "Owners read own company" on public.companies
  for select to authenticated using (auth.uid() = owner_user_id);
create policy "Charge affaires read assigned companies" on public.companies
  for select to authenticated using (auth.uid() = assigned_charge_affaires);
create policy "Admins read all companies" on public.companies
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Owners update own company" on public.companies
  for update to authenticated using (auth.uid() = owner_user_id);
create policy "Admins update all companies" on public.companies
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins insert companies" on public.companies
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete companies" on public.companies
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 3. CHARGE AFFAIRES PROFILES
-- =========================================================
create table public.charge_affaires_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text,
  phone text,
  specialties text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.charge_affaires_profiles enable row level security;

create policy "CA read own profile" on public.charge_affaires_profiles
  for select to authenticated using (auth.uid() = user_id);
create policy "CA update own profile" on public.charge_affaires_profiles
  for update to authenticated using (auth.uid() = user_id);
create policy "Admins manage CA profiles" on public.charge_affaires_profiles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
-- Companies need to read assigned CA's display name
create policy "Authenticated read CA profiles basics" on public.charge_affaires_profiles
  for select to authenticated using (true);

-- =========================================================
-- 4. TENDERS
-- =========================================================
create table public.tenders (
  id text primary key,
  title text not null,
  summary text,
  organisme text,
  location text,
  budget text,
  date_publication timestamptz,
  deadline date,
  famille text,
  procedure text,
  cpv_codes text[] default '{}',
  source text not null default 'boamp',  -- boamp | manual_url | manual_pdf
  source_url text,
  pdf_path text,
  raw jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.tenders enable row level security;
create index idx_tenders_date_pub on public.tenders(date_publication desc);

create policy "Authenticated read tenders" on public.tenders
  for select to authenticated using (true);
create policy "Authenticated insert manual tenders" on public.tenders
  for insert to authenticated with check (auth.uid() = created_by and source in ('manual_url','manual_pdf'));
create policy "Service role manages all tenders" on public.tenders
  for all to service_role using (true) with check (true);
create policy "Admins manage all tenders" on public.tenders
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 5. TENDER REQUESTS (dossiers)
-- =========================================================
create table public.tender_requests (
  id uuid primary key default gen_random_uuid(),
  tender_id text not null references public.tenders(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  charge_affaires_id uuid references auth.users(id) on delete set null,
  status text not null default 'demande',  -- demande | en_cours | soumis | gagne | perdu
  amount_won numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.tender_requests enable row level security;
create index idx_tr_company on public.tender_requests(company_id);
create index idx_tr_charge on public.tender_requests(charge_affaires_id);

-- helper: is the current user the owner of the company on this request?
create or replace function public.is_company_owner(_company_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.companies where id = _company_id and owner_user_id = auth.uid())
$$;

create policy "Owner reads own requests" on public.tender_requests
  for select to authenticated using (public.is_company_owner(company_id));
create policy "CA reads assigned requests" on public.tender_requests
  for select to authenticated using (auth.uid() = charge_affaires_id);
create policy "Admins read all requests" on public.tender_requests
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Owner creates own requests" on public.tender_requests
  for insert to authenticated with check (public.is_company_owner(company_id));
create policy "CA updates assigned requests" on public.tender_requests
  for update to authenticated using (auth.uid() = charge_affaires_id);
create policy "Owner updates own requests" on public.tender_requests
  for update to authenticated using (public.is_company_owner(company_id));
create policy "Admins update all requests" on public.tender_requests
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 6. MESSAGES
-- =========================================================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.tender_requests(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  attachments jsonb not null default '[]',
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
create index idx_messages_request on public.messages(request_id, created_at);

-- helper: can the current user access this request?
create or replace function public.can_access_request(_request_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.tender_requests tr
    join public.companies c on c.id = tr.company_id
    where tr.id = _request_id
      and (
        c.owner_user_id = auth.uid()
        or tr.charge_affaires_id = auth.uid()
        or public.has_role(auth.uid(), 'admin')
      )
  )
$$;

create policy "Participants read messages" on public.messages
  for select to authenticated using (public.can_access_request(request_id));
create policy "Participants send messages" on public.messages
  for insert to authenticated
  with check (sender_user_id = auth.uid() and public.can_access_request(request_id));

-- Realtime
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.tender_requests;

-- =========================================================
-- 7. UPDATED_AT TRIGGERS
-- =========================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_companies_updated before update on public.companies
  for each row execute function public.touch_updated_at();
create trigger trg_ca_profiles_updated before update on public.charge_affaires_profiles
  for each row execute function public.touch_updated_at();
create trigger trg_tr_updated before update on public.tender_requests
  for each row execute function public.touch_updated_at();

-- =========================================================
-- 8. STORAGE BUCKETS
-- =========================================================
insert into storage.buckets (id, name, public) values ('tender-uploads', 'tender-uploads', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('message-attachments', 'message-attachments', false)
  on conflict (id) do nothing;

create policy "Auth read tender uploads" on storage.objects
  for select to authenticated using (bucket_id = 'tender-uploads');
create policy "Auth insert tender uploads" on storage.objects
  for insert to authenticated with check (bucket_id = 'tender-uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Auth read message attachments" on storage.objects
  for select to authenticated using (bucket_id = 'message-attachments');
create policy "Auth insert message attachments" on storage.objects
  for insert to authenticated with check (bucket_id = 'message-attachments' and (storage.foldername(name))[1] = auth.uid()::text);