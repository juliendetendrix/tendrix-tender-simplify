-- Remove the dangerous public read policy
DROP POLICY "Allow public read" ON public."Questionnaire";

-- Keep only the insert policy for anonymous form submissions
-- Users can submit but cannot read any data
-- Only authenticated admin users will be able to read questionnaire data later

-- Add a comment to document the security fix
COMMENT ON TABLE public."Questionnaire" IS 'Stores waitlist/questionnaire responses. Insert-only for public, read access restricted to admin users only.';