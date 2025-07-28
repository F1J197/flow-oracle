-- Insert sample indicators for the three pillars
INSERT INTO public.indicators (symbol, name, description, data_source, pillar, priority, is_active, api_endpoint, update_frequency, metadata) VALUES
('WALCL', 'Fed Balance Sheet', 'Federal Reserve Total Assets', 'FRED', 1, 1, true, 'https://api.stlouisfed.org/fred/series/observations', 'daily', '{"seriesId": "WALCL", "units": "Billions"}'),
('WTREGEN', 'Treasury General Account', 'Treasury General Account Balance', 'FRED', 1, 2, true, 'https://api.stlouisfed.org/fred/series/observations', 'daily', '{"seriesId": "WTREGEN", "units": "Billions"}'),
('RRPONTSYD', 'Reverse Repo', 'Overnight Reverse Repurchase Agreements', 'FRED', 1, 3, true, 'https://api.stlouisfed.org/fred/series/observations', 'daily', '{"seriesId": "RRPONTSYD", "units": "Billions"}'),
('BAMLH0A0HYM2', 'HY Credit Spread', 'ICE BofA US High Yield Index Option-Adjusted Spread', 'FRED', 2, 1, true, 'https://api.stlouisfed.org/fred/series/observations', 'daily', '{"seriesId": "BAMLH0A0HYM2", "units": "Percent"}'),
('DGS10', '10Y Treasury Yield', '10-Year Treasury Constant Maturity Rate', 'FRED', 2, 2, true, 'https://api.stlouisfed.org/fred/series/observations', 'daily', '{"seriesId": "DGS10", "units": "Percent"}'),
('DEXUSEU', 'USD/EUR Exchange Rate', 'US Dollar to Euro Exchange Rate', 'FRED', 3, 1, true, 'https://api.stlouisfed.org/fred/series/observations', 'daily', '{"seriesId": "DEXUSEU", "units": "Rate"}'),
('DTWEXAFEGS', 'DXY Index', 'Trade Weighted US Dollar Index: Advanced Foreign Economies', 'FRED', 3, 2, true, 'https://api.stlouisfed.org/fred/series/observations', 'daily', '{"seriesId": "DTWEXAFEGS", "units": "Index"}'),
('BTC-USD', 'Bitcoin Price', 'Bitcoin to USD Exchange Rate', 'coinbase', 3, 3, true, 'https://api.coinbase.com/v2/exchange-rates', 'realtime', '{"symbol": "BTC", "currency": "USD"}');

-- Insert sample data points for each indicator (last 30 days)
INSERT INTO public.data_points (indicator_id, value, timestamp, confidence_score, raw_data, source_hash) 
SELECT 
    i.id,
    CASE 
        WHEN i.symbol = 'WALCL' THEN 7200 + (random() * 200 - 100) -- ~$7.2T ± $100B
        WHEN i.symbol = 'WTREGEN' THEN 600 + (random() * 100 - 50) -- ~$600B ± $50B  
        WHEN i.symbol = 'RRPONTSYD' THEN 2200 + (random() * 200 - 100) -- ~$2.2T ± $100B
        WHEN i.symbol = 'BAMLH0A0HYM2' THEN 3.5 + (random() * 2 - 1) -- ~3.5% ± 1%
        WHEN i.symbol = 'DGS10' THEN 4.2 + (random() * 1 - 0.5) -- ~4.2% ± 0.5%
        WHEN i.symbol = 'DEXUSEU' THEN 0.92 + (random() * 0.1 - 0.05) -- ~0.92 ± 0.05
        WHEN i.symbol = 'DTWEXAFEGS' THEN 105 + (random() * 10 - 5) -- ~105 ± 5
        WHEN i.symbol = 'BTC-USD' THEN 45000 + (random() * 10000 - 5000) -- ~$45k ± $5k
        ELSE 100
    END as value,
    NOW() - (generate_series(0, 29) * INTERVAL '1 day') as timestamp,
    0.85 + (random() * 0.15) as confidence_score, -- 85-100% confidence
    jsonb_build_object(
        'source', i.data_source,
        'series', i.symbol,
        'quality', 'validated'
    ) as raw_data,
    md5(i.symbol || (NOW() - (generate_series(0, 29) * INTERVAL '1 day'))::text) as source_hash
FROM public.indicators i
CROSS JOIN generate_series(0, 29) gs
WHERE i.is_active = true;

-- Insert sample data validations
INSERT INTO public.data_validations (data_point_id, validation_value, validation_source, variance_pct, is_consensus, metadata)
SELECT 
    dp.id,
    dp.value * (0.98 + random() * 0.04), -- ±2% validation variance
    CASE 
        WHEN random() < 0.5 THEN 'consensus_validator'
        ELSE 'cross_reference_validator'
    END as validation_source,
    (random() * 4 - 2) as variance_pct, -- ±2% variance
    random() < 0.8 as is_consensus, -- 80% consensus rate
    jsonb_build_object(
        'validator_version', '1.0',
        'validation_method', 'statistical_analysis',
        'confidence', 0.85 + (random() * 0.15)
    ) as metadata
FROM public.data_points dp
WHERE random() < 0.3; -- Validate ~30% of data points

-- Insert sample engine executions
INSERT INTO public.engine_executions (engine_id, success, confidence, signal, execution_time_ms, result_data, error_message)
VALUES
('data_integrity_engine', true, 0.94, 'normal', 156, '{"integrity_score": 94, "active_sources": 8, "consensus_level": 87, "manipulation_signals": 0, "healing_actions": 2}', null),
('net_liquidity_engine', true, 0.89, 'bullish', 203, '{"net_liquidity": 5626000000000, "trend": "expanding", "regime": "QE", "confidence": 89}', null),
('credit_stress_engine', true, 0.76, 'neutral', 189, '{"stress_level": "moderate", "spread": 3.47, "velocity": 0.12, "regime": "normal"}', null),
('data_integrity_engine', true, 0.92, 'normal', 167, '{"integrity_score": 92, "active_sources": 8, "consensus_level": 85, "manipulation_signals": 1, "healing_actions": 1}', null),
('net_liquidity_engine', true, 0.91, 'bullish', 198, '{"net_liquidity": 5638000000000, "trend": "expanding", "regime": "QE", "confidence": 91}', null);