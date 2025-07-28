-- Create indicator registry table
CREATE TABLE public.indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  data_source TEXT NOT NULL,
  api_endpoint TEXT,
  pillar INTEGER CHECK (pillar IN (1, 2, 3, 4)),
  priority INTEGER DEFAULT 1,
  update_frequency TEXT DEFAULT 'daily',
  last_updated TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data points table for storing actual indicator values
CREATE TABLE public.data_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  indicator_id UUID NOT NULL REFERENCES public.indicators(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  raw_data JSONB,
  source_hash TEXT,
  confidence_score NUMERIC DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data validation table for consensus mechanisms
CREATE TABLE public.data_validations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data_point_id UUID NOT NULL REFERENCES public.data_points(id) ON DELETE CASCADE,
  validation_source TEXT NOT NULL,
  validation_value NUMERIC NOT NULL,
  variance_pct NUMERIC,
  is_consensus BOOLEAN DEFAULT false,
  validation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Create ingestion logs table
CREATE TABLE public.ingestion_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  indicator_id UUID NOT NULL REFERENCES public.indicators(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  execution_time_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_logs ENABLE ROW LEVEL SECURITY;

-- Create public read policies (no authentication required for this data)
CREATE POLICY "Allow public read access to indicators" 
ON public.indicators FOR SELECT USING (true);

CREATE POLICY "Allow public read access to data_points" 
ON public.data_points FOR SELECT USING (true);

CREATE POLICY "Allow public read access to data_validations" 
ON public.data_validations FOR SELECT USING (true);

CREATE POLICY "Allow public read access to ingestion_logs" 
ON public.ingestion_logs FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_indicators_symbol ON public.indicators(symbol);
CREATE INDEX idx_indicators_pillar ON public.indicators(pillar);
CREATE INDEX idx_data_points_indicator_timestamp ON public.data_points(indicator_id, timestamp DESC);
CREATE INDEX idx_data_points_timestamp ON public.data_points(timestamp DESC);
CREATE INDEX idx_data_validations_data_point ON public.data_validations(data_point_id);
CREATE INDEX idx_ingestion_logs_indicator ON public.ingestion_logs(indicator_id, started_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_indicators_updated_at
  BEFORE UPDATE ON public.indicators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial FRED indicators
INSERT INTO public.indicators (symbol, name, description, data_source, api_endpoint, pillar, priority) VALUES
('WALCL', 'Fed Balance Sheet Total Assets', 'Federal Reserve Total Assets', 'FRED', 'WALCL', 1, 1),
('WTREGEN', 'Treasury General Account', 'Treasury General Account balance at Federal Reserve', 'FRED', 'WTREGEN', 1, 1),
('RRPONTSYD', 'Overnight Reverse Repo', 'Overnight Reverse Repurchase Agreements', 'FRED', 'RRPONTSYD', 1, 1),
('BAMLH0A0HYM2', 'Credit Spreads', 'ICE BofA US High Yield Master II Option-Adjusted Spread', 'FRED', 'BAMLH0A0HYM2', 2, 1),
('MANEMP', 'ISM PMI', 'ISM Manufacturing: PMI Composite Index', 'FRED', 'MANEMP', 2, 2),
('DGS10', '10-Year Treasury Rate', '10-Year Treasury Constant Maturity Rate', 'FRED', 'DGS10', 2, 1),
('UNRATE', 'Unemployment Rate', 'Civilian Unemployment Rate', 'FRED', 'UNRATE', 2, 2);

-- Insert crypto indicators (will be populated by APIs)
INSERT INTO public.indicators (symbol, name, description, data_source, pillar, priority) VALUES
('BTC_PRICE', 'Bitcoin Price', 'Bitcoin USD Price', 'GLASSNODE', 3, 1),
('BTC_HASHRATE', 'Bitcoin Hashrate', 'Bitcoin Network Hashrate', 'GLASSNODE', 3, 2),
('BTC_MVRV_Z', 'Bitcoin MVRV Z-Score', 'Bitcoin Market Value to Realized Value Z-Score', 'GLASSNODE', 3, 1),
('BTC_PUELL', 'Puell Multiple', 'Bitcoin Puell Multiple', 'GLASSNODE', 3, 2),
('BTC_ASOPR', 'Adjusted SOPR', 'Bitcoin Adjusted Spent Output Profit Ratio', 'GLASSNODE', 3, 2);