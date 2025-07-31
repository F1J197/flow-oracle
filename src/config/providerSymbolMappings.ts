/**
 * Comprehensive Provider Symbol Mappings
 * Maps Master Prompt indicator IDs to provider-specific symbols
 */

export interface ProviderMapping {
  indicatorId: string;
  providerSymbol: string;
  endpoint?: string;
  parameters?: Record<string, any>;
  transformFunction?: string;
}

// FRED Symbol Mappings
export const FRED_SYMBOL_MAPPINGS: Record<string, ProviderMapping> = {
  // Balance Sheet & Liquidity
  'fed-balance-sheet': {
    indicatorId: 'fed-balance-sheet',
    providerSymbol: 'WALCL',
    endpoint: '/observations'
  },
  'treasury-general-account': {
    indicatorId: 'treasury-general-account',
    providerSymbol: 'WTREGEN',
    endpoint: '/observations'
  },
  'reverse-repo-operations': {
    indicatorId: 'reverse-repo-operations',
    providerSymbol: 'RRPONTSYD',
    endpoint: '/observations'
  },
  
  // Interest Rates & Yields
  'federal-funds-rate': {
    indicatorId: 'federal-funds-rate',
    providerSymbol: 'DFF',
    endpoint: '/observations'
  },
  '10y-treasury-yield': {
    indicatorId: '10y-treasury-yield',
    providerSymbol: 'GS10',
    endpoint: '/observations'
  },
  '2y-treasury-yield': {
    indicatorId: '2y-treasury-yield',
    providerSymbol: 'GS2',
    endpoint: '/observations'
  },
  '5y-treasury-yield': {
    indicatorId: '5y-treasury-yield',
    providerSymbol: 'GS5',
    endpoint: '/observations'
  },
  '30y-treasury-yield': {
    indicatorId: '30y-treasury-yield',
    providerSymbol: 'GS30',
    endpoint: '/observations'
  },
  
  // Credit Spreads
  'high-yield-spread': {
    indicatorId: 'high-yield-spread',
    providerSymbol: 'BAMLH0A0HYM2',
    endpoint: '/observations'
  },
  'investment-grade-spread': {
    indicatorId: 'investment-grade-spread',
    providerSymbol: 'BAMLC0A0CM',
    endpoint: '/observations'
  },
  
  // Economic Indicators
  'unemployment-rate': {
    indicatorId: 'unemployment-rate',
    providerSymbol: 'UNRATE',
    endpoint: '/observations'
  },
  'cpi-inflation': {
    indicatorId: 'cpi-inflation',
    providerSymbol: 'CPIAUCSL',
    endpoint: '/observations'
  },
  'pce-inflation': {
    indicatorId: 'pce-inflation',
    providerSymbol: 'PCEPI',
    endpoint: '/observations'
  },
  'gdp': {
    indicatorId: 'gdp',
    providerSymbol: 'GDP',
    endpoint: '/observations'
  },
  
  // Equity Markets
  'sp500': {
    indicatorId: 'sp500',
    providerSymbol: 'SP500',
    endpoint: '/observations'
  },
  'nasdaq': {
    indicatorId: 'nasdaq',
    providerSymbol: 'NASDAQCOM',
    endpoint: '/observations'
  },
  'russell-2000': {
    indicatorId: 'russell-2000',
    providerSymbol: 'RU2000PR',
    endpoint: '/observations'
  },
  'vix': {
    indicatorId: 'vix',
    providerSymbol: 'VIXCLS',
    endpoint: '/observations'
  },
  
  // Currency Markets
  'dxy': {
    indicatorId: 'dxy',
    providerSymbol: 'DTWEXBGS',
    endpoint: '/observations'
  },
  'eur-usd': {
    indicatorId: 'eur-usd',
    providerSymbol: 'DEXUSEU',
    endpoint: '/observations'
  },
  'jpy-usd': {
    indicatorId: 'jpy-usd',
    providerSymbol: 'DEXJPUS',
    endpoint: '/observations'
  },
  'gbp-usd': {
    indicatorId: 'gbp-usd',
    providerSymbol: 'DEXUSUK',
    endpoint: '/observations'
  },
  'usd-jpy': {
    indicatorId: 'usd-jpy',
    providerSymbol: 'DEXJPUS',
    endpoint: '/observations',
    transformFunction: 'invertRate'
  },
  'usd-cny': {
    indicatorId: 'usd-cny',
    providerSymbol: 'DEXCHUS',
    endpoint: '/observations'
  },
  
  // Commodities
  'wti-crude': {
    indicatorId: 'wti-crude',
    providerSymbol: 'DCOILWTICO',
    endpoint: '/observations'
  },
  'crude-oil': {
    indicatorId: 'crude-oil',
    providerSymbol: 'DCOILWTICO',
    endpoint: '/observations'
  },
  'gold': {
    indicatorId: 'gold',
    providerSymbol: 'GOLDAMGBD228NLBM',
    endpoint: '/observations'
  },
  'copper': {
    indicatorId: 'copper',
    providerSymbol: 'PCOPPUSDM',
    endpoint: '/observations'
  },
  'silver': {
    indicatorId: 'silver',
    providerSymbol: 'SLVPRUSD',
    endpoint: '/observations'
  },
  'natural-gas': {
    indicatorId: 'natural-gas',
    providerSymbol: 'DHHNGSP',
    endpoint: '/observations'
  }
};

