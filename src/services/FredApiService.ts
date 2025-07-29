import { supabase } from '@/integrations/supabase/client';

interface FredApiConfig {
  baseUrl: string;
  apiKey: string;
  rateLimitDelay: number;
  maxRetries: number;
  timeout: number;
}

interface FredDataPoint {
  date: string;
  value: string;
  realtime_start: string;
  realtime_end: string;
}

interface FredResponse {
  observations: FredDataPoint[];
}

class FredApiService {
  private static instance: FredApiService;
  private config: FredApiConfig;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;

  private constructor() {
    this.config = {
      baseUrl: 'https://api.stlouisfed.org/fred',
      apiKey: 'baf5a172a9b068e621dd4f80fc13dad2', // Public demo key
      rateLimitDelay: 2000, // 2 seconds between requests to avoid 429 errors
      maxRetries: 3,
      timeout: 10000
    };
  }

  static getInstance(): FredApiService {
    if (!FredApiService.instance) {
      FredApiService.instance = new FredApiService();
    }
    return FredApiService.instance;
  }

  async fetchIndicatorData(seriesId: string): Promise<FredDataPoint[]> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const data = await this.makeRateLimitedRequest(seriesId);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        // Ensure rate limiting
        const timeSinceLastRequest = Date.now() - this.lastRequestTime;
        if (timeSinceLastRequest < this.config.rateLimitDelay) {
          await this.delay(this.config.rateLimitDelay - timeSinceLastRequest);
        }

        try {
          await request();
        } catch (error) {
          console.error('Request failed:', error);
        }

        this.lastRequestTime = Date.now();
      }
    }

    this.isProcessingQueue = false;
  }

  private async makeRateLimitedRequest(seriesId: string, retryCount = 0): Promise<FredDataPoint[]> {
    try {
      console.log(`🔄 Fetching FRED data for ${seriesId} (attempt ${retryCount + 1})`);

      // Use Supabase Edge Function instead of direct API call to avoid CORS issues
      const { data, error } = await supabase.functions.invoke('fred-data-ingestion', {
        body: {
          series: seriesId,
          apiEndpoint: `/observations?series_id=${seriesId}`
        }
      });

      if (error) {
        throw new Error(`FRED API error: ${error.message}`);
      }

      if (data?.success && data?.results) {
        const seriesResult = data.results.find((result: any) => result.symbol === seriesId);
        if (seriesResult?.status === 'success' && seriesResult?.data) {
          return this.parseFredResponse(seriesResult.data);
        } else if (seriesResult?.error) {
          throw new Error(`FRED API error for ${seriesId}: ${seriesResult.error}`);
        }
      }

      throw new Error(`No valid data returned for ${seriesId}`);

    } catch (error) {
      console.error(`❌ FRED API request failed for ${seriesId}:`, error);

      // Handle rate limiting specifically
      if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        if (retryCount < this.config.maxRetries) {
          const backoffDelay = Math.pow(2, retryCount) * 5000; // Exponential backoff
          console.log(`⏳ Rate limited. Retrying ${seriesId} in ${backoffDelay}ms...`);
          await this.delay(backoffDelay);
          return this.makeRateLimitedRequest(seriesId, retryCount + 1);
        }
      }

      // For other errors, try fallback to cached data
      const cachedData = await this.getFallbackData(seriesId);
      if (cachedData.length > 0) {
        console.log(`📦 Using cached fallback data for ${seriesId}`);
        return cachedData;
      }

      throw error;
    }
  }

  private parseFredResponse(responseData: any): FredDataPoint[] {
    if (responseData?.observations && Array.isArray(responseData.observations)) {
      return responseData.observations
        .filter((obs: any) => obs.value !== '.' && obs.value !== null)
        .map((obs: any) => ({
          date: obs.date,
          value: obs.value,
          realtime_start: obs.realtime_start || obs.date,
          realtime_end: obs.realtime_end || obs.date
        }));
    }
    return [];
  }

  private async getFallbackData(seriesId: string): Promise<FredDataPoint[]> {
    try {
      // Try to get recent data from Supabase
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
        .limit(100);

      if (dataPoints && dataPoints.length > 0) {
        return dataPoints.map(dp => ({
          date: dp.timestamp.split('T')[0],
          value: dp.value.toString(),
          realtime_start: dp.timestamp.split('T')[0],
          realtime_end: dp.timestamp.split('T')[0]
        }));
      }
    } catch (error) {
      console.error(`Failed to get fallback data for ${seriesId}:`, error);
    }

    return [];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Batch fetch multiple indicators with proper spacing
  async fetchMultipleIndicators(seriesIds: string[]): Promise<Record<string, FredDataPoint[]>> {
    const results: Record<string, FredDataPoint[]> = {};
    
    console.log(`🔄 Fetching ${seriesIds.length} FRED indicators with rate limiting...`);
    
    for (const seriesId of seriesIds) {
      try {
        results[seriesId] = await this.fetchIndicatorData(seriesId);
        console.log(`✅ Successfully fetched ${seriesId}`);
      } catch (error) {
        console.error(`❌ Failed to fetch ${seriesId}:`, error);
        results[seriesId] = [];
      }
    }

    return results;
  }

  // Get service health status
  getHealthStatus(): {
    queueLength: number;
    isProcessing: boolean;
    lastRequestTime: number;
    rateLimitDelay: number;
  } {
    return {
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessingQueue,
      lastRequestTime: this.lastRequestTime,
      rateLimitDelay: this.config.rateLimitDelay
    };
  }
}

export default FredApiService;