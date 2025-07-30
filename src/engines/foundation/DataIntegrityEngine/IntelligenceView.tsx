import React from 'react';
import { TerminalLayout } from '@/components/intelligence/TerminalLayout';
import { TerminalMetricGrid } from '@/components/intelligence/TerminalMetricGrid';
import { TerminalDataSection } from '@/components/intelligence/TerminalDataSection';
import { TerminalDataRow } from '@/components/intelligence/TerminalDataRow';
import type { DataIntegrityMetrics, SourceHealth } from './types';

interface DataIntegrityIntelligenceViewProps {
  data?: DataIntegrityMetrics;
  sources?: SourceHealth[];
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export const DataIntegrityIntelligenceView: React.FC<DataIntegrityIntelligenceViewProps> = ({
  data,
  sources = [],
  loading = false,
  error = null,
  className
}) => {
  const metrics = data;

  if (loading) {
    return (
      <TerminalLayout 
        title="DATA INTEGRITY ENGINE" 
        status="offline" 
        className={className}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-glass-bg terminal-panel rounded"></div>
          <div className="h-4 bg-glass-bg w-3/4 terminal-panel rounded"></div>
          <div className="h-4 bg-glass-bg w-1/2 terminal-panel rounded"></div>
        </div>
      </TerminalLayout>
    );
  }

  if (error || !metrics) {
    return (
      <TerminalLayout 
        title="DATA INTEGRITY ENGINE" 
        status="critical" 
        className={className}
      >
        <div className="text-center text-neon-orange">
          {error || "No data available"}
        </div>
      </TerminalLayout>
    );
  }

  // Determine overall status
  const status = metrics.integrityScore >= 95 ? 'active' : 
                 metrics.integrityScore >= 90 ? 'warning' : 'critical';

  // Key metrics for the grid display
  const keyMetrics = [
    {
      label: "Integrity Score",
      value: `${metrics.integrityScore.toFixed(1)}%`,
      status: metrics.integrityScore >= 95 ? 'positive' as const : 
              metrics.integrityScore >= 90 ? 'neutral' as const : 'negative' as const
    },
    {
      label: "Active Sources",
      value: `${metrics.activeSources}/${metrics.totalSources}`,
      status: metrics.activeSources === metrics.totalSources ? 'positive' as const : 'warning' as const
    },
    {
      label: "Consensus Level",
      value: `${metrics.consensusLevel?.toFixed(1) || '--'}%`,
      status: (metrics.consensusLevel || 0) >= 95 ? 'positive' as const : 'neutral' as const
    },
    {
      label: "P95 Latency",
      value: `${metrics.p95Latency || '--'}ms`,
      status: (metrics.p95Latency || 0) < 200 ? 'positive' as const : 'warning' as const
    }
  ];

  return (
    <TerminalLayout 
      title="DATA INTEGRITY ENGINE" 
      status={status} 
      className={className}
    >
      <div className="space-y-6">
        {/* Key Metrics Grid */}
        <TerminalMetricGrid metrics={keyMetrics} columns={2} />
        
        {/* System Overview Section */}
        <TerminalDataSection title="SYSTEM OVERVIEW">
          <TerminalDataRow 
            label="Integrity Score" 
            value={`${metrics.integrityScore.toFixed(1)}%`}
            status={metrics.integrityScore >= 95 ? 'positive' : 
                   metrics.integrityScore >= 90 ? 'neutral' : 'negative'}
          />
          <TerminalDataRow 
            label="System Status" 
            value={metrics.systemStatus}
            status={metrics.systemStatus === 'OPTIMAL' ? 'positive' : 
                   metrics.systemStatus === 'GOOD' ? 'neutral' : 'negative'}
          />
          <TerminalDataRow 
            label="Active Sources" 
            value={`${metrics.activeSources}/${metrics.totalSources}`}
            status={metrics.activeSources === metrics.totalSources ? 'positive' : 'warning'}
          />
          <TerminalDataRow 
            label="Last Validation" 
            value={new Date(metrics.lastValidation).toLocaleTimeString()}
            status="neutral"
          />
        </TerminalDataSection>

        {/* Data Quality Section */}
        <TerminalDataSection title="DATA QUALITY">
          <TerminalDataRow 
            label="Consensus Level" 
            value={`${metrics.consensusLevel?.toFixed(1) || '--'}%`}
            status={(metrics.consensusLevel || 0) >= 95 ? 'positive' : 'neutral'}
          />
          <TerminalDataRow 
            label="P95 Latency" 
            value={`${metrics.p95Latency || '--'}ms`}
            status={(metrics.p95Latency || 0) < 200 ? 'positive' : 'warning'}
          />
          <TerminalDataRow 
            label="Error Rate" 
            value={`${((metrics.errorRate || 0) * 100).toFixed(3)}%`}
            status={(metrics.errorRate || 0) < 0.01 ? 'positive' : 'warning'}
          />
          <TerminalDataRow 
            label="Completeness" 
            value={`${metrics.completeness?.toFixed(1) || '--'}%`}
            status={(metrics.completeness || 0) > 99 ? 'positive' : 'neutral'}
          />
        </TerminalDataSection>

        {/* Individual Source Health */}
        {sources.length > 0 && (
          <TerminalDataSection title="SOURCE HEALTH">
            {sources.map((source) => (
              <TerminalDataRow 
                key={source.id}
                label={source.name}
                value={`${source.status.toUpperCase()} (${source.reliability.toFixed(1)}%)`}
                status={
                  source.status === 'active' ? 'positive' :
                  source.status === 'degraded' ? 'warning' : 'negative'
                }
              />
            ))}
          </TerminalDataSection>
        )}

        {/* Self-Healing Status */}
        <TerminalDataSection title="SELF-HEALING STATUS">
          <TerminalDataRow 
            label="Auto-Healed (24h)" 
            value={metrics.autoHealed24h?.toString() || '0'}
            status="positive"
          />
          <TerminalDataRow 
            label="Data Freshness" 
            value={`${metrics.dataFreshness || '--'}s`}
            status={(metrics.dataFreshness || 0) < 60 ? 'positive' : 'warning'}
          />
          <TerminalDataRow 
            label="Validation Count" 
            value="Active"
            status="positive"
          />
          <TerminalDataRow 
            label="System Resilience" 
            value={metrics.integrityScore >= 95 ? "HIGH" : 
                   metrics.integrityScore >= 90 ? "MODERATE" : "LOW"}
            status={metrics.integrityScore >= 95 ? 'positive' : 
                   metrics.integrityScore >= 90 ? 'neutral' : 'negative'}
          />
        </TerminalDataSection>
      </div>
    </TerminalLayout>
  );
};