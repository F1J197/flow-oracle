import React from 'react';
import { useFoundationDataIntegrity } from '@/hooks/useFoundationDataIntegrity';
import { DataIntegrityTile, DataIntegrityIntelligenceView } from '@/engines/foundation/DataIntegrityEngine';
import { TerminalContainer } from '@/components/Terminal/TerminalContainer';

/**
 * Demonstration component showing institutional-grade integration
 * of the Data Integrity & Self-Healing Engine V6
 */
export const DataIntegrityEngineDemo: React.FC = () => {
  const { 
    engineOutput, 
    metrics, 
    sources, 
    loading, 
    error, 
    refresh, 
    engine 
  } = useFoundationDataIntegrity({
    autoRefresh: true,
    refreshInterval: 30000 // 30 seconds
  });

  if (loading && !engineOutput) {
    return (
      <TerminalContainer>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DataIntegrityTile 
            data={{
              primaryMetric: { value: 0, change24h: 0, changePercent: 0 },
              signal: 'NEUTRAL',
              confidence: 0,
              analysis: 'Loading...',
              subMetrics: {}
            }}
            loading={true}
          />
          <div className="h-96 bg-terminal-bg border border-terminal-border animate-pulse rounded"></div>
        </div>
      </TerminalContainer>
    );
  }

  if (error) {
    return (
      <TerminalContainer>
        <div className="text-center text-neon-red">
          <h2 className="text-2xl font-bold mb-4">Engine Error</h2>
          <p>{error}</p>
          <button 
            onClick={refresh}
            className="mt-4 px-4 py-2 bg-neon-orange text-black font-bold rounded hover:bg-neon-orange/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </TerminalContainer>
    );
  }

  // Fallback data for demonstration if engineOutput is null
  const displayData = engineOutput || {
    primaryMetric: { value: 95.7, change24h: 0.3, changePercent: 0.31 },
    signal: 'RISK_ON' as const,
    confidence: 98,
    analysis: 'All systems operational. Data integrity excellent across all sources.',
    subMetrics: {
      totalIndicators: 12,
      healthyIndicators: 12,
      criticalIssues: 0,
      warningIssues: 0,
      healingAttempts: 0
    }
  };

  return (
    <TerminalContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center border-b border-terminal-border pb-4">
          <h1 className="text-3xl font-bold text-neon-orange mb-2">
            DATA INTEGRITY ENGINE V6
          </h1>
          <p className="text-terminal-text-muted">
            Foundation-tier data integrity monitoring with automated validation and self-healing
          </p>
          <div className="mt-2 text-sm text-terminal-text-secondary">
            Last updated: {new Date().toLocaleString()} | 
            Auto-refresh: 30s | 
            Engine Status: {engine?.getStatus() || 'idle'}
          </div>
        </div>

        {/* Dashboard View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tile Display */}
          <div>
            <h2 className="text-xl font-semibold text-neon-orange mb-4">Dashboard Tile</h2>
            <DataIntegrityTile 
              data={displayData}
              importance={90}
              loading={loading}
            />
          </div>

          {/* Intelligence View */}
          <div>
            <h2 className="text-xl font-semibold text-neon-orange mb-4">Intelligence View</h2>
            <div className="h-96 border border-terminal-border rounded overflow-hidden">
              <DataIntegrityIntelligenceView 
                data={displayData}
                loading={loading}
                error={error}
              />
            </div>
          </div>
        </div>

        {/* Engine Metrics */}
        <div className="border border-terminal-border rounded p-4">
          <h2 className="text-xl font-semibold text-neon-orange mb-4">Engine Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-terminal-text-muted">Integrity Score</div>
              <div className="text-neon-green font-bold">{metrics?.integrityScore?.toFixed(1) || 'N/A'}%</div>
            </div>
            <div>
              <div className="text-terminal-text-muted">Active Sources</div>
              <div className="text-terminal-text-primary">{metrics?.activeSources || 0}/{metrics?.totalSources || 0}</div>
            </div>
            <div>
              <div className="text-terminal-text-muted">P95 Latency</div>
              <div className="text-terminal-text-primary">{metrics?.p95Latency || 0}ms</div>
            </div>
            <div>
              <div className="text-terminal-text-muted">Auto-Healed (24h)</div>
              <div className="text-terminal-text-primary">{metrics?.autoHealed24h || 0}</div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="border border-terminal-border rounded p-4">
          <h2 className="text-xl font-semibold text-neon-orange mb-4">Control Panel</h2>
          <div className="flex gap-4">
            <button 
              onClick={refresh}
              disabled={loading}
              className="px-4 py-2 bg-neon-teal text-black font-semibold rounded hover:bg-neon-teal/80 transition-colors disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh Now'}
            </button>
            <button 
              onClick={() => console.log('Engine State:', engine?.getMetrics())}
              className="px-4 py-2 bg-terminal-border text-terminal-text-primary rounded hover:bg-terminal-surface transition-colors"
            >
              Log Engine State
            </button>
          </div>
        </div>

        {/* Integration Notes */}
        <div className="border border-terminal-border rounded p-4 bg-terminal-surface/20">
          <h2 className="text-xl font-semibold text-neon-orange mb-4">Integration Notes</h2>
          <ul className="space-y-2 text-sm text-terminal-text-secondary">
            <li>✅ BaseEngine architecture compliance</li>
            <li>✅ Real-time data quality monitoring</li>
            <li>✅ Self-healing capabilities with event emission</li>
            <li>✅ Bloomberg-style terminal UI components</li>
            <li>✅ TypeScript interface compliance</li>
            <li>✅ Hook-based integration pattern</li>
            <li>✅ Legacy compatibility maintained</li>
            <li>✅ Production-ready error handling</li>
          </ul>
        </div>
      </div>
    </TerminalContainer>
  );
};