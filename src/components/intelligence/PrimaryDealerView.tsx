import { useMemo } from "react";
import { EngineLayout } from "./EngineLayout";
import { KeyMetrics } from "./KeyMetrics";
import { DataSection } from "./DataSection";
import { DataRow } from "./DataRow";
import { DataTable } from "./DataTable";
import { PositionBars } from "@/components/shared/PositionBars";
import { usePrimaryDealerV6 } from "@/hooks/usePrimaryDealerV6";

interface PrimaryDealerViewProps {
  loading?: boolean;
  className?: string;
}

export const PrimaryDealerView = ({ loading: externalLoading, className }: PrimaryDealerViewProps) => {
  const { tileData, loading: hookLoading, error } = usePrimaryDealerV6(true);
  const isLoading = externalLoading || hookLoading;

  const keyMetrics = useMemo(() => {
    if (!tileData) return [];
    
    return [
      {
        label: "Net Position",
        value: tileData.netPosition,
        status: tileData.direction === 'up' ? 'positive' as const : tileData.direction === 'down' ? 'negative' as const : 'neutral' as const
      },
      {
        label: "Risk Appetite",
        value: tileData.riskAppetite,
        status: tileData.riskAppetite === 'EXPANDING' ? 'positive' as const : tileData.riskAppetite === 'CONTRACTING' ? 'negative' as const : 'neutral' as const
      },
      {
        label: "Market Signal",
        value: tileData.signal,
        status: tileData.signal === 'BULLISH' ? 'positive' as const : tileData.signal === 'BEARISH' ? 'negative' as const : 'neutral' as const
      },
      {
        label: "Data Quality",
        value: tileData.metadata.dataQuality,
        format: "percentage" as const,
        decimals: 1,
        status: tileData.metadata.dataQuality > 95 ? 'positive' as const : tileData.metadata.dataQuality > 85 ? 'neutral' as const : 'negative' as const
      }
    ];
  }, [tileData]);

  // Position breakdown table data
  const positionData = useMemo(() => {
    if (!tileData) return [];
    
    return [
      {
        category: 'Gross Long',
        value: `$${(tileData.positionBars.grossLong / 1e9).toFixed(1)}B`,
        percentage: `${tileData.positionBars.grossLongPct.toFixed(1)}%`,
        trend: 'UP'
      },
      {
        category: 'Gross Short',
        value: `$${Math.abs(tileData.positionBars.grossShort / 1e9).toFixed(1)}B`,
        percentage: `${tileData.positionBars.grossShortPct.toFixed(1)}%`,
        trend: 'DOWN'
      },
      {
        category: 'Net Position',
        value: `$${(tileData.positionBars.netPosition / 1e9).toFixed(1)}B`,
        percentage: `${Math.abs(tileData.positionBars.netPositionPct).toFixed(1)}%`,
        trend: tileData.positionBars.netPosition > 0 ? 'UP' : 'DOWN'
      }
    ];
  }, [tileData]);

  const positionColumns = [
    { key: 'category', label: 'CATEGORY', align: 'left' as const },
    { key: 'value', label: 'VALUE', align: 'right' as const },
    { key: 'percentage', label: '% OF TOTAL', align: 'right' as const },
    { key: 'trend', label: 'TREND', align: 'right' as const },
  ];

  if (isLoading) {
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

  if (error || !tileData) {
    return (
      <EngineLayout
        title="PRIMARY DEALER ENGINE"
        status="offline"
        className={className}
      >
        <div className="text-center text-text-secondary">
          {error || "No data available"}
        </div>
      </EngineLayout>
    );
  }

  return (
    <EngineLayout
      title="PRIMARY DEALER ENGINE"
      status={tileData.status === 'critical' ? 'critical' : tileData.status === 'warning' ? 'warning' : 'active'}
      className={className}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <KeyMetrics metrics={keyMetrics} columns={2} />

        {/* Position Visualization */}
        <DataSection title="POSITION VISUALIZATION">
          <div className="mb-4">
            <PositionBars {...tileData.positionBars} />
          </div>
        </DataSection>

        {/* Position Breakdown */}
        <DataSection title="POSITION BREAKDOWN">
          <DataTable 
            columns={positionColumns}
            data={positionData}
          />
        </DataSection>

        {/* Risk Assessment */}
        <DataSection title="RISK ASSESSMENT">
          <DataRow 
            label="Risk Appetite" 
            value={tileData.riskAppetite}
            status={tileData.riskAppetite === 'EXPANDING' ? 'positive' : tileData.riskAppetite === 'CONTRACTING' ? 'negative' : 'neutral'}
          />
          <DataRow 
            label="Position Confidence" 
            value={tileData.metadata.confidence * 100} 
            unit="%"
            status={tileData.metadata.confidence > 0.8 ? 'positive' : tileData.metadata.confidence > 0.6 ? 'neutral' : 'negative'}
          />
          <DataRow 
            label="Historical vs Current" 
            value={`${((tileData.positionBars.netPosition / tileData.positionBars.historicalAverage - 1) * 100).toFixed(1)}%`}
            status={tileData.positionBars.netPosition > tileData.positionBars.historicalAverage ? 'positive' : 'negative'}
          />
        </DataSection>

        {/* Metadata */}
        <DataSection title="DATA STATUS">
          <DataRow 
            label="Last Updated" 
            value={tileData.metadata.lastUpdated.toLocaleTimeString()}
            status="neutral"
          />
          <DataRow 
            label="Data Quality" 
            value={tileData.metadata.dataQuality} 
            unit="%"
            status={tileData.metadata.dataQuality > 95 ? 'positive' : tileData.metadata.dataQuality > 85 ? 'neutral' : 'negative'}
          />
        </DataSection>
      </div>
    </EngineLayout>
  );
};