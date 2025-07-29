-- Fix Critical Database Issues for Production
-- Address RLS blocking and create proper policies for service operations

-- First drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Allow service role to manage ingestion_logs" ON ingestion_logs;
DROP POLICY IF EXISTS "Allow service role to manage data_points" ON data_points;
DROP POLICY IF EXISTS "Allow service role to manage engine_executions" ON engine_executions;
DROP POLICY IF EXISTS "Allow service role to manage indicators" ON indicators;

-- Create service role policies for edge functions
CREATE POLICY "Allow service role to manage ingestion_logs" 
ON ingestion_logs FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow service role to manage data_points" 
ON data_points FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow service role to manage engine_executions" 
ON engine_executions FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow service role to manage indicators" 
ON indicators FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_data_points_indicator_timestamp 
ON data_points(indicator_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_data_points_timestamp 
ON data_points(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_ingestion_logs_indicator_status 
ON ingestion_logs(indicator_id, status);

-- Create enhanced engine execution logs table
CREATE TABLE IF NOT EXISTS engine_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_id TEXT NOT NULL,
  execution_time_ms INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  confidence_score DECIMAL(3,2),
  data_quality_score DECIMAL(3,2),
  fallback_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on engine execution logs
ALTER TABLE engine_execution_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for engine execution logs
CREATE POLICY "Allow public read access to engine_execution_logs" 
ON engine_execution_logs FOR SELECT 
USING (true);

CREATE POLICY "Allow service role to manage engine_execution_logs" 
ON engine_execution_logs FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Add index for engine logs
CREATE INDEX IF NOT EXISTS idx_engine_logs_engine_created 
ON engine_execution_logs(engine_id, created_at DESC);

-- Create system health monitoring table
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL,
  metric_unit TEXT,
  component TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on health metrics
ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for health metrics
CREATE POLICY "Allow public read access to system_health_metrics" 
ON system_health_metrics FOR SELECT 
USING (true);

CREATE POLICY "Allow service role to manage system_health_metrics" 
ON system_health_metrics FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Add index for health metrics
CREATE INDEX IF NOT EXISTS idx_health_metrics_component_timestamp 
ON system_health_metrics(component, timestamp DESC);

-- Update indicators table for fallback scenarios
ALTER TABLE indicators 
ADD COLUMN IF NOT EXISTS fallback_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS fallback_value DECIMAL,
ADD COLUMN IF NOT EXISTS health_check_endpoint TEXT;