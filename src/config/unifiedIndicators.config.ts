/**
 * Unified Indicators Configuration - Single Source of Truth
 * Consolidates all indicator definitions with proper ID synchronization
 */

export interface UnifiedIndicatorConfig {
  id: string;
  name: string;
  symbol: string;
  source: 'FRED' | 'GLASSNODE' | 'COINBASE' | 'BINANCE' | 'MARKET' | 'ENGINE' | 'CME' | 'BLOOMBERG';
  category: string;
  pillar: 1 | 2 | 3 | 'foundation';
  refreshInterval: number;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  unit?: string;
  description?: string;
  transformFunction?: string;
  dependencies?: string[];
  tags?: string[];
  chartType?: 'line' | 'area' | 'candlestick' | 'volume' | 'histogram' | 'scatter' | 'heatmap';
  color?: string;
  precision?: number;
  yAxisLabel?: string;
  timeFrames?: Array<'1h' | '4h' | '1d' | '1w' | '1m' | '3m' | '1y'>;
  defaultTimeFrame?: '1h' | '4h' | '1d' | '1w' | '1m' | '3m' | '1y';
}

// Foundation Indicators
export const FOUNDATION_INDICATORS: UnifiedIndicatorConfig[] = [
  {
    id: 'data-integrity-score',
    name: 'Data Integrity Score',
    symbol: 'DIS',
    source: 'ENGINE',
    category: 'foundation',
    pillar: 'foundation',
    refreshInterval: 30000,
    criticality: 'CRITICAL',
    unit: '%',
    description: 'System-wide data integrity and validation score',
    tags: ['foundation', 'integrity', 'system'],
    chartType: 'histogram',
    color: '#FFD700',
    precision: 1,
    yAxisLabel: 'Quality Score',
    timeFrames: ['1h', '4h', '1d', '1w'],
    defaultTimeFrame: '1h'
  },
  {
    id: 'zscore-composite',
    name: 'Composite Z-Score',
    symbol: 'ZS_COMP',
    source: 'ENGINE',
    category: 'foundation',
    pillar: 'foundation',
    refreshInterval: 15000,
    criticality: 'CRITICAL',
    unit: 'σ',
    description: 'Multi-timeframe composite Z-score for market analysis',
    tags: ['foundation', 'zscore', 'statistical'],
    chartType: 'line',
    color: '#32CD32',
    precision: 2,
    yAxisLabel: 'Standard Deviations',
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d'
  }
];

