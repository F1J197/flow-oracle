import { useStableData } from "@/hooks/useStableData";
import { TerminalLayout } from "./TerminalLayout";
import { TerminalDataSection } from "./TerminalDataSection";
import { TerminalDataRow } from "./TerminalDataRow";
import { TerminalMetricGrid } from "./TerminalMetricGrid";

interface CreditStressViewProps {
  loading?: boolean;
  className?: string;
}

export const CreditStressView = ({ loading, className }: CreditStressViewProps) => {
  const mockData = useStableData({
    stressLevel: 2.8,
    vix: 24.5,
    creditSpreads: {
      investmentGrade: 1.45,
      highYield: 4.23,
      emergingMarkets: 3.87
    },
    riskAppetite: "Low",
    termStructure: "Inverted",
    volatilityCluster: true,
    confidence: 89,
    alerts: [
      {
        severity: "warning" as const,
        message: "Credit spreads widening beyond normal ranges",
        timestamp: new Date()
      }
    ]
  });

  if (loading) {
    return (
      <div className={className}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-bg-secondary"></div>
          <div className="space-y-2">
            <div className="h-4 bg-bg-secondary w-3/4"></div>
            <div className="h-4 bg-bg-secondary w-1/2"></div>
            <div className="h-4 bg-bg-secondary w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const keyMetrics = [
    { label: "Stress", value: mockData.value.stressLevel.toFixed(1), status: "critical" as const },
    { label: "VIX", value: mockData.value.vix.toFixed(1), status: "warning" as const },
    { label: "Risk App", value: mockData.value.riskAppetite, status: "warning" as const },
    { label: "Curve", value: mockData.value.termStructure, status: "critical" as const }
  ];

  return (
    <TerminalLayout
      title="CREDIT STRESS"
      status="warning"
      className={className}
    >
      <TerminalMetricGrid metrics={keyMetrics} columns={2} />
      
      <TerminalDataSection title="SPREADS">
        <TerminalDataRow label="IG" value={`${mockData.value.creditSpreads.investmentGrade}%`} status="warning" />
        <TerminalDataRow label="HY" value={`${mockData.value.creditSpreads.highYield}%`} status="critical" />
        <TerminalDataRow label="EM" value={`${mockData.value.creditSpreads.emergingMarkets}%`} status="warning" />
      </TerminalDataSection>

      <TerminalDataSection title="VOLATILITY">
        <TerminalDataRow label="VIX" value={`${mockData.value.vix}%`} status="warning" />
        <TerminalDataRow label="MOVE" value="142.3" status="warning" />
        <TerminalDataRow label="Credit Vol" value="18.7%" status="positive" />
        <TerminalDataRow label="Clustering" value={mockData.value.volatilityCluster ? "Active" : "Inactive"} status="warning" />
      </TerminalDataSection>

      <TerminalDataSection title="TERM STRUCT">
        <TerminalDataRow label="Shape" value={mockData.value.termStructure} status="critical" />
        <TerminalDataRow label="2Y-10Y" value="-0.45%" status="critical" />
        <TerminalDataRow label="3M-10Y" value="-0.82%" status="critical" />
        <TerminalDataRow label="Steepness" value="Flattening" status="warning" />
      </TerminalDataSection>

      <TerminalDataSection title="ALERTS">
        <TerminalDataRow label="Status" value="SPREADS WIDE" status="warning" />
        <TerminalDataRow label="Level" value="ELEVATED" status="warning" />
        <TerminalDataRow label="Trend" value="DETERIORATING" status="critical" />
      </TerminalDataSection>
    </TerminalLayout>
  );
};