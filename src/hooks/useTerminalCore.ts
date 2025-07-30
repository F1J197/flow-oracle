/**
 * Terminal Core Hook
 * Central state management for the LIQUIDITY² terminal
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { CONFIG } from '@/config';
import EngineOrchestrationService, { OrchestrationState } from '@/services/EngineOrchestrationService';
import { EngineRegistry } from '@/engines/EngineRegistry';

export interface TerminalState {
  isOnline: boolean;
  lastRefresh: Date | null;
  netLiquidity: number;
  regime: 'EXPANSION' | 'CONTRACTION' | 'TRANSITION' | 'UNKNOWN';
  criticalAlerts: number;
  systemHealth: 'healthy' | 'degraded' | 'critical';
}

export interface TerminalActions {
  refreshAll: () => Promise<void>;
  refreshEngine: (engineId: string) => Promise<void>;
  toggleAutoRefresh: () => void;
  setRefreshInterval: (interval: number) => void;
}

export function useTerminalCore() {
  const [state, setState] = useState<TerminalState>({
    isOnline: true,
    lastRefresh: null,
    netLiquidity: 5.626e12, // $5.626T default
    regime: 'UNKNOWN',
    criticalAlerts: 0,
    systemHealth: 'healthy'
  });

  const [orchestrationState, setOrchestrationState] = useState<OrchestrationState>({
    status: 'idle',
    isExecuting: false,
    currentTier: '',
    totalEngines: 0,
    completedEngines: 0,
    failedEngines: 0,
    runningEngines: 0,
    results: new Map(),
    errors: []
  });

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshIntervalState] = useState<number>(CONFIG.APP.REFRESH_INTERVAL);
  const orchestrationService = useRef(EngineOrchestrationService.getInstance());
  const registry = useRef(EngineRegistry.getInstance());
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to orchestration state changes
  useEffect(() => {
    const unsubscribe = orchestrationService.current.subscribe(setOrchestrationState);
    return unsubscribe;
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshTimer.current = setInterval(() => {
        refreshAll();
      }, refreshInterval);

      return () => {
        if (refreshTimer.current) {
          clearInterval(refreshTimer.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval]);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isOnline: true }));
      
      const results = await orchestrationService.current.executeFullPipeline();
      
      // Process results to update terminal state
      let netLiquidity = 5.626e12; // Default
      let regime: TerminalState['regime'] = 'UNKNOWN';
      let criticalAlerts = 0;
      let systemHealth: TerminalState['systemHealth'] = 'healthy';

      // Extract key metrics from engine results
      for (const [engineId, result] of results) {
        if (engineId === 'net-liquidity' && result.success) {
          netLiquidity = result.data?.netLiquidity || netLiquidity;
        }
        
        if (engineId === 'data-integrity' && result.success) {
          const integrityScore = result.data?.integrityScore || 100;
          if (integrityScore < 50) systemHealth = 'critical';
          else if (integrityScore < 75) systemHealth = 'degraded';
        }

        // Count critical alerts
        if (!result.success || (result.confidence && result.confidence < 30)) {
          criticalAlerts++;
        }
      }

      // Determine regime based on net liquidity trends
      if (netLiquidity > 6e12) regime = 'EXPANSION';
      else if (netLiquidity < 4e12) regime = 'CONTRACTION';
      else regime = 'TRANSITION';

      setState(prev => ({
        ...prev,
        lastRefresh: new Date(),
        netLiquidity,
        regime,
        criticalAlerts,
        systemHealth
      }));

    } catch (error) {
      console.error('Terminal refresh failed:', error);
      setState(prev => ({
        ...prev,
        isOnline: false,
        systemHealth: 'critical'
      }));
    }
  }, []);

  const refreshEngine = useCallback(async (engineId: string) => {
    try {
      await orchestrationService.current.executeEngine(engineId);
      setState(prev => ({ ...prev, lastRefresh: new Date() }));
    } catch (error) {
      console.error(`Engine ${engineId} refresh failed:`, error);
    }
  }, []);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  const setRefreshInterval = useCallback((interval: number) => {
    setRefreshIntervalState(interval);
  }, []);

  const actions: TerminalActions = {
    refreshAll,
    refreshEngine,
    toggleAutoRefresh,
    setRefreshInterval
  };

  return {
    state,
    orchestrationState,
    actions,
    autoRefresh,
    refreshInterval,
    // Helper functions
    getSystemStatus: () => {
      if (!state.isOnline) return 'OFFLINE';
      if (state.systemHealth === 'critical') return 'CRITICAL';
      if (state.systemHealth === 'degraded') return 'DEGRADED';
      if (orchestrationState.isExecuting) return 'UPDATING';
      return 'ONLINE';
    },
    getNetLiquidityFormatted: () => {
      return `$${(state.netLiquidity / 1e12).toFixed(3)}T`;
    },
    getDataAge: () => {
      if (!state.lastRefresh) return 'Never';
      const seconds = Math.floor((Date.now() - state.lastRefresh.getTime()) / 1000);
      if (seconds < 60) return `${seconds}s ago`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      return `${Math.floor(seconds / 3600)}h ago`;
    },
    getHealthColor: () => {
      switch (state.systemHealth) {
        case 'critical': return 'critical';
        case 'degraded': return 'warning';
        default: return 'success';
      }
    }
  };
}