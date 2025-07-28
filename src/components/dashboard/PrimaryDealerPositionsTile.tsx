import { GlassTile } from "@/components/shared/GlassTile";
import { DataDisplay } from "@/components/shared/DataDisplay";
import { Badge } from "@/components/ui/badge";
import { DashboardTileData } from "@/types/engines";
import { useDealerPositions } from "@/hooks/useDealerPositions";

interface PrimaryDealerPositionsTileProps {
  data?: DashboardTileData;
  loading?: boolean;
}

export const PrimaryDealerPositionsTile = ({ 
  data, 
  loading = false 
}: PrimaryDealerPositionsTileProps) => {
  const { data: v6Data, loading: v6Loading, alerts } = useDealerPositions();
  
  // Use V6 data if available, otherwise fall back to provided data
  const displayData: DashboardTileData = v6Data ? {
    title: 'PRIMARY DEALER POSITIONS V6',
    primaryMetric: `$${((v6Data.treasuryPositions.total + v6Data.agencyPositions.total + v6Data.corporatePositions.total + v6Data.internationalPositions.total) / 1000000).toFixed(3)}T`,
    secondaryMetric: `${v6Data.analytics.regime} | ${v6Data.riskMetrics.riskCapacity.toFixed(1)}% CAPACITY`,
    status: (v6Data.analytics.regime === 'CRISIS' ? 'critical' : v6Data.riskMetrics.riskCapacity < 60 ? 'warning' : 'normal') as 'normal' | 'warning' | 'critical',
    trend: (v6Data.analytics.flowDirection === 'ACCUMULATING' ? 'up' : v6Data.analytics.flowDirection === 'DISTRIBUTING' ? 'down' : 'neutral') as 'up' | 'down' | 'neutral',
    color: (v6Data.analytics.regime === 'EXPANSION' ? 'teal' : v6Data.analytics.regime === 'CONTRACTION' ? 'orange' : v6Data.analytics.regime === 'CRISIS' ? 'fuchsia' : 'gold') as 'teal' | 'orange' | 'lime' | 'gold' | 'fuchsia',
    actionText: `${v6Data.analytics.regime} POSITIONING`
  } : data || {
    title: 'PRIMARY DEALER POSITIONS V6',
    primaryMetric: '$5.660T',
    secondaryMetric: 'LOADING...',
    status: 'normal',
    trend: 'neutral',
    color: 'gold',
    actionText: 'INITIALIZING V6 ENGINE'
  };

  const isLoading = loading || v6Loading;

  return (
    <GlassTile 
      title={displayData.title}
      status={displayData.status}
    >
      <DataDisplay
        value={displayData.primaryMetric}
        size="lg"
        color={displayData.color}
        trend={displayData.trend}
        loading={isLoading}
      />
      {displayData.secondaryMetric && (
        <Badge 
          variant="outline" 
          className={`border-neon-${displayData.color} text-neon-${displayData.color} mt-2`}
        >
          {displayData.secondaryMetric}
        </Badge>
      )}
      {displayData.actionText && (
        <p className="text-sm text-text-primary font-mono mt-3">
          {displayData.actionText}
        </p>
      )}
      
      {/* V6 Enhancement: Show critical alerts */}
      {alerts.filter(a => a.severity === 'CRITICAL').length > 0 && (
        <div className="mt-2">
          <Badge variant="outline" className="border-neon-fuchsia text-neon-fuchsia animate-pulse">
            {alerts.filter(a => a.severity === 'CRITICAL').length} CRITICAL ALERT{alerts.filter(a => a.severity === 'CRITICAL').length > 1 ? 'S' : ''}
          </Badge>
        </div>
      )}
      
      {/* V6 Enhancement: Real-time metrics */}
      <div className="flex items-center justify-between mt-3 text-xs">
        <span className="text-text-secondary">Leverage:</span>
        <span className="text-neon-lime">
          {v6Data ? `${v6Data.riskMetrics.leverageRatio.toFixed(2)}x` : '3.2x'}
        </span>
      </div>
      {v6Data && (
        <div className="flex items-center justify-between mt-1 text-xs">
          <span className="text-text-secondary">Systemic Risk:</span>
          <span className={`${v6Data.analytics.systemicRisk > 0.7 ? 'text-neon-fuchsia' : 'text-neon-teal'}`}>
            {(v6Data.analytics.systemicRisk * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </GlassTile>
  );
};