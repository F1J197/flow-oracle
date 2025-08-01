-- Fix security warnings: Set search_path for functions

-- Update update_updated_at_column function with search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- Update cleanup_old_market_data function with search_path
CREATE OR REPLACE FUNCTION public.cleanup_old_market_data()
RETURNS void AS $$
BEGIN
    DELETE FROM public.market_indicators 
    WHERE timestamp < NOW() - INTERVAL '30 days';
    
    DELETE FROM public.engine_outputs 
    WHERE calculated_at < NOW() - INTERVAL '7 days';
    
    DELETE FROM public.master_signals 
    WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';