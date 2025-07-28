-- Update existing indicators with proper pillar information
UPDATE public.indicators SET pillar = 1 WHERE symbol IN ('WALCL', 'WTREGEN', 'RRPONTSYD');
UPDATE public.indicators SET pillar = 2 WHERE symbol IN ('BAMLH0A0HYM2', 'DGS10', 'UNRATE', 'MANEMP');
UPDATE public.indicators SET pillar = 3 WHERE symbol IN ('BTC_PRICE', 'BTC_MVRV_Z', 'BTC_HASHRATE', 'BTC_ASOPR', 'BTC_PUELL');

-- Insert additional missing indicators if they don't exist
INSERT INTO public.indicators (symbol, name, description, data_source, pillar, priority, is_active, api_endpoint, update_frequency, metadata) 
SELECT * FROM (VALUES
('DEXUSEU', 'USD/EUR Exchange Rate', 'US Dollar to Euro Exchange Rate', 'FRED', 3, 1, true, 'https://api.stlouisfed.org/fred/series/observations', 'daily', '{"seriesId": "DEXUSEU", "units": "Rate"}'::jsonb),
('DTWEXAFEGS', 'DXY Index', 'Trade Weighted US Dollar Index: Advanced Foreign Economies', 'FRED', 3, 2, true, 'https://api.stlouisfed.org/fred/series/observations', 'daily', '{"seriesId": "DTWEXAFEGS", "units": "Index"}'::jsonb)
) AS new_indicators(symbol, name, description, data_source, pillar, priority, is_active, api_endpoint, update_frequency, metadata)
WHERE NOT EXISTS (
    SELECT 1 FROM public.indicators WHERE indicators.symbol = new_indicators.symbol
);

-- Insert sample data points for the last 30 days
INSERT INTO public.data_points (indicator_id, value, timestamp, confidence_score, raw_data, source_hash) 
SELECT 
    i.id,
    CASE 
        WHEN i.symbol = 'WALCL' THEN 7200 + (random() * 200 - 100) -- ~$7.2T ± $100B
        WHEN i.symbol = 'WTREGEN' THEN 600 + (random() * 100 - 50) -- ~$600B ± $50B  
        WHEN i.symbol = 'RRPONTSYD' THEN 2200 + (random() * 200 - 100) -- ~$2.2T ± $100B
        WHEN i.symbol = 'BAMLH0A0HYM2' THEN 3.5 + (random() * 2 - 1) -- ~3.5% ± 1%
        WHEN i.symbol = 'DGS10' THEN 4.2 + (random() * 1 - 0.5) -- ~4.2% ± 0.5%
        WHEN i.symbol = 'BTC_PRICE' THEN 45000 + (random() * 10000 - 5000) -- ~$45k ± $5k
        WHEN i.symbol = 'BTC_MVRV_Z' THEN 0.5 + (random() * 2 - 1) -- MVRV Z-score
        WHEN i.symbol = 'UNRATE' THEN 4.0 + (random() * 1 - 0.5) -- Unemployment rate
        ELSE 100 + (random() * 20 - 10)
    END as value,
    NOW() - (gs.day_offset * INTERVAL '1 day') as timestamp,
    0.85 + (random() * 0.15) as confidence_score, -- 85-100% confidence
    jsonb_build_object(
        'source', i.data_source,
        'series', i.symbol,
        'quality', 'validated'
    ) as raw_data,
    md5(i.symbol || (NOW() - (gs.day_offset * INTERVAL '1 day'))::text) as source_hash
FROM public.indicators i
CROSS JOIN (SELECT generate_series(0, 29) as day_offset) gs
WHERE i.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.data_points dp 
    WHERE dp.indicator_id = i.id 
    AND dp.timestamp::date = (NOW() - (gs.day_offset * INTERVAL '1 day'))::date
  );

-- Insert sample engine executions with recent timestamps
INSERT INTO public.engine_executions (engine_id, success, confidence, signal, execution_time_ms, result_data, error_message, created_at)
VALUES
('data_integrity_engine', true, 0.94, 'normal', 156, '{"integrity_score": 94, "active_sources": 8, "consensus_level": 87, "manipulation_signals": 0, "healing_actions": 2}'::jsonb, null, NOW() - INTERVAL '5 minutes'),
('net_liquidity_engine', true, 0.89, 'bullish', 203, '{"net_liquidity": 5626000000000, "trend": "expanding", "regime": "QE", "confidence": 89}'::jsonb, null, NOW() - INTERVAL '3 minutes'),
('credit_stress_engine', true, 0.76, 'neutral', 189, '{"stress_level": "moderate", "spread": 3.47, "velocity": 0.12, "regime": "normal"}'::jsonb, null, NOW() - INTERVAL '2 minutes'),
('data_integrity_engine', true, 0.92, 'normal', 167, '{"integrity_score": 92, "active_sources": 8, "consensus_level": 85, "manipulation_signals": 1, "healing_actions": 1}'::jsonb, null, NOW() - INTERVAL '1 minute'),
('net_liquidity_engine', true, 0.91, 'bullish', 198, '{"net_liquidity": 5638000000000, "trend": "expanding", "regime": "QE", "confidence": 91}'::jsonb, null, NOW());