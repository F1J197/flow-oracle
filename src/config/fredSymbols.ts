/**
 * FRED API Symbol Mapping Configuration
 * Centralized mapping of indicators to correct FRED series IDs
 */

export const FRED_SYMBOL_MAP = {
  // Internal symbol mappings to FRED series IDs
  'fed-balance-sheet': 'WALCL',           // Fed Total Assets
  'treasury-account': 'WTREGEN',          // Treasury General Account
  'reverse-repo': 'RRPONTSYD',            // Overnight Reverse Repo
  'high-yield-spread': 'BAMLH0A0HYM2',    // High Yield Spread
  'investment-grade-spread': 'BAMLC0A0CM', // Investment Grade Spread
  'net-liquidity': 'WALCL',               // Using Fed Balance Sheet as proxy
  'vix': 'VIXCLS',                        // VIX Volatility Index
  'spx': 'SP500',                         // S&P 500 Index
  'credit-stress-score': 'BAMLH0A0HYM2',  // Using HY spread as proxy
  
  // Direct FRED symbol mappings (existing)
  'WALCL': 'WALCL',           // Total Assets (Fed Balance Sheet)
  'WTREGEN': 'WTREGEN',       // Treasury General Account
  'RRPONTSYD': 'RRPONTSYD',   // Overnight Reverse Repo Operations
  'VIXCLS': 'VIXCLS',         // VIX Volatility Index
  'SP500': 'SP500',           // S&P 500 Index
  
  // Treasury Yields
  'DGS10': 'DGS10',           // 10-Year Treasury Constant Maturity Rate
  'DGS2': 'DGS2',             // 2-Year Treasury Constant Maturity Rate
  'DGS30': 'DGS30',           // 30-Year Treasury Constant Maturity Rate
  
  // Credit Spreads
  'BAMLH0A0HYM2': 'BAMLH0A0HYM2', // ICE BofA US High Yield Master II Option-Adjusted Spread
  'BAMLC0A0CM': 'BAMLC0A0CM',     // ICE BofA US Corporate Master Option-Adjusted Spread
  
  // Economic Indicators
  'UNRATE': 'UNRATE',         // Unemployment Rate
  'CPIAUCSL': 'CPIAUCSL',     // Consumer Price Index for All Urban Consumers
  'GDPC1': 'GDPC1',           // Real Gross Domestic Product
  
  // Money Supply
  'M1SL': 'M1SL',             // M1 Money Stock
  'M2SL': 'M2SL',             // M2 Money Stock
  
  // Federal Funds Rate
  'FEDFUNDS': 'FEDFUNDS',     // Effective Federal Funds Rate
  'DFEDTARU': 'DFEDTARU',     // Federal Funds Target Rate - Upper Limit
  'DFEDTARL': 'DFEDTARL',     // Federal Funds Target Rate - Lower Limit
} as const;

export type FredSymbol = keyof typeof FRED_SYMBOL_MAP;

/**
 * Get the correct FRED series ID for a given symbol
 */
export function getFredSeriesId(symbol: string): string {
  return FRED_SYMBOL_MAP[symbol as FredSymbol] || symbol;
}

/**
 * Validate if a symbol is a known FRED symbol
 */
export function isValidFredSymbol(symbol: string): symbol is FredSymbol {
  return symbol in FRED_SYMBOL_MAP;
}

/**
 * Get all available FRED symbols
 */
export function getAllFredSymbols(): FredSymbol[] {
  return Object.keys(FRED_SYMBOL_MAP) as FredSymbol[];
}