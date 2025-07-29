import { cn } from "@/lib/utils";

interface Metric {
  label: string;
  value: string | number;
  change?: number;
  status?: 'positive' | 'negative' | 'neutral';
  unit?: string;
}

interface KeyMetricsProps {
  metrics: Metric[];
  className?: string;
}

export const KeyMetrics = ({ metrics, className }: KeyMetricsProps) => {
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-btc-primary';
    if (change < 0) return 'text-btc-error';
    return 'text-text-muted';
  };

  return (
    <div className={cn("key-metrics", className)}>
      {metrics.map((metric, index) => (
        <div key={index} className="metric-card">
          <div className="metric-label">
            {metric.label}
          </div>
          
          <div className={cn(
            "metric-value",
            metric.status === 'positive' && "text-btc-primary",
            metric.status === 'negative' && "text-btc-error",
            metric.status === 'neutral' && "text-text-primary"
          )}>
            {typeof metric.value === 'number' 
              ? metric.value.toLocaleString('en-US', { 
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 0 
                })
              : metric.value
            }
            {metric.unit && (
              <span className="text-sm text-text-muted ml-1">
                {metric.unit}
              </span>
            )}
          </div>
          
          {metric.change !== undefined && (
            <div className={cn("metric-change", getChangeColor(metric.change))}>
              {formatChange(metric.change)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};