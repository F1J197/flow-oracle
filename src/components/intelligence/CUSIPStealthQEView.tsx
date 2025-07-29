import { Badge } from "@/components/ui/badge";
import { EngineLayout } from "./EngineLayout";
import { KeyMetrics } from "./KeyMetrics";
import { DataSection } from "./DataSection";
import { DataRow } from "./DataRow";
import { memo, useMemo } from "react";

interface CUSIPData {
  id: string;
  name: string;
  maturity: string;
  outstandingAmount: number;
  yieldCurveContribution: number;
  technicalFlows: number;
  stealthScore: number;
}

interface TreasurySegment {
  name: string;
  cusips: CUSIPData[];
  avgStealthScore: number;
  flowDirection: 'STEALTH_BUY' | 'STEALTH_SELL' | 'NEUTRAL';
  intensity: number;
}

interface CUSIPStealthQEViewProps {
  engine: {
    getDashboardData: () => any;
    getDetailedView: () => any;
  };
  loading?: boolean;
}

export const CUSIPStealthQEView = memo<CUSIPStealthQEViewProps>(({ 
  engine, 
  loading = false 
}) => {
  const dashboardData = engine.getDashboardData();
  const detailedView = engine.getDetailedView();

  const keyMetrics = useMemo(() => [
    {
      label: "Overall Stealth Score",
      value: parseFloat(dashboardData.primaryMetric),
      format: "number" as const,
      decimals: 0,
      unit: "/100",
      status: parseFloat(dashboardData.primaryMetric) > 75 ? 'critical' as const : 
              parseFloat(dashboardData.primaryMetric) > 50 ? 'warning' as const : 'neutral' as const
    },
    {
      label: "Hidden Flows",
      value: detailedView.primarySection?.metrics?.['Hidden Flows Detected'] || '0',
      status: 'positive' as const
    },
    {
      label: "Detection Confidence",
      value: detailedView.primarySection?.metrics?.['Detection Confidence'] || '0%',
      status: 'positive' as const
    },
    {
      label: "Operation Status",
      value: dashboardData.actionText,
      status: 'neutral' as const
    }
  ], [dashboardData, detailedView]);

  const getFlowDirectionBadgeVariant = (direction: string) => {
    switch (direction) {
      case 'STEALTH_BUY': return 'btc-bright';
      case 'STEALTH_SELL': return 'btc-dark';
      case 'NEUTRAL': return 'outline';
      default: return 'outline';
    }
  };

  const getStealthScoreColorClass = (score: number) => {
    if (score > 75) return 'text-btc-orange-bright';
    if (score > 50) return 'text-btc-orange';
    if (score > 25) return 'text-btc-orange-light';
    return 'text-btc-orange-muted';
  };

  if (loading) {
    return (
      <EngineLayout title="CUSIP STEALTH QE ENGINE" status="active">
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-glass-surface rounded" />
          <div className="h-4 bg-glass-surface rounded w-3/4" />
          <div className="h-4 bg-glass-surface rounded w-1/2" />
        </div>
      </EngineLayout>
    );
  }

  return (
    <EngineLayout title="CUSIP STEALTH QE ENGINE" status="active">
      <div className="space-y-6">
        {/* Key Metrics */}
        <KeyMetrics metrics={keyMetrics} columns={2} />

        {/* Treasury Segment Analysis */}
        <DataSection title="TREASURY SEGMENT ANALYSIS">
          {detailedView.sections?.[0]?.metrics && Object.entries(detailedView.sections[0].metrics).map(([segment, value]) => {
            const [score, direction] = (value as string).split(' (');
            const cleanDirection = direction?.replace(')', '') || 'NEUTRAL';
            const scoreValue = parseFloat(score);
            
            return (
              <div key={segment} className="flex items-center justify-between py-2 border-b border-glass-border/30 last:border-0">
                <div className="space-y-1">
                  <div className="text-xs text-text-secondary font-medium">{segment}</div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium ${getStealthScoreColorClass(scoreValue)}`}>
                      {score}
                    </span>
                    <Badge 
                      variant={getFlowDirectionBadgeVariant(cleanDirection) as any}
                      className="text-xs"
                    >
                      {cleanDirection.replace('STEALTH_', '')}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </DataSection>

        {/* Flow Intelligence */}
        <DataSection title="FLOW INTELLIGENCE">
          {detailedView.sections?.[1]?.metrics && Object.entries(detailedView.sections[1].metrics).map(([key, value]) => (
            <DataRow 
              key={key}
              label={key}
              value={value as string}
              status="neutral"
            />
          ))}
        </DataSection>

        {/* Alerts */}
        {detailedView.alerts && detailedView.alerts.length > 0 && (
          <div className="border border-btc-orange/30 bg-btc-orange/5 rounded-lg p-3">
            <div className="text-xs font-medium text-btc-orange mb-2">STEALTH OPERATION ALERT</div>
            {detailedView.alerts.map((alert: any, index: number) => (
              <div key={index} className="text-xs text-text-secondary">
                {alert.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </EngineLayout>
  );
});