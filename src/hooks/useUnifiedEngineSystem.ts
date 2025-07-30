/**
 * Unified Engine System Hook - V6 Implementation
 * Single hook for all engine system interactions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  UnifiedEngineRegistry, 
  UnifiedEngineOrchestrator,
  type UnifiedEngineMetadata,
  type ExecutionContext,
  type SystemHealth,
  type OrchestratorConfig
} from '../engines/base';
import type { IEngine } from '../types/engines';

export interface UseUnifiedEngineSystemOptions extends Partial<ExecutionContext> {
  autoExecute?: boolean;
  refreshInterval?: number;
  orchestratorConfig?: Partial<OrchestratorConfig>;
  enableHealthMonitoring?: boolean;
}

export interface UnifiedEngineSystemState {
  // Engine management
  engines: UnifiedEngineMetadata[];
  results: Map<string, any>;
  
  // Execution state
  status: 'idle' | 'loading' | 'success' | 'error';
  loading: boolean;
  error: string | null;
  
  // System health
  systemHealth: SystemHealth | null;
  
  // Execution tracking
  executionStatus: {
    total: number;
    running: number;
    completed: number;
    failed: number;
  };
}

export const useUnifiedEngineSystem = (options: UseUnifiedEngineSystemOptions = {}) => {
  const [state, setState] = useState<UnifiedEngineSystemState>({
    engines: [],
    results: new Map(),
    status: 'idle',
    loading: false,
    error: null,
    systemHealth: null,
    executionStatus: { total: 0, running: 0, completed: 0, failed: 0 }
  });

  // Get singletons
  const registry = UnifiedEngineRegistry.getInstance();
  const orchestrator = useRef<UnifiedEngineOrchestrator | null>(null);

  // Initialize orchestrator
  useEffect(() => {
    if (!orchestrator.current) {
      orchestrator.current = new UnifiedEngineOrchestrator(options.orchestratorConfig);
      
      // Register existing engines from registry with orchestrator
      const engines = registry.getAllMetadata();
      engines.forEach(metadata => {
        const engine = registry.getEngine(metadata.id);
        if (engine) {
          orchestrator.current!.registerEngine(engine, metadata);
        }
      });
    }

    return () => {
      if (orchestrator.current) {
        orchestrator.current.destroy();
        orchestrator.current = null;
      }
    };
  }, [options.orchestratorConfig]);

  // Update state from registry and orchestrator
  const updateState = useCallback(() => {
    setState(prev => ({
      ...prev,
      engines: registry.getAllMetadata(),
      results: registry.getAllResults(),
      executionStatus: registry.getExecutionStatus(),
      systemHealth: orchestrator.current ? orchestrator.current.getSystemHealth() : null
    }));
  }, [registry]);

  // Execute all engines
  const executeEngines = useCallback(async (context?: ExecutionContext) => {
    setState(prev => ({ ...prev, loading: true, status: 'loading', error: null }));
    
    try {
      const executionContext = { ...options, ...context };
      const results = await registry.executeAll(executionContext);
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        status: 'success',
        results,
        executionStatus: registry.getExecutionStatus(),
        systemHealth: orchestrator.current ? orchestrator.current.getSystemHealth() : null
      }));

      return results;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      throw error;
    }
  }, [registry, options]);

  // Execute single engine
  const executeEngine = useCallback(async (engineId: string) => {
    try {
      const result = await registry.executeEngine(engineId);
      
      setState(prev => ({
        ...prev,
        results: new Map(prev.results.set(engineId, result)),
        executionStatus: registry.getExecutionStatus(),
        systemHealth: orchestrator.current ? orchestrator.current.getSystemHealth() : null
      }));

      return result;
    } catch (error) {
      console.error(`Failed to execute engine ${engineId}:`, error);
      throw error;
    }
  }, [registry]);

  // Execute by pillar
  const executeByPillar = useCallback(async (pillar: 1 | 2 | 3, parallel = true) => {
    return executeEngines({ pillar, parallel });
  }, [executeEngines]);

  // Execute by category
  const executeByCategory = useCallback(async (
    category: 'foundation' | 'core' | 'synthesis' | 'execution', 
    parallel = true
  ) => {
    return executeEngines({ category, parallel });
  }, [executeEngines]);

  // Register new engine
  const registerEngine = useCallback((engine: IEngine, metadata?: Partial<UnifiedEngineMetadata>) => {
    registry.register(engine, metadata);
    
    // Also register with orchestrator
    if (orchestrator.current) {
      const fullMetadata = registry.getMetadata(engine.id);
      if (fullMetadata) {
        orchestrator.current.registerEngine(engine, fullMetadata);
      }
    }
    
    updateState();
  }, [registry, updateState]);

  // Unregister engine
  const unregisterEngine = useCallback((engineId: string) => {
    registry.unregister(engineId);
    
    // Also unregister from orchestrator
    if (orchestrator.current) {
      orchestrator.current.unregisterEngine(engineId);
    }
    
    updateState();
  }, [registry, updateState]);

  // Subscribe to engine events
  const subscribeToEngine = useCallback((engineId: string, callback: (data: any) => void) => {
    return registry.subscribe(engineId, callback);
  }, [registry]);

  // Get engine instance
  const getEngine = useCallback((engineId: string): IEngine | null => {
    return registry.getEngine(engineId);
  }, [registry]);

  // Get engine metadata
  const getEngineMetadata = useCallback((engineId: string): UnifiedEngineMetadata | null => {
    return registry.getMetadata(engineId);
  }, [registry]);

  // Get engine result
  const getEngineResult = useCallback((engineId: string) => {
    return state.results.get(engineId);
  }, [state.results]);

  // Get engines by pillar
  const getEnginesByPillar = useCallback((pillar: 1 | 2 | 3): UnifiedEngineMetadata[] => {
    return state.engines.filter(engine => engine.pillar === pillar);
  }, [state.engines]);

  // Get engines by category
  const getEnginesByCategory = useCallback((
    category: 'foundation' | 'core' | 'synthesis' | 'execution'
  ): UnifiedEngineMetadata[] => {
    return state.engines.filter(engine => engine.category === category);
  }, [state.engines]);

  // Force refresh system state
  const refreshSystem = useCallback(() => {
    updateState();
  }, [updateState]);

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

  // Set up refresh interval
  useEffect(() => {
    if (options.refreshInterval && options.refreshInterval > 0) {
      const interval = setInterval(() => {
        if (state.status !== 'loading') {
          executeEngines();
        }
      }, options.refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [options.refreshInterval, executeEngines, state.status]);

  // Set up health monitoring
  useEffect(() => {
    if (options.enableHealthMonitoring && orchestrator.current) {
      const handleHealthUpdate = (health: SystemHealth) => {
        setState(prev => ({ ...prev, systemHealth: health }));
      };

      orchestrator.current.on('system:health-update', handleHealthUpdate);
      
      return () => {
        if (orchestrator.current) {
          orchestrator.current.off('system:health-update', handleHealthUpdate);
        }
      };
    }
  }, [options.enableHealthMonitoring]);

  return {
    // State
    engines: state.engines,
    results: state.results,
    status: state.status,
    loading: state.loading,
    error: state.error,
    systemHealth: state.systemHealth,
    executionStatus: state.executionStatus,

    // Execution methods
    executeEngines,
    executeEngine,
    executeByPillar,
    executeByCategory,

    // Management methods
    registerEngine,
    unregisterEngine,
    subscribeToEngine,

    // Query methods
    getEngine,
    getEngineMetadata,
    getEngineResult,
    getEnginesByPillar,
    getEnginesByCategory,

    // Utility methods
    refreshSystem,
    updateState
  };
};