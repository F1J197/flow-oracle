import { GlassTile } from "@/components/shared/GlassTile";
import { DataDisplay } from "@/components/shared/DataDisplay";
import { Badge } from "@/components/ui/badge";
import { DashboardTileData } from "@/types/engines";

interface NetLiquidityTileProps {
  data: DashboardTileData;
  loading?: boolean;
}

export const NetLiquidityTile = ({ data, loading = false }: NetLiquidityTileProps) => {
  return (
    <GlassTile 
      title={data.title}
      size="large"
      status={data.status}
    >
      <DataDisplay
        value={data.primaryMetric}
        size="xl"
        color={data.color}
        loading={loading}
      />
      {data.secondaryMetric && (
        <Badge 
          variant="outline" 
          className={`border-neon-${data.color} text-neon-${data.color}`}
        >
          {data.secondaryMetric}
        </Badge>
      )}
      <div className="mt-4 h-8 bg-noir-border rounded opacity-30">
        {/* Mini chart placeholder */}
        <div className="h-full bg-gradient-to-r from-transparent via-neon-teal/30 to-transparent rounded"></div>
      </div>
    </GlassTile>
  );
};