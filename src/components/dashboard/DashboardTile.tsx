import { GlassTile } from "@/components/shared/GlassTile";
import { DataDisplay } from "@/components/shared/DataDisplay";
import { Badge } from "@/components/ui/badge";
import { DashboardTileData } from "@/types/engines";

interface DashboardTileProps {
  data: DashboardTileData;
  size?: 'normal' | 'large' | 'xl';
  loading?: boolean;
  children?: React.ReactNode;
}

export const DashboardTile = ({ 
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
      <DataDisplay
        value={data.primaryMetric}
        size="lg"
        color={data.color}
        trend={data.trend}
        loading={loading}
      />
      {data.secondaryMetric && (
        <Badge 
          variant="outline" 
          className={`border-neon-${data.color} text-neon-${data.color} mt-2`}
        >
          {data.secondaryMetric}
        </Badge>
      )}
      {data.actionText && (
        <p className="text-sm text-text-primary font-mono mt-3">
          {data.actionText}
        </p>
      )}
      {children}
    </GlassTile>
  );
};