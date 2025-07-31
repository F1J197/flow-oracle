/**
 * Binance API Service - Proxied through Supabase Edge Function
 * Provides real-time cryptocurrency data via proxy to avoid CORS issues
 */

import { UniversalIndicatorData } from '../UniversalDataServiceV2';
import { supabase } from '../../integrations/supabase/client';

interface BinanceTicker {
  symbol: string;
  price: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  count: number;
  openTime: number;
  closeTime: number;
}

interface BinanceKline {
  0: number;  // Open time
  1: string;  // Open price
  2: string;  // High price
  3: string;  // Low price
  4: string;  // Close price
  5: string;  // Volume
  6: number;  // Close time
  7: string;  // Quote asset volume
  8: number;  // Number of trades
  9: string;  // Taker buy base asset volume
  10: string; // Taker buy quote asset volume
  11: string; // Ignore
}

export class BinanceService {
  private static instance: BinanceService;
  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds for real-time data

  // Binance symbol mapping
  private readonly SYMBOL_MAP: Record<string, string> = {
    'BTC': 'BTCUSDT',
    'ETH': 'ETHUSDT',
    'BNB': 'BNBUSDT',
    'SOL': 'SOLUSDT',
    'ADA': 'ADAUSDT',
    'MATIC': 'MATICUSDT',
    'DOT': 'DOTUSDT',
    'AVAX': 'AVAXUSDT',
    'LINK': 'LINKUSDT',
    'UNI': 'UNIUSDT'
  };

  private constructor() {}

  static getInstance(): BinanceService {
    if (!BinanceService.instance) {
      BinanceService.instance = new BinanceService();
    }
    return BinanceService.instance;
  }

  async fetchCryptoPrice(symbol: string): Promise<UniversalIndicatorData | null> {
    try {
      const binanceSymbol = this.SYMBOL_MAP[symbol.toUpperCase()] || `${symbol.toUpperCase()}USDT`;
      
      // Check cache first
      const cacheKey = `ticker_${binanceSymbol}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return this.transformToIndicatorData(cached, symbol);
      }

      console.log(`Fetching ${symbol} data via Binance proxy`);

      // Use Supabase edge function proxy
      const { data, error } = await supabase.functions.invoke('binance-proxy', {
        body: {
          symbol: binanceSymbol,
          endpoint: '24hr'
        }
      });

      if (error) {
        console.error('Binance proxy error:', error);
        return null;
      }

      if (!data || data.error) {
        console.error('Binance API error:', data?.error);
        return null;
      }

      // Cache the result
      this.setCache(cacheKey, data);

      return this.transformToIndicatorData(data, symbol);
    } catch (error) {
      console.error(`Binance fetch error for ${symbol}:`, error);
      return null;
    }
  }

  async fetchMultipleCryptoPrices(symbols: string[]): Promise<Record<string, UniversalIndicatorData | null>> {
    const results: Record<string, UniversalIndicatorData | null> = {};
    
    // Fetch each symbol individually to use cache effectively
    for (const symbol of symbols) {
      results[symbol] = await this.fetchCryptoPrice(symbol);
    }
    
    return results;
  }

  async fetchHistoricalData(symbol: string, interval: string = '1d', limit: number = 100): Promise<BinanceKline[] | null> {
    try {
      const binanceSymbol = this.SYMBOL_MAP[symbol.toUpperCase()] || `${symbol.toUpperCase()}USDT`;
      
      console.log(`Fetching historical data for ${symbol} via Binance proxy`);

      const { data, error } = await supabase.functions.invoke('binance-proxy', {
        body: {
          symbol: binanceSymbol,
          endpoint: 'klines',
          interval,
          limit
        }
      });

      if (error) {
        console.error('Binance historical data proxy error:', error);
        return null;
      }

      if (!data || data.error) {
        console.error('Binance historical data API error:', data?.error);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Binance historical data error for ${symbol}:`, error);
      return null;
    }
  }

  getHealthStatus(): { available: boolean; cacheSize: number } {
    return {
      available: true,
      cacheSize: this.cache.size
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  private transformToIndicatorData(tickerData: BinanceTicker, symbol: string): UniversalIndicatorData {
    const current = parseFloat(tickerData.lastPrice || tickerData.price);
    const change = parseFloat(tickerData.priceChange);
    const changePercent = parseFloat(tickerData.priceChangePercent);
    const previous = current - change;

    return {
      symbol: symbol.toUpperCase(),
      current,
      previous,
      change,
      changePercent,
      timestamp: new Date(tickerData.closeTime || Date.now()),
      confidence: 0.98, // Binance is highly reliable
      source: 'binance',
      provider: 'Binance',
      metadata: {
        volume: tickerData.volume,
        count: tickerData.count,
        high: parseFloat(tickerData.highPrice),
        low: parseFloat(tickerData.lowPrice),
        open: parseFloat(tickerData.openPrice)
      }
    };
  }

  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_TTL
    });
  }
}

export const binanceService = BinanceService.getInstance();