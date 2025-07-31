/**
 * Unified Data Service - Fixed Implementation
 * Consolidates data fetching with proper indicator ID mapping and enhanced error handling
 */

import { supabase } from '@/integrations/supabase/client';
import { coinGeckoService } from './providers/CoinGeckoService';
import { twelveDataService } from './providers/TwelveDataService';
import { finnhubService } from './providers/FinnhubService';
import { binanceService } from './DataIngestion/BinanceService';
import { fredServiceWrapper } from './DataIngestion/FREDServiceWrapper';
import { CalculationEngineV2 } from './CalculationEngineV2';
import { 
  ALL_UNIFIED_INDICATORS,
  getIndicatorById,
  getCalculatedIndicators,
  getDependencyMap,
  type UnifiedIndicatorConfig
} from '@/config/unifiedIndicators.config';
import { 
  ENHANCED_PROVIDER_REGISTRY,
  getProviderMapping,
  getSupportedProviders,
  getProviderFallbackChain,
  getRequiredProvider
} from '@/config/providerSymbolMappings.enhanced';

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

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  cacheSize: number;
  providers: Array<{
    provider: string;
    available: boolean;
    requestsRemaining?: number;
    cacheSize?: number;
    lastRequest?: number;
    errorRate?: number;
  }>;
  lastSuccessfulFetch: number;
  errorRate: number;
  performance: {
    averageResponseTime: number;
    totalRequests: number;
    successfulRequests: number;
  };
}

export class UnifiedDataServiceFixed {
  private static instance: UnifiedDataServiceFixed;
  private calculationEngine: CalculationEngineV2;
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

  private constructor() {
    this.calculationEngine = CalculationEngineV2.getInstance();
    this.startHealthMonitoring();
  }

  static getInstance(): UnifiedDataServiceFixed {
    if (!UnifiedDataServiceFixed.instance) {
      UnifiedDataServiceFixed.instance = new UnifiedDataServiceFixed();
    }
    return UnifiedDataServiceFixed.instance;
  }

  /**
   * Fetch a single indicator with automatic fallback
   */
  async fetchIndicator(indicatorId: string): Promise<UniversalIndicatorData | null> {
    const startTime = Date.now();
    this.healthMetrics.totalRequests++;

    try {
      // Check cache first
      const cached = this.getCachedIndicator(indicatorId);
      if (cached) {
        this.recordSuccess(startTime);
        return cached;
      }

      // Get indicator configuration
      const config = getIndicatorById(indicatorId);
      if (!config) {
        console.warn(`No configuration found for indicator: ${indicatorId}`);
        return null;
      }

      // Handle calculated indicators
      if (config.source === 'ENGINE') {
        return await this.fetchCalculatedIndicator(indicatorId, config);
      }

      // Fetch from data providers
      return await this.fetchFromProviders(indicatorId, config);

    } catch (error) {
      this.recordError('fetchIndicator', error);
      console.error(`Error fetching indicator ${indicatorId}:`, error);
      return null;
    }
  }

  /**
   * Fetch calculated indicator with dependency resolution
   */
  private async fetchCalculatedIndicator(
    indicatorId: string, 
    config: UnifiedIndicatorConfig
  ): Promise<UniversalIndicatorData | null> {
    if (!config.dependencies || config.dependencies.length === 0) {
      console.warn(`Calculated indicator ${indicatorId} has no dependencies defined`);
      return null;
    }

    // Fetch all dependencies
    const dependencyData = new Map<string, UniversalIndicatorData>();
    const missingDependencies: string[] = [];

    for (const depId of config.dependencies) {
      const depData = await this.fetchIndicator(depId);
      if (depData) {
        dependencyData.set(depId, depData);
      } else {
        missingDependencies.push(depId);
      }
    }

    if (missingDependencies.length > 0) {
      console.warn(`Missing dependencies for ${indicatorId}:`, missingDependencies);
      return null;
    }

    // Calculate the indicator
    const context = {
      data: dependencyData,
      timestamp: new Date(),
      metadata: { indicatorId, config }
    };

    const result = await this.calculationEngine.calculateIndicator(indicatorId, context);
    
    if (result) {
      this.setCachedIndicator(indicatorId, result);
    }

    return result;
  }

