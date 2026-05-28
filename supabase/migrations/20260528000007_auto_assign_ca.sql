-- =========================================================
-- Auto-assignation du chargé d'affaires par défaut (Julien Malherbe)
-- à toute nouvelle entreprise créée sans CA.
-- =========================================================
create or replace function public.assign_default_ca()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ca uuid;
begin
  if new.assigned_charge_affaires is null then
    select user_id into v_ca from public.charge_affaires_profiles
      where display_name ilike '%malherbe%'
      order by created_at limit 1;
    if v_ca is null then
      select user_id into v_ca from public.charge_affaires_profiles
        order by created_at limit 1;
    end if;
    new.assigned_charge_affaires := v_ca;
  end if;
  return new;
end $$;

drop trigger if exists trg_assign_default_ca on public.companies;
create trigger trg_assign_default_ca
  before insert on public.companies
  for each row execute function public.assign_default_ca();
