import { useUnifiedDashboard } from "@/hooks/useUnifiedDashboard";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { ActionableInsightTile } from "@/components/dashboard/ActionableInsightTile";
import { PrimaryActionTile } from "@/components/dashboard/PrimaryActionTile";
import { PrimaryDealerIntelligenceTile } from "@/components/intelligence/PrimaryDealerIntelligenceTile";
import { SystemStatusFooter } from "@/components/dashboard/SystemStatusFooter";
import { StaticTileWrapper } from "@/components/dashboard/StaticTileWrapper";

export const Dashboard = () => {
  const {
    dashboardData,
    loading,
    error,
    stats,
    overallStatus,
    systemHealth,
    refreshData
  } = useUnifiedDashboard({
    autoRefresh: true,
    refreshInterval: 15000
  });

  // Transform tile data to actionable insights
  const createInsightFromTile = (tileData: any, engineName: string) => {
    if (!tileData) return null;

    const signalStrength = tileData.trend === 'up' ? 75 : 
                          tileData.trend === 'down' ? 65 : 50;
    
    const marketAction = tileData.status === 'critical' ? 'WAIT' :
                        tileData.trend === 'up' ? 'BUY' :
                        tileData.trend === 'down' ? 'SELL' : 'HOLD';

    const confidence = tileData.status === 'critical' ? 'LOW' as const : 
                      tileData.status === 'warning' ? 'MED' as const : 'HIGH' as const;

    return {
      actionText: tileData.actionText || `${engineName} analysis: ${tileData.primaryMetric}`,
      signalStrength,
      marketAction: marketAction as 'BUY' | 'SELL' | 'HOLD' | 'WAIT',
      confidence,
      timeframe: 'SHORT_TERM' as const
    };
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-400 mb-2">Dashboard Error</h2>
          <p className="text-red-300">{error}</p>
          <button 
            onClick={refreshData}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardGrid>
      {/* Primary Action Tile - Featured */}
      <PrimaryActionTile />

      {/* Core Engine Insights from Unified Data Layer */}
      {dashboardData?.netLiquidity && (
        <StaticTileWrapper>
          <ActionableInsightTile 
            insight={createInsightFromTile(dashboardData.netLiquidity, "Net Liquidity Engine")}
            engineName="Net Liquidity Engine"
            loading={loading}
          />
        </StaticTileWrapper>
      )}

      {dashboardData?.creditStress && (
        <StaticTileWrapper>
          <ActionableInsightTile 
            insight={createInsightFromTile(dashboardData.creditStress, "Credit Stress Monitor")}
            engineName="Credit Stress Monitor"
            loading={loading}
          />
        </StaticTileWrapper>
      )}

      {dashboardData?.momentum && (
        <StaticTileWrapper>
          <ActionableInsightTile 
            insight={createInsightFromTile(dashboardData.momentum, "Enhanced Momentum")}
            engineName="Enhanced Momentum"
            loading={loading}
          />
        </StaticTileWrapper>
      )}

      {dashboardData?.zScore && (
        <StaticTileWrapper>
          <ActionableInsightTile 
            insight={createInsightFromTile(dashboardData.zScore, "Z-Score Analysis")}
            engineName="Z-Score Analysis"
            loading={loading}
          />
        </StaticTileWrapper>
      )}

      {/* Primary Dealer Intelligence Tile */}
      <StaticTileWrapper>
        <PrimaryDealerIntelligenceTile 
          loading={loading}
        />
      </StaticTileWrapper>

      {dashboardData?.cusipStealth && (
        <StaticTileWrapper>
          <ActionableInsightTile 
            insight={createInsightFromTile(dashboardData.cusipStealth, "CUSIP Stealth QE Engine")}
            engineName="CUSIP Stealth QE Engine"
            loading={loading}
          />
        </StaticTileWrapper>
      )}

      {dashboardData?.dataIntegrity && (
        <StaticTileWrapper>
          <ActionableInsightTile 
            insight={createInsightFromTile(dashboardData.dataIntegrity, "Data Integrity Engine")}
            engineName="Data Integrity Engine"
            loading={loading}
          />
        </StaticTileWrapper>
      )}

      {/* System Status Footer */}
      <SystemStatusFooter />
    </DashboardGrid>
  );
};