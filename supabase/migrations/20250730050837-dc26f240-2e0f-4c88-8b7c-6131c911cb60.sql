-- Fix the function search path security issue
-- Set search_path for the update_updated_at_column function
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- The Auth OTP expiry warning is a configuration issue that needs to be addressed in the Supabase dashboard
-- This is not a SQL-fixable issue as it's an authentication configuration setting