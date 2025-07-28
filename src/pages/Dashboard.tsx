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
import { SystemStatusFooter } from "@/components/dashboard/SystemStatusFooter";

export const Dashboard = () => {
  const { engines, initializeEngines, executeEngines, cleanupEngines } = useEngineManager();
  const { dashboardData, updateDashboardData } = useDashboardData(engines);
  const { loading } = usePeriodicUpdates({
    initializeEngines,
    executeEngines,
    updateDashboardData,
    cleanupEngines,
  });

  return (
    <DashboardGrid>
      {/* Net Liquidity - Featured Tile */}
      <NetLiquidityTile data={dashboardData.netLiquidity} loading={loading} />

      {/* Primary Action Tile */}
      <PrimaryActionTile loading={loading} />

      {/* Data Integrity */}
      <DashboardTile data={dashboardData.dataIntegrity} loading={loading} />

      {/* Credit Stress V6 - Enhanced */}
      <CreditStressTile data={dashboardData.creditStressV6} loading={loading} />

      {/* Network Security Valuation */}
      <NetworkSecurityTile loading={loading} />

      {/* On-Chain Dynamics */}
      <OnChainDynamicsTile loading={loading} />

      {/* Enhanced Momentum V6 */}
      <DashboardTile data={dashboardData.enhancedMomentum} loading={loading} />

      {/* Enhanced Z-Score Analysis */}
      <DashboardTile data={dashboardData.enhancedZScore} loading={loading} />

      {/* Business Cycle */}
      <BusinessCycleTile loading={loading} />

      {/* Temporal Analysis */}
      <TemporalAnalysisTile loading={loading} />

      {/* System Status Footer */}
      <SystemStatusFooter />
    </DashboardGrid>
  );
};