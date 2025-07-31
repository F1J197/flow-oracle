/**
 * Enhanced Unified Indicator Hook - Fixed Implementation
 * Provides reliable data fetching with proper error handling and fallbacks
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fredServiceWrapper } from '@/services/DataIngestion/FREDServiceWrapper';
import { binanceService } from '@/services/DataIngestion/BinanceService';
import { coinGeckoService } from '@/services/providers/CoinGeckoService';
import { CalculationEngineV2 } from '@/services/CalculationEngineV2';
import { 
  getIndicatorById, 
  getCalculatedIndicators,
  type UnifiedIndicatorConfig 
} from '@/config/unifiedIndicators.config';
import { 
  getProviderMapping,
  getProviderFallbackChain,
  getRequiredProvider,
  ENHANCED_PROVIDER_REGISTRY
} from '@/config/providerSymbolMappings.enhanced';

export interface IndicatorData {
  symbol: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  confidence: number;
  source: string;
  provider: string;
  metadata?: Record<string, any>;
}

export interface UseUnifiedIndicatorFixedOptions {
  enableHistorical?: boolean;
  historicalPeriod?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseUnifiedIndicatorFixedReturn {
  data: IndicatorData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  confidence: number;
  source: string;
  refresh: () => Promise<void>;
  clearCache: () => void;
}

export function useUnifiedIndicatorFixed(
  indicatorId: string,
  options: UseUnifiedIndicatorFixedOptions = {}
): UseUnifiedIndicatorFixedReturn {
  const {
    autoRefresh = false,
    refreshInterval = 60000
  } = options;

  const [data, setData] = useState<IndicatorData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const calculationEngine = useRef(CalculationEngineV2.getInstance());
  const cache = useRef(new Map<string, { data: IndicatorData; expiry: number }>());
  const CACHE_TTL = 300000; // 5 minutes

  // Get cached data
  const getCachedData = useCallback((id: string): IndicatorData | null => {
    const cached = cache.current.get(id);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    return null;
  }, []);

  // Set cached data
  const setCachedData = useCallback((id: string, indicatorData: IndicatorData) => {
    cache.current.set(id, {
      data: indicatorData,
      expiry: Date.now() + CACHE_TTL
    });
  }, []);

  // Fetch from FRED
  const fetchFromFred = useCallback(async (symbol: string): Promise<IndicatorData | null> => {
    try {
      const result = await fredServiceWrapper.fetchLatestObservation(symbol);
      if (!result || !result.value) return null;

      return {
        symbol,
        current: parseFloat(result.value),
        previous: result.previousValue ? parseFloat(result.previousValue) : parseFloat(result.value),
        change: result.change || 0,
        changePercent: result.changePercent || 0,
        timestamp: new Date(result.date),
        confidence: 0.95,
        source: 'FRED',
        provider: 'fred',
        metadata: { originalData: result }
      };
    } catch (error) {
      console.error(`FRED fetch error for ${symbol}:`, error);
      return null;
    }
  }, []);

  // Fetch from Binance (for crypto)
  const fetchFromBinance = useCallback(async (symbol: string): Promise<IndicatorData | null> => {
    try {
      const result = await binanceService.fetchPrice(symbol);
      if (!result || !result.price) return null;

      return {
        symbol,
        current: parseFloat(result.price),
        previous: result.prevPrice ? parseFloat(result.prevPrice) : parseFloat(result.price),
        change: result.change ? parseFloat(result.change) : 0,
        changePercent: result.changePercent ? parseFloat(result.changePercent) : 0,
        timestamp: new Date(),
        confidence: 0.9,
        source: 'BINANCE',
        provider: 'binance',
        metadata: { originalData: result }
      };
    } catch (error) {
      console.error(`Binance fetch error for ${symbol}:`, error);
      return null;
    }
  }, []);

  // Fetch from CoinGecko
  const fetchFromCoinGecko = useCallback(async (symbol: string): Promise<IndicatorData | null> => {
    try {
      const result = await coinGeckoService.fetchCryptoPrice(symbol);
      return result;
    } catch (error) {
      console.error(`CoinGecko fetch error for ${symbol}:`, error);
      return null;
    }
  }, []);

  // Fetch calculated indicator
  const fetchCalculatedIndicator = useCallback(async (
    config: UnifiedIndicatorConfig
  ): Promise<IndicatorData | null> => {
    if (!config.dependencies || config.dependencies.length === 0) {
      throw new Error(`Calculated indicator ${config.id} has no dependencies`);
    }

    // Fetch all dependencies
    const dependencyData = new Map<string, IndicatorData>();
    const missingDependencies: string[] = [];

    for (const depId of config.dependencies) {
      const depData = await fetchIndicatorData(depId);
      if (depData) {
        dependencyData.set(depId, depData);
      } else {
        missingDependencies.push(depId);
      }
    }

    if (missingDependencies.length > 0) {
      throw new Error(`Missing dependencies for ${config.id}: ${missingDependencies.join(', ')}`);
    }

    // Calculate the indicator
    const context = {
      data: dependencyData,
      timestamp: new Date(),
      metadata: { indicatorId: config.id, config }
    };

    const result = await calculationEngine.current.calculateIndicator(config.id, context);
    return result;
  }, []);

  // Main fetch function
  const fetchIndicatorData = useCallback(async (id: string): Promise<IndicatorData | null> => {
    // Check cache first
    const cached = getCachedData(id);
    if (cached) return cached;

    // Get indicator configuration
    const config = getIndicatorById(id);
    if (!config) {
      throw new Error(`No configuration found for indicator: ${id}`);
    }

    // Handle calculated indicators
    if (config.source === 'ENGINE') {
      const result = await fetchCalculatedIndicator(config);
      if (result) setCachedData(id, result);
      return result;
    }

    // Handle data provider indicators
    const requiredProvider = getRequiredProvider(id);
    if (requiredProvider) {
      // Use required provider
      const mapping = getProviderMapping(id, requiredProvider as keyof typeof ENHANCED_PROVIDER_REGISTRY);
      if (mapping) {
        let result: IndicatorData | null = null;
        
        switch (requiredProvider) {
          case 'fred':
            result = await fetchFromFred(mapping.providerSymbol);
            break;
          case 'coinbase':
          case 'binance':
            result = await fetchFromBinance(mapping.providerSymbol);
            break;
          case 'coingecko':
            result = await fetchFromCoinGecko(mapping.providerSymbol);
            break;
        }
        
        if (result) {
          setCachedData(id, result);
          return result;
        }
      }
    }

    // Try fallback chain
    const fallbackChain = getProviderFallbackChain(config.category);
    for (const provider of fallbackChain) {
      const mapping = getProviderMapping(id, provider as keyof typeof ENHANCED_PROVIDER_REGISTRY);
      if (!mapping) continue;

      try {
        let result: IndicatorData | null = null;
        
        switch (provider) {
          case 'fred':
            result = await fetchFromFred(mapping.providerSymbol);
            break;
          case 'coinbase':
          case 'binance':
            result = await fetchFromBinance(mapping.providerSymbol);
            break;
          case 'coingecko':
            result = await fetchFromCoinGecko(mapping.providerSymbol);
            break;
        }
        
        if (result) {
          setCachedData(id, result);
          return result;
        }
      } catch (error) {
        console.warn(`Provider ${provider} failed for ${id}:`, error);
        continue;
      }
    }

    throw new Error(`All providers failed for indicator: ${id}`);
  }, [getCachedData, setCachedData, fetchCalculatedIndicator, fetchFromFred, fetchFromBinance, fetchFromCoinGecko]);

  // Refresh function
  const refresh = useCallback(async () => {
    if (!indicatorId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchIndicatorData(indicatorId);
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error(`Error fetching indicator ${indicatorId}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [indicatorId, fetchIndicatorData]);

  // Clear cache function
  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  // Initial fetch
  useEffect(() => {
    if (indicatorId) {
      refresh();
    }
  }, [indicatorId, refresh]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !indicatorId) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh, indicatorId]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    confidence: data?.confidence || 0,
    source: data?.source || '',
    refresh,
    clearCache
  };
}