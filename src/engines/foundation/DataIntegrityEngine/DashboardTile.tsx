import React from 'react';
import { TerminalTile } from '@/components/Terminal';
import { cn } from '@/lib/utils';
import type { DataIntegrityMetrics } from './types';

interface DataIntegrityDashboardTileProps {
  data?: DataIntegrityMetrics;
  loading?: boolean;
  error?: string | null;
  onClick?: () => void;
  className?: string;
}

export const DataIntegrityDashboardTile: React.FC<DataIntegrityDashboardTileProps> = ({
  data,
  loading = false,
  error = null,
  onClick,
  className
}) => {
  const metrics = data;

  // Calculate status based on integrity score
  const getStatus = (score?: number) => {
    if (!score) return 'normal';
    if (score >= 95) return 'normal';
    if (score >= 90) return 'warning';
    return 'critical';
  };

  // Calculate trend based on integrity score
  const getTrend = (score?: number) => {
    if (!score) return 'neutral';
    if (score >= 98) return 'up';
    if (score <= 85) return 'down';
    return 'neutral';
  };

  const status = getStatus(metrics?.integrityScore);
  const trend = getTrend(metrics?.integrityScore);

  return (
    <TerminalTile
      title="Data Integrity"
      status={status}
      size="md"
      onClick={onClick}
      className={cn("data-integrity-tile", className)}
    >
      <div className="space-y-3">
        {/* Primary Metric */}
        <div className="text-center">
          <div className="terminal-metric-primary text-3xl font-bold text-text-data">
            {loading ? "..." : metrics ? `${metrics.integrityScore.toFixed(1)}%` : "--"}
          </div>
          <div className="terminal-metric-secondary text-sm text-text-secondary mt-1">
            {loading ? "Loading..." : metrics ? 
              `${metrics.activeSources}/${metrics.totalSources} sources` : 
              "-- sources"}
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
            {loading ? "LOADING..." : metrics?.systemStatus || "NO DATA"}
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
              <span>Consensus</span>
              <span className="text-text-data">{metrics.consensusLevel.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Latency</span>
              <span className="text-text-data">{metrics.p95Latency}ms</span>
            </div>
          </div>
        )}
      </div>
    </TerminalTile>
  );
};