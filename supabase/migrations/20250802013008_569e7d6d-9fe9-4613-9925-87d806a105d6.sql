-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable the pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a daily cron job to generate reports at 6 AM EST (11 AM UTC)
SELECT cron.schedule(
  'daily-macro-report-generation',
  '0 11 * * *', -- 11 AM UTC = 6 AM EST
  $$
  SELECT
    net.http_post(
        url:='https://gotlitraitdvltnjdnni.supabase.co/functions/v1/daily-report-generator',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdGxpdHJhaXRkdmx0bmpkbm5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2ODc2NDksImV4cCI6MjA2OTI2MzY0OX0._6eCm4Vj0oRUThRPDekpHmd5Dq9DlqNvRlPkQ-czWlQ"}'::jsonb,
        body:='{"trigger": "automated_daily_generation", "time": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);

-- Optional: Create a second backup generation at 12 PM EST (5 PM UTC) if morning one fails
SELECT cron.schedule(
  'daily-macro-report-backup',
  '0 17 * * *', -- 5 PM UTC = 12 PM EST
  $$
  SELECT
    net.http_post(
        url:='https://gotlitraitdvltnjdnni.supabase.co/functions/v1/daily-report-generator',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdGxpdHJhaXRkdmx0bmpkbm5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2ODc2NDksImV4cCI6MjA2OTI2MzY0OX0._6eCm4Vj0oRUThRPDekpHmd5Dq9DlqNvRlPkQ-czWlQ"}'::jsonb,
        body:='{"trigger": "backup_generation", "time": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);

-- Create a function to check and display active cron jobs
CREATE OR REPLACE FUNCTION get_active_cron_jobs()
RETURNS TABLE(jobname text, schedule text, command text) 
LANGUAGE SQL
AS $$
  SELECT jobname, schedule, command FROM cron.job WHERE active = true;
$$;