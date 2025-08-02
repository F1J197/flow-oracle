-- Fix RLS policies for engine system tables
-- These are system functions that need to operate without user authentication

-- Disable RLS on engine_executions to allow system functions to write
ALTER TABLE public.engine_executions DISABLE ROW LEVEL SECURITY;

-- Disable RLS on master_signals to allow system functions to write  
ALTER TABLE public.master_signals DISABLE ROW LEVEL SECURITY;

-- Disable RLS on system_health_metrics to allow system functions to write
ALTER TABLE public.system_health_metrics DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on engine_outputs to allow system functions to write
ALTER TABLE public.engine_outputs DISABLE ROW LEVEL SECURITY;

-- Update engine-execution function to also write to engine_outputs for compatibility
-- This will be handled in the code update