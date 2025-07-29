import { UnifiedDataService } from './UnifiedDataService';
import FredApiService from './FredApiService';

interface EnhancedIndicatorData {
  symbol: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  confidence: number;
  source: string;
}

class EnhancedUnifiedDataService {
  private static enhancedInstance: EnhancedUnifiedDataService;
  private fredService: FredApiService;
  private unifiedService: UnifiedDataService;
  private indicatorCache = new Map<string, { data: EnhancedIndicatorData; expiry: number }>();
  private readonly CACHE_TTL = 300000; // 5 minutes

  private constructor() {
    this.unifiedService = UnifiedDataService.getInstance();
    this.fredService = FredApiService.getInstance();
  }

  static getInstance(): EnhancedUnifiedDataService {
    if (!EnhancedUnifiedDataService.enhancedInstance) {
      EnhancedUnifiedDataService.enhancedInstance = new EnhancedUnifiedDataService();
    }
    return EnhancedUnifiedDataService.enhancedInstance;
  }

  async refreshIndicatorWithFallback(symbol: string): Promise<EnhancedIndicatorData | null> {
    // Check cache first
    const cached = this.getCachedIndicator(symbol);
    if (cached) {
      return cached;
    }

    try {
      // Try primary method first
      const primaryData = await this.unifiedService.refreshIndicator(symbol);
      if (primaryData && primaryData.current !== undefined) {
        const enhanced = this.enhanceIndicatorData(symbol, primaryData);
        this.setCachedIndicator(symbol, enhanced);
        return enhanced;
      }
    } catch (error) {
      console.warn(`Primary data fetch failed for ${symbol}, trying FRED API:`, error);
    }

    try {
      // Fallback to enhanced FRED API service
      const fredData = await this.fredService.fetchIndicatorData(symbol);
      if (fredData.length > 0) {
        const enhanced = this.convertFredToEnhanced(symbol, fredData);
        this.setCachedIndicator(symbol, enhanced);
        return enhanced;
      }
    } catch (error) {
      console.error(`FRED API fallback also failed for ${symbol}:`, error);
    }

    // Final fallback to mock data for critical indicators
    if (this.isCriticalIndicator(symbol)) {
      console.warn(`Using mock data for critical indicator: ${symbol}`);
      const mockData = this.generateMockData(symbol);
      this.setCachedIndicator(symbol, mockData);
      return mockData;
    }

    return null;
  }

  async refreshMultipleIndicators(symbols: string[]): Promise<Record<string, EnhancedIndicatorData | null>> {
    const results: Record<string, EnhancedIndicatorData | null> = {};
    
    console.log(`🔄 Refreshing ${symbols.length} indicators with enhanced fallback...`);
    
    // Process in parallel with controlled concurrency
    const chunks = this.chunkArray(symbols, 3); // Process 3 at a time to avoid overwhelming APIs
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (symbol) => {
        const data = await this.refreshIndicatorWithFallback(symbol);
        return { symbol, data };
      });
      
      const chunkResults = await Promise.all(chunkPromises);
      chunkResults.forEach(({ symbol, data }) => {
        results[symbol] = data;
      });
    }

    return results;
  }

  private enhanceIndicatorData(symbol: string, baseData: any): EnhancedIndicatorData {
    const current = Number(baseData.current) || 0;
    const previous = Number(baseData.previous) || current * 0.99;
    const change = current - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

    return {
      symbol,
      current,
      previous,
      change,
      changePercent,
      timestamp: new Date(),
      confidence: baseData.confidence || 0.85,
      source: 'enhanced_unified'
    };
  }

  private convertFredToEnhanced(symbol: string, fredData: any[]): EnhancedIndicatorData {
    const latest = fredData[0];
    const previous = fredData[1];
    
    const current = Number(latest.value) || 0;
    const prev = previous ? Number(previous.value) : current * 0.99;
    const change = current - prev;
    const changePercent = prev !== 0 ? (change / prev) * 100 : 0;

    return {
      symbol,
      current,
      previous: prev,
      change,
      changePercent,
      timestamp: new Date(latest.date),
      confidence: 0.9,
      source: 'fred_api'
    };
  }

  private generateMockData(symbol: string): EnhancedIndicatorData {
    const mockValues: Record<string, number> = {
      'WALCL': 7500000,
      'WTREGEN': 650000,
      'RRPONTSYD': 1800000,
      'DGS10': 4.2,
      'BAMLH0A0HYM2': 380,
      'BAMLC0A0CM': 125,
      'VIXCLS': 18.5
    };

    const baseValue = mockValues[symbol] || 100;
    const variation = (Math.random() - 0.5) * 0.05; // ±2.5% variation
    const current = baseValue * (1 + variation);
    const previous = baseValue * (1 + (Math.random() - 0.5) * 0.03);
    const change = current - previous;
    const changePercent = (change / previous) * 100;

    return {
      symbol,
      current,
      previous,
      change,
      changePercent,
      timestamp: new Date(),
      confidence: 0.7, // Lower confidence for mock data
      source: 'mock_fallback'
    };
  }

  private isCriticalIndicator(symbol: string): boolean {
    const criticalIndicators = [
      'WALCL', 'WTREGEN', 'RRPONTSYD', 'DGS10', 
      'BAMLH0A0HYM2', 'BAMLC0A0CM', 'VIXCLS'
    ];
    return criticalIndicators.includes(symbol);
  }

  private getCachedIndicator(symbol: string): EnhancedIndicatorData | null {
    const cached = this.indicatorCache.get(symbol);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    if (cached) {
      this.indicatorCache.delete(symbol);
    }
    return null;
  }

  private setCachedIndicator(symbol: string, data: EnhancedIndicatorData): void {
    this.indicatorCache.set(symbol, {
      data,
      expiry: Date.now() + this.CACHE_TTL
    });
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Health check for the enhanced service
  getServiceHealth(): {
    cacheSize: number;
    fredServiceHealth: any;
    lastActivity: number;
  } {
    return {
      cacheSize: this.indicatorCache.size,
      fredServiceHealth: this.fredService.getHealthStatus(),
      lastActivity: Date.now()
    };
  }

  // Clear cache manually if needed
  clearCache(): void {
    this.indicatorCache.clear();
    console.log('Enhanced data service cache cleared');
  }
}

export default EnhancedUnifiedDataService;