
-- 1. Fix charge_affaires_profiles overexposure
DROP POLICY IF EXISTS "Authenticated read CA profiles basics" ON public.charge_affaires_profiles;

-- Allow company owners to read only the profile of their assigned CA
CREATE POLICY "Company owners read assigned CA profile"
  ON public.charge_affaires_profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.owner_user_id = auth.uid()
        AND companies.assigned_charge_affaires = charge_affaires_profiles.user_id
    )
  );

-- 2. Fix storage policies
DROP POLICY IF EXISTS "Auth read tender uploads" ON storage.objects;
DROP POLICY IF EXISTS "Auth read message attachments" ON storage.objects;

-- Tender uploads: owner-only read (folder prefix = user_id)
CREATE POLICY "Owner read tender uploads"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'tender-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Message attachments: only participants of the related request can read
-- Convention: file path starts with <request_id>/...
CREATE POLICY "Participants read message attachments"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'message-attachments'
    AND public.can_access_request(
      ((storage.foldername(name))[1])::uuid
    )
  );
