/**
 * Master Prompts Compliant Indicators Configuration - V6 Implementation
 * Complete indicator definitions for all 50+ market indicators
 */

export interface MasterPromptIndicatorConfig {
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
}

// Foundation Indicators (Data Integrity & Z-Score Base)
export const FOUNDATION_INDICATORS: MasterPromptIndicatorConfig[] = [
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
    tags: ['foundation', 'integrity', 'system']
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
    tags: ['foundation', 'zscore', 'statistical']
  }
];

// Pillar 1: Central Bank & Government Liquidity Indicators
export const PILLAR1_INDICATORS: MasterPromptIndicatorConfig[] = [
  // Federal Reserve Balance Sheet
  {
    id: 'fed-balance-sheet',
    name: 'Federal Reserve Balance Sheet',
    symbol: 'WALCL',
    source: 'FRED',
    category: 'central-bank',
    pillar: 1,
    refreshInterval: 3600000, // Weekly data
    criticality: 'CRITICAL',
    unit: 'Billions USD',
    description: 'Total assets held by the Federal Reserve',
    tags: ['fed', 'balance-sheet', 'liquidity']
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
    tags: ['treasury', 'government', 'liquidity']
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
    tags: ['fed', 'repo', 'liquidity-drain']
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
    tags: ['net-liquidity', 'calculated', 'primary']
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
    tags: ['fed', 'rates', 'policy']
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
    tags: ['treasury', 'rates', 'long-term']
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
    tags: ['treasury', 'rates', 'short-term']
  },
  {
    id: '5y-treasury-yield',
    name: '5-Year Treasury Yield',
    symbol: 'GS5',
    source: 'FRED',
    category: 'rates',
    pillar: 1,
    refreshInterval: 3600000,
    criticality: 'HIGH',
    unit: '%',
    description: '5-Year Treasury constant maturity rate',
    tags: ['treasury', 'rates', 'medium-term']
  },
  {
    id: '30y-treasury-yield',
    name: '30-Year Treasury Yield',
    symbol: 'GS30',
    source: 'FRED',
    category: 'rates',
    pillar: 1,
    refreshInterval: 3600000,
    criticality: 'MEDIUM',
    unit: '%',
    description: '30-Year Treasury constant maturity rate',
    tags: ['treasury', 'rates', 'ultra-long']
  },

  // Credit & Corporate Bonds
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
    tags: ['credit', 'spreads', 'risk']
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
    tags: ['credit', 'spreads', 'corporate']
  },

  // Economic Indicators
  {
    id: 'unemployment-rate',
    name: 'Unemployment Rate',
    symbol: 'UNRATE',
    source: 'FRED',
    category: 'employment',
    pillar: 1,
    refreshInterval: 2592000000, // Monthly
    criticality: 'MEDIUM',
    unit: '%',
    description: 'Civilian unemployment rate',
    tags: ['employment', 'labor', 'economy']
  },
  {
    id: 'cpi-inflation',
    name: 'Consumer Price Index',
    symbol: 'CPIAUCSL',
    source: 'FRED',
    category: 'inflation',
    pillar: 1,
    refreshInterval: 2592000000, // Monthly
    criticality: 'HIGH',
    unit: 'Index',
    description: 'Consumer Price Index for All Urban Consumers',
    tags: ['inflation', 'prices', 'consumer']
  },
  {
    id: 'pce-inflation',
    name: 'PCE Price Index',
    symbol: 'PCEPI',
    source: 'FRED',
    category: 'inflation',
    pillar: 1,
    refreshInterval: 2592000000, // Monthly
    criticality: 'HIGH',
    unit: 'Index',
    description: 'Personal Consumption Expenditures Price Index',
    tags: ['inflation', 'pce', 'fed-preferred']
  },
  {
    id: 'gdp',
    name: 'Gross Domestic Product',
    symbol: 'GDP',
    source: 'FRED',
    category: 'growth',
    pillar: 1,
    refreshInterval: 7776000000, // Quarterly
    criticality: 'MEDIUM',
    unit: 'Billions USD',
    description: 'Real Gross Domestic Product',
    tags: ['gdp', 'growth', 'economy']
  }
];

