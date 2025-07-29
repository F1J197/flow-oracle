import { cn } from "@/lib/utils";
import { IntelligenceViewData } from "@/types/intelligenceView";
import { Badge } from "@/components/ui/badge";
import { memo } from "react";

interface IntelligenceTileProps {
  data: IntelligenceViewData;
  loading?: boolean;
}

export const IntelligenceTile = memo(({ data, loading = false }: IntelligenceTileProps) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'active': return 'border-btc-light';
      case 'warning': return 'border-btc-glow';
      case 'critical': return 'border-btc-primary';
      case 'offline': return 'border-text-secondary';
      default: return 'border-glass-border';
    }
  };

  const getStatusIndicator = () => {
    switch (data.status) {
      case 'active': return <div className="w-2 h-2 bg-btc-light rounded-full animate-pulse"></div>;
      case 'warning': return <div className="w-2 h-2 bg-btc-glow rounded-full animate-pulse"></div>;
      case 'critical': return <div className="w-2 h-2 bg-btc-primary rounded-full animate-pulse"></div>;
      case 'offline': return <div className="w-2 h-2 bg-text-secondary rounded-full"></div>;
    }
  };

  const getPrimaryMetricColor = () => {
    switch (data.primaryMetric.color) {
      case 'teal': return 'text-btc-muted';
      case 'orange': return 'text-btc-primary';
      case 'lime': return 'text-btc-light';
      case 'gold': return 'text-btc-glow';
      case 'fuchsia': return 'text-btc-primary';
      case 'btc': return 'text-btc-primary';
      case 'btc-light': return 'text-btc-light';
      case 'btc-glow': return 'text-btc-glow';
      case 'btc-muted': return 'text-btc-muted';
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
          {data.title}
        </h3>
        {getStatusIndicator()}
      </div>

      {/* Primary Metric */}
      <div className="space-y-1">
        <div className="text-xs text-text-muted uppercase tracking-wider">
          {data.primaryMetric.label}
        </div>
        <div className={cn(
          "text-2xl font-bold font-mono tracking-wide",
          getPrimaryMetricColor()
        )}>
          {data.primaryMetric.value}
          {data.primaryMetric.unit && (
            <span className="text-sm ml-1 opacity-80">{data.primaryMetric.unit}</span>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="space-y-2 flex-1">
        <div className="text-xs text-text-secondary uppercase tracking-wider">
          Key Metrics
        </div>
        <div className="space-y-1.5">
          {data.keyMetrics.slice(0, 4).map((metric, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-text-muted text-xs">{metric.label}:</span>
              <span className={cn(
                "font-mono font-medium",
                metric.status === 'critical' ? 'text-btc-primary' :
                metric.status === 'warning' ? 'text-btc-glow' :
                metric.status === 'good' ? 'text-btc-light' :
                'text-text-primary'
              )}>
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between mt-auto">
        <Badge variant="outline" className={cn(
          "text-xs font-mono",
          data.status === 'active' ? 'border-btc-light text-btc-light' :
          data.status === 'warning' ? 'border-btc-glow text-btc-glow' :
          data.status === 'critical' ? 'border-btc-primary text-btc-primary' :
          'border-text-secondary text-text-secondary'
        )}>
          {data.status.toUpperCase()}
        </Badge>
        
        {/* Key Insight */}
        {data.insights.length > 0 && (
          <div className="text-xs text-text-muted italic truncate max-w-[60%]">
            {data.insights[0]}
          </div>
        )}
      </div>
    </div>
  );
});