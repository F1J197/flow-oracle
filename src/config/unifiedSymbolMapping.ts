/**
 * Unified Symbol Mapping - Single Source of Truth
 * Standardizes all symbol IDs across the entire platform
 */

export interface SymbolMapping {
  standardId: string;        // Our internal standard ID
  displayName: string;       // Human readable name
  sources: {
    FRED?: string;          // FRED API symbol
    COINBASE?: string;      // Coinbase API symbol
    BINANCE?: string;       // Binance API symbol
    GLASSNODE?: string;     // Glassnode API symbol
    ENGINE?: string;        // Internal engine ID
    BLOOMBERG?: string;     // Bloomberg symbol
    CME?: string;          // CME symbol
  };
  category: 'foundation' | 'central-bank' | 'treasury' | 'monetary-ops' | 'rates' | 'credit' | 'equity' | 'currency' | 'commodities' | 'crypto' | 'calculated' | 'volatility' | 'liquidity';
  pillar: 1 | 2 | 3 | 'foundation';
  unit: string;
  precision: number;
  description: string;
  aliases?: string[];       // Alternative symbols that should map to this
}

// Foundation Engine Symbols
export const FOUNDATION_SYMBOLS: SymbolMapping[] = [
  {
    standardId: 'data-integrity-score',
    displayName: 'Data Integrity Score',
    sources: {
      ENGINE: 'DATA_INTEGRITY'
    },
    category: 'foundation',
    pillar: 'foundation',
    unit: '%',
    precision: 1,
    description: 'System-wide data integrity and validation score',
    aliases: ['DIS', 'DATA_INTEGRITY']
  },
  {
    standardId: 'zscore-composite',
    displayName: 'Composite Z-Score',
    sources: {
      ENGINE: 'ZS_COMP'
    },
    category: 'foundation',
    pillar: 'foundation',
    unit: 'σ',
    precision: 2,
    description: 'Multi-timeframe composite Z-score for market analysis',
    aliases: ['ZS_COMP', 'ZSCORE_COMP', 'Z_SCORE']
  }
];

// Pillar 1: Central Bank & Government Liquidity
export const PILLAR1_SYMBOLS: SymbolMapping[] = [
  // Federal Reserve Balance Sheet
  {
    standardId: 'fed-balance-sheet',
    displayName: 'Federal Reserve Balance Sheet',
    sources: {
      FRED: 'WALCL'
    },
    category: 'central-bank',
    pillar: 1,
    unit: 'Billions USD',
    precision: 2,
    description: 'Total assets held by the Federal Reserve',
    aliases: ['WALCL', 'FED_BS', 'FED_BALANCE']
  },
  {
    standardId: 'treasury-general-account',
    displayName: 'Treasury General Account',
    sources: {
      FRED: 'WTREGEN'
    },
    category: 'treasury',
    pillar: 1,
    unit: 'Billions USD',
    precision: 1,
    description: 'U.S. Treasury balance at the Federal Reserve',
    aliases: ['WTREGEN', 'TGA', 'TREASURY_ACCOUNT']
  },
  {
    standardId: 'reverse-repo-operations',
    displayName: 'Reverse Repo Operations',
    sources: {
      FRED: 'RRPONTSYD'
    },
    category: 'monetary-ops',
    pillar: 1,
    unit: 'Billions USD',
    precision: 1,
    description: 'Overnight reverse repurchase agreements',
    aliases: ['RRPONTSYD', 'RRP', 'REVERSE_REPO']
  },
  {
    standardId: 'net-liquidity',
    displayName: 'Net Liquidity',
    sources: {
      ENGINE: 'NET_LIQ'
    },
    category: 'calculated',
    pillar: 1,
    unit: 'Trillions USD',
    precision: 3,
    description: 'Fed Balance Sheet minus Treasury Account minus Reverse Repo',
    aliases: ['NET_LIQ', 'NET_LIQUIDITY', 'LIQUIDITY_NET']
  },

  // Interest Rates
  {
    standardId: 'federal-funds-rate',
    displayName: 'Federal Funds Rate',
    sources: {
      FRED: 'DFF'
    },
    category: 'rates',
    pillar: 1,
    unit: '%',
    precision: 3,
    description: 'Federal funds effective rate',
    aliases: ['DFF', 'FED_FUNDS', 'FFR']
  },
  {
    standardId: '10y-treasury-yield',
    displayName: '10-Year Treasury Yield',
    sources: {
      FRED: 'GS10'
    },
    category: 'rates',
    pillar: 1,
    unit: '%',
    precision: 3,
    description: '10-Year Treasury constant maturity rate',
    aliases: ['GS10', '10Y', 'TNX']
  },
  {
    standardId: '2y-treasury-yield',
    displayName: '2-Year Treasury Yield',
    sources: {
      FRED: 'GS2'
    },
    category: 'rates',
    pillar: 1,
    unit: '%',
    precision: 3,
    description: '2-Year Treasury constant maturity rate',
    aliases: ['GS2', '2Y', 'TWO_YEAR']
  },

  // Primary Dealer Positions
  {
    standardId: 'primary-dealer-positions',
    displayName: 'Primary Dealer Positions',
    sources: {
      FRED: 'PDTOTL',
      ENGINE: 'DEALER_POSITIONS'
    },
    category: 'liquidity',
    pillar: 1,
    unit: 'Trillions USD',
    precision: 2,
    description: 'Aggregate securities positions held by primary dealers',
    aliases: ['PDTOTL', 'DEALER_POS', 'PD_POSITIONS']
  },

  // Credit Spreads
  {
    standardId: 'high-yield-spread',
    displayName: 'High Yield Credit Spread',
    sources: {
      FRED: 'BAMLH0A0HYM2'
    },
    category: 'credit',
    pillar: 1,
    unit: 'bps',
    precision: 2,
    description: 'ICE BofA US High Yield Index Option-Adjusted Spread',
    aliases: ['BAMLH0A0HYM2', 'HY_SPREAD', 'HIGH_YIELD']
  },
  {
    standardId: 'investment-grade-spread',
    displayName: 'Investment Grade Credit Spread',
    sources: {
      FRED: 'BAMLC0A0CM'
    },
    category: 'credit',
    pillar: 1,
    unit: 'bps',
    precision: 2,
    description: 'ICE BofA US Corporate Index Option-Adjusted Spread',
    aliases: ['BAMLC0A0CM', 'IG_SPREAD', 'INVESTMENT_GRADE']
  },
  {
    standardId: 'credit-stress',
    displayName: 'Credit Stress Index',
    sources: {
      ENGINE: 'CREDIT_STRESS'
    },
    category: 'calculated',
    pillar: 1,
    unit: 'bps',
    precision: 2,
    description: 'Weighted average of high yield and investment grade spreads',
    aliases: ['CREDIT_STRESS', 'CREDIT_INDEX']
  }
];

