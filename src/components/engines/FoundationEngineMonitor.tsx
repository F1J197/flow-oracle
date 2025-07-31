/**
 * Foundation Engine Monitor Component
 * Provides real-time monitoring and status display for foundation engines
 */

import React from 'react';
import { useFoundationDataIntegrity } from '@/hooks/useFoundationDataIntegrity';
import { useFoundationMomentum } from '@/hooks/useFoundationMomentum';
import { TerminalContainer } from '@/components/Terminal/TerminalContainer';
import { TerminalGrid } from '@/components/Terminal/TerminalGrid';
import { TerminalBox } from '@/components/Terminal/TerminalBox';
import { TerminalStatus } from '@/components/Terminal/TerminalStatus';

interface FoundationEngineMonitorProps {
  className?: string;
}

export const FoundationEngineMonitor: React.FC<FoundationEngineMonitorProps> = ({
  className = ''
}) => {
  const dataIntegrity = useFoundationDataIntegrity();
  const momentum = useFoundationMomentum();

  const getOverallStatus = () => {
    if (dataIntegrity.error || momentum.error) return 'critical';
    if (dataIntegrity.loading || momentum.loading) return 'warning';
    return 'online';
  };

  const getHealthScore = () => {
    const dataScore = dataIntegrity.metrics?.integrityScore || 0;
    const momentumConfidence = momentum.metrics?.confidence || 0;
    return Math.round((dataScore + momentumConfidence) / 2);
  };

  return (
    <TerminalContainer className={className}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Foundation Engine Monitor</h2>
          <TerminalStatus 
            status={getOverallStatus()} 
            label={`Health: ${getHealthScore()}%`}
          />
        </div>

        {/* Engine Status Grid */}
        <TerminalGrid className="grid-cols-1 md:grid-cols-2 gap-4">
          {/* Data Integrity Engine */}
          <TerminalBox
            title="Data Integrity Engine"
            status={dataIntegrity.error ? 'critical' : dataIntegrity.loading ? 'warning' : 'online'}
          >
            <div className="space-y-2">
              {dataIntegrity.loading && (
                <div className="text-text-secondary">Loading integrity metrics...</div>
              )}
              
              {dataIntegrity.error && (
                <div className="text-neon-orange">Error: {dataIntegrity.error}</div>
              )}
              
              {dataIntegrity.metrics && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Integrity Score:</span>
                    <span className="text-text-primary font-mono">
                      {dataIntegrity.metrics.integrityScore.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Active Sources:</span>
                    <span className="text-text-primary font-mono">
                      {dataIntegrity.metrics.activeSources}/{dataIntegrity.metrics.totalSources}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Status:</span>
                    <span className="text-text-primary font-mono">
                      {dataIntegrity.metrics.systemStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">P95 Latency:</span>
                    <span className="text-text-primary font-mono">
                      {dataIntegrity.metrics.p95Latency}ms
                    </span>
                  </div>
                </div>
              )}
            </div>
          </TerminalBox>

          {/* Enhanced Momentum Engine */}
          <TerminalBox
            title="Enhanced Momentum Engine"
            status={momentum.error ? 'critical' : momentum.loading ? 'warning' : 'online'}
          >
            <div className="space-y-2">
              {momentum.loading && (
                <div className="text-text-secondary">Loading momentum analysis...</div>
              )}
              
              {momentum.error && (
                <div className="text-neon-orange">Error: {momentum.error}</div>
              )}
              
              {momentum.metrics && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Composite Score:</span>
                    <span className="text-text-primary font-mono">
                      {momentum.metrics.composite.value.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Category:</span>
                    <span className="text-text-primary font-mono">
                      {momentum.metrics.composite.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Regime:</span>
                    <span className="text-text-primary font-mono">
                      {momentum.metrics.composite.regime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Confidence:</span>
                    <span className="text-text-primary font-mono">
                      {momentum.metrics.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Active Alerts:</span>
                    <span className="text-text-primary font-mono">
                      {momentum.alerts.length}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </TerminalBox>
        </TerminalGrid>

        {/* Summary Status */}
        <TerminalBox title="Foundation Layer Summary" status={getOverallStatus()}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-text-secondary text-sm">Overall Health</div>
              <div className="text-xl font-mono text-text-primary">{getHealthScore()}%</div>
            </div>
            <div className="space-y-1">
              <div className="text-text-secondary text-sm">Data Quality</div>
              <div className="text-xl font-mono text-text-primary">
                {dataIntegrity.metrics?.integrityScore.toFixed(0) || '--'}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-text-secondary text-sm">Momentum Signal</div>
              <div className="text-xl font-mono text-text-primary">
                {momentum.metrics?.trend?.toUpperCase() || '--'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-text-secondary text-sm">System Status</div>
              <div className="text-xl font-mono text-text-primary">
                {getOverallStatus().toUpperCase()}
              </div>
            </div>
          </div>
        </TerminalBox>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => {
              dataIntegrity.refresh();
              momentum.refresh();
            }}
            className="px-4 py-2 bg-neon-teal/20 text-neon-teal border border-neon-teal/30 
                       hover:bg-neon-teal/30 transition-colors font-mono text-sm"
          >
            REFRESH ALL
          </button>
          <button
            onClick={dataIntegrity.refresh}
            className="px-4 py-2 bg-glass-bg text-text-primary border border-glass-border 
                       hover:bg-glass-bg/50 transition-colors font-mono text-sm"
            disabled={dataIntegrity.loading}
          >
            REFRESH DATA INTEGRITY
          </button>
          <button
            onClick={momentum.refresh}
            className="px-4 py-2 bg-glass-bg text-text-primary border border-glass-border 
                       hover:bg-glass-bg/50 transition-colors font-mono text-sm"
            disabled={momentum.loading}
          >
            REFRESH MOMENTUM
          </button>
        </div>
      </div>
    </TerminalContainer>
  );
};