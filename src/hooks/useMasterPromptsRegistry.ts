/**
 * Master Prompts Registry Hook - V6 Implementation
 * React integration for Master Prompts compliant engine system
 */

import { useState, useEffect, useCallback } from 'react';
import { MasterPromptsEngineRegistry, RegistryMetrics } from '@/engines/base/MasterPromptsEngineRegistry';
import { MasterPromptBaseEngine } from '@/engines/base/MasterPromptBaseEngine';
import { IEngine, EngineReport } from '@/types/engines';

export interface UseMasterPromptsRegistryOptions {
  autoExecute?: boolean;
  refreshInterval?: number;
  enableLegacySupport?: boolean;
}

export interface MasterPromptsRegistryState {
  isExecuting: boolean;
  results: Map<string, EngineReport>;
  metrics: RegistryMetrics;
  lastExecution: Date | null;
  error: Error | null;
  systemHealth: number;
}

/**
 * Hook for Master Prompts compliant engine registry
 */
export function useMasterPromptsRegistry(options: UseMasterPromptsRegistryOptions = {}) {
  const {
    autoExecute = true,
    refreshInterval = 15000,
    enableLegacySupport = true
  } = options;

  const [state, setState] = useState<MasterPromptsRegistryState>({
    isExecuting: false,
    results: new Map(),
    metrics: {
      totalEngines: 0,
      activeEngines: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      systemHealth: 1.0
    },
    lastExecution: null,
    error: null,
    systemHealth: 1.0
  });

  const registry = MasterPromptsEngineRegistry.getInstance({
    enableLegacySupport,
    refreshInterval
  });

  /**
   * Execute all engines
   */
  const executeEngines = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isExecuting: true, error: null }));
      
      const results = await registry.executeAll();
      const metrics = registry.getMetrics();
      
      setState(prev => ({
        ...prev,
        isExecuting: false,
        results,
        metrics,
        lastExecution: new Date(),
        systemHealth: metrics.systemHealth
      }));

      return results;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isExecuting: false,
        error: error as Error
      }));
      throw error;
    }
  }, [registry]);

  /**
   * Register Master Prompt engine
   */
  const registerMasterPromptEngine = useCallback((engine: MasterPromptBaseEngine) => {
    registry.registerMasterPromptEngine(engine);
    setState(prev => ({
      ...prev,
      metrics: registry.getMetrics()
    }));
  }, [registry]);

  /**
   * Register unified engine
   */
  const registerUnifiedEngine = useCallback((engine: IEngine, metadata?: any) => {
    registry.registerUnifiedEngine(engine, metadata);
    setState(prev => ({
      ...prev,
      metrics: registry.getMetrics()
    }));
  }, [registry]);

  /**
   * Register legacy engine
   */
  const registerLegacyEngine = useCallback((engine: IEngine, metadata?: any) => {
    registry.registerLegacyEngine(engine, metadata);
    setState(prev => ({
      ...prev,
      metrics: registry.getMetrics()
    }));
  }, [registry]);

  /**
   * Get engine by ID
   */
  const getEngine = useCallback((engineId: string) => {
    return registry.getEngine(engineId);
  }, [registry]);

  /**
   * Get engine result
   */
  const getEngineResult = useCallback((engineId: string): EngineReport | null => {
    return state.results.get(engineId) || null;
  }, [state.results]);

  /**
   * Subscribe to registry events
   */
  const subscribeToEvents = useCallback((callback: (results: Map<string, EngineReport>) => void) => {
    return registry.subscribe(callback);
  }, [registry]);

  /**
   * Force refresh metrics
   */
  const refreshMetrics = useCallback(() => {
    setState(prev => ({
      ...prev,
      metrics: registry.getMetrics()
    }));
  }, [registry]);

  // Setup event listeners
  useEffect(() => {
    const unsubscribe = registry.subscribe((results) => {
      setState(prev => ({
        ...prev,
        results,
        metrics: registry.getMetrics()
      }));
    });

    // Registry event listeners
    const handleEngineStart = () => {
      setState(prev => ({ ...prev, isExecuting: true }));
    };

    const handleEngineComplete = () => {
      setState(prev => ({ 
        ...prev, 
        isExecuting: false,
        lastExecution: new Date(),
        metrics: registry.getMetrics()
      }));
    };

    const handleEngineError = (data: any) => {
      setState(prev => ({
        ...prev,
        error: new Error(data.error?.message || 'Engine execution failed')
      }));
    };

    registry.on('execution:start', handleEngineStart);
    registry.on('execution:complete', handleEngineComplete);
    registry.on('execution:error', handleEngineError);

    return () => {
      unsubscribe();
      registry.off('execution:start', handleEngineStart);
      registry.off('execution:complete', handleEngineComplete);
      registry.off('execution:error', handleEngineError);
    };
  }, [registry]);

  // Auto-execute on mount
  useEffect(() => {
    if (autoExecute) {
      executeEngines().catch(console.error);
    }
  }, [autoExecute, executeEngines]);

  // Periodic refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        if (!state.isExecuting) {
          executeEngines().catch(console.error);
        }
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, executeEngines, state.isExecuting]);

  return {
    // State
    isExecuting: state.isExecuting,
    results: state.results,
    metrics: state.metrics,
    lastExecution: state.lastExecution,
    error: state.error,
    systemHealth: state.systemHealth,

    // Actions
    executeEngines,
    registerMasterPromptEngine,
    registerUnifiedEngine,
    registerLegacyEngine,
    getEngine,
    getEngineResult,
    subscribeToEvents,
    refreshMetrics,

    // Registry instance (for advanced usage)
    registry
  };
}