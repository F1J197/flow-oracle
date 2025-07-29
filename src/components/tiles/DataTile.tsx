import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { BaseTile, BaseTileProps } from "./BaseTile";

export interface MetricData {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export interface DataTileProps extends Omit<BaseTileProps, 'children'> {
  title: string;
  metric: MetricData;
  subtitle?: string;
  description?: string;
  icon?: ReactNode;
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
    case 'up': return <TrendingUp className="h-4 w-4" />;
    case 'down': return <TrendingDown className="h-4 w-4" />;
    case 'neutral': return <Minus className="h-4 w-4" />;
    default: return null;
  }
};

// Get color classes for trend and change
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

export const DataTile = ({ 
  title, 
  metric, 
  subtitle, 
  description, 
  icon, 
  isLoading = false,
  className,
  ...props 
}: DataTileProps) => {
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
        <div className="h-3 bg-glass-surface animate-pulse rounded w-full" />
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
              "flex items-center gap-1",
              metric.trend === 'up' && "text-positive",
              metric.trend === 'down' && "text-negative",
              metric.trend === 'neutral' && "text-text-secondary"
            )}>
              {getTrendIcon(metric.trend)}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">
            {metric.label}
          </span>
          {metric.change !== undefined && (
            <span className={cn(
              "text-xs font-medium",
              metric.change > 0 && "text-positive",
              metric.change < 0 && "text-negative",
              metric.change === 0 && "text-text-secondary"
            )}>
              {metric.change > 0 && "+"}
              {metric.change.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div className="text-sm text-text-primary">
          {subtitle}
        </div>
      )}

      {/* Description */}
      {description && (
        <div className="text-xs text-text-secondary leading-relaxed">
          {description}
        </div>
      )}
    </BaseTile>
  );
};