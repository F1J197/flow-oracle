/**
 * FRED API Symbol Mapping
 * Maps internal symbols to actual FRED series IDs
 */

export const FRED_SYMBOL_MAP: Record<string, string> = {
  // Credit & Interest Rates
  'credit-stress-score': 'NFCI',          // National Financial Conditions Index
  'high-yield-spread': 'BAMLH0A0HYM2',    // High Yield Bond Spread
  'investment-grade-spread': 'BAMLC0A0CM', // Investment Grade Bond Spread
  'vix': 'VIXCLS',                        // VIX Volatility Index

  // Federal Reserve Data
  'fed-balance-sheet': 'WALCL',           // Fed Total Assets
  'treasury-account': 'WTREGEN',          // Treasury General Account
  'reverse-repo': 'RRPONTSYD',            // Reverse Repo Operations
  'net-liquidity': 'WALCL',               // Using Fed Balance Sheet as proxy

  // Market Data
  'spx': 'SP500',                         // S&P 500 Index
  'dxy': 'DEXUSEU',                       // Dollar Index (vs Euro)
  'yields-10y': 'DGS10',                  // 10-Year Treasury Rate
  'yields-2y': 'DGS2',                    // 2-Year Treasury Rate

  // Crypto (Note: FRED has limited crypto data)
  'btc-price': 'CBBTCUSD',                // Coinbase Bitcoin Price (if available)
  'btc-market-cap': 'MKTCAP',             // Market Cap proxy

  // Economic Indicators
  'unemployment': 'UNRATE',               // Unemployment Rate
  'inflation': 'CPIAUCSL',                // Consumer Price Index
  'gdp': 'GDP',                           // Gross Domestic Product
  'money-supply': 'M2SL',                 // M2 Money Supply

  // Dealer Positions & Repo
  'primary-dealer-positions': 'PDCMPY',   // Primary Dealer positions proxy
  'repo-rates': 'SOFR',                   // Secured Overnight Financing Rate
};

export const SYMBOL_METADATA: Record<string, {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  updateFrequency: string;
}> = {
  'NFCI': {
    name: 'National Financial Conditions Index',
    description: 'Chicago Fed measure of financial stress',
    category: 'market',
    subcategory: 'credit',
    updateFrequency: 'weekly'
  },
  'BAMLH0A0HYM2': {
    name: 'High Yield Bond Spread',
    description: 'High yield corporate bond spread over Treasury',
    category: 'market',
    subcategory: 'credit',
    updateFrequency: 'daily'
  },
  'BAMLC0A0CM': {
    name: 'Investment Grade Bond Spread',
    description: 'Investment grade corporate bond spread',
    category: 'market',
    subcategory: 'credit',
    updateFrequency: 'daily'
  },
  'VIXCLS': {
    name: 'VIX Volatility Index',
    description: 'Market volatility index',
    category: 'market',
    subcategory: 'volatility',
    updateFrequency: 'daily'
  },
  'WALCL': {
    name: 'Fed Total Assets',
    description: 'Federal Reserve total assets',
    category: 'market',
    subcategory: 'liquidity',
    updateFrequency: 'weekly'
  },
  'WTREGEN': {
    name: 'Treasury General Account',
    description: 'US Treasury account balance at Fed',
    category: 'market',
    subcategory: 'liquidity',
    updateFrequency: 'daily'
  },
  'RRPONTSYD': {
    name: 'Reverse Repo Operations',
    description: 'Federal Reserve reverse repo operations',
    category: 'market',
    subcategory: 'liquidity',
    updateFrequency: 'daily'
  },
  'SP500': {
    name: 'S&P 500 Index',
    description: 'Standard & Poor\'s 500 stock index',
    category: 'market',
    subcategory: 'equity',
    updateFrequency: 'daily'
  },
  'DGS10': {
    name: '10-Year Treasury Rate',
    description: '10-year Treasury constant maturity rate',
    category: 'market',
    subcategory: 'rates',
    updateFrequency: 'daily'
  },
  'DGS2': {
    name: '2-Year Treasury Rate',
    description: '2-year Treasury constant maturity rate',
    category: 'market',
    subcategory: 'rates',
    updateFrequency: 'daily'
  }
};

/**
 * Maps internal symbol to FRED series ID
 */
export function getFREDSeriesId(internalSymbol: string): string {
  return FRED_SYMBOL_MAP[internalSymbol] || internalSymbol;
}

/**
 * Gets metadata for a FRED series
 */
export function getFREDMetadata(seriesId: string): typeof SYMBOL_METADATA[string] | null {
  return SYMBOL_METADATA[seriesId] || null;
}

/**
 * Validates if a symbol has a FRED mapping
 */
export function hasValidFREDMapping(symbol: string): boolean {
  return symbol in FRED_SYMBOL_MAP;
}

/**
 * Gets all available FRED symbols
 */
export function getAllFREDSymbols(): string[] {
  return Object.keys(FRED_SYMBOL_MAP);
}