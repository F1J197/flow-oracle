import { useMemo } from "react";
import { EngineLayout } from "./EngineLayout";
import { DataSection } from "./DataSection";
import { DataRow } from "./DataRow";
import { DataTable } from "./DataTable";
import { KeyMetrics } from "./KeyMetrics";
import { useStableData } from "@/hooks/useStableData";
import { formatBasisPoints, formatPercentage } from "@/utils/formatting";

interface CreditStressViewProps {
  loading?: boolean;
  className?: string;
}

export const CreditStressView = ({ loading, className }: CreditStressViewProps) => {
  // Mock data - replace with actual data service
  const mockData = useStableData({
    stressLevel: 0.23, // 0-1 scale
    creditSpreads: {
      ig: 125, // basis points
      hy: 485,
      em: 345
    },
    vix: 18.5,
    termStructure: {
      inversion: true,
      steepness: -45 // basis points
    },
    riskAppetite: "MODERATE",
    alerts: [
      { severity: 'warning' as const, message: 'HY spreads widening beyond 500bp threshold' }
    ]
  });

  const keyMetrics = useMemo(() => [
    {
      label: "Stress Level",
      value: mockData.value.stressLevel * 100,
      format: 'percentage' as const,
      status: mockData.value.stressLevel > 0.5 ? 'critical' as const : mockData.value.stressLevel > 0.3 ? 'negative' as const : 'positive' as const,
      decimals: 1
    },
    {
      label: "VIX",
      value: mockData.value.vix,
      format: 'number' as const,
      status: mockData.value.vix > 25 ? 'negative' as const : 'neutral' as const,
      decimals: 1
    },
    {
      label: "Risk Appetite",
      value: mockData.value.riskAppetite,
      format: 'custom' as const,
      status: 'neutral' as const
    },
    {
      label: "Term Structure",
      value: mockData.value.termStructure.inversion ? "INVERTED" : "NORMAL",
      format: 'custom' as const,
      status: mockData.value.termStructure.inversion ? 'negative' as const : 'positive' as const
    }
  ], [mockData.value]);

  const spreadData = [
    { grade: "Investment Grade", current: formatBasisPoints(mockData.value.creditSpreads.ig), change: "+8bp", percentile: "65%" },
    { grade: "High Yield", current: formatBasisPoints(mockData.value.creditSpreads.hy), change: "+23bp", percentile: "78%" },
    { grade: "Emerging Markets", current: formatBasisPoints(mockData.value.creditSpreads.em), change: "+15bp", percentile: "72%" }
  ];

  const spreadColumns = [
    { key: 'grade', label: 'Credit Grade', align: 'left' as const },
    { key: 'current', label: 'Current Spread', align: 'right' as const },
    { key: 'change', label: '1W Change', align: 'right' as const },
    { key: 'percentile', label: 'Percentile', align: 'right' as const }
  ];

  if (loading) {
    return (
      <EngineLayout title="CREDIT STRESS ENGINE" status="offline" className={className}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-glass-bg rounded"></div>
          <div className="h-4 bg-glass-bg rounded w-3/4"></div>
          <div className="h-4 bg-glass-bg rounded w-1/2"></div>
        </div>
      </EngineLayout>
    );
  }

  return (
    <EngineLayout 
      title="CREDIT STRESS ENGINE" 
      status={mockData.value.stressLevel > 0.5 ? "critical" : mockData.value.stressLevel > 0.3 ? "warning" : "active"} 
      className={className}
    >
      <KeyMetrics metrics={keyMetrics} columns={4} />
      
      <DataSection title="CREDIT SPREADS">
        <DataTable 
          columns={spreadColumns}
          data={spreadData}
        />
      </DataSection>

      <DataSection title="VOLATILITY INDICATORS">
        <DataRow 
          label="VIX Level" 
          value={mockData.value.vix}
          status={mockData.value.vix > 25 ? 'negative' : 'neutral'}
        />
        <DataRow 
          label="VIX Percentile" 
          value="45%"
          status="neutral"
        />
        <DataRow 
          label="MOVE Index" 
          value="98.5"
          status="neutral"
        />
      </DataSection>

      <DataSection title="TERM STRUCTURE">
        <DataRow 
          label="2Y-10Y Spread" 
          value={mockData.value.termStructure.steepness}
          unit="bp"
          status={mockData.value.termStructure.inversion ? 'negative' : 'neutral'}
        />
        <DataRow 
          label="Curve Shape" 
          value={mockData.value.termStructure.inversion ? "INVERTED" : "NORMAL"}
          status={mockData.value.termStructure.inversion ? 'negative' : 'positive'}
        />
        <DataRow 
          label="Steepening Risk" 
          value="MODERATE"
          status="negative"
        />
      </DataSection>

      {mockData.value.alerts.length > 0 && (
        <DataSection title="ALERTS">
          {mockData.value.alerts.map((alert, index) => (
            <DataRow 
              key={index}
              label={alert.severity.toUpperCase()}
              value={alert.message}
              status={alert.severity === 'critical' ? 'negative' : 'negative'}
            />
          ))}
        </DataSection>
      )}
    </EngineLayout>
  );
};