// Pillar 2: Equity, Currency & Commodity
export const PILLAR2_SYMBOLS: SymbolMapping[] = [
  // Equity Markets
  {
    standardId: 'sp500',
    displayName: 'S&P 500 Index',
    sources: {
      FRED: 'SP500',
      BLOOMBERG: 'SPX'
    },
    category: 'equity',
    pillar: 2,
    unit: 'Index',
    precision: 2,
    description: 'S&P 500 stock market index',
    aliases: ['SP500', 'SPX', 'S&P500']
  },
  {
    standardId: 'nasdaq',
    displayName: 'NASDAQ Composite',
    sources: {
      FRED: 'NASDAQCOM',
      BLOOMBERG: 'CCMP'
    },
    category: 'equity',
    pillar: 2,
    unit: 'Index',
    precision: 2,
    description: 'NASDAQ Composite index',
    aliases: ['NASDAQCOM', 'NASDAQ', 'CCMP']
  },
  {
    standardId: 'vix',
    displayName: 'VIX Volatility Index',
    sources: {
      FRED: 'VIXCLS',
      BLOOMBERG: 'VIX'
    },
    category: 'volatility',
    pillar: 2,
    unit: 'Index',
    precision: 2,
    description: 'CBOE Volatility Index',
    aliases: ['VIXCLS', 'VIX', 'VOLATILITY']
  },

  // Currency
  {
    standardId: 'dxy',
    displayName: 'Dollar Index',
    sources: {
      FRED: 'DTWEXBGS',
      BLOOMBERG: 'DXY'
    },
    category: 'currency',
    pillar: 2,
    unit: 'Index',
    precision: 2,
    description: 'Trade Weighted U.S. Dollar Index',
    aliases: ['DTWEXBGS', 'DXY', 'DOLLAR_INDEX']
  },

  // Commodities
  {
    standardId: 'gold',
    displayName: 'Gold Price',
    sources: {
      FRED: 'GOLDAMGBD228NLBM',
      BLOOMBERG: 'GC1'
    },
    category: 'commodities',
    pillar: 2,
    unit: 'USD/oz',
    precision: 2,
    description: 'Gold fixing price in London Bullion Market',
    aliases: ['GOLDAMGBD228NLBM', 'GOLD', 'GC1']
  }
];

// Pillar 3: Cryptocurrency
export const PILLAR3_SYMBOLS: SymbolMapping[] = [
  {
    standardId: 'btc-price',
    displayName: 'Bitcoin Price',
    sources: {
      COINBASE: 'BTC-USD',
      BINANCE: 'BTCUSDT',
      GLASSNODE: 'BTC'
    },
    category: 'crypto',
    pillar: 3,
    unit: 'USD',
    precision: 0,
    description: 'Bitcoin spot price in USD',
    aliases: ['BTC-USD', 'BTCUSDT', 'BTC', 'BITCOIN']
  },
  {
    standardId: 'eth-price',
    displayName: 'Ethereum Price',
    sources: {
      COINBASE: 'ETH-USD',
      BINANCE: 'ETHUSDT',
      GLASSNODE: 'ETH'
    },
    category: 'crypto',
    pillar: 3,
    unit: 'USD',
    precision: 2,
    description: 'Ethereum spot price in USD',
    aliases: ['ETH-USD', 'ETHUSDT', 'ETH', 'ETHEREUM']
  }
];

