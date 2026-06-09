-- Conversation DIRECTE entre une entreprise et son chargé d'affaires (1 fil / entreprise).
-- Distinct de la messagerie par dossier (table `messages` + `tender_requests`).

create table if not exists public.company_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  sender_role text not null check (sender_role in ('company','ca')),
  sender_id uuid not null default auth.uid(),
  body text not null,
  created_at timestamptz not null default now(),
  read_by_company boolean not null default false,
  read_by_ca boolean not null default false
);

create index if not exists idx_company_messages_company on public.company_messages(company_id, created_at);

alter table public.company_messages enable row level security;

-- Accès : propriétaire de l'entreprise, CA assigné, ou admin.
create or replace function public.can_access_company_messages(_company_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_company_owner(_company_id)
    or exists (select 1 from public.companies c where c.id = _company_id and c.assigned_charge_affaires = auth.uid())
    or public.has_role(auth.uid(), 'admin');
$$;

drop policy if exists cm_select on public.company_messages;
create policy cm_select on public.company_messages for select to authenticated
  using (public.can_access_company_messages(company_id));

drop policy if exists cm_insert on public.company_messages;
create policy cm_insert on public.company_messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and public.can_access_company_messages(company_id)
    and (
      (sender_role = 'company' and public.is_company_owner(company_id))
      or (sender_role = 'ca' and (
        exists (select 1 from public.companies c where c.id = company_id and c.assigned_charge_affaires = auth.uid())
        or public.has_role(auth.uid(), 'admin')
      ))
    )
  );

drop policy if exists cm_update on public.company_messages;
create policy cm_update on public.company_messages for update to authenticated
  using (public.can_access_company_messages(company_id))
  with check (public.can_access_company_messages(company_id));
