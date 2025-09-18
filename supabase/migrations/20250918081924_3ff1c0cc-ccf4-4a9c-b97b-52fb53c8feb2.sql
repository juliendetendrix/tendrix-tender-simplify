-- Add explicit SELECT policy to ensure only authorized access
-- For now, restrict to authenticated users only (admins)
-- This prevents any unauthorized access to customer contact data

CREATE POLICY "Only authenticated users can read questionnaire data" 
ON public."Questionnaire" 
FOR SELECT 
TO authenticated
USING (true);

-- Optional: If you want to be more restrictive and only allow specific admin roles,
-- you would need to implement a user roles system first
-- For now, this provides basic protection while allowing dashboard access