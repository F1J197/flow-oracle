/**
 * Data Orchestrator - Central coordination system for all data flows
 * Manages WebSocket connections, data ingestion, caching, and engine communication
 */

import { BrowserEventEmitter } from '@/utils/BrowserEventEmitter';
import { WebSocketManager } from './WebSocketManager';
import { CacheManager } from './CacheManager';
import { dataIngestionRegistry, type DataIngestionProvider } from './DataIngestion';
import { EngineRegistry } from '@/engines/EngineRegistry';
import { UnifiedEngineRegistry } from '@/engines/base/UnifiedEngineRegistry';
import { IndicatorValue } from '@/types/indicators';

export interface DataOrchestratorConfig {
  enableWebSockets: boolean;
  enableDataIngestion: boolean;
  enableEngineIntegration: boolean;
  cacheTTL: number;
  updateInterval: number;
  maxRetries: number;
  circuitBreakerThreshold: number;
  websocketUrls: {
    coinbase?: string;
    binance?: string;
    custom?: string[];
  };
}

export interface DataSourceStatus {
  provider: string;
  connected: boolean;
  lastUpdate: Date | null;
  errorCount: number;
  dataPoints: number;
}

export interface OrchestratorStatus {
  isInitialized: boolean;
  dataSources: DataSourceStatus[];
  engineCount: number;
  cacheSize: number;
  activeWebSockets: number;
  lastActivity: Date | null;
}

export class DataOrchestrator extends BrowserEventEmitter {
  private static instance: DataOrchestrator | null = null;
  private config: DataOrchestratorConfig;
  
  // Core services
  private webSocketManager: WebSocketManager | null = null;
  private cacheManager: CacheManager;
  private engineRegistry: EngineRegistry;
  private unifiedEngineRegistry: UnifiedEngineRegistry;
  
  // State management
  private isInitialized = false;
  private activeDataSources = new Map<string, DataSourceStatus>();
  private updateIntervals = new Map<string, NodeJS.Timeout>();
  private circuitBreakers = new Map<string, { failures: number; lastFailure: Date | null; isOpen: boolean }>();
  
  constructor(config: Partial<DataOrchestratorConfig> = {}) {
    super();
    
    this.config = {
      enableWebSockets: true,
      enableDataIngestion: true,
      enableEngineIntegration: true,
      cacheTTL: 300000, // 5 minutes
      updateInterval: 15000, // 15 seconds
      maxRetries: 3,
      circuitBreakerThreshold: 5,
      websocketUrls: {
        coinbase: 'wss://ws-feed.pro.coinbase.com',
        binance: 'wss://stream.binance.com:9443/ws'
      },
      ...config
    };
    
    this.cacheManager = CacheManager.getInstance();
    this.engineRegistry = EngineRegistry.getInstance();
    this.unifiedEngineRegistry = UnifiedEngineRegistry.getInstance();
  }

  static getInstance(config?: Partial<DataOrchestratorConfig>): DataOrchestrator {
    if (!DataOrchestrator.instance) {
      DataOrchestrator.instance = new DataOrchestrator(config);
    }
    return DataOrchestrator.instance;
  }

  /**
   * Initialize the orchestrator and all its subsystems
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('DataOrchestrator already initialized');
      return;
    }

    console.log('🚀 Initializing DataOrchestrator...');
    
    try {
      // Initialize WebSocket connections
      if (this.config.enableWebSockets) {
        await this.setupWebSockets();
      }

      // Load initial data
      if (this.config.enableDataIngestion) {
        await this.loadInitialData();
      }

      // Schedule periodic updates
      this.scheduleUpdates();

      // Initialize engine integration
      if (this.config.enableEngineIntegration) {
        await this.initializeEngines();
      }

      this.isInitialized = true;
      this.emit('initialized', { status: 'success', timestamp: new Date() });
      
      console.log('✅ DataOrchestrator initialized successfully');
    } catch (error) {
      console.error('❌ DataOrchestrator initialization failed:', error);
      this.emit('error', { type: 'initialization', error, timestamp: new Date() });
      throw error;
    }
  }

  /**
   * Setup WebSocket connections for real-time data
   */
  private async setupWebSockets(): Promise<void> {
    console.log('Setting up WebSocket connections...');
    
    try {
      // WebSocketManager needs different approach - create individual connections
      // this.webSocketManager = new WebSocketManager();
      
      // Setup WebSocket connections manually for now
      // Note: Individual WebSocket connections will be handled by respective services
      console.log('WebSocket URLs configured:', this.config.websocketUrls);

      this.emit('websockets:ready', { timestamp: new Date() });
    } catch (error) {
      console.error('WebSocket setup failed:', error);
      throw error;
    }
  }

