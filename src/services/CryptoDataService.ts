/**
 * Crypto Data Service
 * Handles real-time and historical data from crypto exchanges and on-chain sources
 */

import { CONFIG } from '@/config';

export interface CryptoDataPoint {
  symbol: string;
  price: number;
  volume: number;
  timestamp: Date;
  source: 'coinbase' | 'binance' | 'glassnode';
}

export interface OnChainMetric {
  metric: string;
  value: number;
  timestamp: Date;
  chain: 'bitcoin' | 'ethereum';
}

export interface DeFiMetric {
  protocol: string;
  tvl: number;
  volume24h: number;
  timestamp: Date;
}

class CryptoDataService {
  private static instance: CryptoDataService;
  private wsConnections: Map<string, WebSocket> = new Map();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 30000; // 30 seconds

  private constructor() {}

  static getInstance(): CryptoDataService {
    if (!CryptoDataService.instance) {
      CryptoDataService.instance = new CryptoDataService();
    }
    return CryptoDataService.instance;
  }

  async getRealtimeBTCPrice(): Promise<CryptoDataPoint> {
    const cached = this.getCachedData('btc-price');
    if (cached) return cached;

    try {
      // Use Coinbase API for BTC price
      const response = await fetch(`${CONFIG.DATA_SOURCES.COINBASE.REST_URL}/products/BTC-USD/ticker`);
      const data = await response.json();

      const dataPoint: CryptoDataPoint = {
        symbol: 'BTC-USD',
        price: parseFloat(data.price),
        volume: parseFloat(data.volume),
        timestamp: new Date(),
        source: 'coinbase'
      };

      this.setCachedData('btc-price', dataPoint);
      return dataPoint;
    } catch (error) {
      console.error('Error fetching BTC price:', error);
      return this.getFallbackBTCPrice();
    }
  }

  async getOnChainMetrics(chain: 'bitcoin' | 'ethereum'): Promise<OnChainMetric[]> {
    const cacheKey = `onchain-${chain}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Mock on-chain data - in production, this would use Glassnode API
      const metrics: OnChainMetric[] = [
        {
          metric: 'active_addresses',
          value: Math.floor(Math.random() * 1000000) + 500000,
          timestamp: new Date(),
          chain
        },
        {
          metric: 'transaction_count',
          value: Math.floor(Math.random() * 500000) + 200000,
          timestamp: new Date(),
          chain
        },
        {
          metric: 'network_value',
          value: Math.floor(Math.random() * 1000000000) + 500000000,
          timestamp: new Date(),
          chain
        }
      ];

      this.setCachedData(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error(`Error fetching ${chain} metrics:`, error);
      return [];
    }
  }

  async getDeFiMetrics(): Promise<DeFiMetric[]> {
    const cached = this.getCachedData('defi-metrics');
    if (cached) return cached;

    try {
      // Mock DeFi data - in production, this would use DeFiLlama API
      const metrics: DeFiMetric[] = [
        {
          protocol: 'Uniswap',
          tvl: 4500000000,
          volume24h: 1200000000,
          timestamp: new Date()
        },
        {
          protocol: 'Aave',
          tvl: 8200000000,
          volume24h: 450000000,
          timestamp: new Date()
        },
        {
          protocol: 'Compound',
          tvl: 3100000000,
          volume24h: 180000000,
          timestamp: new Date()
        }
      ];

      this.setCachedData('defi-metrics', metrics);
      return metrics;
    } catch (error) {
      console.error('Error fetching DeFi metrics:', error);
      return [];
    }
  }

  subscribeToRealtimeData(symbol: string, callback: (data: CryptoDataPoint) => void): () => void {
    const wsUrl = CONFIG.DATA_SOURCES.COINBASE.WS_URL;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      const subscribeMessage = {
        type: 'subscribe',
        product_ids: [symbol],
        channels: ['ticker']
      };
      ws.send(JSON.stringify(subscribeMessage));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ticker') {
          const dataPoint: CryptoDataPoint = {
            symbol: data.product_id,
            price: parseFloat(data.price),
            volume: parseFloat(data.volume_24h),
            timestamp: new Date(),
            source: 'coinbase'
          };
          callback(dataPoint);
        }
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.wsConnections.set(symbol, ws);

    // Return unsubscribe function
    return () => {
      ws.close();
      this.wsConnections.delete(symbol);
    };
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private getFallbackBTCPrice(): CryptoDataPoint {
    return {
      symbol: 'BTC-USD',
      price: 65000 + (Math.random() - 0.5) * 10000, // Mock price with volatility
      volume: 1200000000,
      timestamp: new Date(),
      source: 'coinbase'
    };
  }

  getHealthStatus(): { 
    wsConnections: number; 
    cacheSize: number; 
    lastUpdate: Date | null;
  } {
    return {
      wsConnections: this.wsConnections.size,
      cacheSize: this.cache.size,
      lastUpdate: this.cache.size > 0 ? new Date() : null
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  disconnect(): void {
    this.wsConnections.forEach(ws => ws.close());
    this.wsConnections.clear();
  }
}

export default CryptoDataService;