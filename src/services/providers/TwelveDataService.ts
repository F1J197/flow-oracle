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

  // Symbol mapping for common indicators - Add Treasury symbols
  private readonly SYMBOL_MAP: Record<string, string> = {
    // Treasury & Fed Data (use edge function for these)
    'treasury-general-account': 'TREASURY',
    'reverse-repo-operations': 'RRPO',
    'fed-balance-sheet': 'FED_BS',
    'WTREGEN': 'TREASURY',
    'RRPONTSYD': 'RRPO',
    'WALCL': 'FED_BS',
    
    // Equity Indices
    'SP500': 'SPX',
    'sp500': 'SPX',
    'NASDAQ': 'IXIC',
    'nasdaq': 'IXIC',
    'RUSSELL2000': 'RUT',
    'russell-2000': 'RUT',
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

      // Skip symbols that need FRED data
      const fredOnlySymbols = ['treasury-general-account', 'reverse-repo-operations', 'fed-balance-sheet', 'WTREGEN', 'RRPONTSYD', 'WALCL'];
      if (fredOnlySymbols.includes(symbol)) {
        console.warn(`Twelve Data error for ${symbol}: **symbol** or **figi** parameter is missing or invalid. Please provide a valid symbol according to API documentation: https://twelvedata.com/docs#reference-data`);
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
        'https://gotlitraitdvltnjdnni.supabase.co/functions/v1/twelve-data-proxy',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdGxpdHJhaXRkdmx0bmpkbm5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2ODc2NDksImV4cCI6MjA2OTI2MzY0OX0._6eCm4Vj0oRUThRPDekpHmd5Dq9DlqNvRlPkQ-czWlQ'
          },
          body: JSON.stringify({
            symbol: mappedSymbol,
            endpoint: 'quote'
          })
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
        'https://gotlitraitdvltnjdnni.supabase.co/functions/v1/twelve-data-proxy',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdGxpdHJhaXRkdmx0bmpkbm5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2ODc2NDksImV4cCI6MjA2OTI2MzY0OX0._6eCm4Vj0oRUThRPDekpHmd5Dq9DlqNvRlPkQ-czWlQ'
          },
          body: JSON.stringify({
            symbol: mappedSymbol,
            interval,
            outputsize: outputSize,
            endpoint: 'time_series'
          })
        }
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