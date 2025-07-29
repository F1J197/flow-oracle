-- Fix Critical Database Issues for Production
-- Address RLS blocking and create proper policies for service operations

-- Fix RLS policies that are blocking edge functions
-- Edge functions need service role access to insert data

-- Allow service role to manage ingestion_logs
CREATE POLICY IF NOT EXISTS "Allow service role to manage ingestion_logs" 
ON ingestion_logs FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Allow service role to manage data_points  
CREATE POLICY IF NOT EXISTS "Allow service role to manage data_points" 
ON data_points FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Allow service role to manage engine_executions
CREATE POLICY IF NOT EXISTS "Allow service role to manage engine_executions" 
ON engine_executions FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Allow service role to manage indicators
CREATE POLICY IF NOT EXISTS "Allow service role to manage indicators" 
ON indicators FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Add performance indexes (without CONCURRENTLY to avoid transaction issues)
CREATE INDEX IF NOT EXISTS idx_data_points_indicator_timestamp 
ON data_points(indicator_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_data_points_timestamp 
ON data_points(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_ingestion_logs_indicator_status 
ON ingestion_logs(indicator_id, status);

-- Create table for enhanced engine execution logs
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

-- Enable RLS on new table
ALTER TABLE engine_execution_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to engine logs
CREATE POLICY IF NOT EXISTS "Allow public read access to engine_execution_logs" 
ON engine_execution_logs FOR SELECT 
USING (true);

-- Allow service role to manage engine execution logs
CREATE POLICY IF NOT EXISTS "Allow service role to manage engine_execution_logs" 
ON engine_execution_logs FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Add index for engine logs
CREATE INDEX IF NOT EXISTS idx_engine_logs_engine_created 
ON engine_execution_logs(engine_id, created_at DESC);

-- Create table for system health monitoring
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL,
  metric_unit TEXT,
  component TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on health metrics table
ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;

-- Allow public read access to health metrics
CREATE POLICY IF NOT EXISTS "Allow public read access to system_health_metrics" 
ON system_health_metrics FOR SELECT 
USING (true);

-- Allow service role to manage health metrics
CREATE POLICY IF NOT EXISTS "Allow service role to manage system_health_metrics" 
ON system_health_metrics FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Add index for health metrics
CREATE INDEX IF NOT EXISTS idx_health_metrics_component_timestamp 
ON system_health_metrics(component, timestamp DESC);

-- Update existing tables to handle fallback scenarios
ALTER TABLE indicators 
ADD COLUMN IF NOT EXISTS fallback_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS fallback_value DECIMAL,
ADD COLUMN IF NOT EXISTS health_check_endpoint TEXT;