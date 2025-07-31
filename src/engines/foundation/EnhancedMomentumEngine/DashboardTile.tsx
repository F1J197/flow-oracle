import React from 'react';
import { TerminalTile } from '@/components/Terminal';
import { cn } from '@/lib/utils';
import type { MomentumMetrics } from './types';

interface EnhancedMomentumDashboardTileProps {
  data?: MomentumMetrics;
  loading?: boolean;
  error?: string | null;
  onClick?: () => void;
  className?: string;
}

export const EnhancedMomentumDashboardTile: React.FC<EnhancedMomentumDashboardTileProps> = ({
  data,
  loading = false,
  error = null,
  onClick,
  className
}) => {
  const metrics = data;

  // Calculate status based on composite score and confidence
  const getStatus = (score?: number, confidence?: number) => {
    if (!score || !confidence) return 'normal';
    if (confidence < 50) return 'warning';
    if (Math.abs(score) > 15) return 'critical';
    return 'normal';
  };

  // Calculate trend based on composite score
  const getTrend = (score?: number) => {
    if (!score) return 'neutral';
    if (score > 5) return 'up';
    if (score < -5) return 'down';
    return 'neutral';
  };

  const status = getStatus(metrics?.composite.value, metrics?.composite.confidence);
  const trend = getTrend(metrics?.composite.value);

  return (
    <TerminalTile
      title="Enhanced Momentum"
      status={status}
      size="md"
      onClick={onClick}
      className={cn("enhanced-momentum-tile", className)}
    >
      <div className="space-y-3">
        {/* Primary Metric */}
        <div className="text-center">
          <div className="terminal-metric-primary text-3xl font-bold text-text-data">
            {loading ? "..." : metrics ? `${metrics.composite.value.toFixed(1)}%` : "--"}
          </div>
          <div className="terminal-metric-secondary text-sm text-text-secondary mt-1">
            {loading ? "Loading..." : metrics ? 
              metrics.composite.category : 
              "-- category"}
          </div>
        </div>

        {/* Status and Action */}
        <div className="flex items-center justify-between">
          <div className={cn(
            "terminal-status text-xs font-mono px-2 py-1 rounded",
            status === 'critical' ? "bg-neon-fuchsia/20 text-neon-fuchsia" :
            status === 'warning' ? "bg-neon-gold/20 text-neon-gold" :
            "bg-neon-teal/20 text-neon-teal"
          )}>
            {loading ? "LOADING..." : metrics?.composite.regime || "NO DATA"}
          </div>
          
          {!loading && (
            <div className={cn(
              "text-xs",
              trend === 'up' ? "text-neon-lime" :
              trend === 'down' ? "text-neon-orange" :
              "text-text-secondary"
            )}>
              {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '●'}
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="text-xs text-neon-orange text-center">
            {error}
          </div>
        )}

        {/* Quality Indicators */}
        {metrics && !loading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Confidence</span>
              <span className="text-text-data">{metrics.composite.confidence.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Alerts</span>
              <span className={cn(
                "text-text-data",
                metrics.alerts.length > 0 ? "text-neon-orange" : "text-neon-teal"
              )}>
                {metrics.alerts.length}
              </span>
            </div>
          </div>
        )}

        {/* Mini Chart Placeholder */}
        {metrics && !loading && (
          <div className="h-8 bg-glass-bg rounded border border-glass-border flex items-center justify-center">
            <div className="text-xs text-text-secondary">
              Lead: {metrics.composite.leadTime.toFixed(1)}w
            </div>
          </div>
        )}
      </div>
    </TerminalTile>
  );
};