import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { TerminalLayout } from '@/components/intelligence/TerminalLayout';
import { TerminalMetricGrid } from '@/components/intelligence/TerminalMetricGrid';
import { TerminalDataSection } from '@/components/intelligence/TerminalDataSection';
import { TerminalDataRow } from '@/components/intelligence/TerminalDataRow';
import { ZScoreHistogram } from '@/components/intelligence/ZScoreHistogram';
import { useZScoreData } from '@/hooks/useZScoreData';
import { useStableData } from '@/hooks/useStableData';
import { MarketRegime, InstitutionalInsight, HistogramBin } from '@/types/zscoreTypes';

interface ZScoreFoundationIntelligenceProps {
  loading?: boolean;
  className?: string;
}

export const ZScoreFoundationIntelligence: React.FC<ZScoreFoundationIntelligenceProps> = ({
  loading: externalLoading = false,
  className
}) => {
  const { intelligenceData, loading: dataLoading, error } = useZScoreData({
    autoRefresh: true,
    refreshInterval: 15000,
    includeDistribution: true
  });

  // Stable mock data for consistent display during development
  const mockData = useStableData({
    composite: {
      value: 2.47,
      regime: 'SPRING' as MarketRegime,
      confidence: 0.87,
      components: [],
      timestamp: new Date()
    },
    institutionalInsights: [
      {
        type: 'positioning' as const,
        title: 'Multi-Timeframe Confluence',
        description: 'All timeframes showing positive Z-scores indicating institutional accumulation',
        confidence: 0.89,
        timeframe: 'medium_term' as const,
        actionable: true
      },
      {
        type: 'flow' as const,
        title: 'Regime Transition Signal',
        description: 'Statistical indicators suggest WINTER → SPRING regime transition',
        confidence: 0.76,
        timeframe: 'short_term' as const,
        actionable: true
      }
    ],
    dataQuality: {
      completeness: 0.94,
      freshness: 0.88,
      accuracy: 0.97,
      sourceCount: 8,
      validationsPassed: 22,
      validationsTotal: 24
    },
    multiTimeframe: [],
    distribution: {
      histogram: [
      { range: [-4, -3] as [number, number], count: 2, percentage: 3.1, isHighlighted: false, color: 'neon-orange' as const },
      { range: [-3, -2] as [number, number], count: 8, percentage: 12.5, isHighlighted: false, color: 'neon-orange' as const },
      { range: [-2, -1] as [number, number], count: 15, percentage: 23.4, isHighlighted: true, color: 'neon-teal' as const },
      { range: [-1, 0] as [number, number], count: 18, percentage: 28.1, isHighlighted: true, color: 'neon-lime' as const },
      { range: [0, 1] as [number, number], count: 12, percentage: 18.8, isHighlighted: false, color: 'neon-teal' as const },
      { range: [1, 2] as [number, number], count: 7, percentage: 10.9, isHighlighted: false, color: 'text-muted' as const },
      { range: [2, 3] as [number, number], count: 2, percentage: 3.1, isHighlighted: false, color: 'text-muted' as const }
      ] as HistogramBin[],
      skewness: -0.23,
      kurtosis: 1.87,
      extremeValues: [],
      outlierCount: 3
    },
    topExtremes: []
  });

  const actualData = intelligenceData || mockData.value;
  const isLoading = externalLoading || dataLoading;

  // Calculate key metrics from data
  const keyMetrics = React.useMemo(() => [
    {
      label: 'Composite Z-Score',
      value: actualData.composite.value.toFixed(3) + 'σ',
      status: (Math.abs(actualData.composite.value) > 3 ? 'critical' : 
              Math.abs(actualData.composite.value) > 2 ? 'warning' : 'positive') as 'positive' | 'negative' | 'neutral' | 'warning' | 'critical'
    },
    {
      label: 'Signal Strength',
      value: Math.min(Math.abs(actualData.composite.value) * 25, 100).toFixed(0) + '%',
      status: (Math.abs(actualData.composite.value) > 2.5 ? 'positive' : 'neutral') as 'positive' | 'negative' | 'neutral' | 'warning' | 'critical'
    },
    {
      label: 'Regime Confidence',
      value: (actualData.composite.confidence * 100).toFixed(1) + '%',
      status: (actualData.composite.confidence > 0.8 ? 'positive' : 
              actualData.composite.confidence > 0.6 ? 'warning' : 'critical') as 'positive' | 'negative' | 'neutral' | 'warning' | 'critical'
    },
    {
      label: 'Data Quality',
      value: ((actualData.dataQuality.completeness + actualData.dataQuality.freshness + actualData.dataQuality.accuracy) / 3 * 100).toFixed(0) + '%',
      status: (((actualData.dataQuality.completeness + actualData.dataQuality.freshness + actualData.dataQuality.accuracy) / 3) > 0.9 ? 'positive' : 'warning') as 'positive' | 'negative' | 'neutral' | 'warning' | 'critical'
    }
  ], [actualData]);

  if (isLoading) {
    return (
      <TerminalLayout
        title="ENHANCED Z-SCORE ENGINE"
        status="offline"
        className={className}
      >
        <div className="space-y-6">
          <div className="h-20 bg-glass-bg animate-pulse" />
          <div className="h-32 bg-glass-bg animate-pulse" />
          <div className="h-24 bg-glass-bg animate-pulse" />
        </div>
      </TerminalLayout>
    );
  }

  if (error && !actualData) {
    return (
      <TerminalLayout
        title="ENHANCED Z-SCORE ENGINE"
        status="critical"
        className={className}
      >
        <div className="flex items-center justify-center h-32 text-neon-orange">
          <AlertTriangle className="h-6 w-6 mr-2" />
          <span className="font-mono">ENGINE INTELLIGENCE OFFLINE</span>
        </div>
      </TerminalLayout>
    );
  }

  return (
    <TerminalLayout
      title="ENHANCED Z-SCORE ENGINE"
      status="active"
      className={className}
    >
      <div className="space-y-6">
        {/* Key Metrics Grid */}
        <TerminalMetricGrid metrics={keyMetrics} />

        {/* Composite Z-Score Analysis */}
        <TerminalDataSection title="COMPOSITE Z-SCORE">
        <TerminalDataRow
          label="Current Value"
          value={`${actualData.composite.value.toFixed(3)}σ`}
          status={Math.abs(actualData.composite.value) > 3 ? 'critical' : 
                 Math.abs(actualData.composite.value) > 2 ? 'warning' : 'neutral'}
          />
        <TerminalDataRow
          label="Market Regime"
          value={`▲ ${actualData.composite.regime}`}
          status="neutral"
        />
        <TerminalDataRow
          label="Engine Confidence"
          value={`${(actualData.composite.confidence * 100).toFixed(1)}%`}
          status={actualData.composite.confidence > 0.8 ? 'neutral' : 'warning'}
          />
        <TerminalDataRow
          label="Signal Classification"
          value={Math.abs(actualData.composite.value) > 3 ? 'EXTREME' :
                 Math.abs(actualData.composite.value) > 2 ? 'SIGNIFICANT' :
                 Math.abs(actualData.composite.value) > 1 ? 'NOTABLE' : 'NEUTRAL'}
          status={Math.abs(actualData.composite.value) > 2 ? 'warning' : 'neutral'}
          />
        </TerminalDataSection>

        {/* Institutional Insights */}
        <TerminalDataSection title="INSTITUTIONAL INSIGHTS">
          {actualData.institutionalInsights.map((insight, index) => (
            <TerminalDataRow
              key={index}
              label={insight.title}
              value={`${(insight.confidence * 100).toFixed(0)}% • ${insight.timeframe.toUpperCase()}`}
              status={insight.confidence > 0.8 ? 'neutral' : 'warning'}
            />
          ))}
        </TerminalDataSection>

        {/* Data Quality Metrics */}
        <TerminalDataSection title="DATA QUALITY METRICS">
        <TerminalDataRow
          label="Completeness"
          value={`${(actualData.dataQuality.completeness * 100).toFixed(1)}%`}
          status={actualData.dataQuality.completeness > 0.9 ? 'neutral' : 'warning'}
          />
        <TerminalDataRow
          label="Freshness"
          value={`${(actualData.dataQuality.freshness * 100).toFixed(1)}%`}
          status={actualData.dataQuality.freshness > 0.8 ? 'neutral' : 'warning'}
          />
        <TerminalDataRow
          label="Accuracy"
          value={`${(actualData.dataQuality.accuracy * 100).toFixed(1)}%`}
          status={actualData.dataQuality.accuracy > 0.95 ? 'neutral' : 'warning'}
          />
        <TerminalDataRow
          label="Validations"
          value={`${actualData.dataQuality.validationsPassed}/${actualData.dataQuality.validationsTotal}`}
          status={actualData.dataQuality.validationsPassed === actualData.dataQuality.validationsTotal ? 'neutral' : 'warning'}
          />
        </TerminalDataSection>

        {/* Distribution Analysis */}
        <TerminalDataSection title="DISTRIBUTION ANALYSIS">
          <div className="bg-glass-bg border border-glass-border p-4 mb-4">
            <div className="terminal-label mb-3">
              Z-SCORE DISTRIBUTION HISTOGRAM
            </div>
            <ZScoreHistogram
              bins={actualData.distribution.histogram}
              currentValue={actualData.composite.value}
              extremeThreshold={2.5}
              height={100}
            />
          </div>
        <TerminalDataRow
          label="Distribution Skewness"
          value={actualData.distribution.skewness.toFixed(3)}
          status={Math.abs(actualData.distribution.skewness) > 1 ? 'warning' : 'neutral'}
          />
        <TerminalDataRow
          label="Distribution Kurtosis"
          value={actualData.distribution.kurtosis.toFixed(3)}
          status={Math.abs(actualData.distribution.kurtosis) > 3 ? 'warning' : 'neutral'}
          />
        <TerminalDataRow
          label="Outliers Removed"
          value={`${actualData.distribution.outlierCount} data points`}
          status="neutral"
          />
        </TerminalDataSection>

        {/* Top Extremes */}
        {actualData.topExtremes && actualData.topExtremes.length > 0 && (
          <TerminalDataSection title="TOP EXTREMES BY Z-SCORE">
            {actualData.topExtremes.slice(0, 5).map((extreme, index) => (
              <TerminalDataRow
                key={index}
                label={extreme.indicator}
                value={`${extreme.zscore.toFixed(2)}σ (${extreme.percentile.toFixed(1)}%)`}
                status={extreme.severity === 'extreme' ? 'critical' : 'warning'}
              />
            ))}
          </TerminalDataSection>
        )}

        {/* Engine Status */}
        <TerminalDataSection title="ENGINE STATUS">
          <TerminalDataRow
            label="Last Update"
            value={new Date().toLocaleTimeString()}
            status="neutral"
          />
        <TerminalDataRow
          label="Engine Confidence"
          value={`${(actualData.composite.confidence * 100).toFixed(1)}%`}
          status={actualData.composite.confidence > 0.8 ? 'neutral' : 'warning'}
          />
        </TerminalDataSection>
      </div>
    </TerminalLayout>
  );
};