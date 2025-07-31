/**
 * Unified Data Service V3 - Centralized data management with rate limiting
 * Resolves FRED API rate limiting issues by implementing intelligent caching and request management
 */

import { FREDService } from './FREDService';
import { RateLimiter } from './RateLimiter';

export interface UniversalIndicatorData {
  id: string;
  current: number;
  previous?: number;
  change?: number;
  changePercent?: number;
  timestamp: string;
  source: string;
  confidence: number;
  metadata?: Record<string, any>;
}

interface CachedIndicator {
  data: UniversalIndicatorData;
  expiry: number;
  requestInProgress?: boolean;
}

/**
 * Enhanced unified data service with intelligent rate limiting and caching
 */
class UnifiedDataServiceV3 {
  private static instance: UnifiedDataServiceV3;
  private cache = new Map<string, CachedIndicator>();
  private rateLimiter = RateLimiter.getInstance();
  private readonly CACHE_TTL = 300000; // 5 minutes
  private readonly STALE_TTL = 1800000; // 30 minutes for stale data
  
  // FRED symbol mapping
  private readonly FRED_SYMBOLS: Record<string, string> = {
    'fed-balance-sheet': 'WALCL',
    'treasury-general-account': 'WTREGEN', 
    'reverse-repo-operations': 'RRPONTSYD',
    'net-liquidity': 'WALCL', // Base component for calculation
    'high-yield-spread': 'BAMLH0A0HYM2',
    'investment-grade-spread': 'BAMLC0A0CM',
    'vix': 'VIXCLS',
    'spx': 'SP500',
    'dxy': 'DEXUSEU',
    'yields-10y': 'DGS10',
    'yields-2y': 'DGS2',
    'unemployment': 'UNRATE',
    'inflation': 'CPIAUCSL',
    'gdp': 'GDP',
    'money-supply': 'M2SL'
  };

  static getInstance(): UnifiedDataServiceV3 {
    if (!UnifiedDataServiceV3.instance) {
      UnifiedDataServiceV3.instance = new UnifiedDataServiceV3();
    }
    return UnifiedDataServiceV3.instance;
  }

  private constructor() {}

  /**
   * Refresh a single indicator with intelligent caching and rate limiting
   */
  async refreshIndicator(indicatorId: string): Promise<UniversalIndicatorData | null> {
    console.log(`Refreshing indicator: ${indicatorId}`);
    
    // Check cache first
    const cached = this.getCachedIndicator(indicatorId, true);
    if (cached) {
      console.log(`Using cached data for ${indicatorId}`);
      return cached;
    }

    // Check if request is already in progress
    const cacheEntry = this.cache.get(indicatorId);
    if (cacheEntry?.requestInProgress) {
      console.log(`Request already in progress for ${indicatorId}, waiting...`);
      // Wait a bit and return cached data if available
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.getCachedIndicator(indicatorId, true);
    }

    try {
      // Mark request as in progress
      if (cacheEntry) {
        cacheEntry.requestInProgress = true;
      } else {
        this.cache.set(indicatorId, {
          data: null as any,
          expiry: 0,
          requestInProgress: true
        });
      }

      const data = await this.fetchIndicatorData(indicatorId);
      
      if (data) {
        this.setCachedIndicator(indicatorId, data);
        return data;
      }

      return null;

    } catch (error) {
      console.error(`Error refreshing indicator ${indicatorId}:`, error);
      
      // Try to return stale cached data as fallback
      const staleData = this.getCachedIndicator(indicatorId, true);
      if (staleData) {
        console.log(`Using stale data for ${indicatorId} due to error`);
        return staleData;
      }
      
      return null;
    } finally {
      // Clear in-progress flag
      const entry = this.cache.get(indicatorId);
      if (entry) {
        entry.requestInProgress = false;
      }
    }
  }

