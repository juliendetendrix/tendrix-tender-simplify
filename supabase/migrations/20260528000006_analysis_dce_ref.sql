-- =========================================================
-- Référence de consultation résolue depuis l'avis BOAMP
-- (alimentée par la fonction resolve-dce ; sert à retrouver
-- le DCE sur la plateforme de dématérialisation).
-- =========================================================
alter table public.tender_analyses
  add column if not exists consultation_ref text;
