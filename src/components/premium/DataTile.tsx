import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { BaseTile, BaseTileProps } from "./BaseTile";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface MetricData {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'warning' | 'critical' | 'success' | 'neutral';
}

export interface DataTileProps extends Omit<BaseTileProps, 'children'> {
  title: string;
  metric: MetricData;
  subtitle?: string;
  description?: string;
  icon?: ReactNode;
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
    case 'up': return <TrendingUp className="w-4 h-4" />;
    case 'down': return <TrendingDown className="w-4 h-4" />;
    case 'neutral': return <Minus className="w-4 h-4" />;
    default: return null;
  }
};

const getColorClasses = (color?: string) => {
  switch (color) {
    case 'primary': return 'text-btc-primary';
    case 'warning': return 'text-btc-light';
    case 'critical': return 'text-neon-orange';
    case 'success': return 'text-neon-teal';
    default: return 'text-text-primary';
  }
};

export const DataTile = ({
  title,
  metric,
  subtitle,
  description,
  icon,
  isLoading = false,
  ...tileProps
}: DataTileProps) => {
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
          {description && (
            <div className="h-4 bg-glass-bg rounded w-full animate-pulse" />
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
        {icon && (
          <div className="w-6 h-6 text-text-secondary">
            {icon}
          </div>
        )}
      </div>

      {/* Primary Metric */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-1">
          <span className={cn(
            "text-2xl font-bold tabular-nums",
            getColorClasses(metric.color)
          )}>
            {formatValue(metric.value)}
          </span>
          {metric.unit && (
            <span className="text-sm text-text-secondary">
              {metric.unit}
            </span>
          )}
          {metric.trend && (
            <div className={cn(
              "flex items-center",
              getColorClasses(metric.color)
            )}>
              {getTrendIcon(metric.trend)}
            </div>
          )}
        </div>
        
        <div className="text-xs text-text-secondary uppercase tracking-wider">
          {metric.label}
        </div>
      </div>

      {/* Change Indicator */}
      {metric.change !== undefined && (
        <div className={cn(
          "inline-flex items-center px-2 py-1 rounded text-xs font-medium mb-3",
          metric.change > 0 && "text-neon-teal bg-neon-teal/10",
          metric.change < 0 && "text-neon-orange bg-neon-orange/10", 
          metric.change === 0 && "text-text-secondary bg-glass-bg"
        )}>
          {metric.change > 0 ? '+' : ''}{metric.change.toFixed(2)}%
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <div className="text-sm text-text-secondary mb-2">
          {subtitle}
        </div>
      )}

      {/* Description */}
      {description && (
        <div className="text-xs text-text-secondary/80 leading-relaxed">
          {description}
        </div>
      )}
    </BaseTile>
  );
};