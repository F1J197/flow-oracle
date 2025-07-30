/**
 * LIQUIDITY² Terminal - FRED Data Service V2
 * Federal Reserve Economic Data integration using Supabase Edge Functions
 */

import { supabase } from '@/integrations/supabase/client';

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
  private cache = new Map<string, { data: FREDDataPoint[]; expiry: number }>();
  private lastActivity = Date.now();
  private readonly CACHE_TTL = 300000; // 5 minutes

  static getInstance(): FREDServiceV2 {
    if (!FREDServiceV2.instance) {
      FREDServiceV2.instance = new FREDServiceV2();
    }
    return FREDServiceV2.instance;
  }

  private constructor() {}

  /**
   * Fetch a single FRED series using dedicated edge function
   */
  async fetchSeries(seriesId: string): Promise<FREDDataPoint[]> {
    try {
      this.lastActivity = Date.now();

      // Check cache first
      const cached = this.getCachedData(seriesId);
      if (cached) {
        return cached;
      }

      // Use dedicated FRED ingestion edge function
      const { data, error } = await supabase.functions.invoke('fred-data-ingestion', {
        body: {
          action: 'fetchSeries',
          seriesId: seriesId
        }
      });

      if (error) {
        console.error(`FRED ingestion error for ${seriesId}:`, error);
        return await this.getFallbackData(seriesId);
      }

      if (data.success && data.data) {
        this.setCachedData(seriesId, data.data);
        return data.data;
      } else {
        console.warn(`FRED ingestion failed for ${seriesId}:`, data.error);
        return await this.getFallbackData(seriesId);
      }

    } catch (error) {
      console.error(`Error fetching FRED series ${seriesId}:`, error);
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

  private getCachedData(seriesId: string): FREDDataPoint[] | null {
    const cached = this.cache.get(seriesId);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
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
