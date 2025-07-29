import { useMemo } from "react";
import { EngineLayout } from "./EngineLayout";
import { DataSection } from "./DataSection";
import { DataRow } from "./DataRow";
import { DataTable } from "./DataTable";
import { KeyMetrics } from "./KeyMetrics";
import { useStableData } from "@/hooks/useStableData";
import { formatZScore, formatPercentage } from "@/utils/formatting";

interface MomentumViewProps {
  loading?: boolean;
  className?: string;
}

export const MomentumView = ({ loading, className }: MomentumViewProps) => {
  // Mock data - replace with actual data service
  const mockData = useStableData({
    overallMomentum: 0.65, // 0-1 scale
    momentum1D: 2.3,
    momentum7D: 1.8,
    momentum30D: 0.9,
    zScores: {
      equity: 1.45,
      bond: -0.23,
      commodity: 0.87,
      fx: -0.56
    },
    regime: "BULLISH",
    strength: "STRONG",
    divergences: [
      { asset: "BONDS", status: "DIVERGENT", strength: -0.23 }
    ]
  });

  const keyMetrics = useMemo(() => [
    {
      label: "Overall Momentum",
      value: mockData.value.overallMomentum * 100,
      format: 'percentage' as const,
      status: mockData.value.overallMomentum > 0.6 ? 'positive' as const : mockData.value.overallMomentum < 0.4 ? 'negative' as const : 'neutral' as const,
      decimals: 1
    },
    {
      label: "1D Change",
      value: mockData.value.momentum1D,
      format: 'percentage' as const,
      status: mockData.value.momentum1D > 0 ? 'positive' as const : 'negative' as const
    },
    {
      label: "Regime",
      value: mockData.value.regime,
      format: 'custom' as const,
      status: 'positive' as const
    },
    {
      label: "Signal Strength",
      value: mockData.value.strength,
      format: 'custom' as const,
      status: 'positive' as const
    }
  ], [mockData.value]);

  const zScoreData = [
    { asset: "Equities", zscore: formatZScore(mockData.value.zScores.equity), momentum: `+${mockData.value.momentum1D.toFixed(1)}%`, regime: "BULLISH" },
    { asset: "Bonds", zscore: formatZScore(mockData.value.zScores.bond), momentum: "-0.8%", regime: "BEARISH" },
    { asset: "Commodities", zscore: formatZScore(mockData.value.zScores.commodity), momentum: "+1.2%", regime: "NEUTRAL" },
    { asset: "FX", zscore: formatZScore(mockData.value.zScores.fx), momentum: "-0.3%", regime: "BEARISH" }
  ];

  const zScoreColumns = [
    { key: 'asset', label: 'Asset Class', align: 'left' as const },
    { key: 'zscore', label: 'Z-Score', align: 'right' as const },
    { key: 'momentum', label: '1D Momentum', align: 'right' as const },
    { key: 'regime', label: 'Regime', align: 'right' as const }
  ];

  if (loading) {
    return (
      <EngineLayout title="MOMENTUM ENGINE" status="offline" className={className}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-glass-bg rounded"></div>
          <div className="h-4 bg-glass-bg rounded w-3/4"></div>
          <div className="h-4 bg-glass-bg rounded w-1/2"></div>
        </div>
      </EngineLayout>
    );
  }

  return (
    <EngineLayout title="MOMENTUM ENGINE" status="active" className={className}>
      <KeyMetrics metrics={keyMetrics} columns={4} />
      
      <DataSection title="TIMEFRAME ANALYSIS">
        <DataRow 
          label="1-Day Momentum" 
          value={mockData.value.momentum1D}
          unit="%" 
          status={mockData.value.momentum1D > 0 ? 'positive' : 'negative'}
        />
        <DataRow 
          label="7-Day Momentum" 
          value={mockData.value.momentum7D}
          unit="%" 
          status={mockData.value.momentum7D > 0 ? 'positive' : 'negative'}
        />
        <DataRow 
          label="30-Day Momentum" 
          value={mockData.value.momentum30D}
          unit="%" 
          status={mockData.value.momentum30D > 0 ? 'positive' : 'negative'}
        />
      </DataSection>

      <DataSection title="ASSET CLASS Z-SCORES">
        <DataTable 
          columns={zScoreColumns}
          data={zScoreData}
        />
      </DataSection>

      <DataSection title="REGIME ANALYSIS">
        <DataRow label="Primary Regime" value={mockData.value.regime} status="positive" />
        <DataRow label="Regime Strength" value={mockData.value.strength} status="positive" />
        <DataRow label="Trend Consistency" value="HIGH" status="positive" />
        <DataRow label="Reversal Risk" value="LOW" status="positive" />
      </DataSection>

      {mockData.value.divergences.length > 0 && (
        <DataSection title="DIVERGENCES">
          {mockData.value.divergences.map((div, index) => (
            <DataRow 
              key={index}
              label={div.asset}
              value={`${div.status} (${formatZScore(div.strength)})`}
              status={div.status === 'DIVERGENT' ? 'negative' : 'neutral'}
            />
          ))}
        </DataSection>
      )}
    </EngineLayout>
  );
};