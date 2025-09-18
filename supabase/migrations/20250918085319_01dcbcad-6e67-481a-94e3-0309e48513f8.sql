-- Fix security vulnerability: Add explicit SELECT denial policy for anonymous users
-- and restrict SELECT access to service role only

-- Policy to explicitly deny SELECT access to anonymous users
CREATE POLICY "Deny anonymous SELECT access" 
ON public.beta_questionnaire_responses 
FOR SELECT 
TO anon
USING (false);

-- Policy to explicitly deny UPDATE access to anonymous users  
CREATE POLICY "Deny anonymous UPDATE access" 
ON public.beta_questionnaire_responses 
FOR UPDATE 
TO anon
USING (false);

-- Policy to explicitly deny DELETE access to anonymous users
CREATE POLICY "Deny anonymous DELETE access" 
ON public.beta_questionnaire_responses 
FOR DELETE 
TO anon
USING (false);

-- Note: Only service_role can read this data via Supabase dashboard
-- No additional SELECT policy needed for service_role as it bypasses RLS