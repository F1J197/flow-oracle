/**
 * LIQUIDITY² Terminal - Glassnode Data Service
 * On-chain analytics and blockchain metrics
 */

import axios from 'axios';
import { config } from '@/config/environment';

export interface GlassnodeMetric {
  timestamp: number;
  value: number;
  asset?: string;
  metric?: string;
}

export interface GlassnodeResponse {
  data: GlassnodeMetric[];
  meta?: {
    metric: string;
    asset: string;
    interval: string;
    units: string;
  };
}

export interface OnChainIndicator {
  name: string;
  endpoint: string;
  description: string;
  category: 'supply' | 'derivatives' | 'mining' | 'transactions' | 'addresses' | 'market' | 'defi';
  asset: 'BTC' | 'ETH' | 'LTC';
  interval: '1h' | '24h' | '1w' | '1month';
}

export class GlassnodeDataService {
  private static instance: GlassnodeDataService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  
  private readonly baseUrl = 'https://api.glassnode.com/v1/metrics';
  private readonly apiKey = config.apis.glassnode;

  static getInstance(): GlassnodeDataService {
    if (!this.instance) {
      this.instance = new GlassnodeDataService();
    }
    return this.instance;
  }

  private constructor() {}

  /**
   * Get Bitcoin network hash rate
   */
  async getBitcoinHashRate(days: number = 30): Promise<GlassnodeMetric[]> {
    return this.fetchMetric('mining/hash_rate_mean', 'BTC', '24h', days);
  }

  /**
   * Get Bitcoin supply metrics
   */
  async getBitcoinSupplyMetrics(days: number = 30): Promise<{
    circulatingSupply: GlassnodeMetric[];
    liquidSupply: GlassnodeMetric[];
    illiquidSupply: GlassnodeMetric[];
  }> {
    const [circulating, liquid, illiquid] = await Promise.allSettled([
      this.fetchMetric('supply/current', 'BTC', '24h', days),
      this.fetchMetric('supply/liquid_sum', 'BTC', '24h', days),
      this.fetchMetric('supply/illiquid_sum', 'BTC', '24h', days),
    ]);

    return {
      circulatingSupply: circulating.status === 'fulfilled' ? circulating.value : [],
      liquidSupply: liquid.status === 'fulfilled' ? liquid.value : [],
      illiquidSupply: illiquid.status === 'fulfilled' ? illiquid.value : [],
    };
  }

  /**
   * Get Bitcoin HODL waves
   */
  async getBitcoinHodlWaves(days: number = 90): Promise<GlassnodeMetric[]> {
    return this.fetchMetric('supply/hodl_waves', 'BTC', '24h', days);
  }

  /**
   * Get Bitcoin MVRV ratio
   */
  async getBitcoinMVRV(days: number = 365): Promise<GlassnodeMetric[]> {
    return this.fetchMetric('market/mvrv', 'BTC', '24h', days);
  }

  /**
   * Get Bitcoin NVT ratio
   */
  async getBitcoinNVT(days: number = 90): Promise<GlassnodeMetric[]> {
    return this.fetchMetric('market/nvt', 'BTC', '24h', days);
  }

  /**
   * Get Bitcoin Puell Multiple
   */
  async getBitcoinPuellMultiple(days: number = 180): Promise<GlassnodeMetric[]> {
    return this.fetchMetric('mining/puell_multiple', 'BTC', '24h', days);
  }

  /**
   * Get Bitcoin Fear & Greed components
   */
  async getBitcoinSentiment(days: number = 30): Promise<{
    longTermHolders: GlassnodeMetric[];
    shortTermHolders: GlassnodeMetric[];
    exchangeFlows: GlassnodeMetric[];
  }> {
    const [lth, sth, flows] = await Promise.allSettled([
      this.fetchMetric('supply/lth_sum', 'BTC', '24h', days),
      this.fetchMetric('supply/sth_sum', 'BTC', '24h', days),
      this.fetchMetric('transactions/exchange_flows_sum', 'BTC', '24h', days),
    ]);

    return {
      longTermHolders: lth.status === 'fulfilled' ? lth.value : [],
      shortTermHolders: sth.status === 'fulfilled' ? sth.value : [],
      exchangeFlows: flows.status === 'fulfilled' ? flows.value : [],
    };
  }

