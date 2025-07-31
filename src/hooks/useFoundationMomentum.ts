import { useState, useEffect, useCallback } from 'react';
import { EnhancedMomentumEngine } from '@/engines/foundation/EnhancedMomentumEngine';
import type { MomentumMetrics, MomentumAlert, CompositeMomentumScore } from '@/engines/foundation/EnhancedMomentumEngine/types';

export interface UseFoundationMomentumOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseFoundationMomentumResult {
  metrics: MomentumMetrics | null;
  compositeScore: CompositeMomentumScore | null;
  alerts: MomentumAlert[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  engine: EnhancedMomentumEngine | null;
}

export const useFoundationMomentum = (
  options: UseFoundationMomentumOptions = {}
): UseFoundationMomentumResult => {
  const {
    autoRefresh = true,
    refreshInterval = 30000
  } = options;

  const [engine] = useState(() => new EnhancedMomentumEngine());
  const [metrics, setMetrics] = useState<MomentumMetrics | null>(null);
  const [compositeScore, setCompositeScore] = useState<CompositeMomentumScore | null>(null);
  const [alerts, setAlerts] = useState<MomentumAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!engine) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Execute the engine
      await engine.execute();
      
      // Get the updated metrics
      const newMetrics = engine.getMomentumMetrics();
      const newCompositeScore = engine.getCompositeScore();
      const newAlerts = engine.getAlerts();
      
      setMetrics(newMetrics);
      setCompositeScore(newCompositeScore);
      setAlerts(newAlerts);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Foundation Momentum refresh failed:', err);
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
    compositeScore,
    alerts,
    loading,
    error,
    refresh,
    engine
  };
};