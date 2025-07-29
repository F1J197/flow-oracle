import { ReactNode } from "react";
import { PremiumTile } from "./PremiumTile";
import { cn } from "@/lib/utils";

interface MetricData {
  label: string;
  value: string | number;
  change?: number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'btc' | 'btc-light' | 'btc-glow' | 'neon-teal' | 'neon-orange' | 'default';
}

interface PremiumDataTileProps {
  title: string;
  primaryMetric: MetricData;
  secondaryMetrics?: MetricData[];
  insight?: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
  variant?: 'default' | 'primary' | 'warning' | 'critical';
  status?: 'normal' | 'active' | 'warning' | 'critical';
  isLoading?: boolean;
  className?: string;
}

export const PremiumDataTile = ({
  title,
  primaryMetric,
  secondaryMetrics = [],
  insight,
  size = 'medium',
  variant = 'default',
  status = 'normal',
  isLoading = false,
  className
}: PremiumDataTileProps) => {
  const formatValue = (value: string | number, unit?: string) => {
    if (typeof value === 'number') {
      return `${value.toLocaleString()}${unit || ''}`;
    }
    return `${value}${unit || ''}`;
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '';
    }
  };

  const getColorClass = (color?: string) => {
    switch (color) {
      case 'btc':
        return 'text-btc-primary';
      case 'btc-light':
        return 'text-btc-light';
      case 'btc-glow':
        return 'text-btc-glow';
      case 'neon-teal':
        return 'text-neon-teal';
      case 'neon-orange':
        return 'text-neon-orange';
      default:
        return 'text-text-primary';
    }
  };

  return (
    <PremiumTile
      title={title}
      size={size}
      variant={variant}
      status={status}
      isLoading={isLoading}
      className={className}
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-8 bg-glass-bg rounded animate-pulse" />
          <div className="h-4 bg-glass-bg rounded w-2/3 animate-pulse" />
          <div className="h-3 bg-glass-bg rounded w-1/2 animate-pulse" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Primary Metric */}
          <div className="space-y-2">
            <div className={cn(
              "text-2xl font-bold tracking-tight transition-colors duration-300",
              getColorClass(primaryMetric.color)
            )}>
              {formatValue(primaryMetric.value, primaryMetric.unit)}
              {primaryMetric.trend && (
                <span className={cn(
                  "ml-2 text-lg",
                  primaryMetric.trend === 'up' && "text-neon-teal",
                  primaryMetric.trend === 'down' && "text-neon-orange",
                  primaryMetric.trend === 'neutral' && "text-text-secondary"
                )}>
                  {getTrendIcon(primaryMetric.trend)}
                </span>
              )}
            </div>
            
            <div className="text-xs text-text-secondary uppercase tracking-wider">
              {primaryMetric.label}
            </div>

            {primaryMetric.change !== undefined && (
              <div className={cn(
                "text-sm font-medium",
                primaryMetric.change > 0 && "text-neon-teal",
                primaryMetric.change < 0 && "text-neon-orange",
                primaryMetric.change === 0 && "text-text-secondary"
              )}>
                {primaryMetric.change > 0 ? '+' : ''}{primaryMetric.change.toFixed(2)}%
              </div>
            )}
          </div>

          {/* Secondary Metrics */}
          {secondaryMetrics.length > 0 && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-glass-border">
              {secondaryMetrics.map((metric, index) => (
                <div key={index} className="space-y-1">
                  <div className={cn(
                    "text-lg font-semibold",
                    getColorClass(metric.color)
                  )}>
                    {formatValue(metric.value, metric.unit)}
                    {metric.trend && (
                      <span className={cn(
                        "ml-1 text-sm",
                        metric.trend === 'up' && "text-neon-teal",
                        metric.trend === 'down' && "text-neon-orange"
                      )}>
                        {getTrendIcon(metric.trend)}
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
            <div className="pt-4 border-t border-glass-border">
              <p className="text-sm text-text-secondary leading-relaxed">
                {insight}
              </p>
            </div>
          )}
        </div>
      )}
    </PremiumTile>
  );
};