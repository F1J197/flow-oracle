import { ReactNode } from "react";
import { PremiumTile } from "./PremiumTile";
import { cn } from "@/lib/utils";

interface PremiumChartTileProps {
  title: string;
  chart: ReactNode;
  summary?: {
    value: string | number;
    label: string;
    change?: number;
    unit?: string;
  };
  size?: 'small' | 'medium' | 'large' | 'xl';
  variant?: 'default' | 'primary' | 'warning' | 'critical';
  status?: 'normal' | 'active' | 'warning' | 'critical';
  isLoading?: boolean;
  className?: string;
}

export const PremiumChartTile = ({
  title,
  chart,
  summary,
  size = 'medium',
  variant = 'default',
  status = 'normal',
  isLoading = false,
  className
}: PremiumChartTileProps) => {
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
          <div className="h-32 bg-glass-bg rounded animate-pulse" />
          {summary && (
            <div className="space-y-2">
              <div className="h-6 bg-glass-bg rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-glass-bg rounded w-1/3 animate-pulse" />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Statistics (if provided) */}
          {summary && (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-btc-primary">
                  {typeof summary.value === 'number' 
                    ? summary.value.toLocaleString() 
                    : summary.value}
                  {summary.unit}
                </div>
                <div className="text-xs text-text-secondary uppercase tracking-wider">
                  {summary.label}
                </div>
              </div>
              
              {summary.change !== undefined && (
                <div className={cn(
                  "text-sm font-medium px-2 py-1 rounded",
                  summary.change > 0 && "text-neon-teal bg-neon-teal/10",
                  summary.change < 0 && "text-neon-orange bg-neon-orange/10",
                  summary.change === 0 && "text-text-secondary bg-glass-bg"
                )}>
                  {summary.change > 0 ? '+' : ''}{summary.change.toFixed(2)}%
                </div>
              )}
            </div>
          )}

          {/* Chart Container */}
          <div className={cn(
            "relative overflow-hidden rounded-md",
            "bg-gradient-to-br from-glass-bg to-transparent",
            "border border-glass-border/50"
          )}>
            <div className="p-4">
              {chart}
            </div>
            
            {/* Chart Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-tile/20 to-transparent pointer-events-none" />
          </div>
        </div>
      )}
    </PremiumTile>
  );
};