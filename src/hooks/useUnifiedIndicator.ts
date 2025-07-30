import { useState, useEffect, useCallback } from 'react';
import { IndicatorState, IndicatorSubscription, HistoricalDataRequest, DataPoint } from '@/types/indicators';
import UniversalDataService from '@/services/UniversalDataService';

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

  const dataService = UniversalDataService.getInstance();

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
      await dataService.refreshIndicator(indicatorId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh indicator';
      setError(errorMessage);
      console.error(`Error refreshing indicator ${indicatorId}:`, err);
    } finally {
      setLoading(false);
    }
  }, [indicatorId, dataService]);

  // Get historical data
  const getHistoricalData = useCallback(async (request: Partial<HistoricalDataRequest>): Promise<DataPoint[]> => {
    try {
      const fullRequest: HistoricalDataRequest = {
        indicatorId,
        timeFrame: '1d',
        ...request
      };
      
      return await dataService.getHistoricalData(fullRequest);
    } catch (err) {
      console.error(`Error fetching historical data for ${indicatorId}:`, err);
      return [];
    }
  }, [indicatorId, dataService]);

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

  // Set up subscription and auto-refresh
  useEffect(() => {
    if (!indicatorId) {
      setState(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const subscription: IndicatorSubscription = {
      indicatorId,
      callback: handleStateUpdate,
      options: {
        includeHistorical,
        historicalPeriod,
        realtime: autoRefresh
      }
    };

    // Subscribe to real-time updates
    const unsubscribe = dataService.subscribe(subscription);

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
      unsubscribe();
      if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
      }
    };
  }, [indicatorId, handleStateUpdate, loadHistoricalData, autoRefresh, refreshInterval, includeHistorical, dataService, refresh]);

  return {
    state,
    historicalData,
    loading,
    error,
    refresh,
    getHistoricalData
  };
};