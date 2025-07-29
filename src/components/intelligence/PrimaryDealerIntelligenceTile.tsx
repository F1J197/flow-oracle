import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { PrimaryDealerPositionsEngineV6 } from "@/engines/PrimaryDealerPositionsEngineV6";
import { usePrimaryDealerV6 } from "@/hooks/usePrimaryDealerV6";

interface PrimaryDealerIntelligenceTileProps {
  loading?: boolean;
}

export const PrimaryDealerIntelligenceTile = ({ 
  loading = false 
}: PrimaryDealerIntelligenceTileProps) => {
  const { tileData } = usePrimaryDealerV6();
  const engine = new PrimaryDealerPositionsEngineV6();
  const detailedView = engine.getDetailedView();

  const getStatusColor = () => {
    if (!tileData) return 'border-glass-border';
    switch (tileData.status) {
      case 'normal': return 'border-btc-bright';
      case 'warning': return 'border-btc-light';
      case 'critical': return 'border-btc-dark';
      default: return 'border-glass-border';
    }
  };

  const getStatusIndicator = () => {
    if (!tileData) return <div className="w-2 h-2 bg-text-secondary rounded-full"></div>;
    switch (tileData.status) {
      case 'normal': return <div className="w-2 h-2 bg-btc-bright rounded-full animate-pulse"></div>;
      case 'warning': return <div className="w-2 h-2 bg-btc-light rounded-full animate-pulse"></div>;
      case 'critical': return <div className="w-2 h-2 bg-btc-dark rounded-full animate-pulse"></div>;
      default: return <div className="w-2 h-2 bg-text-secondary rounded-full"></div>;
    }
  };

  const getPrimaryMetricColor = () => {
    if (!tileData) return 'text-foreground';
    switch (tileData.color) {
      case 'teal': return 'text-btc-primary';
      case 'orange': return 'text-btc-dark';
      case 'lime': return 'text-btc-bright';
      case 'gold': return 'text-btc-light';
      case 'fuchsia': return 'text-btc-muted';
      default: return 'text-foreground';
    }
  };

  if (loading) {
    return (
      <div className={cn(
        "premium-tile p-6 space-y-4 border border-btc-primary/10",
        "min-h-[280px] flex flex-col bg-gradient-to-br from-bg-secondary/95 to-bg-primary/85"
      )}>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-bg-elevated/60 rounded w-2/3 shimmer"></div>
          <div className="w-2 h-2 bg-btc-primary/50 rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-4 flex-1">
          <div className="h-8 bg-bg-elevated/60 rounded w-1/2 shimmer"></div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 bg-bg-elevated/40 rounded w-1/3 shimmer"></div>
                <div className="h-3 bg-bg-elevated/40 rounded w-1/4 shimmer"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "premium-tile p-6 space-y-4 transition-all duration-300",
      "min-h-[280px] flex flex-col border border-btc-primary/20",
      "bg-gradient-to-br from-bg-secondary/95 to-bg-primary/85",
      "hover:border-btc-primary/40 hover:shadow-xl hover:shadow-btc-primary/10",
      getStatusColor()
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text-secondary tracking-wider uppercase truncate">
          PRIMARY DEALER POSITIONS
        </h3>
        <div className="flex items-center space-x-2">
          {getStatusIndicator()}
          <Badge variant="outline" className="text-xs font-mono border-btc-primary text-btc-primary bg-btc-primary/10">
            LIVE
          </Badge>
        </div>
      </div>

      {/* Primary Section */}
      <div className="space-y-2">
        <div className="text-xs text-btc-primary uppercase tracking-wider font-mono font-semibold">
          {detailedView.primarySection.title}
        </div>
        <div className={cn(
          "text-2xl font-bold font-mono tracking-wide",
          getPrimaryMetricColor()
        )}>
          {Object.entries(detailedView.primarySection.metrics)[0][1]}
        </div>
        <div className="text-xs text-text-secondary font-mono">
          {Object.entries(detailedView.primarySection.metrics)[2] && 
            `${Object.entries(detailedView.primarySection.metrics)[2][0]} ${Object.entries(detailedView.primarySection.metrics)[2][1]}`}
        </div>
      </div>

      {/* Position Insights Section */}
      {detailedView.sections[0] && (
        <div className="space-y-3 flex-1">
          <div className="text-xs text-btc-primary uppercase tracking-wider font-mono font-semibold">
            {detailedView.sections[0].title}
          </div>
          <div className="space-y-2">
            {Object.entries(detailedView.sections[0].metrics).slice(0, 4).map(([key, value], index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary font-mono">{key.replace('::', '')}:</span>
                <span className="font-mono font-semibold text-text-primary">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Assessment Section */}
      {detailedView.sections[1] && (
        <div className="space-y-3">
          <div className="text-xs text-btc-primary uppercase tracking-wider font-mono font-semibold">
            {detailedView.sections[1].title}
          </div>
          <div className="space-y-2">
            {Object.entries(detailedView.sections[1].metrics).slice(0, 3).map(([key, value], index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary font-mono">{key.replace('::', '')}:</span>
                <span className="font-mono font-semibold text-text-primary">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Status Section */}
      {detailedView.sections[4] && (
        <div className="space-y-3 mt-auto pt-4 border-t border-glass-border/30">
          <div className="text-xs text-btc-primary uppercase tracking-wider font-mono font-semibold">
            {detailedView.sections[4].title}
          </div>
          <div className="space-y-2">
            {Object.entries(detailedView.sections[4].metrics).slice(0, 2).map(([key, value], index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary font-mono">{key.replace('::', '')}:</span>
                <span className="font-mono font-semibold text-text-primary">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};