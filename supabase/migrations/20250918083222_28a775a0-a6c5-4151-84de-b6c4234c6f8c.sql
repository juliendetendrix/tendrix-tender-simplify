-- Create table for sales funnel responses
CREATE TABLE public.sales_funnel_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  employee_count TEXT NOT NULL,
  sector TEXT NOT NULL,
  tender_experience TEXT NOT NULL,
  contact TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sales_funnel_responses ENABLE ROW LEVEL SECURITY;

-- Create policy for public insert (anonymous users can submit)
CREATE POLICY "Allow public insert" 
ON public.sales_funnel_responses 
FOR INSERT 
WITH CHECK (true);

-- Add comment to document the purpose
COMMENT ON TABLE public.sales_funnel_responses IS 'Sales funnel form responses. Public can insert, admin access only via Supabase Dashboard.';