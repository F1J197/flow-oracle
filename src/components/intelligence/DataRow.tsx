import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DataRowProps {
  label: string;
  value: string | number | ReactNode;
  unit?: string;
  status?: 'positive' | 'negative' | 'neutral' | 'updating';
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

  return (
    <div className={cn("data-row data-columns", className)}>
      <span className="text-text-secondary font-medium">
        {label}:
      </span>
      
      <span className={cn(
        "data-value font-semibold tabular-nums",
        status === 'positive' && "text-btc-primary",
        status === 'negative' && "text-btc-error", 
        status === 'neutral' && "text-text-primary",
        status === 'updating' && "updating"
      )}>
        {formatValue(value)}
      </span>
      
      {unit && (
        <span className="text-text-muted text-sm font-medium">
          {unit}
        </span>
      )}
    </div>
  );
};