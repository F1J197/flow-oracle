import { memo } from "react";
import { cn } from "@/lib/utils";
import { BaseTile, BaseTileProps } from "@/components/tiles/BaseTile";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricEntry {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  change?: number;
  unit?: string;
  status?: 'good' | 'warning' | 'critical';
}

interface IntelligenceMetricTileProps extends Omit<BaseTileProps, 'children'> {
  title: string;
  metrics: Record<string, string | number> | MetricEntry[];
  subtitle?: string;
  period?: string;
  showTrends?: boolean;
}

const formatValue = (value: string | number): string => {
  if (typeof value === 'number') {
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toLocaleString();
  }
  return String(value);
};

const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up': return <TrendingUp className="w-3 h-3 text-positive" />;
    case 'down': return <TrendingDown className="w-3 h-3 text-negative" />;
    default: return <Minus className="w-3 h-3 text-text-secondary" />;
  }
};

const getStatusColor = (status?: 'good' | 'warning' | 'critical') => {
  switch (status) {
    case 'good': return 'text-positive';
    case 'warning': return 'text-warning';
    case 'critical': return 'text-critical';
    default: return 'text-btc-primary';
  }
};

export const IntelligenceMetricTile = memo(({ 
  title, 
  metrics, 
  subtitle,
  period,
  showTrends = false,
  ...baseTileProps 
}: IntelligenceMetricTileProps) => {
  // Convert metrics to array format if it's an object
  const metricEntries: MetricEntry[] = Array.isArray(metrics) 
    ? metrics 
    : Object.entries(metrics).map(([label, value]) => ({
        label,
        value,
        status: 'good' as const
      }));

  return (
    <BaseTile 
      size="md" 
      variant="default" 
      status="normal"
      interactive="hover"
      {...baseTileProps}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-mono font-medium text-text-primary uppercase tracking-wide">
            {title}
          </h3>
          {period && (
            <span className="text-xs text-text-secondary font-mono">
              {period}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-text-secondary font-mono">
            {subtitle}
          </p>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="space-y-4">
        {metricEntries.map((metric, index) => (
          <div key={`${metric.label}-${index}`} className="flex items-center justify-between py-2 border-b border-glass-border/30 last:border-b-0">
            <div className="flex-1">
              <div className="text-xs text-text-secondary font-mono uppercase tracking-wide">
                {metric.label}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {showTrends && metric.trend && getTrendIcon(metric.trend)}
              
              <div className="text-right">
                <div className={cn(
                  "text-sm font-mono font-bold",
                  getStatusColor(metric.status)
                )}>
                  {formatValue(metric.value)}
                  {metric.unit && (
                    <span className="text-xs text-text-secondary ml-1">
                      {metric.unit}
                    </span>
                  )}
                </div>
                
                {metric.change !== undefined && (
                  <div className={cn(
                    "text-xs font-mono",
                    metric.change > 0 ? "text-positive" : 
                    metric.change < 0 ? "text-negative" : "text-text-secondary"
                  )}>
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Glass overlay effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-btc-primary/5 via-transparent to-btc-glow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </BaseTile>
  );
});

IntelligenceMetricTile.displayName = "IntelligenceMetricTile";