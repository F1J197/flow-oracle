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
      case 'normal': return 'border-neon-lime';
      case 'warning': return 'border-neon-gold';
      case 'critical': return 'border-neon-orange';
      default: return 'border-glass-border';
    }
  };

  const getStatusIndicator = () => {
    if (!tileData) return <div className="w-2 h-2 bg-text-secondary rounded-full"></div>;
    switch (tileData.status) {
      case 'normal': return <div className="w-2 h-2 bg-neon-lime rounded-full animate-pulse"></div>;
      case 'warning': return <div className="w-2 h-2 bg-neon-gold rounded-full animate-pulse"></div>;
      case 'critical': return <div className="w-2 h-2 bg-neon-orange rounded-full animate-pulse"></div>;
      default: return <div className="w-2 h-2 bg-text-secondary rounded-full"></div>;
    }
  };

  const getPrimaryMetricColor = () => {
    if (!tileData) return 'text-foreground';
    switch (tileData.color) {
      case 'teal': return 'text-neon-teal';
      case 'orange': return 'text-neon-orange';
      case 'lime': return 'text-neon-lime';
      case 'gold': return 'text-neon-gold';
      case 'fuchsia': return 'text-neon-fuchsia';
      default: return 'text-foreground';
    }
  };

  if (loading) {
    return (
      <div className={cn(
        "glass-tile p-4 space-y-4",
        "min-h-[280px]" // Fixed height for grid consistency
      )}>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-700 rounded w-2/3 animate-pulse"></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <div className="h-6 bg-gray-600 rounded w-1/2 animate-pulse"></div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 bg-gray-700 rounded w-1/3 animate-pulse"></div>
                <div className="h-3 bg-gray-600 rounded w-1/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "glass-tile p-4 space-y-4 transition-all duration-300 hover:scale-[1.02]",
      "min-h-[280px] flex flex-col", // Fixed height and flex layout
      getStatusColor()
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-secondary tracking-wider uppercase truncate">
          {detailedView.title}
        </h3>
        <div className="flex items-center space-x-2">
          {getStatusIndicator()}
          <Badge variant="outline" className="text-xs font-mono border-neon-lime text-neon-lime">
            LIVE
          </Badge>
        </div>
      </div>

      {/* Primary Section */}
      <div className="space-y-1">
        <div className="text-xs text-neon-teal uppercase tracking-wider font-mono font-semibold">
          {detailedView.primarySection.title}
        </div>
        <div className={cn(
          "text-lg font-bold font-mono tracking-wide",
          getPrimaryMetricColor()
        )}>
          {Object.entries(detailedView.primarySection.metrics)[0][1]}
        </div>
        <div className="text-xs text-text-secondary">
          {Object.entries(detailedView.primarySection.metrics)[2] && 
            `${Object.entries(detailedView.primarySection.metrics)[2][0]} ${Object.entries(detailedView.primarySection.metrics)[2][1]}`}
        </div>
      </div>

      {/* Position Insights Section */}
      {detailedView.sections[0] && (
        <div className="space-y-2 flex-1">
          <div className="text-xs text-neon-teal uppercase tracking-wider font-mono font-semibold">
            {detailedView.sections[0].title}
          </div>
          <div className="space-y-1">
            {Object.entries(detailedView.sections[0].metrics).slice(0, 4).map(([key, value], index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-text-secondary font-mono">{key.replace('::', '')}:</span>
                <span className="font-mono font-medium text-text-primary">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Assessment Section */}
      {detailedView.sections[1] && (
        <div className="space-y-2">
          <div className="text-xs text-neon-teal uppercase tracking-wider font-mono font-semibold">
            {detailedView.sections[1].title}
          </div>
          <div className="space-y-1">
            {Object.entries(detailedView.sections[1].metrics).slice(0, 3).map(([key, value], index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-text-secondary font-mono">{key.replace('::', '')}:</span>
                <span className="font-mono font-medium text-text-primary">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Status Section */}
      {detailedView.sections[4] && (
        <div className="space-y-2 mt-auto">
          <div className="text-xs text-neon-teal uppercase tracking-wider font-mono font-semibold">
            {detailedView.sections[4].title}
          </div>
          <div className="space-y-1">
            {Object.entries(detailedView.sections[4].metrics).slice(0, 2).map(([key, value], index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-text-secondary font-mono">{key.replace('::', '')}:</span>
                <span className="font-mono font-medium text-text-primary">
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