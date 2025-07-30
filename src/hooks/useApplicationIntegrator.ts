/**
 * React hook for ApplicationIntegrator integration
 * Provides centralized access to all system components and real-time updates
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import ApplicationIntegrator, { 
  type SystemStatus, 
  type DataUpdate, 
  type ApplicationIntegratorConfig 
} from '@/services/ApplicationIntegrator';

interface UseApplicationIntegratorOptions {
  autoInitialize?: boolean;
  enableRealtimeUpdates?: boolean;
  enableBatchUpdates?: boolean;
  config?: Partial<ApplicationIntegratorConfig>;
}

interface UseApplicationIntegratorReturn {
  integrator: ApplicationIntegrator | null;
  systemStatus: SystemStatus | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  realtimeData: DataUpdate | null;
  batchUpdates: DataUpdate[];
  
  // Control methods
  initialize: () => Promise<void>;
  shutdown: () => Promise<void>;
  refreshData: () => Promise<void>;
  executeEngines: () => Promise<void>;
  
  // Status methods
  getDataOrchestratorStatus: () => any;
  getWebSocketStatus: () => any;
}

export function useApplicationIntegrator(
  options: UseApplicationIntegratorOptions = {}
): UseApplicationIntegratorReturn {
  const { 
    autoInitialize = true, 
    enableRealtimeUpdates = true, 
    enableBatchUpdates = false,
    config 
  } = options;
  
  const [integrator, setIntegrator] = useState<ApplicationIntegrator | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeData, setRealtimeData] = useState<DataUpdate | null>(null);
  const [batchUpdates, setBatchUpdates] = useState<DataUpdate[]>([]);
  
  // Use ref to track cleanup functions
  const cleanupFunctions = useRef<Array<() => void>>([]);

  // Initialize integrator instance
  useEffect(() => {
    const instance = ApplicationIntegrator.getInstance(config);
    setIntegrator(instance);

    // Setup global event listeners
    const initStartedHandler = () => {
      setIsLoading(true);
      setError(null);
    };

    const initCompletedHandler = (data: { status: SystemStatus }) => {
      setIsLoading(false);
      setSystemStatus(data.status);
    };

    const initFailedHandler = (data: { error: string }) => {
      setIsLoading(false);
      setError(data.error);
    };

    const systemErrorHandler = (data: { error: any }) => {
      setError(data.error?.message || 'System error occurred');
    };

    // Add listeners and store cleanup functions
    instance.on('initialization:started', initStartedHandler);
    instance.on('initialization:completed', initCompletedHandler);
    instance.on('initialization:failed', initFailedHandler);
    instance.on('system:error', systemErrorHandler);

    cleanupFunctions.current.push(
      () => instance.off('initialization:started', initStartedHandler),
      () => instance.off('initialization:completed', initCompletedHandler),
      () => instance.off('initialization:failed', initFailedHandler),
      () => instance.off('system:error', systemErrorHandler)
    );

    return () => {
      cleanupFunctions.current.forEach(cleanup => cleanup());
      cleanupFunctions.current = [];
    };
  }, []);

  // Setup real-time data subscription
  useEffect(() => {
    if (!integrator || !enableRealtimeUpdates) return;

    const cleanup = integrator.subscribeToRealtimeUpdates((data: DataUpdate) => {
      setRealtimeData(data);
    });

    cleanupFunctions.current.push(cleanup);
    return cleanup;
  }, [integrator, enableRealtimeUpdates]);

  // Setup batch updates subscription
  useEffect(() => {
    if (!integrator || !enableBatchUpdates) return;

    const cleanup = integrator.subscribeToBatchUpdates((data) => {
      setBatchUpdates(data.updates);
    });

    cleanupFunctions.current.push(cleanup);
    return cleanup;
  }, [integrator, enableBatchUpdates]);

  // Setup system status subscription
  useEffect(() => {
    if (!integrator) return;

    const cleanup = integrator.subscribeToSystemStatus((status: SystemStatus) => {
      setSystemStatus(status);
    });

    cleanupFunctions.current.push(cleanup);
    return cleanup;
  }, [integrator]);

  // Auto-initialize if enabled
  useEffect(() => {
    if (autoInitialize && integrator && !systemStatus?.dataOrchestrator && !isLoading) {
      initialize();
    }
  }, [autoInitialize, integrator, systemStatus?.dataOrchestrator, isLoading]);

  // Initialize method
  const initialize = useCallback(async () => {
    if (!integrator || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await integrator.initialize();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Initialization failed';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [integrator, isLoading]);

  // Shutdown method
  const shutdown = useCallback(async () => {
    if (!integrator) return;

    try {
      await integrator.shutdown();
      setSystemStatus(null);
      setRealtimeData(null);
      setBatchUpdates([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Shutdown failed';
      setError(errorMessage);
    }
  }, [integrator]);

  // Refresh data method
  const refreshData = useCallback(async () => {
    if (!integrator) return;

    try {
      await integrator.refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Data refresh failed';
      setError(errorMessage);
    }
  }, [integrator]);

  // Execute engines method
  const executeEngines = useCallback(async () => {
    if (!integrator) return;

    try {
      await integrator.executeEngines();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Engine execution failed';
      setError(errorMessage);
    }
  }, [integrator]);

  // Status getter methods
  const getDataOrchestratorStatus = useCallback(() => {
    return integrator?.getDataOrchestratorStatus() || null;
  }, [integrator]);

  const getWebSocketStatus = useCallback(() => {
    return integrator?.getWebSocketStatus() || null;
  }, [integrator]);

  return {
    integrator,
    systemStatus,
    isInitialized: systemStatus?.dataOrchestrator === 'ready' || false,
    isLoading,
    error,
    realtimeData,
    batchUpdates,
    initialize,
    shutdown,
    refreshData,
    executeEngines,
    getDataOrchestratorStatus,
    getWebSocketStatus
  };
}