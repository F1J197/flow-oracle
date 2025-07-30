import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MomentumChart } from "./MomentumChart";
import { cn } from "@/lib/utils";

interface MomentumAlert {
  type: 'DIVERGENCE' | 'EXTREME' | 'REVERSAL' | 'CONFLUENCE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  indicators: string[];
}

interface CompositeMomentumScore {
  value: number;
  category: 'EXPLODING' | 'BUILDING' | 'SLOWING' | 'DECLINING';
  confidence: number;
  leadTime: number;
  regime: 'BULL_ACCEL' | 'BULL_DECEL' | 'BEAR_ACCEL' | 'BEAR_DECEL' | 'NEUTRAL';
}

interface MomentumCalculation {
  roc: number;
  firstDerivative: number;
  secondDerivative: number;
  jerk: number;
}

interface MultiscaleMomentum {
  short: MomentumCalculation;
  medium: MomentumCalculation;
  long: MomentumCalculation;
}

interface MomentumDashboardProps {
  composite: CompositeMomentumScore;
  multiscale: MultiscaleMomentum;
  alerts: MomentumAlert[];
  className?: string;
}

export const MomentumDashboard = ({ 
  composite, 
  multiscale, 
  alerts, 
  className 
}: MomentumDashboardProps) => {
  
  const getCategoryColorClass = (category: string) => {
    switch (category) {
      case 'EXPLODING': return 'text-btc-orange-bright';
      case 'BUILDING': return 'text-btc-orange';
      case 'SLOWING': return 'text-btc-orange-light';
      case 'DECLINING': return 'text-btc-orange-dark';
      default: return 'text-btc-orange';
    }
  };

  const getRegimeColorClass = (regime: string) => {
    switch (regime) {
      case 'BULL_ACCEL': return 'text-btc-orange-bright';
      case 'BULL_DECEL': return 'text-btc-orange';
      case 'BEAR_ACCEL': return 'text-btc-orange-dark';
      case 'BEAR_DECEL': return 'text-btc-orange-muted';
      default: return 'text-btc-orange';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'btc-muted';
      case 'HIGH': return 'btc-dark';
      case 'MEDIUM': return 'btc-light';
      case 'LOW': return 'btc';
      default: return 'btc';
    }
  };

  const getSeverityColorClass = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-btc-orange-muted';
      case 'HIGH': return 'bg-btc-orange-dark';
      case 'MEDIUM': return 'bg-btc-orange-light';
      case 'LOW': return 'bg-btc-orange';
      default: return 'bg-btc-orange';
    }
  };

  const getMomentumDirection = (value: number) => {
    if (value > 50) return { text: 'EXPLOSIVE ↗', badgeVariant: 'btc-bright' as any };
    if (value > 20) return { text: 'BULLISH ↗', badgeVariant: 'btc' as any };
    if (value > -20) return { text: 'NEUTRAL →', badgeVariant: 'btc-light' as any };
    if (value > -50) return { text: 'BEARISH ↘', badgeVariant: 'btc-dark' as any };
    return { text: 'DECLINING ↓', badgeVariant: 'btc-muted' as any };
  };

  const direction = getMomentumDirection(composite.value);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Momentum Score */}
        <Card className="bg-glass-bg border-glass-border p-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              COMPOSITE MOMENTUM
            </h3>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-text-data">
                {composite.value.toFixed(1)}
              </div>
              <Badge 
                variant={direction.badgeVariant}
              >
                {direction.text}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Category:</span>
                <span className={`${getCategoryColorClass(composite.category)} font-medium`}>
                  {composite.category}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Regime:</span>
                <span className={`${getRegimeColorClass(composite.regime)} font-medium`}>
                  {composite.regime}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Confidence & Lead Time */}
        <Card className="bg-glass-bg border-glass-border p-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              SIGNAL QUALITY
            </h3>
            <div className="space-y-4">
              {/* Confidence */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Confidence</span>
                  <span className="text-text-primary font-medium">{composite.confidence}%</span>
                </div>
                <div className="w-full bg-noir-border h-2 terminal-panel">
                  <div 
                    className={`h-2 transition-all duration-300 terminal-panel ${
                      composite.confidence > 80 ? 'bg-btc-orange-bright' :
                      composite.confidence > 60 ? 'bg-btc-orange' :
                      composite.confidence > 40 ? 'bg-btc-orange-light' : 'bg-btc-orange-dark'
                    }`}
                    style={{ width: `${composite.confidence}%` }}
                  ></div>
                </div>
              </div>

              {/* Lead Time */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Lead Time</span>
                  <span className="text-text-primary font-medium">{composite.leadTime} weeks</span>
                </div>
                <div className="text-xs text-text-secondary">
                  Estimated forward-looking signal strength
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Active Alerts */}
        <Card className="bg-glass-bg border-glass-border p-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              ACTIVE ALERTS ({alerts.length})
            </h3>
            <div className="space-y-3 max-h-32 overflow-y-auto">
              {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 terminal-panel ${getSeverityColorClass(alert.severity)}`}></div>
                      <span className="text-xs font-medium text-text-primary">
                        {alert.type}
                      </span>
                      <Badge 
                        variant={getSeverityBadgeVariant(alert.severity) as any}
                        className="text-xs"
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary pl-4">
                      {alert.message}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-text-secondary italic">
                  No active alerts
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Multiscale Analysis */}
      <Card className="bg-glass-bg border-glass-border p-6">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-6">
          MULTISCALE MOMENTUM ANALYSIS
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Short Term */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-btc-orange">SHORT TERM (2W)</h4>
              <div className="text-sm font-bold text-text-data">
                {multiscale.short.roc.toFixed(2)}%
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Velocity:</span>
                <span className="text-text-primary font-mono">{multiscale.short.firstDerivative.toExponential(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Acceleration:</span>
                <span className="text-text-primary font-mono">{multiscale.short.secondDerivative.toExponential(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Jerk:</span>
                <span className="text-text-primary font-mono">{multiscale.short.jerk.toExponential(2)}</span>
              </div>
            </div>
          </div>

          {/* Medium Term */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-btc-orange-bright">MEDIUM TERM (6W)</h4>
              <div className="text-sm font-bold text-text-data">
                {multiscale.medium.roc.toFixed(2)}%
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Velocity:</span>
                <span className="text-text-primary font-mono">{multiscale.medium.firstDerivative.toExponential(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Acceleration:</span>
                <span className="text-text-primary font-mono">{multiscale.medium.secondDerivative.toExponential(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Jerk:</span>
                <span className="text-text-primary font-mono">{multiscale.medium.jerk.toExponential(2)}</span>
              </div>
            </div>
          </div>

          {/* Long Term */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-btc-orange-light">LONG TERM (12W)</h4>
              <div className="text-sm font-bold text-text-data">
                {multiscale.long.roc.toFixed(2)}%
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Velocity:</span>
                <span className="text-text-primary font-mono">{multiscale.long.firstDerivative.toExponential(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Acceleration:</span>
                <span className="text-text-primary font-mono">{multiscale.long.secondDerivative.toExponential(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Jerk:</span>
                <span className="text-text-primary font-mono">{multiscale.long.jerk.toExponential(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* System Status */}
      <Card className="bg-glass-bg border-glass-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-btc-orange-bright rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-text-primary">
              Enhanced Momentum Engine V6 • Real-time Processing
            </span>
          </div>
          <div className="text-xs text-text-secondary">
            Last Update: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </Card>
    </div>
  );
};