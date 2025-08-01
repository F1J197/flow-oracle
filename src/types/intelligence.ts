export interface MarketNarrative {
  headline: string;
  summary: string;
  keyInsights: string[];
  implications: string[];
  actionableItems: ActionableItem[];
  riskFactors: string[];
  confidence: number;
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
}

export interface ActionableItem {
  type: 'monitor' | 'alert' | 'position' | 'hedge' | 'research';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  rationale: string;
}

export interface EngineIntelligence {
  engineId: string;
  engineName: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  narrative: MarketNarrative;
  contextualData: {
    currentReading: {
      value: number;
      label: string;
      unit?: string;
      interpretation: string;
    };
    historicalContext: {
      percentile: number;
      trend: 'rising' | 'falling' | 'stable';
      volatility: 'low' | 'normal' | 'elevated' | 'extreme';
      comparison: string;
    };
    marketImplications: {
      riskAssets: 'bullish' | 'bearish' | 'neutral';
      liquidityConditions: 'ample' | 'tightening' | 'stressed';
      regimeShift: boolean;
      probability: number;
    };
  };
  lastUpdated: Date;
}

export interface MarketIntelligenceSnapshot {
  globalTheme: string;
  dominantNarrative: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  liquidityConditions: 'abundant' | 'adequate' | 'tightening' | 'stressed';
  regimeStatus: {
    current: string;
    confidence: number;
    nextLikely: string;
    timeframe: string;
  };
  topInsights: string[];
  criticalAlerts: ActionableItem[];
  engineIntelligence: EngineIntelligence[];
}