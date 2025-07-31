import { useState, useEffect, useCallback } from 'react';
import { IndicatorState, IndicatorSubscription, HistoricalDataRequest, DataPoint } from '@/types/indicators';
import UniversalDataServiceV3 from '@/services/UniversalDataServiceV3';
import { IndicatorRegistry } from '@/services/IndicatorRegistry';

interface UseUnifiedIndicatorOptions {
  includeHistorical?: boolean;
  historicalPeriod?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseUnifiedIndicatorReturn {
  state: IndicatorState | null;
  historicalData: DataPoint[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getHistoricalData: (request: Partial<HistoricalDataRequest>) => Promise<DataPoint[]>;
}

/**
 * Unified hook for accessing any indicator data with caching and real-time updates
 */
export const useUnifiedIndicator = (
  indicatorId: string,
  options: UseUnifiedIndicatorOptions = {}
): UseUnifiedIndicatorReturn => {
  const [state, setState] = useState<IndicatorState | null>(null);
  const [historicalData, setHistoricalData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dataService = UniversalDataServiceV3.getInstance();
  const indicatorRegistry = IndicatorRegistry.getInstance();

  const {
    includeHistorical = false,
    historicalPeriod = '30d',
    autoRefresh = true,
    refreshInterval = 30000
  } = options;

  // Handle state updates from subscription
  const handleStateUpdate = useCallback((newState: IndicatorState) => {
    setState(newState);
    setLoading(false);
    
    if (newState.status === 'error') {
      setError(newState.lastError || 'Unknown error');
    } else {
      setError(null);
    }
  }, []);

  // Manual refresh function  
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get indicator metadata to determine category
      const metadata = indicatorRegistry.get(indicatorId);
      const category = metadata?.category;
      
      const freshData = await dataService.fetchIndicator(indicatorId, category);
      
      if (freshData) {
        // Transform to IndicatorState format
        const newState: IndicatorState = {
          metadata: metadata || {
            id: indicatorId,
            symbol: indicatorId,
            name: indicatorId,
            source: 'MARKET',
            category: 'macro',
            priority: 999,
            updateFrequency: '1d'
          },
          value: {
            current: freshData.current,
            previous: freshData.previous,
            change: freshData.change,
            changePercent: freshData.changePercent,
            timestamp: freshData.timestamp,
            confidence: freshData.confidence
          },
          status: 'active',
          lastUpdate: freshData.timestamp,
          isSubscribed: false,
          retryCount: 0
        };
        
        setState(newState);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh indicator';
      setError(errorMessage);
      console.error(`Error refreshing indicator ${indicatorId}:`, err);
    } finally {
      setLoading(false);
    }
  }, [indicatorId, dataService, indicatorRegistry]);

  // Get historical data (simplified for now)
  const getHistoricalData = useCallback(async (request: Partial<HistoricalDataRequest>): Promise<DataPoint[]> => {
    try {
      // For now, return empty array - we'll implement historical data fetching later
      console.log(`Historical data request for ${indicatorId}:`, request);
      return [];
    } catch (err) {
      console.error(`Error fetching historical data for ${indicatorId}:`, err);
      return [];
    }
  }, [indicatorId]);

  // Load initial historical data if requested
  const loadHistoricalData = useCallback(async () => {
    if (!includeHistorical) return;

    try {
      const endDate = new Date();
      const startDate = new Date();
      
      // Parse historical period
      if (historicalPeriod.endsWith('d')) {
        const days = parseInt(historicalPeriod.slice(0, -1));
        startDate.setDate(endDate.getDate() - days);
      } else if (historicalPeriod.endsWith('m')) {
        const months = parseInt(historicalPeriod.slice(0, -1));
        startDate.setMonth(endDate.getMonth() - months);
      } else if (historicalPeriod.endsWith('y')) {
        const years = parseInt(historicalPeriod.slice(0, -1));
        startDate.setFullYear(endDate.getFullYear() - years);
      }

      const data = await getHistoricalData({
        startDate,
        endDate,
        timeFrame: '1d'
      });
      
      setHistoricalData(data);
    } catch (err) {
      console.error(`Error loading historical data for ${indicatorId}:`, err);
    }
  }, [indicatorId, includeHistorical, historicalPeriod, getHistoricalData]);

  // Set up initial fetch and auto-refresh
  useEffect(() => {
    if (!indicatorId) {
      setState(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Initial fetch
    refresh();

    // Load historical data if requested
    loadHistoricalData();

    // Set up auto-refresh interval if enabled
    let refreshIntervalId: NodeJS.Timeout | null = null;
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalId = setInterval(() => {
        refresh();
      }, refreshInterval);
    }

    return () => {
      if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
      }
    };
  }, [indicatorId, refresh, loadHistoricalData, autoRefresh, refreshInterval]);

  return {
    state,
    historicalData,
    loading,
    error,
    refresh,
    getHistoricalData
  };
};