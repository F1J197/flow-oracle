import { useState, useEffect, useCallback, useRef } from 'react';
import { UnifiedEngineRegistry } from '@/engines/base/UnifiedEngineRegistry';
import { UnifiedEngineOrchestrator } from '@/engines/base/UnifiedEngineOrchestrator';
import { IEngine, EngineState } from '@/types/engines';

interface UseUnifiedEngineManagerOptions {
  autoExecute?: boolean;
  refreshInterval?: number;
  healthCheckInterval?: number;
}

interface UnifiedEngineManagerState {
  engines: Map<string, IEngine>;
  engineStates: Map<string, EngineState>;
  isExecuting: boolean;
  lastExecution: Date | null;
  errors: Map<string, Error>;
  systemHealth: 'healthy' | 'degraded' | 'critical';
}

export function useUnifiedEngineManager(options: UseUnifiedEngineManagerOptions = {}) {
  const {
    autoExecute = true,
    refreshInterval = 30000,
    healthCheckInterval = 10000
  } = options;

  const [state, setState] = useState<UnifiedEngineManagerState>({
    engines: new Map(),
    engineStates: new Map(),
    isExecuting: false,
    lastExecution: null,
    errors: new Map(),
    systemHealth: 'healthy'
  });

  const registryRef = useRef<UnifiedEngineRegistry | null>(null);
  const orchestratorRef = useRef<UnifiedEngineOrchestrator | null>(null);

  // Initialize registry and orchestrator
  useEffect(() => {
    if (!registryRef.current) {
      registryRef.current = UnifiedEngineRegistry.getInstance();
    }
    
    if (!orchestratorRef.current) {
      orchestratorRef.current = new UnifiedEngineOrchestrator();
    }

    // Load existing engines
    updateEngineState();

    return () => {
      // Cleanup on unmount - orchestrator cleanup
      registryRef.current = null;
      orchestratorRef.current = null;
    };
  }, []);

  const updateEngineState = useCallback(() => {
    if (!registryRef.current) return;

    const registry = registryRef.current;
    const engines = new Map<string, IEngine>();
    const engineStates = new Map<string, EngineState>();
    const errors = new Map<string, Error>();

    // Get all registered engines - simplified approach for now
    // TODO: Implement proper registry.getEngines() method
    engines.set('DIS', { id: 'DIS' } as IEngine);
    engines.set('NET_LIQ', { id: 'NET_LIQ' } as IEngine);
    engines.set('CREDIT_STRESS', { id: 'CREDIT_STRESS' } as IEngine);

    // Get current states for all engines
    engines.forEach((engine, id) => {
      try {
        if ('getState' in engine && typeof engine.getState === 'function') {
          engineStates.set(id, (engine as any).getState());
        } else {
          engineStates.set(id, {
            status: 'idle',
            lastReport: undefined,
            lastError: undefined
          });
        }
      } catch (error) {
        errors.set(id, error as Error);
        engineStates.set(id, {
          status: 'error',
          lastReport: undefined,
          lastError: (error as Error).message
        });
      }
    });

    // Determine system health
    let healthyCount = 0;
    let degradedCount = 0;
    let criticalCount = 0;

    engineStates.forEach((state) => {
      if (state.status === 'error') {
        criticalCount++;
      } else if (state.status === 'loading') {
        degradedCount++;
      } else {
        healthyCount++;
      }
    });

    let systemHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (criticalCount > 0) {
      systemHealth = 'critical';
    } else if (degradedCount > 0) {
      systemHealth = 'degraded';
    }

    setState(prev => ({
      ...prev,
      engines,
      engineStates,
      errors,
      systemHealth
    }));
  }, []);

  const executeAllEngines = useCallback(async () => {
    if (state.isExecuting) return;

    setState(prev => ({ ...prev, isExecuting: true }));

    try {
      // Simple execution simulation for now
      console.log('🚀 Executing all engines...');
      
      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        isExecuting: false,
        lastExecution: new Date()
      }));

      // Update engine states after execution
      updateEngineState();
    } catch (error) {
      console.error('🚨 Engine execution failed:', error);
      setState(prev => ({
        ...prev,
        isExecuting: false,
        errors: new Map(prev.errors).set('orchestrator', error as Error)
      }));
    }
  }, [state.isExecuting, updateEngineState]);

  const executeEngine = useCallback(async (engineId: string) => {
    try {
      console.log(`🚀 Executing engine: ${engineId}`);
      
      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateEngineState();
    } catch (error) {
      console.error(`🚨 Engine ${engineId} execution failed:`, error);
      setState(prev => ({
        ...prev,
        errors: new Map(prev.errors).set(engineId, error as Error)
      }));
    }
  }, [updateEngineState]);

  const registerEngine = useCallback((engine: IEngine) => {
    console.log(`📝 Registering engine: ${engine.id}`);
    updateEngineState();
  }, [updateEngineState]);

  const unregisterEngine = useCallback((engineId: string) => {
    console.log(`🗑️ Unregistering engine: ${engineId}`);
    updateEngineState();
  }, [updateEngineState]);

  const getEngineState = useCallback((engineId: string): EngineState | null => {
    return state.engineStates.get(engineId) || null;
  }, [state.engineStates]);

  const getEngineError = useCallback((engineId: string): Error | null => {
    return state.errors.get(engineId) || null;
  }, [state.errors]);

  // Auto-execution effect
  useEffect(() => {
    if (!autoExecute) return;

    const interval = setInterval(() => {
      executeAllEngines();
    }, refreshInterval);

    // Execute immediately on mount
    executeAllEngines();

    return () => clearInterval(interval);
  }, [autoExecute, refreshInterval, executeAllEngines]);

  // Health check effect
  useEffect(() => {
    if (!healthCheckInterval) return;

    const interval = setInterval(() => {
      updateEngineState();
    }, healthCheckInterval);

    return () => clearInterval(interval);
  }, [healthCheckInterval, updateEngineState]);

  return {
    // State
    engines: state.engines,
    engineStates: state.engineStates,
    isExecuting: state.isExecuting,
    lastExecution: state.lastExecution,
    errors: state.errors,
    systemHealth: state.systemHealth,

    // Actions
    executeAllEngines,
    executeEngine,
    registerEngine,
    unregisterEngine,
    updateEngineState,

    // Queries
    getEngineState,
    getEngineError,

    // Computed
    engineCount: state.engines.size,
    healthyEngines: Array.from(state.engineStates.values()).filter(s => s.status !== 'error').length,
    criticalEngines: Array.from(state.engineStates.values()).filter(s => s.status === 'error').length
  };
}