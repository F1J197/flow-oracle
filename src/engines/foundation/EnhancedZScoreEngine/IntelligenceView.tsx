import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { TerminalLayout } from '@/components/intelligence/TerminalLayout';
import { TerminalMetricGrid } from '@/components/intelligence/TerminalMetricGrid';
import { TerminalDataSection } from '@/components/intelligence/TerminalDataSection';
import { TerminalDataRow } from '@/components/intelligence/TerminalDataRow';
import { ZScoreHistogram } from '@/components/intelligence/ZScoreHistogram';
import { useZScoreData } from '@/hooks/useZScoreData';
import { useStableData } from '@/hooks/useStableData';
import { MarketRegime, InstitutionalInsight } from '@/types/zscoreTypes';

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
        { range: [-4, -3], count: 2, percentage: 3.1, isHighlighted: false, color: 'btc-orange' as const },
        { range: [-3, -2], count: 8, percentage: 12.5, isHighlighted: false, color: 'btc-orange' as const },
        { range: [-2, -1], count: 15, percentage: 23.4, isHighlighted: true, color: 'btc-light' as const },
        { range: [-1, 0], count: 18, percentage: 28.1, isHighlighted: true, color: 'btc' as const },
        { range: [0, 1], count: 12, percentage: 18.8, isHighlighted: false, color: 'btc-light' as const },
        { range: [1, 2], count: 7, percentage: 10.9, isHighlighted: false, color: 'btc-muted' as const },
        { range: [2, 3], count: 2, percentage: 3.1, isHighlighted: false, color: 'btc-muted' as const }
      ],
      skewness: -0.23,
      kurtosis: 1.87,
      extremeValues: [],
      outlierCount: 3
    },
    topExtremes: []
  });

  const data = intelligenceData || mockData;
  const isLoading = externalLoading || dataLoading;

  // Calculate key metrics from data
  const keyMetrics = React.useMemo(() => [
    {
      label: 'Composite Z-Score',
      value: data.composite.value.toFixed(3) + 'σ',
      status: Math.abs(data.composite.value) > 3 ? 'critical' : 
              Math.abs(data.composite.value) > 2 ? 'warning' : 'positive'
    },
    {
      label: 'Signal Strength',
      value: Math.min(Math.abs(data.composite.value) * 25, 100).toFixed(0) + '%',
      status: Math.abs(data.composite.value) > 2.5 ? 'positive' : 'neutral'
    },
    {
      label: 'Regime Confidence',
      value: (data.composite.confidence * 100).toFixed(1) + '%',
      status: data.composite.confidence > 0.8 ? 'positive' : 
              data.composite.confidence > 0.6 ? 'warning' : 'critical'
    },
    {
      label: 'Data Quality',
      value: ((data.dataQuality.completeness + data.dataQuality.freshness + data.dataQuality.accuracy) / 3 * 100).toFixed(0) + '%',
      status: ((data.dataQuality.completeness + data.dataQuality.freshness + data.dataQuality.accuracy) / 3) > 0.9 ? 'positive' : 'warning'
    }
  ], [data]);

  // Helper functions for rendering
  const getRegimeIcon = (regime: MarketRegime): string => {
    switch (regime) {
      case 'SUMMER': return '☀️';
      case 'SPRING': return '🌱';
      case 'WINTER': return '❄️';
      case 'AUTUMN': return '🍂';
      default: return '🔄';
    }
  };

  const getSeverityIcon = (severity: string): string => {
    switch (severity) {
      case 'extreme': return '🚨';
      case 'significant': return '⚠️';
      case 'notable': return '📊';
      default: return '📈';
    }
  };

  const getInsightIcon = (type: InstitutionalInsight['type']) => {
    switch (type) {
      case 'positioning': return <TrendingUp className="h-3 w-3" />;
      case 'flow': return <Activity className="h-3 w-3" />;
      case 'sentiment': return <TrendingDown className="h-3 w-3" />;
      case 'technical': return <AlertTriangle className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <TerminalLayout
        title="ENHANCED Z-SCORE ENGINE"
        status="loading"
        className={className}
      >
        <div className="space-y-6">
          <div className="h-20 bg-btc-muted/10 rounded animate-pulse" />
          <div className="h-32 bg-btc-muted/10 rounded animate-pulse" />
          <div className="h-24 bg-btc-muted/10 rounded animate-pulse" />
        </div>
      </TerminalLayout>
    );
  }

  if (error && !data) {
    return (
      <TerminalLayout
        title="ENHANCED Z-SCORE ENGINE"
        status="error"
        className={className}
      >
        <div className="flex items-center justify-center h-32 text-btc-orange">
          <AlertTriangle className="h-6 w-6 mr-2" />
          <span>Engine Intelligence Offline</span>
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
            value={`${data.composite.value.toFixed(3)}σ`}
            status={Math.abs(data.composite.value) > 3 ? 'critical' : 
                   Math.abs(data.composite.value) > 2 ? 'warning' : 'normal'}
          />
          <TerminalDataRow
            label="Market Regime"
            value={`${getRegimeIcon(data.composite.regime)} ${data.composite.regime}`}
            status="normal"
          />
          <TerminalDataRow
            label="Engine Confidence"
            value={`${(data.composite.confidence * 100).toFixed(1)}%`}
            status={data.composite.confidence > 0.8 ? 'normal' : 'warning'}
          />
          <TerminalDataRow
            label="Signal Classification"
            value={Math.abs(data.composite.value) > 3 ? 'EXTREME' :
                   Math.abs(data.composite.value) > 2 ? 'SIGNIFICANT' :
                   Math.abs(data.composite.value) > 1 ? 'NOTABLE' : 'NORMAL'}
            status={Math.abs(data.composite.value) > 2 ? 'warning' : 'normal'}
          />
        </TerminalDataSection>

        {/* Institutional Insights */}
        <TerminalDataSection title="INSTITUTIONAL INSIGHTS">
          {data.institutionalInsights.map((insight, index) => (
            <TerminalDataRow
              key={index}
              label={
                <div className="flex items-center space-x-2">
                  {getInsightIcon(insight.type)}
                  <span>{insight.title}</span>
                </div>
              }
              value={`${(insight.confidence * 100).toFixed(0)}% • ${insight.timeframe.toUpperCase()}`}
              status={insight.confidence > 0.8 ? 'normal' : 'warning'}
              description={insight.description}
            />
          ))}
        </TerminalDataSection>

        {/* Data Quality Metrics */}
        <TerminalDataSection title="DATA QUALITY METRICS">
          <TerminalDataRow
            label="Completeness"
            value={`${(data.dataQuality.completeness * 100).toFixed(1)}%`}
            status={data.dataQuality.completeness > 0.9 ? 'normal' : 'warning'}
          />
          <TerminalDataRow
            label="Freshness"
            value={`${(data.dataQuality.freshness * 100).toFixed(1)}%`}
            status={data.dataQuality.freshness > 0.8 ? 'normal' : 'warning'}
          />
          <TerminalDataRow
            label="Accuracy"
            value={`${(data.dataQuality.accuracy * 100).toFixed(1)}%`}
            status={data.dataQuality.accuracy > 0.95 ? 'normal' : 'warning'}
          />
          <TerminalDataRow
            label="Validations"
            value={`${data.dataQuality.validationsPassed}/${data.dataQuality.validationsTotal}`}
            status={data.dataQuality.validationsPassed === data.dataQuality.validationsTotal ? 'normal' : 'warning'}
          />
        </TerminalDataSection>

        {/* Distribution Analysis */}
        <TerminalDataSection title="DISTRIBUTION ANALYSIS">
          <div className="bg-btc-dark/30 rounded p-4 mb-4">
            <div className="text-xs text-btc-muted mb-3 font-mono">
              Z-SCORE DISTRIBUTION HISTOGRAM
            </div>
            <ZScoreHistogram
              data={data.distribution.histogram}
              currentValue={data.composite.value}
              extremeThreshold={2.5}
              height={100}
            />
          </div>
          <TerminalDataRow
            label="Distribution Skewness"
            value={data.distribution.skewness.toFixed(3)}
            status={Math.abs(data.distribution.skewness) > 1 ? 'warning' : 'normal'}
          />
          <TerminalDataRow
            label="Distribution Kurtosis"
            value={data.distribution.kurtosis.toFixed(3)}
            status={Math.abs(data.distribution.kurtosis) > 3 ? 'warning' : 'normal'}
          />
          <TerminalDataRow
            label="Outliers Removed"
            value={`${data.distribution.outlierCount} data points`}
            status="normal"
          />
        </TerminalDataSection>

        {/* Top Extremes */}
        {data.topExtremes && data.topExtremes.length > 0 && (
          <TerminalDataSection title="TOP EXTREMES BY Z-SCORE">
            {data.topExtremes.slice(0, 5).map((extreme, index) => (
              <TerminalDataRow
                key={index}
                label={
                  <div className="flex items-center space-x-2">
                    <span>{getSeverityIcon(extreme.severity)}</span>
                    <span>{extreme.indicator}</span>
                  </div>
                }
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
            status="normal"
          />
          <TerminalDataRow
            label="Engine Confidence"
            value={`${(data.composite.confidence * 100).toFixed(1)}%`}
            status={data.composite.confidence > 0.8 ? 'normal' : 'warning'}
          />
        </TerminalDataSection>
      </div>
    </TerminalLayout>
  );
};