-- Table to capture leads from the onboarding questionnaire (step 1)
-- Inserted anonymously before full account creation, so anon role needs INSERT.

CREATE TABLE IF NOT EXISTS public.leads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name  text NOT NULL,
  email      text NOT NULL,
  phone      text,
  source     text DEFAULT 'questionnaire',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leads_email_unique UNIQUE (email)
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can insert a lead row
CREATE POLICY "anon can insert leads"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users can read leads (admin use)
CREATE POLICY "authenticated can read leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (true);
