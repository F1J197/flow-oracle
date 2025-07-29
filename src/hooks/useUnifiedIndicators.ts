import { useState, useEffect, useCallback, useMemo } from 'react';
import { IndicatorState, IndicatorFilter, IndicatorMetadata } from '@/types/indicators';
import { UnifiedDataService } from '@/services/UnifiedDataService';
import { IndicatorRegistry } from '@/services/IndicatorRegistry';

interface UseUnifiedIndicatorsOptions {
  filter?: IndicatorFilter;
  autoRefresh?: boolean;
  refreshInterval?: number;
  includeInactive?: boolean;
}

interface UseUnifiedIndicatorsReturn {
  indicators: IndicatorState[];
  metadata: IndicatorMetadata[];
  loading: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
  refreshIndicator: (indicatorId: string) => Promise<void>;
  getByCategory: (category: string) => IndicatorState[];
  getByPillar: (pillar: number) => IndicatorState[];
  getBySource: (source: string) => IndicatorState[];
  categories: string[];
  pillars: number[];
  sources: string[];
  stats: {
    total: number;
    active: number;
    error: number;
    stale: number;
    loading: number;
  };
}

/**
 * Hook for managing multiple indicators with filtering and bulk operations
 */
export const useUnifiedIndicators = (
  options: UseUnifiedIndicatorsOptions = {}
): UseUnifiedIndicatorsReturn => {
  const [indicators, setIndicators] = useState<IndicatorState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dataService = UnifiedDataService.getInstance();
  const registry = IndicatorRegistry.getInstance();

  const {
    filter,
    autoRefresh = true,
    refreshInterval = 60000, // 1 minute default for multiple indicators
    includeInactive = false
  } = options;

  // Get filtered metadata from registry
  const metadata = useMemo(() => {
    return registry.getAll(filter);
  }, [registry, filter]);

  // Get categories, pillars, and sources from metadata
  const categories = useMemo(() => {
    const cats = new Set(metadata.map(m => m.category));
    return Array.from(cats).sort();
  }, [metadata]);

  const pillars = useMemo(() => {
    const pills = new Set(metadata.map(m => m.pillar).filter(p => p !== undefined));
    return Array.from(pills).sort();
  }, [metadata]);

  const sources = useMemo(() => {
    const srcs = new Set(metadata.map(m => m.source));
    return Array.from(srcs).sort();
  }, [metadata]);

  // Filter indicators by various criteria
  const getByCategory = useCallback((category: string): IndicatorState[] => {
    return indicators.filter(indicator => indicator.metadata.category === category);
  }, [indicators]);

  const getByPillar = useCallback((pillar: number): IndicatorState[] => {
    return indicators.filter(indicator => indicator.metadata.pillar === pillar);
  }, [indicators]);

  const getBySource = useCallback((source: string): IndicatorState[] => {
    return indicators.filter(indicator => indicator.metadata.source === source);
  }, [indicators]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = indicators.length;
    const active = indicators.filter(i => i.status === 'active').length;
    const error = indicators.filter(i => i.status === 'error').length;
    const stale = indicators.filter(i => i.status === 'stale').length;
    const loading = indicators.filter(i => i.status === 'loading').length;

    return { total, active, error, stale, loading };
  }, [indicators]);

  // Refresh all indicators
  const refreshAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const refreshPromises = metadata.map(meta => 
        dataService.refreshIndicator(meta.id).catch(err => {
          console.error(`Failed to refresh ${meta.id}:`, err);
          return null;
        })
      );

      await Promise.allSettled(refreshPromises);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh indicators';
      setError(errorMessage);
      console.error('Error refreshing all indicators:', err);
    } finally {
      setLoading(false);
    }
  }, [metadata, dataService]);

  // Refresh single indicator
  const refreshIndicator = useCallback(async (indicatorId: string) => {
    try {
      await dataService.refreshIndicator(indicatorId);
    } catch (err) {
      console.error(`Failed to refresh indicator ${indicatorId}:`, err);
    }
  }, [dataService]);

  // Update indicators state when data service changes
  const updateIndicators = useCallback(() => {
    try {
      // Get all indicator states (includes mock data)
      let newIndicators = dataService.getAllIndicatorStates();
      
      // Filter out inactive indicators if not requested
      if (!includeInactive) {
        newIndicators = newIndicators.filter(indicator => indicator.status !== 'offline');
      }

      // Apply additional filtering
      if (filter) {
        if (filter.status) {
          newIndicators = newIndicators.filter(indicator => indicator.status === filter.status);
        }
        if (filter.category) {
          newIndicators = newIndicators.filter(indicator => indicator.metadata.category === filter.category);
        }
        if (filter.pillar) {
          newIndicators = newIndicators.filter(indicator => indicator.metadata.pillar === filter.pillar);
        }
        if (filter.source) {
          newIndicators = newIndicators.filter(indicator => indicator.metadata.source === filter.source);
        }
      }

      setIndicators(newIndicators);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update indicators');
      setLoading(false);
    }
  }, [dataService, includeInactive, filter]);

  // Set up subscriptions for all indicators
  useEffect(() => {
    if (metadata.length === 0) {
      setIndicators([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribeFunctions: Array<() => void> = [];

    // Subscribe to each indicator
    metadata.forEach(meta => {
      const unsubscribe = dataService.subscribe({
        indicatorId: meta.id,
        callback: () => {
          // Update all indicators when any one changes
          updateIndicators();
        }
      });
      
      unsubscribeFunctions.push(unsubscribe);
    });

    // Initial update
    updateIndicators();
    setLoading(false);

    return () => {
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }, [metadata, dataService, updateIndicators]);

  // Set up auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      refreshAll();
    }, refreshInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [autoRefresh, refreshInterval, refreshAll]);

  return {
    indicators,
    metadata,
    loading,
    error,
    refreshAll,
    refreshIndicator,
    getByCategory,
    getByPillar,
    getBySource,
    categories,
    pillars,
    sources,
    stats
  };
};