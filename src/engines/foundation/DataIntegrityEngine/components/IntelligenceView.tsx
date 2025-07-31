import React from 'react';
import { TerminalLayout } from '@/components/intelligence/TerminalLayout';
import { TerminalMetricGrid } from '@/components/intelligence/TerminalMetricGrid';
import { TerminalDataSection } from '@/components/intelligence/TerminalDataSection';
import { TerminalDataRow } from '@/components/intelligence/TerminalDataRow';
import { EngineOutput } from '@/engines/BaseEngine';

interface Props {
  data: EngineOutput | null;
  historicalData?: any[];
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export const DataIntegrityIntelligenceView: React.FC<Props> = ({ 
  data, 
  historicalData, 
  loading = false, 
  error = null,
  className 
}) => {
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

  if (error || !data) {
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
  const status = (data.primaryMetric?.value ?? 0) >= 95 ? 'active' : 
                 (data.primaryMetric?.value ?? 0) >= 80 ? 'warning' : 'critical';

  // Key metrics for the grid display
  const keyMetrics = [
    {
      label: "Overall Score",
      value: `${(data.primaryMetric?.value ?? 0).toFixed(1)}%`,
      status: (data.primaryMetric?.value ?? 0) >= 95 ? 'positive' as const : 
              (data.primaryMetric?.value ?? 0) >= 80 ? 'neutral' as const : 'negative' as const
    },
    {
      label: "24h Change",
      value: `${(data.primaryMetric?.change24h ?? 0) >= 0 ? '+' : ''}${(data.primaryMetric?.changePercent ?? 0).toFixed(2)}%`,
      status: (data.primaryMetric?.change24h ?? 0) >= 0 ? 'positive' as const : 'negative' as const
    },
    {
      label: "Confidence",
      value: `${(data.confidence ?? 0).toFixed(1)}%`,
      status: (data.confidence ?? 0) >= 95 ? 'positive' as const : 'neutral' as const
    },
    {
      label: "Active Alerts",
      value: `${data.alerts?.length || 0}`,
      status: (data.alerts?.length || 0) === 0 ? 'positive' as const : 'warning' as const
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
            label="Overall Score" 
            value={`${(data.primaryMetric?.value ?? 0).toFixed(2)}%`}
            status={(data.primaryMetric?.value ?? 0) >= 95 ? 'positive' : 
                   (data.primaryMetric?.value ?? 0) >= 80 ? 'neutral' : 'negative'}
          />
          <TerminalDataRow 
            label="24h Change" 
            value={`${(data.primaryMetric?.change24h ?? 0) >= 0 ? '+' : ''}${(data.primaryMetric?.changePercent ?? 0).toFixed(2)}%`}
            status={(data.primaryMetric?.change24h ?? 0) >= 0 ? 'positive' : 'negative'}
          />
          <TerminalDataRow 
            label="Confidence Level" 
            value={`${(data.confidence ?? 0).toFixed(1)}%`}
            status={(data.confidence ?? 0) >= 95 ? 'positive' : 'neutral'}
          />
          <TerminalDataRow 
            label="Last Updated" 
            value={new Date().toLocaleTimeString()}
            status="neutral"
          />
        </TerminalDataSection>

        {/* Health Metrics Section */}
        <TerminalDataSection title="HEALTH METRICS">
          <TerminalDataRow 
            label="Total Indicators" 
            value={data.subMetrics?.totalIndicators || 0}
            status="neutral"
          />
          <TerminalDataRow 
            label="Healthy Indicators" 
            value={data.subMetrics?.healthyIndicators || 0}
            status="positive"
          />
          <TerminalDataRow 
            label="Warning Issues" 
            value={data.subMetrics?.warningIssues || 0}
            status={(data.subMetrics?.warningIssues || 0) === 0 ? 'positive' : 'warning'}
          />
          <TerminalDataRow 
            label="Critical Issues" 
            value={data.subMetrics?.criticalIssues || 0}
            status={(data.subMetrics?.criticalIssues || 0) === 0 ? 'positive' : 'critical'}
          />
          <TerminalDataRow 
            label="Healing Attempts" 
            value={data.subMetrics?.healingAttempts || 0}
            status="neutral"
          />
        </TerminalDataSection>

        {/* Active Alerts Section */}
        {data.alerts && data.alerts.length > 0 && (
          <TerminalDataSection title="ACTIVE ALERTS">
            {data.alerts.map((alert, idx) => (
              <TerminalDataRow 
                key={idx}
                label={`[${alert.level.toUpperCase()}]`}
                value={`${alert.message} (${new Date(alert.timestamp).toLocaleTimeString()})`}
                status={
                  alert.level === 'critical' ? 'critical' :
                  alert.level === 'warning' ? 'warning' : 'neutral'
                }
              />
            ))}
          </TerminalDataSection>
        )}

        {/* System Analysis Section */}
        <TerminalDataSection title="SYSTEM ANALYSIS">
          <div className="terminal-analysis-text">
            {data.analysis || 'Analysis not available'}
          </div>
        </TerminalDataSection>
      </div>
    </TerminalLayout>
  );
};