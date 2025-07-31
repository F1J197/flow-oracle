/**
 * LIQUIDITY² Terminal - FRED Data Service V2
 * Federal Reserve Economic Data integration using Supabase Edge Functions
 */

import { supabase } from '@/integrations/supabase/client';
import { RateLimiter } from './RateLimiter';

interface FREDDataPoint {
  date: string;
  value: number;
}

interface FREDResponse {
  success: boolean;
  data?: FREDDataPoint[];
  error?: string;
  timestamp?: string;
}

/**
 * FRED Data Service V2 - Now using dedicated Edge Functions
 * Features: Dedicated FRED ingestion, Enhanced caching, Improved error handling
 */
class FREDServiceV2 {
  private static instance: FREDServiceV2;
  private cache = new Map<string, { data: FREDDataPoint[]; expiry: number; stale?: boolean }>();
  private lastActivity = Date.now();
  private readonly CACHE_TTL = 300000; // 5 minutes
  private readonly STALE_TTL = 1800000; // 30 minutes for stale data
  private rateLimiter = RateLimiter.getInstance();

  static getInstance(): FREDServiceV2 {
    if (!FREDServiceV2.instance) {
      FREDServiceV2.instance = new FREDServiceV2();
    }
    return FREDServiceV2.instance;
  }

  private constructor() {}

  /**
   * Fetch a single FRED series using dedicated edge function with rate limiting
   */
  async fetchSeries(seriesId: string): Promise<FREDDataPoint[]> {
    try {
      this.lastActivity = Date.now();

      // Check cache first (including stale data)
      const cached = this.getCachedData(seriesId, true);
      if (cached) {
        console.log(`Using cached data for ${seriesId}`);
        return cached;
      }

      // Use rate limiter to prevent overwhelming the API
      return await this.rateLimiter.execute(
        'fred-api',
        async () => {
          console.log(`Making rate-limited request for ${seriesId}`);
          
          // Use dedicated FRED ingestion edge function
          const { data, error } = await supabase.functions.invoke('fred-data-ingestion', {
            body: {
              series: seriesId // Use legacy format to maintain compatibility
            }
          });

          if (error) {
            console.error(`FRED ingestion error for ${seriesId}:`, error);
            throw new Error(`FRED API error: ${error.message || error}`);
          }

          if (data && data.success && data.data) {
            this.setCachedData(seriesId, data.data);
            return data.data;
          } else {
            console.warn(`FRED ingestion failed for ${seriesId}:`, data?.error);
            throw new Error(data?.error || 'Unknown FRED API error');
          }
        },
        3000 // 3 second minimum interval between requests
      );

    } catch (error) {
      console.error(`Error fetching FRED series ${seriesId}:`, error);
      
      // Try to get stale cached data as fallback
      const staleData = this.getCachedData(seriesId, true);
      if (staleData) {
        console.log(`Using stale cached data for ${seriesId} as fallback`);
        return staleData;
      }
      
      // Try database fallback
      return await this.getFallbackData(seriesId);
    }
  }

  /**
   * Fetch multiple FRED series using dedicated edge function
   */
  async fetchMultipleSeries(seriesIds: string[]): Promise<Record<string, FREDDataPoint[]>> {
    try {
      this.lastActivity = Date.now();

      // Check cache for all series first
      const results: Record<string, FREDDataPoint[]> = {};
      const uncachedIds: string[] = [];

      for (const seriesId of seriesIds) {
        const cached = this.getCachedData(seriesId);
        if (cached) {
          results[seriesId] = cached;
        } else {
          uncachedIds.push(seriesId);
        }
      }

      if (uncachedIds.length === 0) {
        return results;
      }

      // Use dedicated FRED ingestion edge function for uncached series
      const { data, error } = await supabase.functions.invoke('fred-data-ingestion', {
        body: {
          action: 'fetchMultipleSeries',
          seriesIds: uncachedIds
        }
      });

      if (error) {
        console.error('FRED multi-series ingestion error:', error);
        // Get fallback data for uncached series
        for (const seriesId of uncachedIds) {
          results[seriesId] = await this.getFallbackData(seriesId);
        }
      } else if (data.success && data.data) {
        // Cache and merge results
        for (const [seriesId, seriesData] of Object.entries(data.data)) {
          const typedData = seriesData as FREDDataPoint[];
          this.setCachedData(seriesId, typedData);
          results[seriesId] = typedData;
        }
      } else {
        console.warn('FRED multi-series ingestion failed:', data.error);
        // Get fallback data for uncached series
        for (const seriesId of uncachedIds) {
          results[seriesId] = await this.getFallbackData(seriesId);
        }
      }

      return results;

    } catch (error) {
      console.error('Error fetching multiple FRED series:', error);
      const results: Record<string, FREDDataPoint[]> = {};
      for (const seriesId of seriesIds) {
        results[seriesId] = await this.getFallbackData(seriesId);
      }
      return results;
    }
  }

  private getCachedData(seriesId: string, allowStale: boolean = false): FREDDataPoint[] | null {
    const cached = this.cache.get(seriesId);
    if (cached) {
      // Return fresh data if not expired
      if (cached.expiry > Date.now()) {
        return cached.data;
      }
      // Return stale data if allowed and within stale TTL
      if (allowStale && (cached.expiry + this.STALE_TTL) > Date.now()) {
        console.log(`Using stale cached data for ${seriesId}`);
        return cached.data;
      }
    }
    return null;
  }

  private setCachedData(seriesId: string, data: FREDDataPoint[]): void {
    this.cache.set(seriesId, {
      data,
      expiry: Date.now() + this.CACHE_TTL
    });
  }

  private async getFallbackData(seriesId: string): Promise<FREDDataPoint[]> {
    try {
      // Try to get historical data from database
      const { data } = await supabase
        .from('data_points')
        .select('timestamp, value')
        .order('timestamp', { ascending: true })
        .limit(1000);

      if (data && data.length > 0) {
        return data.map(item => ({
          date: item.timestamp.split('T')[0],
          value: typeof item.value === 'string' ? parseFloat(item.value) : item.value
        }));
      }
    } catch (error) {
      console.error(`Database fallback failed for ${seriesId}:`, error);
    }

    return [];
  }

  /**
   * Get service health status
   */
  getHealthStatus(): { cacheSize: number; lastActivity: number } {
    return {
      cacheSize: this.cache.size,
      lastActivity: this.lastActivity,
    };
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const FREDService = FREDServiceV2.getInstance();
