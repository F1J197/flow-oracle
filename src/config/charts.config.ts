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
  },

  // === ADDITIONAL CRYPTO ASSETS ===
  'solana': {
    id: 'solana',
    name: 'Solana (SOL/USD)',
    description: 'Solana price in US dollars',
    chartType: 'candlestick',
    indicatorId: 'solana',
    category: 'crypto',
    pillar: 3,
    priority: 21,
    color: '#FF00FF',
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
    displayOptions: { showVolume: true, showMA: true }
  },

  'cardano': {
    id: 'cardano',
    name: 'Cardano (ADA/USD)',
    description: 'Cardano price in US dollars',
    chartType: 'candlestick',
    indicatorId: 'cardano',
    category: 'crypto',
    pillar: 3,
    priority: 22,
    color: '#32CD32',
    yAxisLabel: 'Price',
    unit: '$',
    precision: 4,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true,
    displayOptions: { showVolume: true, showMA: true }
  },

  'polygon': {
    id: 'polygon',
    name: 'Polygon (MATIC/USD)',
    description: 'Polygon price in US dollars',
    chartType: 'candlestick',
    indicatorId: 'polygon',
    category: 'crypto',
    pillar: 3,
    priority: 23,
    color: '#FFD700',
    yAxisLabel: 'Price',
    unit: '$',
    precision: 4,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true,
    displayOptions: { showVolume: true, showMA: true }
  },

  // === COMMODITIES ===
  'crude-oil': {
    id: 'crude-oil',
    name: 'Crude Oil (WTI)',
    description: 'West Texas Intermediate crude oil price per barrel',
    chartType: 'line',
    indicatorId: 'crude-oil',
    category: 'macro',
    pillar: 2,
    priority: 24,
    color: '#FF4500',
    yAxisLabel: 'Price',
    unit: '$/bbl',
    precision: 2,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  'silver': {
    id: 'silver',
    name: 'Silver Spot Price',
    description: 'Silver price per troy ounce in US dollars',
    chartType: 'line',
    indicatorId: 'silver',
    category: 'macro',
    pillar: 3,
    priority: 25,
    color: '#999999',
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

  'copper': {
    id: 'copper',
    name: 'Copper Futures',
    description: 'Copper futures price per pound',
    chartType: 'line',
    indicatorId: 'copper',
    category: 'macro',
    pillar: 2,
    priority: 26,
    color: '#FF4500',
    yAxisLabel: 'Price',
    unit: '$/lb',
    precision: 3,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  'natural-gas': {
    id: 'natural-gas',
    name: 'Natural Gas Futures',
    description: 'Natural gas futures price per MMBtu',
    chartType: 'line',
    indicatorId: 'natural-gas',
    category: 'macro',
    pillar: 2,
    priority: 27,
    color: '#00BFFF',
    yAxisLabel: 'Price',
    unit: '$/MMBtu',
    precision: 3,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  // === CURRENCIES ===
  'eur-usd': {
    id: 'eur-usd',
    name: 'EUR/USD Exchange Rate',
    description: 'Euro to US Dollar exchange rate',
    chartType: 'line',
    indicatorId: 'eur-usd',
    category: 'macro',
    pillar: 2,
    priority: 28,
    color: '#32CD32',
    yAxisLabel: 'Exchange Rate',
    unit: '',
    precision: 4,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  'gbp-usd': {
    id: 'gbp-usd',
    name: 'GBP/USD Exchange Rate',
    description: 'British Pound to US Dollar exchange rate',
    chartType: 'line',
    indicatorId: 'gbp-usd',
    category: 'macro',
    pillar: 2,
    priority: 29,
    color: '#FF00FF',
    yAxisLabel: 'Exchange Rate',
    unit: '',
    precision: 4,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  'usd-jpy': {
    id: 'usd-jpy',
    name: 'USD/JPY Exchange Rate',
    description: 'US Dollar to Japanese Yen exchange rate',
    chartType: 'line',
    indicatorId: 'usd-jpy',
    category: 'macro',
    pillar: 2,
    priority: 30,
    color: '#FFD700',
    yAxisLabel: 'Exchange Rate',
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

  'usd-cny': {
    id: 'usd-cny',
    name: 'USD/CNY Exchange Rate',
    description: 'US Dollar to Chinese Yuan exchange rate',
    chartType: 'line',
    indicatorId: 'usd-cny',
    category: 'macro',
    pillar: 2,
    priority: 31,
    color: '#FF4500',
    yAxisLabel: 'Exchange Rate',
    unit: '',
    precision: 4,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  // === EQUITY INDICES ===
  'sp500': {
    id: 'sp500',
    name: 'S&P 500 Index',
    description: 'Standard & Poor\'s 500 stock market index',
    chartType: 'line',
    indicatorId: 'sp500',
    category: 'macro',
    pillar: 2,
    priority: 32,
    color: '#00BFFF',
    yAxisLabel: 'Index Value',
    unit: '',
    precision: 2,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true,
    displayOptions: { showVolume: true, showMA: true }
  },

  'nasdaq': {
    id: 'nasdaq',
    name: 'NASDAQ Composite',
    description: 'NASDAQ Composite technology stock index',
    chartType: 'line',
    indicatorId: 'nasdaq',
    category: 'macro',
    pillar: 2,
    priority: 33,
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
    realtime: true,
    displayOptions: { showVolume: true, showMA: true }
  },

  'russell2000': {
    id: 'russell2000',
    name: 'Russell 2000 Index',
    description: 'Russell 2000 small-cap stock index',
    chartType: 'line',
    indicatorId: 'russell2000',
    category: 'macro',
    pillar: 2,
    priority: 34,
    color: '#FF00FF',
    yAxisLabel: 'Index Value',
    unit: '',
    precision: 2,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true,
    displayOptions: { showVolume: true, showMA: true }
  },

  // === ECONOMIC INDICATORS ===
  'unemployment-rate': {
    id: 'unemployment-rate',
    name: 'US Unemployment Rate',
    description: 'United States unemployment rate percentage',
    chartType: 'line',
    indicatorId: 'unemployment-rate',
    category: 'macro',
    pillar: 2,
    priority: 35,
    color: '#FF4500',
    yAxisLabel: 'Rate',
    unit: '%',
    precision: 1,
    timeFrames: ['1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1m',
    aggregationSupported: false,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: false
  },

  'inflation-rate': {
    id: 'inflation-rate',
    name: 'US Inflation Rate (CPI)',
    description: 'Consumer Price Index year-over-year change',
    chartType: 'line',
    indicatorId: 'inflation-rate',
    category: 'macro',
    pillar: 2,
    priority: 36,
    color: '#FFD700',
    yAxisLabel: 'Rate',
    unit: '%',
    precision: 1,
    timeFrames: ['1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1m',
    aggregationSupported: false,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: false
  },

  'gdp-growth': {
    id: 'gdp-growth',
    name: 'US GDP Growth Rate',
    description: 'Gross Domestic Product quarterly growth rate',
    chartType: 'line',
    indicatorId: 'gdp-growth',
    category: 'macro',
    pillar: 2,
    priority: 37,
    color: '#32CD32',
    yAxisLabel: 'Growth Rate',
    unit: '%',
    precision: 1,
    timeFrames: ['1m', '3m', '1y'],
    defaultTimeFrame: '3m',
    aggregationSupported: false,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: false
  },

  // === BOND YIELDS ===
  '2y-treasury': {
    id: '2y-treasury',
    name: '2-Year Treasury Yield',
    description: 'US 2-year Treasury bond yield',
    chartType: 'line',
    indicatorId: '2y-treasury',
    category: 'macro',
    pillar: 2,
    priority: 38,
    color: '#00BFFF',
    yAxisLabel: 'Yield',
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

  '10y-treasury': {
    id: '10y-treasury',
    name: '10-Year Treasury Yield',
    description: 'US 10-year Treasury bond yield',
    chartType: 'line',
    indicatorId: '10y-treasury',
    category: 'macro',
    pillar: 2,
    priority: 39,
    color: '#FF4500',
    yAxisLabel: 'Yield',
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

  '30y-treasury': {
    id: '30y-treasury',
    name: '30-Year Treasury Yield',
    description: 'US 30-year Treasury bond yield',
    chartType: 'line',
    indicatorId: '30y-treasury',
    category: 'macro',
    pillar: 2,
    priority: 40,
    color: '#32CD32',
    yAxisLabel: 'Yield',
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

  // === VOLATILITY INDICES ===
  'move-index': {
    id: 'move-index',
    name: 'MOVE Index (Bond Volatility)',
    description: 'Merrill Lynch Option Volatility Estimate for bonds',
    chartType: 'line',
    indicatorId: 'move-index',
    category: 'volatility',
    pillar: 2,
    priority: 41,
    color: '#FF00FF',
    yAxisLabel: 'Volatility',
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

  'rvx': {
    id: 'rvx',
    name: 'RVX (Russell 2000 Volatility)',
    description: 'CBOE Russell 2000 Volatility Index',
    chartType: 'line',
    indicatorId: 'rvx',
    category: 'volatility',
    pillar: 2,
    priority: 42,
    color: '#FFD700',
    yAxisLabel: 'Volatility',
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

  // === CRYPTO VOLATILITY ===
  'btc-volatility': {
    id: 'btc-volatility',
    name: 'Bitcoin Realized Volatility',
    description: 'Bitcoin 30-day realized volatility',
    chartType: 'line',
    indicatorId: 'btc-volatility',
    category: 'volatility',
    pillar: 3,
    priority: 43,
    color: '#FFD700',
    yAxisLabel: 'Volatility',
    unit: '%',
    precision: 2,
    timeFrames: ['1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1w',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  // === CREDIT SPREADS ===
  'high-yield-spread': {
    id: 'high-yield-spread',
    name: 'High Yield Credit Spread',
    description: 'High yield bond option-adjusted spread',
    chartType: 'line',
    indicatorId: 'high-yield-spread',
    category: 'sentiment',
    pillar: 2,
    priority: 44,
    color: '#FF4500',
    yAxisLabel: 'Spread',
    unit: 'bps',
    precision: 2,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  'investment-grade-spread': {
    id: 'investment-grade-spread',
    name: 'Investment Grade Credit Spread',
    description: 'Investment grade bond option-adjusted spread',
    chartType: 'line',
    indicatorId: 'investment-grade-spread',
    category: 'sentiment',
    pillar: 2,
    priority: 45,
    color: '#00BFFF',
    yAxisLabel: 'Spread',
    unit: 'bps',
    precision: 2,
    timeFrames: ['1h', '4h', '1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1d',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  // === MONEY MARKET ===
  'fed-funds-rate': {
    id: 'fed-funds-rate',
    name: 'Federal Funds Rate',
    description: 'Federal Reserve target interest rate',
    chartType: 'line',
    indicatorId: 'fed-funds-rate',
    category: 'liquidity',
    pillar: 1,
    priority: 46,
    color: '#32CD32',
    yAxisLabel: 'Rate',
    unit: '%',
    precision: 3,
    timeFrames: ['1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1m',
    aggregationSupported: false,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: false
  },

  'sofr': {
    id: 'sofr',
    name: 'SOFR (Secured Overnight Financing Rate)',
    description: 'Secured Overnight Financing Rate',
    chartType: 'line',
    indicatorId: 'sofr',
    category: 'liquidity',
    pillar: 1,
    priority: 47,
    color: '#FFD700',
    yAxisLabel: 'Rate',
    unit: '%',
    precision: 3,
    timeFrames: ['1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1w',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  // === TECHNICAL/HEATMAP CHARTS ===
  'global-liquidity-heatmap': {
    id: 'global-liquidity-heatmap',
    name: 'Global Liquidity Heatmap',
    description: 'Regional liquidity conditions visualization',
    chartType: 'heatmap',
    indicatorId: 'global-liquidity-heatmap',
    category: 'liquidity',
    pillar: 'synthesis',
    priority: 48,
    color: '#00BFFF',
    yAxisLabel: 'Region',
    unit: '',
    precision: 2,
    timeFrames: ['1d', '1w', '1m'],
    defaultTimeFrame: '1d',
    aggregationSupported: false,
    overlaySupported: false,
    zoomable: false,
    crosshairSync: false,
    realtime: true
  },

  'sector-momentum-scatter': {
    id: 'sector-momentum-scatter',
    name: 'Sector Momentum Scatter',
    description: 'Risk vs return scatter plot by sector',
    chartType: 'scatter',
    indicatorId: 'sector-momentum-scatter',
    category: 'momentum',
    pillar: 'synthesis',
    priority: 49,
    color: '#32CD32',
    yAxisLabel: 'Return',
    unit: '%',
    precision: 2,
    timeFrames: ['1d', '1w', '1m'],
    defaultTimeFrame: '1w',
    aggregationSupported: false,
    overlaySupported: false,
    zoomable: true,
    crosshairSync: false,
    realtime: true
  },

  // === CRYPTO ON-CHAIN METRICS ===
  'btc-network-value': {
    id: 'btc-network-value',
    name: 'Bitcoin Network Value to Transactions',
    description: 'NVT ratio - network value vs transaction volume',
    chartType: 'line',
    indicatorId: 'btc-network-value',
    category: 'crypto',
    pillar: 3,
    priority: 50,
    color: '#FFD700',
    yAxisLabel: 'NVT Ratio',
    unit: '',
    precision: 2,
    timeFrames: ['1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1w',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  'btc-mvrv': {
    id: 'btc-mvrv',
    name: 'Bitcoin MVRV Ratio',
    description: 'Market Value to Realized Value ratio',
    chartType: 'line',
    indicatorId: 'btc-mvrv',
    category: 'crypto',
    pillar: 3,
    priority: 51,
    color: '#FF00FF',
    yAxisLabel: 'MVRV',
    unit: '',
    precision: 2,
    timeFrames: ['1d', '1w', '1m', '3m', '1y'],
    defaultTimeFrame: '1w',
    aggregationSupported: true,
    overlaySupported: true,
    zoomable: true,
    crosshairSync: true,
    realtime: true
  },

  'eth-gas-fees': {
    id: 'eth-gas-fees',
    name: 'Ethereum Gas Fees',
    description: 'Average Ethereum transaction gas fees',
    chartType: 'area',
    indicatorId: 'eth-gas-fees',
    category: 'crypto',
    pillar: 3,
    priority: 52,
    color: '#00BFFF',
    yAxisLabel: 'Gas Price',
    unit: 'gwei',
    precision: 2,
    timeFrames: ['1h', '4h', '1d', '1w', '1m'],
    defaultTimeFrame: '1d',
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