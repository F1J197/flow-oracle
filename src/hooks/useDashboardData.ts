import { useState, useCallback } from "react";
import { DashboardTileData } from "@/types/engines";
import { useEngineStatus } from "./useEngineStatus";

interface DashboardDataState {
  dataIntegrity: DashboardTileData;
  netLiquidity: DashboardTileData;
  creditStressV6: DashboardTileData;
  enhancedZScore: DashboardTileData;
  enhancedMomentum: DashboardTileData;
  primaryDealerPositions: DashboardTileData;
}

interface EngineManager {
  dataIntegrity: { getDashboardData: () => DashboardTileData };
  netLiquidity: { getDashboardData: () => DashboardTileData };
  creditStressV6: { getDashboardData: () => DashboardTileData };
  enhancedZScore: { getDashboardData: () => DashboardTileData };
  enhancedMomentum: { getDashboardData: () => DashboardTileData };
  primaryDealerPositions: { getDashboardData: () => DashboardTileData };
}

export const useDashboardData = (engines: EngineManager) => {
  const { getEngineStatus, getOverallStatus } = useEngineStatus();
  
  const [dashboardData, setDashboardData] = useState<DashboardDataState>({
    dataIntegrity: engines.dataIntegrity.getDashboardData(),
    netLiquidity: engines.netLiquidity.getDashboardData(),
    creditStressV6: engines.creditStressV6.getDashboardData(),
    enhancedZScore: engines.enhancedZScore.getDashboardData(),
    enhancedMomentum: engines.enhancedMomentum.getDashboardData(),
    primaryDealerPositions: engines.primaryDealerPositions.getDashboardData(),
  });

  const updateDashboardData = useCallback(() => {
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
      }
    };

    // Show error state for failed engines
    const engineMap = {
      'data-integrity': 'dataIntegrity',
      'net-liquidity': 'netLiquidity',
      'credit-stress': 'creditStressV6',
      'enhanced-zscore': 'enhancedZScore',
      'enhanced-momentum': 'enhancedMomentum',
      'primary-dealer-positions': 'primaryDealerPositions'
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

    setDashboardData(newData);
  }, [engines, getEngineStatus, getOverallStatus]);

  return {
    dashboardData,
    updateDashboardData,
    getOverallStatus,
  };
};