// Pillar 2: Equity, Currency & Commodity Indicators
export const PILLAR2_INDICATORS: MasterPromptIndicatorConfig[] = [
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
    tags: ['equity', 'large-cap', 'us-market']
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
    tags: ['equity', 'tech', 'growth']
  },
  {
    id: 'russell-2000',
    name: 'Russell 2000',
    symbol: 'RU2000PR',
    source: 'FRED',
    category: 'equity',
    pillar: 2,
    refreshInterval: 86400000,
    criticality: 'MEDIUM',
    unit: 'Index',
    description: 'Russell 2000 small-cap index',
    tags: ['equity', 'small-cap', 'risk']
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
    tags: ['volatility', 'fear', 'options']
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
    tags: ['currency', 'dollar', 'trade-weighted']
  },
  {
    id: 'eur-usd',
    name: 'EUR/USD Exchange Rate',
    symbol: 'DEXUSEU',
    source: 'FRED',
    category: 'currency',
    pillar: 2,
    refreshInterval: 86400000,
    criticality: 'MEDIUM',
    unit: 'Rate',
    description: 'Euro to US Dollar exchange rate',
    tags: ['currency', 'eur', 'major-pair']
  },
  {
    id: 'jpy-usd',
    name: 'JPY/USD Exchange Rate',
    symbol: 'DEXJPUS',
    source: 'FRED',
    category: 'currency',
    pillar: 2,
    refreshInterval: 86400000,
    criticality: 'MEDIUM',
    unit: 'Rate',
    description: 'Japanese Yen to US Dollar exchange rate',
    tags: ['currency', 'jpy', 'carry-trade']
  },

  // Commodities
  {
    id: 'wti-crude',
    name: 'WTI Crude Oil',
    symbol: 'DCOILWTICO',
    source: 'FRED',
    category: 'commodities',
    pillar: 2,
    refreshInterval: 86400000,
    criticality: 'MEDIUM',
    unit: 'USD/Barrel',
    description: 'West Texas Intermediate crude oil price',
    tags: ['oil', 'energy', 'commodities']
  },
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
    tags: ['gold', 'precious-metals', 'safe-haven']
  },
  {
    id: 'copper',
    name: 'Copper Price',
    symbol: 'PCOPPUSDM',
    source: 'FRED',
    category: 'commodities',
    pillar: 2,
    refreshInterval: 86400000,
    criticality: 'LOW',
    unit: 'USD/MT',
    description: 'Global price of copper',
    tags: ['copper', 'industrial', 'growth']
  }
];

