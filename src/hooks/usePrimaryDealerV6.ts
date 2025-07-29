import { useState, useEffect, useCallback } from 'react';
import { PrimaryDealerTileData } from '@/types/primaryDealerTile';
import { PrimaryDealerPositionsEngineV6 } from '@/engines/PrimaryDealerPositionsEngineV6';

interface UsePrimaryDealerV6Return {
  tileData: PrimaryDealerTileData | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export const usePrimaryDealerV6 = (
  autoRefresh: boolean = true
): UsePrimaryDealerV6Return => {
  const [engine] = useState(() => new PrimaryDealerPositionsEngineV6());
  const [tileData, setTileData] = useState<PrimaryDealerTileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const report = await engine.execute();
      
      if (report.success) {
        const newTileData = engine.getPrimaryDealerTileData();
        setTileData(newTileData);
        setLastUpdate(report.lastUpdated);
      } else {
        setError(report.errors?.[0] || 'Failed to fetch dealer data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Primary Dealer V6 hook error:', err);
    } finally {
      setLoading(false);
    }
  }, [engine]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial load and auto-refresh setup
  useEffect(() => {
    refresh();

    if (autoRefresh) {
      const interval = setInterval(refresh, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [refresh, autoRefresh]);

  return {
    tileData,
    loading,
    error,
    lastUpdate,
    refresh,
    clearError,
  };
};