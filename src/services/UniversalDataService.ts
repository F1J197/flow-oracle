import { supabase } from '@/integrations/supabase/client';
import FREDService from './FREDService';

export interface UniversalIndicatorData {
  symbol: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  confidence: number;
  source: string;
  provider: string;
}

export interface DataProviderRequest {
  provider: 'fred' | 'glassnode' | 'binance' | 'coinbase' | 'polygon' | 'finnhub';
  endpoint: string;
  symbol?: string;
  parameters?: Record<string, any>;
}

class UniversalDataService {
  private static instance: UniversalDataService;
  private fredService: FREDService;
  private cache = new Map<string, { data: UniversalIndicatorData; expiry: number }>();
  private readonly CACHE_TTL = 300000; // 5 minutes

  private constructor() {
    this.fredService = FREDService.getInstance();
  }

  static getInstance(): UniversalDataService {
    if (!UniversalDataService.instance) {
      UniversalDataService.instance = new UniversalDataService();
    }
    return UniversalDataService.instance;
  }

  async fetchIndicator(symbol: string, provider: string = 'fred'): Promise<UniversalIndicatorData | null> {
    const cacheKey = `${provider}:${symbol}`;
    
    // Check cache first
    const cached = this.getCachedIndicator(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let data: UniversalIndicatorData | null = null;

      switch (provider.toLowerCase()) {
        case 'fred':
          data = await this.fetchFREDIndicator(symbol);
          break;
        case 'coinbase':
          data = await this.fetchCoinbaseIndicator(symbol);
          break;
        case 'binance':
          data = await this.fetchBinanceIndicator(symbol);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      if (data) {
        this.setCachedIndicator(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error(`Error fetching ${symbol} from ${provider}:`, error);
      return null;
    }
  }

  async fetchMultipleIndicators(requests: Array<{ symbol: string; provider: string }>): Promise<Record<string, UniversalIndicatorData | null>> {
    const results: Record<string, UniversalIndicatorData | null> = {};
    
    console.log(`🔄 Fetching ${requests.length} indicators from multiple providers...`);
    
    // Process in parallel with controlled concurrency
    const chunks = this.chunkArray(requests, 5);
    
    for (const chunk of chunks) {
      const promises = chunk.map(async (request) => {
        const data = await this.fetchIndicator(request.symbol, request.provider);
        return { key: `${request.provider}:${request.symbol}`, data };
      });
      
      const chunkResults = await Promise.all(promises);
      chunkResults.forEach(({ key, data }) => {
        results[key] = data;
      });
    }
    
    return results;
  }

  private async fetchFREDIndicator(symbol: string): Promise<UniversalIndicatorData | null> {
    try {
      const data = await this.fredService.fetchSeries(symbol);
      
      if (data.length === 0) {
        return null;
      }

      const latest = data[0];
      const previous = data[1];
      
      const current = latest.value;
      const prev = previous ? previous.value : current * 0.99;
      const change = current - prev;
      const changePercent = prev !== 0 ? (change / prev) * 100 : 0;

      return {
        symbol,
        current,
        previous: prev,
        change,
        changePercent,
        timestamp: new Date(latest.date),
        confidence: 0.9,
        source: 'fred_api',
        provider: 'fred'
      };
    } catch (error) {
      console.error(`FRED indicator fetch failed for ${symbol}:`, error);
      return null;
    }
  }

  private async fetchCoinbaseIndicator(symbol: string): Promise<UniversalIndicatorData | null> {
    try {
      const { data, error } = await supabase.functions.invoke('universal-data-proxy', {
        body: {
          provider: 'coinbase',
          endpoint: `/products/${symbol}/ticker`,
          symbol
        }
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Coinbase API request failed');
      }

      const ticker = data.data;
      const current = parseFloat(ticker.price);
      const volume = parseFloat(ticker.volume);

      return {
        symbol,
        current,
        previous: current * 0.999, // Estimate previous
        change: current * 0.001,   // Estimate change
        changePercent: 0.1,        // Estimate change percent
        timestamp: new Date(ticker.time),
        confidence: 0.95,
        source: 'coinbase_api',
        provider: 'coinbase'
      };
    } catch (error) {
      console.error(`Coinbase indicator fetch failed for ${symbol}:`, error);
      return null;
    }
  }

  private async fetchBinanceIndicator(symbol: string): Promise<UniversalIndicatorData | null> {
    try {
      const { data, error } = await supabase.functions.invoke('universal-data-proxy', {
        body: {
          provider: 'binance',
          endpoint: '/api/v3/ticker/24hr',
          symbol: symbol.replace('-', '')
        }
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Binance API request failed');
      }

      const ticker = data.data;
      const current = parseFloat(ticker.lastPrice);
      const change = parseFloat(ticker.priceChange);
      const changePercent = parseFloat(ticker.priceChangePercent);

      return {
        symbol,
        current,
        previous: current - change,
        change,
        changePercent,
        timestamp: new Date(),
        confidence: 0.95,
        source: 'binance_api',
        provider: 'binance'
      };
    } catch (error) {
      console.error(`Binance indicator fetch failed for ${symbol}:`, error);
      return null;
    }
  }

  async makeDirectRequest(request: DataProviderRequest): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('universal-data-proxy', {
        body: request
      });

      if (error) {
        throw new Error(`Proxy request failed: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Provider request failed');
      }

      return data.data;
    } catch (error) {
      console.error('Direct request failed:', error);
      throw error;
    }
  }

  // Legacy compatibility methods
  async refreshIndicator(symbol: string): Promise<UniversalIndicatorData | null> {
    return this.fetchIndicator(symbol, 'fred');
  }

  async refreshMultipleIndicators(symbols: string[]): Promise<Record<string, UniversalIndicatorData | null>> {
    const requests = symbols.map(symbol => ({ symbol, provider: 'fred' }));
    return this.fetchMultipleIndicators(requests);
  }

  private getCachedIndicator(key: string): UniversalIndicatorData | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCachedIndicator(key: string, data: UniversalIndicatorData): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_TTL
    });
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Legacy compatibility methods for existing hooks/engines
  async getHistoricalData(request: any): Promise<any[]> {
    // Mock implementation for compatibility
    console.warn('getHistoricalData is deprecated, use fetchIndicator instead');
    return [];
  }

  subscribe(subscription: any): () => void {
    // Mock implementation for compatibility
    console.warn('subscribe is deprecated, use direct data fetching instead');
    return () => {};
  }

  getAllIndicatorStates(): any[] {
    // Mock implementation for compatibility
    console.warn('getAllIndicatorStates is deprecated');
    return [];
  }

  // Health and utility methods
  getHealthStatus(): {
    cacheSize: number;
    fredServiceHealth: any;
    lastActivity: number;
  } {
    return {
      cacheSize: this.cache.size,
      fredServiceHealth: this.fredService.getHealthStatus(),
      lastActivity: Date.now()
    };
  }

  clearCache(): void {
    this.cache.clear();
    this.fredService.clearCache();
    console.log('Universal data service cache cleared');
  }
}

export default UniversalDataService;