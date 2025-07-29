import { useState, useEffect, useCallback, useRef } from 'react';
import { ZScoreCalculator } from '@/services/ZScoreCalculator';
import { UnifiedDataService } from '@/services/UnifiedDataService';
import { 
  ZScoreData, 
  MarketRegime, 
  ZScoreTileData, 
  ZScoreIntelligenceData,
  InstitutionalInsight 
} from '@/types/zscoreTypes';

interface UseZScoreDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  includeDistribution?: boolean;
  enableCache?: boolean;
}

interface UseZScoreDataReturn {
  data: ZScoreData | null;
  tileData: ZScoreTileData | null;
  intelligenceData: ZScoreIntelligenceData | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refresh: () => Promise<void>;
  confidence: number;
  cacheHit: boolean;
}

export const useZScoreData = (options: UseZScoreDataOptions = {}): UseZScoreDataReturn => {
  const {
    autoRefresh = true,
    refreshInterval = 15000,
    includeDistribution = true,
    enableCache = true
  } = options;

  const [data, setData] = useState<ZScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [cacheHit, setCacheHit] = useState(false);

  const calculator = ZScoreCalculator.getInstance();
  const dataService = UnifiedDataService.getInstance();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const generateMockData = useCallback((): number[] => {
    // Generate realistic market data with trends and volatility
    const baseValue = 100;
    const trend = 0.0002; // Slight upward trend
    const volatility = 0.015;
    const data: number[] = [];
    
    for (let i = 0; i < 730; i++) { // 2 years of data
      const trendComponent = baseValue + (i * trend);
      const randomComponent = (Math.random() - 0.5) * volatility * baseValue;
      const cyclicalComponent = Math.sin(i / 50) * 5; // Cyclical pattern
      
      data.push(trendComponent + randomComponent + cyclicalComponent);
    }
    
    return data;
  }, []);

  const detectMarketRegime = useCallback((): MarketRegime => {
    // Simple regime detection based on current market conditions
    const now = new Date();
    const quarter = Math.floor((now.getMonth()) / 3);
    
    // Mock regime detection - in production this would use real indicators
    const regimes: MarketRegime[] = ['WINTER', 'SPRING', 'SUMMER', 'AUTUMN'];
    return regimes[quarter];
  }, []);

  const generateInstitutionalInsights = useCallback((composite: any): InstitutionalInsight[] => {
    const insights: InstitutionalInsight[] = [];
    
    if (Math.abs(composite.value) > 3) {
      insights.push({
        type: 'positioning',
        title: 'Extreme Z-Score Alert',
        description: `Current composite Z-Score of ${composite.value.toFixed(2)} indicates significant deviation from historical norms.`,
        confidence: 0.92,
        timeframe: 'immediate',
        actionable: true
      });
    }

    if (composite.confidence > 0.8) {
      insights.push({
        type: 'technical',
        title: 'High Confidence Signal',
        description: `Strong statistical confidence (${(composite.confidence * 100).toFixed(1)}%) in current regime assessment.`,
        confidence: composite.confidence,
        timeframe: 'short_term',
        actionable: true
      });
    }

    if (composite.regime === 'SPRING' || composite.regime === 'SUMMER') {
      insights.push({
        type: 'sentiment',
        title: 'Favorable Market Regime',
        description: `Current ${composite.regime} regime suggests constructive market environment.`,
        confidence: 0.75,
        timeframe: 'medium_term',
        actionable: false
      });
    }

    return insights;
  }, []);

  const calculateZScoreData = useCallback(async (): Promise<ZScoreData> => {
    const cacheKey = 'zscore_data_v6';
    
    if (enableCache) {
      const cached = calculator.getCached<ZScoreData>(cacheKey);
      if (cached) {
        setCacheHit(true);
        return cached;
      }
    }
    
    setCacheHit(false);
    
    // Generate mock historical data
    const historicalData = generateMockData();
    const currentValue = historicalData[historicalData.length - 1];
    const regime = detectMarketRegime();
    
    // Validate inputs
    calculator.validateInputs(historicalData, currentValue);
    
    // Calculate multi-timeframe Z-scores
    const multiTimeframe = calculator.calculateMultiTimeframeZScores(historicalData, currentValue);
    
    // Calculate composite Z-score
    const composite = calculator.calculateCompositeZScore(multiTimeframe, regime);
    
    // Analyze distribution if requested
    let distribution;
    if (includeDistribution) {
      distribution = calculator.analyzeDistribution(historicalData, currentValue);
    } else {
      distribution = {
        histogram: [],
        skewness: 0,
        kurtosis: 0,
        extremeValues: [],
        outlierCount: 0
      };
    }
    
    // Assess data quality
    const dataQuality = calculator.assessDataQuality(historicalData, 5);
    
    const result: ZScoreData = {
      composite,
      distribution,
      multiTimeframe,
      dataQuality,
      lastUpdate: new Date(),
      cacheHit: false
    };
    
    if (enableCache) {
      calculator.setCached(cacheKey, result, refreshInterval);
    }
    
    return result;
  }, [enableCache, includeDistribution, refreshInterval, generateMockData, detectMarketRegime, calculator]);

  const transformToTileData = useCallback((zscoreData: ZScoreData): ZScoreTileData => {
    const { composite, distribution } = zscoreData;
    
    // Determine status based on composite value
    let status: ZScoreTileData['primaryMetric']['status'];
    if (composite.value > 6) status = 'extreme_positive';
    else if (composite.value > 2) status = 'positive';
    else if (composite.value > -2) status = 'neutral';
    else if (composite.value > -3) status = 'negative';
    else status = 'extreme_negative';
    
    // Format primary metric
    const formatted = composite.value >= 0 ? 
      `+${composite.value.toFixed(2)}σ` : 
      `${composite.value.toFixed(2)}σ`;
    
    // Get regime emoji
    const regimeEmojis = {
      WINTER: '❄️',
      SPRING: '🌱',
      SUMMER: '☀️',
      AUTUMN: '🍂'
    };
    
    return {
      title: 'Enhanced Z-Score Engine',
      primaryMetric: {
        value: composite.value,
        formatted,
        status
      },
      histogram: {
        bins: distribution.histogram,
        currentValue: composite.value,
        extremeThreshold: 2.5
      },
      regime: {
        current: composite.regime,
        confidence: composite.confidence,
        emoji: regimeEmojis[composite.regime]
      },
      confidence: composite.confidence,
      lastUpdate: zscoreData.lastUpdate
    };
  }, []);

  const transformToIntelligenceData = useCallback((zscoreData: ZScoreData): ZScoreIntelligenceData => {
    const { composite, distribution, multiTimeframe, dataQuality } = zscoreData;
    
    const institutionalInsights = generateInstitutionalInsights(composite);
    const topExtremes = distribution.extremeValues.slice(0, 5);
    
    return {
      composite,
      institutionalInsights,
      dataQuality,
      multiTimeframe,
      distribution,
      topExtremes
    };
  }, [generateInstitutionalInsights]);

  const refresh = useCallback(async (): Promise<void> => {
    if (!mountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const zscoreData = await calculateZScoreData();
      
      if (!mountedRef.current) return;
      
      setData(zscoreData);
      setConfidence(zscoreData.composite.confidence);
      setLastUpdate(zscoreData.lastUpdate);
      setCacheHit(zscoreData.cacheHit);
      
    } catch (err) {
      if (!mountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate Z-Score data';
      setError(errorMessage);
      console.error('Z-Score calculation error:', err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [calculateZScoreData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;
    
    const setupRefresh = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          refresh();
        }
      }, refreshInterval);
    };
    
    setupRefresh();
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, refresh]);

  // Initial load
  useEffect(() => {
    refresh();
    
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Derived data
  const tileData = data ? transformToTileData(data) : null;
  const intelligenceData = data ? transformToIntelligenceData(data) : null;

  return {
    data,
    tileData,
    intelligenceData,
    loading,
    error,
    lastUpdate,
    refresh,
    confidence,
    cacheHit
  };
};