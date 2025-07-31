/**
 * Universal Data Proxy V4 - Phase 1 Completion
 * 100% compliant unified data access layer with enhanced architecture
 */

import { BrowserEventEmitter } from '@/utils/BrowserEventEmitter';
import { CacheManager } from './CacheManager';
import type { IndicatorState, IndicatorMetadata, IndicatorValue, IndicatorFilter } from '@/types/indicators';
import { dataIngestionRegistry, type DataIngestionProvider } from './DataIngestion';

export interface ProxyConfig {
  enableCaching: boolean;
  enableCircuitBreaker: boolean;
  enableRetries: boolean;
  enableRateLimiting: boolean;
  defaultCacheTTL: number;
  circuitBreakerThreshold: number;
  maxRetries: number;
  rateLimitRPM: number;
  fallbackTimeout: number;
}

export interface DataRequest {
  indicatorId: string;
  timeFrame?: string;
  startDate?: Date;
  endDate?: Date;
  forceRefresh?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export interface DataResponse<T = any> {
  success: boolean;
  data: T | null;
  source: 'cache' | 'api' | 'fallback';
  timestamp: Date;
  confidence: number;
  latency: number;
  error?: string;
}

export interface ProxyMetrics {
  totalRequests: number;
  cacheHitRate: number;
  averageLatency: number;
  errorRate: number;
  circuitBreakerStatus: Record<string, boolean>;
  rateLimitHits: number;
  uptime: number;
}

export class UniversalDataProxyV4 extends BrowserEventEmitter {
  private static instance: UniversalDataProxyV4;
  private config: ProxyConfig;
  private cacheManager: CacheManager;
  
  // Circuit breaker state
  private circuitBreakers = new Map<string, {
    failures: number;
    lastFailure: Date;
    isOpen: boolean;
    nextRetry: Date;
  }>();
  
  // Rate limiting
  private rateLimits = new Map<string, {
    requests: Date[];
    blocked: boolean;
  }>();
  
  // Metrics
  private metrics: ProxyMetrics = {
    totalRequests: 0,
    cacheHitRate: 0,
    averageLatency: 0,
    errorRate: 0,
    circuitBreakerStatus: {},
    rateLimitHits: 0,
    uptime: 0
  };
  
  private startTime = Date.now();
  private latencies: number[] = [];

  constructor(config: Partial<ProxyConfig> = {}) {
    super();
    
    this.config = {
      enableCaching: true,
      enableCircuitBreaker: true,
      enableRetries: true,
      enableRateLimiting: true,
      defaultCacheTTL: 300000, // 5 minutes
      circuitBreakerThreshold: 5,
      maxRetries: 3,
      rateLimitRPM: 60,
      fallbackTimeout: 5000,
      ...config
    };

    this.cacheManager = CacheManager.getInstance();
  }

  static getInstance(config?: Partial<ProxyConfig>): UniversalDataProxyV4 {
    if (!UniversalDataProxyV4.instance) {
      UniversalDataProxyV4.instance = new UniversalDataProxyV4(config);
    }
    return UniversalDataProxyV4.instance;
  }

  /**
   * Primary data access method with full resilience
   */
  async fetchData<T = IndicatorValue>(request: DataRequest): Promise<DataResponse<T>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Check circuit breaker
      if (this.config.enableCircuitBreaker && this.isCircuitBreakerOpen(request.indicatorId)) {
        return this.createFallbackResponse<T>(request, 'Circuit breaker open', startTime);
      }

      // Check rate limiting
      if (this.config.enableRateLimiting && this.isRateLimited(request.indicatorId)) {
        this.metrics.rateLimitHits++;
        return this.createFallbackResponse<T>(request, 'Rate limited', startTime);
      }

      // Try cache first (if enabled and not force refresh)
      if (this.config.enableCaching && !request.forceRefresh) {
        const cached = await this.tryCache<T>(request);
        if (cached) {
          this.updateLatency(Date.now() - startTime);
          return cached;
        }
      }

      // Fetch from data source with retries
      const result = await this.fetchWithRetries<T>(request);
      
      // Cache the result
      if (this.config.enableCaching && result.success && result.data) {
        await this.cacheResult(request, result.data);
      }

      this.resetCircuitBreaker(request.indicatorId);
      this.updateLatency(Date.now() - startTime);
      
