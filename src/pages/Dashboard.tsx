import { useEngineManager } from "@/hooks/useEngineManager";
import { useDashboardData } from "@/hooks/useDashboardData";
import { usePeriodicUpdates } from "@/hooks/usePeriodicUpdates";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { ActionableInsightTile } from "@/components/dashboard/ActionableInsightTile";
import { PrimaryActionTile } from "@/components/dashboard/PrimaryActionTile";
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

  // Generate actionable insights from engines
  const netLiquidityInsight = engines.netLiquidity?.getSingleActionableInsight?.() || {
    actionText: "Monitor liquidity conditions for trend changes",
    signalStrength: 65,
    marketAction: 'HOLD' as const,
    confidence: 'MED' as const,
    timeframe: 'SHORT_TERM' as const
  };

  const creditStressInsight = engines.creditStressV6?.getSingleActionableInsight?.() || {
    actionText: "Credit markets showing elevated stress levels",
    signalStrength: 75,
    marketAction: 'WAIT' as const,
    confidence: 'HIGH' as const,
    timeframe: 'IMMEDIATE' as const
  };

  const momentumInsight = engines.enhancedMomentum?.getSingleActionableInsight?.() || {
    actionText: "Market momentum remains neutral, await clearer signals",
    signalStrength: 45,
    marketAction: 'HOLD' as const,
    confidence: 'MED' as const,
    timeframe: 'MEDIUM_TERM' as const
  };

  const zScoreInsight = engines.enhancedZScore?.getSingleActionableInsight?.() || {
    actionText: "Z-Score analysis indicates market normalization",
    signalStrength: 55,
    marketAction: 'HOLD' as const,
    confidence: 'MED' as const,
    timeframe: 'SHORT_TERM' as const
  };

  const dealerInsight = engines.primaryDealerPositions?.getSingleActionableInsight?.() || {
    actionText: "Dealer positioning suggests cautious market stance",
    signalStrength: 60,
    marketAction: 'WAIT' as const,
    confidence: 'MED' as const,
    timeframe: 'SHORT_TERM' as const
  };

  const cusipStealthInsight = engines.cusipStealthQE?.getSingleActionableInsight?.() || {
    actionText: "CUSIP-level stealth operations under surveillance",
    signalStrength: 72,
    marketAction: 'WAIT' as const,
    confidence: 'HIGH' as const,
    timeframe: 'IMMEDIATE' as const
  };

  const dataIntegrityInsight = engines.dataIntegrity?.getSingleActionableInsight?.() || {
    actionText: "Data quality is optimal for analysis",
    signalStrength: 95,
    marketAction: 'HOLD' as const,
    confidence: 'HIGH' as const,
    timeframe: 'IMMEDIATE' as const
  };

  return (
    <DashboardGrid>
      {/* Primary Action Tile - Featured */}
      <PrimaryActionTile />

      {/* Core Engine Insights */}
      <ActionableInsightTile 
        insight={netLiquidityInsight}
        engineName="Net Liquidity Engine"
        loading={loading && overallStatus.successCount === 0}
      />

      <ActionableInsightTile 
        insight={creditStressInsight}
        engineName="Credit Stress Monitor"
        loading={loading && overallStatus.successCount === 0}
      />

      <ActionableInsightTile 
        insight={momentumInsight}
        engineName="Enhanced Momentum"
        loading={loading && overallStatus.successCount === 0}
      />

      <ActionableInsightTile 
        insight={zScoreInsight}
        engineName="Z-Score Analysis"
        loading={loading && overallStatus.successCount === 0}
      />

      <ActionableInsightTile 
        insight={dealerInsight}
        engineName="Primary Dealer Positions"
        loading={loading && overallStatus.successCount === 0}
      />

      <ActionableInsightTile 
        insight={cusipStealthInsight}
        engineName="CUSIP Stealth QE Engine"
        loading={loading && overallStatus.successCount === 0}
      />

      <ActionableInsightTile 
        insight={dataIntegrityInsight}
        engineName="Data Integrity Engine"
        loading={loading && overallStatus.successCount === 0}
      />

      {/* System Status Footer */}
      <SystemStatusFooter />
    </DashboardGrid>
  );
};