// Pillar 3: Cryptocurrency & Alternative Assets
export const PILLAR3_INDICATORS: MasterPromptIndicatorConfig[] = [
  // Bitcoin Metrics
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
    tags: ['bitcoin', 'crypto', 'digital-gold']
  },
  {
    id: 'btc-market-cap',
    name: 'Bitcoin Market Cap',
    symbol: 'BTC_MARKET_CAP',
    source: 'GLASSNODE',
    category: 'crypto',
    pillar: 3,
    refreshInterval: 3600000,
    criticality: 'HIGH',
    unit: 'USD',
    description: 'Bitcoin total market capitalization',
    tags: ['bitcoin', 'market-cap', 'valuation']
  },
  {
    id: 'btc-realized-cap',
    name: 'Bitcoin Realized Cap',
    symbol: 'BTC_REALIZED_CAP',
    source: 'GLASSNODE',
    category: 'crypto',
    pillar: 3,
    refreshInterval: 86400000,
    criticality: 'MEDIUM',
    unit: 'USD',
    description: 'Bitcoin realized capitalization',
    tags: ['bitcoin', 'on-chain', 'valuation']
  },
  {
    id: 'btc-mvrv',
    name: 'Bitcoin MVRV Ratio',
    symbol: 'BTC_MVRV',
    source: 'GLASSNODE',
    category: 'crypto',
    pillar: 3,
    refreshInterval: 86400000,
    criticality: 'MEDIUM',
    unit: 'Ratio',
    description: 'Market Value to Realized Value ratio',
    tags: ['bitcoin', 'mvrv', 'cycle-indicator']
  },
  {
    id: 'btc-nvt',
    name: 'Bitcoin NVT Ratio',
    symbol: 'BTC_NVT',
    source: 'GLASSNODE',
    category: 'crypto',
    pillar: 3,
    refreshInterval: 86400000,
    criticality: 'LOW',
    unit: 'Ratio',
    description: 'Network Value to Transactions ratio',
    tags: ['bitcoin', 'nvt', 'valuation']
  },
  {
    id: 'btc-puell-multiple',
    name: 'Bitcoin Puell Multiple',
    symbol: 'BTC_PUELL',
    source: 'GLASSNODE',
    category: 'crypto',
    pillar: 3,
    refreshInterval: 86400000,
    criticality: 'LOW',
    unit: 'Ratio',
    description: 'Bitcoin Puell Multiple cycle indicator',
    tags: ['bitcoin', 'puell', 'mining']
  },

  // Ethereum Metrics
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
    tags: ['ethereum', 'crypto', 'smart-contracts']
  },
  {
    id: 'eth-market-cap',
    name: 'Ethereum Market Cap',
    symbol: 'ETH_MARKET_CAP',
    source: 'GLASSNODE',
    category: 'crypto',
    pillar: 3,
    refreshInterval: 3600000,
    criticality: 'MEDIUM',
    unit: 'USD',
    description: 'Ethereum total market capitalization',
    tags: ['ethereum', 'market-cap', 'defi']
  },

  // Additional Crypto Assets
  {
    id: 'solana',
    name: 'Solana (SOL/USD)',
    symbol: 'SOL-USD',
    source: 'COINBASE',
    category: 'crypto',
    pillar: 3,
    refreshInterval: 15000,
    criticality: 'MEDIUM',
    unit: 'USD',
    description: 'Solana spot price in USD',
    tags: ['solana', 'crypto', 'layer1']
  },
  {
    id: 'cardano',
    name: 'Cardano (ADA/USD)',
    symbol: 'ADA-USD',
    source: 'COINBASE',
    category: 'crypto',
    pillar: 3,
    refreshInterval: 15000,
    criticality: 'LOW',
    unit: 'USD',
    description: 'Cardano spot price in USD',
    tags: ['cardano', 'crypto', 'proof-of-stake']
  },
  {
    id: 'polygon',
    name: 'Polygon (MATIC/USD)',
    symbol: 'MATIC-USD',
    source: 'COINBASE',
    category: 'crypto',
    pillar: 3,
    refreshInterval: 15000,
    criticality: 'LOW',
    unit: 'USD',
    description: 'Polygon spot price in USD',
    tags: ['polygon', 'crypto', 'layer2']
  },

  // Additional Crypto Metrics
  {
    id: 'btc-network-value',
    name: 'Bitcoin Network Value to Transactions',
    symbol: 'BTC_NVT',
    source: 'GLASSNODE',
    category: 'crypto',
    pillar: 3,
    refreshInterval: 86400000,
    criticality: 'LOW',
    unit: 'Ratio',
    description: 'Bitcoin network value to transaction volume ratio',
    tags: ['bitcoin', 'nvt', 'on-chain']
  },
  {
    id: 'btc-volatility',
    name: 'Bitcoin Realized Volatility',
    symbol: 'BTC_VOLATILITY_30D',
    source: 'GLASSNODE',
    category: 'volatility',
    pillar: 3,
    refreshInterval: 86400000,
    criticality: 'MEDIUM',
    unit: '%',
    description: 'Bitcoin 30-day realized volatility',
    tags: ['bitcoin', 'volatility', 'risk']
  },
  {
    id: 'eth-gas-fees',
    name: 'Ethereum Average Gas Price',
    symbol: 'ETH_GAS_PRICE',
    source: 'GLASSNODE',
    category: 'crypto',
    pillar: 3,
    refreshInterval: 3600000,
    criticality: 'MEDIUM',
    unit: 'gwei',
    description: 'Average Ethereum transaction gas price',
    tags: ['ethereum', 'gas', 'fees']
  },

  // Commodities & Currencies Missing from Charts
  {
    id: 'crude-oil',
    name: 'Crude Oil (WTI)',
    symbol: 'DCOILWTICO',
    source: 'FRED',
    category: 'commodities',
    pillar: 2,
    refreshInterval: 86400000,
    criticality: 'MEDIUM',
    unit: 'USD/bbl',
    description: 'West Texas Intermediate crude oil price',
    tags: ['oil', 'energy', 'commodities']
  },
  {
    id: 'silver',
    name: 'Silver Price',
    symbol: 'SLVPRUSD',
    source: 'FRED',
    category: 'commodities',
    pillar: 2,
    refreshInterval: 86400000,
    criticality: 'LOW',
    unit: 'USD/oz',
    description: 'Silver spot price per ounce',
    tags: ['silver', 'precious-metals', 'commodities']
  },
  {
    id: 'natural-gas',
    name: 'Natural Gas Futures',
    symbol: 'DHHNGSP',
    source: 'FRED',
    category: 'commodities',
    pillar: 2,
    refreshInterval: 86400000,
    criticality: 'LOW',
    unit: 'USD/MMBtu',
    description: 'Natural gas futures price',
    tags: ['gas', 'energy', 'commodities']
  },

  // Exchange Rates
  {
    id: 'gbp-usd',
    name: 'GBP/USD Exchange Rate',
    symbol: 'DEXUSUK',
    source: 'FRED',
    category: 'currency',
    pillar: 2,
    refreshInterval: 86400000,
    criticality: 'MEDIUM',
    unit: 'Rate',
    description: 'British Pound to US Dollar exchange rate',
    tags: ['currency', 'gbp', 'major-pair']
  },
  {
    id: 'usd-jpy',
    name: 'USD/JPY Exchange Rate',
    symbol: 'DEXJPUS',
    source: 'FRED',
    category: 'currency',
    pillar: 2,
    refreshInterval: 86400000,
    criticality: 'MEDIUM',
    unit: 'Rate',
    description: 'US Dollar to Japanese Yen exchange rate',
    tags: ['currency', 'jpy', 'carry-trade']
  },
  {
    id: 'usd-cny',
    name: 'USD/CNY Exchange Rate',
    symbol: 'DEXCHUS',
    source: 'FRED',
    category: 'currency',
    pillar: 2,
    refreshInterval: 86400000,
    criticality: 'MEDIUM',
    unit: 'Rate',
    description: 'US Dollar to Chinese Yuan exchange rate',
    tags: ['currency', 'cny', 'emerging']
  },

  // Missing Engine Indicators
  {
    id: 'enhanced-momentum',
    name: 'Enhanced Momentum Score',
    symbol: 'ENHANCED_MOMENTUM',
    source: 'ENGINE',
    category: 'momentum',
    pillar: 'foundation',
    refreshInterval: 30000,
    criticality: 'HIGH',
    unit: 'Score',
    description: 'Proprietary momentum calculation across asset classes',
    tags: ['momentum', 'synthesis', 'engine']
  },
  {
    id: 'credit-stress',
    name: 'Credit Stress Index',
    symbol: 'CREDIT_STRESS',
    source: 'ENGINE',
    category: 'sentiment',
    pillar: 2,
    refreshInterval: 86400000,
    criticality: 'HIGH',
    unit: 'bps',
    description: 'Aggregate credit market stress indicator',
    transformFunction: 'aggregateCreditSpreads',
    dependencies: ['high-yield-spread', 'investment-grade-spread'],
    tags: ['credit', 'stress', 'risk']
  },
  {
    id: 'primary-dealer-positions',
    name: 'Primary Dealer Net Positions',
    symbol: 'DEALER_POSITIONS',
    source: 'ENGINE',
    category: 'liquidity',
    pillar: 1,
    refreshInterval: 604800000, // Weekly
    criticality: 'CRITICAL',
    unit: 'Trillions USD',
    description: 'Aggregate primary dealer securities positions',
    tags: ['dealers', 'positions', 'liquidity']
  },
  {
    id: 'dealer-leverage',
    name: 'Primary Dealer Leverage',
    symbol: 'DEALER_LEVERAGE',
    source: 'ENGINE',
    category: 'liquidity',
    pillar: 1,
    refreshInterval: 604800000, // Weekly
    criticality: 'HIGH',
    unit: 'Multiple',
    description: 'Primary dealer financial leverage ratio',
    tags: ['dealers', 'leverage', 'risk']
  },

  // Crypto Market Indicators
  {
    id: 'total-crypto-market-cap',
    name: 'Total Crypto Market Cap',
    symbol: 'TOTAL_CRYPTO_MC',
    source: 'MARKET',
    category: 'crypto',
    pillar: 3,
    refreshInterval: 3600000,
    criticality: 'MEDIUM',
    unit: 'USD',
    description: 'Total cryptocurrency market capitalization',
    tags: ['crypto', 'total-market', 'adoption']
  },
  {
    id: 'crypto-fear-greed',
    name: 'Crypto Fear & Greed Index',
    symbol: 'CRYPTO_FG',
    source: 'MARKET',
    category: 'sentiment',
    pillar: 3,
    refreshInterval: 86400000,
    criticality: 'LOW',
    unit: 'Index',
    description: 'Crypto market fear and greed sentiment index',
    tags: ['crypto', 'sentiment', 'fear-greed']
  }
];

