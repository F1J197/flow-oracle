/**
 * WebSocket Orchestrator - Real-time data streaming coordinator
 * Manages WebSocket connections and routes data to appropriate services
 */

import { BrowserEventEmitter } from '@/utils/BrowserEventEmitter';
import { WebSocketManager, WebSocketConnections, WebSocketStatus } from './WebSocketManager';
import { IndicatorValue } from '@/types/indicators';

export interface WebSocketConfig {
  enableCoinbase: boolean;
  enableBinance: boolean;
  customConnections: Array<{
    name: string;
    url: string;
    subscriptions: string[];
  }>;
  reconnectInterval: number;
  healthCheckInterval: number;
}

export interface WebSocketConnectionStatus {
  name: string;
  status: WebSocketStatus;
  url: string;
  lastMessage: Date | null;
  messageCount: number;
  errorCount: number;
  subscriptions: string[];
}

export class WebSocketOrchestrator extends BrowserEventEmitter {
  private static instance: WebSocketOrchestrator | null = null;
  private config: WebSocketConfig;
  private connections = new Map<string, WebSocketManager>();
  private connectionStats = new Map<string, WebSocketConnectionStatus>();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor(config: Partial<WebSocketConfig> = {}) {
    super();
    
    this.config = {
      enableCoinbase: true,
      enableBinance: true,
      customConnections: [],
      reconnectInterval: 5000,
      healthCheckInterval: 30000,
      ...config
    };
  }

  static getInstance(config?: Partial<WebSocketConfig>): WebSocketOrchestrator {
    if (!WebSocketOrchestrator.instance) {
      WebSocketOrchestrator.instance = new WebSocketOrchestrator(config);
    }
    return WebSocketOrchestrator.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('WebSocketOrchestrator already initialized');
      return;
    }

    console.log('🔌 Initializing WebSocket Orchestrator...');

