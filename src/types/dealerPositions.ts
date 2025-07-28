export interface DealerPositionData {
  // Core Position Data
  treasuryPositions: {
    bills: number;           // T-Bills (<1 year)
    notes: number;          // T-Notes (2-10 years)
    bonds: number;          // T-Bonds (>10 years)
    tips: number;           // Treasury Inflation-Protected Securities
    total: number;
  };
  
  agencyPositions: {
    mortgage: number;       // Agency MBS
    debentures: number;     // Agency debentures
    discount: number;       // Agency discount notes
    total: number;
  };
  
  corporatePositions: {
    investmentGrade: number;
    highYield: number;
    municipals: number;
    total: number;
  };
  
  internationalPositions: {
    foreign: number;
    emerging: number;
    total: number;
  };
  
  // Risk Metrics
  riskMetrics: {
    leverageRatio: number;
    riskCapacity: number;
    liquidityStress: number;
    positionVelocity: number;
    concentrationRisk: number;
    durationRisk: number;
    creditRisk: number;
    counterpartyRisk: number;
  };
  
  // Advanced Analytics
  analytics: {
    regime: DealerRegime;
    regimeConfidence: number;
    transitionProbability: Record<DealerRegime, number>;
    flowDirection: 'ACCUMULATING' | 'DISTRIBUTING' | 'NEUTRAL';
    marketImpact: 'HIGH' | 'MODERATE' | 'LOW';
    systemicRisk: number;
  };
  
  // Historical Context
  context: {
    percentileRank: number;
    zScore: number;
    historicalAverage: number;
    volatility: number;
    correlationToSPX: number;
    correlationToVIX: number;
  };
  
  // Metadata
  metadata: {
    lastUpdated: Date;
    dataQuality: number;
    sourceReliability: number;
    calculationConfidence: number;
  };
}

export type DealerRegime = 
  | 'EXPANSION'      // Growing positions, low stress
  | 'CONTRACTION'    // Reducing positions, high stress
  | 'NEUTRAL'        // Stable positioning
  | 'CRISIS'         // Emergency positioning
  | 'TRANSITION';    // Regime changing

export interface DealerAlert {
  id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  type: 'LEVERAGE' | 'CONCENTRATION' | 'LIQUIDITY' | 'REGIME_CHANGE' | 'SYSTEMIC';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  acknowledged: boolean;
}

export interface DealerInsight {
  type: 'POSITION_SHIFT' | 'RISK_CHANGE' | 'REGIME_SIGNAL' | 'CORRELATION_BREAK';
  confidence: number;
  description: string;
  impact: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  timeframe: string;
  supportingData: Record<string, number>;
}

export interface DealerPositionsConfig {
  updateInterval: number;
  riskThresholds: {
    leverageWarning: number;
    leverageCritical: number;
    liquidityWarning: number;
    liquidityCritical: number;
    concentrationWarning: number;
    concentrationCritical: number;
  };
  regimeParams: {
    expansionThreshold: number;
    contractionThreshold: number;
    volatilityWindow: number;
    confidenceThreshold: number;
  };
}