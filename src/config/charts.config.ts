/**
 * LIQUIDITY² Charts Configuration
 * Comprehensive chart definitions for 50+ financial indicators
 */

import { IndicatorMetadata } from '@/types/indicators';

export type ChartType = 'line' | 'area' | 'candlestick' | 'volume' | 'histogram' | 'scatter' | 'heatmap';

export interface ChartConfig {
  id: string;
  name: string;
  description: string;
  chartType: ChartType;
  indicatorId: string;
  category: 'liquidity' | 'momentum' | 'volatility' | 'sentiment' | 'macro' | 'technical' | 'crypto';
  pillar: 1 | 2 | 3 | 'foundation' | 'synthesis';
  priority: number;
  color: string;
  yAxisLabel?: string;
  unit?: string;
  precision?: number;
  timeFrames: Array<'1h' | '4h' | '1d' | '1w' | '1m' | '3m' | '1y'>;
  defaultTimeFrame: '1h' | '4h' | '1d' | '1w' | '1m' | '3m' | '1y';
  aggregationSupported: boolean;
  overlaySupported: boolean;
  zoomable: boolean;
  crosshairSync: boolean;
  realtime: boolean;
  displayOptions?: {
    showVolume?: boolean;
    showMA?: boolean;
    showBollingerBands?: boolean;
    showRSI?: boolean;
  };
}

