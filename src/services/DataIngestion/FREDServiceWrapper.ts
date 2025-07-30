// FRED Service Wrapper for DataOrchestrator integration
import { FREDService } from '../FREDService';
import { IndicatorValue } from '@/types/indicators';
import { DataIngestionSource } from './BinanceService';

export class FREDServiceWrapper implements DataIngestionSource {
  private fredService = FREDService;

  async fetchSymbolData(symbol: string): Promise<IndicatorValue | null> {
    try {
      const data = await this.fredService.fetchSeries(symbol);
      
      if (!data || data.length === 0) {
        return null;
      }

      // Get the latest data point
      const latest = data[data.length - 1];
      const previous = data.length > 1 ? data[data.length - 2] : null;
      
      const current = latest.value;
      const prev = previous?.value;
      const change = prev ? current - prev : 0;
      const changePercent = prev ? ((current - prev) / prev) * 100 : 0;

      return {
        current,
        previous: prev,
        change,
        changePercent,
        timestamp: new Date(latest.date),
        confidence: 0.95, // FRED data is highly reliable
        quality: 0.98
      };
    } catch (error) {
      console.error(`Error fetching FRED data for ${symbol}:`, error);
      return null;
    }
  }

  async fetchMultipleSymbols(symbols: string[]): Promise<Record<string, IndicatorValue | null>> {
    const results: Record<string, IndicatorValue | null> = {};
    
    // Use FRED's multiple series fetch capability
    try {
      const multipleData = await this.fredService.fetchMultipleSeries(symbols);
      
      for (const [symbol, data] of Object.entries(multipleData)) {
        if (!data || data.length === 0) {
          results[symbol] = null;
          continue;
        }

        const latest = data[data.length - 1];
        const previous = data.length > 1 ? data[data.length - 2] : null;
        
        const current = latest.value;
        const prev = previous?.value;
        const change = prev ? current - prev : 0;
        const changePercent = prev ? ((current - prev) / prev) * 100 : 0;

        results[symbol] = {
          current,
          previous: prev,
          change,
          changePercent,
          timestamp: new Date(latest.date),
          confidence: 0.95,
          quality: 0.98
        };
      }
    } catch (error) {
      console.error('Error fetching multiple FRED series:', error);
      
      // Fallback to individual requests
      for (const symbol of symbols) {
        results[symbol] = await this.fetchSymbolData(symbol);
      }
    }
    
    return results;
  }

  getHealthStatus(): { available: boolean; lastPing?: number } {
    const health = this.fredService.getHealthStatus();
    return {
      available: health.cacheSize >= 0, // Basic health check
      lastPing: health.lastActivity
    };
  }
}

export const fredServiceWrapper = new FREDServiceWrapper();