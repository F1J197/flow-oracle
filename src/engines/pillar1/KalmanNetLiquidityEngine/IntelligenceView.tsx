import React from 'react';
import { TerminalDataSection } from '../../../components/intelligence/TerminalDataSection';
import { TerminalDataRow } from '../../../components/intelligence/TerminalDataRow';
import { formatCurrency, formatPercentage } from '../../../utils/formatting';
import type { NetLiquidityMetrics } from './types';

interface KalmanNetLiquidityIntelligenceViewProps {
  data?: NetLiquidityMetrics;
  loading?: boolean;
  error?: string;
}

export const KalmanNetLiquidityIntelligenceView: React.FC<KalmanNetLiquidityIntelligenceViewProps> = ({
  data,
  loading = false,
  error
}) => {
  if (error) {
    return (
      <div className="terminal-container">
        <div className="terminal-header">
          <h2 className="terminal-title">KALMAN NET LIQUIDITY</h2>
          <div className="terminal-status-critical">CRITICAL</div>
        </div>
        <div className="text-neon-orange p-4">
          Error: {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="terminal-container">
        <div className="terminal-header">
          <h2 className="terminal-title">KALMAN NET LIQUIDITY</h2>
          <div className="terminal-status-loading">LOADING</div>
        </div>
        <div className="space-y-4 p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-glass-border rounded mb-2"></div>
            <div className="h-4 bg-glass-border rounded mb-2"></div>
            <div className="h-4 bg-glass-border rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="terminal-container">
        <div className="terminal-header">
          <h2 className="terminal-title">KALMAN NET LIQUIDITY</h2>
          <div className="terminal-status-warning">WARNING</div>
        </div>
        <div className="text-text-secondary p-4">
          No data available
        </div>
      </div>
    );
  }

  const getStatusFromTrend = (trend: string): 'positive' | 'negative' | 'neutral' => {
    switch (trend) {
      case 'expanding': return 'positive';
      case 'contracting': return 'negative';
      default: return 'neutral';
    }
  };

  const convergenceStatus = data.kalmanMetrics.convergenceStatus === 'converged' ? 'positive' : 
                          data.kalmanMetrics.convergenceStatus === 'diverging' ? 'negative' : 'warning';

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <h2 className="terminal-title">KALMAN NET LIQUIDITY</h2>
        <div className={`terminal-status-${data.kalmanMetrics.convergenceStatus === 'converged' ? 'active' : 'warning'}`}>
          {data.kalmanMetrics.convergenceStatus === 'converged' ? 'ACTIVE' : 'WARNING'}
        </div>
      </div>

      <div className="space-y-6 p-4">
        {/* Primary Metrics */}
        <TerminalDataSection title="NET LIQUIDITY OVERVIEW">
          <TerminalDataRow
            label="Total Net Liquidity"
            value={formatCurrency(data.total, { compact: true, decimals: 2 })}
            status="neutral"
          />
          <TerminalDataRow
            label="Adaptive Signal"
            value={data.adaptiveSignal.direction.toUpperCase()}
            status={data.adaptiveSignal.direction === 'bullish' ? 'positive' : 
                   data.adaptiveSignal.direction === 'bearish' ? 'negative' : 'neutral'}
          />
          <TerminalDataRow
            label="Liquidity Regime"
            value={data.adaptiveSignal.regime}
            status={data.adaptiveSignal.regime === 'EXPANSION' ? 'positive' : 
                   data.adaptiveSignal.regime === 'CONTRACTION' ? 'negative' : 'warning'}
          />
          <TerminalDataRow
            label="Signal Confidence"
            value={formatPercentage(data.adaptiveSignal.confidence)}
            status="neutral"
          />
        </TerminalDataSection>

        {/* Component Analysis */}
        <TerminalDataSection title="LIQUIDITY COMPONENTS">
          <TerminalDataRow
            label="Fed Balance Sheet"
            value={formatCurrency(data.components.fedBalanceSheet.value, { compact: true, decimals: 1 })}
            status={getStatusFromTrend(data.components.fedBalanceSheet.trend)}
          />
          <TerminalDataRow
            label="Treasury General Account"
            value={formatCurrency(data.components.treasuryGeneralAccount.value, { compact: true, decimals: 0 })}
            status={getStatusFromTrend(data.components.treasuryGeneralAccount.trend)}
          />
          <TerminalDataRow
            label="Reverse Repo Operations"
            value={formatCurrency(data.components.reverseRepo.value, { compact: true, decimals: 1 })}
            status={getStatusFromTrend(data.components.reverseRepo.trend)}
          />
          <TerminalDataRow
            label="Currency in Circulation"
            value={formatCurrency(data.components.currencyInCirculation.value, { compact: true, decimals: 1 })}
            status={getStatusFromTrend(data.components.currencyInCirculation.trend)}
          />
        </TerminalDataSection>

        {/* Kalman Filter Analytics */}
        <TerminalDataSection title="KALMAN FILTER ANALYTICS">
          <TerminalDataRow
            label="Convergence Status"
            value={data.kalmanMetrics.convergenceStatus.toUpperCase()}
            status={convergenceStatus}
          />
          <TerminalDataRow
            label="Overall Confidence"
            value={formatPercentage(data.kalmanMetrics.overallConfidence)}
            status="neutral"
          />
          <TerminalDataRow
            label="Adaptation Rate"
            value={formatPercentage(data.kalmanMetrics.adaptationRate)}
            status="neutral"
          />
          <TerminalDataRow
            label="Signal-to-Noise Ratio"
            value={formatPercentage(1 - data.kalmanMetrics.signalNoise)}
            status="neutral"
          />
        </TerminalDataSection>

        {/* Component Weights & Uncertainties */}
        <TerminalDataSection title="COMPONENT ANALYTICS">
          {Object.entries(data.components).map(([key, component]) => (
            <TerminalDataRow
              key={key}
              label={`${component.name} Weight`}
              value={`${formatPercentage(component.weight)} | σ: ${component.kalmanState.uncertainty.toFixed(3)}`}
              status="neutral"
            />
          ))}
        </TerminalDataSection>

        {/* System Status */}
        <TerminalDataSection title="SYSTEM STATUS">
          <TerminalDataRow
            label="Last Calculation"
            value={data.lastCalculation.toLocaleTimeString()}
            status="neutral"
          />
          <TerminalDataRow
            label="Data Freshness"
            value={`${Math.round((Date.now() - data.lastCalculation.getTime()) / 1000)}s ago`}
            status="neutral"
          />
        </TerminalDataSection>
      </div>
    </div>
  );
};