import { IndicatorMetadata, IndicatorSource, IndicatorFilter } from '@/types/indicators';

/**
 * Central registry for all financial indicators
 * Manages metadata, categories, and provides unified access patterns
 */
export class IndicatorRegistry {
  private static instance: IndicatorRegistry;
  private indicators: Map<string, IndicatorMetadata> = new Map();
  private categories: Set<string> = new Set();
  private sources: Set<IndicatorSource> = new Set();

  private constructor() {
    this.loadDefaultIndicators();
  }

  static getInstance(): IndicatorRegistry {
    if (!IndicatorRegistry.instance) {
      IndicatorRegistry.instance = new IndicatorRegistry();
    }
    return IndicatorRegistry.instance;
  }

  /**
   * Register a new indicator or update existing one
   */
  register(metadata: IndicatorMetadata): void {
    this.indicators.set(metadata.id, metadata);
    this.categories.add(metadata.category);
    this.sources.add(metadata.source);
  }

  /**
   * Get indicator metadata by ID
   */
  get(id: string): IndicatorMetadata | undefined {
    return this.indicators.get(id);
  }

  /**
   * Get all indicators with optional filtering
   */
  getAll(filter?: IndicatorFilter): IndicatorMetadata[] {
    let result = Array.from(this.indicators.values());

    if (filter) {
      if (filter.source) {
        result = result.filter(ind => ind.source === filter.source);
      }
      if (filter.category) {
        result = result.filter(ind => ind.category === filter.category);
      }
      if (filter.pillar !== undefined) {
        result = result.filter(ind => ind.pillar === filter.pillar);
      }
      if (filter.tags && filter.tags.length > 0) {
        result = result.filter(ind => 
          ind.tags && filter.tags!.some(tag => ind.tags!.includes(tag))
        );
      }
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        result = result.filter(ind => 
          ind.name.toLowerCase().includes(searchLower) ||
          ind.symbol.toLowerCase().includes(searchLower) ||
          (ind.description && ind.description.toLowerCase().includes(searchLower))
        );
      }
    }

    return result.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get indicators by category
   */
  getByCategory(category: string): IndicatorMetadata[] {
    return this.getAll({ category });
  }

  /**
   * Get indicators by source
   */
  getBySource(source: IndicatorSource): IndicatorMetadata[] {
    return this.getAll({ source });
  }

  /**
   * Get indicators by pillar
   */
  getByPillar(pillar: number): IndicatorMetadata[] {
    return this.getAll({ pillar });
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    return Array.from(this.categories).sort();
  }

  /**
   * Get all available sources
   */
  getSources(): IndicatorSource[] {
    return Array.from(this.sources);
  }

  /**
   * Check if indicator exists
   */
  exists(id: string): boolean {
    return this.indicators.has(id);
  }

  /**
   * Remove indicator from registry
   */
  unregister(id: string): boolean {
    return this.indicators.delete(id);
  }

  /**
   * Get indicator count
   */
  count(): number {
    return this.indicators.size;
  }

  /**
   * Bulk register indicators
   */
  registerBulk(indicators: IndicatorMetadata[]): void {
    indicators.forEach(indicator => this.register(indicator));
  }

