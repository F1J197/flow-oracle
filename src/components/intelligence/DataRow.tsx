import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { getStatusColor, getValueColor } from "@/utils/formatting";

interface DataRowProps {
  label: string;
  value: string | number | ReactNode;
  unit?: string;
  status?: 'positive' | 'negative' | 'neutral' | 'warning' | 'critical' | 'updating';
  className?: string;
}

export const DataRow = ({ label, value, unit, status, className }: DataRowProps) => {
  const formatValue = (val: string | number | ReactNode) => {
    if (typeof val === 'number') {
      return val.toLocaleString('en-US', { 
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
      });
    }
    return val;
  };

  // Auto-detect color for numeric values if no status provided
  const getColor = () => {
    if (status && status !== 'updating') {
      return getStatusColor(status as 'positive' | 'negative' | 'neutral' | 'warning' | 'critical');
    }
    if (typeof value === 'number') {
      return getValueColor(value);
    }
    return 'text-text-primary';
  };

  return (
    <div className={cn("data-row data-columns", className)}>
      <span className="text-text-secondary font-medium text-sm">
        {label}:
      </span>
      
      <span className={cn(
        "data-value font-medium tabular-nums text-sm",
        getColor(),
        status === 'updating' && "updating"
      )}>
        {formatValue(value)}
      </span>
      
      {unit && (
        <span className="text-text-muted text-xs font-normal">
          {unit}
        </span>
      )}
    </div>
  );
};