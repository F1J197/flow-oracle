import { EnhancedDashboardTile } from "./EnhancedDashboardTile";
import { useChartsData } from "@/hooks/useChartsData";
import { DashboardTileData } from "@/types/engines";

interface CreditStressTileProps {
  data: DashboardTileData;
  loading?: boolean;
}

export const CreditStressTile = ({ data, loading = false }: CreditStressTileProps) => {
  const { getIndicatorById } = useChartsData();
  const indicator = getIndicatorById('credit-stress');

  const enhancedData = {
    ...data,
    primaryMetric: indicator?.value || data.primaryMetric,
    secondaryMetric: indicator?.change ? `${indicator.change > 0 ? '+' : ''}${indicator.change.toFixed(1)}%` : data.secondaryMetric,
    trend: indicator?.change ? (indicator.change > 0 ? 'up' : indicator.change < 0 ? 'down' : 'neutral') : data.trend,
  };

  return (
    <EnhancedDashboardTile 
      data={enhancedData} 
      loading={loading}
      category="credit"
      updateFreq={indicator?.updateFreq}
      lastUpdate={indicator?.lastUpdate}
      confidence={indicator?.confidence}
    >
      {/* Advanced stress visualization */}
      <div className="mt-3">
        <div className="w-full h-3 bg-noir-border rounded-full overflow-hidden relative">
          <div 
            className={`h-full transition-all duration-700 ${
              data.status === 'critical' 
                ? 'bg-gradient-to-r from-neon-orange via-neon-fuchsia to-red-500' 
                : data.status === 'warning'
                ? 'bg-gradient-to-r from-neon-gold to-neon-orange'
                : 'bg-gradient-to-r from-neon-lime to-neon-teal'
            }`}
            style={{ 
              width: data.status === 'critical' ? '90%' 
                   : data.status === 'warning' ? '50%' 
                   : '30%' 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>QE Supportive</span>
          <span>Crisis Mode</span>
        </div>
      </div>
    </EnhancedDashboardTile>
  );
};