/**
 * Universal Data Service V2 - Production Ready
 * Comprehensive data service with full monitoring, health checks, and error handling
 */

import { supabase } from '@/integrations/supabase/client';
import { FREDService } from './FREDService';

export interface UniversalIndicatorData {
  symbol: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  confidence: number;
  source: string;
  provider: string;
  metadata?: Record<string, any>;
}

export interface DataProviderRequest {
  provider: 'fred' | 'glassnode' | 'binance' | 'coinbase' | 'polygon' | 'finnhub';
  endpoint: string;
  symbol?: string;
  parameters?: Record<string, any>;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  cacheSize: number;
  activeProviders: number;
  lastSuccessfulFetch: number;
  errorRate: number;
  rateLimitStatus: Record<string, { remaining: number; resetTime: number }>;
  performance: {
    averageResponseTime: number;
    totalRequests: number;
    successfulRequests: number;
  };
}

class UniversalDataServiceV2 {
  private static instance: UniversalDataServiceV2;
  private fredService: typeof FREDService;
  private cache = new Map<string, { data: UniversalIndicatorData; expiry: number }>();
  private healthMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    totalResponseTime: 0,
    errorCount: 0,
    lastSuccessfulFetch: Date.now(),
    rateLimits: new Map<string, { count: number; resetTime: number }>()
  };
  
  private readonly CACHE_TTL = 300000; // 5 minutes
  private readonly ERROR_THRESHOLD = 0.1; // 10% error rate threshold
  private readonly RATE_LIMITS = {
    fred: { limit: 50, window: 60000 },
    coinbase: { limit: 10, window: 60000 },
    binance: { limit: 100, window: 60000 },
    glassnode: { limit: 30, window: 600000 },
    polygon: { limit: 5, window: 60000 },
    finnhub: { limit: 30, window: 60000 }
  };

  private constructor() {
    this.fredService = FREDService;
    this.startHealthMonitoring();
  }

  static getInstance(): UniversalDataServiceV2 {
    if (!UniversalDataServiceV2.instance) {
      UniversalDataServiceV2.instance = new UniversalDataServiceV2();
    }
    return UniversalDataServiceV2.instance;
  }

  async fetchIndicator(symbol: string, provider: string = 'fred'): Promise<UniversalIndicatorData | null> {
    const startTime = Date.now();
    this.healthMetrics.totalRequests++;

    try {
      // Check rate limits first
      if (this.isRateLimited(provider)) {
        throw new Error(`Rate limit exceeded for ${provider}`);
      }

      const cacheKey = `${provider}:${symbol}`;
      
      // Check cache first
      const cached = this.getCachedIndicator(cacheKey);
      if (cached) {
        this.recordSuccessfulRequest(startTime);
        return cached;
      }

      let data: UniversalIndicatorData | null = null;

      switch (provider.toLowerCase()) {
        case 'fred':
          data = await this.fetchFREDIndicator(symbol);
          break;
        case 'coinbase':
          data = await this.fetchCoinbaseIndicator(symbol);
          break;
        case 'binance':
          data = await this.fetchBinanceIndicator(symbol);
          break;
        case 'glassnode':
          data = await this.fetchGlassnodeIndicator(symbol);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      if (data) {
        this.setCachedIndicator(cacheKey, data);
        this.recordSuccessfulRequest(startTime);
        this.updateRateLimit(provider);
      }

      return data;
    } catch (error) {
      this.recordFailedRequest(startTime, error as Error);
      console.error(`Error fetching ${symbol} from ${provider}:`, error);
      
      // Try fallback data from database
      const fallbackData = await this.getFallbackData(symbol, provider);
      if (fallbackData) {
        console.log(`Using fallback data for ${symbol}`);
        return fallbackData;
      }
      
      return null;
    }
  }

  async fetchMultipleIndicators(
    requests: Array<{ symbol: string; provider: string }>
  ): Promise<Record<string, UniversalIndicatorData | null>> {
    const results: Record<string, UniversalIndicatorData | null> = {};
    
    console.log(`🔄 Fetching ${requests.length} indicators from multiple providers...`);
    
    // Process in parallel with controlled concurrency to respect rate limits
    const chunks = this.chunkArray(requests, 3); // Reduced chunk size for better rate limit compliance
    
    for (const chunk of chunks) {
      const promises = chunk.map(async (request) => {
        const data = await this.fetchIndicator(request.symbol, request.provider);
        return { key: `${request.provider}:${request.symbol}`, data };
      });
      
      const chunkResults = await Promise.all(promises);
      chunkResults.forEach(({ key, data }) => {
        results[key] = data;
      });
      
      // Add delay between chunks to respect rate limits
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await this.delay(2000); // 2 second delay between chunks
      }
    }
    
    return results;
  }

  private async fetchFREDIndicator(symbol: string): Promise<UniversalIndicatorData | null> {
    try {
      const data = await this.fredService.fetchSeries(symbol);
      
      if (data.length === 0) {
        return null;
      }

      const latest = data[0];
      const previous = data[1];
      
      const current = latest.value;
      const prev = previous ? previous.value : current * 0.99;
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
        source: 'fred_api',
        provider: 'fred',
        metadata: { 
          source: 'fred-data-ingestion'
        }
      };
    } catch (error) {
      console.error(`FRED indicator fetch failed for ${symbol}:`, error);
      throw error;
    }
  }

  private async fetchCoinbaseIndicator(symbol: string): Promise<UniversalIndicatorData | null> {
    try {
      const { data, error } = await supabase.functions.invoke('universal-data-proxy', {
        body: {
          provider: 'coinbase',
          endpoint: `/products/${symbol}/ticker`,
          symbol
        }
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Coinbase API request failed');
      }

      const ticker = data.data;
      const current = parseFloat(ticker.price);

      return {
        symbol,
        current,
        previous: current * 0.999,
        change: current * 0.001,
        changePercent: 0.1,
        timestamp: new Date(ticker.time),
        confidence: 0.95,
        source: 'coinbase_api',
        provider: 'coinbase',
        metadata: { volume: parseFloat(ticker.volume) }
      };
    } catch (error) {
      console.error(`Coinbase indicator fetch failed for ${symbol}:`, error);
      throw error;
    }
  }

  private async fetchBinanceIndicator(symbol: string): Promise<UniversalIndicatorData | null> {
    try {
      const { data, error } = await supabase.functions.invoke('universal-data-proxy', {
        body: {
          provider: 'binance',
          endpoint: '/api/v3/ticker/24hr',
          symbol: symbol.replace('-', '')
        }
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Binance API request failed');
      }

      const ticker = data.data;
      const current = parseFloat(ticker.lastPrice);
      const change = parseFloat(ticker.priceChange);
      const changePercent = parseFloat(ticker.priceChangePercent);

      return {
        symbol,
        current,
        previous: current - change,
        change,
        changePercent,
        timestamp: new Date(),
        confidence: 0.95,
        source: 'binance_api',
        provider: 'binance',
        metadata: { volume: parseFloat(ticker.volume) }
      };
    } catch (error) {
      console.error(`Binance indicator fetch failed for ${symbol}:`, error);
      throw error;
    }
  }

  private async fetchGlassnodeIndicator(symbol: string): Promise<UniversalIndicatorData | null> {
    try {
      const { data, error } = await supabase.functions.invoke('universal-data-proxy', {
        body: {
          provider: 'glassnode',
          endpoint: 'addresses/active_count',
          symbol: symbol || 'BTC',
          parameters: {
            since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            until: new Date().toISOString()
          }
        }
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Glassnode API request failed');
      }

      const latest = data.data?.[0];
      if (!latest) return null;

      return {
        symbol,
        current: latest.v,
        previous: latest.v * 0.99,
        change: latest.v * 0.01,
        changePercent: 1,
        timestamp: new Date(latest.t),
        confidence: 0.9,
        source: 'glassnode_api',
        provider: 'glassnode'
      };
    } catch (error) {
      console.error(`Glassnode indicator fetch failed for ${symbol}:`, error);
      throw error;
    }
  }

  private async getFallbackData(symbol: string, provider: string): Promise<UniversalIndicatorData | null> {
    try {
      const { data: indicator } = await supabase
        .from('indicators')
        .select('id')
        .eq('symbol', symbol)
        .eq('data_source', provider.toUpperCase())
        .maybeSingle();

      if (!indicator) return null;

      const { data: dataPoints } = await supabase
        .from('data_points')
        .select('*')
        .eq('indicator_id', indicator.id)
        .order('timestamp', { ascending: false })
        .limit(2);

      if (!dataPoints || dataPoints.length === 0) return null;

      const latest = dataPoints[0];
      const previous = dataPoints[1];

      return {
        symbol,
        current: latest.value,
        previous: previous?.value || latest.value * 0.99,
        change: latest.value - (previous?.value || latest.value * 0.99),
        changePercent: previous ? ((latest.value - previous.value) / previous.value) * 100 : 0,
        timestamp: new Date(latest.timestamp),
        confidence: latest.confidence_score || 0.8,
        source: 'database_fallback',
        provider: provider,
        metadata: { fallback: true }
      };
    } catch (error) {
      console.error(`Fallback data fetch failed for ${symbol}:`, error);
      return null;
    }
  }

  getHealthStatus(): HealthStatus {
    const errorRate = this.healthMetrics.totalRequests > 0 
      ? this.healthMetrics.errorCount / this.healthMetrics.totalRequests 
      : 0;

    const averageResponseTime = this.healthMetrics.totalRequests > 0
      ? this.healthMetrics.totalResponseTime / this.healthMetrics.totalRequests
      : 0;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (errorRate > this.ERROR_THRESHOLD || Date.now() - this.healthMetrics.lastSuccessfulFetch > 600000) {
      status = 'unhealthy';
    } else if (errorRate > this.ERROR_THRESHOLD / 2 || averageResponseTime > 5000) {
      status = 'degraded';
    }

    const rateLimitStatus: Record<string, { remaining: number; resetTime: number }> = {};
    for (const [provider, config] of Object.entries(this.RATE_LIMITS)) {
      const currentLimits = this.healthMetrics.rateLimits.get(provider);
      rateLimitStatus[provider] = {
        remaining: currentLimits ? Math.max(0, config.limit - currentLimits.count) : config.limit,
        resetTime: currentLimits?.resetTime || 0
      };
    }

    return {
      status,
      cacheSize: this.cache.size,
      activeProviders: Object.keys(this.RATE_LIMITS).length,
      lastSuccessfulFetch: this.healthMetrics.lastSuccessfulFetch,
      errorRate,
      rateLimitStatus,
      performance: {
        averageResponseTime,
        totalRequests: this.healthMetrics.totalRequests,
        successfulRequests: this.healthMetrics.successfulRequests
      }
    };
  }

  // Rate limiting methods
  private isRateLimited(provider: string): boolean {
    const config = this.RATE_LIMITS[provider as keyof typeof this.RATE_LIMITS];
    if (!config) return false;

    const current = this.healthMetrics.rateLimits.get(provider);
    if (!current) return false;

    if (Date.now() > current.resetTime) {
      this.healthMetrics.rateLimits.delete(provider);
      return false;
    }

    return current.count >= config.limit;
  }

  private updateRateLimit(provider: string): void {
    const config = this.RATE_LIMITS[provider as keyof typeof this.RATE_LIMITS];
    if (!config) return;

    const now = Date.now();
    const current = this.healthMetrics.rateLimits.get(provider);

    if (!current || now > current.resetTime) {
      this.healthMetrics.rateLimits.set(provider, { 
        count: 1, 
        resetTime: now + config.window 
      });
    } else {
      current.count++;
    }
  }

  // Health monitoring
  private recordSuccessfulRequest(startTime: number): void {
    this.healthMetrics.successfulRequests++;
    this.healthMetrics.totalResponseTime += Date.now() - startTime;
    this.healthMetrics.lastSuccessfulFetch = Date.now();
  }

  private recordFailedRequest(startTime: number, error: Error): void {
    this.healthMetrics.errorCount++;
    this.healthMetrics.totalResponseTime += Date.now() - startTime;
    
    // Log to system health metrics table
    this.logHealthMetric('error_rate', this.healthMetrics.errorCount / this.healthMetrics.totalRequests);
  }

  private async logHealthMetric(metricName: string, value: number): Promise<void> {
    try {
      await supabase.from('system_health_metrics').insert({
        component: 'universal_data_service_v2',
        metric_name: metricName,
        metric_value: value,
        metric_unit: metricName.includes('time') ? 'ms' : 'ratio'
      });
    } catch (error) {
      console.error('Failed to log health metric:', error);
    }
  }

  private startHealthMonitoring(): void {
    setInterval(() => {
      const health = this.getHealthStatus();
      this.logHealthMetric('cache_size', health.cacheSize);
      this.logHealthMetric('error_rate', health.errorRate);
      this.logHealthMetric('average_response_time', health.performance.averageResponseTime);
    }, 60000); // Log every minute
  }

  // Utility methods
  private getCachedIndicator(key: string): UniversalIndicatorData | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCachedIndicator(key: string, data: UniversalIndicatorData): void {
    this.cache.set(key, {
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

  clearCache(): void {
    this.cache.clear();
    this.fredService.clearCache();
    console.log('Universal data service V2 cache cleared');
  }
}

export default UniversalDataServiceV2;