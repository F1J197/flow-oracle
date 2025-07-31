-- Create market_data_cache table for caching financial data
CREATE TABLE public.market_data_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  value NUMERIC NOT NULL,
  previous_value NUMERIC,
  change NUMERIC,
  change_percent NUMERIC,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  provider TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.market_data_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to market_data_cache" 
ON public.market_data_cache 
FOR SELECT 
USING (true);

-- Create policy for service role to manage data
CREATE POLICY "Allow service role to manage market_data_cache" 
ON public.market_data_cache 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create index for efficient lookups
CREATE INDEX idx_market_data_cache_symbol ON public.market_data_cache(symbol);
CREATE INDEX idx_market_data_cache_timestamp ON public.market_data_cache(timestamp DESC);
CREATE INDEX idx_market_data_cache_provider ON public.market_data_cache(provider);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_market_data_cache_updated_at
BEFORE UPDATE ON public.market_data_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();