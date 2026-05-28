-- =========================================================
-- CA Dashboard — RLS & policies supplémentaires
-- =========================================================

-- 1. CA peut lire TOUTES les companies (pour voir les non-assignées)
DROP POLICY IF EXISTS "CA reads all companies" ON public.companies;
CREATE POLICY "CA reads all companies" ON public.companies
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'charge_affaires'));

-- 2. CA peut s'auto-assigner à une company (et uniquement à soi-même)
DROP POLICY IF EXISTS "CA self-assign to companies" ON public.companies;
CREATE POLICY "CA self-assign to companies" ON public.companies
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'charge_affaires'))
  WITH CHECK (assigned_charge_affaires = auth.uid());

-- 3. CA peut lire les dossiers des companies qui lui sont assignées
DROP POLICY IF EXISTS "CA reads requests from assigned companies" ON public.tender_requests;
CREATE POLICY "CA reads requests from assigned companies" ON public.tender_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id
      AND c.assigned_charge_affaires = auth.uid()
    )
  );

-- 4. CA peut se lier à un dossier d'une company assignée
DROP POLICY IF EXISTS "CA self-assign to requests" ON public.tender_requests;
CREATE POLICY "CA self-assign to requests" ON public.tender_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id
      AND c.assigned_charge_affaires = auth.uid()
    )
  );

-- 5. Mise à jour de can_access_request pour inclure l'assignation company-level
CREATE OR REPLACE FUNCTION public.can_access_request(_request_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tender_requests tr
    JOIN public.companies c ON c.id = tr.company_id
    WHERE tr.id = _request_id
      AND (
        c.owner_user_id = auth.uid()
        OR tr.charge_affaires_id = auth.uid()
        OR c.assigned_charge_affaires = auth.uid()
        OR public.has_role(auth.uid(), 'admin')
      )
  )
$$;

-- 6. Auto-assigner le premier CA créé à toutes les companies sans CA
-- (best-effort : ne plante pas si aucun CA n'existe encore)
DO $$
DECLARE
  v_ca_id uuid;
BEGIN
  SELECT user_id INTO v_ca_id
  FROM public.charge_affaires_profiles
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_ca_id IS NOT NULL THEN
    UPDATE public.companies
    SET assigned_charge_affaires = v_ca_id
    WHERE assigned_charge_affaires IS NULL;

    UPDATE public.tender_requests
    SET charge_affaires_id = v_ca_id
    WHERE charge_affaires_id IS NULL;
  END IF;
END $$;
