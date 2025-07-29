import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { BaseTile, BaseTileProps } from "./BaseTile";
import { MetricData } from "./DataTile";

export interface MultiMetricTileProps extends Omit<BaseTileProps, 'children'> {
  title: string;
  primaryMetric: MetricData;
  secondaryMetrics?: MetricData[];
  layout?: 'grid' | 'list';
  icon?: ReactNode;
  insight?: string;
  isLoading?: boolean;
}

// Format large numbers with suffixes
const formatValue = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  
  if (Math.abs(num) >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
  if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toLocaleString();
};

// Get trend icon
const getTrendIcon = (trend?: 'up' | 'down' | 'neutral'): ReactNode => {
  switch (trend) {
    case 'up': return <TrendingUp className="h-3 w-3" />;
    case 'down': return <TrendingDown className="h-3 w-3" />;
    case 'neutral': return <Minus className="h-3 w-3" />;
    default: return null;
  }
};

// Get color classes
const getColorClasses = (color?: string): string => {
  switch (color) {
    case 'btc': return 'text-btc-primary';
    case 'btc-light': return 'text-btc-light';
    case 'btc-glow': return 'text-btc-glow';
    case 'success': return 'text-success';
    case 'critical': return 'text-critical';
    case 'positive': return 'text-positive';
    case 'negative': return 'text-negative';
    case 'warning': return 'text-warning';
    default: return 'text-text-primary';
  }
};

export const MultiMetricTile = ({
  title,
  primaryMetric,
  secondaryMetrics,
  layout = 'grid',
  icon,
  insight,
  isLoading = false,
  className,
  ...props
}: MultiMetricTileProps) => {
  if (isLoading) {
    return (
      <BaseTile className={cn("space-y-4", className)} status="loading" {...props}>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-glass-surface animate-pulse rounded w-24" />
          <div className="h-4 w-4 bg-glass-surface animate-pulse rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-glass-surface animate-pulse rounded w-32" />
          <div className="h-3 bg-glass-surface animate-pulse rounded w-16" />
        </div>
        {secondaryMetrics && (
          <div className={cn(
            "gap-3",
            layout === 'grid' ? "grid grid-cols-2" : "space-y-2"
          )}>
            {Array.from({ length: Math.min(secondaryMetrics.length, 4) }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 bg-glass-surface animate-pulse rounded w-16" />
                <div className="h-4 bg-glass-surface animate-pulse rounded w-12" />
              </div>
            ))}
          </div>
        )}
      </BaseTile>
    );
  }

  return (
    <BaseTile className={cn("space-y-4", className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-secondary truncate">
          {title}
        </h3>
        {icon && (
          <div className="text-btc-primary opacity-80">
            {icon}
          </div>
        )}
      </div>

      {/* Primary Metric */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-2xl font-bold transition-all duration-300 animate-dataUpdate",
            getColorClasses(primaryMetric.color)
          )}>
            {formatValue(primaryMetric.value)}
          </span>
          {primaryMetric.unit && (
            <span className="text-sm text-text-secondary">
              {primaryMetric.unit}
            </span>
          )}
          {primaryMetric.trend && (
            <div className={cn(
              "flex items-center gap-1",
              primaryMetric.trend === 'up' && "text-positive",
              primaryMetric.trend === 'down' && "text-negative",
              primaryMetric.trend === 'neutral' && "text-text-secondary"
            )}>
              {getTrendIcon(primaryMetric.trend)}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">
            {primaryMetric.label}
          </span>
          {primaryMetric.change !== undefined && (
            <span className={cn(
              "text-xs font-medium",
              primaryMetric.change > 0 && "text-positive",
              primaryMetric.change < 0 && "text-negative",
              primaryMetric.change === 0 && "text-text-secondary"
            )}>
              {primaryMetric.change > 0 && "+"}
              {primaryMetric.change.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      {/* Secondary Metrics */}
      {secondaryMetrics && secondaryMetrics.length > 0 && (
        <div className={cn(
          "border-t border-glass-border/30 pt-3",
          layout === 'grid' ? "grid grid-cols-2 gap-3" : "space-y-2"
        )}>
          {secondaryMetrics.map((metric, index) => (
            <div key={index} className="space-y-1">
              <div className="text-xs text-text-secondary">
                {metric.label}
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium transition-all duration-300 animate-dataUpdate",
                  getColorClasses(metric.color)
                )}>
                  {formatValue(metric.value)}
                  {metric.unit && <span className="text-xs text-text-secondary ml-1">{metric.unit}</span>}
                </span>
                {metric.trend && (
                  <div className={cn(
                    "flex items-center",
                    metric.trend === 'up' && "text-positive",
                    metric.trend === 'down' && "text-negative",
                    metric.trend === 'neutral' && "text-text-secondary"
                  )}>
                    {getTrendIcon(metric.trend)}
                  </div>
                )}
                {metric.change !== undefined && (
                  <span className={cn(
                    "text-xs",
                    metric.change > 0 && "text-positive",
                    metric.change < 0 && "text-negative",
                    metric.change === 0 && "text-text-secondary"
                  )}>
                    {metric.change > 0 && "+"}
                    {metric.change.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insight */}
      {insight && (
        <div className="text-xs text-text-secondary bg-glass-surface/50 p-3 rounded-lg border border-glass-border/30">
          {insight}
        </div>
      )}
    </BaseTile>
  );
};