// CoinGecko Symbol Mappings
export const COINGECKO_SYMBOL_MAPPINGS: Record<string, ProviderMapping> = {
  'btc-price': {
    indicatorId: 'btc-price',
    providerSymbol: 'bitcoin',
    endpoint: '/simple/price',
    parameters: { vs_currencies: 'usd', include_24hr_change: true }
  },
  'eth-price': {
    indicatorId: 'eth-price',
    providerSymbol: 'ethereum',
    endpoint: '/simple/price',
    parameters: { vs_currencies: 'usd', include_24hr_change: true }
  },
  'solana': {
    indicatorId: 'solana',
    providerSymbol: 'solana',
    endpoint: '/simple/price',
    parameters: { vs_currencies: 'usd', include_24hr_change: true }
  },
  'cardano': {
    indicatorId: 'cardano',
    providerSymbol: 'cardano',
    endpoint: '/simple/price',
    parameters: { vs_currencies: 'usd', include_24hr_change: true }
  },
  'polygon': {
    indicatorId: 'polygon',
    providerSymbol: 'matic-network',
    endpoint: '/simple/price',
    parameters: { vs_currencies: 'usd', include_24hr_change: true }
  },
  'btc-market-cap': {
    indicatorId: 'btc-market-cap',
    providerSymbol: 'bitcoin',
    endpoint: '/coins',
    parameters: { localization: false, tickers: false, market_data: true }
  },
  'eth-market-cap': {
    indicatorId: 'eth-market-cap',
    providerSymbol: 'ethereum',
    endpoint: '/coins',
    parameters: { localization: false, tickers: false, market_data: true }
  },
  'total-crypto-market-cap': {
    indicatorId: 'total-crypto-market-cap',
    providerSymbol: 'global',
    endpoint: '/global',
    transformFunction: 'extractTotalMarketCap'
  }
};

// Glassnode Symbol Mappings
export const GLASSNODE_SYMBOL_MAPPINGS: Record<string, ProviderMapping> = {
  'btc-market-cap': {
    indicatorId: 'btc-market-cap',
    providerSymbol: 'market-cap',
    endpoint: '/v1/metrics/market/marketcap_usd',
    parameters: { a: 'BTC' }
  },
  'btc-realized-cap': {
    indicatorId: 'btc-realized-cap',
    providerSymbol: 'realized-cap',
    endpoint: '/v1/metrics/market/realizedcap_usd',
    parameters: { a: 'BTC' }
  },
  'btc-mvrv': {
    indicatorId: 'btc-mvrv',
    providerSymbol: 'mvrv-ratio',
    endpoint: '/v1/metrics/market/mvrv',
    parameters: { a: 'BTC' }
  },
  'btc-nvt': {
    indicatorId: 'btc-nvt',
    providerSymbol: 'nvt-ratio',
    endpoint: '/v1/metrics/market/nvt',
    parameters: { a: 'BTC' }
  },
  'btc-network-value': {
    indicatorId: 'btc-network-value',
    providerSymbol: 'nvt-ratio',
    endpoint: '/v1/metrics/market/nvt',
    parameters: { a: 'BTC' }
  },
  'btc-puell-multiple': {
    indicatorId: 'btc-puell-multiple',
    providerSymbol: 'puell-multiple',
    endpoint: '/v1/metrics/mining/puell_multiple',
    parameters: { a: 'BTC' }
  },
  'btc-volatility': {
    indicatorId: 'btc-volatility',
    providerSymbol: 'volatility-30d',
    endpoint: '/v1/metrics/market/price_volatility_1month',
    parameters: { a: 'BTC' }
  },
  'eth-market-cap': {
    indicatorId: 'eth-market-cap',
    providerSymbol: 'eth-market-cap',
    endpoint: '/v1/metrics/market/marketcap_usd',
    parameters: { a: 'ETH' }
  },
  'eth-gas-fees': {
    indicatorId: 'eth-gas-fees',
    providerSymbol: 'gas-price-mean',
    endpoint: '/v1/metrics/fees/gas_price_mean',
    parameters: { a: 'ETH' }
  }
};

