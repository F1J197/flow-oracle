import { useStableData } from "@/hooks/useStableData";
import { TerminalLayout } from "./TerminalLayout";
import { TerminalDataSection } from "./TerminalDataSection";
import { TerminalDataRow } from "./TerminalDataRow";
import { TerminalMetricGrid } from "./TerminalMetricGrid";

interface NetLiquidityViewProps {
  loading?: boolean;
  className?: string;
}

export const NetLiquidityView = ({ loading, className }: NetLiquidityViewProps) => {
  const mockData = useStableData({
    netLiquidity: 5.626,
    change24h: 2.3,
    fedAssets: 7.235,
    rrpFacility: -1.609,
    bankLiquidity: 3.412,
    monetaryBase: 5.891,
    confidence: 94,
    regime: "Expansion",
    pillars: {
      fed: { value: 7.235, status: "positive" as const },
      treasury: { value: -1.609, status: "negative" as const },
      credit: { value: 3.412, status: "positive" as const }
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
    { label: "Net Liq", value: `$${mockData.value.netLiquidity}T`, status: "positive" as const },
    { label: "24h Δ", value: `${mockData.value.change24h > 0 ? '+' : ''}${mockData.value.change24h}%`, status: mockData.value.change24h > 0 ? "positive" as const : "negative" as const },
    { label: "Regime", value: mockData.value.regime, status: "neutral" as const },
    { label: "Conf", value: `${mockData.value.confidence}%`, status: "positive" as const }
  ];

  return (
    <TerminalLayout
      title="NET LIQUIDITY"
      status="active"
      className={className}
    >
      <TerminalMetricGrid metrics={keyMetrics} columns={2} />
      
      <TerminalDataSection title="COMPOSITION">
        <TerminalDataRow label="Fed Assets" value={`$${mockData.value.fedAssets}T`} status="positive" />
        <TerminalDataRow label="RRP Facility" value={`$${mockData.value.rrpFacility}T`} status="negative" />
        <TerminalDataRow label="Bank Liq" value={`$${mockData.value.bankLiquidity}T`} status="positive" />
        <TerminalDataRow label="Mon Base" value={`$${mockData.value.monetaryBase}T`} status="positive" />
      </TerminalDataSection>

      <TerminalDataSection title="PILLARS">
        <TerminalDataRow label="Fed" value={`$${mockData.value.pillars.fed.value}T`} status={mockData.value.pillars.fed.status} />
        <TerminalDataRow label="Treasury" value={`$${mockData.value.pillars.treasury.value}T`} status={mockData.value.pillars.treasury.status} />
        <TerminalDataRow label="Credit" value={`$${mockData.value.pillars.credit.value}T`} status={mockData.value.pillars.credit.status} />
      </TerminalDataSection>

      <TerminalDataSection title="FLOWS (24H)">
        <TerminalDataRow label="Fed BS" value="+2.1%" status="positive" />
        <TerminalDataRow label="RRP" value="-5.3%" status="negative" />
        <TerminalDataRow label="Bank Liq" value="+1.8%" status="positive" />
        <TerminalDataRow label="Mon Base" value="+0.9%" status="positive" />
      </TerminalDataSection>
    </TerminalLayout>
  );
};