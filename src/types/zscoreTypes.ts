export interface ZScoreWindow {
  period: '4w' | '12w' | '26w' | '52w' | '104w';
  days: number;
  weight: number;
}

export interface ZScoreCalculation {
  value: number;
  zscore: number;
  percentile: number;
  window: ZScoreWindow;
  isExtreme: boolean;
  confidence: number;
}

export interface CompositeZScore {
  value: number; // -4 to +10 range
  regime: MarketRegime;
  confidence: number; // 0-1
  components: ZScoreCalculation[];
  timestamp: Date;
}

export interface DistributionAnalysis {
  histogram: HistogramBin[];
  skewness: number;
  kurtosis: number;
  extremeValues: ExtremeValue[];
  outlierCount: number;
}

export interface HistogramBin {
  range: [number, number];
  count: number;
  percentage: number;
  isHighlighted: boolean;
  color: 'btc' | 'btc-light' | 'btc-glow' | 'btc-muted' | 'neon-orange' | 'neon-teal' | 'neon-lime' | 'text-muted';
}

export interface ExtremeValue {
  indicator: string;
  zscore: number;
  percentile: number;
  value: number;
  timestamp: Date;
  severity: 'extreme' | 'significant' | 'notable';
}

export type MarketRegime = 'WINTER' | 'SPRING' | 'SUMMER' | 'AUTUMN';

export interface RegimeWeights {
  momentum: number;
  volatility: number;
  volume: number;
  breadth: number;
  credit: number;
}

export interface ZScoreData {
  composite: CompositeZScore;
  distribution: DistributionAnalysis;
  multiTimeframe: ZScoreCalculation[];
  dataQuality: DataQualityMetrics;
  lastUpdate: Date;
  cacheHit: boolean;
}

export interface DataQualityMetrics {
  completeness: number; // 0-1
  freshness: number; // 0-1
  accuracy: number; // 0-1
  sourceCount: number;
  validationsPassed: number;
  validationsTotal: number;
}

export interface ZScoreTileData {
  title: string;
  primaryMetric: {
    value: number;
    formatted: string;
    status: 'extreme_positive' | 'positive' | 'neutral' | 'negative' | 'extreme_negative';
  };
  histogram: {
    bins: HistogramBin[];
    currentValue: number;
    extremeThreshold: number;
  };
  regime: {
    current: MarketRegime;
    confidence: number;
    emoji: string;
  };
  confidence: number;
  lastUpdate: Date;
  loading?: boolean;
}

export interface InstitutionalInsight {
  type: 'positioning' | 'flow' | 'sentiment' | 'technical';
  title: string;
  description: string;
  confidence: number;
  timeframe: 'immediate' | 'short_term' | 'medium_term';
  actionable: boolean;
}

export interface ZScoreIntelligenceData {
  composite: CompositeZScore;
  institutionalInsights: InstitutionalInsight[];
  dataQuality: DataQualityMetrics;
  multiTimeframe: ZScoreCalculation[];
  distribution: DistributionAnalysis;
  topExtremes: ExtremeValue[];
}