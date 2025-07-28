import { GlassTile } from "@/components/shared/GlassTile";
import { DataDisplay } from "@/components/shared/DataDisplay";
import { Badge } from "@/components/ui/badge";
import { DashboardTileData } from "@/types/engines";

interface PrimaryDealerPositionsTileProps {
  data?: DashboardTileData;
  loading?: boolean;
}

export const PrimaryDealerPositionsTile = ({ 
  data, 
  loading = false 
}: PrimaryDealerPositionsTileProps) => {
  // Fallback data if none provided
  const fallbackData: DashboardTileData = {
    title: 'PRIMARY DEALER POSITIONS',
    primaryMetric: '$5.660T',
    secondaryMetric: 'NEUTRAL | 85.6% CAPACITY',
    status: 'normal',
    trend: 'neutral',
    color: 'gold',
    actionText: 'NEUTRAL POSITIONING'
  };

  const tileData = data || fallbackData;

  return (
    <GlassTile 
      title={tileData.title}
      status={tileData.status}
    >
      <DataDisplay
        value={tileData.primaryMetric}
        size="lg"
        color={tileData.color}
        trend={tileData.trend}
        loading={loading}
      />
      {tileData.secondaryMetric && (
        <Badge 
          variant="outline" 
          className={`border-neon-${tileData.color} text-neon-${tileData.color} mt-2`}
        >
          {tileData.secondaryMetric}
        </Badge>
      )}
      {tileData.actionText && (
        <p className="text-sm text-text-primary font-mono mt-3">
          {tileData.actionText}
        </p>
      )}
      
      {/* Additional visual elements for dealer positioning */}
      <div className="flex items-center justify-between mt-3 text-xs">
        <span className="text-text-secondary">Leverage:</span>
        <span className="text-neon-lime">3.2x</span>
      </div>
    </GlassTile>
  );
};