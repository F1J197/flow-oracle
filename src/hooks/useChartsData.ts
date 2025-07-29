import { useState, useEffect, useCallback } from 'react';
import { chartsDataService, LiveIndicator } from '@/services/chartsDataService';

interface UseChartsDataOptions {
  category?: string;
  pillar?: number;
  autoUpdate?: boolean;
}

export const useChartsData = (options: UseChartsDataOptions = {}) => {
  const [indicators, setIndicators] = useState<LiveIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const { category, pillar, autoUpdate = true } = options;

  const fetchIndicators = useCallback(() => {
    try {
      const data = chartsDataService.getIndicators(category, pillar);
      setIndicators(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch indicators');
    }
  }, [category, pillar]);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await chartsDataService.initialize();
        setInitialized(true);
        fetchIndicators();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize charts data');
      } finally {
        setLoading(false);
      }
    };

    if (!initialized) {
      initialize();
    }
  }, [initialized, fetchIndicators]);

  useEffect(() => {
    if (!autoUpdate || !initialized) return;

    const unsubscribe = chartsDataService.subscribe((updatedIndicators) => {
      const filtered = category && category !== 'all' 
        ? updatedIndicators.filter(ind => ind.category === category)
        : updatedIndicators;
      
      const pillarFiltered = pillar 
        ? filtered.filter(ind => ind.pillar === pillar)
        : filtered;
      
      setIndicators(pillarFiltered.sort((a, b) => a.priority - b.priority));
    });

    return unsubscribe;
  }, [autoUpdate, initialized, category, pillar]);

  const getIndicatorById = useCallback((id: string) => {
    return chartsDataService.getIndicatorById(id);
  }, []);

  const refreshData = useCallback(() => {
    fetchIndicators();
  }, [fetchIndicators]);

  return {
    indicators,
    loading,
    error,
    initialized,
    getIndicatorById,
    refreshData
  };
};