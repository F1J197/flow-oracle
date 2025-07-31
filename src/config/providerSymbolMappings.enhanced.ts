/**
 * Enhanced Provider Symbol Mappings - Unified with Calculation Engine
 * Maps unified indicator IDs to provider-specific symbols with fallback chains
 */

export interface ProviderMapping {
  indicatorId: string;
  providerSymbol: string;
  endpoint?: string;
  parameters?: Record<string, any>;
  transformFunction?: string;
}

// FRED Symbol Mappings - Updated to match unified IDs
export const FRED_SYMBOL_MAPPINGS: Record<string, ProviderMapping> = {
  // Balance Sheet & Liquidity (Primary indicators for net liquidity calculation)
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
  
  // Primary Dealer Positions
  'primary-dealer-positions': {
    indicatorId: 'primary-dealer-positions',
    providerSymbol: 'PDTOTL',
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
  
  // Commodities
  'gold': {
    indicatorId: 'gold',
    providerSymbol: 'GOLDAMGBD228NLBM',
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
  }
};

// TwelveData Symbol Mappings (Fallback for crypto and traditional assets)
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
  
  // Equities (backup for FRED)
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
  }
};

// Finnhub Symbol Mappings (Additional fallback)
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
  'vix': {
    indicatorId: 'vix',
    providerSymbol: 'VIX',
    endpoint: '/quote'
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

// Comprehensive Provider Registry
export const ENHANCED_PROVIDER_REGISTRY = {
  fred: FRED_SYMBOL_MAPPINGS,
  coingecko: COINGECKO_SYMBOL_MAPPINGS,
  coinbase: COINBASE_SYMBOL_MAPPINGS,
  twelvedata: TWELVEDATA_SYMBOL_MAPPINGS,
  finnhub: FINNHUB_SYMBOL_MAPPINGS
} as const;

// Provider Priority Chains by Category
export const PROVIDER_FALLBACK_CHAINS = {
  'central-bank': ['fred'],
  'treasury': ['fred'],
  'monetary-ops': ['fred'],
  'rates': ['fred', 'twelvedata'],
  'credit': ['fred', 'twelvedata'],
  'equity': ['fred', 'twelvedata', 'finnhub'],
  'currency': ['fred', 'twelvedata', 'finnhub'],
  'commodities': ['fred', 'twelvedata', 'finnhub'],
  'crypto': ['coinbase', 'coingecko', 'twelvedata', 'finnhub'],
  'volatility': ['fred', 'twelvedata', 'finnhub']
} as const;

/**
 * Get provider symbol mapping for an indicator
 */
export function getProviderMapping(
  indicatorId: string, 
  provider: keyof typeof ENHANCED_PROVIDER_REGISTRY
): ProviderMapping | null {
  const mappings = ENHANCED_PROVIDER_REGISTRY[provider];
  return mappings[indicatorId] || null;
}

/**
 * Get all providers that support an indicator
 */
export function getSupportedProviders(indicatorId: string): string[] {
  const providers: string[] = [];
  
  for (const [provider, mappings] of Object.entries(ENHANCED_PROVIDER_REGISTRY)) {
    if (mappings[indicatorId]) {
      providers.push(provider);
    }
  }
  
  return providers;
}

/**
 * Get fallback chain for an indicator based on its category
 */
export function getProviderFallbackChain(category: string): string[] {
  const chain = PROVIDER_FALLBACK_CHAINS[category as keyof typeof PROVIDER_FALLBACK_CHAINS];
  return chain ? [...chain] : ['fred', 'twelvedata'];
}

/**
 * Check if indicator requires specific provider for data integrity
 */
export function getRequiredProvider(indicatorId: string): string | null {
  // Critical liquidity indicators must use FRED for consistency
  const fredOnlyIndicators = [
    'fed-balance-sheet',
    'treasury-general-account', 
    'reverse-repo-operations',
    'primary-dealer-positions'
  ];
  
  if (fredOnlyIndicators.includes(indicatorId)) {
    return 'fred';
  }
  
  // Crypto indicators should prefer real-time sources
  if (indicatorId.includes('btc') || indicatorId.includes('eth')) {
    return 'coinbase';
  }
  
  return null;
}