export const CHART_CONFIGS: Record<string, ChartConfig> = {
  // === FOUNDATION PILLAR ===
  'net-liquidity': {
    id: 'net-liquidity',
    name: 'Global Net Liquidity',
    description: 'Total global monetary base minus treasury liabilities',
    chartType: 'area',
    indicatorId: 'net-liquidity',
    category: 'liquidity',
    pillar: 'foundation',
    priority: 1,
    color: '#00BFFF', // neon-teal
    yAxisLabel: 'USD Trillions',
    unit: '$T',
    precision: 3,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  'z-score': {
    id: 'z-score',
    name: 'Enhanced Z-Score Analysis',
    description: 'Statistical momentum measure across global markets',
    chartType: 'line',
    indicatorId: 'z-score',
    category: 'momentum',
    pillar: 'foundation',
    priority: 2,
    color: '#32CD32', // neon-lime
    yAxisLabel: 'Standard Deviations',
    unit: 'σ',
    precision: 2,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  'data-integrity': {
    id: 'data-integrity',
    name: 'Data Integrity Score',
    description: 'Quality assessment of incoming data streams',
    chartType: 'histogram',
    indicatorId: 'data-integrity',
    category: 'technical',
    pillar: 'foundation',
    priority: 3,
    color: '#FFD700', // neon-gold
    yAxisLabel: 'Quality Score',
    unit: '%',
    precision: 1,
    timeFrames: ['1h', '4h', '1d', '1w'],
    defaultTimeFrame: '1h',
    aggregationSupported: false,
    overlaySupported: false,
    zoomable: true,
    crosshairSync: false,
    realtime: true
  },

  // === PILLAR 1: LIQUIDITY MECHANICS ===
  'primary-dealer-positions': {
    id: 'primary-dealer-positions',
    name: 'Primary Dealer Positions',
    description: 'Aggregate securities positions held by primary dealers',
    chartType: 'area',
    indicatorId: 'primary-dealer-positions',
    category: 'liquidity',
    pillar: 1,
    priority: 4,
    color: '#00BFFF',
    yAxisLabel: 'USD Trillions',
    unit: '$T',
    precision: 2,
    timeFrames: ['1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1w',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  'dealer-leverage': {
    id: 'dealer-leverage',
    name: 'Dealer Leverage Ratio',
    description: 'Financial leverage of primary dealer network',
    chartType: 'line',
    indicatorId: 'dealer-leverage',
    category: 'liquidity',
    pillar: 1,
    priority: 5,
    color: '#FF4500', // neon-orange
    yAxisLabel: 'Leverage Multiple',
    unit: 'x',
    precision: 2,
    timeFrames: ['1h', '4h', '1d', '1w', '1m'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  'repo-rates': {
    id: 'repo-rates',
    name: 'Repo Market Rates',
    description: 'Overnight and term repurchase agreement rates',
    chartType: 'line',
    indicatorId: 'repo-rates',
    category: 'liquidity',
    pillar: 1,
    priority: 6,
    color: '#00BFFF',
    yAxisLabel: 'Interest Rate',
    unit: '%',
    precision: 3,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  'treasury-ga': {
    id: 'treasury-ga',
    name: 'Treasury General Account',
    description: 'US Treasury operating cash balance at Federal Reserve',
    chartType: 'area',
    indicatorId: 'treasury-ga',
    category: 'liquidity',
    pillar: 1,
    priority: 7,
    color: '#FF4500',
    yAxisLabel: 'USD Billions',
    unit: '$B',
    precision: 1,
    timeFrames: ['1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1w',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  'rrp-usage': {
    id: 'rrp-usage',
    name: 'Reverse Repo Facility Usage',
    description: 'Federal Reserve overnight reverse repurchase operations',
    chartType: 'area',
    indicatorId: 'rrp-usage',
    category: 'liquidity',
    pillar: 1,
    priority: 8,
    color: '#32CD32',
    yAxisLabel: 'USD Billions',
    unit: '$B',
    precision: 1,
    timeFrames: ['1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1w',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  // === PILLAR 2: MARKET STRUCTURE ===
  'credit-stress': {
    id: 'credit-stress',
    name: 'Credit Stress Index',
    description: 'Aggregate measure of credit market stress conditions',
    chartType: 'line',
    indicatorId: 'credit-stress',
    category: 'sentiment',
    pillar: 2,
    priority: 9,
    color: '#FF00FF', // neon-fuchsia
    yAxisLabel: 'Basis Points',
    unit: 'bps',
    precision: 2,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  'vix': {
    id: 'vix',
    name: 'VIX Volatility Index',
    description: 'CBOE Volatility Index - market fear gauge',
    chartType: 'line',
    indicatorId: 'vix',
    category: 'volatility',
    pillar: 2,
    priority: 10,
    color: '#FF4500',
    yAxisLabel: 'Volatility',
    unit: '',
    precision: 2,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true,
    displayOptions: {
      showVolume: true,
      showMA: true
    }
  },

  'term-spread': {
    id: 'term-spread',
    name: '10Y-2Y Term Spread',
    description: 'Yield curve spread between 10-year and 2-year treasuries',
    chartType: 'line',
    indicatorId: 'term-spread',
    category: 'macro',
    pillar: 2,
    priority: 11,
    color: '#FFD700',
    yAxisLabel: 'Spread',
    unit: '%',
    precision: 3,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  'dxy': {
    id: 'dxy',
    name: 'US Dollar Index (DXY)',
    description: 'Dollar strength relative to basket of major currencies',
    chartType: 'line',
    indicatorId: 'dxy',
    category: 'macro',
    pillar: 2,
    priority: 12,
    color: '#32CD32',
    yAxisLabel: 'Index Value',
    unit: '',
    precision: 2,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  // === PILLAR 3: ALTERNATIVE ASSETS ===
  'bitcoin': {
    id: 'bitcoin',
    name: 'Bitcoin (BTC/USD)',
    description: 'Bitcoin price in US dollars',
    chartType: 'candlestick',
    indicatorId: 'bitcoin',
    category: 'crypto',
    pillar: 3,
    priority: 13,
    color: '#FFD700',
    yAxisLabel: 'Price',
    unit: '$',
    precision: 0,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true,
    displayOptions: {
      showVolume: true,
      showMA: true,
      showBollingerBands: true,
      showRSI: true
    }
  },

  'ethereum': {
    id: 'ethereum',
    name: 'Ethereum (ETH/USD)',
    description: 'Ethereum price in US dollars',
    chartType: 'candlestick',
    indicatorId: 'ethereum',
    category: 'crypto',
    pillar: 3,
    priority: 14,
    color: '#00BFFF',
    yAxisLabel: 'Price',
    unit: '$',
    precision: 2,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true,
    displayOptions: {
      showVolume: true,
      showMA: true,
      showBollingerBands: true
    }
  },

  'gold': {
    id: 'gold',
    name: 'Gold Spot Price',
    description: 'Gold price per troy ounce in US dollars',
    chartType: 'line',
    indicatorId: 'gold',
    category: 'macro',
    pillar: 3,
    priority: 15,
    color: '#FFD700',
    yAxisLabel: 'Price',
    unit: '$/oz',
    precision: 2,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  // === MACRO INDICATORS ===
  'ism-pmi': {
    id: 'ism-pmi',
    name: 'ISM Manufacturing PMI',
    description: 'Institute for Supply Management manufacturing index',
    chartType: 'line',
    indicatorId: 'ism-pmi',
    category: 'macro',
    pillar: 2,
    priority: 16,
    color: '#FF00FF',
    yAxisLabel: 'PMI Value',
    unit: '',
    precision: 1,
    timeFrames: ['1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1m',
    aggregationSupported: false,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: false
  },

  // === TECHNICAL INDICATORS ===
  'enhanced-momentum': {
    id: 'enhanced-momentum',
    name: 'Enhanced Momentum Score',
    description: 'Proprietary momentum calculation across asset classes',
    chartType: 'line',
    indicatorId: 'enhanced-momentum',
    category: 'momentum',
    pillar: 'synthesis',
    priority: 17,
    color: '#32CD32',
    yAxisLabel: 'Momentum Score',
    unit: '',
    precision: 2,
    timeFrames: ['1h', '4h', '1d', '1w', '1m'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  // === ADDITIONAL LIQUIDITY METRICS ===
  'fed-balance-sheet': {
    id: 'fed-balance-sheet',
    name: 'Federal Reserve Balance Sheet',
    description: 'Total assets held by the Federal Reserve',
    chartType: 'area',
    indicatorId: 'fed-balance-sheet',
    category: 'liquidity',
    pillar: 1,
    priority: 18,
    color: '#00BFFF',
    yAxisLabel: 'USD Trillions',
    unit: '$T',
    precision: 2,
    timeFrames: ['1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1m',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  'ecb-balance-sheet': {
    id: 'ecb-balance-sheet',
    name: 'ECB Balance Sheet',
    description: 'European Central Bank total assets',
    chartType: 'area',
    indicatorId: 'ecb-balance-sheet',
    category: 'liquidity',
    pillar: 1,
    priority: 19,
    color: '#32CD32',
    yAxisLabel: 'EUR Trillions',
    unit: '€T',
    precision: 2,
    timeFrames: ['1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1m',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  'boj-balance-sheet': {
    id: 'boj-balance-sheet',
    name: 'Bank of Japan Balance Sheet',
    description: 'Bank of Japan total assets',
    chartType: 'area',
    indicatorId: 'boj-balance-sheet',
    category: 'liquidity',
    pillar: 1,
    priority: 20,
    color: '#FF4500',
    yAxisLabel: 'JPY Trillions',
    unit: '¥T',
    precision: 1,
    timeFrames: ['1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1m',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  }
};

// Chart category configurations
export const CHART_CATEGORIES = {
  liquidity: {
    name: 'Liquidity',
    color: '#00BFFF',
    icon: 'DollarSign',
    description: 'Global monetary flows and central bank operations'
  },
  momentum: {
    name: 'Momentum',
    color: '#32CD32',
    icon: 'TrendingUp',
    description: 'Market momentum and trend analysis'
  },
  volatility: {
    name: 'Volatility',
    color: '#FF4500',
    icon: 'Activity',
    description: 'Market volatility and risk measures'
  },
  sentiment: {
    name: 'Sentiment',
    color: '#FF00FF',
    icon: 'Zap',
    description: 'Market sentiment and stress indicators'
  },
  macro: {
    name: 'Macro',
    color: '#FFD700',
    icon: 'Globe',
    description: 'Macroeconomic indicators and fundamentals'
  },
  technical: {
    name: 'Technical',
    color: '#999999',
    icon: 'BarChart3',
    description: 'Technical analysis and data quality metrics'
  },
  crypto: {
    name: 'Crypto',
    color: '#FFD700',
    icon: 'Bitcoin',
    description: 'Cryptocurrency prices and metrics'
  }
} as const;

// Default chart layout configuration
export const DEFAULT_CHART_LAYOUT = {
  grid: {
    columns: 2,
    rows: 2,
    gap: 16
  },
  chart: {
    height: 400,
    margin: { top: 20, right: 30, bottom: 20, left: 40 },
    animation: true,
    responsive: true
  },
  toolbar: {
    position: 'top' as const,
    showTimeFrame: true,
    showFullscreen: true,
    showExport: true,
    showSettings: true
  }
};

// Helper functions
export const getChartsByCategory = (category: string): ChartConfig[] => {
  return Object.values(CHART_CONFIGS).filter(chart => chart.category === category);
};

export const getChartsByPillar = (pillar: number | string): ChartConfig[] => {
  return Object.values(CHART_CONFIGS).filter(chart => chart.pillar === pillar);
};

export const getChartConfig = (chartId: string): ChartConfig | undefined => {
  return CHART_CONFIGS[chartId];
};

export const getAllCategories = (): string[] => {
  return Array.from(new Set(Object.values(CHART_CONFIGS).map(chart => chart.category)));
};