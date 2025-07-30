-- Add missing indicators with proper symbol mappings using valid categories
INSERT INTO indicators (symbol, name, description, data_source, category, subcategory, is_active, priority, pillar)
VALUES 
  -- Core Fed Data (using internal symbols that map to FRED)
  ('fed-balance-sheet', 'Fed Balance Sheet', 'Federal Reserve Total Assets', 'FRED', 'market', 'fed_balance_sheet', true, 1, 1),
  ('treasury-account', 'Treasury General Account', 'US Treasury General Account Balance', 'FRED', 'market', 'treasury_general', true, 1, 1),
  ('reverse-repo', 'Reverse Repo Operations', 'Overnight Reverse Repo Operations', 'FRED', 'market', 'reverse_repo', true, 1, 1),
  ('net-liquidity', 'Net Liquidity', 'Calculated Net Liquidity Metric', 'FRED', 'market', 'general', true, 1, 1),
  
  -- Credit Markets
  ('high-yield-spread', 'High Yield Spread', 'ICE BofA US High Yield Credit Spread', 'FRED', 'market', 'credit_spreads', true, 1, 2),
  ('investment-grade-spread', 'Investment Grade Spread', 'ICE BofA US Investment Grade Credit Spread', 'FRED', 'market', 'credit_spreads', true, 1, 2),
  ('credit-stress-score', 'Credit Stress Score', 'Calculated Credit Stress Indicator', 'FRED', 'market', 'credit_spreads', true, 1, 2),
  
  -- Market Data
  ('vix', 'VIX Volatility Index', 'CBOE Volatility Index', 'FRED', 'market', 'general', true, 1, 3),
  ('spx', 'S&P 500 Index', 'S&P 500 Stock Index', 'FRED', 'market', 'general', true, 1, 3),
  
  -- Crypto Data (alternative sources)
  ('btc-price', 'Bitcoin Price', 'Bitcoin Price in USD', 'ALTERNATIVE', 'market', 'on_chain', true, 1, 3),
  ('btc-market-cap', 'Bitcoin Market Cap', 'Bitcoin Market Capitalization', 'ALTERNATIVE', 'market', 'on_chain', true, 1, 3)

ON CONFLICT (symbol, data_source) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  is_active = EXCLUDED.is_active,
  priority = EXCLUDED.priority,
  pillar = EXCLUDED.pillar,
  updated_at = now();

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