-- LIQUIDITY² Terminal Database Schema
-- Foundation for 28 engines with real-time data pipeline

-- Market Data Storage
CREATE TABLE IF NOT EXISTS public.market_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(50) NOT NULL,
    source VARCHAR(20) NOT NULL, -- 'FRED', 'COINBASE', 'GLASSNODE', etc.
    value DECIMAL(20,8) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicates
    UNIQUE(symbol, source, timestamp)
);

-- Engine Calculations Cache
CREATE TABLE IF NOT EXISTS public.engine_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engine_id VARCHAR(50) NOT NULL,
    pillar INTEGER NOT NULL,
    primary_value DECIMAL(20,8) NOT NULL,
    signal VARCHAR(20) NOT NULL CHECK (signal IN ('RISK_ON', 'RISK_OFF', 'WARNING', 'NEUTRAL')),
    confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    analysis TEXT,
    sub_metrics JSONB DEFAULT '{}',
    alerts JSONB DEFAULT '[]',
    importance_score INTEGER DEFAULT 50,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time Signal Aggregation
CREATE TABLE IF NOT EXISTS public.master_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_strength INTEGER NOT NULL CHECK (signal_strength >= 0 AND signal_strength <= 100),
    master_signal VARCHAR(20) NOT NULL CHECK (master_signal IN ('RISK_ON', 'RISK_OFF', 'WARNING', 'NEUTRAL')),
    consensus_score INTEGER NOT NULL,
    conflict_level VARCHAR(20) NOT NULL,
    market_regime VARCHAR(50) NOT NULL,
    regime_confidence INTEGER NOT NULL,
    engine_count INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences and Configurations
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    dashboard_layout JSONB DEFAULT '{}',
    engine_weights JSONB DEFAULT '{}',
    alert_settings JSONB DEFAULT '{}',
    theme_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert History
CREATE TABLE IF NOT EXISTS public.alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    engine_id VARCHAR(50) NOT NULL,
    alert_level VARCHAR(20) NOT NULL CHECK (alert_level IN ('critical', 'warning', 'info')),
    message TEXT NOT NULL,
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Analytics
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    total_signals INTEGER DEFAULT 0,
    correct_signals INTEGER DEFAULT 0,
    false_positives INTEGER DEFAULT 0,
    avg_confidence DECIMAL(5,2) DEFAULT 0,
    regime_accuracy DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_indicators_symbol_timestamp ON public.market_indicators(symbol, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_market_indicators_source_timestamp ON public.market_indicators(source, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_engine_outputs_engine_calculated ON public.engine_outputs(engine_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_engine_outputs_pillar_calculated ON public.engine_outputs(pillar, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_master_signals_created ON public.master_signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_history_user_created ON public.alert_history(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.market_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engine_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Market data is public (read-only for users, insert for service role)
CREATE POLICY "Market indicators are viewable by everyone" 
ON public.market_indicators FOR SELECT 
TO authenticated, anon 
USING (true);

CREATE POLICY "Market indicators insertable by service role only" 
ON public.market_indicators FOR INSERT 
TO service_role 
WITH CHECK (true);

-- Engine outputs are public (read-only for users, insert/update for service role)
CREATE POLICY "Engine outputs are viewable by everyone" 
ON public.engine_outputs FOR SELECT 
TO authenticated, anon 
USING (true);

CREATE POLICY "Engine outputs managed by service role only" 
ON public.engine_outputs FOR ALL 
TO service_role 
USING (true);

-- Master signals are public (read-only for users, insert/update for service role)
CREATE POLICY "Master signals are viewable by everyone" 
ON public.master_signals FOR SELECT 
TO authenticated, anon 
USING (true);

CREATE POLICY "Master signals managed by service role only" 
ON public.master_signals FOR ALL 
TO service_role 
USING (true);

-- User preferences are private
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences FOR UPDATE 
USING (auth.uid() = user_id);

-- Alert history is private
CREATE POLICY "Users can view their own alerts" 
ON public.alert_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert alerts" 
ON public.alert_history FOR INSERT 
TO service_role 
WITH CHECK (true);

CREATE POLICY "Users can update their own alerts" 
ON public.alert_history FOR UPDATE 
USING (auth.uid() = user_id);

-- Performance metrics are public read-only
CREATE POLICY "Performance metrics are viewable by everyone" 
ON public.performance_metrics FOR SELECT 
TO authenticated, anon 
USING (true);

CREATE POLICY "Performance metrics managed by service role only" 
ON public.performance_metrics FOR ALL 
TO service_role 
USING (true);

-- Trigger for updated_at on user_preferences
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON public.user_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to clean old market data (keep last 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_market_data()
RETURNS void AS $$
BEGIN
    DELETE FROM public.market_indicators 
    WHERE timestamp < NOW() - INTERVAL '30 days';
    
    DELETE FROM public.engine_outputs 
    WHERE calculated_at < NOW() - INTERVAL '7 days';
    
    DELETE FROM public.master_signals 
    WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;