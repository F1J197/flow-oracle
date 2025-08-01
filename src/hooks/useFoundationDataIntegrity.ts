import { useState, useEffect, useCallback } from 'react';
import { DataIntegrityEngineV6 } from '@/engines/foundation/DataIntegrityEngine';
import type { DataIntegrityMetrics, SourceHealth } from '@/engines/foundation/DataIntegrityEngine/types';
import type { EngineOutput } from '@/engines/BaseEngine';

export interface UseFoundationDataIntegrityOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseFoundationDataIntegrityResult {
  metrics: DataIntegrityMetrics | null;
  sources: SourceHealth[];
  engineOutput: EngineOutput | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  engine: DataIntegrityEngineV6 | null;
}

export const useFoundationDataIntegrity = (
  options: UseFoundationDataIntegrityOptions = {}
): UseFoundationDataIntegrityResult => {
  const {
    autoRefresh = true,
    refreshInterval = 30000
  } = options;

  const [engine] = useState(() => new DataIntegrityEngineV6());
  const [metrics, setMetrics] = useState<DataIntegrityMetrics | null>(null);
  const [sources, setSources] = useState<SourceHealth[]>([]);
  const [engineOutput, setEngineOutput] = useState<EngineOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!engine) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Execute the engine
      const report = await engine.execute();
      
      if (report.success && report.data) {
        // Extract engine output from the report
        const output = report.data as EngineOutput;
        setEngineOutput(output);
        
        // Get the updated metrics and sources (legacy compatibility)
        const newMetrics = engine.getDataIntegrityMetrics();
        const newSources = engine.getSources();
        
        setMetrics(newMetrics);
        setSources(newSources);
      } else {
        throw new Error(report.errors?.[0] || 'Engine execution failed');
      }
      
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
    engineOutput,
    loading,
    error,
    refresh,
    engine
  };
};