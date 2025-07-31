/**
 * Kalman Net Liquidity Hook - V6 Implementation
 * Hook for managing the KalmanNetLiquidityEngine with real data
 */

import { useState, useEffect, useCallback } from 'react';
import { KalmanNetLiquidityEngine } from '../engines/pillar1/KalmanNetLiquidityEngine';
import type { EngineReport, DashboardTileData } from '../types/engines';
import type { IntelligenceViewData } from '../types/intelligenceView';
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
      console.log('💧 Executing KalmanNetLiquidityEngine...');
      
      // Execute the engine
      const engineReport = await engine.execute();
      console.log('💧 Engine execution result:', { 
        success: engineReport.success, 
        hasData: !!engineReport.data,
        signal: engineReport.signal 
      });
      
      setReport(engineReport);
      
      if (engineReport.success && engineReport.data) {
        // Get dashboard data with real values from the engine report
        const dashboard: DashboardTileData = {
          title: 'Kalman Net Liquidity',
          primaryMetric: `$${engineReport.data.primaryMetric.value.toFixed(2)}T`,
          secondaryMetric: `${engineReport.data.subMetrics?.regime || 'TRANSITION'} • ${Math.round(engineReport.confidence)}%`,
          status: engineReport.signal === 'bullish' ? 'normal' : 
                 engineReport.signal === 'bearish' ? 'critical' : 'warning',
          trend: engineReport.data.primaryMetric.changePercent > 0 ? 'up' : 
                engineReport.data.primaryMetric.changePercent < 0 ? 'down' : 'neutral',
          color: engineReport.signal === 'bullish' ? 'success' : 
                engineReport.signal === 'bearish' ? 'critical' : 'neutral',
          loading: false
        };
        
        // Build intelligence view data from engine report
        const intelligence: IntelligenceViewData = {
          title: 'Kalman-Adaptive Net Liquidity Intelligence',
          status: engineReport.success ? 'active' : 'warning',
          primaryMetric: {
            label: 'Net Liquidity',
            value: `$${engineReport.data.primaryMetric.value.toFixed(2)}T`,
            color: engineReport.signal === 'bullish' ? 'teal' : 
                  engineReport.signal === 'bearish' ? 'orange' : 'default'
          },
          keyMetrics: [
            {
              label: 'Regime',
              value: engineReport.data.subMetrics?.regime || 'TRANSITION',
              status: engineReport.data.subMetrics?.regime === 'QE_ACTIVE' ? 'good' : 
                     engineReport.data.subMetrics?.regime === 'QT_ACTIVE' ? 'critical' : 'warning'
            },
            {
              label: 'Weekly Change',
              value: `$${(engineReport.data.subMetrics?.weeklyChange || 0).toFixed(0)}B`,
              status: (engineReport.data.subMetrics?.weeklyChange || 0) > 0 ? 'good' : 'warning'
            },
            {
              label: 'Fed Balance',
              value: `$${(engineReport.data.subMetrics?.fedBalance || 0).toFixed(1)}M`,
              status: 'good'
            },
            {
              label: 'Kalman Alpha',
              value: (engineReport.data.subMetrics?.kalmanAlpha || 1).toFixed(3),
              status: 'good'
            }
          ],
          insights: [
            engineReport.data.analysis || 'Liquidity analysis in progress...',
            engineReport.data.subMetrics?.stealthQE ? 'Stealth QE pattern detected' : 'Standard liquidity operations',
            engineReport.data.subMetrics?.december2022Pattern ? 'December 2022 pattern active' : 'No special patterns detected'
          ].filter(Boolean),
          lastUpdated: new Date()
        };
        
        // Create mock metrics structure for compatibility
        const mockMetrics: NetLiquidityMetrics = {
          total: engineReport.data.primaryMetric.value * 1000000000000,
          components: {
            fedBalanceSheet: {
              id: 'fed-balance-sheet',
              name: 'Fed Balance Sheet',
              value: (engineReport.data.subMetrics?.fedBalance || 0) * 1000000,
              weight: 1.0,
              confidence: engineReport.confidence / 100,
              trend: 'stable' as const,
              kalmanState: {
                estimate: engineReport.data.subMetrics?.fedBalance || 0,
                uncertainty: 0.01,
                lastUpdate: new Date()
              }
            },
            treasuryGeneralAccount: {
              id: 'treasury-general-account',
              name: 'Treasury General Account',
              value: (engineReport.data.subMetrics?.treasuryAccount || 0) * 1000000,
              weight: engineReport.data.subMetrics?.kalmanAlpha || 1.0,
              confidence: engineReport.confidence / 100,
              trend: 'stable' as const,
              kalmanState: {
                estimate: engineReport.data.subMetrics?.treasuryAccount || 0,
                uncertainty: 0.01,
                lastUpdate: new Date()
              }
            },
            reverseRepo: {
              id: 'reverse-repo-operations',
              name: 'Reverse Repo Operations',
              value: (engineReport.data.subMetrics?.reverseRepo || 0) * 1000000000,
              weight: 1.0,
              confidence: engineReport.confidence / 100,
              trend: 'stable' as const,
              kalmanState: {
                estimate: engineReport.data.subMetrics?.reverseRepo || 0,
                uncertainty: 0.01,
                lastUpdate: new Date()
              }
            },
            currencyInCirculation: {
              id: 'currency-in-circulation',
              name: 'Currency in Circulation',
              value: 0,
              weight: 0,
              confidence: 0,
              trend: 'stable' as const,
              kalmanState: {
                estimate: 0,
                uncertainty: 0,
                lastUpdate: new Date()
              }
            }
          },
          adaptiveSignal: {
            strength: engineReport.confidence / 100,
            direction: engineReport.signal === 'bullish' ? 'bullish' : 
                     engineReport.signal === 'bearish' ? 'bearish' : 'neutral',
            confidence: engineReport.confidence / 100,
            regime: engineReport.data.subMetrics?.regime === 'QE_ACTIVE' ? 'EXPANSION' :
                    engineReport.data.subMetrics?.regime === 'QT_ACTIVE' ? 'CONTRACTION' : 'TRANSITION'
          },
          kalmanMetrics: {
            overallConfidence: engineReport.confidence / 100,
            adaptationRate: 0.1,
            signalNoise: 0.05,
            convergenceStatus: 'converged' as const
          },
          lastCalculation: new Date()
        };
        
        setDashboardData(dashboard);
        setIntelligenceData(intelligence);
        setMetrics(mockMetrics);
      } else {
        // Handle failure case
        const errorDashboard: DashboardTileData = {
          title: 'Kalman Net Liquidity',
          primaryMetric: 'Error',
          secondaryMetric: 'Data unavailable',
          status: 'critical',
          trend: 'neutral',
          color: 'critical',
          loading: false
        };
        setDashboardData(errorDashboard);
        setError(engineReport.errors?.[0] || 'Engine execution failed');
      }
      
      setLastUpdated(new Date());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('💧 KalmanNetLiquidityEngine execution failed:', err);
    } finally {
      setIsLoading(false);
      console.log('💧 Kalman Net liquidity loaded:', { 
        loading: false, 
        hasMetrics: !!metrics, 
        error 
      });
    }
  }, [engine, isLoading, metrics, error]);

  const refresh = useCallback(async () => {
    await executeEngine();
  }, [executeEngine]);

  // Initial execution
  useEffect(() => {
    executeEngine();
  }, [executeEngine]);

  // Set up periodic refresh (30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        executeEngine();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [executeEngine, isLoading]);

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