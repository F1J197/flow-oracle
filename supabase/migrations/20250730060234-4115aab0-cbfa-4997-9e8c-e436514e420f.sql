-- Phase 1: Create missing indicator_data table for Universal Data Proxy
CREATE TABLE IF NOT EXISTS public.indicator_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,
  symbol TEXT NOT NULL,
  current_value NUMERIC,
  previous_value NUMERIC,
  change_value NUMERIC,
  change_percent NUMERIC,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confidence NUMERIC DEFAULT 1.0,
  source TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.indicator_data ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (as per existing pattern)
CREATE POLICY "Allow public read access to indicator_data" 
ON public.indicator_data 
FOR SELECT 
USING (true);

-- Allow service role to manage indicator_data (for edge functions)
CREATE POLICY "Allow service role to manage indicator_data" 
ON public.indicator_data 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_indicator_data_provider_symbol ON public.indicator_data(provider, symbol);
CREATE INDEX IF NOT EXISTS idx_indicator_data_timestamp ON public.indicator_data(timestamp DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_indicator_data_updated_at
BEFORE UPDATE ON public.indicator_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();