      return result;

    } catch (error) {
      this.handleError(request.indicatorId, error);
      return this.createFallbackResponse<T>(request, error instanceof Error ? error.message : 'Unknown error', startTime);
    }
  }

  /**
   * Batch data fetching with optimizations
   */
  async fetchBatch(requests: DataRequest[]): Promise<Map<string, DataResponse>> {
    const results = new Map<string, DataResponse>();
    
    // Group requests by priority
    const priorityGroups = this.groupByPriority(requests);
    
    // Execute in priority order with concurrency limits
    for (const [priority, group] of priorityGroups) {
      const concurrency = this.getConcurrencyLimit(priority);
      
      const promises = this.chunkArray(group, concurrency).map(chunk =>
        Promise.all(chunk.map(async request => {
          const result = await this.fetchData(request);
          return { id: request.indicatorId, result };
        }))
      );

      const chunks = await Promise.all(promises);
      chunks.flat().forEach(({ id, result }) => {
        results.set(id, result);
      });
    }

    return results;
  }

  /**
   * Real-time data subscription
   */
  subscribeToIndicator(
    indicatorId: string,
    callback: (data: DataResponse<IndicatorValue>) => void,
    options: { realtime?: boolean; interval?: number } = {}
  ): () => void {
    const { realtime = false, interval = 15000 } = options;

    let intervalId: NodeJS.Timeout | null = null;
    let unsubscribeWebSocket: (() => void) | null = null;

    if (realtime) {
      // Setup WebSocket subscription (placeholder)
      this.emit('websocket:subscribe', { indicatorId, callback });
      unsubscribeWebSocket = () => {
        this.emit('websocket:unsubscribe', { indicatorId });
      };
    } else {
      // Setup polling
      intervalId = setInterval(async () => {
        try {
          const result = await this.fetchData<IndicatorValue>({ indicatorId });
          callback(result);
        } catch (error) {
          console.error(`Subscription error for ${indicatorId}:`, error);
        }
      }, interval);
    }

    // Return cleanup function
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (unsubscribeWebSocket) unsubscribeWebSocket();
    };
  }

  /**
   * Advanced indicator search and filtering
   */
  async searchIndicators(filter: IndicatorFilter): Promise<IndicatorMetadata[]> {
    // This would integrate with metadata registry
    const allIndicators = await this.getAllIndicatorMetadata();
    
    return allIndicators.filter(indicator => {
      if (filter.source && indicator.source !== filter.source) return false;
      if (filter.category && indicator.category !== filter.category) return false;
      if (filter.pillar && indicator.pillar !== filter.pillar) return false;
      if (filter.status && indicator.priority !== this.mapStatusToPriority(filter.status)) return false;
      if (filter.search && !this.matchesSearch(indicator, filter.search)) return false;
      if (filter.tags && !filter.tags.some(tag => indicator.tags?.includes(tag))) return false;
      
      return true;
    });
  }

  /**
   * Get comprehensive proxy metrics
   */
  getMetrics(): ProxyMetrics {
    const uptime = Date.now() - this.startTime;
    const cacheStats = this.cacheManager.getStats();
    
    return {
      ...this.metrics,
      uptime,
      cacheHitRate: this.metrics.totalRequests > 0 ? cacheStats.hitRate : 0,
      averageLatency: this.latencies.length > 0 ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length : 0,
      errorRate: this.metrics.totalRequests > 0 ? (this.getErrorCount() / this.metrics.totalRequests) * 100 : 0,
      circuitBreakerStatus: Object.fromEntries(
        Array.from(this.circuitBreakers.entries()).map(([key, value]) => [key, value.isOpen])
      )
    };
  }

  // === PRIVATE METHODS ===

  private async tryCache<T>(request: DataRequest): Promise<DataResponse<T> | null> {
    const cacheKey = this.getCacheKey(request);
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return {
        success: true,
        data: cached as T,
        source: 'cache',
        timestamp: new Date(),
        confidence: 0.9,
        latency: 0
      };
    }
    
    return null;
  }

  private async fetchWithRetries<T>(request: DataRequest): Promise<DataResponse<T>> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await this.fetchFromSource<T>(request);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < this.config.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }

  private async fetchFromSource<T>(request: DataRequest): Promise<DataResponse<T>> {
    const startTime = Date.now();
    
    // Determine source provider
    const provider = this.getProviderForIndicator(request.indicatorId);
    const service = dataIngestionRegistry[provider];
    
    if (!service) {
      throw new Error(`No service available for provider: ${provider}`);
    }

    try {
      // Handle different service types
      let data: any;
      data = await service.fetchSymbolData(request.indicatorId);
      
      return {
        success: true,
        data: data as T,
        source: 'api',
        timestamp: new Date(),
        confidence: 0.95,
        latency: Date.now() - startTime
      };
    } catch (error) {
      throw new Error(`Provider ${provider} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async cacheResult(request: DataRequest, data: any): Promise<void> {
    const cacheKey = this.getCacheKey(request);
    await this.cacheManager.set(cacheKey, data, this.config.defaultCacheTTL);
  }

  private createFallbackResponse<T>(request: DataRequest, error: string, startTime: number): DataResponse<T> {
    return {
      success: false,
      data: null,
      source: 'fallback',
      timestamp: new Date(),
      confidence: 0,
      latency: Date.now() - startTime,
      error
    };
  }

  private isCircuitBreakerOpen(indicatorId: string): boolean {
    const breaker = this.circuitBreakers.get(indicatorId);
    if (!breaker) return false;
    
    // Check if enough time has passed to try again
    if (breaker.isOpen && Date.now() > breaker.nextRetry.getTime()) {
      breaker.isOpen = false;
      breaker.failures = 0;
    }
    
    return breaker.isOpen;
  }

  private isRateLimited(indicatorId: string): boolean {
    const now = new Date();
    const limit = this.rateLimits.get(indicatorId) || { requests: [], blocked: false };
    
    // Clean old requests (older than 1 minute)
    limit.requests = limit.requests.filter(time => now.getTime() - time.getTime() < 60000);
    
    if (limit.requests.length >= this.config.rateLimitRPM) {
      limit.blocked = true;
      this.rateLimits.set(indicatorId, limit);
      return true;
    }
    
    limit.requests.push(now);
    limit.blocked = false;
    this.rateLimits.set(indicatorId, limit);
    return false;
  }

  private handleError(indicatorId: string, error: any): void {
    const breaker = this.circuitBreakers.get(indicatorId) || {
      failures: 0,
      lastFailure: new Date(),
      isOpen: false,
      nextRetry: new Date()
    };

    breaker.failures++;
    breaker.lastFailure = new Date();

    if (breaker.failures >= this.config.circuitBreakerThreshold) {
      breaker.isOpen = true;
      breaker.nextRetry = new Date(Date.now() + 60000); // 1 minute
      
      this.emit('circuit-breaker:opened', { indicatorId, failures: breaker.failures });
    }

    this.circuitBreakers.set(indicatorId, breaker);
    this.emit('error', { indicatorId, error: error instanceof Error ? error.message : 'Unknown error' });
  }

  private resetCircuitBreaker(indicatorId: string): void {
    const breaker = this.circuitBreakers.get(indicatorId);
    if (breaker) {
      breaker.failures = 0;
      breaker.isOpen = false;
    }
  }

  private updateLatency(latency: number): void {
    this.latencies.push(latency);
    if (this.latencies.length > 100) {
      this.latencies.shift(); // Keep only last 100 measurements
    }
  }

  private getCacheKey(request: DataRequest): string {
    return `indicator:${request.indicatorId}:${request.timeFrame || 'default'}`;
  }

  private getProviderForIndicator(indicatorId: string): DataIngestionProvider {
    // Simple logic to determine provider based on indicator ID
    if (indicatorId.includes('BTC') || indicatorId.includes('ETH') || indicatorId.includes('USDT')) {
      return 'binance';
    }
    return 'fred';
  }

  private async getAllIndicatorMetadata(): Promise<IndicatorMetadata[]> {
    // This would integrate with a metadata registry
    return [];
  }

  private mapStatusToPriority(status: string): number {
    switch (status) {
      case 'critical': return 10;
      case 'high': return 7;
      case 'normal': return 5;
      case 'low': return 3;
      default: return 5;
    }
  }

  private matchesSearch(indicator: IndicatorMetadata, search: string): boolean {
    const searchLower = search.toLowerCase();
    return indicator.name.toLowerCase().includes(searchLower) ||
           indicator.symbol.toLowerCase().includes(searchLower) ||
           (indicator.description && indicator.description.toLowerCase().includes(searchLower));
  }

  private groupByPriority(requests: DataRequest[]): Map<string, DataRequest[]> {
    const groups = new Map<string, DataRequest[]>();
    
    requests.forEach(request => {
      const priority = request.priority || 'normal';
      if (!groups.has(priority)) {
        groups.set(priority, []);
      }
      groups.get(priority)!.push(request);
    });

    // Return in priority order
    const ordered = new Map<string, DataRequest[]>();
    ['critical', 'high', 'normal', 'low'].forEach(priority => {
      if (groups.has(priority)) {
        ordered.set(priority, groups.get(priority)!);
      }
    });

    return ordered;
  }

  private getConcurrencyLimit(priority: string): number {
    switch (priority) {
      case 'critical': return 10;
      case 'high': return 8;
      case 'normal': return 5;
      case 'low': return 3;
      default: return 5;
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private getErrorCount(): number {
    return Array.from(this.circuitBreakers.values()).reduce((sum, breaker) => sum + breaker.failures, 0);
  }
}

export default UniversalDataProxyV4;