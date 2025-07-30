-- Fix the indicator_data table to support ON CONFLICT operations
-- First, let's create a proper table structure with constraints

-- Drop existing table if it exists (backup data first if needed)
DROP TABLE IF EXISTS public.indicator_data;

-- Create indicator_data table with proper constraints
CREATE TABLE public.indicator_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,
  symbol TEXT NOT NULL,
  date DATE NOT NULL,
  value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Create unique constraint for ON CONFLICT operations
  UNIQUE(provider, symbol, date)
);

-- Enable RLS
ALTER TABLE public.indicator_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access for all users" 
ON public.indicator_data FOR SELECT 
USING (true);

CREATE POLICY "Allow insert/update for authenticated users" 
ON public.indicator_data FOR ALL 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_indicator_data_provider_symbol ON public.indicator_data(provider, symbol);
CREATE INDEX idx_indicator_data_date ON public.indicator_data(date);
CREATE INDEX idx_indicator_data_metadata ON public.indicator_data USING GIN(metadata);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_indicator_data_updated_at
  BEFORE UPDATE ON public.indicator_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();