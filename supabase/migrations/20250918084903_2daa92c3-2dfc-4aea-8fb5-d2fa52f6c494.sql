-- Create beta questionnaire responses table
CREATE TABLE public.beta_questionnaire_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  employees_range TEXT NOT NULL,
  sector TEXT NOT NULL,
  sector_other TEXT,
  ao_experience TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  consent BOOLEAN NOT NULL DEFAULT true,
  source_page TEXT NOT NULL DEFAULT '/',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Ensure at least one contact method is provided
  CONSTRAINT contact_required CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Enable Row Level Security
ALTER TABLE public.beta_questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anonymous users to insert only (for form submissions)
CREATE POLICY "Allow anonymous inserts only" 
ON public.beta_questionnaire_responses 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Policy 2: No read access for anonymous users (data is private)
-- Only service role can read data (via dashboard/server)