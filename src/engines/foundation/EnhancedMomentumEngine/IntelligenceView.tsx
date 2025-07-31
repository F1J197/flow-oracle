import React from 'react';
import { 
  TerminalContainer, 
  TerminalGrid, 
  TerminalBox 
} from '@/components/Terminal';
import { cn } from '@/lib/utils';
import type { MomentumMetrics, MomentumAlert } from './types';

interface EnhancedMomentumIntelligenceViewProps {
  data?: MomentumMetrics;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export const EnhancedMomentumIntelligenceView: React.FC<EnhancedMomentumIntelligenceViewProps> = ({
  data,
  loading = false,
  error = null,
  className
}) => {
  if (loading) {
    return (
      <TerminalContainer className={className}>
        <div className="terminal-loading">
          <div className="text-center text-text-secondary">
            Loading momentum analysis...
          </div>
        </div>
      </TerminalContainer>
    );
  }

  if (error) {
    return (
      <TerminalContainer className={className}>
        <div className="terminal-error">
          <div className="text-center text-neon-orange">
            Error: {error}
          </div>
        </div>
      </TerminalContainer>
    );
  }

  if (!data) {
    return (
      <TerminalContainer className={className}>
        <div className="terminal-no-data">
          <div className="text-center text-text-secondary">
            No momentum data available
          </div>
        </div>
      </TerminalContainer>
    );
  }

  const { composite, multiscale, alerts } = data;

  // Determine overall status based on composite score and confidence
  const getOverallStatus = () => {
    if (composite.confidence < 50) return 'warning';
    if (Math.abs(composite.value) > 15) return 'critical';
    return 'active';
  };

  const overallStatus = getOverallStatus();

  return (
    <TerminalContainer className={className}>
      <TerminalBox>
        <div className="p-6 space-y-6">
          <div className="terminal-header">
            <h2 className="text-xl font-bold text-text-data">Enhanced Momentum Engine</h2>
            <div className={cn(
              "text-sm px-2 py-1 rounded",
              overallStatus === 'critical' ? "bg-neon-fuchsia/20 text-neon-fuchsia" :
              overallStatus === 'warning' ? "bg-neon-gold/20 text-neon-gold" :
              "bg-neon-teal/20 text-neon-teal"
            )}>
              {overallStatus.toUpperCase()}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="terminal-metric">
              <div className="text-xs text-text-secondary">Composite Score</div>
              <div className="text-lg font-bold text-text-data">
                {composite.value.toFixed(1)}%
              </div>
              <div className="text-xs text-text-secondary">
                {composite.category}
              </div>
            </div>

            <div className="terminal-metric">
              <div className="text-xs text-text-secondary">Confidence</div>
              <div className="text-lg font-bold text-text-data">
                {composite.confidence.toFixed(1)}%
              </div>
              <div className={cn(
                "text-xs",
                composite.confidence > 70 ? "text-neon-teal" : 
                composite.confidence > 50 ? "text-neon-gold" : "text-neon-orange"
              )}>
                {composite.confidence > 70 ? 'HIGH' : 
                 composite.confidence > 50 ? 'MEDIUM' : 'LOW'}
              </div>
            </div>

            <div className="terminal-metric">
              <div className="text-xs text-text-secondary">Regime</div>
              <div className="text-lg font-bold text-text-data">
                {composite.regime}
              </div>
              <div className="text-xs text-text-secondary">
                Lead: {composite.leadTime.toFixed(1)}w
              </div>
            </div>

            <div className="terminal-metric">
              <div className="text-xs text-text-secondary">Active Alerts</div>
              <div className={cn(
                "text-lg font-bold",
                alerts.length > 0 ? "text-neon-orange" : "text-neon-teal"
              )}>
                {alerts.length}
              </div>
              <div className="text-xs text-text-secondary">
                {alerts.length > 0 ? 'REVIEW' : 'CLEAR'}
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="space-y-4">
            <TerminalBox>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-text-data mb-3">Multiscale Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Short-term (14d)</span>
                    <span className="text-text-data">{multiscale.short.roc.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Medium-term (42d)</span>
                    <span className="text-text-data">{multiscale.medium.roc.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Long-term (84d)</span>
                    <span className="text-text-data">{multiscale.long.roc.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </TerminalBox>

            <TerminalBox>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-text-data mb-3">Derivative Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Velocity</span>
                    <span className="text-text-data">{multiscale.short.firstDerivative.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Acceleration</span>
                    <span className="text-text-data">{multiscale.short.secondDerivative.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Jerk</span>
                    <span className="text-text-data">{multiscale.short.jerk.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </TerminalBox>

            {/* Active Alerts */}
            {alerts.length > 0 && (
              <TerminalBox>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-text-data mb-3">Active Alerts</h3>
                  <div className="space-y-2">
                    {alerts.map((alert: MomentumAlert, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-text-secondary">{alert.type}</span>
                        <span className={cn(
                          "text-sm",
                          alert.severity === 'CRITICAL' ? "text-neon-fuchsia" :
                          alert.severity === 'HIGH' ? "text-neon-orange" : "text-neon-gold"
                        )}>
                          {alert.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TerminalBox>
            )}
          </div>
        </div>
      </TerminalBox>
    </TerminalContainer>
  );
};