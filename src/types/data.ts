export interface FREDDataPoint {
  date: string;
  value: number;
}

export interface FREDResponse {
  observations: FREDDataPoint[];
}

export interface LiquidityData {
  walcl: number;      // Fed Balance Sheet
  wtregen: number;    // Treasury General Account
  rrpontsyd: number;  // Reverse Repo
  netLiquidity: number;
  kalmanAlpha: number;
}

export interface CreditData {
  spread: number;     // High Yield OAS in basis points
  velocity: number;   // Rate of change
  category: 'low' | 'moderate' | 'high' | 'crisis';
  regime: 'QE' | 'QT' | 'neutral';
}

export interface EnhancedCreditData {
  // Core spreads
  highYieldSpread: number;
  investmentGradeSpread: number;
  corporateSpread: number;
  sovereignSpread: number;
  
  // Velocity metrics
  spreadVelocity: number;
  accelerationRate: number;
  volatilityIndex: number;
  
  // Market structure
  liquidityScore: number;
  convexityRisk: number;
  correlationBreakdown: number;
  
  // Regime indicators
  regime: 'QE_SUPPORTIVE' | 'QT_STRESS' | 'NEUTRAL' | 'CRISIS_MODE';
  regimeConfidence: number;
  transitionProbability: number;
  
  // Risk metrics
  stressLevel: 'MINIMAL' | 'MODERATE' | 'ELEVATED' | 'EXTREME';
  systemicRisk: number;
  contagionRisk: number;
  
  // Technical indicators
  zScore: number;
  percentileRank: number;
  momentumStrength: number;
  
  // Metadata
  lastUpdated: Date;
  dataQuality: number;
  sourceCount: number;
}

export interface ZScoreData {
  value: number;
  percentile: number;
  extreme: boolean;
  window: '4w' | '12w' | '26w';
}

export interface MomentumData {
  roc: number;        // Rate of change
  acceleration: number;
  category: 'exploding' | 'building' | 'slowing' | 'declining';
  leadTime: number;
}

export interface MarketRegime {
  current: 'winter' | 'spring' | 'summer' | 'autumn';
  confidence: number;
  timeInRegime: number; // months
  transitionProbability: Record<string, number>;
}