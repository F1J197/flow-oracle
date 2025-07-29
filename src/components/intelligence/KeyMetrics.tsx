import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatNumber, formatPercentage, formatCurrency, getStatusColor } from "@/utils/formatting";

interface KeyMetric {
  label: string;
  value: number | string | ReactNode;
  unit?: string;
  status?: 'positive' | 'negative' | 'neutral' | 'warning' | 'critical';
  format?: 'number' | 'percentage' | 'currency' | 'custom';
  decimals?: number;
  compact?: boolean;
}

interface KeyMetricsProps {
  metrics: KeyMetric[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export const KeyMetrics = ({ 
  metrics, 
  columns = 3, 
  className 
}: KeyMetricsProps) => {
  const formatValue = (metric: KeyMetric): string | ReactNode => {
    if (typeof metric.value !== 'number' || metric.format === 'custom') {
      return metric.value;
    }

    const options = {
      decimals: metric.decimals || 2,
      compact: metric.compact || false,
      showSign: metric.status === 'positive' || metric.status === 'negative'
    };

    switch (metric.format) {
      case 'currency':
        return formatCurrency(metric.value, options);
      case 'percentage':
        return formatPercentage(metric.value, { 
          decimals: options.decimals, 
          showSign: options.showSign 
        });
      case 'number':
      default:
        return formatNumber(metric.value, options);
    }
  };

  return (
    <div className={cn(
      "key-metrics-grid",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-3", 
      columns === 4 && "grid-cols-4",
      className
    )}>
      {metrics.map((metric, index) => (
        <div key={index} className="key-metric-card group">
          <div className="key-metric-label">
            {metric.label}
          </div>
          
          <div className={cn(
            "key-metric-value",
            metric.status && getStatusColor(metric.status)
          )}>
            {formatValue(metric)}
            {metric.unit && (
              <span className="key-metric-unit">
                {metric.unit}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};