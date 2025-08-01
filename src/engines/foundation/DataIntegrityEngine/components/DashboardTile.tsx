import React from 'react';
import { EngineOutput } from '@/engines/BaseEngine';
import { TerminalBox } from '@/components/Terminal/TerminalBox';
import { TerminalMetric } from '@/components/Terminal/TerminalMetric';

interface Props {
  data: EngineOutput;
  importance?: number;
  loading?: boolean;
}

export const DataIntegrityTile: React.FC<Props> = ({ data, importance = 50, loading = false }) => {
  // Determine status based on data quality score
  const getStatus = (): 'active' | 'warning' | 'critical' | 'offline' => {
    if (loading) return 'offline';
    if (data.primaryMetric.value >= 95) return 'active';
    if (data.primaryMetric.value >= 80) return 'warning';
    return 'critical';
  };
  
  const getMetricStatus = (value: number): 'normal' | 'warning' | 'critical' | 'success' => {
    if (value >= 95) return 'success';
    if (value >= 80) return 'warning';
    return 'critical';
  };
  
  if (loading) {
    return (
      <TerminalBox 
        title="DATA INTEGRITY" 
        status="offline"
        height="200px"
      >
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-terminal-surface rounded"></div>
          <div className="h-4 bg-terminal-surface w-3/4 rounded"></div>
          <div className="h-4 bg-terminal-surface w-1/2 rounded"></div>
        </div>
      </TerminalBox>
    );
  }

  return (
    <TerminalBox 
      title="DATA INTEGRITY" 
      status={getStatus()}
      height="200px"
    >
      <div className="space-y-3 h-full flex flex-col">
        {/* Primary Metric */}
        <TerminalMetric
          label="System Score"
          value={`${data.primaryMetric.value.toFixed(1)}%`}
          status={getMetricStatus(data.primaryMetric.value)}
          size="xl"
        />
        
        {/* Health Status */}
        <TerminalMetric
          label="Active Sources"
          value={`${data.subMetrics?.healthyIndicators || 0}/${data.subMetrics?.totalIndicators || 0}`}
          status="normal"
          size="sm"
        />
        
        {/* Critical Issues Alert */}
        {data.subMetrics?.criticalIssues > 0 && (
          <div className="text-neon-red text-sm font-bold">
            ⚠ {data.subMetrics.criticalIssues} CRITICAL ISSUES
          </div>
        )}
        
        {/* 24h Change */}
        {data.primaryMetric.changePercent !== 0 && (
          <TerminalMetric
            label="24h Change"
            value={`${data.primaryMetric.changePercent >= 0 ? '+' : ''}${data.primaryMetric.changePercent.toFixed(2)}%`}
            status={data.primaryMetric.changePercent >= 0 ? 'success' : 'critical'}
            size="sm"
          />
        )}
        
        {/* Status Analysis */}
        <div className="text-xs text-terminal-text-muted border-t border-terminal-border pt-2 mt-auto">
          {data.analysis}
        </div>
      </div>
    </TerminalBox>
  );
};