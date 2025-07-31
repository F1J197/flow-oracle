/**
 * Universal Data Service V3 - Enhanced with Multiple Provider Support
 * Comprehensive data service supporting 50+ indicators across multiple providers
 * with intelligent fallback, caching, and real-time capabilities
 */

import { supabase } from '@/integrations/supabase/client';
import UniversalDataProxyV4 from './UniversalDataProxyV4';
import { coinGeckoService } from './providers/CoinGeckoService';
import { twelveDataService } from './providers/TwelveDataService';
import { finnhubService } from './providers/FinnhubService';
import { binanceService } from './DataIngestion/BinanceService';
import { fredServiceWrapper } from './DataIngestion/FREDServiceWrapper';
import { IndicatorRegistry } from './IndicatorRegistry';

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
  provider: 'fred' | 'coingecko' | 'twelvedata' | 'finnhub' | 'binance' | 'coinbase' | 'glassnode';
  endpoint: string;
  symbol?: string;
  parameters?: Record<string, any>;
}

export interface ProviderHealth {
  provider: string;
  available: boolean;
  requestsRemaining?: number;
  cacheSize?: number;
  lastRequest?: number;
  errorRate?: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  cacheSize: number;
  providers: ProviderHealth[];
  lastSuccessfulFetch: number;
  errorRate: number;
  performance: {
    averageResponseTime: number;
    totalRequests: number;
    successfulRequests: number;
  };
}

