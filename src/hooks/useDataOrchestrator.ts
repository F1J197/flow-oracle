/**
 * React hook for DataOrchestrator integration
 * Provides access to orchestrator status and controls
 */

import { useEffect, useState, useCallback } from 'react';
import DataOrchestrator, { type OrchestratorStatus, type DataOrchestratorConfig } from '@/services/DataOrchestrator';

interface UseDataOrchestratorOptions {
  autoInitialize?: boolean;
  config?: Partial<DataOrchestratorConfig>;
}

interface UseDataOrchestratorReturn {
  orchestrator: DataOrchestrator | null;
  status: OrchestratorStatus | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  shutdown: () => Promise<void>;
  refreshProvider: (provider: 'fred' | 'binance') => Promise<void>;
}

export function useDataOrchestrator(options: UseDataOrchestratorOptions = {}): UseDataOrchestratorReturn {
  const { autoInitialize = true, config } = options;
  
  const [orchestrator, setOrchestrator] = useState<DataOrchestrator | null>(null);
  const [status, setStatus] = useState<OrchestratorStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize orchestrator instance
  useEffect(() => {
    const instance = DataOrchestrator.getInstance(config);
    setOrchestrator(instance);

    // Setup event listeners
    const handleInitialized = () => {
      setIsLoading(false);
      setError(null);
      updateStatus(instance);
    };

    const handleError = (data: { error: any }) => {
      setIsLoading(false);
      setError(data.error?.message || 'Unknown error');
    };

    const handleDataUpdate = () => {
      updateStatus(instance);
    };

    instance.on('initialized', handleInitialized);
    instance.on('error', handleError);
    instance.on('data:update', handleDataUpdate);
    instance.on('provider:error', handleError);

    return () => {
      instance.off('initialized', handleInitialized);
      instance.off('error', handleError);
      instance.off('data:update', handleDataUpdate);
      instance.off('provider:error', handleError);
    };
  }, []);

  // Auto-initialize if enabled
  useEffect(() => {
    if (autoInitialize && orchestrator && !status?.isInitialized && !isLoading) {
      initialize();
    }
  }, [autoInitialize, orchestrator, status?.isInitialized, isLoading]);

  // Update status helper
  const updateStatus = useCallback((instance: DataOrchestrator) => {
    try {
      const currentStatus = instance.getStatus();
      setStatus(currentStatus);
    } catch (err) {
      console.error('Failed to get orchestrator status:', err);
    }
  }, []);

  // Initialize orchestrator
  const initialize = useCallback(async () => {
    if (!orchestrator || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await orchestrator.initialize();
      updateStatus(orchestrator);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Initialization failed';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [orchestrator, isLoading, updateStatus]);

  // Shutdown orchestrator
  const shutdown = useCallback(async () => {
    if (!orchestrator) return;

    try {
      await orchestrator.shutdown();
      updateStatus(orchestrator);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Shutdown failed';
      setError(errorMessage);
    }
  }, [orchestrator, updateStatus]);

  // Refresh specific provider
  const refreshProvider = useCallback(async (provider: 'fred' | 'binance') => {
    if (!orchestrator || !status?.isInitialized) return;

    try {
      await orchestrator.refreshProvider(provider);
      updateStatus(orchestrator);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Refresh failed';
      setError(errorMessage);
    }
  }, [orchestrator, status?.isInitialized, updateStatus]);

  return {
    orchestrator,
    status,
    isInitialized: status?.isInitialized || false,
    isLoading,
    error,
    initialize,
    shutdown,
    refreshProvider
  };
}