import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { BaseTile, BaseTileProps } from "./BaseTile";
import { MetricData } from "./DataTile";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface MultiMetricTileProps extends Omit<BaseTileProps, 'children'> {
  title: string;
  primaryMetric: MetricData;
  secondaryMetrics: MetricData[];
  layout?: 'grid' | 'list';
  icon?: ReactNode;
  insight?: string;
  isLoading?: boolean;
}

const formatValue = (value: string | number): string => {
  if (typeof value === 'number') {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toLocaleString();
  }
  return String(value);
};

const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up': return <TrendingUp className="w-3 h-3" />;
    case 'down': return <TrendingDown className="w-3 h-3" />;
    case 'neutral': return <Minus className="w-3 h-3" />;
    default: return null;
  }
};

const getColorClasses = (color?: string) => {
  switch (color) {
    case 'primary': return 'text-btc-primary';
    case 'warning': return 'text-warning';
    case 'critical': return 'text-critical';
    case 'success': return 'text-success';
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
  ...tileProps
}: MultiMetricTileProps) => {
  if (isLoading) {
    return (
      <BaseTile {...tileProps} status="loading">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-glass-bg rounded w-1/2 animate-pulse" />
            <div className="w-6 h-6 bg-glass-bg rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-glass-bg rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-glass-bg rounded w-1/3 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-5 bg-glass-bg rounded animate-pulse" />
                <div className="h-3 bg-glass-bg rounded w-2/3 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </BaseTile>
    );
  }

  return (
    <BaseTile {...tileProps}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-secondary tracking-wide uppercase">
          {title}
        </h3>
        {icon && (
          <div className="w-6 h-6 text-text-secondary">
            {icon}
          </div>
        )}
      </div>

      {/* Primary Metric */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-1">
          <span className={cn(
            "text-2xl font-bold tabular-nums",
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
              "flex items-center",
              getColorClasses(primaryMetric.color)
            )}>
              {getTrendIcon(primaryMetric.trend)}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-xs text-text-secondary uppercase tracking-wider">
            {primaryMetric.label}
          </div>
          
            {primaryMetric.change !== undefined && (
              <div className={cn(
                "inline-flex items-center px-2 py-1 rounded text-xs font-medium",
                primaryMetric.change > 0 && "text-success bg-success/10",
                primaryMetric.change < 0 && "text-critical bg-critical/10",
                primaryMetric.change === 0 && "text-text-secondary bg-glass-bg"
              )}>
                {primaryMetric.change > 0 ? '+' : ''}{primaryMetric.change.toFixed(2)}%
              </div>
            )}
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className={cn(
        "mb-4",
        layout === 'grid' ? "grid grid-cols-2 gap-4" : "space-y-3"
      )}>
        {secondaryMetrics.map((metric, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-sm font-medium tabular-nums",
                getColorClasses(metric.color)
              )}>
                {formatValue(metric.value)}{metric.unit}
              </span>
              
              <div className="flex items-center gap-1">
                {metric.trend && (
                  <div className={cn(
                    "flex items-center",
                    getColorClasses(metric.color)
                  )}>
                    {getTrendIcon(metric.trend)}
                  </div>
                )}
                
                {metric.change !== undefined && (
                  <span className={cn(
                    "text-xs",
                    metric.change > 0 && "text-success",
                    metric.change < 0 && "text-critical",
                    metric.change === 0 && "text-text-secondary"
                  )}>
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-xs text-text-secondary">
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Insight */}
      {insight && (
        <div className="text-xs text-text-secondary/80 leading-relaxed italic border-t border-glass-border pt-3">
          {insight}
        </div>
      )}
    </BaseTile>
  );
};