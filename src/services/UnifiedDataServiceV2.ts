import {
  IndicatorState,
  IndicatorSubscription,
  IndicatorMetadata,
  IndicatorValue,
  IndicatorStatus,
  DataPoint,
  TimeFrame,
  HistoricalDataRequest,
  WebSocketMessage
} from '@/types/indicators';
import { IndicatorRegistry } from './IndicatorRegistry';
import { CacheManager } from './CacheManager';
import { MockDataProvider } from './MockDataProvider';
import { supabase } from '@/integrations/supabase/client';

interface ConnectionHealth {
  websocket: boolean;
  database: boolean;
  lastCheck: Date;
  latency: number;
}

interface DataServiceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  cacheHitRate: number;
}

/**
 * Enhanced unified data service with improved architecture, caching, and WebSocket support
 * Implements the unified DataService singleton pattern from the PRD
 */
export class UnifiedDataServiceV2 {
  private static instance: UnifiedDataServiceV2;
  private registry: IndicatorRegistry;
  private cache: CacheManager;
  private subscriptions: Map<string, Set<IndicatorSubscription>> = new Map();
  private indicatorStates: Map<string, IndicatorState> = new Map();
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionHealth: ConnectionHealth = {
    websocket: false,
    database: false,
    lastCheck: new Date(),
    latency: 0
  };
  private metrics: DataServiceMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageLatency: 0,
    cacheHitRate: 0
  };

  private constructor() {
    this.registry = IndicatorRegistry.getInstance();
    this.cache = CacheManager.getInstance();
    this.initializeMockData();
    this.initializeWebSocket();
    this.startHealthMonitoring();
  }

  static getInstance(): UnifiedDataServiceV2 {
    if (!UnifiedDataServiceV2.instance) {
      UnifiedDataServiceV2.instance = new UnifiedDataServiceV2();
    }
    return UnifiedDataServiceV2.instance;
  }

  /**
   * Subscribe to indicator updates with enhanced error handling
   */
  subscribe(subscription: IndicatorSubscription): () => void {
    const { indicatorId } = subscription;
    
    if (!this.subscriptions.has(indicatorId)) {
      this.subscriptions.set(indicatorId, new Set());
    }
    
    this.subscriptions.get(indicatorId)!.add(subscription);

    // Initialize indicator state if not exists
    if (!this.indicatorStates.has(indicatorId)) {
      this.initializeIndicatorState(indicatorId);
    }

    // Send current state if available
    const state = this.indicatorStates.get(indicatorId);
    if (state) {
      subscription.callback(state);
    }

    // Request real-time updates via WebSocket
    this.requestRealtimeUpdates(indicatorId);

    return () => {
      const subs = this.subscriptions.get(indicatorId);
      if (subs) {
        subs.delete(subscription);
        if (subs.size === 0) {
          this.subscriptions.delete(indicatorId);
          this.unsubscribeFromRealtime(indicatorId);
        }
      }
    };
  }

  /**
   * Enhanced data fetching with improved caching and error handling
   */
  async refreshIndicator(indicatorId: string): Promise<IndicatorValue | null> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    const metadata = this.registry.get(indicatorId);
    if (!metadata) {
      this.metrics.failedRequests++;
      throw new Error(`Indicator ${indicatorId} not found in registry`);
    }

    // Check cache first
    const cacheKey = `indicator:${indicatorId}:current`;
    const cached = this.cache.get<IndicatorValue>(cacheKey);
    if (cached) {
      this.updateCacheHitRate(true);
      return cached;
    }

    this.updateCacheHitRate(false);

    try {
      this.updateIndicatorStatus(indicatorId, 'loading');

      let value: IndicatorValue | null = null;

      switch (metadata.source) {
        case 'FRED':
          value = await this.fetchFredData(metadata);
          break;
        case 'GLASSNODE':
          value = await this.fetchGlassnodeData(metadata);
          break;
        case 'COINBASE':
          value = await this.fetchCoinbaseData(metadata);
          break;
        case 'MARKET':
          value = await this.fetchMarketData(metadata);
          break;
        case 'ENGINE':
          value = await this.calculateEngineData(metadata);
          break;
        default:
          throw new Error(`Unsupported data source: ${metadata.source}`);
      }

      if (value) {
        this.updateIndicatorValue(indicatorId, value);
        this.updateIndicatorStatus(indicatorId, 'active');
        
        // Enhanced caching with TTL based on data source
        const ttl = this.getTTLForSource(metadata.source);
        this.cache.set(cacheKey, value, ttl, metadata.source);
      }

      this.metrics.successfulRequests++;
      this.updateLatency(Date.now() - startTime);
      return value;
    } catch (error) {
      console.error(`Error refreshing indicator ${indicatorId}:`, error);
      this.updateIndicatorError(indicatorId, error instanceof Error ? error.message : 'Unknown error');
      this.metrics.failedRequests++;
      return null;
    }
  }

  /**
   * Enhanced historical data retrieval with better caching
   */
  async getHistoricalData(request: HistoricalDataRequest): Promise<DataPoint[]> {
    const { indicatorId, timeFrame, startDate, endDate, limit } = request;
    const cacheKey = `historical:${indicatorId}:${timeFrame}:${startDate?.toISOString()}:${endDate?.toISOString()}:${limit}`;

    // Check cache first
    const cached = this.cache.get<DataPoint[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from('data_points')
        .select(`
          timestamp,
          value,
          raw_data,
          indicators!inner(symbol, name)
        `)
        .eq('indicators.symbol', this.registry.get(indicatorId)?.symbol)
        .order('timestamp', { ascending: false })
        .range(0, limit || 100);

      if (error) throw error;

      const dataPoints: DataPoint[] = (data || []).map(row => ({
        timestamp: new Date(row.timestamp),
        value: row.value,
        metadata: (row.raw_data as Record<string, any>) || {}
      }));

      // Cache for 15 minutes
      this.cache.set(cacheKey, dataPoints, 15 * 60 * 1000, 'historical');
      return dataPoints;
    } catch (error) {
      console.error(`Error fetching historical data for ${indicatorId}:`, error);
      return [];
    }
  }

  /**
   * Get connection health status
   */
  getConnectionHealth(): ConnectionHealth {
    return { ...this.connectionHealth };
  }

  /**
   * Get service metrics
   */
  getMetrics(): DataServiceMetrics {
    return { ...this.metrics };
  }

  /**
   * Enhanced WebSocket initialization
   */
  private initializeWebSocket(): void {
    try {
      const wsUrl = `wss://gotlitraitdvltnjdnni.supabase.co/functions/v1/realtime-indicators`;
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('WebSocket connected to indicators service');
        this.connectionHealth.websocket = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.websocket.onmessage = (event) => {
        this.handleWebSocketMessage(event);
      };

      this.websocket.onclose = () => {
        console.log('WebSocket disconnected');
        this.connectionHealth.websocket = false;
        this.stopHeartbeat();
        this.handleReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionHealth.websocket = false;
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.connectionHealth.websocket = false;
    }
  }

  /**
   * Start monitoring connection health
   */
  private startHealthMonitoring(): void {
    setInterval(() => {
      this.checkDatabaseHealth();
      this.connectionHealth.lastCheck = new Date();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Check database connectivity
   */
  private async checkDatabaseHealth(): Promise<void> {
    try {
      const startTime = Date.now();
      const { error } = await supabase.from('indicators').select('id').limit(1);
      
      this.connectionHealth.database = !error;
      this.connectionHealth.latency = Date.now() - startTime;
    } catch (error) {
      this.connectionHealth.database = false;
      this.connectionHealth.latency = -1;
    }
  }

  /**
   * Get TTL based on data source
   */
  private getTTLForSource(source: string): number {
    switch (source) {
      case 'FRED': return 60 * 60 * 1000; // 1 hour
      case 'GLASSNODE': return 15 * 60 * 1000; // 15 minutes
      case 'COINBASE': return 5 * 1000; // 5 seconds
      case 'MARKET': return 30 * 1000; // 30 seconds
      case 'ENGINE': return 10 * 1000; // 10 seconds
      default: return 5 * 60 * 1000; // 5 minutes default
    }
  }

  /**
   * Update cache hit rate metrics
   */
  private updateCacheHitRate(hit: boolean): void {
    const totalCacheRequests = this.metrics.totalRequests;
    const currentHits = this.metrics.cacheHitRate * (totalCacheRequests - 1) / 100;
    this.metrics.cacheHitRate = hit 
      ? ((currentHits + 1) / totalCacheRequests) * 100
      : (currentHits / totalCacheRequests) * 100;
  }

  /**
   * Update latency metrics
   */
  private updateLatency(latency: number): void {
    const totalLatency = this.metrics.averageLatency * (this.metrics.successfulRequests - 1);
    this.metrics.averageLatency = (totalLatency + latency) / this.metrics.successfulRequests;
  }

  private initializeMockData(): void {
    const mockProvider = MockDataProvider.getInstance();
    const mockStates = mockProvider.generateMockIndicatorStates();
    
    mockStates.forEach((state, indicatorId) => {
      this.indicatorStates.set(indicatorId, state);
    });
  }

  private initializeIndicatorState(indicatorId: string): void {
    const metadata = this.registry.get(indicatorId);
    if (!metadata) return;

    const state: IndicatorState = {
      metadata,
      value: null,
      status: 'loading',
      lastUpdate: new Date(),
      isSubscribed: false,
      retryCount: 0
    };

    this.indicatorStates.set(indicatorId, state);
  }

  private updateIndicatorValue(indicatorId: string, value: IndicatorValue): void {
    const state = this.indicatorStates.get(indicatorId);
    if (!state) return;

    state.value = value;
    state.lastUpdate = new Date();
    state.retryCount = 0;

    this.notifySubscribers(indicatorId, state);
  }

  private updateIndicatorStatus(indicatorId: string, status: IndicatorStatus): void {
    const state = this.indicatorStates.get(indicatorId);
    if (!state) return;

    state.status = status;
    state.lastUpdate = new Date();

    this.notifySubscribers(indicatorId, state);
  }

  private updateIndicatorError(indicatorId: string, error: string): void {
    const state = this.indicatorStates.get(indicatorId);
    if (!state) return;

    state.status = 'error';
    state.lastError = error;
    state.lastUpdate = new Date();
    state.retryCount++;

    this.notifySubscribers(indicatorId, state);
  }

  private notifySubscribers(indicatorId: string, state: IndicatorState): void {
    const subscribers = this.subscriptions.get(indicatorId);
    if (!subscribers) return;

    subscribers.forEach(subscription => {
      try {
        subscription.callback(state);
      } catch (error) {
        console.error(`Error notifying subscriber for ${indicatorId}:`, error);
      }
    });
  }

  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      switch (message.type) {
        case 'update':
          if (message.indicatorId && message.data) {
            this.handleRealtimeUpdate(message.indicatorId, message.data);
          }
          break;
        case 'error':
          console.error('WebSocket error message:', message.error);
          break;
        case 'heartbeat':
          break;
        default:
          console.warn('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleRealtimeUpdate(indicatorId: string, data: any): void {
    const value: IndicatorValue = {
      current: data.value,
      previous: data.previous,
      change: data.change,
      changePercent: data.changePercent,
      timestamp: new Date(data.timestamp),
      confidence: data.confidence,
      quality: data.quality
    };

    this.updateIndicatorValue(indicatorId, value);
  }

  private requestRealtimeUpdates(indicatorId: string): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'subscribe',
        indicatorId
      };
      this.websocket.send(JSON.stringify(message));
    }
  }

  private unsubscribeFromRealtime(indicatorId: string): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'unsubscribe',
        indicatorId
      };
      this.websocket.send(JSON.stringify(message));
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      
      setTimeout(() => {
        this.initializeWebSocket();
      }, delay);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        const message: WebSocketMessage = { type: 'heartbeat' };
        this.websocket.send(JSON.stringify(message));
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private async fetchFredData(metadata: IndicatorMetadata): Promise<IndicatorValue | null> {
    // Implementation for FRED data fetching
    return null;
  }

  private async fetchGlassnodeData(metadata: IndicatorMetadata): Promise<IndicatorValue | null> {
    // Implementation for Glassnode data fetching
    return null;
  }

  private async fetchCoinbaseData(metadata: IndicatorMetadata): Promise<IndicatorValue | null> {
    // Implementation for Coinbase data fetching
    return null;
  }

  private async fetchMarketData(metadata: IndicatorMetadata): Promise<IndicatorValue | null> {
    // Implementation for market data fetching
    return null;
  }

  private async calculateEngineData(metadata: IndicatorMetadata): Promise<IndicatorValue | null> {
    // Implementation for engine calculations
    return null;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.websocket) {
      this.websocket.close();
    }
    
    this.stopHeartbeat();
    this.subscriptions.clear();
    this.indicatorStates.clear();
    this.cache.clear();
  }
}
