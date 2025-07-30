import { supabase } from '@/integrations/supabase/client';

export interface AlternativeDataPoint {
  date: string;
  value: number;
  source: string;
  symbol: string;
}

export interface AlternativeDataResponse {
  success: boolean;
  data?: AlternativeDataPoint[];
  error?: string;
  source: string;
}

class AlternativeDataService {
  private static instance: AlternativeDataService;
  private cache = new Map<string, { data: AlternativeDataPoint[]; expiry: number }>();
  private readonly CACHE_TTL = 300000; // 5 minutes

  private constructor() {}

  static getInstance(): AlternativeDataService {
    if (!AlternativeDataService.instance) {
      AlternativeDataService.instance = new AlternativeDataService();
    }
    return AlternativeDataService.instance;
  }

  async fetchFromMultipleSources(symbol: string): Promise<AlternativeDataPoint[]> {
    const cacheKey = `multi-${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    console.log(`🔄 Fetching ${symbol} from multiple sources...`);

    const sources = this.getSourcesForSymbol(symbol);
    const results: AlternativeDataPoint[] = [];

    for (const source of sources) {
      try {
        const data = await this.fetchFromSource(symbol, source);
        if (data.success && data.data && data.data.length > 0) {
          results.push(...data.data);
          console.log(`✅ Successfully fetched ${symbol} from ${source}`);
          break; // Use first successful source
        }
      } catch (error) {
        console.error(`❌ Failed to fetch ${symbol} from ${source}:`, error);
      }
    }

    if (results.length > 0) {
      this.setCachedData(cacheKey, results);
    }

    return results;
  }

  private async fetchFromSource(symbol: string, source: string): Promise<AlternativeDataResponse> {
    const { data, error } = await supabase.functions.invoke('universal-data-proxy', {
      body: {
        provider: source,
        symbol: this.mapSymbolForSource(symbol, source),
        parameters: {
          limit: 10,
          interval: 'daily'
        }
      }
    });

    if (error) {
      throw new Error(`Supabase function error: ${error.message}`);
    }

    return data as AlternativeDataResponse;
  }

  private getSourcesForSymbol(symbol: string): string[] {
    const sourceMap: Record<string, string[]> = {
      'btc-price': ['coingecko', 'binance', 'coindesk'],
      'btc-market-cap': ['coingecko', 'coindesk'],
      'spx': ['alpha-vantage', 'yahoo-finance'],
      'vix': ['alpha-vantage', 'yahoo-finance'],
      'high-yield-spread': ['fred', 'alpha-vantage'],
      'investment-grade-spread': ['fred', 'alpha-vantage'],
      'fed-balance-sheet': ['fred'],
      'treasury-account': ['fred'],
      'reverse-repo': ['fred'],
      'net-liquidity': ['fred'],
      'credit-stress-score': ['fred', 'alpha-vantage']
    };

    return sourceMap[symbol] || ['fred'];
  }

  private mapSymbolForSource(symbol: string, source: string): string {
    const symbolMaps: Record<string, Record<string, string>> = {
      'coingecko': {
        'btc-price': 'bitcoin',
        'btc-market-cap': 'bitcoin'
      },
      'binance': {
        'btc-price': 'BTCUSDT'
      },
      'coindesk': {
        'btc-price': 'BTC',
        'btc-market-cap': 'BTC'
      },
      'alpha-vantage': {
        'spx': 'SPX',
        'vix': 'VIX',
        'high-yield-spread': 'HYG',
        'investment-grade-spread': 'LQD'
      },
      'yahoo-finance': {
        'spx': '^GSPC',
        'vix': '^VIX'
      }
    };

    return symbolMaps[source]?.[symbol] || symbol;
  }

  private getCachedData(key: string): AlternativeDataPoint[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCachedData(key: string, data: AlternativeDataPoint[]): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_TTL
    });
  }

  clearCache(): void {
    this.cache.clear();
    console.log('Alternative data service cache cleared');
  }
}

export default AlternativeDataService;