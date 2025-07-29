import { useState, useEffect, useRef, useCallback } from 'react';
import { DetailedEngineView } from '@/types/engines';
import { ResilientBaseEngine } from '@/engines/ResilientBaseEngine';

interface ResilientEngineOptions {
  refreshInterval?: number;
  maxRetries?: number;
  fallbackEnabled?: boolean;
  staleDataThreshold?: number;
}

interface EngineStatus {
  isHealthy: boolean;
  isOnline: boolean;
  lastUpdate: Date | null;
  age: number;
  retryCount: number;
  usingFallback: boolean;
}

/**
 * Resilient Engine Hook - V6 Implementation
 * Provides robust engine management with graceful degradation
 */
export const useResilientEngine = (
  engines: Array<{ key: string; name: string; engine: any }>,
  options: ResilientEngineOptions = {}
) => {
  const {
    refreshInterval = 45000,   // More conservative
    maxRetries = 2,           // Fewer retries
    fallbackEnabled = true,
    staleDataThreshold = 300000 // 5 minutes
  } = options;

  const [engineViews, setEngineViews] = useState<Record<string, DetailedEngineView>>({});
  const [engineStatuses, setEngineStatuses] = useState<Record<string, EngineStatus>>({});
  const [globalLoading, setGlobalLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const isUpdating = useRef(false);

  const createFallbackView = useCallback((engineKey: string, engineName: string, error?: string): DetailedEngineView => ({
    title: `${engineName} (Fallback Mode)`,
    primarySection: {
      title: 'Status',
      metrics: {
        'Mode': 'Degraded Service',
        'Status': 'Using Cached Data',
        'Reliability': 'Reduced'
      }
    },
    sections: [
      {
        title: 'System Information',
        metrics: {
          'Connection': 'Attempting Reconnection',
          'Data Source': 'Local Cache',
          'Update Frequency': 'Limited',
          'Error': error || 'Service Temporarily Unavailable'
        }
      }
    ],
    alerts: [
      {
        severity: 'warning',
        message: 'Engine running in degraded mode - using cached data'
      }
    ]
  }), []);

  const updateEngineData = useCallback(async () => {
    if (isUpdating.current || engines.length === 0) return;
    
    isUpdating.current = true;
    setGlobalError(null);

    try {
      const newViews: Record<string, DetailedEngineView> = {};
      const newStatuses: Record<string, EngineStatus> = {};

      // Process engines sequentially to prevent overwhelming the system
      for (const { key, name, engine } of engines) {
        try {
          const startTime = Date.now();
          const report = await engine.execute();
          const endTime = Date.now();

          if (report.success || report.data?.degraded) {
            const view = engine.getDetailedView();
            newViews[key] = view;
            
            newStatuses[key] = {
              isHealthy: engine.isHealthy ? engine.isHealthy() : true,
              isOnline: true,
              lastUpdate: new Date(),
              age: engine.getAge ? engine.getAge() : 0,
              retryCount: engine.getState ? engine.getState().retryCount : 0,
              usingFallback: !!report.data?.degraded
            };
          } else {
            throw new Error(report.errors?.join(', ') || 'Engine execution failed');
          }

          // Small delay to prevent system overload
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.warn(`Engine ${key} failed:`, error);
          
          const existingStatus = engineStatuses[key];
          const retryCount = (existingStatus?.retryCount || 0) + 1;

          if (fallbackEnabled && retryCount <= maxRetries) {
            // Use fallback view
            newViews[key] = createFallbackView(key, name, 
              error instanceof Error ? error.message : 'Unknown error'
            );
            
            newStatuses[key] = {
              isHealthy: false,
              isOnline: false,
              lastUpdate: existingStatus?.lastUpdate || null,
              age: existingStatus?.age || Infinity,
              retryCount,
              usingFallback: true
            };
          } else {
            // Engine completely offline
            newStatuses[key] = {
              isHealthy: false,
              isOnline: false,
              lastUpdate: null,
              age: Infinity,
              retryCount,
              usingFallback: false
            };
          }
        }
      }

      setEngineViews(prev => ({ ...prev, ...newViews }));
      setEngineStatuses(prev => ({ ...prev, ...newStatuses }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'System error';
      setGlobalError(errorMessage);
      console.error('Global engine update failed:', error);
    } finally {
      setGlobalLoading(false);
      isUpdating.current = false;
    }
  }, [engines, engineStatuses, fallbackEnabled, maxRetries, createFallbackView]);

  // Initial load
  useEffect(() => {
    setGlobalLoading(true);
    updateEngineData();
  }, [engines]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
    }

    refreshTimer.current = setInterval(() => {
      updateEngineData();
    }, refreshInterval);

    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [refreshInterval, updateEngineData]);

  const forceRefresh = useCallback(() => {
    setGlobalLoading(true);
    updateEngineData();
  }, [updateEngineData]);

  const getSystemHealth = useCallback(() => {
    const statuses = Object.values(engineStatuses);
    if (statuses.length === 0) return 'unknown';

    const healthyCount = statuses.filter(s => s.isHealthy).length;
    const onlineCount = statuses.filter(s => s.isOnline).length;
    
    if (healthyCount === statuses.length) return 'healthy';
    if (onlineCount >= statuses.length * 0.75) return 'degraded';
    if (onlineCount > 0) return 'critical';
    return 'offline';
  }, [engineStatuses]);

  return {
    engineViews,
    engineStatuses,
    loading: globalLoading,
    error: globalError,
    systemHealth: getSystemHealth(),
    forceRefresh,
    isUpdating: isUpdating.current
  };
};