import { GlassTile } from "@/components/shared/GlassTile";
import { DataDisplay } from "@/components/shared/DataDisplay";
import { Badge } from "@/components/ui/badge";
import { DashboardTileData } from "@/types/engines";

interface CreditStressTileProps {
  data: DashboardTileData;
  loading?: boolean;
}

export const CreditStressTile = ({ data, loading = false }: CreditStressTileProps) => {
  return (
    <GlassTile 
      title={data.title}
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
        <p className="text-xs text-text-primary font-mono mt-3">
          {data.actionText}
        </p>
      )}
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
    </GlassTile>
  );
};