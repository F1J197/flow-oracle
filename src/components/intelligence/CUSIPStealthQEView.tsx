import { Badge } from "@/components/ui/badge";
import { GlassTile } from "@/components/shared/GlassTile";
import { memo } from "react";

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

  const getFlowDirectionColor = (direction: string) => {
    switch (direction) {
      case 'STEALTH_BUY': return 'lime';
      case 'STEALTH_SELL': return 'orange';
      case 'NEUTRAL': return 'gray';
      default: return 'gray';
    }
  };

  const getStealthScoreColor = (score: number) => {
    if (score > 75) return 'fuchsia';
    if (score > 50) return 'orange';
    if (score > 25) return 'gold';
    return 'teal';
  };

  if (loading) {
    return (
      <GlassTile title="CUSIP STEALTH QE ENGINE" status="normal" className="col-span-1">
        <div className="space-y-4">
          <div className="h-4 bg-noir-border rounded animate-pulse" />
          <div className="h-4 bg-noir-border rounded animate-pulse w-3/4" />
          <div className="h-4 bg-noir-border rounded animate-pulse w-1/2" />
        </div>
      </GlassTile>
    );
  }

  return (
    <GlassTile title="CUSIP STEALTH QE ENGINE" status="normal" className="col-span-1">
      <div className="space-y-6">
        {/* Primary Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-text-secondary mb-1">OVERALL STEALTH SCORE</div>
            <div className={`text-xl font-bold text-neon-${getStealthScoreColor(parseFloat(dashboardData.primaryMetric))}`}>
              {dashboardData.primaryMetric}/100
            </div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">OPERATION STATUS</div>
            <Badge 
              variant="outline" 
              className={`border-neon-${dashboardData.color} text-neon-${dashboardData.color}`}
            >
              {dashboardData.actionText}
            </Badge>
          </div>
        </div>

        {/* Segment Analysis */}
        <div>
          <div className="text-sm font-medium text-text-primary mb-3">TREASURY SEGMENT ANALYSIS</div>
          <div className="grid grid-cols-2 gap-3">
            {detailedView.sections?.[0]?.metrics && Object.entries(detailedView.sections[0].metrics).map(([segment, value]) => {
              const [score, direction] = (value as string).split(' (');
              const cleanDirection = direction?.replace(')', '') || 'NEUTRAL';
              
              return (
                <div key={segment} className="bg-glass-bg border border-glass-border rounded-lg p-3">
                  <div className="text-xs text-text-secondary mb-1">{segment}</div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold text-neon-${getStealthScoreColor(parseFloat(score))}`}>
                      {score}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`border-neon-${getFlowDirectionColor(cleanDirection)} text-neon-${getFlowDirectionColor(cleanDirection)} text-xs`}
                    >
                      {cleanDirection.replace('STEALTH_', '')}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flow Intelligence */}
        <div>
          <div className="text-sm font-medium text-text-primary mb-3">FLOW INTELLIGENCE</div>
          <div className="grid grid-cols-2 gap-4">
            {detailedView.sections?.[1]?.metrics && Object.entries(detailedView.sections[1].metrics).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="text-xs text-text-secondary">{key}</div>
                <div className="text-sm font-medium text-text-primary">{value as string}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {detailedView.alerts && detailedView.alerts.length > 0 && (
          <div className="border border-neon-orange/30 bg-neon-orange/5 rounded-lg p-3">
            <div className="text-xs font-medium text-neon-orange mb-2">STEALTH OPERATION ALERT</div>
            {detailedView.alerts.map((alert: any, index: number) => (
              <div key={index} className="text-xs text-text-secondary">
                {alert.message}
              </div>
            ))}
          </div>
        )}

        {/* Performance Metrics */}
        <div className="pt-3 border-t border-noir-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-text-secondary">HIDDEN FLOWS</div>
              <div className="text-sm font-bold text-neon-fuchsia">
                {detailedView.primarySection?.metrics?.['Hidden Flows Detected'] || '0'}
              </div>
            </div>
            <div>
              <div className="text-xs text-text-secondary">CONFIDENCE</div>
              <div className="text-sm font-bold text-btc-orange">
                {detailedView.primarySection?.metrics?.['Detection Confidence'] || '0%'}
              </div>
            </div>
            <div>
              <div className="text-xs text-text-secondary">INTENSITY</div>
              <div className="text-sm font-bold text-neon-orange">
                {detailedView.primarySection?.metrics?.['Operation Intensity'] || '0'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassTile>
  );
});