// Synthesis & Engine Symbols
export const SYNTHESIS_SYMBOLS: SymbolMapping[] = [
  {
    standardId: 'enhanced-momentum',
    displayName: 'Enhanced Momentum Score',
    sources: {
      ENGINE: 'ENHANCED_MOMENTUM'
    },
    category: 'calculated',
    pillar: 'foundation',
    unit: 'Score',
    precision: 2,
    description: 'Multi-asset momentum score',
    aliases: ['ENHANCED_MOMENTUM', 'MOMENTUM_SCORE']
  },
  {
    standardId: 'dealer-leverage',
    displayName: 'Dealer Leverage',
    sources: {
      ENGINE: 'DEALER_LEVERAGE'
    },
    category: 'calculated',
    pillar: 1,
    unit: 'Ratio',
    precision: 2,
    description: 'Primary dealer leverage ratio',
    aliases: ['DEALER_LEVERAGE', 'LEVERAGE_RATIO']
  }
];

// Combined Symbol Registry
export const ALL_SYMBOL_MAPPINGS = [
  ...FOUNDATION_SYMBOLS,
  ...PILLAR1_SYMBOLS,
  ...PILLAR2_SYMBOLS,
  ...PILLAR3_SYMBOLS,
  ...SYNTHESIS_SYMBOLS
];

// Utility Functions
export class UnifiedSymbolMapper {
  private static symbolMap: Map<string, SymbolMapping> = new Map();
  private static aliasMap: Map<string, string> = new Map();

  static {
    this.initializeMaps();
  }

  private static initializeMaps(): void {
    // Build primary symbol map
    ALL_SYMBOL_MAPPINGS.forEach(mapping => {
      this.symbolMap.set(mapping.standardId, mapping);
    });

    // Build alias map
    ALL_SYMBOL_MAPPINGS.forEach(mapping => {
      // Map source symbols to standard ID
      Object.values(mapping.sources).forEach(sourceSymbol => {
        if (sourceSymbol) {
          this.aliasMap.set(sourceSymbol, mapping.standardId);
        }
      });

      // Map aliases to standard ID
      mapping.aliases?.forEach(alias => {
        this.aliasMap.set(alias, mapping.standardId);
      });
    });
  }

  /**
   * Get standardized symbol ID from any input
   */
  static getStandardId(input: string): string | null {
    // Check if it's already a standard ID
    if (this.symbolMap.has(input)) {
      return input;
    }

    // Check aliases
    return this.aliasMap.get(input) || null;
  }

  /**
   * Get symbol mapping by standard ID
   */
  static getMapping(standardId: string): SymbolMapping | null {
    return this.symbolMap.get(standardId) || null;
  }

  /**
   * Get source symbol for a specific provider
   */
  static getSourceSymbol(standardId: string, source: keyof SymbolMapping['sources']): string | null {
    const mapping = this.getMapping(standardId);
    return mapping?.sources[source] || null;
  }

  /**
   * Get all mappings for a specific pillar
   */
  static getMappingsByPillar(pillar: 1 | 2 | 3 | 'foundation'): SymbolMapping[] {
    return Array.from(this.symbolMap.values()).filter(mapping => mapping.pillar === pillar);
  }

  /**
   * Get all mappings for a specific category
   */
  static getMappingsByCategory(category: SymbolMapping['category']): SymbolMapping[] {
    return Array.from(this.symbolMap.values()).filter(mapping => mapping.category === category);
  }

  /**
   * Check if a symbol exists (standard ID or alias)
   */
  static exists(input: string): boolean {
    return this.getStandardId(input) !== null;
  }

  /**
   * Get all standard IDs
   */
  static getAllStandardIds(): string[] {
    return Array.from(this.symbolMap.keys());
  }

  /**
   * Get display name for any symbol input
   */
  static getDisplayName(input: string): string | null {
    const standardId = this.getStandardId(input);
    if (!standardId) return null;
    
    const mapping = this.getMapping(standardId);
    return mapping?.displayName || null;
  }

  /**
   * Normalize a list of symbols to standard IDs
   */
  static normalizeSymbols(symbols: string[]): string[] {
    return symbols
      .map(symbol => this.getStandardId(symbol))
      .filter((id): id is string => id !== null);
  }

  /**
   * Get symbol metadata
   */
  static getMetadata(input: string): Pick<SymbolMapping, 'unit' | 'precision' | 'description'> | null {
    const standardId = this.getStandardId(input);
    if (!standardId) return null;

    const mapping = this.getMapping(standardId);
    if (!mapping) return null;

    return {
      unit: mapping.unit,
      precision: mapping.precision,
      description: mapping.description
    };
  }
}

export default UnifiedSymbolMapper;