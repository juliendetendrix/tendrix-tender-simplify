-- =========================================================
-- Inscription chargé d'affaires : crée le rôle + le profil pour
-- l'utilisateur courant, en contournant proprement la RLS
-- (l'insertion directe du rôle est réservée aux admins).
-- =========================================================
create or replace function public.register_charge_affaires(
  _display_name text,
  _email text,
  _phone text default null,
  _photo_url text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  insert into public.user_roles (user_id, role)
  values (auth.uid(), 'charge_affaires')
  on conflict (user_id, role) do nothing;

  insert into public.charge_affaires_profiles (user_id, display_name, email, phone, photo_url)
  values (auth.uid(), _display_name, _email, _phone, _photo_url)
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    email        = excluded.email,
    phone        = excluded.phone,
    photo_url    = coalesce(excluded.photo_url, public.charge_affaires_profiles.photo_url);
end $$;

grant execute on function public.register_charge_affaires(text, text, text, text) to authenticated;
