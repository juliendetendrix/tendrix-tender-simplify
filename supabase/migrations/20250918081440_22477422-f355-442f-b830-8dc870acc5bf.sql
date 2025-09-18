-- Add columns to store questionnaire responses
ALTER TABLE public."Questionnaire" 
ADD COLUMN company TEXT,
ADD COLUMN sector TEXT,
ADD COLUMN size TEXT,
ADD COLUMN email TEXT,
ADD COLUMN phone TEXT;

-- Create index for email lookups
CREATE INDEX idx_questionnaire_email ON public."Questionnaire"(email);

-- Create RLS policies
CREATE POLICY "Allow public insert" 
ON public."Questionnaire" 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read" 
ON public."Questionnaire" 
FOR SELECT 
USING (true);