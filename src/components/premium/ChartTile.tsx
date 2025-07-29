import { cn } from "@/lib/utils";
import { ReactNode } from "react";
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

const getColorClasses = (color?: string) => {
  switch (color) {
    case 'primary': return 'text-btc-primary';
    case 'warning': return 'text-warning';
    case 'critical': return 'text-critical';
    case 'success': return 'text-success';
    default: return 'text-text-primary';
  }
};

const getChartHeight = (height: 'sm' | 'md' | 'lg') => {
  switch (height) {
    case 'sm': return 'h-24';
    case 'md': return 'h-32';
    case 'lg': return 'h-40';
    default: return 'h-32';
  }
};

export const ChartTile = ({
  title,
  chart,
  metrics = [],
  insight,
  period,
  isLoading = false,
  chartHeight = 'md',
  ...tileProps
}: ChartTileProps) => {
  if (isLoading) {
    return (
      <BaseTile {...tileProps} status="loading">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-glass-bg rounded w-1/2 animate-pulse" />
            {period && <div className="h-3 bg-glass-bg rounded w-16 animate-pulse" />}
          </div>
          <div className={cn("bg-glass-bg rounded animate-pulse", getChartHeight(chartHeight))} />
          {metrics.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((_, index) => (
                <div key={index} className="space-y-1">
                  <div className="h-5 bg-glass-bg rounded animate-pulse" />
                  <div className="h-3 bg-glass-bg rounded w-2/3 animate-pulse" />
                </div>
              ))}
            </div>
          )}
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
        {period && (
          <span className="text-xs text-text-secondary bg-glass-bg px-2 py-1 rounded">
            {period}
          </span>
        )}
      </div>

      {/* Chart Container */}
      <div className={cn(
        "relative overflow-hidden rounded-md mb-4",
        "bg-gradient-to-br from-glass-bg to-transparent",
        "border border-glass-border/50",
        getChartHeight(chartHeight)
      )}>
        <div className="p-2 h-full">
          {chart}
        </div>
        
        {/* Chart Overlay Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-tile/20 to-transparent pointer-events-none" />
      </div>

      {/* Metrics */}
      {metrics.length > 0 && (
        <div className={cn(
          "mb-4",
          metrics.length <= 2 ? "grid grid-cols-2 gap-4" : "grid grid-cols-2 gap-3"
        )}>
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-sm font-medium tabular-nums",
                  getColorClasses(metric.color)
                )}>
                  {formatValue(metric.value)}{metric.unit}
                </span>
                
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
              
              <div className="text-xs text-text-secondary">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insight */}
      {insight && (
        <div className="text-xs text-text-secondary/80 leading-relaxed italic border-t border-glass-border pt-3">
          {insight}
        </div>
      )}
    </BaseTile>
  );
};