/**
 * LIQUIDITY² Terminal - Binance Data Service
 * Real-time and historical data from Binance API
 */

import axios from 'axios';
import { WebSocketManager } from './WebSocketManager';
import { config } from '@/config/environment';

export interface BinanceTicker {
  symbol: string;
  price: string;
  priceChange: string;
  priceChangePercent: string;
  volume: string;
  timestamp: number;
}

export interface BinanceKline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
}

export interface BinanceOrderBook {
  bids: [string, string][];
  asks: [string, string][];
  lastUpdateId: number;
}

export class BinanceDataService {
  private static instance: BinanceDataService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private wsManager: WebSocketManager | null = null;
  
  private readonly baseUrl = 'https://api.binance.com/api/v3';
  private readonly wsUrl = 'wss://stream.binance.com:9443/ws';

  static getInstance(): BinanceDataService {
    if (!this.instance) {
      this.instance = new BinanceDataService();
    }
    return this.instance;
  }

  private constructor() {}

  /**
   * Get real-time ticker data
   */
  async getTicker(symbol: string = 'BTCUSDT'): Promise<BinanceTicker> {
    const cacheKey = `ticker_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseUrl}/ticker/24hr`, {
        params: { symbol: symbol.toUpperCase() },
        timeout: 10000,
      });

      const ticker: BinanceTicker = {
        symbol: response.data.symbol,
        price: response.data.lastPrice,
        priceChange: response.data.priceChange,
        priceChangePercent: response.data.priceChangePercent,
        volume: response.data.volume,
        timestamp: Date.now(),
      };

      this.setCacheData(cacheKey, ticker);
      return ticker;
    } catch (error) {
      console.error('Binance ticker fetch failed:', error);
      throw new Error(`Failed to fetch ticker for ${symbol}`);
    }
  }

  /**
   * Get historical kline/candlestick data
   */
  async getKlines(
    symbol: string = 'BTCUSDT',
    interval: string = '1h',
    limit: number = 100
  ): Promise<BinanceKline[]> {
    const cacheKey = `klines_${symbol}_${interval}_${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseUrl}/klines`, {
        params: {
          symbol: symbol.toUpperCase(),
          interval,
          limit,
        },
        timeout: 15000,
      });

      const klines: BinanceKline[] = response.data.map((k: any[]) => ({
        openTime: k[0],
        open: k[1],
        high: k[2],
        low: k[3],
        close: k[4],
        volume: k[5],
        closeTime: k[6],
        quoteAssetVolume: k[7],
        numberOfTrades: k[8],
      }));

      this.setCacheData(cacheKey, klines, 60000); // Cache for 1 minute
      return klines;
    } catch (error) {
      console.error('Binance klines fetch failed:', error);
      throw new Error(`Failed to fetch klines for ${symbol}`);
    }
  }

  /**
   * Get order book depth
   */
  async getOrderBook(symbol: string = 'BTCUSDT', limit: number = 100): Promise<BinanceOrderBook> {
    const cacheKey = `orderbook_${symbol}_${limit}`;
    const cached = this.getCachedData(cacheKey, 5000); // 5 second cache
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseUrl}/depth`, {
        params: {
          symbol: symbol.toUpperCase(),
          limit,
        },
        timeout: 10000,
      });

      const orderBook: BinanceOrderBook = {
        bids: response.data.bids,
        asks: response.data.asks,
        lastUpdateId: response.data.lastUpdateId,
      };

      this.setCacheData(cacheKey, orderBook, 5000);
      return orderBook;
    } catch (error) {
      console.error('Binance order book fetch failed:', error);
      throw new Error(`Failed to fetch order book for ${symbol}`);
    }
  }

  /**
   * Subscribe to real-time ticker updates
   */
  subscribeToTicker(
    symbol: string,
    callback: (ticker: BinanceTicker) => void
  ): () => void {
    if (!this.wsManager) {
      this.wsManager = new WebSocketManager({
        url: `${this.wsUrl}/${symbol.toLowerCase()}@ticker`,
      });
    }

    const unsubscribe = this.wsManager.subscribe('*', (message) => {
      if (message.data && message.data.e === '24hrTicker') {
        const ticker: BinanceTicker = {
          symbol: message.data.s,
          price: message.data.c,
          priceChange: message.data.P,
          priceChangePercent: message.data.P,
          volume: message.data.v,
          timestamp: message.data.E,
        };
        callback(ticker);
      }
    });

    this.wsManager.connect();
    
    return () => {
      unsubscribe();
      if (this.wsManager) {
        this.wsManager.disconnect();
        this.wsManager = null;
      }
    };
  }

  /**
   * Get exchange info
   */
  async getExchangeInfo(): Promise<any> {
    const cacheKey = 'exchange_info';
    const cached = this.getCachedData(cacheKey, 3600000); // Cache for 1 hour
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseUrl}/exchangeInfo`, {
        timeout: 10000,
      });

      this.setCacheData(cacheKey, response.data, 3600000);
      return response.data;
    } catch (error) {
      console.error('Binance exchange info fetch failed:', error);
      throw new Error('Failed to fetch exchange info');
    }
  }

  /**
   * Get server time
   */
  async getServerTime(): Promise<number> {
    try {
      const response = await axios.get(`${this.baseUrl}/time`, {
        timeout: 5000,
      });
      return response.data.serverTime;
    } catch (error) {
      console.error('Binance server time fetch failed:', error);
      return Date.now();
    }
  }

  /**
   * Get 24hr price statistics for all symbols
   */
  async getAllTickers(): Promise<BinanceTicker[]> {
    const cacheKey = 'all_tickers';
    const cached = this.getCachedData(cacheKey, 30000); // Cache for 30 seconds
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseUrl}/ticker/24hr`, {
        timeout: 15000,
      });

      const tickers: BinanceTicker[] = response.data.map((ticker: any) => ({
        symbol: ticker.symbol,
        price: ticker.lastPrice,
        priceChange: ticker.priceChange,
        priceChangePercent: ticker.priceChangePercent,
        volume: ticker.volume,
        timestamp: Date.now(),
      }));

      this.setCacheData(cacheKey, tickers, 30000);
      return tickers;
    } catch (error) {
      console.error('Binance all tickers fetch failed:', error);
      throw new Error('Failed to fetch all tickers');
    }
  }

  /**
   * Cache management
   */
  private getCachedData(key: string, maxAge: number = config.cache.ttl): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.data;
    }
    return null;
  }

  private setCacheData(key: string, data: any, ttl: number = config.cache.ttl): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Clean up old cache entries
    if (this.cache.size > config.cache.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Health check
   */
  async getHealthStatus(): Promise<{
    api: boolean;
    websocket: boolean;
    cacheSize: number;
  }> {
    let apiHealth = false;
    let wsHealth = false;

    try {
      await this.getServerTime();
      apiHealth = true;
    } catch {
      apiHealth = false;
    }

    if (this.wsManager) {
      wsHealth = this.wsManager.getStatus() === 'connected';
    }

    return {
      api: apiHealth,
      websocket: wsHealth,
      cacheSize: this.cache.size,
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.wsManager) {
      this.wsManager.disconnect();
      this.wsManager = null;
    }
    this.cache.clear();
  }
}