    try {
      // Initialize Coinbase connection
      if (this.config.enableCoinbase) {
        await this.setupCoinbaseConnection();
      }

      // Initialize Binance connection
      if (this.config.enableBinance) {
        await this.setupBinanceConnection();
      }

      // Initialize custom connections
      for (const customConfig of this.config.customConnections) {
        await this.setupCustomConnection(customConfig);
      }

      // Start health monitoring
      this.startHealthMonitoring();

      this.isInitialized = true;
      this.emit('initialized', { timestamp: new Date() });
      
      console.log('✅ WebSocket Orchestrator initialized successfully');
    } catch (error) {
      console.error('❌ WebSocket Orchestrator initialization failed:', error);
      this.emit('error', { type: 'initialization', error, timestamp: new Date() });
      throw error;
    }
  }

  private async setupCoinbaseConnection(): Promise<void> {
    const connection = WebSocketConnections.getCoinbaseConnection();
    this.connections.set('coinbase', connection);

    // Initialize connection stats
    this.connectionStats.set('coinbase', {
      name: 'coinbase',
      status: WebSocketStatus.DISCONNECTED,
      url: 'wss://ws-feed.pro.coinbase.com',
      lastMessage: null,
      messageCount: 0,
      errorCount: 0,
      subscriptions: ['BTC-USD', 'ETH-USD']
    });

    // Setup event handlers
    connection.onStatusChange((status) => {
      this.updateConnectionStatus('coinbase', { status });
      this.emit('connection:status', { provider: 'coinbase', status });
    });

    connection.subscribe('*', (message) => {
      this.handleCoinbaseMessage(message);
    });

    // Connect and subscribe to tickers
    connection.connect();
    
    // Subscribe to ticker data after connection
    setTimeout(() => {
      connection.send({
        type: 'subscribe',
        product_ids: ['BTC-USD', 'ETH-USD'],
        channels: ['ticker']
      });
    }, 1000);

    console.log('📈 Coinbase WebSocket connection configured');
  }

  private async setupBinanceConnection(): Promise<void> {
    const connection = WebSocketConnections.getBinanceConnection();
    this.connections.set('binance', connection);

    // Initialize connection stats
    this.connectionStats.set('binance', {
      name: 'binance',
      status: WebSocketStatus.DISCONNECTED,
      url: 'wss://stream.binance.com:9443/ws/btcusdt@ticker',
      lastMessage: null,
      messageCount: 0,
      errorCount: 0,
      subscriptions: ['BTCUSDT', 'ETHUSDT']
    });

    // Setup event handlers
    connection.onStatusChange((status) => {
      this.updateConnectionStatus('binance', { status });
      this.emit('connection:status', { provider: 'binance', status });
    });

    connection.subscribe('*', (message) => {
      this.handleBinanceMessage(message);
    });

    connection.connect();
    console.log('🔸 Binance WebSocket connection configured');
  }

  private async setupCustomConnection(config: { name: string; url: string; subscriptions: string[] }): Promise<void> {
    const connection = WebSocketConnections.getCustomConnection(config.url);
    this.connections.set(config.name, connection);

    // Initialize connection stats
    this.connectionStats.set(config.name, {
      name: config.name,
      status: WebSocketStatus.DISCONNECTED,
      url: config.url,
      lastMessage: null,
      messageCount: 0,
      errorCount: 0,
      subscriptions: config.subscriptions
    });

    // Setup event handlers
    connection.onStatusChange((status) => {
      this.updateConnectionStatus(config.name, { status });
      this.emit('connection:status', { provider: config.name, status });
    });

    connection.subscribe('*', (message) => {
      this.handleCustomMessage(config.name, message);
    });

    connection.connect();
    console.log(`🔗 Custom WebSocket connection configured: ${config.name}`);
  }

  private handleCoinbaseMessage(message: any): void {
    try {
      this.updateConnectionStatus('coinbase', { 
        lastMessage: new Date(),
        messageCount: (this.connectionStats.get('coinbase')?.messageCount || 0) + 1
      });

      if (message.type === 'ticker' && message.data) {
        const data = message.data;
        const normalizedData: IndicatorValue = {
          current: parseFloat(data.price),
          change: parseFloat(data.best_bid) - parseFloat(data.price),
          changePercent: parseFloat(data.change_24h) || 0,
          timestamp: new Date(),
          confidence: 0.95,
          volume: parseFloat(data.volume_24h) || undefined
        };

        this.emit('data:update', {
          provider: 'coinbase',
          symbol: data.product_id?.toLowerCase() || 'unknown',
          value: normalizedData,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error handling Coinbase message:', error);
      this.updateConnectionStatus('coinbase', { 
        errorCount: (this.connectionStats.get('coinbase')?.errorCount || 0) + 1
      });
    }
  }

  private handleBinanceMessage(message: any): void {
    try {
      this.updateConnectionStatus('binance', { 
        lastMessage: new Date(),
        messageCount: (this.connectionStats.get('binance')?.messageCount || 0) + 1
      });

      if (message.data?.e === '24hrTicker') {
        const data = message.data;
        const normalizedData: IndicatorValue = {
          current: parseFloat(data.c),
          change: parseFloat(data.P) || 0,
          changePercent: parseFloat(data.P) || 0,
          timestamp: new Date(),
          confidence: 0.95,
          volume: parseFloat(data.v) || undefined
        };

        this.emit('data:update', {
          provider: 'binance',
          symbol: data.s?.toLowerCase() || 'unknown',
          value: normalizedData,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error handling Binance message:', error);
      this.updateConnectionStatus('binance', { 
        errorCount: (this.connectionStats.get('binance')?.errorCount || 0) + 1
      });
    }
  }

  private handleCustomMessage(provider: string, message: any): void {
    try {
      this.updateConnectionStatus(provider, { 
        lastMessage: new Date(),
        messageCount: (this.connectionStats.get(provider)?.messageCount || 0) + 1
      });

      // Emit raw message for custom handling
      this.emit('data:custom', {
        provider,
        message,
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error handling ${provider} message:`, error);
      this.updateConnectionStatus(provider, { 
        errorCount: (this.connectionStats.get(provider)?.errorCount || 0) + 1
      });
    }
  }

  private updateConnectionStatus(provider: string, updates: Partial<WebSocketConnectionStatus>): void {
    const current = this.connectionStats.get(provider);
    if (current) {
      this.connectionStats.set(provider, { ...current, ...updates });
    }
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      const healthReport = this.getHealthStatus();
      this.emit('health:report', healthReport);

      // Check for stale connections
      for (const [provider, stats] of this.connectionStats) {
        if (stats.lastMessage) {
          const timeSinceLastMessage = Date.now() - stats.lastMessage.getTime();
          if (timeSinceLastMessage > 60000) { // 1 minute
            console.warn(`⚠️ Stale connection detected: ${provider} (${timeSinceLastMessage}ms)`);
            this.emit('connection:stale', { provider, timeSinceLastMessage });
          }
        }
      }
    }, this.config.healthCheckInterval);
  }

  getHealthStatus() {
    const connections = Array.from(this.connectionStats.values());
    const connected = connections.filter(conn => conn.status === WebSocketStatus.CONNECTED).length;
    const total = connections.length;

    return {
      overall: total > 0 ? connected / total : 0,
      connections,
      timestamp: new Date()
    };
  }

  getConnectionStatus(provider?: string): WebSocketConnectionStatus | WebSocketConnectionStatus[] {
    if (provider) {
      return this.connectionStats.get(provider) || null;
    }
    return Array.from(this.connectionStats.values());
  }

  reconnectAll(): void {
    console.log('🔄 Reconnecting all WebSocket connections...');
    for (const connection of this.connections.values()) {
      connection.disconnect();
      setTimeout(() => connection.connect(), 1000);
    }
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down WebSocket Orchestrator...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    for (const connection of this.connections.values()) {
      connection.disconnect();
    }

    this.connections.clear();
    this.connectionStats.clear();
    this.isInitialized = false;

    this.emit('shutdown', { timestamp: new Date() });
    console.log('✅ WebSocket Orchestrator shutdown complete');
  }
}

export default WebSocketOrchestrator;