import { useState, useEffect, useCallback } from 'react';
import { EngineRegistry, EngineMetadata } from '@/engines/EngineRegistry';
import { IEngine } from '@/types/engines';

export interface UseEngineRegistryOptions {
  autoExecute?: boolean;
  refreshInterval?: number;
  pillar?: 1 | 2 | 3;
  category?: 'foundation' | 'core' | 'synthesis' | 'execution';
}

export interface EngineRegistryState {
  engines: EngineMetadata[];
  results: Map<string, any>;
  status: {
    total: number;
    running: number;
    completed: number;
    failed: number;
  };
  loading: boolean;
  error: string | null;
}

export const useEngineRegistry = (options: UseEngineRegistryOptions = {}) => {
  const {
    autoExecute = false,
    refreshInterval = 15000,
    pillar,
    category
  } = options;

  const [state, setState] = useState<EngineRegistryState>({
    engines: [],
    results: new Map(),
    status: { total: 0, running: 0, completed: 0, failed: 0 },
    loading: false,
    error: null
  });

  const registry = EngineRegistry.getInstance();

  const updateState = useCallback(() => {
    const engines = category 
      ? registry.getEnginesByCategory(category)
      : pillar 
        ? registry.getEnginesByPillar(pillar)
        : registry.getAllMetadata();

    const status = registry.getExecutionStatus();

    setState(prev => ({
      ...prev,
      engines,
      status,
      loading: status.running > 0
    }));
  }, [registry, pillar, category]);

  const executeEngines = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      let results: Map<string, any>;
      
      if (category) {
        results = await registry.executeByCategory(category);
      } else if (pillar) {
        results = await registry.executeByPillar(pillar);
      } else {
        results = await registry.executeAll();
      }

      setState(prev => ({
        ...prev,
        results,
        loading: false
      }));

      return results;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      }));
      throw error;
    }
  }, [registry, pillar, category]);

  const executeEngine = useCallback(async (engineId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await registry.executeEngine(engineId);
      
      setState(prev => {
        const newResults = new Map(prev.results);
        if (result) {
          newResults.set(engineId, result);
        }
        return {
          ...prev,
          results: newResults,
          loading: false
        };
      });

      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      }));
      throw error;
    }
  }, [registry]);

  const registerEngine = useCallback((engine: IEngine, metadata?: Partial<EngineMetadata>) => {
    registry.register(engine, metadata);
    updateState();
  }, [registry, updateState]);

  const unregisterEngine = useCallback((engineId: string) => {
    registry.unregister(engineId);
    updateState();
  }, [registry, updateState]);

  const subscribeToEngine = useCallback((engineId: string, callback: (data: any) => void) => {
    return registry.subscribe(engineId, callback);
  }, [registry]);

  const getEngine = useCallback((engineId: string): IEngine | null => {
    return registry.getEngine(engineId);
  }, [registry]);

  const getEngineMetadata = useCallback((engineId: string): EngineMetadata | null => {
    return registry.getMetadata(engineId);
  }, [registry]);

  const getEngineResult = useCallback((engineId: string): any => {
    return state.results.get(engineId) || null;
  }, [state.results]);

  // Auto-execute on mount if enabled
  useEffect(() => {
    updateState();
    
    console.log('🚀 useEngineRegistry: Hook initialized', {
      autoExecute,
      totalEngines: registry.getAllMetadata().length,
      category,
      pillar
    });
    
    if (autoExecute) {
      console.log('🔄 useEngineRegistry: Auto-executing engines...');
      executeEngines()
        .then((results) => {
          console.log('✅ useEngineRegistry: Auto-execution completed', {
            resultCount: results?.size || 0,
            resultKeys: results ? Array.from(results.keys()) : []
          });
        })
        .catch((error) => {
          console.error('❌ useEngineRegistry: Auto-execution failed:', error);
        });
    }
  }, [autoExecute, updateState, executeEngines]);

  // Set up refresh interval if specified
  useEffect(() => {
    if (!refreshInterval || !autoExecute) return;

    const interval = setInterval(() => {
      executeEngines().catch(console.error);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, autoExecute, executeEngines]);

  return {
    // State
    engines: state.engines,
    results: state.results,
    status: state.status,
    loading: state.loading,
    error: state.error,

    // Actions
    executeEngines,
    executeEngine,
    registerEngine,
    unregisterEngine,
    
    // Subscriptions
    subscribeToEngine,
    
    // Utilities
    getEngine,
    getEngineMetadata,
    getEngineResult,
    updateState
  };
};