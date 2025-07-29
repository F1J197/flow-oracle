import React, { useMemo } from 'react';
import { TerminalLayout } from './TerminalLayout';
import { TerminalMetricGrid } from './TerminalMetricGrid';
import { TerminalDataSection } from './TerminalDataSection';
import { TerminalDataRow } from './TerminalDataRow';
import { ZScoreHistogram } from './ZScoreHistogram';
import { useZScoreData } from '@/hooks/useZScoreData';
import { useStableData } from '@/hooks/useStableData';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Brain, Target } from 'lucide-react';

interface ZScoreIntelligenceViewProps {
  loading?: boolean;
  className?: string;
}

export const ZScoreIntelligenceView: React.FC<ZScoreIntelligenceViewProps> = ({ 
  loading: externalLoading, 
  className 
}) => {
  const { intelligenceData, loading, error, confidence, lastUpdate } = useZScoreData({
    autoRefresh: true,
    refreshInterval: 15000,
    includeDistribution: true
  });

  const isLoading = loading || externalLoading;

  // Mock data for consistent display when no real data
  const mockData = useStableData({
    composite: {
      value: -1.247,
      regime: 'AUTUMN',
      confidence: 0.87,
      components: Array.from({ length: 12 }, (_, i) => ({ id: i, value: Math.random() * 4 - 2 }))
    },
    dataQuality: {
      completeness: 0.96,
      freshness: 0.94,
      accuracy: 0.98,
      sourceCount: 15,
      validationsPassed: 14,
      validationsTotal: 15
    },
    distribution: {
      skewness: 0.23,
      kurtosis: 3.45,
      outlierCount: 2,
      histogram: []
    },
    institutionalInsights: [
      {
        title: "Significant Divergence Detected",
        description: "Current Z-score indicates potential mean reversion opportunity",
        type: "positioning",
        confidence: 0.85,
        timeframe: "medium_term",
        actionable: true
      }
    ],
    topExtremes: [
      { indicator: "VIX_SKEW", zscore: -2.45, percentile: 2.1, severity: "significant", value: 1.234 },
      { indicator: "CREDIT_SPREADS", zscore: 1.89, percentile: 94.3, severity: "notable", value: 0.876 }
    ]
  }).value;

  const data = intelligenceData || mockData;

  const keyMetrics = useMemo(() => [
    {
      label: "Composite Z-Score",
      value: data.composite.value.toFixed(3),
      status: Math.abs(data.composite.value) > 3 ? 'critical' as const : 
              Math.abs(data.composite.value) > 2 ? 'warning' as const : 'positive' as const
    },
    {
      label: "Signal Strength",
      value: `${(Math.abs(data.composite.value) * 25).toFixed(1)}%`,
      status: 'positive' as const
    },
    {
      label: "Regime Confidence",
      value: `${(data.composite.confidence * 100).toFixed(1)}%`,
      status: data.composite.confidence > 0.8 ? 'positive' as const : 'neutral' as const
    },
    {
      label: "Data Quality",
      value: `${((data.dataQuality.completeness + data.dataQuality.freshness + data.dataQuality.accuracy) / 3 * 100).toFixed(1)}%`,
      status: 'positive' as const
    }
  ], [data]);

  const getRegimeIcon = (regime: string) => {
    switch (regime) {
      case 'SPRING': return '🌱';
      case 'SUMMER': return '☀️';
      case 'AUTUMN': return '🍂';
      case 'WINTER': return '❄️';
      default: return '🌱';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'extreme': return '🔴';
      case 'significant': return '🟡';
      case 'notable': return '🟢';
      default: return '⚪';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positioning': return <Target className="w-4 h-4" />;
      case 'flow': return <TrendingUp className="w-4 h-4" />;
      case 'sentiment': return <Brain className="w-4 h-4" />;
      case 'technical': return <Activity className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <TerminalLayout title="ENHANCED Z-SCORE ENGINE" status="offline" className={className}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-glass-bg rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-glass-bg rounded w-3/4"></div>
            <div className="h-4 bg-glass-bg rounded w-1/2"></div>
            <div className="h-4 bg-glass-bg rounded w-2/3"></div>
          </div>
        </div>
      </TerminalLayout>
    );
  }

  if (error && !data) {
    return (
      <TerminalLayout title="ENHANCED Z-SCORE ENGINE" status="critical" className={className}>
        <div className="text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-neon-orange mx-auto" />
          <div className="text-sm text-text-secondary">
            {error || 'Failed to load Z-Score intelligence data'}
          </div>
        </div>
      </TerminalLayout>
    );
  }

  return (
    <TerminalLayout title="ENHANCED Z-SCORE ENGINE" status="active" className={className}>
      <div className="space-y-6">
        <TerminalMetricGrid metrics={keyMetrics} columns={2} />
        
        <TerminalDataSection title="COMPOSITE Z-SCORE">
          <TerminalDataRow 
            label="Current Value" 
            value={`${data.composite.value.toFixed(3)} σ`}
            status={Math.abs(data.composite.value) > 3 ? 'critical' : 
                   Math.abs(data.composite.value) > 2 ? 'warning' : 'positive'}
          />
          <TerminalDataRow 
            label="Market Regime" 
            value={`${getRegimeIcon(data.composite.regime)} ${data.composite.regime}`}
            status="positive"
          />
          <TerminalDataRow 
            label="Regime Confidence" 
            value={`${(data.composite.confidence * 100).toFixed(1)}%`}
            status={data.composite.confidence > 0.8 ? 'positive' : 'neutral'}
          />
          <TerminalDataRow 
            label="Component Count" 
            value={`${data.composite.components.length} windows`}
            status="neutral"
          />
        </TerminalDataSection>

        {/* Institutional Insights */}
        {data.institutionalInsights && data.institutionalInsights.length > 0 && (
          <TerminalDataSection title="INSTITUTIONAL INSIGHTS">
            {data.institutionalInsights.map((insight, index) => (
              <div key={index} className="space-y-2 p-3 bg-glass-bg rounded border-l-2 border-neon-teal">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <span className="text-sm font-medium text-text-primary">
                    {insight.title}
                  </span>
                  <span className="text-xs text-text-secondary">
                    ({(insight.confidence * 100).toFixed(0)}% confidence)
                  </span>
                </div>
                <div className="text-sm text-text-secondary">
                  {insight.description}
                </div>
                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  <span>Type: {insight.type.toUpperCase()}</span>
                  <span>Timeframe: {insight.timeframe.replace('_', ' ').toUpperCase()}</span>
                  {insight.actionable && <span className="text-neon-lime">ACTIONABLE</span>}
                </div>
              </div>
            ))}
          </TerminalDataSection>
        )}

        <TerminalDataSection title="DATA QUALITY METRICS">
          <TerminalDataRow 
            label="Completeness Score" 
            value={`${(data.dataQuality.completeness * 100).toFixed(1)}%`}
            status={data.dataQuality.completeness > 0.9 ? 'positive' : 'warning'}
          />
          <TerminalDataRow 
            label="Freshness Score" 
            value={`${(data.dataQuality.freshness * 100).toFixed(1)}%`}
            status={data.dataQuality.freshness > 0.8 ? 'positive' : 'warning'}
          />
          <TerminalDataRow 
            label="Accuracy Rating" 
            value={`${(data.dataQuality.accuracy * 100).toFixed(1)}%`}
            status={data.dataQuality.accuracy > 0.95 ? 'positive' : 'warning'}
          />
          <TerminalDataRow 
            label="Source Coverage" 
            value={`${data.dataQuality.sourceCount} sources`}
            status="neutral"
          />
          <TerminalDataRow 
            label="Validation Status" 
            value={`${data.dataQuality.validationsPassed}/${data.dataQuality.validationsTotal}`}
            status={data.dataQuality.validationsPassed === data.dataQuality.validationsTotal ? 'positive' : 'warning'}
          />
        </TerminalDataSection>

        <TerminalDataSection title="DISTRIBUTION ANALYSIS">
          <TerminalDataRow 
            label="Distribution Skewness" 
            value={data.distribution.skewness.toFixed(3)}
            status={Math.abs(data.distribution.skewness) > 1 ? 'warning' : 'positive'}
          />
          <TerminalDataRow 
            label="Kurtosis Level" 
            value={data.distribution.kurtosis.toFixed(3)}
            status={Math.abs(data.distribution.kurtosis) > 3 ? 'warning' : 'positive'}
          />
          <TerminalDataRow 
            label="Outlier Count" 
            value={`${data.distribution.outlierCount} removed`}
            status="neutral"
          />
          
          {data.distribution.histogram && data.distribution.histogram.length > 0 && (
            <div className="mt-4">
              <div className="text-sm text-text-secondary mb-2">Current Distribution:</div>
              <ZScoreHistogram
                bins={data.distribution.histogram}
                currentValue={data.composite.value}
                extremeThreshold={2.5}
                height={60}
              />
            </div>
          )}
        </TerminalDataSection>

        {/* Top Extremes */}
        {data.topExtremes && data.topExtremes.length > 0 && (
          <TerminalDataSection title="TOP EXTREMES BY Z-SCORE">
            {data.topExtremes.slice(0, 5).map((extreme, index) => (
              <TerminalDataRow 
                key={index}
                label={extreme.indicator} 
                value={`${extreme.zscore.toFixed(2)} (${extreme.percentile.toFixed(1)}%)`}
                status={extreme.severity === 'extreme' ? 'critical' : extreme.severity === 'significant' ? 'warning' : 'positive'}
              />
            ))}
          </TerminalDataSection>
        )}

        {/* Engine Status Footer */}
        <TerminalDataSection title="ENGINE STATUS">
          <TerminalDataRow 
            label="Last Update" 
            value={lastUpdate?.toLocaleTimeString() || 'Unknown'}
            status="neutral"
          />
          <TerminalDataRow 
            label="Engine Confidence" 
            value={`${(confidence * 100).toFixed(1)}%`}
            status={confidence > 0.8 ? 'positive' : 'neutral'}
          />
        </TerminalDataSection>
      </div>
    </TerminalLayout>
  );
};