-- Check current check constraints and valid categories
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE table_name = 'indicators';

-- See current distinct categories to understand valid values
SELECT DISTINCT category FROM indicators ORDER BY category;