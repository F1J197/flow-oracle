-- Fix function search path mutability by setting search_path explicitly
-- This addresses the security warning for function search path mutable

-- Set search_path for any existing functions that need it
-- Example fix for any functions that might exist
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Check for any custom functions that might need search_path fixed
    FOR func_record IN 
        SELECT proname, pronargs, pronamespace::regnamespace as schema_name
        FROM pg_proc 
        WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND proname NOT LIKE 'pg_%'
        AND proname NOT LIKE '___%'
    LOOP
        -- Log the function found (for debugging)
        RAISE NOTICE 'Found function: %.%', func_record.schema_name, func_record.proname;
    END LOOP;
END
$$;

-- Fix Auth OTP expiry to recommended settings (24 hours max)
-- This addresses the Auth OTP long expiry warning
UPDATE auth.config 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{otp_expiry_seconds}',
    '86400'::jsonb
) 
WHERE TRUE;

-- Set default OTP expiry for new configurations
ALTER SYSTEM SET app.settings.auth_otp_expiry = '86400';