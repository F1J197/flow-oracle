// BinanceService for cryptocurrency data ingestion
import { IndicatorValue } from '@/types/indicators';

export interface BinanceTickerData {
  symbol: string;
  price: string;
  volume: string;
  priceChange: string;
  priceChangePercent: string;
}

export interface DataIngestionSource {
  fetchSymbolData(symbol: string): Promise<IndicatorValue | null>;
  fetchMultipleSymbols(symbols: string[]): Promise<Record<string, IndicatorValue | null>>;
  getHealthStatus(): { available: boolean; lastPing?: number };
}

export class BinanceService implements DataIngestionSource {
  private baseUrl = 'https://api.binance.com/api/v3';
  private wsUrl = 'wss://stream.binance.com:9443/ws';
  private cache: Map<string, { data: IndicatorValue; timestamp: number }> = new Map();
  private cacheTTL = 60000; // 1 minute

  async fetchSymbolData(symbol: string): Promise<IndicatorValue | null> {
    try {
      // Check cache first
      const cached = this.cache.get(symbol);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }

      const response = await fetch(`${this.baseUrl}/ticker/24hr?symbol=${symbol.toUpperCase()}`);
      if (!response.ok) {
        console.warn(`Failed to fetch ${symbol} from Binance:`, response.statusText);
        return null;
      }

      const data: BinanceTickerData = await response.json();
      
      const indicatorValue: IndicatorValue = {
        current: parseFloat(data.price),
        timestamp: new Date(),
        confidence: 0.9,
        volume: parseFloat(data.volume),
        change: parseFloat(data.priceChange),
        changePercent: parseFloat(data.priceChangePercent)
      };

      // Cache the result
      this.cache.set(symbol, { data: indicatorValue, timestamp: Date.now() });
      
      return indicatorValue;
    } catch (error) {
      console.error(`Error fetching ${symbol} from Binance:`, error);
      return null;
    }
  }

  async fetchMultipleSymbols(symbols: string[]): Promise<Record<string, IndicatorValue | null>> {
    const results: Record<string, IndicatorValue | null> = {};
    
    // Binance allows batch requests for multiple symbols
    try {
      const symbolsParam = symbols.map(s => `"${s.toUpperCase()}"`).join(',');
      const response = await fetch(`${this.baseUrl}/ticker/24hr?symbols=[${symbolsParam}]`);
      
      if (!response.ok) {
        // Fallback to individual requests
        for (const symbol of symbols) {
          results[symbol] = await this.fetchSymbolData(symbol);
        }
        return results;
      }

      const dataArray: BinanceTickerData[] = await response.json();
      
      for (const data of dataArray) {
        const symbol = data.symbol.toLowerCase();
        const indicatorValue: IndicatorValue = {
          current: parseFloat(data.price),
          timestamp: new Date(),
          confidence: 0.9,
          volume: parseFloat(data.volume),
          change: parseFloat(data.priceChange),
          changePercent: parseFloat(data.priceChangePercent)
        };
        
        results[symbol] = indicatorValue;
        this.cache.set(symbol, { data: indicatorValue, timestamp: Date.now() });
      }
      
      // Handle any symbols not returned by the batch request
      for (const symbol of symbols) {
        if (!(symbol.toLowerCase() in results)) {
          results[symbol] = null;
        }
      }
      
    } catch (error) {
      console.error('Error fetching multiple symbols from Binance:', error);
      // Fallback to individual requests
      for (const symbol of symbols) {
        results[symbol] = await this.fetchSymbolData(symbol);
      }
    }
    
    return results;
  }

  getWebSocketUrl(symbol: string): string {
    return `${this.wsUrl}/${symbol.toLowerCase()}@ticker`;
  }

  getHealthStatus(): { available: boolean; lastPing?: number } {
    // Simple health check - could be enhanced with actual ping
    return { available: true };
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const binanceService = new BinanceService();