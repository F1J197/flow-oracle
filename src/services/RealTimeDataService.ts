/**
 * Real-Time Data Service - WebSocket Connection Manager
 * Handles live market data streaming and caching
 */

import { supabase } from '@/integrations/supabase/client';

export interface MarketDataPoint {
  symbol: string;
  value: number;
  timestamp: number;
  change?: number;
  changePercent?: number;
  source: string;
}

export interface DataSubscription {
  symbols: string[];
  callback: (data: MarketDataPoint) => void;
  active: boolean;
}

export class RealTimeDataService {
  private static instance: RealTimeDataService;
  private subscriptions: Map<string, DataSubscription> = new Map();
  private cache: Map<string, MarketDataPoint> = new Map();
  private wsConnection: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private constructor() {
    this.initializeConnection();
  }

  static getInstance(): RealTimeDataService {
    if (!RealTimeDataService.instance) {
      RealTimeDataService.instance = new RealTimeDataService();
    }
    return RealTimeDataService.instance;
  }

  private async initializeConnection() {
    try {
      // Initialize Supabase real-time subscription
      const channel = supabase
        .channel('market-data-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'market_data_cache'
          },
          (payload) => this.handleMarketDataUpdate(payload)
        )
        .subscribe();

      console.log('📡 Real-time data service initialized');
      this.isConnected = true;
    } catch (error) {
      console.error('❌ Failed to initialize real-time connection:', error);
      this.scheduleReconnect();
    }
  }

  private handleMarketDataUpdate(payload: any) {
    const data = payload.new as MarketDataPoint;
    
    // Update cache
    this.cache.set(data.symbol, data);
    
    // Notify subscribers
    this.subscriptions.forEach(subscription => {
      if (subscription.active && subscription.symbols.includes(data.symbol)) {
        subscription.callback(data);
      }
    });
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      setTimeout(() => {
        this.reconnectAttempts++;
        this.initializeConnection();
      }, delay);
    }
  }

  subscribe(id: string, symbols: string[], callback: (data: MarketDataPoint) => void): void {
    this.subscriptions.set(id, {
      symbols,
      callback,
      active: true
    });
    
    console.log(`📊 Subscribed to symbols: ${symbols.join(', ')}`);
  }

  unsubscribe(id: string): void {
    const subscription = this.subscriptions.get(id);
    if (subscription) {
      subscription.active = false;
      this.subscriptions.delete(id);
      console.log(`🔕 Unsubscribed: ${id}`);
    }
  }

  getLatestData(symbol: string): MarketDataPoint | null {
    return this.cache.get(symbol) || null;
  }

  getAllData(): Map<string, MarketDataPoint> {
    return new Map(this.cache);
  }

  isConnectionActive(): boolean {
    return this.isConnected;
  }

  // Mock data generation for development
  startMockDataStream(): void {
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        this.generateMockData();
      }, 5000); // Update every 5 seconds
    }
  }

  private generateMockData(): void {
    const mockSymbols = [
      'VIX', 'SPX', 'NDX', 'BTCUSD', 'DXY', 'DGS10',
      'WALCL', 'WTREGEN', 'RRPONTSYD', 'SOFR', 'EFFR',
      'BAMLH0A0HYM2', 'BAMLC0A0CM', 'MOVE', 'CVIX'
    ];

    mockSymbols.forEach(symbol => {
      const baseValues = {
        'VIX': 18.5,
        'SPX': 4500,
        'NDX': 15000,
        'BTCUSD': 45000,
        'DXY': 104,
        'DGS10': 4.5,
        'WALCL': 7.5,
        'WTREGEN': 0.5,
        'RRPONTSYD': 2.0,
        'SOFR': 5.3,
        'EFFR': 5.35,
        'BAMLH0A0HYM2': 350,
        'BAMLC0A0CM': 120,
        'MOVE': 100,
        'CVIX': 85
      };

      const baseValue = baseValues[symbol] || 100;
      const variance = baseValue * 0.02; // 2% variance
      const value = baseValue + (Math.random() - 0.5) * variance;
      const previousValue = this.cache.get(symbol)?.value || value;
      const change = value - previousValue;
      const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;

      const dataPoint: MarketDataPoint = {
        symbol,
        value: Math.round(value * 100) / 100,
        timestamp: Date.now(),
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        source: 'mock'
      };

      this.cache.set(symbol, dataPoint);
      
      // Notify subscribers
      this.subscriptions.forEach(subscription => {
        if (subscription.active && subscription.symbols.includes(symbol)) {
          subscription.callback(dataPoint);
        }
      });
    });
  }

  // Fetch historical data
  async getHistoricalData(symbol: string, period: string = '1d'): Promise<MarketDataPoint[]> {
    try {
      const { data, error } = await supabase
        .from('market_data_cache')
        .select('*')
        .eq('symbol', symbol)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;

      return data.map(item => ({
        symbol: item.symbol,
        value: item.value,
        timestamp: new Date(item.timestamp).getTime(),
        change: item.change,
        changePercent: item.change_percent,
        source: item.provider
      }));
    } catch (error) {
      console.error(`Failed to fetch historical data for ${symbol}:`, error);
      return [];
    }
  }

  // Health check
  getConnectionHealth(): { status: string; lastUpdate: number; subscriberCount: number } {
    return {
      status: this.isConnected ? 'connected' : 'disconnected',
      lastUpdate: Math.max(...Array.from(this.cache.values()).map(d => d.timestamp), 0),
      subscriberCount: this.subscriptions.size
    };
  }
}

// Singleton instance
export const realTimeDataService = RealTimeDataService.getInstance();