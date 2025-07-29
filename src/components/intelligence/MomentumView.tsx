import { useStableData } from "@/hooks/useStableData";
import { TerminalLayout } from "./TerminalLayout";
import { TerminalDataSection } from "./TerminalDataSection";
import { TerminalDataRow } from "./TerminalDataRow";
import { TerminalMetricGrid } from "./TerminalMetricGrid";

interface MomentumViewProps {
  loading?: boolean;
  className?: string;
}

export const MomentumView = ({ loading, className }: MomentumViewProps) => {
  const mockData = useStableData({
    overallMomentum: -1.2,
    trendStrength: 78,
    volatility: 23.5,
    rsi: 32,
    macd: -0.45,
    stochastic: 28,
    confidence: 91,
    timeframes: {
      "1D": -2.1,
      "7D": -1.8,
      "30D": -0.9,
      "90D": 0.3
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
    { label: "Momentum", value: mockData.overallMomentum.toFixed(1), status: "critical" as const },
    { label: "Strength", value: `${mockData.trendStrength}%`, status: "positive" as const },
    { label: "Vol", value: `${mockData.volatility}%`, status: "warning" as const },
    { label: "RSI", value: mockData.rsi, status: "critical" as const }
  ];

  return (
    <TerminalLayout
      title="MOMENTUM"
      status="warning"
      className={className}
    >
      <TerminalMetricGrid metrics={keyMetrics} columns={2} />
      
      <TerminalDataSection title="TECHNICALS">
        <TerminalDataRow label="MACD" value={mockData.macd.toFixed(2)} status="critical" />
        <TerminalDataRow label="Stoch %K" value={`${mockData.stochastic}%`} status="critical" />
        <TerminalDataRow label="RSI (14)" value={mockData.rsi} status="critical" />
        <TerminalDataRow label="Vol (30D)" value={`${mockData.volatility}%`} status="warning" />
      </TerminalDataSection>

      <TerminalDataSection title="TIMEFRAMES">
        <TerminalDataRow label="1D" value={mockData.timeframes["1D"].toFixed(1)} status="critical" />
        <TerminalDataRow label="7D" value={mockData.timeframes["7D"].toFixed(1)} status="critical" />
        <TerminalDataRow label="30D" value={mockData.timeframes["30D"].toFixed(1)} status="negative" />
        <TerminalDataRow label="90D" value={mockData.timeframes["90D"].toFixed(1)} status="positive" />
      </TerminalDataSection>

      <TerminalDataSection title="SIGNALS">
        <TerminalDataRow label="Short Term" value="BEARISH" status="critical" />
        <TerminalDataRow label="Med Term" value="BEARISH" status="critical" />
        <TerminalDataRow label="Long Term" value="NEUTRAL" status="warning" />
        <TerminalDataRow label="Rev Risk" value="HIGH" status="warning" />
      </TerminalDataSection>
    </TerminalLayout>
  );
};