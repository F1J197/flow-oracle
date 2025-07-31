/**
 * Kalman Net Liquidity Hook - V6 Implementation
 * Hook for managing the KalmanNetLiquidityEngine
 */

import { useState, useEffect, useCallback } from 'react';
import { KalmanNetLiquidityEngine } from '../engines/pillar1/KalmanNetLiquidityEngine';
import type { EngineReport, DashboardTileData, IntelligenceViewData } from '../types/engines';
import type { NetLiquidityMetrics } from '../engines/pillar1/KalmanNetLiquidityEngine/types';

interface UseKalmanNetLiquidityReturn {
  // Data
  report: EngineReport | null;
  dashboardData: DashboardTileData | null;
  intelligenceData: IntelligenceViewData | null;
  metrics: NetLiquidityMetrics | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  executeEngine: () => Promise<void>;
  refresh: () => Promise<void>;
  
  // Engine instance (for advanced usage)
  engine: KalmanNetLiquidityEngine;
}

export function useKalmanNetLiquidity(): UseKalmanNetLiquidityReturn {
  const [engine] = useState(() => new KalmanNetLiquidityEngine());
  const [report, setReport] = useState<EngineReport | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardTileData | null>(null);
  const [intelligenceData, setIntelligenceData] = useState<IntelligenceViewData | null>(null);
  const [metrics, setMetrics] = useState<NetLiquidityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const executeEngine = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Execute the engine
      const engineReport = await engine.execute();
      setReport(engineReport);
      
      // Get dashboard and intelligence data
      const dashboard = engine.getDashboardData();
      const intelligence = engine.getIntelligenceView();
      // Note: Engine now uses BaseEngine interface, metrics integrated into dashboard data
      
      setDashboardData(dashboard);
      setIntelligenceData(intelligence);
      // Remove setMetrics since getNetLiquidityMetrics doesn't exist in spec-compliant version
      setLastUpdated(new Date());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('KalmanNetLiquidityEngine execution failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [engine, isLoading]);

  const refresh = useCallback(async () => {
    await executeEngine();
  }, [executeEngine]);

  // Initial execution
  useEffect(() => {
    executeEngine();
  }, [executeEngine]);

  // Set up periodic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        executeEngine();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [executeEngine, isLoading]);

  // Engine event listeners
  useEffect(() => {
    const handleEngineEvent = (event: any) => {
      console.log('Kalman Engine event:', event);
    };

    // Subscribe to engine events if available
    if ('on' in engine && typeof engine.on === 'function') {
      engine.on('execution:success', handleEngineEvent);
      engine.on('execution:error', handleEngineEvent);
      
      return () => {
        if ('off' in engine && typeof engine.off === 'function') {
          engine.off('execution:success', handleEngineEvent);
          engine.off('execution:error', handleEngineEvent);
        }
      };
    }
  }, [engine]);

  return {
    report,
    dashboardData,
    intelligenceData,
    metrics,
    isLoading,
    error,
    lastUpdated,
    executeEngine,
    refresh,
    engine
  };
}

export default useKalmanNetLiquidity;