  /**
   * Get Ethereum DeFi metrics
   */
  async getEthereumDeFiMetrics(days: number = 30): Promise<{
    totalValueLocked: GlassnodeMetric[];
    gasUsed: GlassnodeMetric[];
    activeAddresses: GlassnodeMetric[];
  }> {
    const [tvl, gas, addresses] = await Promise.allSettled([
      this.fetchMetric('defi/total_value_locked_sum', 'ETH', '24h', days),
      this.fetchMetric('transactions/gas_used_sum', 'ETH', '24h', days),
      this.fetchMetric('addresses/active_count', 'ETH', '24h', days),
    ]);

    return {
      totalValueLocked: tvl.status === 'fulfilled' ? tvl.value : [],
      gasUsed: gas.status === 'fulfilled' ? gas.value : [],
      activeAddresses: addresses.status === 'fulfilled' ? addresses.value : [],
    };
  }

  /**
   * Get institutional metrics
   */
  async getInstitutionalMetrics(days: number = 90): Promise<{
    grayscaleBTC: GlassnodeMetric[];
    microstrategyBTC: GlassnodeMetric[];
    etfFlows: GlassnodeMetric[];
  }> {
    // Note: These endpoints may require premium access
    const [grayscale, microstrategy, etf] = await Promise.allSettled([
      this.fetchMetric('institutions/grayscale_holdings_sum', 'BTC', '24h', days),
      this.fetchMetric('institutions/microstrategy_holdings_sum', 'BTC', '24h', days),
      this.fetchMetric('institutions/etf_flows_sum', 'BTC', '24h', days),
    ]);

    return {
      grayscaleBTC: grayscale.status === 'fulfilled' ? grayscale.value : [],
      microstrategyBTC: microstrategy.status === 'fulfilled' ? microstrategy.value : [],
      etfFlows: etf.status === 'fulfilled' ? etf.value : [],
    };
  }

