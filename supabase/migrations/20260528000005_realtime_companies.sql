-- =========================================================
-- Realtime sur companies : le solde de crédits se met à jour
-- en direct dans le header de l'app dès qu'une analyse est lancée.
-- =========================================================
do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'companies'
  ) then
    alter publication supabase_realtime add table public.companies;
  end if;
end $$;
