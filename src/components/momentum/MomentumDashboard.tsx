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
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'EXPLODING': return 'neon-lime';
      case 'BUILDING': return 'neon-teal';
      case 'SLOWING': return 'neon-gold';
      case 'DECLINING': return 'neon-orange';
      default: return 'text-secondary';
    }
  };

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'BULL_ACCEL': return 'neon-lime';
      case 'BULL_DECEL': return 'neon-teal';
      case 'BEAR_ACCEL': return 'neon-orange';
      case 'BEAR_DECEL': return 'neon-fuchsia';
      default: return 'text-secondary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'neon-fuchsia';
      case 'HIGH': return 'neon-orange';
      case 'MEDIUM': return 'neon-gold';
      case 'LOW': return 'neon-teal';
      default: return 'text-secondary';
    }
  };

  const getMomentumDirection = (value: number) => {
    if (value > 50) return { text: 'EXPLOSIVE ↗', color: 'neon-lime' };
    if (value > 20) return { text: 'BULLISH ↗', color: 'neon-teal' };
    if (value > -20) return { text: 'NEUTRAL →', color: 'neon-gold' };
    if (value > -50) return { text: 'BEARISH ↘', color: 'neon-orange' };
    return { text: 'DECLINING ↓', color: 'neon-fuchsia' };
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
                variant="outline" 
                className={`border-${direction.color} text-${direction.color}`}
              >
                {direction.text}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Category:</span>
                <span className={`text-${getCategoryColor(composite.category)} font-medium`}>
                  {composite.category}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Regime:</span>
                <span className={`text-${getRegimeColor(composite.regime)} font-medium`}>
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
                <div className="w-full bg-noir-border rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      composite.confidence > 80 ? 'bg-neon-lime' :
                      composite.confidence > 60 ? 'bg-neon-teal' :
                      composite.confidence > 40 ? 'bg-neon-gold' : 'bg-neon-orange'
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
                      <div className={`w-2 h-2 rounded-full bg-${getSeverityColor(alert.severity)}`}></div>
                      <span className="text-xs font-medium text-text-primary">
                        {alert.type}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs border-${getSeverityColor(alert.severity)} text-${getSeverityColor(alert.severity)}`}
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
              <h4 className="text-sm font-medium text-neon-teal">SHORT TERM (2W)</h4>
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
              <h4 className="text-sm font-medium text-neon-lime">MEDIUM TERM (6W)</h4>
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
              <h4 className="text-sm font-medium text-neon-gold">LONG TERM (12W)</h4>
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
            <div className="w-3 h-3 bg-neon-lime rounded-full animate-pulse"></div>
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