// Pillar 1: Central Bank & Government Liquidity
export const PILLAR1_INDICATORS: UnifiedIndicatorConfig[] = [
  // Federal Reserve Balance Sheet
  {
    id: 'fed-balance-sheet',
    name: 'Federal Reserve Balance Sheet',
    symbol: 'WALCL',
    source: 'FRED',
    category: 'central-bank',
    pillar: 1,
    refreshInterval: 604800000, // Weekly
    criticality: 'CRITICAL',
    unit: 'Billions USD',
    description: 'Total assets held by the Federal Reserve',
    tags: ['fed', 'balance-sheet', 'liquidity'],
    chartType: 'area',
    color: '#00BFFF',
    precision: 2,
    yAxisLabel: 'USD Trillions',
    timeFrames: ['1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1m'
  },
  {
    id: 'treasury-general-account',
    name: 'Treasury General Account',
    symbol: 'WTREGEN',
    source: 'FRED',
    category: 'treasury',
    pillar: 1,
    refreshInterval: 86400000, // Daily
    criticality: 'CRITICAL',
    unit: 'Billions USD',
    description: 'U.S. Treasury balance at the Federal Reserve',
    tags: ['treasury', 'government', 'liquidity'],
    chartType: 'area',
    color: '#FF4500',
    precision: 1,
    yAxisLabel: 'USD Billions',
    timeFrames: ['1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1w'
  },
  {
    id: 'reverse-repo-operations',
    name: 'Reverse Repo Operations',
    symbol: 'RRPONTSYD',
    source: 'FRED',
    category: 'monetary-ops',
    pillar: 1,
    refreshInterval: 86400000, // Daily
    criticality: 'CRITICAL',
    unit: 'Billions USD',
    description: 'Overnight reverse repurchase agreements',
    tags: ['fed', 'repo', 'liquidity-drain'],
    chartType: 'area',
    color: '#32CD32',
    precision: 1,
    yAxisLabel: 'USD Billions',
    timeFrames: ['1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1w'
  },
  {
    id: 'net-liquidity',
    name: 'Net Liquidity',
    symbol: 'NET_LIQ',
    source: 'ENGINE',
    category: 'calculated',
    pillar: 1,
    refreshInterval: 86400000,
    criticality: 'CRITICAL',
    unit: 'Trillions USD',
    description: 'Fed Balance Sheet minus Treasury Account minus Reverse Repo',
    transformFunction: 'WALCL - WTREGEN - RRPONTSYD',
    dependencies: ['fed-balance-sheet', 'treasury-general-account', 'reverse-repo-operations'],
    tags: ['net-liquidity', 'calculated', 'primary'],
    chartType: 'area',
    color: '#00BFFF',
    precision: 3,
    yAxisLabel: 'USD Trillions',
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d'
  },

  // Interest Rates & Yield Curve
  {
    id: 'federal-funds-rate',
    name: 'Federal Funds Rate',
    symbol: 'DFF',
    source: 'FRED',
    category: 'rates',
    pillar: 1,
    refreshInterval: 86400000,
    criticality: 'HIGH',
    unit: '%',
    description: 'Federal funds effective rate',
    tags: ['fed', 'rates', 'policy'],
    chartType: 'line',
    color: '#FFD700',
    precision: 3,
    yAxisLabel: 'Interest Rate',
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m'],
    defaultTimeFrame: '1d'
  },
  {
    id: '10y-treasury-yield',
    name: '10-Year Treasury Yield',
    symbol: 'GS10',
    source: 'FRED',
    category: 'rates',
    pillar: 1,
    refreshInterval: 3600000,
    criticality: 'HIGH',
    unit: '%',
    description: '10-Year Treasury constant maturity rate',
    tags: ['treasury', 'rates', 'long-term'],
    chartType: 'line',
    color: '#FFD700',
    precision: 3,
    yAxisLabel: 'Interest Rate',
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d'
  },
  {
    id: '2y-treasury-yield',
    name: '2-Year Treasury Yield',
    symbol: 'GS2',
    source: 'FRED',
    category: 'rates',
    pillar: 1,
    refreshInterval: 3600000,
    criticality: 'HIGH',
    unit: '%',
    description: '2-Year Treasury constant maturity rate',
    tags: ['treasury', 'rates', 'short-term'],
    chartType: 'line',
    color: '#FFD700',
    precision: 3,
    yAxisLabel: 'Interest Rate',
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d'
  },

  // Primary Dealer Positions
  {
    id: 'primary-dealer-positions',
    name: 'Primary Dealer Positions',
    symbol: 'PDTOTL',
    source: 'FRED',
    category: 'liquidity',
    pillar: 1,
    refreshInterval: 604800000, // Weekly
    criticality: 'HIGH',
    unit: 'Trillions USD',
    description: 'Aggregate securities positions held by primary dealers',
    tags: ['dealers', 'positions', 'liquidity'],
    chartType: 'area',
    color: '#00BFFF',
    precision: 2,
    yAxisLabel: 'USD Trillions',
    timeFrames: ['1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1w'
  },

  // Credit Spreads
  {
    id: 'high-yield-spread',
    name: 'High Yield Credit Spread',
    symbol: 'BAMLH0A0HYM2',
    source: 'FRED',
    category: 'credit',
    pillar: 1,
    refreshInterval: 86400000,
    criticality: 'HIGH',
    unit: 'bps',
    description: 'ICE BofA US High Yield Index Option-Adjusted Spread',
    tags: ['credit', 'spreads', 'risk'],
    chartType: 'line',
    color: '#FF00FF',
    precision: 2,
    yAxisLabel: 'Basis Points',
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m'],
    defaultTimeFrame: '1d'
  },
  {
    id: 'investment-grade-spread',
    name: 'Investment Grade Credit Spread',
    symbol: 'BAMLC0A0CM',
    source: 'FRED',
    category: 'credit',
    pillar: 1,
    refreshInterval: 86400000,
    criticality: 'HIGH',
    unit: 'bps',
    description: 'ICE BofA US Corporate Index Option-Adjusted Spread',
    tags: ['credit', 'spreads', 'corporate'],
    chartType: 'line',
    color: '#FF00FF',
    precision: 2,
    yAxisLabel: 'Basis Points',
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m'],
    defaultTimeFrame: '1d'
  },
  {
    id: 'credit-stress',
    name: 'Credit Stress Index',
    symbol: 'CREDIT_STRESS',
    source: 'ENGINE',
    category: 'calculated',
    pillar: 1,
    refreshInterval: 86400000,
    criticality: 'HIGH',
    unit: 'bps',
    description: 'Weighted average of high yield and investment grade spreads',
    transformFunction: 'WEIGHTED_AVERAGE(BAMLH0A0HYM2 * 0.6, BAMLC0A0CM * 0.4)',
    dependencies: ['high-yield-spread', 'investment-grade-spread'],
    tags: ['credit', 'spreads', 'calculated'],
    chartType: 'line',
    color: '#FF00FF',
    precision: 2,
    yAxisLabel: 'Basis Points',
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m'],
    defaultTimeFrame: '1d'
  }
];

// Pillar 2: Equity, Currency & Commodity Indicators
export const PILLAR2_INDICATORS: UnifiedIndicatorConfig[] = [
  // Equity Markets
  {
    id: 'sp500',
    name: 'S&P 500 Index',
    symbol: 'SP500',
    source: 'FRED',
    category: 'equity',
    pillar: 2,
    refreshInterval: 86400000,
    criticality: 'HIGH',
    unit: 'Index',
    description: 'S&P 500 stock market index',
    tags: ['equity', 'large-cap', 'us-market'],
    chartType: 'line',
    color: '#32CD32',
    precision: 2,
    yAxisLabel: 'Index Value',
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d'
  },
  {
    id: 'nasdaq',
    name: 'NASDAQ Composite',
    symbol: 'NASDAQCOM',
    source: 'FRED',
    category: 'equity',
    pillar: 2,
    refreshInterval: 86400000,
    criticality: 'HIGH',
    unit: 'Index',
    description: 'NASDAQ Composite index',
    tags: ['equity', 'tech', 'growth'],
    chartType: 'line',
    color: '#32CD32',
    precision: 2,
    yAxisLabel: 'Index Value',
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d'
  },
  {
    id: 'vix',
    name: 'VIX Volatility Index',
    symbol: 'VIXCLS',
    source: 'FRED',
    category: 'volatility',
    pillar: 2,
    refreshInterval: 86400000,
    criticality: 'HIGH',
    unit: 'Index',
    description: 'CBOE Volatility Index',
    tags: ['volatility', 'fear', 'options'],
    chartType: 'line',
    color: '#FF4500',
    precision: 2,
    yAxisLabel: 'Volatility',
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d'
  },

  // Currency Markets
  {
    id: 'dxy',
    name: 'Dollar Index',
    symbol: 'DTWEXBGS',
    source: 'FRED',
    category: 'currency',
    pillar: 2,
    refreshInterval: 86400000,
    criticality: 'HIGH',
    unit: 'Index',
    description: 'Trade Weighted U.S. Dollar Index',
    tags: ['currency', 'dollar', 'trade-weighted'],
    chartType: 'line',
    color: '#32CD32',
    precision: 2,
    yAxisLabel: 'Index Value',
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d'
  },

  // Commodities
  {
    id: 'gold',
    name: 'Gold Price',
    symbol: 'GOLDAMGBD228NLBM',
    source: 'FRED',
    category: 'commodities',
    pillar: 2,
    refreshInterval: 86400000,
    criticality: 'MEDIUM',
    unit: 'USD/oz',
    description: 'Gold fixing price in London Bullion Market',
    tags: ['gold', 'precious-metals', 'safe-haven'],
    chartType: 'line',
    color: '#FFD700',
    precision: 2,
    yAxisLabel: 'Price',
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d'
  }
];

// Pillar 3: Cryptocurrency & Alternative Assets
export const PILLAR3_INDICATORS: UnifiedIndicatorConfig[] = [
  {
    id: 'btc-price',
    name: 'Bitcoin Price',
    symbol: 'BTC-USD',
    source: 'COINBASE',
    category: 'crypto',
    pillar: 3,
    refreshInterval: 15000,
    criticality: 'HIGH',
    unit: 'USD',
    description: 'Bitcoin spot price in USD',
    tags: ['bitcoin', 'crypto', 'digital-gold'],
    chartType: 'candlestick',
    color: '#FFD700',
    precision: 0,
    yAxisLabel: 'Price',
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d'
  },
  {
    id: 'eth-price',
    name: 'Ethereum Price',
    symbol: 'ETH-USD',
    source: 'COINBASE',
    category: 'crypto',
    pillar: 3,
    refreshInterval: 15000,
    criticality: 'MEDIUM',
    unit: 'USD',
    description: 'Ethereum spot price in USD',
    tags: ['ethereum', 'crypto', 'smart-contracts'],
    chartType: 'candlestick',
    color: '#00BFFF',
    precision: 2,
    yAxisLabel: 'Price',
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d'
  }
];

// Synthesis Indicators
export const SYNTHESIS_INDICATORS: UnifiedIndicatorConfig[] = [
  {
    id: 'enhanced-momentum',
    name: 'Enhanced Momentum Score',
    symbol: 'ENHANCED_MOMENTUM',
    source: 'ENGINE',
    category: 'calculated',
    pillar: 'foundation',
    refreshInterval: 86400000,
    criticality: 'HIGH',
    unit: 'Score',
    description: 'Multi-asset momentum score',
    transformFunction: 'MOMENTUM_COMPOSITE(SP500, NASDAQ, VIX_INV, BTC, ETH)',
    dependencies: ['sp500', 'nasdaq', 'vix', 'btc-price', 'eth-price'],
    tags: ['momentum', 'synthesis', 'calculated'],
    chartType: 'line',
    color: '#32CD32',
    precision: 2,
    yAxisLabel: 'Momentum Score',
    timeFrames: ['1h', '4h', '1d', '1w', '1m'],
    defaultTimeFrame: '1d'
  }
];

// All Indicators Combined
export const ALL_UNIFIED_INDICATORS = [
  ...FOUNDATION_INDICATORS,
  ...PILLAR1_INDICATORS,
  ...PILLAR2_INDICATORS,
  ...PILLAR3_INDICATORS,
  ...SYNTHESIS_INDICATORS
];

// Indicator Category Mapping
export const INDICATOR_CATEGORIES = {
  'foundation': FOUNDATION_INDICATORS,
  'pillar1': PILLAR1_INDICATORS,
  'pillar2': PILLAR2_INDICATORS,
  'pillar3': PILLAR3_INDICATORS,
  'synthesis': SYNTHESIS_INDICATORS
} as const;

// Criticality Weights
export const INDICATOR_WEIGHTS = {
  CRITICAL: 1.0,
  HIGH: 0.75,
  MEDIUM: 0.5,
  LOW: 0.25
};

// Chart Type Defaults
export const CHART_TYPE_DEFAULTS = {
  'line': { color: '#32CD32', precision: 2 },
  'area': { color: '#00BFFF', precision: 2 },
  'candlestick': { color: '#FFD700', precision: 2 },
  'histogram': { color: '#FF00FF', precision: 1 }
} as const;

// Utility Functions
export function getIndicatorById(id: string): UnifiedIndicatorConfig | undefined {
  return ALL_UNIFIED_INDICATORS.find(indicator => indicator.id === id);
}

export function getIndicatorsByPillar(pillar: 1 | 2 | 3 | 'foundation'): UnifiedIndicatorConfig[] {
  return ALL_UNIFIED_INDICATORS.filter(indicator => indicator.pillar === pillar);
}

export function getIndicatorsByCategory(category: string): UnifiedIndicatorConfig[] {
  return ALL_UNIFIED_INDICATORS.filter(indicator => indicator.category === category);
}

export function getCalculatedIndicators(): UnifiedIndicatorConfig[] {
  return ALL_UNIFIED_INDICATORS.filter(indicator => indicator.source === 'ENGINE');
}

export function getDependencyMap(): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  ALL_UNIFIED_INDICATORS.forEach(indicator => {
    if (indicator.dependencies) {
      map[indicator.id] = indicator.dependencies;
    }
  });
  return map;
}