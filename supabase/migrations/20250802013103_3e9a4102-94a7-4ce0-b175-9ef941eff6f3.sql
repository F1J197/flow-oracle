-- Fix function search path security issue
DROP FUNCTION IF EXISTS get_active_cron_jobs();

CREATE OR REPLACE FUNCTION get_active_cron_jobs()
RETURNS TABLE(jobname text, schedule text, command text) 
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jobname, schedule, command FROM cron.job WHERE active = true;
$$;

-- Move pg_cron extension to extensions schema (if possible)
-- Note: pg_cron typically needs to be in shared_preload_libraries and may need to stay in public
-- This is a warning we acknowledge for cron functionality

-- The OTP expiry warning is a system-level configuration that doesn't affect our migration