-- Trigger initial data ingestion for the newly added indicators
-- This will populate them with recent data from FRED API
UPDATE public.indicators 
SET last_updated = NULL 
WHERE symbol IN ('DGS2', 'T10Y2Y', 'VIXCLS', 'DEXJPUS', 'WTREGEN', 'RRPONTSYD');