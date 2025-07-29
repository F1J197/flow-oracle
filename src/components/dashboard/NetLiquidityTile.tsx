import { EnhancedDashboardTile } from "./EnhancedDashboardTile";
import { useChartsData } from "@/hooks/useChartsData";
import { DashboardTileData } from "@/types/engines";

interface NetLiquidityTileProps {
  data: DashboardTileData;
  loading?: boolean;
}

export const NetLiquidityTile = ({ data, loading = false }: NetLiquidityTileProps) => {
  const { getIndicatorById } = useChartsData();
  const indicator = getIndicatorById('net-liquidity');

  const enhancedData = {
    ...data,
    primaryMetric: indicator?.value || data.primaryMetric,
    secondaryMetric: indicator?.change ? `${indicator.change > 0 ? '+' : ''}${indicator.change.toFixed(1)}%` : data.secondaryMetric,
    trend: indicator?.change ? (indicator.change > 0 ? 'up' : indicator.change < 0 ? 'down' : 'neutral') : data.trend,
  };

  return (
    <EnhancedDashboardTile 
      data={enhancedData} 
      size="large" 
      loading={loading}
      category="liquidity"
      updateFreq={indicator?.updateFreq}
      lastUpdate={indicator?.lastUpdate}
      confidence={indicator?.confidence}
    >
      <div className="mt-4 h-8 bg-noir-border rounded opacity-30">
        {/* Mini chart placeholder */}
        <div className="h-full bg-gradient-to-r from-transparent via-neon-teal/30 to-transparent rounded"></div>
      </div>
    </EnhancedDashboardTile>
  );
};