-- Add missing indicators with proper symbol mappings using valid categories
-- First, delete any existing conflicting rows to avoid conflicts
DELETE FROM indicators WHERE symbol IN ('fed-balance-sheet', 'treasury-account', 'reverse-repo', 'high-yield-spread', 
                                        'investment-grade-spread', 'vix', 'spx', 'btc-price', 'btc-market-cap', 'net-liquidity', 'credit-stress-score');

INSERT INTO indicators (symbol, name, description, data_source, category, subcategory, is_active, priority, pillar, metadata)
VALUES 
  -- Core Fed Data (using internal symbols that map to FRED)
  ('fed-balance-sheet', 'Fed Balance Sheet', 'Federal Reserve Total Assets', 'FRED', 'market', 'fed_balance_sheet', true, 1, 1, '{"fred_series_id": "WALCL", "update_frequency": "daily", "source_reliability": "high"}'),
  ('treasury-account', 'Treasury General Account', 'US Treasury General Account Balance', 'FRED', 'market', 'treasury_general', true, 1, 1, '{"fred_series_id": "WTREGEN", "update_frequency": "daily", "source_reliability": "high"}'),
  ('reverse-repo', 'Reverse Repo Operations', 'Overnight Reverse Repo Operations', 'FRED', 'market', 'reverse_repo', true, 1, 1, '{"fred_series_id": "RRPONTSYD", "update_frequency": "daily", "source_reliability": "high"}'),
  ('net-liquidity', 'Net Liquidity', 'Calculated Net Liquidity Metric', 'FRED', 'market', 'general', true, 1, 1, '{"fred_series_id": "WALCL", "update_frequency": "daily", "source_reliability": "high"}'),
  
  -- Credit Markets
  ('high-yield-spread', 'High Yield Spread', 'ICE BofA US High Yield Credit Spread', 'FRED', 'market', 'credit_spreads', true, 1, 2, '{"fred_series_id": "BAMLH0A0HYM2", "update_frequency": "daily", "source_reliability": "high"}'),
  ('investment-grade-spread', 'Investment Grade Spread', 'ICE BofA US Investment Grade Credit Spread', 'FRED', 'market', 'credit_spreads', true, 1, 2, '{"fred_series_id": "BAMLC0A0CM", "update_frequency": "daily", "source_reliability": "high"}'),
  ('credit-stress-score', 'Credit Stress Score', 'Calculated Credit Stress Indicator', 'FRED', 'market', 'credit_spreads', true, 1, 2, '{"fred_series_id": "BAMLH0A0HYM2", "update_frequency": "daily", "source_reliability": "high"}'),
  
  -- Market Data
  ('vix', 'VIX Volatility Index', 'CBOE Volatility Index', 'FRED', 'market', 'general', true, 1, 3, '{"fred_series_id": "VIXCLS", "update_frequency": "daily", "source_reliability": "high", "alternative_sources": ["alpha-vantage", "yahoo-finance"]}'),
  ('spx', 'S&P 500 Index', 'S&P 500 Stock Index', 'FRED', 'market', 'general', true, 1, 3, '{"fred_series_id": "SP500", "update_frequency": "daily", "source_reliability": "high", "alternative_sources": ["alpha-vantage", "yahoo-finance"]}'),
  
  -- Crypto Data (alternative sources)
  ('btc-price', 'Bitcoin Price', 'Bitcoin Price in USD', 'ALTERNATIVE', 'market', 'on_chain', true, 1, 3, '{"update_frequency": "realtime", "source_reliability": "high", "alternative_sources": ["coingecko", "binance", "coindesk"]}'),
  ('btc-market-cap', 'Bitcoin Market Cap', 'Bitcoin Market Capitalization', 'ALTERNATIVE', 'market', 'on_chain', true, 1, 3, '{"update_frequency": "realtime", "source_reliability": "high", "alternative_sources": ["coingecko", "coindesk"]}');

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_indicators_symbol_source ON indicators(symbol, data_source);
CREATE INDEX IF NOT EXISTS idx_indicators_active_priority ON indicators(is_active, priority);