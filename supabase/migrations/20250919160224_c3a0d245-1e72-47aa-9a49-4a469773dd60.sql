-- Create table for PME questionnaire responses
CREATE TABLE public.pme_questionnaire_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Section 1: Profil entreprise
  company_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  company_size TEXT NOT NULL,
  
  -- Section 2: Expérience appels d'offres
  ao_experience TEXT NOT NULL,
  ao_frequency TEXT,
  main_barriers TEXT[] NOT NULL DEFAULT '{}',
  other_barrier TEXT,
  externalized_ao BOOLEAN NOT NULL,
  
  -- Section 3: Besoin & perception
  platform_interest TEXT NOT NULL,
  important_criteria TEXT[] NOT NULL DEFAULT '{}',
  other_criteria TEXT,
  monthly_budget TEXT NOT NULL,
  
  -- Section 4: Invitation bêta
  beta_interest BOOLEAN NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  city_department TEXT,
  contact_sector TEXT,
  
  -- Consentement RGPD
  consent BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source_page TEXT NOT NULL DEFAULT '/questionnaire-pme'
);

-- Enable RLS
ALTER TABLE public.pme_questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (insert only)
CREATE POLICY "Allow anonymous inserts only" 
ON public.pme_questionnaire_responses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Deny anonymous SELECT access" 
ON public.pme_questionnaire_responses 
FOR SELECT 
USING (false);

CREATE POLICY "Deny anonymous UPDATE access" 
ON public.pme_questionnaire_responses 
FOR UPDATE 
USING (false);

CREATE POLICY "Deny anonymous DELETE access" 
ON public.pme_questionnaire_responses 
FOR DELETE 
USING (false);