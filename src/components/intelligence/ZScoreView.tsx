import { useStableData } from "@/hooks/useStableData";
import { TerminalLayout } from "./TerminalLayout";
import { TerminalDataSection } from "./TerminalDataSection";
import { TerminalDataRow } from "./TerminalDataRow";
import { TerminalMetricGrid } from "./TerminalMetricGrid";

interface ZScoreViewProps {
  loading?: boolean;
  className?: string;
}

export const ZScoreView = ({ loading, className }: ZScoreViewProps) => {
  const mockData = useStableData({
    compositeZScore: -1.85,
    marketRegime: "Bearish",
    confidence: 87,
    distribution: {
      extreme: 12,
      high: 23,
      normal: 45,
      low: 15,
      critical: 5
    },
    indicators: {
      momentum: -2.1,
      liquidity: -1.6,
      credit: -1.9,
      volatility: 2.3
    }
  });

  if (loading) {
    return (
      <div className={className}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-glass-bg rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-glass-bg rounded w-3/4"></div>
            <div className="h-4 bg-glass-bg rounded w-1/2"></div>
            <div className="h-4 bg-glass-bg rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const keyMetrics = [
    { label: "Z-Score", value: mockData.value.compositeZScore.toFixed(2), status: "critical" as const },
    { label: "Regime", value: mockData.value.marketRegime, status: "warning" as const },
    { label: "Conf", value: `${mockData.value.confidence}%`, status: "positive" as const },
    { label: "Extreme", value: mockData.value.distribution.extreme, status: "warning" as const }
  ];

  return (
    <TerminalLayout
      title="Z-SCORE"
      status="warning"
      className={className}
    >
      <TerminalMetricGrid metrics={keyMetrics} columns={2} />
      
      <TerminalDataSection title="INDICATORS">
        <TerminalDataRow label="Momentum" value={mockData.value.indicators.momentum.toFixed(2)} status="critical" />
        <TerminalDataRow label="Liquidity" value={mockData.value.indicators.liquidity.toFixed(2)} status="critical" />
        <TerminalDataRow label="Credit" value={mockData.value.indicators.credit.toFixed(2)} status="critical" />
        <TerminalDataRow label="Volatility" value={mockData.value.indicators.volatility.toFixed(2)} status="warning" />
      </TerminalDataSection>

      <TerminalDataSection title="DISTRIBUTION">
        <TerminalDataRow label="Critical (<-2σ)" value={mockData.value.distribution.critical} />
        <TerminalDataRow label="Low (-1-2σ)" value={mockData.value.distribution.low} />
        <TerminalDataRow label="Normal (<1σ)" value={mockData.value.distribution.normal} />
        <TerminalDataRow label="High (1-2σ)" value={mockData.value.distribution.high} />
        <TerminalDataRow label="Extreme (>2σ)" value={mockData.value.distribution.extreme} />
      </TerminalDataSection>

      <TerminalDataSection title="ANALYSIS">
        <TerminalDataRow label="Regime Risk" value="HIGH" status="critical" />
        <TerminalDataRow label="Divergence" value="MODERATE" status="warning" />
        <TerminalDataRow label="Stability" value="LOW" status="critical" />
      </TerminalDataSection>
    </TerminalLayout>
  );
};