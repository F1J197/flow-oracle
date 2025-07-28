import { GlassTile } from "@/components/shared/GlassTile";
import { StableDataDisplay } from "@/components/shared/StableDataDisplay";
import { Badge } from "@/components/ui/badge";
import { DashboardTileData } from "@/types/engines";
import { memo } from "react";

interface DashboardTileProps {
  data: DashboardTileData;
  size?: 'normal' | 'large' | 'xl';
  loading?: boolean;
  children?: React.ReactNode;
}

export const DashboardTile = memo(({ 
  data, 
  size = 'normal', 
  loading = false,
  children 
}: DashboardTileProps) => {
  return (
    <GlassTile 
      title={data.title}
      size={size}
      status={data.status}
    >
      <StableDataDisplay
        value={data.primaryMetric}
        size="lg"
        color={data.color}
        trend={data.trend}
        loading={loading || data.loading}
        stabilityConfig={{
          changeThreshold: 0.025, // 2.5% threshold
          debounceMs: 1500, // 1.5 second debounce
          smoothingFactor: 0.75 // Strong smoothing
        }}
      />
      {data.secondaryMetric && (
        <Badge 
          variant="outline" 
          className={`border-neon-${data.color} text-neon-${data.color} mt-2 transition-all duration-300`}
        >
          {data.secondaryMetric}
        </Badge>
      )}
      {data.actionText && (
        <p className="text-sm text-text-primary font-mono mt-3 transition-opacity duration-300">
          {data.actionText}
        </p>
      )}
      {children}
    </GlassTile>
  );
});