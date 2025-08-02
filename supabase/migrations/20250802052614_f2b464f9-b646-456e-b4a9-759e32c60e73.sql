-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create cron job for data orchestration (every 5 minutes)
SELECT cron.schedule(
  'data-orchestration',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://gotlitraitdvltnjdnni.supabase.co/functions/v1/data-orchestrator',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdGxpdHJhaXRkdmx0bmpkbm5pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY4NzY0OSwiZXhwIjoyMDY5MjYzNjQ5fQ.wcsKcovBxhMVjqzaXLBPPeNkGSxn2YrR_AjhCuihKV4"}'::jsonb,
    body := '{"action": "ingest"}'::jsonb
  );
  $$
);

-- Create cron job for engine orchestration (every 10 minutes)
SELECT cron.schedule(
  'engine-orchestration', 
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://gotlitraitdvltnjdnni.supabase.co/functions/v1/engine-orchestrator',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdGxpdHJhaXRkdmx0bmpkbm5pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY4NzY0OSwiZXhwIjoyMDY5MjYzNjQ5fQ.wcsKcovBxhMVjqzaXLBPPeNkGSxn2YrR_AjhCuihKV4"}'::jsonb,
    body := '{"action": "orchestrate"}'::jsonb
  );
  $$
);

-- Create cron job for daily intelligence report generation (every hour)
SELECT cron.schedule(
  'daily-intelligence-reports',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://gotlitraitdvltnjdnni.supabase.co/functions/v1/daily-report-generator',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdGxpdHJhaXRkdmx0bmpkbm5pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY4NzY0OSwiZXhwIjoyMDY5MjYzNjQ5fQ.wcsKcovBxhMVjqzaXLBPPeNkGSxn2YrR_AjhCuihKV4"}'::jsonb,
    body := '{"requestType": "daily_report"}'::jsonb
  );
  $$
);

-- Add indexes for better performance on time-based queries (without CONCURRENTLY)
CREATE INDEX IF NOT EXISTS idx_market_indicators_timestamp 
ON market_indicators (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_engine_outputs_calculated_at 
ON engine_outputs (calculated_at DESC);

CREATE INDEX IF NOT EXISTS idx_master_signals_created_at 
ON master_signals (created_at DESC);

-- Create a view for latest engine outputs
CREATE OR REPLACE VIEW latest_engine_outputs AS
SELECT DISTINCT ON (engine_id) 
  engine_id,
  primary_value,
  confidence,
  signal,
  sub_metrics,
  analysis,
  calculated_at,
  pillar
FROM engine_outputs 
ORDER BY engine_id, calculated_at DESC;