class UniversalDataServiceV3 {
  private static instance: UniversalDataServiceV3;
  private universalProxy: any;
  private indicatorRegistry: IndicatorRegistry;
  private cache = new Map<string, { data: UniversalIndicatorData; expiry: number }>();
  private healthMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    totalResponseTime: 0,
    errorCount: 0,
    lastSuccessfulFetch: Date.now(),
    providerErrors: new Map<string, number>()
  };
  
  private readonly CACHE_TTL = 300000; // 5 minutes
  private readonly ERROR_THRESHOLD = 0.15; // 15% error rate threshold

  // Provider priority order - free tiers with highest reliability first
  private readonly PROVIDER_PRIORITY: Record<string, string[]> = {
    'crypto': ['coingecko', 'binance', 'twelvedata', 'finnhub'],
    'forex': ['twelvedata', 'finnhub', 'fred'],
    'equity': ['twelvedata', 'finnhub', 'fred'],
    'commodity': ['twelvedata', 'finnhub'],
    'macro': ['fred', 'twelvedata', 'finnhub'],
    'liquidity': ['fred'],
    'volatility': ['twelvedata', 'finnhub'],
    'bond': ['fred', 'twelvedata', 'finnhub']
  };

  private constructor() {
    this.universalProxy = UniversalDataProxyV4;
    this.indicatorRegistry = IndicatorRegistry.getInstance();
    this.startHealthMonitoring();
  }

  static getInstance(): UniversalDataServiceV3 {
    if (!UniversalDataServiceV3.instance) {
      UniversalDataServiceV3.instance = new UniversalDataServiceV3();
    }
    return UniversalDataServiceV3.instance;
  }

  async fetchIndicator(symbol: string, category?: string): Promise<UniversalIndicatorData | null> {
    const startTime = Date.now();
    this.healthMetrics.totalRequests++;

    try {
      // Get indicator metadata to determine optimal provider
      const metadata = this.indicatorRegistry.get(symbol);
      const indicatorCategory = category || metadata?.category || 'macro';

      const cacheKey = `${symbol}:${indicatorCategory}`;
      
      // Check cache first
      const cached = this.getCachedIndicator(cacheKey);
      if (cached) {
        this.recordSuccessfulRequest(startTime);
        return cached;
      }

      // Get provider priority for this category
      const providers = this.PROVIDER_PRIORITY[indicatorCategory] || ['fred', 'twelvedata', 'finnhub'];
      
      let data: UniversalIndicatorData | null = null;
      let lastError: Error | null = null;

      // Try providers in priority order
      for (const provider of providers) {
        try {
          data = await this.fetchFromProvider(symbol, provider, metadata);
          if (data) {
            break; // Success, exit loop
          }
        } catch (error) {
          lastError = error as Error;
          this.recordProviderError(provider);
          console.warn(`Provider ${provider} failed for ${symbol}:`, error);
          continue; // Try next provider
        }
      }

      if (data) {
        this.setCachedIndicator(cacheKey, data);
        this.recordSuccessfulRequest(startTime);
      } else {
        // All providers failed, try fallback data
        data = await this.getFallbackData(symbol);
        if (data) {
          console.log(`Using fallback data for ${symbol}`);
          this.recordSuccessfulRequest(startTime);
        } else {
          throw lastError || new Error(`All providers failed for ${symbol}`);
        }
      }

      return data;
    } catch (error) {
      this.recordFailedRequest(startTime, error as Error);
      console.error(`Error fetching ${symbol}:`, error);
      return null;
    }
  }

  async fetchMultipleIndicators(
    requests: Array<{ symbol: string; category?: string }>
  ): Promise<Record<string, UniversalIndicatorData | null>> {
    const results: Record<string, UniversalIndicatorData | null> = {};
    
    console.log(`🔄 Fetching ${requests.length} indicators from multiple providers...`);
    
    // Group requests by category for optimal provider selection
    const groupedRequests = this.groupRequestsByCategory(requests);
    
    // Process groups in parallel
    const groupPromises = Object.entries(groupedRequests).map(async ([category, symbols]) => {
      const providers = this.PROVIDER_PRIORITY[category] || ['fred', 'twelvedata', 'finnhub'];
      
      // Try to batch fetch from the best provider for this category
      const primaryProvider = providers[0];
      
      try {
        const batchResults = await this.batchFetchFromProvider(symbols, primaryProvider, category);
        return batchResults;
      } catch (error) {
        // If batch fails, fall back to individual requests
        console.warn(`Batch fetch failed for ${category}, falling back to individual requests`);
        const individualResults: Record<string, UniversalIndicatorData | null> = {};
        
        for (const symbol of symbols) {
          individualResults[symbol] = await this.fetchIndicator(symbol, category);
          // Small delay to avoid overwhelming providers
          await this.delay(100);
        }
        
        return individualResults;
      }
    });
    
    const groupResults = await Promise.all(groupPromises);
    
    // Merge results
    groupResults.forEach(groupResult => {
      Object.assign(results, groupResult);
    });
    
    return results;
  }

  private async fetchFromProvider(
    symbol: string, 
    provider: string, 
    metadata?: any
  ): Promise<UniversalIndicatorData | null> {
    switch (provider) {
      case 'coingecko':
        return await coinGeckoService.fetchCryptoPrice(symbol);
      
      case 'twelvedata':
        return await twelveDataService.fetchQuote(symbol);
      
      case 'finnhub':
        return await finnhubService.fetchQuote(symbol);
      
      case 'binance':
        const binanceData = await binanceService.fetchSymbolData(symbol);
        return binanceData ? this.transformToUniversalData(binanceData, symbol, 'binance') : null;
      
      case 'fred':
        const fredData = await fredServiceWrapper.fetchSymbolData(symbol);
        return fredData ? this.transformToUniversalData(fredData, symbol, 'fred') : null;
      
      default:
        // Fall back to universal proxy for other providers
        return await this.universalProxy.fetchIndicator(symbol, provider);
    }
  }

  private async batchFetchFromProvider(
    symbols: string[], 
    provider: string, 
    category: string
  ): Promise<Record<string, UniversalIndicatorData | null>> {
    switch (provider) {
      case 'coingecko':
        return await coinGeckoService.fetchMultipleCryptoPrices(symbols);
      
      case 'twelvedata':
        return await twelveDataService.fetchMultipleQuotes(symbols);
      
      case 'finnhub':
        return await finnhubService.fetchMultipleQuotes(symbols);
      
      case 'binance':
        const binanceResults = await binanceService.fetchMultipleSymbols(symbols);
        const transformedBinance: Record<string, UniversalIndicatorData | null> = {};
        Object.entries(binanceResults).forEach(([symbol, data]) => {
          transformedBinance[symbol] = data ? this.transformToUniversalData(data, symbol, 'binance') : null;
        });
        return transformedBinance;
      
      case 'fred':
        const fredResults = await fredServiceWrapper.fetchMultipleSymbols(symbols);
        const transformedFred: Record<string, UniversalIndicatorData | null> = {};
        Object.entries(fredResults).forEach(([symbol, data]) => {
          transformedFred[symbol] = data ? this.transformToUniversalData(data, symbol, 'fred') : null;
        });
        return transformedFred;
      
      default:
        // For other providers, fall back to individual requests
        const results: Record<string, UniversalIndicatorData | null> = {};
        for (const symbol of symbols) {
          results[symbol] = await this.fetchFromProvider(symbol, provider);
        }
        return results;
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

    const providers: ProviderHealth[] = [
      {
        provider: 'coingecko',
        available: true,
        ...coinGeckoService.getHealthStatus()
      },
      {
        provider: 'twelvedata',
        available: true,
        ...twelveDataService.getHealthStatus()
      },
      {
        provider: 'finnhub',
        available: true,
        ...finnhubService.getHealthStatus()
      },
      {
        provider: 'binance',
        available: true,
        ...binanceService.getHealthStatus()
      },
      {
        provider: 'fred',
        available: true,
        ...fredServiceWrapper.getHealthStatus()
      }
    ];

    return {
      status,
      cacheSize: this.cache.size,
      providers,
      lastSuccessfulFetch: this.healthMetrics.lastSuccessfulFetch,
      errorRate,
      performance: {
        averageResponseTime,
        totalRequests: this.healthMetrics.totalRequests,
        successfulRequests: this.healthMetrics.successfulRequests
      }
    };
  }

  private async getFallbackData(symbol: string): Promise<UniversalIndicatorData | null> {
    try {
      const { data: indicator } = await supabase
        .from('indicators')
        .select('id')
        .eq('symbol', symbol)
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
        confidence: latest.confidence_score || 0.7,
        source: 'database_fallback',
        provider: 'supabase',
        metadata: { fallback: true }
      };
    } catch (error) {
      console.error(`Fallback data fetch failed for ${symbol}:`, error);
      return null;
    }
  }

  private groupRequestsByCategory(requests: Array<{ symbol: string; category?: string }>): Record<string, string[]> {
    const groups: Record<string, string[]> = {};
    
    requests.forEach(({ symbol, category }) => {
      const metadata = this.indicatorRegistry.get(symbol);
      const indicatorCategory = category || metadata?.category || 'macro';
      
      if (!groups[indicatorCategory]) {
        groups[indicatorCategory] = [];
      }
      groups[indicatorCategory].push(symbol);
    });
    
    return groups;
  }

  // Utility and monitoring methods
  private recordSuccessfulRequest(startTime: number): void {
    this.healthMetrics.successfulRequests++;
    this.healthMetrics.totalResponseTime += Date.now() - startTime;
    this.healthMetrics.lastSuccessfulFetch = Date.now();
  }

  private recordFailedRequest(startTime: number, error: Error): void {
    this.healthMetrics.errorCount++;
    this.healthMetrics.totalResponseTime += Date.now() - startTime;
    this.logHealthMetric('error_rate', this.healthMetrics.errorCount / this.healthMetrics.totalRequests);
  }

  private recordProviderError(provider: string): void {
    const current = this.healthMetrics.providerErrors.get(provider) || 0;
    this.healthMetrics.providerErrors.set(provider, current + 1);
  }

  private async logHealthMetric(metricName: string, value: number): Promise<void> {
    try {
      await supabase.from('system_health_metrics').insert({
        component: 'universal_data_service_v3',
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
    }, 60000);
  }

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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private transformToUniversalData(data: any, symbol: string, provider: string): UniversalIndicatorData {
    return {
      symbol,
      current: data.current || data.value || 0,
      previous: data.previous || 0,
      change: data.change || 0,
      changePercent: data.changePercent || 0,
      timestamp: data.timestamp || new Date(),
      confidence: data.confidence || 0.8,
      source: provider,
      provider,
      metadata: data.metadata || {}
    };
  }

  clearCache(): void {
    this.cache.clear();
    coinGeckoService.clearCache();
    twelveDataService.clearCache();
    finnhubService.clearCache();
    console.log('Universal data service V3 cache cleared');
  }
}

export default UniversalDataServiceV3;