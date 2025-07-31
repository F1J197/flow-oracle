export interface LiquidityComponent {
  id: string;
  name: string;
  value: number;
  weight: number;
  confidence: number;
  trend: 'expanding' | 'contracting' | 'stable';
  kalmanState: {
    estimate: number;
    uncertainty: number;
    lastUpdate: Date;
  };
}

export interface NetLiquidityMetrics {
  total: number;
  components: {
    fedBalanceSheet: LiquidityComponent;
    treasuryGeneralAccount: LiquidityComponent;
    reverseRepo: LiquidityComponent;
    currencyInCirculation: LiquidityComponent;
  };
  adaptiveSignal: {
    strength: number;
    direction: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    regime: 'EXPANSION' | 'CONTRACTION' | 'TRANSITION';
  };
  kalmanMetrics: {
    overallConfidence: number;
    adaptationRate: number;
    signalNoise: number;
    convergenceStatus: 'converged' | 'converging' | 'diverging';
  };
  lastCalculation: Date;
}

export interface LiquidityAlert {
  type: 'TREND_CHANGE' | 'EXTREME_VALUE' | 'CORRELATION_BREAK' | 'REGIME_SHIFT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  component?: string;
  message: string;
  confidence: number;
  timestamp: Date;
}

export interface KalmanNetLiquidityConfig {
  components: {
    [key: string]: {
      processNoise: number;
      measurementNoise: number;
      weight: number;
    };
  };
  adaptationSpeed: number;
  signalThreshold: number;
  alertThresholds: {
    extreme: number;
    trendChange: number;
    correlation: number;
  };
  refreshInterval: number;
  maxRetries: number;
}

export interface AdaptiveSignal {
  value: number;
  confidence: number;
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  timeframe: '1d' | '1w' | '1m' | '3m';
  regime: 'EXPANSION' | 'CONTRACTION' | 'TRANSITION';
}

export interface LiquidityRegime {
  current: 'EXPANSION' | 'CONTRACTION' | 'TRANSITION';
  probability: number;
  duration: number; // days in current regime
  nextTransition: {
    probability: number;
    expectedRegime: 'EXPANSION' | 'CONTRACTION' | 'TRANSITION';
    timeframe: string;
  };
}