import { useUnifiedDashboard } from "@/hooks/useUnifiedDashboard";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { ActionableInsightTile } from "@/components/dashboard/ActionableInsightTile";
import { PrimaryActionTile } from "@/components/dashboard/PrimaryActionTile";
import { PrimaryDealerIntelligenceTile } from "@/components/intelligence/PrimaryDealerIntelligenceTile";
import { SystemStatusFooter } from "@/components/dashboard/SystemStatusFooter";
import { StaticTileWrapper } from "@/components/dashboard/StaticTileWrapper";
import { DataIntegrityTile } from "@/components/dashboard/DataIntegrityTile";
import { useDataIntegrity } from "@/hooks/useDataIntegrity";

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

  // Get data integrity tile data from V6 engine
  const { 
    getDashboardTile: getDataIntegrityTile, 
    loading: dataIntegrityLoading 
  } = useDataIntegrity({ autoRefresh: true });

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
        <div className="bg-btc-dark/20 border border-btc-dark/50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-btc-dark mb-2">Dashboard Error</h2>
          <p className="text-btc-muted">{error}</p>
          <button 
            onClick={refreshData}
            className="mt-4 px-4 py-2 bg-btc-primary hover:bg-btc-dark rounded-lg text-text-primary transition-colors"
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

      {/* Data Integrity V6 - Use dedicated tile */}
      {(() => {
        const dataIntegrityTileData = getDataIntegrityTile?.();
        return dataIntegrityTileData ? (
          <StaticTileWrapper>
            <DataIntegrityTile
              data={dataIntegrityTileData}
              onClick={() => {
                // Navigate to intelligence engine
                window.location.href = '/intelligence';
              }}
            />
          </StaticTileWrapper>
        ) : null;
      })()}

      {/* System Status Footer */}
      <SystemStatusFooter />
    </DashboardGrid>
  );
};