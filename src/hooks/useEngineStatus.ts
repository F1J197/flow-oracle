import { useState, useCallback } from 'react';
import { EngineReport } from '@/types/engines';

export interface EngineStatus {
  id: string;
  name: string;
  status: 'idle' | 'loading' | 'success' | 'error' | 'timeout';
  lastReport?: EngineReport;
  lastError?: string;
  loadingStartTime?: number;
  retryCount: number;
}

interface EngineStatusMap {
  [engineId: string]: EngineStatus;
}

export const useEngineStatus = () => {
  const [engineStatuses, setEngineStatuses] = useState<EngineStatusMap>({
    'data-integrity': {
      id: 'data-integrity',
      name: 'Data Integrity Engine',
      status: 'idle',
      retryCount: 0
    },
    'net-liquidity': {
      id: 'net-liquidity',
      name: 'Net Liquidity Engine',
      status: 'idle',
      retryCount: 0
    },
    'credit-stress': {
      id: 'credit-stress',
      name: 'Credit Stress Engine',
      status: 'idle',
      retryCount: 0
    },
    'enhanced-momentum': {
      id: 'enhanced-momentum',
      name: 'Enhanced Momentum Engine',
      status: 'idle',
      retryCount: 0
    },
    'enhanced-zscore': {
      id: 'enhanced-zscore',
      name: 'Enhanced Z-Score Engine',
      status: 'idle',
      retryCount: 0
    }
  });

  const updateEngineStatus = useCallback((
    engineId: string,
    status: EngineStatus['status'],
    data?: Partial<Pick<EngineStatus, 'lastReport' | 'lastError' | 'loadingStartTime'>>
  ) => {
    setEngineStatuses(prev => ({
      ...prev,
      [engineId]: {
        ...prev[engineId],
        status,
        ...data,
        ...(status === 'loading' ? { loadingStartTime: Date.now() } : {}),
        ...(status === 'success' ? { lastError: undefined, retryCount: 0 } : {}),
        ...(status === 'error' ? { retryCount: prev[engineId].retryCount + 1 } : {})
      }
    }));
  }, []);

  const setEngineLoading = useCallback((engineId: string) => {
    updateEngineStatus(engineId, 'loading', { loadingStartTime: Date.now() });
  }, [updateEngineStatus]);

  const setEngineSuccess = useCallback((engineId: string, report: EngineReport) => {
    updateEngineStatus(engineId, 'success', { lastReport: report });
  }, [updateEngineStatus]);

  const setEngineError = useCallback((engineId: string, error: string) => {
    updateEngineStatus(engineId, 'error', { lastError: error });
  }, [updateEngineStatus]);

  const setEngineTimeout = useCallback((engineId: string) => {
    updateEngineStatus(engineId, 'timeout', { lastError: 'Engine execution timeout' });
  }, [updateEngineStatus]);

  const getEngineStatus = useCallback((engineId: string): EngineStatus | undefined => {
    return engineStatuses[engineId];
  }, [engineStatuses]);

  const getOverallStatus = useCallback(() => {
    const statuses = Object.values(engineStatuses);
    const loading = statuses.some(s => s.status === 'loading');
    const errors = statuses.filter(s => s.status === 'error' || s.status === 'timeout').length;
    const success = statuses.filter(s => s.status === 'success').length;
    
    return {
      loading,
      hasErrors: errors > 0,
      successCount: success,
      errorCount: errors,
      totalCount: statuses.length,
      allSuccess: success === statuses.length,
      partialSuccess: success > 0 && success < statuses.length
    };
  }, [engineStatuses]);

  const resetAllStatuses = useCallback(() => {
    setEngineStatuses(prev => {
      const reset: EngineStatusMap = {};
      Object.keys(prev).forEach(key => {
        reset[key] = {
          ...prev[key],
          status: 'idle',
          lastError: undefined,
          loadingStartTime: undefined,
          retryCount: 0
        };
      });
      return reset;
    });
  }, []);

  return {
    engineStatuses,
    setEngineLoading,
    setEngineSuccess,
    setEngineError,
    setEngineTimeout,
    getEngineStatus,
    getOverallStatus,
    resetAllStatuses
  };
};