  /**
   * Load default indicators from existing services
   */
  private loadDefaultIndicators(): void {
    const defaultIndicators: IndicatorMetadata[] = [
      // FRED Indicators
      {
        id: 'fed-balance-sheet',
        symbol: 'WALCL',
        name: 'Fed Balance Sheet',
        description: 'Federal Reserve Total Assets',
        source: 'FRED',
        category: 'liquidity',
        pillar: 1,
        priority: 1,
        updateFrequency: '1d',
        unit: 'USD Billions',
        precision: 0,
        apiEndpoint: '/observations?series_id=WALCL',
        tags: ['fed', 'liquidity', 'balance-sheet']
      },
      {
        id: 'treasury-account',
        symbol: 'WTREGEN',
        name: 'Treasury General Account',
        description: 'US Treasury General Account Balance',
        source: 'FRED',
        category: 'liquidity',
        pillar: 1,
        priority: 2,
        updateFrequency: '1d',
        unit: 'USD Billions',
        precision: 0,
        apiEndpoint: '/observations?series_id=WTREGEN',
        tags: ['treasury', 'liquidity', 'government']
      },
      {
        id: 'reverse-repo',
        symbol: 'RRPONTSYD',
        name: 'Reverse Repo Operations',
        description: 'Overnight Reverse Repurchase Agreements',
        source: 'FRED',
        category: 'liquidity',
        pillar: 1,
        priority: 3,
        updateFrequency: '1d',
        unit: 'USD Billions',
        precision: 0,
        apiEndpoint: '/observations?series_id=RRPONTSYD',
        tags: ['fed', 'liquidity', 'repo']
      },
      {
        id: 'high-yield-spread',
        symbol: 'BAMLH0A0HYM2',
        name: 'High Yield Credit Spread',
        description: 'ICE BofA US High Yield Index Option-Adjusted Spread',
        source: 'FRED',
        category: 'credit',
        pillar: 2,
        priority: 1,
        updateFrequency: '1d',
        unit: 'Basis Points',
        precision: 0,
        apiEndpoint: '/observations?series_id=BAMLH0A0HYM2',
        tags: ['credit', 'spread', 'high-yield']
      },
      {
        id: 'investment-grade-spread',
        symbol: 'BAMLC0A0CM',
        name: 'Investment Grade Credit Spread',
        description: 'ICE BofA US Corporate Index Option-Adjusted Spread',
        source: 'FRED',
        category: 'credit',
        pillar: 2,
        priority: 2,
        updateFrequency: '1d',
        unit: 'Basis Points',
        precision: 0,
        apiEndpoint: '/observations?series_id=BAMLC0A0CM',
        tags: ['credit', 'spread', 'investment-grade']
      },
      // Market Indicators
      {
        id: 'vix',
        symbol: 'VIX',
        name: 'VIX Volatility Index',
        description: 'CBOE Volatility Index',
        source: 'MARKET',
        category: 'volatility',
        pillar: 3,
        priority: 1,
        updateFrequency: 'realtime',
        unit: 'Index',
        precision: 2,
        tags: ['volatility', 'fear', 'market']
      },
      {
        id: 'spx',
        symbol: 'SPX',
        name: 'S&P 500 Index',
        description: 'Standard & Poor\'s 500 Index',
        source: 'MARKET',
        category: 'equity',
        pillar: 3,
        priority: 2,
        updateFrequency: 'realtime',
        unit: 'Index',
        precision: 2,
        tags: ['equity', 'benchmark', 'market']
      },
      // Crypto Indicators
      {
        id: 'btc-price',
        symbol: 'BTC-USD',
        name: 'Bitcoin Price',
        description: 'Bitcoin to USD Exchange Rate',
        source: 'COINBASE',
        category: 'crypto',
        pillar: 3,
        priority: 1,
        updateFrequency: 'realtime',
        unit: 'USD',
        precision: 2,
        tags: ['crypto', 'bitcoin', 'price']
      },
      {
        id: 'btc-market-cap',
        symbol: 'BTC-MCAP',
        name: 'Bitcoin Market Cap',
        description: 'Bitcoin Total Market Capitalization',
        source: 'GLASSNODE',
        category: 'crypto',
        pillar: 3,
        priority: 2,
        updateFrequency: '1h',
        unit: 'USD',
        precision: 0,
        tags: ['crypto', 'bitcoin', 'market-cap']
      },
      // Engine-derived indicators
      {
        id: 'net-liquidity',
        symbol: 'NET_LIQ',
        name: 'Net Liquidity',
        description: 'Calculated Net Liquidity (Fed BS - TGA - RRP)',
        source: 'ENGINE',
        category: 'liquidity',
        pillar: 1,
        priority: 0,
        updateFrequency: '1d',
        unit: 'USD Billions',
        precision: 0,
        dependencies: ['fed-balance-sheet', 'treasury-account', 'reverse-repo'],
        transformFunction: 'netLiquidity',
        tags: ['liquidity', 'calculated', 'net']
      },
      {
        id: 'credit-stress-score',
        symbol: 'CREDIT_STRESS',
        name: 'Credit Stress Score',
        description: 'Composite Credit Market Stress Indicator',
        source: 'ENGINE',
        category: 'credit',
        pillar: 2,
        priority: 0,
        updateFrequency: '1d',
        unit: 'Score',
        precision: 1,
        dependencies: ['high-yield-spread', 'investment-grade-spread'],
        transformFunction: 'creditStress',
        tags: ['credit', 'stress', 'composite']
      },
      {
        id: 'data-integrity',
        symbol: 'DATA_INTEGRITY',
        name: 'Data Integrity',
        description: 'Foundation Data Integrity Engine - Monitors data source health and system integrity',
        source: 'ENGINE',
        category: 'foundation',
        pillar: 0,
        priority: 0,
        updateFrequency: '15m',
        unit: 'Score',
        precision: 1,
        transformFunction: 'dataIntegrity',
        tags: ['foundation', 'integrity', 'monitoring']
      }
    ];

    this.registerBulk(defaultIndicators);
  }
}