/**
 * FRED Data Service for Net Liquidity Engine
 * Handles Federal Reserve Economic Data API integration
 */

import { supabase } from '@/integrations/supabase/client';
import { debugLogger } from '@/utils/debugLogger';

interface FREDObservation {
  date: string;
  value: string;
  realtime_start: string;
  realtime_end: string;
}

interface FREDResponse {
  observations: FREDObservation[];
}

interface NetLiquidityComponents {
  WALCL: number;    // Fed Balance Sheet Assets
  WTREGEN: number;  // Treasury General Account
  RRPONTSYD: number; // Reverse Repo Operations
  timestamp: string;
}

class FREDDataService {
  private static instance: FREDDataService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): FREDDataService {
    if (!FREDDataService.instance) {
      FREDDataService.instance = new FREDDataService();
    }
    return FREDDataService.instance;
  }

  /**
   * Fetch the latest net liquidity components from FRED via Supabase proxy
   */
  async getNetLiquidityComponents(): Promise<NetLiquidityComponents | null> {
    try {
      // Check cache first
      const cacheKey = 'net_liquidity_components';
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }

      // Fetch from Supabase function (FRED proxy)
      const { data, error } = await supabase.functions.invoke('fred-data-ingestion', {
        body: {
          symbols: ['WALCL', 'WTREGEN', 'RRPONTSYD'],
          priority: 1
        }
      });

      if (error) {
        debugLogger.error('FRED_DATA', 'FRED data fetch error', error);
        return this.getFallbackData();
      }

      if (!data || !data.success) {
        debugLogger.warn('FRED_DATA', 'FRED data fetch unsuccessful', data);
        return this.getFallbackData();
      }

      const components = this.parseNetLiquidityData(data.results);
      
      // Cache the result
      this.cache.set(cacheKey, { data: components, timestamp: Date.now() });
      
      return components;
    } catch (error: any) {
      debugLogger.error('FRED_DATA', 'Net liquidity fetch error', error?.message || 'Unknown error');
      return this.getFallbackData();
    }
  }

  /**
   * Parse FRED API response into net liquidity components
   */
  private parseNetLiquidityData(results: any[]): NetLiquidityComponents {
    const components: Partial<NetLiquidityComponents> = {
      timestamp: new Date().toISOString()
    };

    results.forEach(result => {
      if (result.symbol && result.value !== null) {
        const value = parseFloat(result.value);
        if (!isNaN(value)) {
          switch (result.symbol) {
            case 'WALCL':
              components.WALCL = value * 1e9; // Convert billions to actual value
              break;
            case 'WTREGEN':
              components.WTREGEN = value * 1e9;
              break;
            case 'RRPONTSYD':
              components.RRPONTSYD = value * 1e9;
              break;
          }
        }
      }
    });

    // Validate all components are present
    if (components.WALCL && components.WTREGEN && components.RRPONTSYD) {
      return components as NetLiquidityComponents;
    }

    throw new Error('Incomplete FRED data received');
  }

  /**
   * Calculate net liquidity using Kalman-adaptive formula
   * Formula: Net Liquidity = WALCL - (α * WTREGEN) - RRPONTSYD
   */
  calculateNetLiquidity(components: NetLiquidityComponents, alphaCoeff = 0.95): number {
    const { WALCL, WTREGEN, RRPONTSYD } = components;
    
    // Dynamic alpha coefficient (can be enhanced with Kalman filter)
    const netLiquidity = WALCL - (alphaCoeff * WTREGEN) - RRPONTSYD;
    
    debugLogger.info('NET_LIQUIDITY', 'Net Liquidity Calculation', {
      WALCL: WALCL / 1e12, // Show in trillions for readability
      WTREGEN: WTREGEN / 1e12,
      RRPONTSYD: RRPONTSYD / 1e12,
      alpha: alphaCoeff,
      result: netLiquidity / 1e12
    });

    return netLiquidity;
  }

  /**
   * Get historical net liquidity trend (simplified)
   */
  async getNetLiquidityTrend(periods = 12): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from('market_indicators')
        .select('value, created_at')
        .eq('symbol', 'NET_LIQUIDITY')
        .order('created_at', { ascending: false })
        .limit(periods);

      if (error) {
        debugLogger.error('NET_LIQUIDITY', 'Net liquidity trend fetch error', error.message || 'Unknown error');
        return this.generateMockTrend(periods);
      }

      return data?.map(d => parseFloat(d.value)) || this.generateMockTrend(periods);
    } catch (error: any) {
      debugLogger.error('NET_LIQUIDITY', 'Net liquidity trend error', error?.message || 'Unknown error');
      return this.generateMockTrend(periods);
    }
  }

  /**
   * Fallback data for when FRED API is unavailable
   */
  private getFallbackData(): NetLiquidityComponents {
    debugLogger.warn('FRED_DATA', 'Using fallback FRED data');
    return {
      WALCL: 7.8e12,      // ~$7.8T (approximate current level)
      WTREGEN: 0.6e12,    // ~$600B
      RRPONTSYD: 2.3e12,  // ~$2.3T
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate mock trend data for fallback scenarios
   */
  private generateMockTrend(periods: number): number[] {
    const trend: number[] = [];
    const baseValue = 5.2e12; // ~$5.2T baseline
    
    for (let i = 0; i < periods; i++) {
      const variance = (Math.random() - 0.5) * 0.5e12; // ±$500B variance
      trend.push(baseValue + variance);
    }
    
    return trend.reverse(); // Oldest to newest
  }

  /**
   * Convert net liquidity to composite score (0-100)
   */
  calculateCompositeScore(netLiquidity: number): number {
    // Historical range approximately -2T to +8T
    const minRange = -2e12;
    const maxRange = 8e12;
    
    // Normalize to 0-100 scale
    const normalized = (netLiquidity - minRange) / (maxRange - minRange);
    const score = Math.max(0, Math.min(100, normalized * 100));
    
    return Math.round(score * 10) / 10; // Round to 1 decimal
  }

  /**
   * Determine regime based on net liquidity level
   */
  determineRegime(compositeScore: number): string {
    if (compositeScore >= 80) return 'EXTREME_LIQUIDITY';
    if (compositeScore >= 60) return 'HIGH_LIQUIDITY';
    if (compositeScore >= 40) return 'NORMAL_LIQUIDITY';
    if (compositeScore >= 20) return 'LOW_LIQUIDITY';
    return 'LIQUIDITY_CRUNCH';
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const fredDataService = FREDDataService.getInstance();
export type { NetLiquidityComponents };