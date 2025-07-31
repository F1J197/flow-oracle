/**
 * Finnhub API Service - Free tier financial market data provider
 * Provides stocks, forex, crypto data with 60 API calls/minute free tier
 */

import { UniversalIndicatorData } from '../UniversalDataServiceV2';

interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

interface FinnhubForexRate {
  base: string;
  quote: string;
  c: number; // Current rate
  d: number; // Change
  dp: number; // Percent change
  t: number; // Timestamp
}

export class FinnhubService {
  private static instance: FinnhubService;
  private baseUrl = 'https://finnhub.io/api/v1';
  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly CACHE_TTL = 60000; // 1 minute
  private requestTimes: number[] = [];
  private readonly RATE_LIMIT = 60; // 60 requests per minute for free tier

  // Symbol mapping for common financial instruments
  private readonly SYMBOL_MAP: Record<string, string> = {
    // Major indices
    'SP500': '^GSPC',
    'NASDAQ': '^IXIC', 
    'RUSSELL2000': '^RUT',
    'VIX': '^VIX',
    
    // Forex pairs
    'EUR-USD': 'OANDA:EUR_USD',
    'GBP-USD': 'OANDA:GBP_USD', 
    'USD-JPY': 'OANDA:USD_JPY',
    'USD-CNY': 'OANDA:USD_CNH',
    'DXY': 'IC MARKETS:US30',
    
    // Crypto
    'BITCOIN': 'BINANCE:BTCUSDT',
    'ETHEREUM': 'BINANCE:ETHUSDT',
    
    // Commodities (via ETFs)
    'GOLD': 'GLD',
    'SILVER': 'SLV',
    'CRUDE-OIL': 'USO'
  };

  private constructor() {}

  static getInstance(): FinnhubService {
    if (!FinnhubService.instance) {
      FinnhubService.instance = new FinnhubService();
    }
    return FinnhubService.instance;
  }

  async fetchQuote(symbol: string): Promise<UniversalIndicatorData | null> {
    try {
      if (!this.canMakeRequest()) {
        console.warn('Finnhub rate limit reached');
        return null;
      }

      const mappedSymbol = this.SYMBOL_MAP[symbol.toUpperCase()] || symbol;
      
      // Check cache first
      const cacheKey = `quote_${mappedSymbol}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return this.transformToIndicatorData(cached, symbol);
      }

      this.recordRequest();

      const response = await fetch(
        `${this.baseUrl}/quote?symbol=${mappedSymbol}&token=demo`, // Using demo token for free tier
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status}`);
      }

      const data: FinnhubQuote = await response.json();

      // Check if we got valid data
      if (data.c === 0 && data.pc === 0) {
        console.warn(`No data available for ${symbol} on Finnhub`);
        return null;
      }

      // Cache the result
      this.setCache(cacheKey, data);

      return this.transformToIndicatorData(data, symbol);
    } catch (error) {
      console.error(`Finnhub fetch error for ${symbol}:`, error);
      return null;
    }
  }

  async fetchForexRate(base: string, quote: string = 'USD'): Promise<UniversalIndicatorData | null> {
    try {
      if (!this.canMakeRequest()) {
        console.warn('Finnhub rate limit reached');
        return null;
      }

      const symbol = `OANDA:${base}_${quote}`;
      
      // Check cache first
      const cacheKey = `forex_${base}_${quote}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return this.transformToIndicatorData(cached, `${base}-${quote}`);
      }

      this.recordRequest();

      const response = await fetch(
        `${this.baseUrl}/forex/rates?base=${base}&token=demo`
      );

      if (!response.ok) {
        throw new Error(`Finnhub forex API error: ${response.status}`);
      }

      const data = await response.json();
      const rateData = data.quote?.[quote];

      if (!rateData) {
        console.warn(`No forex data for ${base}/${quote} on Finnhub`);
        return null;
      }

      // Cache the result
      this.setCache(cacheKey, rateData);

      return this.transformToIndicatorData(rateData, `${base}-${quote}`);
    } catch (error) {
      console.error(`Finnhub forex fetch error for ${base}/${quote}:`, error);
      return null;
    }
  }

  async fetchMultipleQuotes(symbols: string[]): Promise<Record<string, UniversalIndicatorData | null>> {
    const results: Record<string, UniversalIndicatorData | null> = {};
    
    // Process symbols sequentially to respect rate limits
    for (const symbol of symbols) {
      if (!this.canMakeRequest()) {
        console.warn('Finnhub rate limit reached, stopping batch processing');
        break;
      }
      
      const data = await this.fetchQuote(symbol);
      results[symbol] = data;
      
      // Small delay between requests
      await this.delay(1100); // Slightly over 1 second to stay under 60/min limit
    }
    
    return results;
  }

  getHealthStatus(): { available: boolean; requestsRemaining: number; cacheSize: number } {
    this.cleanOldRequests();
    const requestsInLastMinute = this.requestTimes.length;
    
    return {
      available: requestsInLastMinute < this.RATE_LIMIT,
      requestsRemaining: Math.max(0, this.RATE_LIMIT - requestsInLastMinute),
      cacheSize: this.cache.size
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  private transformToIndicatorData(quoteData: FinnhubQuote | any, symbol: string): UniversalIndicatorData {
    const current = quoteData.c || 0;
    const previous = quoteData.pc || current;
    const change = quoteData.d || 0;
    const changePercent = quoteData.dp || 0;
    const timestamp = quoteData.t ? new Date(quoteData.t * 1000) : new Date();

    return {
      symbol: symbol.toUpperCase(),
      current,
      previous,
      change,
      changePercent,
      timestamp,
      confidence: 0.85, // Finnhub is reliable but free tier has limitations
      source: 'finnhub',
      provider: 'Finnhub',
      metadata: {
        high: quoteData.h,
        low: quoteData.l,
        open: quoteData.o
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

  private canMakeRequest(): boolean {
    this.cleanOldRequests();
    return this.requestTimes.length < this.RATE_LIMIT;
  }

  private recordRequest(): void {
    this.requestTimes.push(Date.now());
  }

  private cleanOldRequests(): void {
    const oneMinuteAgo = Date.now() - 60000;
    this.requestTimes = this.requestTimes.filter(time => time > oneMinuteAgo);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const finnhubService = FinnhubService.getInstance();