// Combined All Indicators
export const ALL_MASTER_PROMPT_INDICATORS: MasterPromptIndicatorConfig[] = [
  ...FOUNDATION_INDICATORS,
  ...PILLAR1_INDICATORS,
  ...PILLAR2_INDICATORS,
  ...PILLAR3_INDICATORS
];

// Indicator Categories
export const INDICATOR_CATEGORIES = {
  FOUNDATION: ['foundation'],
  CENTRAL_BANK: ['central-bank', 'treasury', 'monetary-ops'],
  RATES: ['rates'],
  CREDIT: ['credit'],
  ECONOMIC: ['employment', 'inflation', 'growth'],
  EQUITY: ['equity', 'volatility'],
  CURRENCY: ['currency'],
  COMMODITIES: ['commodities'],
  CRYPTO: ['crypto', 'sentiment']
} as const;

// Pillar Mappings
export const PILLAR_MAPPINGS = {
  FOUNDATION: 'foundation',
  LIQUIDITY: 1,
  MARKETS: 2,
  CRYPTO: 3
} as const;

// Criticality Weights
export const CRITICALITY_WEIGHTS = {
  CRITICAL: 100,
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25
} as const;

// Refresh Intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  REAL_TIME: 15000,      // 15 seconds
  FREQUENT: 300000,      // 5 minutes
  HOURLY: 3600000,       // 1 hour
  DAILY: 86400000,       // 24 hours
  WEEKLY: 604800000,     // 7 days
  MONTHLY: 2592000000,   // 30 days
  QUARTERLY: 7776000000  // 90 days
} as const;

