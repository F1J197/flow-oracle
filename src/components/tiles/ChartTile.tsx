import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BaseTile, BaseTileProps } from "./BaseTile";
import { MetricData } from "./DataTile";

export interface ChartTileProps extends Omit<BaseTileProps, 'children'> {
  title: string;
  chart: ReactNode;
  metrics?: MetricData[];
  insight?: string;
  period?: string;
  isLoading?: boolean;
  chartHeight?: 'sm' | 'md' | 'lg';
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

// Get color classes for metrics
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

// Get chart height classes
const getChartHeight = (height: 'sm' | 'md' | 'lg'): string => {
  switch (height) {
    case 'sm': return 'h-32';
    case 'md': return 'h-40';
    case 'lg': return 'h-48';
    default: return 'h-40';
  }
};

export const ChartTile = ({
  title,
  chart,
  metrics,
  insight,
  period,
  isLoading = false,
  chartHeight = 'md',
  className,
  ...props
}: ChartTileProps) => {
  if (isLoading) {
    return (
      <BaseTile className={cn("space-y-4", className)} status="loading" {...props}>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-glass-surface animate-pulse rounded w-32" />
          {period && <div className="h-3 bg-glass-surface animate-pulse rounded w-16" />}
        </div>
        <div className={cn("bg-glass-surface animate-pulse rounded", getChartHeight(chartHeight))} />
        {metrics && (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: Math.min(metrics.length, 4) }).map((_, i) => (
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
        {period && (
          <span className="text-xs text-text-secondary bg-glass-surface px-2 py-1 rounded">
            {period}
          </span>
        )}
      </div>

      {/* Chart Container */}
      <div className={cn(
        "relative rounded-lg overflow-hidden",
        "bg-gradient-to-br from-glass-surface/30 to-transparent",
        "border border-glass-border/50",
        getChartHeight(chartHeight)
      )}>
        <div className="absolute inset-0 bg-gradient-to-t from-bg-tile/20 to-transparent z-10 pointer-events-none" />
        <div className="relative z-0 w-full h-full">
          {chart}
        </div>
      </div>

      {/* Metrics Grid */}
      {metrics && metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {metrics.slice(0, 4).map((metric, index) => (
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