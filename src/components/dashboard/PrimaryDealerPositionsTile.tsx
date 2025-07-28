import { GlassTile } from "@/components/shared/GlassTile";
import { PositionBars } from "@/components/shared/PositionBars";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useDealerPositions } from "@/hooks/useDealerPositions";
import { cn } from "@/lib/utils";

interface PrimaryDealerPositionsTileProps {
  loading?: boolean;
}

export const PrimaryDealerPositionsTile = ({ 
  loading = false 
}: PrimaryDealerPositionsTileProps) => {
  const { tileData, loading: v6Loading, alerts } = useDealerPositions();
  
  const isLoading = loading || v6Loading || !tileData;
  
  // Fallback data for loading state
  const fallbackData = {
    title: 'PRIMARY DEALER POSITIONS',
    netPosition: '-$310B',
    direction: 'down' as const,
    riskAppetite: 'STABLE' as const,
    signal: 'NEUTRAL' as const,
    status: 'normal' as const,
    color: 'gold' as const,
    positionBars: {
      grossLong: 5660000,
      grossShort: 5970000,
      netPosition: -310000,
      historicalAverage: 5200000,
      grossLongPct: 85,
      grossShortPct: 90,
      netPositionPct: 25,
      historicalAvgPct: 80
    }
  };

  const displayData = tileData || fallbackData;

  const getDirectionIcon = () => {
    switch (displayData.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-neon-teal" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-neon-orange" />;
      default:
        return <Minus className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getPositionColor = () => {
    const netPos = displayData.positionBars.netPosition;
    if (netPos > 0) return 'text-neon-teal';
    if (netPos < 0) return 'text-neon-orange';
    return 'text-text-secondary';
  };

  const getRiskAppetiteColor = () => {
    switch (displayData.riskAppetite) {
      case 'EXPANDING': return 'text-neon-teal border-neon-teal';
      case 'CONTRACTING': return 'text-neon-orange border-neon-orange';
      case 'CRISIS': return 'text-neon-fuchsia border-neon-fuchsia';
      default: return 'text-neon-gold border-neon-gold';
    }
  };

  const getSignalColor = () => {
    switch (displayData.signal) {
      case 'BULLISH': return 'text-neon-teal border-neon-teal';
      case 'BEARISH': return 'text-neon-orange border-neon-orange';
      default: return 'text-neon-gold border-neon-gold';
    }
  };

  return (
    <GlassTile 
      title={displayData.title}
      status={displayData.status}
      size="large"
    >
      {/* Net Position Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={cn("text-2xl font-mono font-bold", getPositionColor())}>
            {isLoading ? '...' : displayData.netPosition}
          </span>
          {getDirectionIcon()}
        </div>
        <div className="text-right">
          <div className="text-xs text-text-secondary">RISK APPETITE</div>
          <Badge variant="outline" className={cn("text-xs", getRiskAppetiteColor())}>
            {displayData.riskAppetite}
          </Badge>
        </div>
      </div>

      {/* Position Bars Visualization */}
      {!isLoading && (
        <div className="mb-4">
          <PositionBars
            grossLong={displayData.positionBars.grossLong}
            grossShort={displayData.positionBars.grossShort}
            netPosition={displayData.positionBars.netPosition}
            historicalAverage={displayData.positionBars.historicalAverage}
            grossLongPct={displayData.positionBars.grossLongPct}
            grossShortPct={displayData.positionBars.grossShortPct}
            netPositionPct={displayData.positionBars.netPositionPct}
            historicalAvgPct={displayData.positionBars.historicalAvgPct}
          />
        </div>
      )}

      {/* Signal Badge */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={cn("font-mono", getSignalColor())}>
          {displayData.signal}
        </Badge>
        
        {/* Critical Alerts */}
        {alerts.filter(a => a.severity === 'CRITICAL').length > 0 && (
          <Badge variant="outline" className="border-neon-fuchsia text-neon-fuchsia animate-pulse">
            {alerts.filter(a => a.severity === 'CRITICAL').length} ALERT{alerts.filter(a => a.severity === 'CRITICAL').length > 1 ? 'S' : ''}
          </Badge>
        )}
      </div>

      {/* Loading shimmer */}
      {isLoading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-glass-bg rounded"></div>
          <div className="h-2 bg-glass-bg rounded"></div>
          <div className="h-2 bg-glass-bg rounded w-3/4"></div>
          <div className="h-2 bg-glass-bg rounded w-1/2"></div>
        </div>
      )}
    </GlassTile>
  );
};