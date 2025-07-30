-- Phase 1: Database Schema Alignment
-- Add missing category and subcategory columns to indicators table

ALTER TABLE public.indicators 
ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'market',
ADD COLUMN IF NOT EXISTS subcategory text NOT NULL DEFAULT 'general';

-- Update existing records with appropriate categories based on their data source and symbol
UPDATE public.indicators 
SET 
  category = CASE 
    WHEN data_source = 'FRED' AND symbol IN ('WALCL', 'WTREGEN', 'RRPONTSYD') THEN 'liquidity'
    WHEN data_source = 'FRED' AND symbol IN ('DGS10', 'BAMLH0A0HYM2') THEN 'rates'
    WHEN data_source = 'GLASSNODE' THEN 'crypto'
    WHEN data_source = 'COINBASE' THEN 'crypto'
    WHEN data_source = 'BINANCE' THEN 'crypto'
    ELSE 'market'
  END,
  subcategory = CASE 
    WHEN data_source = 'FRED' AND symbol = 'WALCL' THEN 'fed_balance_sheet'
    WHEN data_source = 'FRED' AND symbol = 'WTREGEN' THEN 'treasury_general'
    WHEN data_source = 'FRED' AND symbol = 'RRPONTSYD' THEN 'reverse_repo'
    WHEN data_source = 'FRED' AND symbol = 'DGS10' THEN 'treasury_yields'
    WHEN data_source = 'FRED' AND symbol = 'BAMLH0A0HYM2' THEN 'credit_spreads'
    WHEN data_source = 'GLASSNODE' THEN 'on_chain'
    WHEN data_source = 'COINBASE' THEN 'spot_price'
    WHEN data_source = 'BINANCE' THEN 'spot_price'
    ELSE 'general'
  END
WHERE category = 'market' AND subcategory = 'general';

-- Create an index on category and subcategory for better query performance
CREATE INDEX IF NOT EXISTS idx_indicators_category_subcategory 
ON public.indicators (category, subcategory);

-- Add constraint to ensure valid categories
ALTER TABLE public.indicators 
ADD CONSTRAINT check_valid_category 
CHECK (category IN ('market', 'liquidity', 'rates', 'crypto', 'macro', 'sentiment'));

-- Add constraint to ensure valid subcategories
ALTER TABLE public.indicators 
ADD CONSTRAINT check_valid_subcategory 
CHECK (subcategory IN ('general', 'fed_balance_sheet', 'treasury_general', 'reverse_repo', 
                      'treasury_yields', 'credit_spreads', 'on_chain', 'spot_price', 
                      'futures', 'options', 'volatility', 'momentum'));