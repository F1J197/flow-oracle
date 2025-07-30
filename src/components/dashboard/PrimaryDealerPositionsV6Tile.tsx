import { PositionBars } from "@/components/shared/PositionBars";
import { PrimaryDealerTileData } from "@/types/primaryDealerTile";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { TerminalContainer } from "@/components/terminal/TerminalContainer";

interface PrimaryDealerPositionsV6TileProps {
  data?: PrimaryDealerTileData;
  loading?: boolean;
}

export const PrimaryDealerPositionsV6Tile = ({ 
  data, 
  loading = false 
}: PrimaryDealerPositionsV6TileProps) => {
  const getDirectionIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-4 h-4 text-neon-lime" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-neon-orange" />;
      default: return <Minus className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getStatusIndicator = (status?: 'normal' | 'warning' | 'critical') => {
    const baseClasses = "w-2 h-2";
    switch (status) {
      case 'critical':
        return <div className={cn(baseClasses, "bg-neon-orange animate-pulse")} />;
      case 'warning':
        return <div className={cn(baseClasses, "bg-neon-gold animate-pulse")} />;
      default:
        return <div className={cn(baseClasses, "bg-text-muted opacity-60")} />;
    }
  };

  if (loading) {
    return (
      <TerminalContainer variant="tile" className="col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-secondary tracking-wider uppercase">
            PRIMARY DEALER POSITIONS V6
          </h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-secondary"></div>
          <div className="h-4 bg-bg-secondary w-3/4"></div>
          <div className="space-y-2">
            <div className="h-2 bg-bg-secondary"></div>
            <div className="h-2 bg-bg-secondary"></div>
            <div className="h-2 bg-bg-secondary"></div>
          </div>
        </div>
      </TerminalContainer>
    );
  }

  // Fallback data if none provided
  const tileData = data || {
    title: 'PRIMARY DEALER POSITIONS',
    netPosition: '-$310B',
    direction: 'neutral' as const,
    riskAppetite: 'STABLE' as const,
    signal: 'NEUTRAL' as const,
    status: 'warning' as const,
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
    },
    metadata: {
      lastUpdated: new Date(),
      confidence: 0.75,
      dataQuality: 0.80
    }
  };

  return (
    <TerminalContainer 
      variant="tile" 
      className={cn(
        "col-span-2 transition-all duration-300",
        tileData.status === 'critical' && "border-neon-orange animate-pulse",
        tileData.status === 'warning' && "border-neon-gold"
      )}
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-secondary tracking-wider uppercase">
          PRIMARY DEALER POSITIONS V6
        </h3>
        {tileData.status === 'critical' && (
          <div className="w-2 h-2 bg-neon-orange animate-pulse"></div>
        )}
        {tileData.status === 'warning' && (
          <div className="w-2 h-2 bg-neon-gold animate-pulse"></div>
        )}
      </div>
      {/* Header with net position and status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl font-mono font-bold text-data">
            {tileData.netPosition}
          </div>
          {getDirectionIcon(tileData.direction)}
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIndicator(tileData.status)}
          <Activity className="w-4 h-4 text-text-secondary" />
        </div>
      </div>

      {/* Risk appetite and signal */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm">
          <span className="text-text-secondary font-mono">APPETITE:</span>
          <span className={cn(
            "ml-2 font-mono font-semibold",
            tileData.riskAppetite === 'EXPANDING' && "text-neon-lime",
            tileData.riskAppetite === 'CONTRACTING' && "text-neon-orange",
            tileData.riskAppetite === 'CRISIS' && "text-neon-fuchsia",
            tileData.riskAppetite === 'STABLE' && "text-neon-teal"
          )}>
            {tileData.riskAppetite}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-text-secondary font-mono">SIGNAL:</span>
          <span className={cn(
            "ml-2 font-mono font-semibold",
            tileData.signal === 'BULLISH' && "text-neon-lime",
            tileData.signal === 'BEARISH' && "text-neon-orange",
            tileData.signal === 'NEUTRAL' && "text-text-secondary"
          )}>
            {tileData.signal}
          </span>
        </div>
      </div>

      {/* Position bars visualization */}
      <PositionBars
        grossLong={tileData.positionBars.grossLong}
        grossShort={tileData.positionBars.grossShort}
        netPosition={tileData.positionBars.netPosition}
        historicalAverage={tileData.positionBars.historicalAverage}
        grossLongPct={tileData.positionBars.grossLongPct}
        grossShortPct={tileData.positionBars.grossShortPct}
        netPositionPct={tileData.positionBars.netPositionPct}
        historicalAvgPct={tileData.positionBars.historicalAvgPct}
        className="mt-4"
      />

      {/* Footer with metadata */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-neon-teal/20">
        <div className="text-xs text-text-secondary font-mono">
          CONF: {Math.round((tileData.metadata.confidence || 0.75) * 100)}%
        </div>
        <div className="text-xs text-text-secondary font-mono">
          QUAL: {Math.round((tileData.metadata.dataQuality || 0.80) * 100)}%
        </div>
        <div className="text-xs text-text-secondary font-mono">
          {tileData.metadata.lastUpdated.toLocaleTimeString()}
        </div>
      </div>
    </TerminalContainer>
  );
};