  /**
   * Fetch from data providers with fallback chain
   */
  private async fetchFromProviders(
    indicatorId: string, 
    config: UnifiedIndicatorConfig
  ): Promise<UniversalIndicatorData | null> {
    // Check if indicator requires specific provider
    const requiredProvider = getRequiredProvider(indicatorId);
    if (requiredProvider) {
      const result = await this.fetchFromProvider(indicatorId, requiredProvider, config);
      if (result) {
        this.setCachedIndicator(indicatorId, result);
        return result;
      }
    }

    // Try fallback chain based on category
    const fallbackChain = getProviderFallbackChain(config.category);
    
    for (const provider of fallbackChain) {
      const mapping = getProviderMapping(indicatorId, provider as keyof typeof ENHANCED_PROVIDER_REGISTRY);
      if (!mapping) continue;

      try {
        const result = await this.fetchFromProvider(indicatorId, provider, config);
        if (result) {
          this.setCachedIndicator(indicatorId, result);
          return result;
        }
      } catch (error) {
        this.recordProviderError(provider, error);
        console.warn(`Provider ${provider} failed for ${indicatorId}:`, error);
        continue;
      }
    }

    // Try fallback data from Supabase
    return await this.getFallbackData(indicatorId);
  }

  /**
   * Fetch from specific provider
   */
  private async fetchFromProvider(
    indicatorId: string, 
    provider: string, 
    config: UnifiedIndicatorConfig
  ): Promise<UniversalIndicatorData | null> {
    const mapping = getProviderMapping(indicatorId, provider as keyof typeof ENHANCED_PROVIDER_REGISTRY);
    if (!mapping) {
      throw new Error(`No mapping found for ${indicatorId} on provider ${provider}`);
    }

    switch (provider) {
      case 'fred':
        return await this.fetchFromFred(mapping, config);
      case 'coinbase':
        return await this.fetchFromCoinbase(mapping, config);
      case 'coingecko':
        return await this.fetchFromCoinGecko(mapping, config);
      case 'twelvedata':
        return await this.fetchFromTwelveData(mapping, config);
      case 'finnhub':
        return await this.fetchFromFinnhub(mapping, config);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Provider-specific fetch methods
   */
  private async fetchFromFred(mapping: any, config: UnifiedIndicatorConfig): Promise<UniversalIndicatorData | null> {
    try {
      const data = await fredServiceWrapper.fetchIndicator(mapping.providerSymbol);
      return this.transformToUniversalData(data, mapping.indicatorId, 'fred', config);
    } catch (error) {
      console.error(`FRED fetch error for ${mapping.indicatorId}:`, error);
      return null;
    }
  }

  private async fetchFromCoinbase(mapping: any, config: UnifiedIndicatorConfig): Promise<UniversalIndicatorData | null> {
    try {
      // Using binance service as coinbase equivalent for now
      const data = await binanceService.fetchTicker(mapping.providerSymbol);
      return this.transformToUniversalData(data, mapping.indicatorId, 'coinbase', config);
    } catch (error) {
      console.error(`Coinbase fetch error for ${mapping.indicatorId}:`, error);
      return null;
    }
  }

  private async fetchFromCoinGecko(mapping: any, config: UnifiedIndicatorConfig): Promise<UniversalIndicatorData | null> {
    try {
      const data = await coinGeckoService.fetchCryptoPrice(mapping.providerSymbol);
      return data;
    } catch (error) {
      console.error(`CoinGecko fetch error for ${mapping.indicatorId}:`, error);
      return null;
    }
  }

  private async fetchFromTwelveData(mapping: any, config: UnifiedIndicatorConfig): Promise<UniversalIndicatorData | null> {
    try {
      const data = await twelveDataService.fetchQuote(mapping.providerSymbol);
      return data;
    } catch (error) {
      console.error(`TwelveData fetch error for ${mapping.indicatorId}:`, error);
      return null;
    }
  }

  private async fetchFromFinnhub(mapping: any, config: UnifiedIndicatorConfig): Promise<UniversalIndicatorData | null> {
    try {
      const data = await finnhubService.fetchQuote(mapping.providerSymbol);
      return data;
    } catch (error) {
      console.error(`Finnhub fetch error for ${mapping.indicatorId}:`, error);
      return null;
    }
  }

  /**
   * Transform provider data to universal format
   */
  private transformToUniversalData(
    data: any, 
    indicatorId: string, 
    provider: string,
    config: UnifiedIndicatorConfig
  ): UniversalIndicatorData | null {
    if (!data || typeof data.value !== 'number') {
      return null;
    }

    const current = data.value;
    const previous = data.previousValue || current;
    const change = current - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

    return {
      symbol: config.symbol,
      current,
      previous,
      change,
      changePercent,
      timestamp: new Date(data.date || Date.now()),
      confidence: data.confidence || 0.9,
      source: config.source,
      provider,
      metadata: {
        indicatorId,
        unit: config.unit,
        originalData: data
      }
    };
  }

  /**
   * Fallback data from Supabase
   */
  private async getFallbackData(indicatorId: string): Promise<UniversalIndicatorData | null> {
    try {
      const { data, error } = await supabase
        .from('market_data_cache')
        .select('*')
        .eq('symbol', indicatorId)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        return null;
      }

      const record = data[0];
      return {
        symbol: record.symbol,
        current: record.value,
        previous: record.previous_value || record.value,
        change: record.change || 0,
        changePercent: record.change_percent || 0,
        timestamp: new Date(record.timestamp),
        confidence: 0.7, // Lower confidence for cached data
        source: 'CACHE',
        provider: 'supabase',
        metadata: { cached: true }
      };
    } catch (error) {
      console.error(`Fallback data error for ${indicatorId}:`, error);
      return null;
    }
  }

  /**
   * Cache management
   */
  private getCachedIndicator(indicatorId: string): UniversalIndicatorData | null {
    const cached = this.cache.get(indicatorId);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    return null;
  }

  private setCachedIndicator(indicatorId: string, data: UniversalIndicatorData): void {
    this.cache.set(indicatorId, {
      data,
      expiry: Date.now() + this.CACHE_TTL
    });
  }

  /**
   * Health monitoring
   */
  private recordSuccess(startTime: number): void {
    this.healthMetrics.successfulRequests++;
    this.healthMetrics.totalResponseTime += Date.now() - startTime;
    this.healthMetrics.lastSuccessfulFetch = Date.now();
  }

  private recordError(operation: string, error: any): void {
    this.healthMetrics.errorCount++;
    console.error(`${operation} error:`, error);
  }

  private recordProviderError(provider: string, error: any): void {
    const current = this.healthMetrics.providerErrors.get(provider) || 0;
    this.healthMetrics.providerErrors.set(provider, current + 1);
  }

  private startHealthMonitoring(): void {
    setInterval(() => {
      const status = this.getHealthStatus();
      if (status.status !== 'healthy') {
        console.warn('Data service health degraded:', status);
      }
    }, 60000); // Check every minute
  }

  /**
   * Public API methods
   */
  async fetchMultipleIndicators(indicatorIds: string[]): Promise<Record<string, UniversalIndicatorData | null>> {
    const results: Record<string, UniversalIndicatorData | null> = {};
    
    // Use Promise.allSettled to handle partial failures gracefully
    const promises = indicatorIds.map(async id => ({
      id,
      data: await this.fetchIndicator(id)
    }));

    const settledPromises = await Promise.allSettled(promises);
    
    settledPromises.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results[result.value.id] = result.value.data;
      } else {
        results[indicatorIds[index]] = null;
        console.error(`Failed to fetch ${indicatorIds[index]}:`, result.reason);
      }
    });

    return results;
  }

  getHealthStatus(): HealthStatus {
    const errorRate = this.healthMetrics.totalRequests > 0 
      ? this.healthMetrics.errorCount / this.healthMetrics.totalRequests 
      : 0;

    const avgResponseTime = this.healthMetrics.successfulRequests > 0
      ? this.healthMetrics.totalResponseTime / this.healthMetrics.successfulRequests
      : 0;

    return {
      status: errorRate < this.ERROR_THRESHOLD ? 'healthy' : 'degraded',
      cacheSize: this.cache.size,
      providers: this.getProviderHealthStatus(),
      lastSuccessfulFetch: this.healthMetrics.lastSuccessfulFetch,
      errorRate,
      performance: {
        averageResponseTime: avgResponseTime,
        totalRequests: this.healthMetrics.totalRequests,
        successfulRequests: this.healthMetrics.successfulRequests
      }
    };
  }

  private getProviderHealthStatus() {
    return [
      { provider: 'fred', available: true, cacheSize: 0 },
      { provider: 'coinbase', available: true, cacheSize: 0 },
      { provider: 'coingecko', available: true, cacheSize: coinGeckoService.getHealthStatus().cacheSize },
      { provider: 'twelvedata', available: true, cacheSize: twelveDataService.getHealthStatus().cacheSize },
      { provider: 'finnhub', available: true, cacheSize: finnhubService.getHealthStatus().cacheSize }
    ];
  }

  clearCache(): void {
    this.cache.clear();
    coinGeckoService.clearCache();
    twelveDataService.clearCache();
    finnhubService.clearCache();
  }

  // Utility methods for debugging
  getRegisteredIndicators(): string[] {
    return ALL_UNIFIED_INDICATORS.map(indicator => indicator.id);
  }

  getCalculatedIndicatorIds(): string[] {
    return getCalculatedIndicators().map(indicator => indicator.id);
  }

  getDependencies(indicatorId: string): string[] {
    return this.calculationEngine.getDependencies(indicatorId);
  }
}

export default UnifiedDataServiceFixed;