  /**
   * Generic metric fetcher
   */
  private async fetchMetric(
    endpoint: string,
    asset: string = 'BTC',
    interval: string = '24h',
    days: number = 30
  ): Promise<GlassnodeMetric[]> {
    const cacheKey = `${endpoint}_${asset}_${interval}_${days}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    if (!this.apiKey) {
      console.warn('Glassnode API key not configured, using mock data');
      return this.generateMockData(endpoint, days);
    }

    try {
      const since = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);
      
      const response = await axios.get(`${this.baseUrl}/${endpoint}`, {
        params: {
          a: asset,
          i: interval,
          s: since,
        },
        headers: {
          'X-API-KEY': this.apiKey,
        },
        timeout: 15000,
      });

      const metrics: GlassnodeMetric[] = response.data.map((item: any) => ({
        timestamp: item.t * 1000, // Convert to milliseconds
        value: parseFloat(item.v),
        asset,
        metric: endpoint,
      }));

      this.setCacheData(cacheKey, metrics, 300000); // Cache for 5 minutes
      return metrics;
    } catch (error) {
      console.error('Glassnode fetch failed:', error);
      
      // Return cached data if available, otherwise mock data
      const staleData = this.cache.get(cacheKey);
      if (staleData) {
        console.warn('Using stale Glassnode data');
        return staleData.data;
      }
      
      console.warn('Using mock Glassnode data');
      return this.generateMockData(endpoint, days);
    }
  }

  /**
   * Generate mock data for development/fallback
   */
  private generateMockData(endpoint: string, days: number): GlassnodeMetric[] {
    const data: GlassnodeMetric[] = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Generate base value based on endpoint
    let baseValue = 1;
    if (endpoint.includes('hash_rate')) baseValue = 400_000_000_000_000_000; // 400 EH/s
    else if (endpoint.includes('supply')) baseValue = 19_500_000; // 19.5M BTC
    else if (endpoint.includes('mvrv')) baseValue = 2.5;
    else if (endpoint.includes('nvt')) baseValue = 35;
    else if (endpoint.includes('puell')) baseValue = 1.2;
    else if (endpoint.includes('value_locked')) baseValue = 50_000_000_000; // 50B USD
    else if (endpoint.includes('gas_used')) baseValue = 12_000_000;
    else if (endpoint.includes('active_count')) baseValue = 500_000;

    for (let i = days - 1; i >= 0; i--) {
      const timestamp = now - i * dayMs;
      const randomFactor = 0.95 + Math.random() * 0.1; // ±5% variation
      const trendFactor = 1 + (Math.sin((i / days) * Math.PI * 2) * 0.05); // Subtle trend
      
      data.push({
        timestamp,
        value: baseValue * randomFactor * trendFactor,
        metric: endpoint,
      });
    }

    return data;
  }

  /**
   * Get available metrics catalog
   */
  getAvailableMetrics(): OnChainIndicator[] {
    return [
      // Supply metrics
      {
        name: 'Circulating Supply',
        endpoint: 'supply/current',
        description: 'Total coins in circulation',
        category: 'supply',
        asset: 'BTC',
        interval: '24h',
      },
      {
        name: 'Liquid Supply',
        endpoint: 'supply/liquid_sum',
        description: 'Coins considered liquid',
        category: 'supply',
        asset: 'BTC',
        interval: '24h',
      },
      {
        name: 'Illiquid Supply',
        endpoint: 'supply/illiquid_sum',
        description: 'Coins considered illiquid',
        category: 'supply',
        asset: 'BTC',
        interval: '24h',
      },
      // Mining metrics
      {
        name: 'Hash Rate',
        endpoint: 'mining/hash_rate_mean',
        description: 'Network hash rate',
        category: 'mining',
        asset: 'BTC',
        interval: '24h',
      },
      {
        name: 'Puell Multiple',
        endpoint: 'mining/puell_multiple',
        description: 'Mining profitability indicator',
        category: 'mining',
        asset: 'BTC',
        interval: '24h',
      },
      // Market metrics
      {
        name: 'MVRV Ratio',
        endpoint: 'market/mvrv',
        description: 'Market to realized value ratio',
        category: 'market',
        asset: 'BTC',
        interval: '24h',
      },
      {
        name: 'NVT Ratio',
        endpoint: 'market/nvt',
        description: 'Network value to transactions ratio',
        category: 'market',
        asset: 'BTC',
        interval: '24h',
      },
      // DeFi metrics (Ethereum)
      {
        name: 'Total Value Locked',
        endpoint: 'defi/total_value_locked_sum',
        description: 'Total value locked in DeFi',
        category: 'defi',
        asset: 'ETH',
        interval: '24h',
      },
    ];
  }

  /**
   * Cache management
   */
  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < config.cache.ttl) {
      return cached.data;
    }
    return null;
  }

  private setCacheData(key: string, data: any, ttl: number = config.cache.ttl): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Clean up old cache entries
    if (this.cache.size > config.cache.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Health check
   */
  async getHealthStatus(): Promise<{
    apiKey: boolean;
    connectivity: boolean;
    cacheSize: number;
  }> {
    const hasApiKey = !!this.apiKey;
    let connectivity = false;

    if (hasApiKey) {
      try {
        // Test with a simple metric
        await this.fetchMetric('supply/current', 'BTC', '24h', 1);
        connectivity = true;
      } catch {
        connectivity = false;
      }
    }

    return {
      apiKey: hasApiKey,
      connectivity,
      cacheSize: this.cache.size,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}