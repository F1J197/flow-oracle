/**
 * Unified Engine Registry Hook - V6 Implementation
 * Provides React integration with the new unified engine system
 */

import { useState, useEffect, useCallback } from 'react';
import { UnifiedEngineRegistry } from '@/engines/base/UnifiedEngineRegistry';
import type { UnifiedEngineMetadata, ExecutionContext } from '@/engines/base/UnifiedEngineRegistry';
import type { IEngine } from '@/types/engines';

export interface UseUnifiedEngineRegistryOptions extends Partial<ExecutionContext> {
  autoExecute?: boolean;
  refreshInterval?: number;
}

export interface UnifiedEngineRegistryState {
  engines: UnifiedEngineMetadata[];
  results: Map<string, any>;
  status: 'idle' | 'loading' | 'success' | 'error';
  loading: boolean;
  error: string | null;
  executionStatus: {
    total: number;
    running: number;
    completed: number;
    failed: number;
  };
}

export const useUnifiedEngineRegistry = (options: UseUnifiedEngineRegistryOptions = {}) => {
  const [state, setState] = useState<UnifiedEngineRegistryState>({
    engines: [],
    results: new Map(),
    status: 'idle',
    loading: false,
    error: null,
    executionStatus: { total: 0, running: 0, completed: 0, failed: 0 }
  });

  const registry = UnifiedEngineRegistry.getInstance();

  const updateState = useCallback(() => {
    setState(prev => ({
      ...prev,
      engines: registry.getAllMetadata(),
      results: registry.getAllResults(),
      executionStatus: registry.getExecutionStatus()
    }));
  }, [registry]);

  const executeEngines = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, status: 'loading', error: null }));
    
    try {
      await registry.executeAll(options);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        status: 'success',
        results: registry.getAllResults(),
        executionStatus: registry.getExecutionStatus()
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, [registry, options]);

  const executeEngine = useCallback(async (engineId: string) => {
    try {
      const result = await registry.executeEngine(engineId);
      setState(prev => ({
        ...prev,
        results: new Map(prev.results.set(engineId, result)),
        executionStatus: registry.getExecutionStatus()
      }));
      return result;
    } catch (error) {
      console.error(`Failed to execute engine ${engineId}:`, error);
      throw error;
    }
  }, [registry]);

  const registerEngine = useCallback((engine: IEngine, metadata?: Partial<UnifiedEngineMetadata>) => {
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

  const getEngineMetadata = useCallback((engineId: string): UnifiedEngineMetadata | null => {
    return registry.getMetadata(engineId);
  }, [registry]);

  const getEngineResult = useCallback((engineId: string) => {
    return state.results.get(engineId);
  }, [state.results]);

  // Initial state update
  useEffect(() => {
    updateState();
  }, [updateState]);

  // Auto-execute on mount if enabled
  useEffect(() => {
    if (options.autoExecute) {
      executeEngines();
    }
  }, [options.autoExecute, executeEngines]);

  // Set up refresh interval if specified
  useEffect(() => {
    if (options.refreshInterval && options.refreshInterval > 0) {
      const interval = setInterval(executeEngines, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [options.refreshInterval, executeEngines]);

  return {
    // State
    engines: state.engines,
    results: state.results,
    status: state.status,
    loading: state.loading,
    error: state.error,
    executionStatus: state.executionStatus,

    // Actions
    executeEngines,
    executeEngine,
    registerEngine,
    unregisterEngine,
    subscribeToEngine,

    // Getters
    getEngine,
    getEngineMetadata,
    getEngineResult,

    // Utilities
    updateState
  };
};