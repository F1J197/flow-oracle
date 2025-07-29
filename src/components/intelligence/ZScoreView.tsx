import { useMemo } from "react";
import { EngineLayout } from "./EngineLayout";
import { KeyMetrics } from "./KeyMetrics";
import { DataSection } from "./DataSection";
import { DataRow } from "./DataRow";
import { DataTable } from "./DataTable";
import { useStableData } from "@/hooks/useStableData";

interface ZScoreViewProps {
  loading?: boolean;
  className?: string;
}

export const ZScoreView = ({ loading, className }: ZScoreViewProps) => {
  // Mock data for Z-Score analysis
  const mockData = useStableData({
    compositeZScore: 1.85,
    momentum: 2.1,
    volatility: -0.8,
    volume: 1.2,
    breadth: 0.9,
    regime: 'EXPANSION',
    confidence: 0.87,
    lastUpdate: new Date()
  });

  const keyMetrics = useMemo(() => [
    {
      label: "Composite Z-Score",
      value: mockData.value.compositeZScore,
      format: "number" as const,
      decimals: 2,
      status: mockData.value.compositeZScore > 1.5 ? 'positive' as const : mockData.value.compositeZScore < -1.5 ? 'critical' as const : 'neutral' as const
    },
    {
      label: "Signal Strength",
      value: Math.abs(mockData.value.compositeZScore) * 50,
      format: "percentage" as const,
      decimals: 1,
      status: 'positive' as const
    },
    {
      label: "Regime Confidence",
      value: mockData.value.confidence * 100,
      format: "percentage" as const,
      decimals: 1,
      status: mockData.value.confidence > 0.8 ? 'positive' as const : 'neutral' as const
    },
    {
      label: "Current Regime",
      value: mockData.value.regime,
      status: mockData.value.regime === 'EXPANSION' ? 'positive' as const : 'neutral' as const
    }
  ], [mockData]);

  // Table data for factor breakdown
  const tableData = [
    { factor: 'Momentum', zscore: mockData.value.momentum, percentile: '91st', signal: 'STRONG BUY' },
    { factor: 'Volatility', zscore: mockData.value.volatility, percentile: '22nd', signal: 'NEUTRAL' },
    { factor: 'Volume', zscore: mockData.value.volume, percentile: '78th', signal: 'BUY' },
    { factor: 'Breadth', zscore: mockData.value.breadth, percentile: '68th', signal: 'MILD BUY' },
  ];

  const tableColumns = [
    { key: 'factor', label: 'FACTOR', align: 'left' as const },
    { key: 'zscore', label: 'Z-SCORE', align: 'right' as const },
    { key: 'percentile', label: 'PERCENTILE', align: 'right' as const },
    { key: 'signal', label: 'SIGNAL', align: 'right' as const },
  ];

  if (loading) {
    return (
      <div className="glass-tile p-6 animate-pulse">
        <div className="h-6 bg-glass-bg rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-glass-bg rounded w-3/4"></div>
          <div className="h-4 bg-glass-bg rounded w-1/2"></div>
          <div className="h-4 bg-glass-bg rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <EngineLayout
      title="Z-SCORE ENGINE"
      status="active"
      className={className}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <KeyMetrics metrics={keyMetrics} columns={2} />

        {/* Factor Analysis */}
        <DataSection title="FACTOR ANALYSIS">
          <DataRow 
            label="Momentum Component" 
            value={mockData.value.momentum} 
            unit="σ"
            status={mockData.value.momentum > 0 ? 'positive' : 'negative'}
          />
          <DataRow 
            label="Volatility Regime" 
            value={mockData.value.volatility} 
            unit="σ"
            status={mockData.value.volatility > 0 ? 'negative' : 'positive'}
          />
          <DataRow 
            label="Volume Confirmation" 
            value={mockData.value.volume} 
            unit="σ"
            status={mockData.value.volume > 0 ? 'positive' : 'negative'}
          />
          <DataRow 
            label="Market Breadth" 
            value={mockData.value.breadth} 
            unit="σ"
            status={mockData.value.breadth > 0 ? 'positive' : 'negative'}
          />
        </DataSection>

        {/* Z-Score Breakdown */}
        <DataSection title="Z-SCORE BREAKDOWN">
          <DataTable 
            columns={tableColumns}
            data={tableData}
          />
        </DataSection>

        {/* Regime Analysis */}
        <DataSection title="REGIME ANALYSIS">
          <DataRow 
            label="Current Regime" 
            value={mockData.value.regime}
            status={mockData.value.regime === 'EXPANSION' ? 'positive' : 'neutral'}
          />
          <DataRow 
            label="Regime Stability" 
            value={mockData.value.confidence * 100} 
            unit="%"
            status={mockData.value.confidence > 0.8 ? 'positive' : 'neutral'}
          />
          <DataRow 
            label="Days in Regime" 
            value={23}
            unit="days"
            status="neutral"
          />
        </DataSection>
      </div>
    </EngineLayout>
  );
};