-- Phase 1: Critical Database Security Fixes
-- Fix 1: Enable RLS on all tables with policies but RLS disabled

-- Enable RLS on engine_executions
ALTER TABLE public.engine_executions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on engine_outputs  
ALTER TABLE public.engine_outputs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on master_signals
ALTER TABLE public.master_signals ENABLE ROW LEVEL SECURITY;

-- Enable RLS on system_health_metrics
ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;

-- Enable RLS on market_data_cache
ALTER TABLE public.market_data_cache ENABLE ROW LEVEL SECURITY;

-- Enable RLS on data_points
ALTER TABLE public.data_points ENABLE ROW LEVEL SECURITY;

-- Enable RLS on indicator_data
ALTER TABLE public.indicator_data ENABLE ROW LEVEL SECURITY;

-- Enable RLS on indicators
ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;

-- Enable RLS on ingestion_logs
ALTER TABLE public.ingestion_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on market_indicators
ALTER TABLE public.market_indicators ENABLE ROW LEVEL SECURITY;

-- Enable RLS on engine_performance_metrics
ALTER TABLE public.engine_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Enable RLS on report_cache
ALTER TABLE public.report_cache ENABLE ROW LEVEL SECURITY;

-- Enable RLS on system_health_status
ALTER TABLE public.system_health_status ENABLE ROW LEVEL SECURITY;

-- Enable RLS on performance_metrics
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Enable RLS on engine_execution_history
ALTER TABLE public.engine_execution_history ENABLE ROW LEVEL SECURITY;

-- Enable RLS on system_alerts
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on engine_execution_logs
ALTER TABLE public.engine_execution_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on daily_reports
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

-- Fix 2: Drop and recreate the security definer view with proper security
DROP VIEW IF EXISTS public.latest_engine_outputs;

-- Create a secure view without SECURITY DEFINER
CREATE VIEW public.latest_engine_outputs AS
SELECT DISTINCT ON (engine_id)
    engine_id,
    primary_value,
    signal,
    confidence,
    pillar,
    calculated_at,
    analysis,
    sub_metrics
FROM public.engine_outputs
ORDER BY engine_id, calculated_at DESC;

-- Enable RLS on the view (this will use invoker's permissions)
ALTER VIEW public.latest_engine_outputs SET (security_invoker = on);

-- Fix 3: Make user_id column non-nullable in alert_history and user_preferences where RLS depends on it
-- This ensures RLS policies can't be bypassed with NULL user_id values

-- Update any existing NULL user_id records in alert_history (set to a system user ID or remove)
DELETE FROM public.alert_history WHERE user_id IS NULL;

-- Make user_id non-nullable in alert_history
ALTER TABLE public.alert_history ALTER COLUMN user_id SET NOT NULL;

-- Update any existing NULL user_id records in user_preferences (set to a system user ID or remove)  
DELETE FROM public.user_preferences WHERE user_id IS NULL;

-- Make user_id non-nullable in user_preferences
ALTER TABLE public.user_preferences ALTER COLUMN user_id SET NOT NULL;