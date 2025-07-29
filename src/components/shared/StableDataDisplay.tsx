import { cn } from "@/lib/utils";
import { useStableData } from "@/hooks/useStableData";
import { useState, useEffect } from "react";

interface StableDataDisplayProps {
  value: string | number;
  label?: string;
  trend?: 'up' | 'down' | 'neutral';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'teal' | 'orange' | 'lime' | 'gold' | 'fuchsia' | 'btc' | 'btc-light' | 'btc-glow' | 'btc-muted' | 'default';
  suffix?: string;
  loading?: boolean;
  stabilityConfig?: {
    changeThreshold?: number;
    debounceMs?: number;
    smoothingFactor?: number;
  };
}

export const StableDataDisplay = ({
  value,
  label,
  trend,
  size = 'md',
  color = 'default',
  suffix,
  loading = false,
  stabilityConfig = {}
}: StableDataDisplayProps) => {
  const [debouncedLoading, setDebouncedLoading] = useState(loading);
  const { value: stableValue, isChanging } = useStableData(value, {
    changeThreshold: 0.03, // 3% threshold
    debounceMs: 2000, // 2 second debounce
    smoothingFactor: 0.8, // Strong smoothing
    ...stabilityConfig
  });

  // Debounce loading state to reduce flickering
  useEffect(() => {
    if (loading) {
      setDebouncedLoading(true);
    } else {
      const timeout = setTimeout(() => {
        setDebouncedLoading(false);
      }, 500); // 500ms delay before hiding loading
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  if (debouncedLoading) {
    return (
      <div className="space-y-2">
        <div className={cn(
          "soft-shimmer rounded", // Using softer shimmer
          size === 'sm' && "h-6 w-16",
          size === 'md' && "h-8 w-24",
          size === 'lg' && "h-10 w-32",
          size === 'xl' && "h-12 w-40"
        )}></div>
        {label && <div className="soft-shimmer h-4 w-20 rounded"></div>}
      </div>
    );
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <span className="btc-light">↗</span>;
      case 'down':
        return <span className="btc-muted">↘</span>;
      default:
        return null;
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'teal':
        return 'btc-orange';
      case 'orange':
        return 'btc-orange-dark';
      case 'lime':
        return 'btc-orange-bright';
      case 'gold':
        return 'btc-orange-light';
      case 'fuchsia':
        return 'btc-orange-muted';
      case 'btc':
        return 'btc-primary';
      case 'btc-light':
        return 'btc-light';
      case 'btc-glow':
        return 'btc-glow';
      case 'btc-muted':
        return 'btc-muted';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-baseline space-x-2">
        <span
          className={cn(
            "font-bold tracking-wide font-mono transition-all duration-300 ease-out",
            size === 'sm' && "text-lg",
            size === 'md' && "text-xl",
            size === 'lg' && "text-2xl",
            size === 'xl' && "text-3xl",
            getColorClass(),
            isChanging && "scale-105 opacity-90" // Subtle change indicator
          )}
        >
          {stableValue}
          {suffix && <span className="text-sm ml-1">{suffix}</span>}
        </span>
        {getTrendIcon()}
      </div>
      {label && (
        <p className="text-xs text-text-muted uppercase tracking-wider">
          {label}
        </p>
      )}
    </div>
  );
};