/**
 * Get indicators by pillar
 */
export function getIndicatorsByPillar(pillar: 1 | 2 | 3 | 'foundation'): MasterPromptIndicatorConfig[] {
  return ALL_MASTER_PROMPT_INDICATORS.filter(indicator => indicator.pillar === pillar);
}

/**
 * Get indicators by category
 */
export function getIndicatorsByCategory(category: string): MasterPromptIndicatorConfig[] {
  return ALL_MASTER_PROMPT_INDICATORS.filter(indicator => indicator.category === category);
}

/**
 * Get indicators by criticality
 */
export function getIndicatorsByCriticality(criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'): MasterPromptIndicatorConfig[] {
  return ALL_MASTER_PROMPT_INDICATORS.filter(indicator => indicator.criticality === criticality);
}

/**
 * Get indicators by source
 */
export function getIndicatorsBySource(source: MasterPromptIndicatorConfig['source']): MasterPromptIndicatorConfig[] {
  return ALL_MASTER_PROMPT_INDICATORS.filter(indicator => indicator.source === source);
}

export default {
  ALL_MASTER_PROMPT_INDICATORS,
  FOUNDATION_INDICATORS,
  PILLAR1_INDICATORS,
  PILLAR2_INDICATORS,
  PILLAR3_INDICATORS,
  INDICATOR_CATEGORIES,
  PILLAR_MAPPINGS,
  CRITICALITY_WEIGHTS,
  REFRESH_INTERVALS,
  getIndicatorsByPillar,
  getIndicatorsByCategory,
  getIndicatorsByCriticality,
  getIndicatorsBySource
};