import { useState, useCallback, useRef } from "react";
import { DashboardTileData } from "@/types/engines";
import { useEngineStatus } from "./useEngineStatus";

interface DashboardDataState {
  dataIntegrity: DashboardTileData;
  netLiquidity: DashboardTileData;
  creditStressV6: DashboardTileData;
  enhancedZScore: DashboardTileData;
  enhancedMomentum: DashboardTileData;
  primaryDealerPositions: DashboardTileData;
  cusipStealthQE: DashboardTileData;
}

interface EngineManager {
  dataIntegrity: { getDashboardData: () => DashboardTileData };
  netLiquidity: { getDashboardData: () => DashboardTileData };
  creditStressV6: { getDashboardData: () => DashboardTileData };
  enhancedZScore: { getDashboardData: () => DashboardTileData };
  enhancedMomentum: { getDashboardData: () => DashboardTileData };
  primaryDealerPositions: { getDashboardData: () => DashboardTileData };
  cusipStealthQE: { getDashboardData: () => DashboardTileData };
}

export const useDashboardData = (engines: EngineManager) => {
  const { getEngineStatus, getOverallStatus } = useEngineStatus();
  const lastDataRef = useRef<DashboardDataState | null>(null);
  
  const [dashboardData, setDashboardData] = useState<DashboardDataState>({
    dataIntegrity: engines.dataIntegrity.getDashboardData(),
    netLiquidity: engines.netLiquidity.getDashboardData(),
    creditStressV6: engines.creditStressV6.getDashboardData(),
    enhancedZScore: engines.enhancedZScore.getDashboardData(),
    enhancedMomentum: engines.enhancedMomentum.getDashboardData(),
    primaryDealerPositions: engines.primaryDealerPositions.getDashboardData(),
    cusipStealthQE: engines.cusipStealthQE.getDashboardData(),
  });

  // Staggered update function
  const performUpdate = useCallback(() => {
    const overallStatus = getOverallStatus();
    
    // Create dashboard data with status-aware loading states
    const newData: DashboardDataState = {
      dataIntegrity: {
        ...engines.dataIntegrity.getDashboardData(),
        loading: getEngineStatus('data-integrity')?.status === 'loading'
      },
      netLiquidity: {
        ...engines.netLiquidity.getDashboardData(),
        loading: getEngineStatus('net-liquidity')?.status === 'loading'
      },
      creditStressV6: {
        ...engines.creditStressV6.getDashboardData(),
        loading: getEngineStatus('credit-stress')?.status === 'loading'
      },
      enhancedZScore: {
        ...engines.enhancedZScore.getDashboardData(),
        loading: getEngineStatus('enhanced-zscore')?.status === 'loading'
      },
      enhancedMomentum: {
        ...engines.enhancedMomentum.getDashboardData(),
        loading: getEngineStatus('enhanced-momentum')?.status === 'loading'
      },
      primaryDealerPositions: {
        ...engines.primaryDealerPositions.getDashboardData(),
        loading: getEngineStatus('primary-dealer-positions')?.status === 'loading'
      },
      cusipStealthQE: {
        ...engines.cusipStealthQE.getDashboardData(),
        loading: getEngineStatus('cusip-stealth-qe')?.status === 'loading'
      }
    };

    // Show error state for failed engines
    const engineMap = {
      'data-integrity': 'dataIntegrity',
      'net-liquidity': 'netLiquidity',
      'credit-stress': 'creditStressV6',
      'enhanced-zscore': 'enhancedZScore',
      'enhanced-momentum': 'enhancedMomentum',
      'primary-dealer-positions': 'primaryDealerPositions',
      'cusip-stealth-qe': 'cusipStealthQE'
    } as const;

    Object.entries(engineMap).forEach(([engineId, dataKey]) => {
      const status = getEngineStatus(engineId);
      if (status?.status === 'error' || status?.status === 'timeout') {
        newData[dataKey] = {
          ...newData[dataKey],
          status: 'critical',
          primaryMetric: 'ERROR',
          secondaryMetric: status.lastError || 'Engine failed',
          loading: false
        };
      }
    });

    // Only update if data has meaningfully changed
    if (!lastDataRef.current || hasSignificantChange(lastDataRef.current, newData)) {
      setDashboardData(newData);
      lastDataRef.current = newData;
    }
  }, [engines, getEngineStatus, getOverallStatus]);

  // Helper function to detect significant changes
  const hasSignificantChange = (oldData: DashboardDataState, newData: DashboardDataState): boolean => {
    const keys = Object.keys(oldData) as (keyof DashboardDataState)[];
    return keys.some(key => {
      const oldItem = oldData[key];
      const newItem = newData[key];
      
      // Check for status changes
      if (oldItem.status !== newItem.status) return true;
      
      // Check for loading state changes
      if (oldItem.loading !== newItem.loading) return true;
      
      // Check for significant metric changes (if numeric)
      if (typeof oldItem.primaryMetric === 'string' && typeof newItem.primaryMetric === 'string') {
        const oldNum = parseFloat(oldItem.primaryMetric.replace(/[^0-9.-]/g, ''));
        const newNum = parseFloat(newItem.primaryMetric.replace(/[^0-9.-]/g, ''));
        
        if (!isNaN(oldNum) && !isNaN(newNum)) {
          const percentChange = Math.abs((newNum - oldNum) / oldNum);
          return percentChange > 0.02; // 2% threshold
        }
      }
      
      return oldItem.primaryMetric !== newItem.primaryMetric;
    });
  };

  const updateDashboardData = useCallback(() => {
    performUpdate();
  }, [performUpdate]);

  return {
    dashboardData,
    updateDashboardData,
    getOverallStatus,
  };
};