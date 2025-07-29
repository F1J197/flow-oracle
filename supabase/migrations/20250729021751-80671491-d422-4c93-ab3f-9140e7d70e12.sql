-- Phase 1 & 2: Create comprehensive database schema for CUSIP Stealth QE Engine

-- SOMA Holdings data table
CREATE TABLE public.soma_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cusip_id TEXT NOT NULL,
  security_description TEXT,
  maturity_date DATE,
  par_amount DECIMAL(20,2),
  market_value DECIMAL(20,2),
  weighted_average_maturity DECIMAL(10,4),
  sector TEXT,
  issue_date DATE,
  coupon_rate DECIMAL(8,4),
  holdings_date DATE NOT NULL,
  change_from_previous DECIMAL(20,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CUSIP anomaly detection results
CREATE TABLE public.cusip_anomalies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cusip_id TEXT NOT NULL,
  anomaly_type TEXT NOT NULL, -- 'volume', 'price', 'holdings', 'pattern'
  severity_score DECIMAL(5,2) NOT NULL, -- 0-100
  confidence_level DECIMAL(5,2) NOT NULL, -- 0-100
  detection_method TEXT NOT NULL, -- 'dbscan', 'isolation_forest', 'statistical'
  raw_features JSONB,
  anomaly_details JSONB,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_validated BOOLEAN DEFAULT false,
  validation_notes TEXT
);

-- H.4.1 Balance Sheet validation data
CREATE TABLE public.h41_validation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_date DATE NOT NULL,
  securities_held_outright DECIMAL(20,2),
  repurchase_agreements DECIMAL(20,2),
  central_bank_liquidity_swaps DECIMAL(20,2),
  other_assets DECIMAL(20,2),
  total_assets DECIMAL(20,2),
  variance_from_soma DECIMAL(20,2),
  reconciliation_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CUSIP metadata and classifications
CREATE TABLE public.cusip_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cusip_id TEXT NOT NULL UNIQUE,
  security_type TEXT NOT NULL,
  issuer TEXT,
  maturity_bucket TEXT, -- '0-1Y', '1-3Y', '3-5Y', '5-10Y', '10Y+'
  duration DECIMAL(8,4),
  convexity DECIMAL(8,4),
  liquidity_tier INTEGER, -- 1=most liquid, 5=least liquid
  on_the_run BOOLEAN DEFAULT false,
  benchmark_security BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Market microstructure data for anomaly detection
CREATE TABLE public.market_microstructure (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cusip_id TEXT NOT NULL,
  trading_date DATE NOT NULL,
  bid_ask_spread DECIMAL(8,4),
  trade_volume DECIMAL(20,2),
  price_impact DECIMAL(8,4),
  order_flow_imbalance DECIMAL(8,4),
  volatility DECIMAL(8,4),
  liquidity_score DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Stealth QE detection patterns
CREATE TABLE public.stealth_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_name TEXT NOT NULL,
  pattern_type TEXT NOT NULL, -- 'temporal', 'cross_sectional', 'regime_shift'
  detection_algorithm TEXT NOT NULL,
  parameters JSONB,
  success_rate DECIMAL(5,2),
  false_positive_rate DECIMAL(5,2),
  last_calibrated TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_soma_holdings_cusip_date ON public.soma_holdings(cusip_id, holdings_date DESC);
CREATE INDEX idx_cusip_anomalies_severity ON public.cusip_anomalies(severity_score DESC, detected_at DESC);
CREATE INDEX idx_cusip_anomalies_cusip ON public.cusip_anomalies(cusip_id, detected_at DESC);
CREATE INDEX idx_h41_validation_date ON public.h41_validation(report_date DESC);
CREATE INDEX idx_market_microstructure_cusip_date ON public.market_microstructure(cusip_id, trading_date DESC);

-- Enable Row Level Security
ALTER TABLE public.soma_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cusip_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.h41_validation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cusip_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_microstructure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stealth_patterns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Allow public read access to soma_holdings" 
ON public.soma_holdings FOR SELECT USING (true);

CREATE POLICY "Allow public read access to cusip_anomalies" 
ON public.cusip_anomalies FOR SELECT USING (true);

CREATE POLICY "Allow public read access to h41_validation" 
ON public.h41_validation FOR SELECT USING (true);

CREATE POLICY "Allow public read access to cusip_metadata" 
ON public.cusip_metadata FOR SELECT USING (true);

CREATE POLICY "Allow public read access to market_microstructure" 
ON public.market_microstructure FOR SELECT USING (true);

CREATE POLICY "Allow public read access to stealth_patterns" 
ON public.stealth_patterns FOR SELECT USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_soma_holdings_updated_at
BEFORE UPDATE ON public.soma_holdings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cusip_metadata_updated_at
BEFORE UPDATE ON public.cusip_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial pattern configurations
INSERT INTO public.stealth_patterns (pattern_name, pattern_type, detection_algorithm, parameters, success_rate, false_positive_rate) VALUES
('Unusual Holdings Accumulation', 'temporal', 'dbscan', '{"eps": 0.5, "min_samples": 3, "lookback_days": 30}', 85.5, 12.3),
('Cross-Maturity Arbitrage', 'cross_sectional', 'isolation_forest', '{"contamination": 0.1, "n_estimators": 100}', 78.9, 15.7),
('Regime Shift Detection', 'regime_shift', 'hidden_markov', '{"n_components": 3, "covariance_type": "full"}', 82.1, 18.2),
('Liquidity Drainage Pattern', 'temporal', 'statistical_outlier', '{"sigma_threshold": 2.5, "window_size": 14}', 91.2, 8.4);

-- Insert sample CUSIP metadata for testing
INSERT INTO public.cusip_metadata (cusip_id, security_type, issuer, maturity_bucket, duration, liquidity_tier, on_the_run) VALUES
('912828D62', 'Treasury Note', 'US Treasury', '5-10Y', 7.25, 1, true),
('912828E53', 'Treasury Note', 'US Treasury', '3-5Y', 3.84, 1, false),
('912828F29', 'Treasury Bond', 'US Treasury', '10Y+', 15.67, 2, true),
('912828G12', 'Treasury Bill', 'US Treasury', '0-1Y', 0.25, 1, true);