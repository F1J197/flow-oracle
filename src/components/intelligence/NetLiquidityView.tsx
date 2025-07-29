import { useMemo } from "react";
import { EngineLayout } from "./EngineLayout";
import { DataSection } from "./DataSection";
import { DataRow } from "./DataRow";
import { DataTable } from "./DataTable";
import { KeyMetrics } from "./KeyMetrics";
import { useStableData } from "@/hooks/useStableData";
import { formatCurrency, formatPercentage } from "@/utils/formatting";

interface NetLiquidityViewProps {
  loading?: boolean;
  className?: string;
}

export const NetLiquidityView = ({ loading, className }: NetLiquidityViewProps) => {
  // Mock data - replace with actual data service
  const mockData = useStableData({
    netLiquidity: 5.626e12, // $5.626T
    monthlyChange: 2.3,
    weeklyChange: 0.8,
    dailyChange: -0.2,
    regime: "EXPANSION",
    confidence: 0.87,
    components: {
      fedBalance: 7.2e12,
      rrpBalance: -1.4e12,
      treasuryBalance: -0.18e12
    },
    historicalPercentiles: {
      percentile90: 0.72,
      percentile50: 0.45,
      current: 0.68
    }
  });

  const keyMetrics = useMemo(() => [
    {
      label: "Net Liquidity",
      value: mockData.value.netLiquidity,
      format: 'currency' as const,
      status: 'positive' as const,
      compact: true,
      decimals: 2
    },
    {
      label: "Monthly Change",
      value: mockData.value.monthlyChange,
      format: 'percentage' as const,
      status: mockData.value.monthlyChange > 0 ? 'positive' as const : 'negative' as const
    },
    {
      label: "Regime",
      value: mockData.value.regime,
      format: 'custom' as const,
      status: 'positive' as const
    },
    {
      label: "Confidence",
      value: mockData.value.confidence * 100,
      format: 'percentage' as const,
      status: 'neutral' as const,
      decimals: 1
    }
  ], [mockData.value]);

  const tableData = [
    { component: "Fed Balance Sheet", value: formatCurrency(mockData.value.components.fedBalance, { compact: true }), change: "+2.1%" },
    { component: "RRP Balance", value: formatCurrency(mockData.value.components.rrpBalance, { compact: true }), change: "-0.8%" },
    { component: "Treasury Balance", value: formatCurrency(mockData.value.components.treasuryBalance, { compact: true }), change: "+1.2%" }
  ];

  const tableColumns = [
    { key: 'component', label: 'Component', align: 'left' as const },
    { key: 'value', label: 'Current Value', align: 'right' as const },
    { key: 'change', label: '7D Change', align: 'right' as const }
  ];

  if (loading) {
    return (
      <EngineLayout title="NET LIQUIDITY ENGINE" status="offline" className={className}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-glass-bg rounded"></div>
          <div className="h-4 bg-glass-bg rounded w-3/4"></div>
          <div className="h-4 bg-glass-bg rounded w-1/2"></div>
        </div>
      </EngineLayout>
    );
  }

  return (
    <EngineLayout title="NET LIQUIDITY ENGINE" status="active" className={className}>
      <KeyMetrics metrics={keyMetrics} columns={4} />
      
      <DataSection title="CURRENT LEVELS">
        <DataRow 
          label="Daily Change" 
          value={mockData.value.dailyChange}
          unit="%" 
          status={mockData.value.dailyChange > 0 ? 'positive' : 'negative'}
        />
        <DataRow 
          label="Weekly Change" 
          value={mockData.value.weeklyChange}
          unit="%" 
          status={mockData.value.weeklyChange > 0 ? 'positive' : 'negative'}
        />
        <DataRow 
          label="Historical Percentile" 
          value={mockData.value.historicalPercentiles.current * 100}
          unit="%" 
          status="neutral"
        />
      </DataSection>

      <DataSection title="COMPONENT BREAKDOWN">
        <DataTable 
          columns={tableColumns}
          data={tableData}
        />
      </DataSection>

      <DataSection title="REGIME ANALYSIS">
        <DataRow label="Current Regime" value={mockData.value.regime} status="positive" />
        <DataRow label="Regime Confidence" value={`${(mockData.value.confidence * 100).toFixed(1)}%`} status="neutral" />
        <DataRow label="Signal Strength" value="STRONG" status="positive" />
      </DataSection>
    </EngineLayout>
  );
};