  /**
   * Refresh multiple indicators efficiently
   */
  async refreshMultipleIndicators(indicatorIds: string[]): Promise<Record<string, UniversalIndicatorData | null>> {
    console.log(`Refreshing multiple indicators: ${indicatorIds.join(', ')}`);
    
    const results: Record<string, UniversalIndicatorData | null> = {};
    const uncachedIds: string[] = [];

    // Check cache for all indicators first
    for (const id of indicatorIds) {
      const cached = this.getCachedIndicator(id);
      if (cached) {
        results[id] = cached;
      } else {
        uncachedIds.push(id);
      }
    }

    if (uncachedIds.length === 0) {
      return results;
    }

    // Process uncached indicators with careful rate limiting
    const promises = uncachedIds.map(async (id) => {
      try {
        const data = await this.refreshIndicator(id);
        results[id] = data;
      } catch (error) {
        console.error(`Failed to refresh ${id}:`, error);
        results[id] = null;
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Fetch indicator data from appropriate source
   */
  private async fetchIndicatorData(indicatorId: string): Promise<UniversalIndicatorData | null> {
    const fredSymbol = this.FRED_SYMBOLS[indicatorId];
    
    if (fredSymbol) {
      return await this.fetchFromFRED(indicatorId, fredSymbol);
    }

    // Handle other data sources here (crypto, real-time data, etc.)
    console.warn(`No data source configured for indicator: ${indicatorId}`);
    return null;
  }

  /**
   * Fetch data from FRED with rate limiting
   */
  private async fetchFromFRED(indicatorId: string, fredSymbol: string): Promise<UniversalIndicatorData | null> {
    try {
      console.log(`Fetching ${indicatorId} from FRED (${fredSymbol})`);
      
      const data = await this.rateLimiter.execute(
        'fred-service',
        async () => {
          return await FREDService.fetchSeries(fredSymbol);
        },
        2000 // 2 second minimum interval
      );

      if (!data || data.length === 0) {
        console.warn(`No data returned for ${fredSymbol}`);
        return null;
      }

      // Transform FRED data to Universal format
      const latest = data[data.length - 1];
      const previous = data.length > 1 ? data[data.length - 2] : null;
      
      const change = previous ? latest.value - previous.value : 0;
      const changePercent = previous && previous.value !== 0 ? (change / previous.value) * 100 : 0;

      return {
        id: indicatorId,
        current: latest.value,
        previous: previous?.value,
        change,
        changePercent,
        timestamp: new Date(latest.date).toISOString(),
        source: 'fred',
        confidence: 100, // FRED data is highly reliable
        metadata: {
          fredSymbol,
          dataPoints: data.length,
          lastUpdated: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error(`FRED fetch failed for ${indicatorId} (${fredSymbol}):`, error);
      return null;
    }
  }

  /**
   * Get cached indicator data
   */
  private getCachedIndicator(indicatorId: string, allowStale: boolean = false): UniversalIndicatorData | null {
    const cached = this.cache.get(indicatorId);
    if (!cached || !cached.data) return null;

    // Return fresh data if not expired
    if (cached.expiry > Date.now()) {
      return cached.data;
    }

    // Return stale data if allowed and within stale TTL
    if (allowStale && (cached.expiry + this.STALE_TTL) > Date.now()) {
      console.log(`Using stale cached data for ${indicatorId}`);
      return cached.data;
    }

    return null;
  }

  /**
   * Cache indicator data
   */
  private setCachedIndicator(indicatorId: string, data: UniversalIndicatorData): void {
    this.cache.set(indicatorId, {
      data,
      expiry: Date.now() + this.CACHE_TTL,
      requestInProgress: false
    });
  }

  /**
   * Get service health status
   */
  getHealthStatus(): {
    cacheSize: number;
    rateLimiterStatus: Record<string, any>;
    fredServiceStatus: Record<string, any>;
  } {
    return {
      cacheSize: this.cache.size,
      rateLimiterStatus: this.rateLimiter.getStatus(),
      fredServiceStatus: FREDService.getHealthStatus()
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
    FREDService.clearCache();
    this.rateLimiter.reset();
  }

  /**
   * Get all available indicators
   */
  getAvailableIndicators(): string[] {
    return Object.keys(this.FRED_SYMBOLS);
  }
}

export const UnifiedDataService = UnifiedDataServiceV3.getInstance();