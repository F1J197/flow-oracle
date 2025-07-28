import { useState, useEffect, useCallback } from 'react';
import { DealerPositionData, DealerAlert, DealerInsight } from '@/types/dealerPositions';
import { PrimaryDealerTileData } from '@/types/primaryDealerTile';
import { PrimaryDealerPositionsEngineV6 } from '@/engines/PrimaryDealerPositionsEngineV6';

interface UseDealerPositionsReturn {
  data: DealerPositionData | null;
  tileData: PrimaryDealerTileData | null;
  alerts: DealerAlert[];
  insights: DealerInsight[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  healthStatus: {
    healthy: boolean;
    errorCount: number;
    lastUpdate: Date;
    dataAge: number;
  };
  
  // Actions
  refresh: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => void;
  clearError: () => void;
}

export const useDealerPositions = (
  refreshInterval: number = 30000, // 30 seconds
  autoRefresh: boolean = true
): UseDealerPositionsReturn => {
  const [engine] = useState(() => new PrimaryDealerPositionsEngineV6());
  const [data, setData] = useState<DealerPositionData | null>(null);
  const [tileData, setTileData] = useState<PrimaryDealerTileData | null>(null);
  const [alerts, setAlerts] = useState<DealerAlert[]>([]);
  const [insights, setInsights] = useState<DealerInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const report = await engine.execute();
      
      if (report.success && report.data) {
        setData(engine.getCurrentData());
        setTileData(engine.getPrimaryDealerTileData());
        setAlerts(engine.getAlerts());
        setInsights(engine.getInsights());
        setLastUpdate(report.lastUpdated);
      } else {
        throw new Error(report.errors?.[0] || 'Engine execution failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Dealer positions refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, [engine]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    engine.acknowledgeAlert(alertId);
    setAlerts(engine.getAlerts());
  }, [engine]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    // Initial load
    refresh();

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, autoRefresh, refreshInterval]);

  // Health status
  const healthStatus = engine.getHealthStatus();

  return {
    data,
    tileData,
    alerts,
    insights,
    loading,
    error,
    lastUpdate,
    healthStatus,
    refresh,
    acknowledgeAlert,
    clearError
  };
};