-- Phase 1: Database Schema Alignment
-- Add missing category and subcategory columns to indicators table

ALTER TABLE public.indicators 
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'market',
ADD COLUMN IF NOT EXISTS subcategory TEXT NOT NULL DEFAULT 'general';

-- Update existing records to have proper category/subcategory values
UPDATE public.indicators 
SET 
  category = CASE 
    WHEN data_source = 'FRED' THEN 'market'
    WHEN data_source = 'COINBASE' THEN 'crypto'
    WHEN data_source = 'GLASSNODE' THEN 'crypto'
    ELSE 'market'
  END,
  subcategory = CASE 
    WHEN symbol LIKE '%yield%' OR symbol LIKE '%spread%' THEN 'credit'
    WHEN symbol LIKE '%liquidity%' OR symbol LIKE '%balance%' THEN 'liquidity'
    WHEN symbol LIKE '%btc%' OR symbol LIKE '%crypto%' THEN 'bitcoin'
    WHEN symbol LIKE '%vix%' THEN 'volatility'
    ELSE 'general'
  END
WHERE category IS NULL OR subcategory IS NULL;