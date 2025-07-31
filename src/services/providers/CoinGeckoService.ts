/**
 * CoinGecko API Service - Free tier cryptocurrency data provider
 * Provides comprehensive crypto market data with generous rate limits
 */

import { UniversalIndicatorData } from '../UniversalDataServiceV2';

interface CoinGeckoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  last_updated: string;
}

interface CoinGeckoMarketData {
  prices: [number, number][]; // [timestamp, price] pairs
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export class CoinGeckoService {
  private static instance: CoinGeckoService;
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly CACHE_TTL = 60000; // 1 minute
  private lastRequestTime = 0;
  private readonly RATE_LIMIT_DELAY = 6000; // 6 seconds between requests for free tier

  // CoinGecko symbol mapping
  private readonly SYMBOL_MAP: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum', 
    'BNB': 'binancecoin',
    'SOL': 'solana',
    'ADA': 'cardano',
    'MATIC': 'matic-network',
    'DOT': 'polkadot',
    'AVAX': 'avalanche-2',
    'LINK': 'chainlink',
    'UNI': 'uniswap'
  };

  private constructor() {}

  static getInstance(): CoinGeckoService {
    if (!CoinGeckoService.instance) {
      CoinGeckoService.instance = new CoinGeckoService();
    }
    return CoinGeckoService.instance;
  }

  async fetchCryptoPrice(symbol: string): Promise<UniversalIndicatorData | null> {
    try {
      const coinId = this.SYMBOL_MAP[symbol.toUpperCase()] || symbol.toLowerCase();
      
      // Check cache first
      const cacheKey = `price_${coinId}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return this.transformToIndicatorData(cached, symbol);
      }

      // Rate limiting
      await this.enforceRateLimit();

      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const coinData = data[coinId];

      if (!coinData) {
        console.warn(`No data found for ${symbol} (${coinId}) on CoinGecko`);
        return null;
      }

      // Cache the result
      this.setCache(cacheKey, coinData);

      return this.transformToIndicatorData(coinData, symbol);
    } catch (error) {
      console.error(`CoinGecko fetch error for ${symbol}:`, error);
      return null;
    }
  }

  async fetchMultipleCryptoPrices(symbols: string[]): Promise<Record<string, UniversalIndicatorData | null>> {
    const results: Record<string, UniversalIndicatorData | null> = {};
    
    try {
      // Map symbols to coin IDs
      const coinIds = symbols.map(symbol => this.SYMBOL_MAP[symbol.toUpperCase()] || symbol.toLowerCase());
      const uniqueCoinIds = [...new Set(coinIds)];
      
      // Check cache for all coins first
      const uncachedIds: string[] = [];
      const symbolToCoinId: Record<string, string> = {};
      
      symbols.forEach(symbol => {
        const coinId = this.SYMBOL_MAP[symbol.toUpperCase()] || symbol.toLowerCase();
        symbolToCoinId[symbol] = coinId;
        
        const cached = this.getCached(`price_${coinId}`);
        if (cached) {
          results[symbol] = this.transformToIndicatorData(cached, symbol);
        } else {
          if (!uncachedIds.includes(coinId)) {
            uncachedIds.push(coinId);
          }
        }
      });

      // Fetch uncached data
      if (uncachedIds.length > 0) {
        await this.enforceRateLimit();

        const response = await fetch(
          `${this.baseUrl}/simple/price?ids=${uncachedIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`CoinGecko API error: ${response.status}`);
        }

        const data = await response.json();

        // Process results for symbols that weren't cached
        symbols.forEach(symbol => {
          if (!results[symbol]) {
            const coinId = symbolToCoinId[symbol];
            const coinData = data[coinId];
            
            if (coinData) {
              this.setCache(`price_${coinId}`, coinData);
              results[symbol] = this.transformToIndicatorData(coinData, symbol);
            } else {
              results[symbol] = null;
            }
          }
        });
      }

      return results;
    } catch (error) {
      console.error('CoinGecko multiple fetch error:', error);
      
      // Return partial results for cached items, null for rest
      symbols.forEach(symbol => {
        if (!results[symbol]) {
          results[symbol] = null;
        }
      });
      
      return results;
    }
  }

  async fetchHistoricalData(symbol: string, days: number = 30): Promise<CoinGeckoMarketData | null> {
    try {
      const coinId = this.SYMBOL_MAP[symbol.toUpperCase()] || symbol.toLowerCase();
      
      await this.enforceRateLimit();

      const response = await fetch(
        `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko historical data error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`CoinGecko historical data error for ${symbol}:`, error);
      return null;
    }
  }

  getHealthStatus(): { available: boolean; cacheSize: number; lastRequest: number } {
    return {
      available: true,
      cacheSize: this.cache.size,
      lastRequest: this.lastRequestTime
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  private transformToIndicatorData(coinData: any, symbol: string): UniversalIndicatorData {
    const current = coinData.usd || coinData.current_price || 0;
    const change24h = coinData.usd_24h_change || coinData.price_change_24h || 0;
    const changePercent = coinData.price_change_percentage_24h || 0;
    const previous = current - change24h;

    return {
      symbol: symbol.toUpperCase(),
      current,
      previous,
      change: change24h,
      changePercent,
      timestamp: new Date(coinData.last_updated_at ? coinData.last_updated_at * 1000 : Date.now()),
      confidence: 0.95, // CoinGecko is highly reliable
      source: 'coingecko',
      provider: 'CoinGecko',
      metadata: {
        market_cap: coinData.market_cap,
        last_updated: coinData.last_updated_at
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

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      const waitTime = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
}

export const coinGeckoService = CoinGeckoService.getInstance();