// TwelveData Symbol Mappings
export const TWELVEDATA_SYMBOL_MAPPINGS: Record<string, ProviderMapping> = {
  // Crypto (backup for Coinbase)
  'btc-price': {
    indicatorId: 'btc-price',
    providerSymbol: 'BTC/USD',
    endpoint: '/quote'
  },
  'eth-price': {
    indicatorId: 'eth-price',
    providerSymbol: 'ETH/USD',
    endpoint: '/quote'
  },
  
  // Forex
  'eur-usd': {
    indicatorId: 'eur-usd',
    providerSymbol: 'EUR/USD',
    endpoint: '/quote'
  },
  'gbp-usd': {
    indicatorId: 'gbp-usd',
    providerSymbol: 'GBP/USD',
    endpoint: '/quote'
  },
  'usd-jpy': {
    indicatorId: 'usd-jpy',
    providerSymbol: 'USD/JPY',
    endpoint: '/quote'
  },
  'usd-cny': {
    indicatorId: 'usd-cny',
    providerSymbol: 'USD/CNH',
    endpoint: '/quote'
  },
  
  // Equities
  'sp500': {
    indicatorId: 'sp500',
    providerSymbol: 'SPY',
    endpoint: '/quote'
  },
  'nasdaq': {
    indicatorId: 'nasdaq',
    providerSymbol: 'QQQ',
    endpoint: '/quote'
  },
  'russell-2000': {
    indicatorId: 'russell-2000',
    providerSymbol: 'IWM',
    endpoint: '/quote'
  },
  'vix': {
    indicatorId: 'vix',
    providerSymbol: 'VIX',
    endpoint: '/quote'
  },
  
  // Commodities
  'gold': {
    indicatorId: 'gold',
    providerSymbol: 'XAUUSD',
    endpoint: '/quote'
  },
  'silver': {
    indicatorId: 'silver',
    providerSymbol: 'XAGUSD',
    endpoint: '/quote'
  },
  'crude-oil': {
    indicatorId: 'crude-oil',
    providerSymbol: 'WTI',
    endpoint: '/quote'
  },
  'wti-crude': {
    indicatorId: 'wti-crude',
    providerSymbol: 'WTI',
    endpoint: '/quote'
  },
  'copper': {
    indicatorId: 'copper',
    providerSymbol: 'COPPER',
    endpoint: '/quote'
  },
  'natural-gas': {
    indicatorId: 'natural-gas',
    providerSymbol: 'NG',
    endpoint: '/quote'
  }
};

