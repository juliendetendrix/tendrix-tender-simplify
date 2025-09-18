-- Remove the overly permissive policy that allows all authenticated users to read all data
DROP POLICY "Only authenticated users can read questionnaire data" ON public."Questionnaire";

-- Since this is a waitlist/contact form where anonymous visitors submit their info,
-- and only site owners/admins should be able to read the responses,
-- we should not have any SELECT policy at all (RLS will block all reads via API)
-- Data will only be accessible via Supabase Dashboard for admins

-- Add comment to document the security decision
COMMENT ON TABLE public."Questionnaire" IS 'Waitlist/contact form responses. Public can insert, no API read access - admin access only via Supabase Dashboard.';