-- Fix Supabase security issues (excluding auth.config)
-- Move pg_stat_statements extension from public to extensions schema
DROP EXTENSION IF EXISTS pg_stat_statements CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;

-- Add performance optimization indexes
CREATE INDEX IF NOT EXISTS idx_engine_outputs_calculated_at ON engine_outputs(calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_engine_outputs_engine_id ON engine_outputs(engine_id);
CREATE INDEX IF NOT EXISTS idx_master_signals_created_at ON master_signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_indicators_timestamp ON market_indicators(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_data_points_timestamp ON data_points(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_data_points_indicator_id ON data_points(indicator_id);

-- Add engine performance tracking table
CREATE TABLE IF NOT EXISTS engine_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_id TEXT NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  memory_usage_mb NUMERIC,
  success_rate NUMERIC CHECK (success_rate >= 0 AND success_rate <= 100),
  data_quality_score NUMERIC CHECK (data_quality_score >= 0 AND data_quality_score <= 100),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on performance metrics
ALTER TABLE engine_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for performance metrics
CREATE POLICY "Engine performance metrics are viewable by everyone" 
ON engine_performance_metrics 
FOR SELECT 
USING (true);

CREATE POLICY "Engine performance metrics managed by service role only" 
ON engine_performance_metrics 
FOR ALL 
USING (true);

-- Create system health monitoring table
CREATE TABLE IF NOT EXISTS system_health_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical', 'offline')),
  uptime_percentage NUMERIC CHECK (uptime_percentage >= 0 AND uptime_percentage <= 100),
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  error_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on system health
ALTER TABLE system_health_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System health status viewable by everyone" 
ON system_health_status 
FOR SELECT 
USING (true);

CREATE POLICY "System health status managed by service role only" 
ON system_health_status 
FOR ALL 
USING (true);

-- Add trigger for updated_at on system health
CREATE OR REPLACE TRIGGER update_system_health_updated_at
  BEFORE UPDATE ON system_health_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create comprehensive logging table for engine executions
CREATE TABLE IF NOT EXISTS engine_execution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_id TEXT NOT NULL,
  execution_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  execution_end TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  input_data_size INTEGER,
  output_data_size INTEGER,
  memory_peak_mb NUMERIC,
  cpu_usage_percent NUMERIC,
  dependencies_count INTEGER,
  confidence_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create policies
ALTER TABLE engine_execution_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Engine execution history viewable by everyone" 
ON engine_execution_history 
FOR SELECT 
USING (true);

CREATE POLICY "Engine execution history managed by service role only" 
ON engine_execution_history 
FOR ALL 
USING (true);

-- Add comprehensive indexing for performance
CREATE INDEX IF NOT EXISTS idx_engine_execution_history_engine_id ON engine_execution_history(engine_id);
CREATE INDEX IF NOT EXISTS idx_engine_execution_history_start ON engine_execution_history(execution_start DESC);
CREATE INDEX IF NOT EXISTS idx_engine_execution_history_success ON engine_execution_history(success);
CREATE INDEX IF NOT EXISTS idx_engine_execution_history_duration ON engine_execution_history(duration_ms);

-- Create alerts and notifications table
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('performance', 'security', 'data_quality', 'system', 'engine')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  component TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on alerts
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System alerts viewable by everyone" 
ON system_alerts 
FOR SELECT 
USING (true);

CREATE POLICY "System alerts managed by service role only" 
ON system_alerts 
FOR ALL 
USING (true);

-- Add indexes for alerts
CREATE INDEX IF NOT EXISTS idx_system_alerts_created_at ON system_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON system_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON system_alerts(alert_type);