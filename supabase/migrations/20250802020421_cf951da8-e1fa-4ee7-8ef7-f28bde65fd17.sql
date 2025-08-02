-- Add caching mechanism for daily reports
-- Add index for performance on report queries
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_reports_created_at ON daily_reports(created_at DESC);

-- Add report cache table for 12-hour caching
CREATE TABLE IF NOT EXISTS public.report_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  report_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on report_cache
ALTER TABLE public.report_cache ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to report cache
CREATE POLICY "Report cache is viewable by everyone" 
ON public.report_cache 
FOR SELECT 
USING (true);

-- Create policy for service role to manage cache
CREATE POLICY "Report cache managed by service role only" 
ON public.report_cache 
FOR ALL 
USING (true);

-- Add automatic cleanup function for expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    DELETE FROM public.report_cache 
    WHERE expires_at < NOW();
END;
$function$;