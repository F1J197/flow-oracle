import { memo } from "react";
import { TerminalTile } from "@/components/Terminal";
import { useStableData } from "@/hooks/useStableData";
import { cn } from "@/lib/utils";
import type { DashboardTileData } from "@/types/engines";
import type { DataIntegrityMetrics } from "./types";

interface DataIntegrityDashboardTileProps {
  data?: DataIntegrityMetrics;
  loading?: boolean;
  error?: string | null;
  onClick?: () => void;
  className?: string;
}

function DataIntegrityDashboardTileComponent({
  data,
  loading = false,
  error = null,
  onClick,
  className
}: DataIntegrityDashboardTileProps) {
  
  // Stabilize data to prevent unnecessary re-renders
  const stableData = useStableData(data, {
    changeThreshold: 0.5, // 0.5% threshold for integrity score changes
    debounceMs: 1000
  });

  // Use stabilized data
  const metrics = stableData.value;

  // Generate dashboard tile data
  const tileData: DashboardTileData = metrics ? {
    title: "Data Integrity",
    primaryMetric: `${metrics.integrityScore.toFixed(1)}%`,
    secondaryMetric: `${metrics.activeSources}/${metrics.totalSources} sources`,
    status: metrics.integrityScore >= 95 ? 'normal' : 
            metrics.integrityScore >= 90 ? 'warning' : 'critical',
    trend: metrics.integrityScore >= 98 ? 'up' : 
           metrics.integrityScore <= 85 ? 'down' : 'neutral',
    actionText: metrics.systemStatus,
    color: metrics.integrityScore >= 95 ? 'success' : 
           metrics.integrityScore >= 90 ? 'warning' : 'critical',
    loading: loading
  } : {
    title: "Data Integrity",
    primaryMetric: "--",
    secondaryMetric: "-- sources",
    status: 'normal',
    trend: 'neutral',
    actionText: loading ? "LOADING..." : "NO DATA",
    color: 'neutral',
    loading: loading
  };

  const statusVariant = tileData.status === 'critical' ? 'critical' :
                       tileData.status === 'warning' ? 'warning' : 'default';

  return (
    <TerminalTile
      title={tileData.title}
      status={tileData.status}
      size="md"
      onClick={onClick}
      className={className}
    >
      <div className="space-y-3">
        {/* Primary Metric */}
        <div className="text-center">
          <div className="terminal-metric-primary text-3xl font-bold text-text-data">
            {loading ? "..." : tileData.primaryMetric}
          </div>
          <div className="terminal-metric-secondary text-sm text-text-secondary mt-1">
            {loading ? "Loading..." : tileData.secondaryMetric}
          </div>
        </div>

        {/* Status and Action */}
        <div className="flex items-center justify-between">
          <div className={cn(
            "terminal-status text-xs font-mono px-2 py-1 rounded",
            tileData.status === 'critical' ? "bg-neon-fuchsia/20 text-neon-fuchsia" :
            tileData.status === 'warning' ? "bg-neon-gold/20 text-neon-gold" :
            "bg-neon-teal/20 text-neon-teal"
          )}>
            {tileData.actionText}
          </div>
          
          {tileData.trend && (
            <div className={cn(
              "text-xs",
              tileData.trend === 'up' ? "text-neon-lime" :
              tileData.trend === 'down' ? "text-neon-orange" :
              "text-text-secondary"
            )}>
              {tileData.trend === 'up' ? '▲' : tileData.trend === 'down' ? '▼' : '●'}
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="text-xs text-neon-orange text-center">
            {error}
          </div>
        )}
      </div>
    </TerminalTile>
  );
}

export const DataIntegrityDashboardTile = memo(DataIntegrityDashboardTileComponent);