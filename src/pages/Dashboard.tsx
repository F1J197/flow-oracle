import { useEngineManager } from "@/hooks/useEngineManager";
import { useDashboardData } from "@/hooks/useDashboardData";
import { usePeriodicUpdates } from "@/hooks/usePeriodicUpdates";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { DashboardTile } from "@/components/dashboard/DashboardTile";
import { NetLiquidityTile } from "@/components/dashboard/NetLiquidityTile";
import { CreditStressTile } from "@/components/dashboard/CreditStressTile";
import { PrimaryActionTile } from "@/components/dashboard/PrimaryActionTile";
import { NetworkSecurityTile } from "@/components/dashboard/NetworkSecurityTile";
import { OnChainDynamicsTile } from "@/components/dashboard/OnChainDynamicsTile";
import { BusinessCycleTile } from "@/components/dashboard/BusinessCycleTile";
import { TemporalAnalysisTile } from "@/components/dashboard/TemporalAnalysisTile";
import { PrimaryDealerPositionsTile } from "@/components/dashboard/PrimaryDealerPositionsTile";
import { SystemStatusFooter } from "@/components/dashboard/SystemStatusFooter";

export const Dashboard = () => {
  const { engines, initializeEngines, executeEngines, cleanupEngines } = useEngineManager();
  const { dashboardData, updateDashboardData, getOverallStatus } = useDashboardData(engines);
  const { loading, overallStatus } = usePeriodicUpdates({
    initializeEngines,
    executeEngines,
    updateDashboardData,
    cleanupEngines,
  });

  // Use individual tile loading states instead of global loading
  const globalLoading = loading && overallStatus.successCount === 0;

  return (
    <DashboardGrid>
      {/* Net Liquidity - Featured Tile */}
      <NetLiquidityTile data={dashboardData.netLiquidity} />

      {/* Primary Action Tile */}
      <PrimaryActionTile loading={globalLoading} />

      {/* Data Integrity */}
      <DashboardTile data={dashboardData.dataIntegrity} />

      {/* Credit Stress V6 - Enhanced */}
      <CreditStressTile data={dashboardData.creditStressV6} />

      {/* Network Security Valuation */}
      <NetworkSecurityTile loading={globalLoading} />

      {/* On-Chain Dynamics */}
      <OnChainDynamicsTile loading={globalLoading} />

      {/* Enhanced Momentum V6 */}
      <DashboardTile data={dashboardData.enhancedMomentum} />

      {/* Enhanced Z-Score Analysis */}
      <DashboardTile data={dashboardData.enhancedZScore} />

      {/* Primary Dealer Positions */}
      <PrimaryDealerPositionsTile data={dashboardData.primaryDealerPositions} />

      {/* Business Cycle */}
      <BusinessCycleTile loading={loading} />

      {/* Temporal Analysis */}
      <TemporalAnalysisTile loading={loading} />

      {/* System Status Footer */}
      <SystemStatusFooter />
    </DashboardGrid>
  );
};