import React from 'react';
import { EngineLayout } from './EngineLayout';
import { KeyMetrics } from './KeyMetrics';
import { DataSection } from './DataSection';
import { DataRow } from './DataRow';
import { DataTable } from './DataTable';
import { ZScoreHistogram } from './ZScoreHistogram';
import { useZScoreData } from '@/hooks/useZScoreData';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Brain, Target, Database, Clock } from 'lucide-react';

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
      <div className="glass-tile p-6 animate-pulse space-y-4">
        <div className="h-6 bg-glass-bg rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-glass-bg rounded w-3/4"></div>
          <div className="h-4 bg-glass-bg rounded w-1/2"></div>
          <div className="h-4 bg-glass-bg rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !intelligenceData) {
    return (
      <EngineLayout
        title="ENHANCED Z-SCORE ENGINE"
        status="offline"
        className={className}
      >
        <div className="text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-neon-orange mx-auto" />
          <div className="text-sm text-text-secondary">
            {error || 'Failed to load Z-Score intelligence data'}
          </div>
        </div>
      </EngineLayout>
    );
  }

  const { composite, institutionalInsights, dataQuality, multiTimeframe, distribution, topExtremes } = intelligenceData;

  // Key metrics for the top section
  const keyMetrics = [
    {
      label: "Composite Z-Score",
      value: composite.value,
      format: "number" as const,
      decimals: 3,
      status: Math.abs(composite.value) > 3 ? 'critical' as const : 
              Math.abs(composite.value) > 2 ? 'warning' as const : 'positive' as const
    },
    {
      label: "Signal Strength",
      value: Math.abs(composite.value) * 10,
      format: "percentage" as const,
      decimals: 1,
      status: 'positive' as const
    },
    {
      label: "Regime Confidence",
      value: composite.confidence * 100,
      format: "percentage" as const,
      decimals: 1,
      status: composite.confidence > 0.8 ? 'positive' as const : 'neutral' as const
    },
    {
      label: "Data Quality",
      value: (dataQuality.completeness + dataQuality.freshness + dataQuality.accuracy) / 3 * 100,
      format: "percentage" as const,
      decimals: 0,
      status: 'positive' as const
    }
  ];

  // Multi-timeframe table data
  const timeframeTableData = multiTimeframe.map(calc => ({
    window: calc.window.period,
    zscore: calc.zscore.toFixed(3),
    percentile: `${calc.percentile.toFixed(1)}%`,
    weight: `${(calc.window.weight * 100).toFixed(0)}%`,
    confidence: `${(calc.confidence * 100).toFixed(0)}%`,
    status: calc.isExtreme ? '🔴 EXTREME' : Math.abs(calc.zscore) > 1.5 ? '🟡 NOTABLE' : '🟢 NORMAL'
  }));

  const timeframeTableColumns = [
    { key: 'window', label: 'WINDOW', align: 'left' as const },
    { key: 'zscore', label: 'Z-SCORE', align: 'right' as const },
    { key: 'percentile', label: 'PERCENTILE', align: 'right' as const },
    { key: 'weight', label: 'WEIGHT', align: 'right' as const },
    { key: 'confidence', label: 'CONFIDENCE', align: 'right' as const },
    { key: 'status', label: 'STATUS', align: 'center' as const }
  ];

  // Top extremes table data
  const extremesTableData = topExtremes.slice(0, 5).map(extreme => ({
    indicator: extreme.indicator,
    zscore: extreme.zscore.toFixed(2),
    percentile: `${extreme.percentile.toFixed(1)}%`,
    severity: `${getSeverityIcon(extreme.severity)} ${extreme.severity.toUpperCase()}`,
    value: extreme.value.toFixed(4)
  }));

  const extremesTableColumns = [
    { key: 'indicator', label: 'INDICATOR', align: 'left' as const },
    { key: 'zscore', label: 'Z-SCORE', align: 'right' as const },
    { key: 'percentile', label: 'PERCENTILE', align: 'right' as const },
    { key: 'severity', label: 'SEVERITY', align: 'center' as const },
    { key: 'value', label: 'VALUE', align: 'right' as const }
  ];

  return (
    <EngineLayout
      title="ENHANCED Z-SCORE ENGINE"
      status="active"
      className={className}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <KeyMetrics metrics={keyMetrics} columns={4} />

        {/* Composite Z-Score Section */}
        <DataSection title="COMPOSITE Z-SCORE">
          <DataRow 
            label="Current Value" 
            value={composite.value} 
            unit="σ"
            status={Math.abs(composite.value) > 3 ? 'critical' : 
                   Math.abs(composite.value) > 2 ? 'warning' : 'positive'}
          />
          <DataRow 
            label="Market Regime" 
            value={`${getRegimeIcon(composite.regime)} ${composite.regime}`}
            status="positive"
          />
          <DataRow 
            label="Regime Confidence" 
            value={composite.confidence * 100} 
            unit="%"
            status={composite.confidence > 0.8 ? 'positive' : 'neutral'}
          />
          <DataRow 
            label="Component Count" 
            value={composite.components.length}
            unit="windows"
            status="neutral"
          />
        </DataSection>

        {/* Institutional Insights */}
        <DataSection title="🏛️ INSTITUTIONAL INSIGHTS">
          {institutionalInsights.length > 0 ? (
            institutionalInsights.map((insight, index) => (
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
            ))
          ) : (
            <DataRow label="Status" value="No significant insights detected" status="neutral" />
          )}
        </DataSection>

        {/* Data Quality Metrics */}
        <DataSection title="📊 DATA QUALITY METRICS">
          <DataRow 
            label="Completeness Score" 
            value={dataQuality.completeness * 100} 
            unit="%"
            status={dataQuality.completeness > 0.9 ? 'positive' : 'warning'}
          />
          <DataRow 
            label="Freshness Score" 
            value={dataQuality.freshness * 100} 
            unit="%"
            status={dataQuality.freshness > 0.8 ? 'positive' : 'warning'}
          />
          <DataRow 
            label="Accuracy Rating" 
            value={dataQuality.accuracy * 100} 
            unit="%"
            status={dataQuality.accuracy > 0.95 ? 'positive' : 'warning'}
          />
          <DataRow 
            label="Source Coverage" 
            value={dataQuality.sourceCount}
            unit="sources"
            status="neutral"
          />
          <DataRow 
            label="Validation Status" 
            value={`${dataQuality.validationsPassed}/${dataQuality.validationsTotal}`}
            status={dataQuality.validationsPassed === dataQuality.validationsTotal ? 'positive' : 'warning'}
          />
        </DataSection>

        {/* Multi-Timeframe Z-Scores */}
        <DataSection title="⏱️ MULTI-TIMEFRAME Z-SCORES">
          <DataTable 
            columns={timeframeTableColumns}
            data={timeframeTableData}
          />
        </DataSection>

        {/* Extreme Distribution Analysis */}
        <DataSection title="📈 EXTREME DISTRIBUTION ANALYSIS">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <DataRow 
                label="Distribution Skewness" 
                value={distribution.skewness} 
                unit=""
                status={Math.abs(distribution.skewness) > 1 ? 'warning' : 'positive'}
              />
              <DataRow 
                label="Kurtosis Level" 
                value={distribution.kurtosis} 
                unit=""
                status={Math.abs(distribution.kurtosis) > 3 ? 'warning' : 'positive'}
              />
              <DataRow 
                label="Outlier Count" 
                value={distribution.outlierCount}
                unit="removed"
                status="neutral"
              />
            </div>
            
            {distribution.histogram.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-text-secondary">Current Distribution:</div>
                <ZScoreHistogram
                  bins={distribution.histogram}
                  currentValue={composite.value}
                  extremeThreshold={2.5}
                  height={60}
                />
              </div>
            )}
          </div>
        </DataSection>

        {/* Top Extremes by Z-Score */}
        <DataSection title="🎯 TOP EXTREMES BY Z-SCORE">
          {topExtremes.length > 0 ? (
            <DataTable 
              columns={extremesTableColumns}
              data={extremesTableData}
            />
          ) : (
            <DataRow label="Status" value="No extreme values detected" status="positive" />
          )}
        </DataSection>

        {/* Engine Status Footer */}
        <div className="pt-4 border-t border-glass-border">
          <div className="grid grid-cols-2 gap-4 text-xs text-text-secondary">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>Last Update: {lastUpdate?.toLocaleTimeString() || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3" />
              <span>Engine Confidence: {(confidence * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </EngineLayout>
  );
};