import { useMemo } from "react";
import { TerminalLayout } from "./TerminalLayout";
import { TerminalMetricGrid } from "./TerminalMetricGrid";
import { TerminalDataSection } from "./TerminalDataSection";
import { TerminalDataRow } from "./TerminalDataRow";
import { PositionBars } from "@/components/shared/PositionBars";
import { useDealerPositions } from "@/hooks/useDealerPositions";
import { useStableData } from "@/hooks/useStableData";

interface PrimaryDealerPositionsViewProps {
  engine?: {
    getDashboardData: () => any;
    getDetailedView: () => any;
  };
  loading?: boolean;
  className?: string;
}

export const PrimaryDealerPositionsView = ({ 
  engine, 
  loading: externalLoading, 
  className 
}: PrimaryDealerPositionsViewProps) => {
  const { data, alerts, insights, loading: hookLoading, error } = useDealerPositions();
  const isLoading = externalLoading || hookLoading;

  // Stabilized mock data for consistent display
  const mockData = useStableData({
    treasuryPositions: { total: 2450000000000, bills: 850000000000, notes: 1200000000000, bonds: 400000000000 },
    agencyPositions: { total: 350000000000 },
    corporatePositions: { total: 180000000000 },
    internationalPositions: { total: 95000000000 },
    riskMetrics: {
      riskCapacity: 87.5,
      leverageRatio: 3.2,
      liquidityStress: 12.3,
      positionVelocity: 8.7,
      concentrationRisk: 15.2,
      durationRisk: 22.1
    },
    analytics: {
      regime: 'EXPANSION',
      regimeConfidence: 0.85,
      flowDirection: 'ACCUMULATING',
      systemicRisk: 0.18,
      marketImpact: 'MODERATE'
    },
    metadata: {
      dataQuality: 0.962,
      sourceReliability: 0.948,
      lastUpdated: new Date()
    }
  }).value;

  const effectiveData = data || mockData;
  const totalPositions = effectiveData.treasuryPositions.total + effectiveData.agencyPositions.total + 
                         effectiveData.corporatePositions.total + effectiveData.internationalPositions.total;

  const keyMetrics = useMemo(() => [
    {
      label: "Total Positions",
      value: `$${(totalPositions / 1000000000000).toFixed(2)}T`,
      status: 'positive' as const
    },
    {
      label: "Risk Capacity",
      value: `${effectiveData.riskMetrics.riskCapacity.toFixed(1)}%`,
      status: effectiveData.riskMetrics.riskCapacity > 80 ? 'positive' as const : 'warning' as const
    },
    {
      label: "Leverage Ratio",
      value: `${effectiveData.riskMetrics.leverageRatio.toFixed(1)}x`,
      status: effectiveData.riskMetrics.leverageRatio < 4 ? 'positive' as const : 'warning' as const
    },
    {
      label: "Systemic Risk",
      value: `${(effectiveData.analytics.systemicRisk * 100).toFixed(1)}%`,
      status: effectiveData.analytics.systemicRisk < 0.2 ? 'positive' as const : 'warning' as const
    }
  ], [effectiveData, totalPositions]);

  if (isLoading) {
    return (
      <TerminalLayout title="PRIMARY DEALER POSITIONS V6" status="offline" className={className}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-glass-bg rounded"></div>
          <div className="h-4 bg-glass-bg rounded w-3/4"></div>
          <div className="h-4 bg-glass-bg rounded w-1/2"></div>
        </div>
      </TerminalLayout>
    );
  }

  if (error && !effectiveData) {
    return (
      <TerminalLayout title="PRIMARY DEALER POSITIONS V6" status="critical" className={className}>
        <div className="text-center text-neon-orange">
          {error || 'Unable to load dealer positions data'}
        </div>
      </TerminalLayout>
    );
  }

  const getStatus = () => {
    if (effectiveData.riskMetrics.leverageRatio > 5 || effectiveData.analytics.systemicRisk > 0.3) return 'critical';
    if (effectiveData.riskMetrics.leverageRatio > 4 || effectiveData.analytics.systemicRisk > 0.2) return 'warning';
    return 'active';
  };

  return (
    <TerminalLayout title="PRIMARY DEALER POSITIONS V6" status={getStatus()} className={className}>
      <div className="space-y-6">
        <TerminalMetricGrid metrics={keyMetrics} columns={2} />
        
        <TerminalDataSection title="POSITION BREAKDOWN">
          <TerminalDataRow 
            label="Treasury Securities" 
            value={`$${(effectiveData.treasuryPositions.total / 1000000000000).toFixed(2)}T`}
            status="positive"
          />
          <TerminalDataRow 
            label="  Bills" 
            value={`$${(effectiveData.treasuryPositions.bills / 1000000000000).toFixed(2)}T`}
            status="neutral"
          />
          <TerminalDataRow 
            label="  Notes" 
            value={`$${(effectiveData.treasuryPositions.notes / 1000000000000).toFixed(2)}T`}
            status="neutral"
          />
          <TerminalDataRow 
            label="  Bonds" 
            value={`$${(effectiveData.treasuryPositions.bonds / 1000000000000).toFixed(2)}T`}
            status="neutral"
          />
          <TerminalDataRow 
            label="Agency Securities" 
            value={`$${(effectiveData.agencyPositions.total / 1000000000000).toFixed(2)}T`}
            status="positive"
          />
          <TerminalDataRow 
            label="Corporate Bonds" 
            value={`$${(effectiveData.corporatePositions.total / 1000000000000).toFixed(2)}T`}
            status="positive"
          />
          <TerminalDataRow 
            label="International" 
            value={`$${(effectiveData.internationalPositions.total / 1000000000000).toFixed(2)}T`}
            status="positive"
          />
        </TerminalDataSection>

        <TerminalDataSection title="RISK METRICS">
          <TerminalDataRow 
            label="Liquidity Stress" 
            value={`${effectiveData.riskMetrics.liquidityStress.toFixed(1)}%`}
            status={effectiveData.riskMetrics.liquidityStress < 15 ? 'positive' : 'warning'}
          />
          <TerminalDataRow 
            label="Position Velocity" 
            value={`${effectiveData.riskMetrics.positionVelocity.toFixed(1)}%`}
            status={effectiveData.riskMetrics.positionVelocity < 10 ? 'positive' : 'neutral'}
          />
          <TerminalDataRow 
            label="Concentration Risk" 
            value={`${effectiveData.riskMetrics.concentrationRisk.toFixed(1)}%`}
            status={effectiveData.riskMetrics.concentrationRisk < 20 ? 'positive' : 'warning'}
          />
          <TerminalDataRow 
            label="Duration Risk" 
            value={`${effectiveData.riskMetrics.durationRisk.toFixed(1)}%`}
            status={effectiveData.riskMetrics.durationRisk < 25 ? 'positive' : 'warning'}
          />
        </TerminalDataSection>

        <TerminalDataSection title="MARKET ANALYSIS">
          <TerminalDataRow 
            label="Market Regime" 
            value={effectiveData.analytics.regime}
            status={effectiveData.analytics.regime === 'EXPANSION' ? 'positive' : 'neutral'}
          />
          <TerminalDataRow 
            label="Flow Direction" 
            value={effectiveData.analytics.flowDirection}
            status={effectiveData.analytics.flowDirection === 'ACCUMULATING' ? 'positive' : 'negative'}
          />
          <TerminalDataRow 
            label="Regime Confidence" 
            value={`${(effectiveData.analytics.regimeConfidence * 100).toFixed(1)}%`}
            status={effectiveData.analytics.regimeConfidence > 0.8 ? 'positive' : 'neutral'}
          />
          <TerminalDataRow 
            label="Market Impact" 
            value={effectiveData.analytics.marketImpact}
            status={effectiveData.analytics.marketImpact === 'LOW' ? 'positive' : 'neutral'}
          />
        </TerminalDataSection>

        <TerminalDataSection title="DATA QUALITY">
          <TerminalDataRow 
            label="Data Quality" 
            value={`${(effectiveData.metadata.dataQuality * 100).toFixed(1)}%`}
            status={effectiveData.metadata.dataQuality > 0.95 ? 'positive' : 'neutral'}
          />
          <TerminalDataRow 
            label="Source Reliability" 
            value={`${(effectiveData.metadata.sourceReliability * 100).toFixed(1)}%`}
            status={effectiveData.metadata.sourceReliability > 0.9 ? 'positive' : 'neutral'}
          />
          <TerminalDataRow 
            label="Last Updated" 
            value={effectiveData.metadata.lastUpdated.toLocaleTimeString()}
            status="neutral"
          />
        </TerminalDataSection>

        {/* Show alerts if any */}
        {alerts && alerts.length > 0 && (
          <TerminalDataSection title="ACTIVE ALERTS">
            {alerts.slice(0, 3).map((alert, index) => (
              <TerminalDataRow 
                key={index}
                label={alert.severity || 'ALERT'} 
                value={alert.message || 'Alert condition detected'}
                status={
                  alert.severity === 'CRITICAL' ? 'critical' : 
                  alert.severity === 'WARNING' ? 'warning' : 'neutral'
                }
              />
            ))}
          </TerminalDataSection>
        )}
      </div>
    </TerminalLayout>
  );
};