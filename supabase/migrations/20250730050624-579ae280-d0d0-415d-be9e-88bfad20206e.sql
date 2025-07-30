-- Check current distinct categories to understand valid values
SELECT DISTINCT category FROM indicators WHERE category IS NOT NULL ORDER BY category;

-- Also check subcategories
SELECT DISTINCT subcategory FROM indicators WHERE subcategory IS NOT NULL ORDER BY subcategory;