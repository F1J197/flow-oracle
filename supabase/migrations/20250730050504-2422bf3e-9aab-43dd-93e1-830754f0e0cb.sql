-- First create unique constraint on symbol and data_source if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'indicators_symbol_data_source_key') THEN
        ALTER TABLE indicators ADD CONSTRAINT indicators_symbol_data_source_key UNIQUE (symbol, data_source);
    END IF;
END $$;

-- Add missing indicators with proper symbol mappings  
INSERT INTO indicators (symbol, name, description, data_source, category, subcategory, is_active, priority, pillar)
VALUES 
  -- Core Fed Data (using internal symbols that map to FRED)
  ('fed-balance-sheet', 'Fed Balance Sheet', 'Federal Reserve Total Assets', 'FRED', 'monetary', 'central_bank', true, 1, 1),
  ('treasury-account', 'Treasury General Account', 'US Treasury General Account Balance', 'FRED', 'monetary', 'treasury', true, 1, 1),
  ('reverse-repo', 'Reverse Repo Operations', 'Overnight Reverse Repo Operations', 'FRED', 'monetary', 'money_market', true, 1, 1),
  ('net-liquidity', 'Net Liquidity', 'Calculated Net Liquidity Metric', 'FRED', 'liquidity', 'calculated', true, 1, 1),
  
  -- Credit Markets
  ('high-yield-spread', 'High Yield Spread', 'ICE BofA US High Yield Credit Spread', 'FRED', 'credit', 'spreads', true, 1, 2),
  ('investment-grade-spread', 'Investment Grade Spread', 'ICE BofA US Investment Grade Credit Spread', 'FRED', 'credit', 'spreads', true, 1, 2),
  ('credit-stress-score', 'Credit Stress Score', 'Calculated Credit Stress Indicator', 'FRED', 'credit', 'calculated', true, 1, 2),
  
  -- Market Data
  ('vix', 'VIX Volatility Index', 'CBOE Volatility Index', 'FRED', 'market', 'volatility', true, 1, 3),
  ('spx', 'S&P 500 Index', 'S&P 500 Stock Index', 'FRED', 'market', 'equity', true, 1, 3),
  
  -- Crypto Data (alternative sources)
  ('btc-price', 'Bitcoin Price', 'Bitcoin Price in USD', 'ALTERNATIVE', 'crypto', 'price', true, 1, 3),
  ('btc-market-cap', 'Bitcoin Market Cap', 'Bitcoin Market Capitalization', 'ALTERNATIVE', 'crypto', 'market_cap', true, 1, 3)

ON CONFLICT (symbol, data_source) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  is_active = EXCLUDED.is_active,
  priority = EXCLUDED.priority,
  pillar = EXCLUDED.pillar,
  updated_at = now();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_indicators_symbol_source ON indicators(symbol, data_source);
CREATE INDEX IF NOT EXISTS idx_indicators_active_priority ON indicators(is_active, priority);