import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TerminalMetric {
  label: string;
  value: string | number;
  status?: 'positive' | 'negative' | 'neutral' | 'warning' | 'critical';
}

interface TerminalMetricGridProps {
  metrics: TerminalMetric[];
  columns?: 1 | 2 | 3;
  className?: string;
}

export const TerminalMetricGrid = ({ metrics, columns = 2, className }: TerminalMetricGridProps) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'positive': return 'text-neon-lime';
      case 'negative': return 'text-neon-orange';
      case 'warning': return 'text-neon-gold';
      case 'critical': return 'text-neon-fuchsia';
      default: return 'text-text-data';
    }
  };

  return (
    <div className={cn(
      "terminal-metric-grid",
      columns === 1 && "terminal-metric-grid-1",
      columns === 2 && "terminal-metric-grid-2", 
      columns === 3 && "terminal-metric-grid-3",
      className
    )}>
      {metrics.map((metric, index) => (
        <div key={index} className="terminal-metric-item">
          <div className="terminal-metric-label">{metric.label}</div>
          <div className={cn("terminal-metric-value", getStatusColor(metric.status))}>
            {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
          </div>
        </div>
      ))}
    </div>
  );
};