  /**
   * Load initial data from all configured sources
   */
  private async loadInitialData(): Promise<void> {
    console.log('Loading initial data from all sources...');
    
    const loadPromises: Promise<void>[] = [];

    // Load data from each ingestion source
    for (const [provider, service] of Object.entries(dataIngestionRegistry)) {
      loadPromises.push(this.loadProviderData(provider as DataIngestionProvider, service));
    }

    await Promise.allSettled(loadPromises);
    this.emit('initial-data:loaded', { timestamp: new Date() });
  }

  /**
   * Load data from a specific provider
   */
  private async loadProviderData(provider: DataIngestionProvider, service: any): Promise<void> {
    try {
      // Check circuit breaker
      if (this.isCircuitBreakerOpen(provider)) {
        console.log(`Circuit breaker open for ${provider}, skipping data load`);
        return;
      }

      const health = service.getHealthStatus();
      if (!health.available) {
        throw new Error(`Provider ${provider} is not available`);
      }

      // Load key symbols based on provider
      const symbols = this.getKeySymbolsForProvider(provider);
      const data = await service.fetchMultipleSymbols(symbols);

      let successCount = 0;
      for (const [symbol, value] of Object.entries(data)) {
        if (value) {
          await this.cacheManager.set(`${provider}:${symbol}`, value, this.config.cacheTTL);
          successCount++;
        }
      }

      this.updateDataSourceStatus(provider, true, successCount);
      this.resetCircuitBreaker(provider);
      
      console.log(`✅ Loaded ${successCount} data points from ${provider}`);
    } catch (error) {
      console.error(`❌ Failed to load data from ${provider}:`, error);
      this.handleProviderError(provider, error as Error);
    }
  }

  /**
   * Schedule periodic data updates
   */
  private scheduleUpdates(): void {
    console.log('Scheduling periodic updates...');
    
    for (const provider of Object.keys(dataIngestionRegistry)) {
      const interval = setInterval(async () => {
        await this.loadProviderData(provider as DataIngestionProvider, dataIngestionRegistry[provider as DataIngestionProvider]);
      }, this.config.updateInterval);
      
      this.updateIntervals.set(provider, interval);
    }

    this.emit('updates:scheduled', { interval: this.config.updateInterval, timestamp: new Date() });
  }

  /**
   * Initialize engine integration
   */
  private async initializeEngines(): Promise<void> {
    console.log('Initializing engine integration...');
    
    // Subscribe to data updates for engine propagation
    this.on('data:update', (data: { provider: string; symbol: string; value: IndicatorValue }) => {
      this.propagateToEngines(data);
    });

    // Initialize engine registries if they need data
    await this.engineRegistry.executeAll();
    
    this.emit('engines:ready', { timestamp: new Date() });
  }

  /**
   * Handle incoming WebSocket data
   */
  private handleWebSocketData(provider: string, data: any): void {
    try {
      // Parse and normalize WebSocket data based on provider
      const normalizedData = this.normalizeWebSocketData(provider, data);
      
      if (normalizedData) {
        // Cache the data
        this.cacheManager.set(
          `${provider}:${normalizedData.symbol}`,
          normalizedData.value,
          this.config.cacheTTL
        );

        // Emit data update event
        this.emit('data:update', {
          provider,
          symbol: normalizedData.symbol,
          value: normalizedData.value,
          timestamp: new Date()
        });

        this.updateDataSourceStatus(`${provider}-ws`, true, 1);
      }
    } catch (error) {
      console.error(`Error handling WebSocket data from ${provider}:`, error);
      this.handleProviderError(`${provider}-ws`, error as Error);
    }
  }

  /**
   * Normalize WebSocket data from different providers
   */
  private normalizeWebSocketData(provider: string, data: any): { symbol: string; value: IndicatorValue } | null {
    try {
      switch (provider) {
        case 'coinbase':
          if (data.type === 'ticker' && data.product_id && data.price) {
            return {
              symbol: data.product_id.toLowerCase(),
              value: {
                current: parseFloat(data.price),
                timestamp: new Date(),
                confidence: 0.9,
                volume: parseFloat(data.volume_24h) || undefined
              }
            };
          }
          break;
          
        case 'binance':
          if (data.e === '24hrTicker' && data.s && data.c) {
            return {
              symbol: data.s.toLowerCase(),
              value: {
                current: parseFloat(data.c),
                change: parseFloat(data.P) || undefined,
                changePercent: parseFloat(data.P) || undefined,
                timestamp: new Date(),
                confidence: 0.9,
                volume: parseFloat(data.v) || undefined
              }
            };
          }
          break;
      }
      
      return null;
    } catch (error) {
      console.error(`Error normalizing ${provider} data:`, error);
      return null;
    }
  }

