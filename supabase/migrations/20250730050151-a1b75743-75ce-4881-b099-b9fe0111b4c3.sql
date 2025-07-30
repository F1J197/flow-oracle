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

-- Update existing indicators that might have wrong symbols
UPDATE indicators 
SET 
  symbol = CASE 
    WHEN symbol = 'WALCL' AND data_source = 'FRED' THEN 'fed-balance-sheet'
    WHEN symbol = 'WTREGEN' AND data_source = 'FRED' THEN 'treasury-account'
    WHEN symbol = 'RRPONTSYD' AND data_source = 'FRED' THEN 'reverse-repo'
    WHEN symbol = 'BAMLH0A0HYM2' AND data_source = 'FRED' THEN 'high-yield-spread'
    WHEN symbol = 'BAMLC0A0CM' AND data_source = 'FRED' THEN 'investment-grade-spread'
    WHEN symbol = 'VIXCLS' AND data_source = 'FRED' THEN 'vix'
    WHEN symbol = 'SP500' AND data_source = 'FRED' THEN 'spx'
    ELSE symbol
  END,
  updated_at = now()
WHERE data_source = 'FRED' 
  AND symbol IN ('WALCL', 'WTREGEN', 'RRPONTSYD', 'BAMLH0A0HYM2', 'BAMLC0A0CM', 'VIXCLS', 'SP500');

-- Create index for better performance on symbol lookups
CREATE INDEX IF NOT EXISTS idx_indicators_symbol_source ON indicators(symbol, data_source);
CREATE INDEX IF NOT EXISTS idx_indicators_active_priority ON indicators(is_active, priority);

-- Add metadata for enhanced tracking
UPDATE indicators 
SET metadata = jsonb_build_object(
  'fred_series_id', CASE 
    WHEN symbol = 'fed-balance-sheet' THEN 'WALCL'
    WHEN symbol = 'treasury-account' THEN 'WTREGEN'
    WHEN symbol = 'reverse-repo' THEN 'RRPONTSYD'
    WHEN symbol = 'high-yield-spread' THEN 'BAMLH0A0HYM2'
    WHEN symbol = 'investment-grade-spread' THEN 'BAMLC0A0CM'
    WHEN symbol = 'vix' THEN 'VIXCLS'
    WHEN symbol = 'spx' THEN 'SP500'
    ELSE symbol
  END,
  'update_frequency', 'daily',
  'source_reliability', 'high',
  'alternative_sources', CASE 
    WHEN symbol IN ('btc-price', 'btc-market-cap') THEN '["coingecko", "binance", "coindesk"]'::jsonb
    WHEN symbol = 'spx' THEN '["alpha-vantage", "yahoo-finance"]'::jsonb
    WHEN symbol = 'vix' THEN '["alpha-vantage", "yahoo-finance"]'::jsonb
    ELSE '[]'::jsonb
  END
)
WHERE symbol IN ('fed-balance-sheet', 'treasury-account', 'reverse-repo', 'high-yield-spread', 
                 'investment-grade-spread', 'vix', 'spx', 'btc-price', 'btc-market-cap', 'net-liquidity', 'credit-stress-score');