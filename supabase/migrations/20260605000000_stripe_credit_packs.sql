-- =========================================================
-- STRIPE — Achat de packs de crédits (one-shot)
-- Idempotent : peut être relancé sans risque.
-- =========================================================

-- Id client Stripe (réutilisé d'un achat à l'autre) — optionnel.
alter table public.companies
  add column if not exists stripe_customer_id text;

-- ---------------------------------------------------------
-- Journal des achats de crédits (sert AUSSI d'idempotence :
-- une session Stripe ne peut créditer qu'une seule fois).
-- ---------------------------------------------------------
create table if not exists public.credit_purchases (
  id                 uuid primary key default gen_random_uuid(),
  company_id         uuid not null references public.companies(id) on delete cascade,
  stripe_session_id  text not null unique,
  pack_id            text,
  credits            integer not null,
  amount_cents       integer,
  currency           text default 'eur',
  status             text not null default 'pending',  -- pending | paid
  created_at         timestamptz not null default now(),
  paid_at            timestamptz
);
alter table public.credit_purchases enable row level security;
create index if not exists idx_cp_company on public.credit_purchases(company_id);

-- Le propriétaire de l'entreprise lit ses propres achats.
drop policy if exists "Owner reads own purchases" on public.credit_purchases;
create policy "Owner reads own purchases" on public.credit_purchases
  for select to authenticated using (public.is_company_owner(company_id));

-- Le service_role (webhook Stripe) gère tout.
drop policy if exists "Service role manages purchases" on public.credit_purchases;
create policy "Service role manages purchases" on public.credit_purchases
  for all to service_role using (true) with check (true);

-- ---------------------------------------------------------
-- RPC : créditer le compte après paiement, de façon IDEMPOTENTE.
-- Appelée par la fonction Edge `stripe-webhook` (service_role).
-- Si la session a déjà été traitée → no-op (pas de double crédit).
-- ---------------------------------------------------------
create or replace function public.grant_credits_for_session(
  _session_id  text,
  _company_id  uuid,
  _credits     integer,
  _amount      integer default null,
  _pack_id     text    default null,
  _currency    text    default 'eur'
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Tente d'enregistrer l'achat ; si la session existe déjà → conflit ignoré.
  insert into public.credit_purchases (
    company_id, stripe_session_id, pack_id, credits, amount_cents, currency, status, paid_at
  ) values (
    _company_id, _session_id, _pack_id, _credits, _amount, _currency, 'paid', now()
  )
  on conflict (stripe_session_id) do nothing;

  if not found then
    return false; -- déjà traité : on ne recrédite pas
  end if;

  update public.companies set credits = credits + _credits where id = _company_id;

  insert into public.credit_transactions (company_id, amount, reason)
  values (_company_id, _credits, 'purchase');

  return true;
end $$;

-- Réservé au service_role (le webhook) : pas d'exécution côté client.
revoke all on function public.grant_credits_for_session(text, uuid, integer, integer, text, text) from public, authenticated;
