-- Add photo_url to charge_affaires_profiles
ALTER TABLE charge_affaires_profiles
  ADD COLUMN IF NOT EXISTS photo_url text;

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for profile-photos bucket
-- Anyone can view photos (public bucket)
CREATE POLICY "profile_photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');

-- Authenticated users can upload their own photo
CREATE POLICY "profile_photos_auth_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can update their own photo
CREATE POLICY "profile_photos_auth_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
