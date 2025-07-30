/**
 * LIQUIDITY² Real-time Data Service
 * Manages real-time connections and distributes live market data to engines
 */

import { WebSocketManager, WebSocketConnections } from './WebSocketManager';
import { config } from '@/config/environment';
import type { 
  IndicatorState,
  IndicatorValue 
} from '@/types/indicators';
import type {
  WebSocketMessage,
  WebSocketStatus
} from './WebSocketManager';

export interface RealtimeSubscription {
  indicatorId: string;
  source: 'coinbase' | 'binance' | 'supabase';
  callback: (data: IndicatorValue) => void;
  isActive: boolean;
}

export interface MarketDataUpdate {
  symbol: string;
  price: number;
  volume?: number;
  timestamp: Date;
  source: string;
}

export class RealtimeDataService {
  private static instance: RealtimeDataService;
  private subscriptions = new Map<string, RealtimeSubscription>();
  private connections = new Map<string, WebSocketManager>();
  private isInitialized = false;

  private constructor() {
    this.initializeConnections();
  }

  static getInstance(): RealtimeDataService {
    if (!RealtimeDataService.instance) {
      RealtimeDataService.instance = new RealtimeDataService();
    }
    return RealtimeDataService.instance;
  }

  private async initializeConnections(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize Supabase real-time connection
      const supabaseWs = WebSocketConnections.getCustomConnection(
        `wss://gotlitraitdvltnjdnni.functions.supabase.co/realtime-indicators`,
        {
          reconnectAttempts: 10,
          reconnectDelay: 1000,
          heartbeatInterval: 30000
        }
      );

      // Initialize Coinbase connection
      const coinbaseWs = WebSocketConnections.getCoinbaseConnection();

      // Initialize Binance connection  
      const binanceWs = WebSocketConnections.getBinanceConnection();

      this.connections.set('supabase', supabaseWs);
      this.connections.set('coinbase', coinbaseWs);
      this.connections.set('binance', binanceWs);

      // Set up event handlers
      this.setupEventHandlers();

      // Connect all services
      supabaseWs.connect();
      coinbaseWs.connect();
      binanceWs.connect();

      this.isInitialized = true;
      console.log('RealtimeDataService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RealtimeDataService:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    // Supabase real-time updates
    const supabaseWs = this.connections.get('supabase');
    if (supabaseWs) {
      supabaseWs.subscribe('indicator_update', this.handleSupabaseUpdate.bind(this));
      supabaseWs.subscribe('connected', () => {
        console.log('Connected to Supabase real-time');
        this.requestActiveSubscriptions();
      });
    }

    // Coinbase price updates
    const coinbaseWs = this.connections.get('coinbase');
    if (coinbaseWs) {
      coinbaseWs.subscribe('ticker', this.handleCoinbaseUpdate.bind(this));
      coinbaseWs.onStatusChange((status) => {
        if (status === 'connected') {
          this.subscribeToCoinbaseFeeds();
        }
      });
    }

    // Binance price updates
    const binanceWs = this.connections.get('binance');
    if (binanceWs) {
      binanceWs.subscribe('24hrTicker', this.handleBinanceUpdate.bind(this));
    }
  }

  private handleSupabaseUpdate(message: WebSocketMessage): void {
    try {
      const { indicatorId, value, timestamp } = message.data;
      const subscription = this.subscriptions.get(indicatorId);
      
      if (subscription && subscription.isActive) {
        const indicatorValue: IndicatorValue = {
          current: value,
          timestamp: new Date(timestamp),
          confidence: 0.95
        };
        
        subscription.callback(indicatorValue);
      }
    } catch (error) {
      console.error('Error handling Supabase update:', error);
    }
  }

  private handleCoinbaseUpdate(message: WebSocketMessage): void {
    try {
      const { product_id, price, volume_24h, time } = message.data;
      
      // Map to Bitcoin indicators
      if (product_id === 'BTC-USD') {
        this.broadcastUpdate('BTC_PRICE', {
          current: parseFloat(price),
          timestamp: new Date(time),
          volume: parseFloat(volume_24h || '0'),
          confidence: 0.98
        });
      }
    } catch (error) {
      console.error('Error handling Coinbase update:', error);
    }
  }

  private handleBinanceUpdate(message: WebSocketMessage): void {
    try {
      const { s: symbol, c: price, v: volume, E: eventTime } = message.data;
      
      if (symbol === 'BTCUSDT') {
        this.broadcastUpdate('BTC_PRICE_BINANCE', {
          current: parseFloat(price),
          timestamp: new Date(eventTime),
          volume: parseFloat(volume),
          confidence: 0.97
        });
      }
    } catch (error) {
      console.error('Error handling Binance update:', error);
    }
  }

  private subscribeToCoinbaseFeeds(): void {
    const coinbaseWs = this.connections.get('coinbase');
    if (coinbaseWs) {
      coinbaseWs.send({
        type: 'subscribe',
        product_ids: ['BTC-USD', 'ETH-USD'],
        channels: ['ticker']
      });
    }
  }

  private requestActiveSubscriptions(): void {
    const supabaseWs = this.connections.get('supabase');
    if (supabaseWs) {
      // Request current values for all active subscriptions
      Array.from(this.subscriptions.keys()).forEach(indicatorId => {
        supabaseWs.send({
          type: 'subscribe',
          indicatorId
        });
      });
    }
  }

  private broadcastUpdate(indicatorId: string, value: IndicatorValue): void {
    const subscription = this.subscriptions.get(indicatorId);
    if (subscription && subscription.isActive) {
      subscription.callback(value);
    }
  }

  // Public API
  subscribe(
    indicatorId: string, 
    callback: (data: IndicatorValue) => void,
    source: 'coinbase' | 'binance' | 'supabase' = 'supabase'
  ): () => void {
    const subscription: RealtimeSubscription = {
      indicatorId,
      source,
      callback,
      isActive: true
    };

    this.subscriptions.set(indicatorId, subscription);

    // Send subscription to appropriate WebSocket
    const ws = this.connections.get(source);
    if (ws && ws.getStatus() === 'connected') {
      ws.send({
        type: 'subscribe',
        indicatorId
      });
    }

    // Return unsubscribe function
    return () => {
      const sub = this.subscriptions.get(indicatorId);
      if (sub) {
        sub.isActive = false;
        this.subscriptions.delete(indicatorId);
        
        // Send unsubscribe to WebSocket
        if (ws && ws.getStatus() === 'connected') {
          ws.send({
            type: 'unsubscribe',
            indicatorId
          });
        }
      }
    };
  }

  getConnectionStatus(): Record<string, WebSocketStatus> {
    const status: Record<string, WebSocketStatus> = {};
    
    this.connections.forEach((ws, name) => {
      status[name] = ws.getStatus();
    });
    
    return status;
  }

  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys()).filter(
      id => this.subscriptions.get(id)?.isActive
    );
  }

  async reconnectAll(): Promise<void> {
    console.log('Reconnecting all WebSocket connections...');
    
    this.connections.forEach((ws, name) => {
      console.log(`Reconnecting ${name}...`);
      ws.disconnect();
      setTimeout(() => ws.connect(), 1000);
    });
  }

  disconnect(): void {
    console.log('Disconnecting RealtimeDataService...');
    
    this.connections.forEach(ws => ws.disconnect());
    this.subscriptions.clear();
    this.isInitialized = false;
  }
}

// Export singleton instance
export default RealtimeDataService.getInstance();