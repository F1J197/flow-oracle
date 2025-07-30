/**
 * Unified Net Liquidity Hook - V6 Implementation
 * Hook for managing the UnifiedNetLiquidityEngine
 */

import { useState, useEffect, useCallback } from 'react';
import { UnifiedNetLiquidityEngine } from '../engines/unified/UnifiedNetLiquidityEngine';
import type { EngineReport, DashboardTileData, IntelligenceViewData } from '../types/engines';

interface UseUnifiedNetLiquidityReturn {
  // Data
  report: EngineReport | null;
  dashboardData: DashboardTileData | null;
  intelligenceData: IntelligenceViewData | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  executeEngine: () => Promise<void>;
  refresh: () => Promise<void>;
  
  // Engine instance (for advanced usage)
  engine: UnifiedNetLiquidityEngine;
}

export function useUnifiedNetLiquidity(): UseUnifiedNetLiquidityReturn {
  const [engine] = useState(() => new UnifiedNetLiquidityEngine());
  const [report, setReport] = useState<EngineReport | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardTileData | null>(null);
  const [intelligenceData, setIntelligenceData] = useState<IntelligenceViewData | null>(null);
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
      
      setDashboardData(dashboard);
      setIntelligenceData(intelligence);
      setLastUpdated(new Date());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('UnifiedNetLiquidityEngine execution failed:', err);
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
      console.log('Engine event:', event);
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
    isLoading,
    error,
    lastUpdated,
    executeEngine,
    refresh,
    engine
  };
}

export default useUnifiedNetLiquidity;