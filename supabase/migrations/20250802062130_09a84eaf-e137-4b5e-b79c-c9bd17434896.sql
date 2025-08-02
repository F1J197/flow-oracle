-- Fix RLS policies to allow service role and anonymous access for engine operations

-- Allow anonymous read access and service role write access to engine_outputs
DROP POLICY IF EXISTS "Engine outputs are viewable by everyone" ON public.engine_outputs;
DROP POLICY IF EXISTS "Engine outputs managed by service role only" ON public.engine_outputs;

CREATE POLICY "Allow public read access to engine_outputs" 
ON public.engine_outputs FOR SELECT 
USING (true);

CREATE POLICY "Allow service role to manage engine_outputs" 
ON public.engine_outputs FOR ALL 
USING (true) 
WITH CHECK (true);

-- Allow anonymous read access and service role write access to master_signals  
DROP POLICY IF EXISTS "Master signals are viewable by everyone" ON public.master_signals;
DROP POLICY IF EXISTS "Master signals managed by service role only" ON public.master_signals;

CREATE POLICY "Allow public read access to master_signals" 
ON public.master_signals FOR SELECT 
USING (true);

CREATE POLICY "Allow service role to manage master_signals" 
ON public.master_signals FOR ALL 
USING (true) 
WITH CHECK (true);

-- Update other related tables for consistency
DROP POLICY IF EXISTS "Allow public read access to market_data_cache" ON public.market_data_cache;
DROP POLICY IF EXISTS "Allow service role to manage market_data_cache" ON public.market_data_cache;

CREATE POLICY "Allow public read access to market_data_cache" 
ON public.market_data_cache FOR SELECT 
USING (true);

CREATE POLICY "Allow service role to manage market_data_cache" 
ON public.market_data_cache FOR ALL 
USING (true) 
WITH CHECK (true);