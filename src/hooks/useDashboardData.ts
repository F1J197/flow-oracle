import { useState, useCallback } from "react";
import { DashboardTileData } from "@/types/engines";

interface DashboardDataState {
  dataIntegrity: DashboardTileData;
  netLiquidity: DashboardTileData;
  creditStressV6: DashboardTileData;
  enhancedZScore: DashboardTileData;
  enhancedMomentum: DashboardTileData;
}

interface EngineManager {
  dataIntegrity: { getDashboardData: () => DashboardTileData };
  netLiquidity: { getDashboardData: () => DashboardTileData };
  creditStressV6: { getDashboardData: () => DashboardTileData };
  enhancedZScore: { getDashboardData: () => DashboardTileData };
  enhancedMomentum: { getDashboardData: () => DashboardTileData };
}

export const useDashboardData = (engines: EngineManager) => {
  const [dashboardData, setDashboardData] = useState<DashboardDataState>({
    dataIntegrity: engines.dataIntegrity.getDashboardData(),
    netLiquidity: engines.netLiquidity.getDashboardData(),
    creditStressV6: engines.creditStressV6.getDashboardData(),
    enhancedZScore: engines.enhancedZScore.getDashboardData(),
    enhancedMomentum: engines.enhancedMomentum.getDashboardData(),
  });

  const updateDashboardData = useCallback(() => {
    setDashboardData({
      dataIntegrity: engines.dataIntegrity.getDashboardData(),
      netLiquidity: engines.netLiquidity.getDashboardData(),
      creditStressV6: engines.creditStressV6.getDashboardData(),
      enhancedZScore: engines.enhancedZScore.getDashboardData(),
      enhancedMomentum: engines.enhancedMomentum.getDashboardData(),
    });
  }, [engines]);

  return {
    dashboardData,
    updateDashboardData,
  };
};