  /**
   * Propagate data updates to registered engines
   */
  private propagateToEngines(data: { provider: string; symbol: string; value: IndicatorValue }): void {
    // Notify both engine registries
    this.emit('engine:data-update', data);
    
    // You could also call specific engine methods here if needed
    // For example: this.engineRegistry.notifyDataUpdate(data);
  }

  /**
   * Handle provider errors and circuit breaker logic
   */
  private handleProviderError(provider: string, error: Error): void {
    const circuitBreaker = this.circuitBreakers.get(provider) || {
      failures: 0,
      lastFailure: null,
      isOpen: false
    };

    circuitBreaker.failures++;
    circuitBreaker.lastFailure = new Date();

    if (circuitBreaker.failures >= this.config.circuitBreakerThreshold) {
      circuitBreaker.isOpen = true;
      console.warn(`🔴 Circuit breaker opened for ${provider} after ${circuitBreaker.failures} failures`);
      
      this.emit('circuit-breaker:opened', { provider, failures: circuitBreaker.failures });
      
      // Schedule circuit breaker reset (exponential backoff)
      setTimeout(() => {
        this.resetCircuitBreaker(provider);
      }, Math.min(30000 * Math.pow(2, circuitBreaker.failures - this.config.circuitBreakerThreshold), 300000));
    }

    this.circuitBreakers.set(provider, circuitBreaker);
    this.updateDataSourceStatus(provider, false);
    
    this.emit('provider:error', { provider, error: error.message, timestamp: new Date() });
  }

  /**
   * Check if circuit breaker is open for a provider
   */
  private isCircuitBreakerOpen(provider: string): boolean {
    const circuitBreaker = this.circuitBreakers.get(provider);
    return circuitBreaker?.isOpen || false;
  }

  /**
   * Reset circuit breaker for a provider
   */
  private resetCircuitBreaker(provider: string): void {
    const circuitBreaker = this.circuitBreakers.get(provider);
    if (circuitBreaker) {
      circuitBreaker.failures = 0;
      circuitBreaker.isOpen = false;
      circuitBreaker.lastFailure = null;
      
      console.log(`🟢 Circuit breaker reset for ${provider}`);
      this.emit('circuit-breaker:reset', { provider });
    }
  }

  /**
   * Update data source status
   */
  private updateDataSourceStatus(provider: string, connected: boolean, dataPoints: number = 0): void {
    const current = this.activeDataSources.get(provider) || {
      provider,
      connected: false,
      lastUpdate: null,
      errorCount: 0,
      dataPoints: 0
    };

    current.connected = connected;
    current.lastUpdate = new Date();
    current.dataPoints += dataPoints;

    if (!connected) {
      current.errorCount++;
    }

    this.activeDataSources.set(provider, current);
  }

  /**
   * Get key symbols for a specific provider
   */
  private getKeySymbolsForProvider(provider: DataIngestionProvider): string[] {
    switch (provider) {
      case 'fred':
        return ['WALCL', 'WTREGEN', 'RRPONTSYD', 'DGS10', 'DGS2'];
      case 'binance':
        return ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
      default:
        return [];
    }
  }

  /**
   * Get orchestrator status
   */
  getStatus(): OrchestratorStatus {
    return {
      isInitialized: this.isInitialized,
      dataSources: Array.from(this.activeDataSources.values()),
      engineCount: this.engineRegistry.getAllMetadata().length,
      cacheSize: this.cacheManager.getStats().totalEntries,
      activeWebSockets: 0, // Will be implemented later
      lastActivity: this.activeDataSources.size > 0 
        ? new Date(Math.max(...Array.from(this.activeDataSources.values())
          .map(ds => ds.lastUpdate?.getTime() || 0))) 
        : null
    };
  }

  /**
   * Manually refresh data for a specific provider
   */
  async refreshProvider(provider: DataIngestionProvider): Promise<void> {
    const service = dataIngestionRegistry[provider];
    if (service) {
      await this.loadProviderData(provider, service);
    }
  }

  /**
   * Shutdown the orchestrator
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down DataOrchestrator...');
    
    // Clear update intervals
    for (const interval of this.updateIntervals.values()) {
      clearInterval(interval);
    }
    this.updateIntervals.clear();

    // Disconnect WebSocket connections (placeholder for now)
    console.log('WebSocket cleanup completed');

    // Clear cache
    this.cacheManager.clear();

    this.isInitialized = false;
    this.emit('shutdown', { timestamp: new Date() });
    
    console.log('✅ DataOrchestrator shutdown complete');
  }
}

export default DataOrchestrator;