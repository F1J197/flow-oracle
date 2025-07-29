-- Housekeeping Migration: Data Integrity and Performance Improvements
-- Add missing indexes and constraints for better performance and reliability

-- Add performance indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_data_points_indicator_timestamp 
ON data_points(indicator_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_data_points_timestamp 
ON data_points(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_ingestion_logs_indicator_status 
ON ingestion_logs(indicator_id, status);

-- Add data integrity constraints
ALTER TABLE data_points 
ADD CONSTRAINT IF NOT EXISTS chk_confidence_score_range 
CHECK (confidence_score >= 0 AND confidence_score <= 1);

-- Create table for engine execution logs
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

-- Add index for health metrics
CREATE INDEX IF NOT EXISTS idx_health_metrics_component_timestamp 
ON system_health_metrics(component, timestamp DESC);

-- Update existing tables to handle fallback scenarios
ALTER TABLE indicators 
ADD COLUMN IF NOT EXISTS fallback_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS fallback_value DECIMAL,
ADD COLUMN IF NOT EXISTS health_check_endpoint TEXT;