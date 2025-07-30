import { useState, useEffect } from 'react';
import { useEngineRegistryContext } from '@/components/engines/EngineRegistryProvider';
import { GlobalFinancialPlumbingEngine } from '@/engines/pillar1/GlobalFinancialPlumbingEngine';
import { DashboardTileData, IntelligenceViewData, ActionableInsight } from '@/types/engines';

interface GlobalPlumbingEngineState {
  dashboardData: DashboardTileData | null;
  intelligenceData: IntelligenceViewData | null;
  actionableInsight: ActionableInsight | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useGlobalPlumbingEngine = (options: { autoRefresh?: boolean; refreshInterval?: number } = {}) => {
  const { autoRefresh = true, refreshInterval = 15000 } = options;
  const { unifiedRegistry } = useEngineRegistryContext();
  const [state, setState] = useState<GlobalPlumbingEngineState>({
    dashboardData: null,
    intelligenceData: null,
    actionableInsight: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const engine = unifiedRegistry.getEngine('global-financial-plumbing') as GlobalFinancialPlumbingEngine;

  const fetchData = async () => {
    if (!engine) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Global Financial Plumbing Engine not found'
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Execute the engine
      await unifiedRegistry.executeEngine('global-financial-plumbing');
      
      // Get all data formats
      const dashboardData = engine.getDashboardData();
      const intelligenceData = engine.getIntelligenceView();
      const actionableInsight = engine.getSingleActionableInsight();

      setState(prev => ({
        ...prev,
        dashboardData,
        intelligenceData,
        actionableInsight,
        loading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('[useGlobalPlumbingEngine] Failed to fetch data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  // Subscribe to engine events
  useEffect(() => {
    if (!engine) return;

    const unsubscribe = unifiedRegistry.subscribe('global-financial-plumbing', (data) => {
      console.log('🔄 Global Plumbing Engine data updated:', data);
      
      // Update state with fresh data
      const dashboardData = engine.getDashboardData();
      const intelligenceData = engine.getIntelligenceView();
      const actionableInsight = engine.getSingleActionableInsight();

      setState(prev => ({
        ...prev,
        dashboardData,
        intelligenceData,
        actionableInsight,
        lastUpdated: new Date()
      }));
    });

    return unsubscribe;
  }, [engine, unifiedRegistry]);

  // Auto-refresh functionality
  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const refresh = () => {
    fetchData();
  };

  const getPlumbingEfficiency = () => {
    return state.intelligenceData?.primaryMetrics?.efficiency?.value || 'N/A';
  };

  const getSystemicRisk = () => {
    return state.intelligenceData?.primaryMetrics?.systemicRisk?.value || 'N/A';
  };

  const getRiskLevel = () => {
    const risk = String(state.intelligenceData?.primaryMetrics?.systemicRisk?.value || '').toLowerCase();
    if (risk === 'critical') return 4;
    if (risk === 'high') return 3;
    if (risk === 'moderate') return 2;
    return 1;
  };

  return {
    ...state,
    engine,
    refresh,
    
    // Convenience accessors
    efficiency: getPlumbingEfficiency(),
    systemicRisk: getSystemicRisk(),
    riskLevel: getRiskLevel(),
    
    // Status indicators
    isHealthy: getRiskLevel() <= 2,
    isStressed: getRiskLevel() === 3,
    isCritical: getRiskLevel() === 4,
    
    // Trend information
    trend: state.dashboardData?.trend || 'neutral'
  };
};