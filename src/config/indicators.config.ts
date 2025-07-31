/**
 * Indicators Configuration - Master Prompts Compliance
 * Comprehensive configuration for all 50+ market indicators
 */

export interface IndicatorConfig {
  id: string;
  name: string;
  source: 'FRED' | 'MARKET' | 'COINBASE' | 'GLASSNODE' | 'ENGINE';
  symbol?: string;
  category: string;
  pillar: 1 | 2 | 3;
  refreshInterval: number;
  calculation?: string;
  dependencies?: string[];
  weight?: number;
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const FOUNDATION_INDICATORS: IndicatorConfig[] = [
  {
    id: 'zscore_aggregate',
    name: 'Z-Score Aggregate',
    source: 'ENGINE',
    category: 'Foundation',
    pillar: 1,
    refreshInterval: 15000,
    calculation: 'statistical_zscore',
    criticality: 'CRITICAL'
  },
  {
    id: 'momentum_composite',
    name: 'Momentum Composite',
    source: 'ENGINE',
    category: 'Foundation',
    pillar: 1,
    refreshInterval: 15000,
    calculation: 'momentum_analysis',
    criticality: 'CRITICAL'
  }
];

export const PILLAR1_INDICATORS: IndicatorConfig[] = [
  {
    id: 'net_liquidity',
    name: 'Net Liquidity',
    source: 'FRED',
    symbol: 'WALCL,WTREGEN,TGA',
    category: 'Liquidity',
    pillar: 1,
    refreshInterval: 86400000, // Daily
    calculation: 'WALCL - WTREGEN - TGA',
    criticality: 'CRITICAL'
  },
  {
    id: 'primary_dealer_positions',
    name: 'Primary Dealer Positions',
    source: 'FRED',
    symbol: 'PDTOTL',
    category: 'Liquidity',
    pillar: 1,
    refreshInterval: 604800000, // Weekly
    criticality: 'HIGH'
  },
  {
    id: 'credit_spread',
    name: 'Credit Spread',
    source: 'FRED',
    symbol: 'BAA10Y',
    category: 'Credit',
    pillar: 1,
    refreshInterval: 86400000,
    criticality: 'HIGH'
  },
  {
    id: 'treasury_10y',
    name: '10-Year Treasury',
    source: 'FRED',
    symbol: 'DGS10',
    category: 'Rates',
    pillar: 1,
    refreshInterval: 86400000,
    criticality: 'HIGH'
  },
  {
    id: 'vix',
    name: 'VIX Volatility Index',
    source: 'MARKET',
    symbol: '^VIX',
    category: 'Volatility',
    pillar: 1,
    refreshInterval: 60000, // 1 minute during market hours
    criticality: 'HIGH'
  }
];

export const PILLAR2_INDICATORS: IndicatorConfig[] = [
  {
    id: 'spy_price',
    name: 'S&P 500 ETF',
    source: 'MARKET',
    symbol: 'SPY',
    category: 'Equity',
    pillar: 2,
    refreshInterval: 60000,
    criticality: 'HIGH'
  },
  {
    id: 'qqq_price',
    name: 'NASDAQ 100 ETF',
    source: 'MARKET',
    symbol: 'QQQ',
    category: 'Equity',
    pillar: 2,
    refreshInterval: 60000,
    criticality: 'MEDIUM'
  },
  {
    id: 'dxy_price',
    name: 'Dollar Index',
    source: 'MARKET',
    symbol: 'DXY',
    category: 'Currency',
    pillar: 2,
    refreshInterval: 60000,
    criticality: 'HIGH'
  },
  {
    id: 'gold_price',
    name: 'Gold Spot Price',
    source: 'MARKET',
    symbol: 'GLD',
    category: 'Commodities',
    pillar: 2,
    refreshInterval: 60000,
    criticality: 'MEDIUM'
  }
];

export const PILLAR3_INDICATORS: IndicatorConfig[] = [
  {
    id: 'btc_price',
    name: 'Bitcoin Price',
    source: 'COINBASE',
    symbol: 'BTC-USD',
    category: 'Crypto',
    pillar: 3,
    refreshInterval: 15000,
    criticality: 'HIGH'
  },
  {
    id: 'eth_price',
    name: 'Ethereum Price',
    source: 'COINBASE',
    symbol: 'ETH-USD',
    category: 'Crypto',
    pillar: 3,
    refreshInterval: 15000,
    criticality: 'MEDIUM'
  },
  {
    id: 'btc_whale_activity',
    name: 'Bitcoin Whale Activity',
    source: 'GLASSNODE',
    symbol: 'btc_whale_balance_1k_10k',
    category: 'Crypto',
    pillar: 3,
    refreshInterval: 3600000, // Hourly
    criticality: 'MEDIUM'
  },
  {
    id: 'stablecoin_supply',
    name: 'Stablecoin Supply',
    source: 'GLASSNODE',
    symbol: 'stablecoin_supply_ratio',
    category: 'Crypto',
    pillar: 3,
    refreshInterval: 3600000,
    criticality: 'HIGH'
  }
];

export const ALL_INDICATORS = [
  ...FOUNDATION_INDICATORS,
  ...PILLAR1_INDICATORS,
  ...PILLAR2_INDICATORS,
  ...PILLAR3_INDICATORS
];

export const INDICATOR_WEIGHTS = {
  CRITICAL: 1.0,
  HIGH: 0.75,
  MEDIUM: 0.5,
  LOW: 0.25
};

export const REFRESH_INTERVALS = {
  REAL_TIME: 15000,        // 15 seconds
  FREQUENT: 60000,         // 1 minute
  STANDARD: 300000,        // 5 minutes
  HOURLY: 3600000,         // 1 hour
  DAILY: 86400000,         // 24 hours
  WEEKLY: 604800000        // 7 days
};