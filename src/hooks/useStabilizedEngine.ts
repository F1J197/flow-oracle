import { useState, useEffect, useRef, useCallback } from 'react';
import { DetailedEngineView } from '@/types/engines';

interface StabilizedEngineOptions {
  refreshInterval?: number;
  maxRetries?: number;
  cacheTimeout?: number;
  debounceMs?: number;
}

interface EngineCache {
  [key: string]: {
    data: DetailedEngineView;
    timestamp: number;
    lastSuccess: number;
  };
}

export const useStabilizedEngine = (
  engines: Array<{ key: string; name: string; engine: any }>,
  options: StabilizedEngineOptions = {}
) => {
  const {
    refreshInterval = 30000,
    maxRetries = 3,
    cacheTimeout = 120000, // 2 minutes
    debounceMs = 1000
  } = options;

  const [engineViews, setEngineViews] = useState<Record<string, DetailedEngineView>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});

  const cache = useRef<EngineCache>({});
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isExecuting = useRef(false);

  // Debounced execution to prevent rapid fire updates
  const debouncedExecute = useCallback((immediate = false) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const execute = async () => {
      if (isExecuting.current) return;
      isExecuting.current = true;

      try {
        await loadEngineData();
      } finally {
        isExecuting.current = false;
      }
    };

    if (immediate) {
      execute();
    } else {
      debounceTimer.current = setTimeout(execute, debounceMs);
    }
  }, []);

  const getCachedData = useCallback((key: string): DetailedEngineView | null => {
    const cached = cache.current[key];
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cacheTimeout) {
      delete cache.current[key];
      return null;
    }

    return cached.data;
  }, [cacheTimeout]);

  const setCachedData = useCallback((key: string, data: DetailedEngineView) => {
    cache.current[key] = {
      data,
      timestamp: Date.now(),
      lastSuccess: Date.now()
    };
  }, []);

  const createFallbackView = useCallback((engine: any, errorMessage?: string): DetailedEngineView => ({
    title: engine.name || 'Engine',
    primarySection: {
      title: 'Status',
      metrics: { 'Status': 'Offline' }
    },
    sections: [
      {
        title: 'System Status',
        metrics: {
          'Connection': 'Reconnecting...',
          'Last Update': 'Unavailable',
          'Retry Count': retryCount[engine.id] || 0
        }
      }
    ],
    alerts: errorMessage 
      ? [{ severity: 'warning', message: errorMessage }]
      : [{ severity: 'info', message: 'Attempting to restore connection...' }]
  }), [retryCount]);

  const loadEngineData = useCallback(async () => {
    if (engines.length === 0) return;

    setError(null);
    
    try {
      const engineData: Record<string, DetailedEngineView> = {};
      const newRetryCount = { ...retryCount };

      // Process engines with staggered execution to avoid overwhelming the system
      for (let i = 0; i < engines.length; i++) {
        const { key, engine } = engines[i];
        
        try {
          // Try to use cached data first
          const cachedData = getCachedData(key);
          if (cachedData) {
            engineData[key] = cachedData;
            continue;
          }

          // Add small delay between executions to prevent race conditions
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }

          const report = await engine.execute();
          
          // Validate that execution was successful before getting view
          if (!report || !report.success) {
            throw new Error(`Engine ${key} execution failed: ${report?.errors?.join(', ') || 'Unknown error'}`);
          }
          
          const viewData = engine.getDetailedView();
          
          engineData[key] = viewData;
          setCachedData(key, viewData);
          newRetryCount[key] = 0; // Reset retry count on success
          
        } catch (engineError) {
          console.error(`Engine ${key} failed:`, engineError);
          
          // Increment retry count
          newRetryCount[key] = (newRetryCount[key] || 0) + 1;
          
          // Use cached data if available, otherwise create fallback
          const cachedData = getCachedData(key);
          if (cachedData) {
            engineData[key] = cachedData;
          } else {
            engineData[key] = createFallbackView(engine, 
              newRetryCount[key] >= maxRetries 
                ? 'Engine temporarily offline'
                : 'Retrying connection...'
            );
          }
        }
      }
      
      setRetryCount(newRetryCount);
      setEngineViews(engineData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'System error occurred';
      setError(errorMessage);
      console.error('Engine loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [engines, retryCount, maxRetries, getCachedData, setCachedData, createFallbackView]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    debouncedExecute(true);
  }, [engines, debouncedExecute]);

  // Set up stabilized refresh interval
  useEffect(() => {
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
    }

    refreshTimer.current = setInterval(() => {
      debouncedExecute(false);
    }, refreshInterval);

    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [refreshInterval, debouncedExecute]);

  const forceRefresh = useCallback(() => {
    // Clear cache and force immediate refresh
    cache.current = {};
    setRetryCount({});
    setLoading(true);
    debouncedExecute(true);
  }, [debouncedExecute]);

  const getEngineStatus = useCallback((key: string) => {
    const cached = cache.current[key];
    const retries = retryCount[key] || 0;
    
    return {
      isOnline: !!cached && retries === 0,
      lastSuccess: cached?.lastSuccess,
      retryCount: retries,
      hasCache: !!cached
    };
  }, [retryCount]);

  return {
    engineViews,
    loading,
    error,
    retryCount,
    forceRefresh,
    getEngineStatus
  };
};