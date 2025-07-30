import { supabase } from '@/integrations/supabase/client';
import { getFREDSeriesId, hasValidFREDMapping } from '@/config/fredSymbolMapping';

export interface FREDDataPoint {
  date: string;
  value: number;
  realtime_start: string;
  realtime_end: string;
}

export interface FREDResponse {
  success: boolean;
  data?: {
    observations: FREDDataPoint[];
  };
  error?: string;
  timestamp: string;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  };
}

class FREDService {
  private static instance: FREDService;
  private cache = new Map<string, { data: FREDDataPoint[]; expiry: number }>();
  private readonly CACHE_TTL = 300000; // 5 minutes

  private constructor() {}

  static getInstance(): FREDService {
    if (!FREDService.instance) {
      FREDService.instance = new FREDService();
    }
    return FREDService.instance;
  }

  async fetchSeries(seriesId: string): Promise<FREDDataPoint[]> {
    // Map internal symbol to FRED series ID
    const fredSeriesId = getFREDSeriesId(seriesId);
    
    // Check if we have a valid mapping
    if (!hasValidFREDMapping(seriesId) && seriesId === fredSeriesId) {
      console.warn(`No FRED mapping found for symbol: ${seriesId}`);
    }
    
    // Check cache first
    const cached = this.getCachedData(fredSeriesId);
    if (cached) {
      console.log(`Using cached FRED data for ${seriesId} (${fredSeriesId})`);
      return cached;
    }

    try {
      console.log(`Fetching FRED data for ${seriesId} -> ${fredSeriesId} via universal proxy`);
      
      const { data, error } = await supabase.functions.invoke('universal-data-proxy', {
        body: {
          provider: 'fred',
          endpoint: '/series/observations',
          symbol: fredSeriesId,
          parameters: {
            limit: 10,
            sort_order: 'desc'
          }
        }
      });

      if (error) {
        throw new Error(`Supabase function error: ${error.message}`);
      }

      const response = data as FREDResponse;
      
      if (!response.success) {
        throw new Error(response.error || 'FRED API request failed');
      }

      const observations = response.data?.observations || [];
      const validData = this.processObservations(observations);
      
      // Cache the result
      this.setCachedData(fredSeriesId, validData);
      
      console.log(`✅ Successfully fetched ${validData.length} data points for ${seriesId} (${fredSeriesId})`);
      return validData;

    } catch (error) {
      console.error(`❌ FRED service error for ${seriesId}:`, error);
      
      // Try fallback to cached data or database
      const fallbackData = await this.getFallbackData(seriesId);
      if (fallbackData.length > 0) {
        console.log(`📦 Using fallback data for ${seriesId}`);
        return fallbackData;
      }
      
      throw error;
    }
  }

  async fetchMultipleSeries(seriesIds: string[]): Promise<Record<string, FREDDataPoint[]>> {
    const results: Record<string, FREDDataPoint[]> = {};
    
    console.log(`🔄 Fetching ${seriesIds.length} FRED series...`);
    
    // Process in parallel with controlled concurrency
    const chunks = this.chunkArray(seriesIds, 3);
    
    for (const chunk of chunks) {
      const promises = chunk.map(async (seriesId) => {
        try {
          const data = await this.fetchSeries(seriesId);
          return { seriesId, data, success: true };
        } catch (error) {
          console.error(`Failed to fetch ${seriesId}:`, error);
          return { seriesId, data: [], success: false };
        }
      });
      
      const chunkResults = await Promise.all(promises);
      chunkResults.forEach(({ seriesId, data }) => {
        results[seriesId] = data;
      });
      
      // Add delay between chunks to respect rate limits
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await this.delay(1000);
      }
    }
    
    return results;
  }

  private processObservations(observations: any[]): FREDDataPoint[] {
    return observations
      .filter(obs => obs.value !== '.' && obs.value !== null && !isNaN(parseFloat(obs.value)))
      .map(obs => ({
        date: obs.date,
        value: parseFloat(obs.value),
        realtime_start: obs.realtime_start || obs.date,
        realtime_end: obs.realtime_end || obs.date
      }));
  }

  private async getFallbackData(seriesId: string): Promise<FREDDataPoint[]> {
    try {
      const { data: indicator } = await supabase
        .from('indicators')
        .select('id')
        .eq('symbol', seriesId)
        .eq('data_source', 'FRED')
        .single();

      if (!indicator) {
        return [];
      }

      const { data: dataPoints } = await supabase
        .from('data_points')
        .select('*')
        .eq('indicator_id', indicator.id)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (dataPoints && dataPoints.length > 0) {
        return dataPoints.map(dp => ({
          date: dp.timestamp.split('T')[0],
          value: dp.value,
          realtime_start: dp.timestamp.split('T')[0],
          realtime_end: dp.timestamp.split('T')[0]
        }));
      }
    } catch (error) {
      console.error(`Failed to get fallback data for ${seriesId}:`, error);
    }

    return [];
  }

  private getCachedData(seriesId: string): FREDDataPoint[] | null {
    const cached = this.cache.get(seriesId);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(seriesId);
    }
    return null;
  }

  private setCachedData(seriesId: string, data: FREDDataPoint[]): void {
    this.cache.set(seriesId, {
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health check
  getHealthStatus(): {
    cacheSize: number;
    lastActivity: number;
  } {
    return {
      cacheSize: this.cache.size,
      lastActivity: Date.now()
    };
  }

  clearCache(): void {
    this.cache.clear();
    console.log('FRED service cache cleared');
  }
}

export default FREDService;