// Finnhub Symbol Mappings
export const FINNHUB_SYMBOL_MAPPINGS: Record<string, ProviderMapping> = {
  // Equities
  'sp500': {
    indicatorId: 'sp500',
    providerSymbol: 'SPY',
    endpoint: '/quote'
  },
  'nasdaq': {
    indicatorId: 'nasdaq',
    providerSymbol: 'QQQ',
    endpoint: '/quote'
  },
  'russell-2000': {
    indicatorId: 'russell-2000',
    providerSymbol: 'IWM',
    endpoint: '/quote'
  },
  'vix': {
    indicatorId: 'vix',
    providerSymbol: 'VIX',
    endpoint: '/quote'
  },
  
  // Forex
  'eur-usd': {
    indicatorId: 'eur-usd',
    providerSymbol: 'OANDA:EUR_USD',
    endpoint: '/forex/quote'
  },
  'gbp-usd': {
    indicatorId: 'gbp-usd',
    providerSymbol: 'OANDA:GBP_USD',
    endpoint: '/forex/quote'
  },
  'usd-jpy': {
    indicatorId: 'usd-jpy',
    providerSymbol: 'OANDA:USD_JPY',
    endpoint: '/forex/quote'
  },
  'usd-cny': {
    indicatorId: 'usd-cny',
    providerSymbol: 'OANDA:USD_CNH',
    endpoint: '/forex/quote'
  },
  
  // Crypto (as fallback)
  'btc-price': {
    indicatorId: 'btc-price',
    providerSymbol: 'BINANCE:BTCUSDT',
    endpoint: '/quote'
  },
  'eth-price': {
    indicatorId: 'eth-price',
    providerSymbol: 'BINANCE:ETHUSDT',
    endpoint: '/quote'
  }
};

// Coinbase Symbol Mappings (Real-time crypto)
export const COINBASE_SYMBOL_MAPPINGS: Record<string, ProviderMapping> = {
  'btc-price': {
    indicatorId: 'btc-price',
    providerSymbol: 'BTC-USD',
    endpoint: '/products'
  },
  'eth-price': {
    indicatorId: 'eth-price',
    providerSymbol: 'ETH-USD',
    endpoint: '/products'
  },
  'solana': {
    indicatorId: 'solana',
    providerSymbol: 'SOL-USD',
    endpoint: '/products'
  },
  'cardano': {
    indicatorId: 'cardano',
    providerSymbol: 'ADA-USD',
    endpoint: '/products'
  },
  'polygon': {
    indicatorId: 'polygon',
    providerSymbol: 'MATIC-USD',
    endpoint: '/products'
  }
};

// Comprehensive Provider Registry
export const PROVIDER_SYMBOL_REGISTRY = {
  fred: FRED_SYMBOL_MAPPINGS,
  coingecko: COINGECKO_SYMBOL_MAPPINGS,
  glassnode: GLASSNODE_SYMBOL_MAPPINGS,
  twelvedata: TWELVEDATA_SYMBOL_MAPPINGS,
  finnhub: FINNHUB_SYMBOL_MAPPINGS,
  coinbase: COINBASE_SYMBOL_MAPPINGS
} as const;

/**
 * Get provider symbol mapping for an indicator
 */
export function getProviderMapping(
  indicatorId: string, 
  provider: keyof typeof PROVIDER_SYMBOL_REGISTRY
): ProviderMapping | null {
  const mappings = PROVIDER_SYMBOL_REGISTRY[provider];
  return mappings[indicatorId] || null;
}

/**
 * Get all providers that support an indicator
 */
export function getSupportedProviders(indicatorId: string): string[] {
  const providers: string[] = [];
  
  for (const [provider, mappings] of Object.entries(PROVIDER_SYMBOL_REGISTRY)) {
    if (mappings[indicatorId]) {
      providers.push(provider);
    }
  }
  
  return providers;
}

/**
 * Get fallback provider chain for an indicator
 */
export function getProviderFallbackChain(indicatorId: string, category?: string): string[] {
  const supportedProviders = getSupportedProviders(indicatorId);
  
  // Define priority order by category
  const categoryPriority: Record<string, string[]> = {
    'crypto': ['coinbase', 'coingecko', 'twelvedata', 'finnhub'],
    'forex': ['twelvedata', 'finnhub', 'fred'],
    'equity': ['twelvedata', 'finnhub', 'fred'],
    'commodity': ['twelvedata', 'finnhub', 'fred'],
    'macro': ['fred', 'twelvedata', 'finnhub'],
    'liquidity': ['fred'],
    'volatility': ['twelvedata', 'finnhub', 'fred'],
    'rates': ['fred', 'twelvedata', 'finnhub']
  };
  
  const priority = categoryPriority[category || 'macro'] || ['fred', 'twelvedata', 'finnhub'];
  
  // Return providers in priority order that support this indicator
  return priority.filter(provider => supportedProviders.includes(provider));
}

export default {
  PROVIDER_SYMBOL_REGISTRY,
  getProviderMapping,
  getSupportedProviders,
  getProviderFallbackChain
};