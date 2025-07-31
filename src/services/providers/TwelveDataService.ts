/**
 * Twelve Data API Service - Free tier financial market data provider
 * Provides stocks, forex, commodities, and crypto data with 800 requests/day free tier
 */

import { UniversalIndicatorData } from '../UniversalDataServiceV2';

interface TwelveDataQuote {
  symbol: string;
  name: string;
  exchange: string;
  mic_code: string;
  currency: string;
  datetime: string;
  timestamp: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  previous_close: string;
  change: string;
  percent_change: string;
  fifty_two_week: {
    low: string;
    high: string;
    low_change: string;
    high_change: string;
    low_change_percent: string;
    high_change_percent: string;
  };
}

interface TwelveDataTimeSeries {
  values: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  }>;
  status: string;
}

export class TwelveDataService {
  private static instance: TwelveDataService;
  private baseUrl = 'https://api.twelvedata.com';
  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly CACHE_TTL = 300000; // 5 minutes
  private requestCount = 0;
  private dailyLimit = 800; // Free tier limit
  private lastResetDate = new Date().toDateString();

  // Symbol mapping for common indicators
  private readonly SYMBOL_MAP: Record<string, string> = {
    // Equity Indices
    'SP500': 'SPX',
    'NASDAQ': 'IXIC',
    'RUSSELL2000': 'RUT',
    'VIX': 'VIX',
    
    // Forex
    'DXY': 'DXY',
    'EUR-USD': 'EUR/USD',
    'GBP-USD': 'GBP/USD',
    'USD-JPY': 'USD/JPY',
    'USD-CNY': 'USD/CNH',
    
    // Commodities
    'GOLD': 'XAU/USD',
    'SILVER': 'XAG/USD',
    'CRUDE-OIL': 'WTI/USD',
    'NATURAL-GAS': 'NG/USD',
    'COPPER': 'HG/USD',
    
    // Crypto (fallback for when CoinGecko is unavailable)
    'BITCOIN': 'BTC/USD',
    'ETHEREUM': 'ETH/USD'
  };

  private constructor() {
    this.resetDailyCountIfNeeded();
  }

  static getInstance(): TwelveDataService {
    if (!TwelveDataService.instance) {
      TwelveDataService.instance = new TwelveDataService();
    }
    return TwelveDataService.instance;
  }

  async fetchQuote(symbol: string): Promise<UniversalIndicatorData | null> {
    try {
      this.resetDailyCountIfNeeded();
      
      if (this.requestCount >= this.dailyLimit) {
        console.warn('Twelve Data daily limit reached');
        return null;
      }

      const mappedSymbol = this.SYMBOL_MAP[symbol.toUpperCase()] || symbol;
      
      // Check cache first
      const cacheKey = `quote_${mappedSymbol}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return this.transformToIndicatorData(cached, symbol);
      }

      this.requestCount++;

      const response = await fetch(
        `${this.baseUrl}/quote?symbol=${mappedSymbol}&apikey=demo`, // Using demo key for free tier
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Twelve Data API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'error') {
        console.warn(`Twelve Data error for ${symbol}:`, data.message);
        return null;
      }

      // Cache the result
      this.setCache(cacheKey, data);

      return this.transformToIndicatorData(data, symbol);
    } catch (error) {
      console.error(`Twelve Data fetch error for ${symbol}:`, error);
      return null;
    }
  }

  async fetchMultipleQuotes(symbols: string[]): Promise<Record<string, UniversalIndicatorData | null>> {
    const results: Record<string, UniversalIndicatorData | null> = {};
    
    // Process symbols in batches to respect rate limits
    const batchSize = 5;
    const batches = this.chunkArray(symbols, batchSize);
    
    for (const batch of batches) {
      const batchPromises = batch.map(async (symbol) => {
        const data = await this.fetchQuote(symbol);
        return { symbol, data };
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ symbol, data }) => {
        results[symbol] = data;
      });
      
      // Add delay between batches to avoid hitting rate limits
      if (batches.indexOf(batch) < batches.length - 1) {
        await this.delay(2000); // 2 second delay
      }
    }
    
    return results;
  }

  async fetchTimeSeries(symbol: string, interval: string = '1day', outputSize: number = 30): Promise<TwelveDataTimeSeries | null> {
    try {
      this.resetDailyCountIfNeeded();
      
      if (this.requestCount >= this.dailyLimit) {
        console.warn('Twelve Data daily limit reached');
        return null;
      }

      const mappedSymbol = this.SYMBOL_MAP[symbol.toUpperCase()] || symbol;
      this.requestCount++;

      const response = await fetch(
        `${this.baseUrl}/time_series?symbol=${mappedSymbol}&interval=${interval}&outputsize=${outputSize}&apikey=demo`
      );

      if (!response.ok) {
        throw new Error(`Twelve Data time series error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'error') {
        console.warn(`Twelve Data time series error for ${symbol}:`, data.message);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Twelve Data time series error for ${symbol}:`, error);
      return null;
    }
  }

  getHealthStatus(): { available: boolean; requestsRemaining: number; cacheSize: number } {
    this.resetDailyCountIfNeeded();
    return {
      available: this.requestCount < this.dailyLimit,
      requestsRemaining: Math.max(0, this.dailyLimit - this.requestCount),
      cacheSize: this.cache.size
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  private transformToIndicatorData(quoteData: TwelveDataQuote, symbol: string): UniversalIndicatorData {
    const current = parseFloat(quoteData.close);
    const previous = parseFloat(quoteData.previous_close);
    const change = parseFloat(quoteData.change);
    const changePercent = parseFloat(quoteData.percent_change);

    return {
      symbol: symbol.toUpperCase(),
      current,
      previous,
      change,
      changePercent,
      timestamp: new Date(quoteData.datetime),
      confidence: 0.9, // Twelve Data is reliable
      source: 'twelvedata',
      provider: 'Twelve Data',
      metadata: {
        exchange: quoteData.exchange,
        currency: quoteData.currency,
        volume: quoteData.volume,
        fifty_two_week: quoteData.fifty_two_week
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

  private resetDailyCountIfNeeded(): void {
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      this.requestCount = 0;
      this.lastResetDate = today;
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const twelveDataService = TwelveDataService.getInstance();