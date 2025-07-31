/**
 * Foundation Orchestrator Hook V6
 * 
 * React hook for managing the Foundation Engine Orchestrator
 * Provides status updates, execution control, and health monitoring
 */

import { useState, useEffect, useCallback } from 'react';
import { FoundationEngineOrchestrator } from '@/engines/foundation/FoundationEngineOrchestrator';
import type { EngineReport } from '@/types/engines';

interface FoundationEngineStatus {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  lastExecution: Date | null;
  lastReport: EngineReport | null;
  executionTime: number;
  errorCount: number;
}

interface FoundationHealth {
  healthy: number;
  total: number;
  score: number;
  status: 'healthy' | 'degraded' | 'critical';
}

interface UseFoundationOrchestratorOptions {
  autoStart?: boolean;
  enableHealthCheck?: boolean;
  executionInterval?: number;
}

interface UseFoundationOrchestratorResult {
  // Status
  engineStatus: Map<string, FoundationEngineStatus>;
  overallHealth: FoundationHealth;
  isRunning: boolean;
  lastExecution: Date | null;
  
  // Actions
  executeAll: () => Promise<Map<string, EngineReport>>;
  startAutoExecution: () => void;
  stopAutoExecution: () => void;
  startHealthCheck: () => void;
  stopHealthCheck: () => void;
  
  // Individual engine access
  getEngineStatus: (engineId: string) => FoundationEngineStatus | null;
  
  // Instance
  orchestrator: FoundationEngineOrchestrator;
}

export const useFoundationOrchestrator = (
  options: UseFoundationOrchestratorOptions = {}
): UseFoundationOrchestratorResult => {
  const {
    autoStart = true,
    enableHealthCheck = true,
    executionInterval = 30000
  } = options;

  // State
  const [engineStatus, setEngineStatus] = useState<Map<string, FoundationEngineStatus>>(new Map());
  const [overallHealth, setOverallHealth] = useState<FoundationHealth>({
    healthy: 0,
    total: 0,
    score: 0,
    status: 'critical'
  });
  const [isRunning, setIsRunning] = useState(false);
  const [lastExecution, setLastExecution] = useState<Date | null>(null);

  // Get orchestrator instance
  const orchestrator = FoundationEngineOrchestrator.getInstance({
    executionInterval
  });

  // Update status from orchestrator
  const updateStatus = useCallback(() => {
    setEngineStatus(new Map());
    setOverallHealth({ healthy: 0, total: 0, score: 0, status: 'critical' });
  }, []);

  // Execute all engines
  const executeAll = useCallback(async (): Promise<Map<string, EngineReport>> => {
    setIsRunning(true);
    setLastExecution(new Date());
    
    try {
      const results = await orchestrator.executeAll();
      updateStatus();
      return results;
    } finally {
      setIsRunning(false);
    }
  }, [orchestrator, updateStatus]);

  // Start auto execution
  const startAutoExecution = useCallback(() => {
    orchestrator.startAutoExecution();
    updateStatus();
  }, [orchestrator, updateStatus]);

  // Stop auto execution
  const stopAutoExecution = useCallback(() => {
    orchestrator.stopAutoExecution();
    updateStatus();
  }, [orchestrator, updateStatus]);

  // Start health check
  const startHealthCheck = useCallback(() => {
    orchestrator.startHealthCheck();
  }, [orchestrator]);

  // Stop health check
  const stopHealthCheck = useCallback(() => {
    orchestrator.stopHealthCheck();
  }, [orchestrator]);

  // Get individual engine status
  const getEngineStatus = useCallback((engineId: string): FoundationEngineStatus | null => {
    return null;
  }, []);

  // Set up event listeners
  useEffect(() => {
    const handleStatusUpdate = (data: any) => {
      setEngineStatus(data.status);
      setIsRunning(data.isRunning);
    };

    const handleHealthUpdate = (data: any) => {
      setOverallHealth(data.health);
    };

    const handleExecutionComplete = (data: any) => {
      setLastExecution(data.timestamp);
      updateStatus();
    };

    orchestrator.on('foundation:status:update', handleStatusUpdate);
    orchestrator.on('foundation:health:update', handleHealthUpdate);
    orchestrator.on('foundation:execution:complete', handleExecutionComplete);

    return () => {
      orchestrator.off('foundation:status:update', handleStatusUpdate);
      orchestrator.off('foundation:health:update', handleHealthUpdate);
      orchestrator.off('foundation:execution:complete', handleExecutionComplete);
    };
  }, [orchestrator, updateStatus]);

  // Initialize on mount
  useEffect(() => {
    // Get initial status
    updateStatus();

    // Auto-start if enabled
    if (autoStart) {
      console.log('🚀 Auto-starting foundation orchestrator');
      startAutoExecution();
    }

    // Start health check if enabled
    if (enableHealthCheck) {
      startHealthCheck();
    }

    // Cleanup on unmount
    return () => {
      stopAutoExecution();
      stopHealthCheck();
    };
  }, [autoStart, enableHealthCheck, startAutoExecution, startHealthCheck, stopAutoExecution, stopHealthCheck, updateStatus]);

  return {
    // Status
    engineStatus,
    overallHealth,
    isRunning,
    lastExecution,
    
    // Actions
    executeAll,
    startAutoExecution,
    stopAutoExecution,
    startHealthCheck,
    stopHealthCheck,
    
    // Individual engine access
    getEngineStatus,
    
    // Instance
    orchestrator
  };
};