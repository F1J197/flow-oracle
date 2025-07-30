import { useState, useEffect, useCallback } from 'react';
import { DataIntegrityEngine } from '@/engines/foundation/DataIntegrityEngine';
import type { DataIntegrityMetrics, SourceHealth } from '@/engines/foundation/DataIntegrityEngine/types';

export interface UseFoundationDataIntegrityOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseFoundationDataIntegrityResult {
  metrics: DataIntegrityMetrics | null;
  sources: SourceHealth[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  engine: DataIntegrityEngine | null;
}

export const useFoundationDataIntegrity = (
  options: UseFoundationDataIntegrityOptions = {}
): UseFoundationDataIntegrityResult => {
  const {
    autoRefresh = true,
    refreshInterval = 30000
  } = options;

  const [engine] = useState(() => new DataIntegrityEngine());
  const [metrics, setMetrics] = useState<DataIntegrityMetrics | null>(null);
  const [sources, setSources] = useState<SourceHealth[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!engine) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Execute the engine
      await engine.execute();
      
      // Get the updated metrics and sources
      const newMetrics = engine.getDataIntegrityMetrics();
      const newSources = engine.getSources();
      
      setMetrics(newMetrics);
      setSources(newSources);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Foundation Data Integrity refresh failed:', err);
    } finally {
      setLoading(false);
    }
  }, [engine]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !refreshInterval) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    metrics,
    sources,
    loading,
    error,
    refresh,
    engine
  };
};