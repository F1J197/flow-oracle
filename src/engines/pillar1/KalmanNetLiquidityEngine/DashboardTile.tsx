import React from 'react';
import { TerminalTile } from '../../../components/Terminal/TerminalTile';
import { formatCurrency } from '../../../utils/formatting';
import type { NetLiquidityMetrics } from './types';

interface KalmanNetLiquidityDashboardTileProps {
  data?: NetLiquidityMetrics;
  loading?: boolean;
  error?: string;
  onClick?: () => void;
  className?: string;
}

export const KalmanNetLiquidityDashboardTile: React.FC<KalmanNetLiquidityDashboardTileProps> = ({
  data,
  loading = false,
  error,
  onClick,
  className
}) => {
  const getStatus = (signal?: string, confidence?: number) => {
    if (error) return 'critical';
    if (!data || loading) return 'offline';
    if (confidence && confidence < 0.4) return 'warning';
    return 'normal';
  };

  const getSignalColor = (direction?: string) => {
    switch (direction) {
      case 'bullish': return 'text-neon-lime';
      case 'bearish': return 'text-neon-orange';
      default: return 'text-neon-teal';
    }
  };

  const getRegimeEmoji = (regime?: string) => {
    switch (regime) {
      case 'EXPANSION': return '📈';
      case 'CONTRACTION': return '📉';
      case 'TRANSITION': return '🔄';
      default: return '⚪';
    }
  };

  return (
    <TerminalTile
      title="KALMAN NET LIQUIDITY"
      status={getStatus(data?.adaptiveSignal.direction, data?.kalmanMetrics.overallConfidence)}
      onClick={onClick}
      className={className}
    >
      <div className="space-y-3">
        {/* Primary Metric */}
        <div className="text-center">
          <div className="text-2xl font-bold text-data">
            {loading ? (
              <div className="animate-pulse">Loading...</div>
            ) : error ? (
              <div className="text-neon-orange">Error</div>
            ) : data ? (
              formatCurrency(data.total, { 
                compact: true, 
                decimals: 1 
              })
            ) : (
              '--'
            )}
          </div>
          <div className="text-xs text-secondary mt-1">Net Liquidity</div>
        </div>

        {/* Signal & Regime */}
        {data && !loading && !error && (
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-2">
              <span className={getSignalColor(data.adaptiveSignal.direction)}>
                {data.adaptiveSignal.direction.toUpperCase()}
              </span>
              <span className="text-secondary">
                {(data.adaptiveSignal.strength * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span>{getRegimeEmoji(data.adaptiveSignal.regime)}</span>
              <span className="text-secondary text-xs">
                {data.adaptiveSignal.regime}
              </span>
            </div>
          </div>
        )}

        {/* Component Status */}
        {data && !loading && !error && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-secondary">Fed BS:</span>
              <span className={`${data.components.fedBalanceSheet.trend === 'expanding' ? 'text-neon-lime' : 
                data.components.fedBalanceSheet.trend === 'contracting' ? 'text-neon-orange' : 'text-neon-teal'}`}>
                {data.components.fedBalanceSheet.trend === 'expanding' ? '↗' : 
                 data.components.fedBalanceSheet.trend === 'contracting' ? '↘' : '→'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">TGA:</span>
              <span className={`${data.components.treasuryGeneralAccount.trend === 'expanding' ? 'text-neon-orange' : 
                data.components.treasuryGeneralAccount.trend === 'contracting' ? 'text-neon-lime' : 'text-neon-teal'}`}>
                {data.components.treasuryGeneralAccount.trend === 'expanding' ? '↗' : 
                 data.components.treasuryGeneralAccount.trend === 'contracting' ? '↘' : '→'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">RRP:</span>
              <span className={`${data.components.reverseRepo.trend === 'expanding' ? 'text-neon-orange' : 
                data.components.reverseRepo.trend === 'contracting' ? 'text-neon-lime' : 'text-neon-teal'}`}>
                {data.components.reverseRepo.trend === 'expanding' ? '↗' : 
                 data.components.reverseRepo.trend === 'contracting' ? '↘' : '→'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Conf:</span>
              <span className="text-data">
                {(data.kalmanMetrics.overallConfidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-secondary">
            {loading ? 'Updating...' : 
             error ? 'Connection Error' :
             data ? `Kalman: ${data.kalmanMetrics.convergenceStatus}` : 'No Data'}
          </span>
          <div className={`w-2 h-2 rounded-full ${
            getStatus(data?.adaptiveSignal.direction, data?.kalmanMetrics.overallConfidence) === 'normal' ? 'bg-neon-lime' :
            getStatus(data?.adaptiveSignal.direction, data?.kalmanMetrics.overallConfidence) === 'warning' ? 'bg-neon-gold' :
            getStatus(data?.adaptiveSignal.direction, data?.kalmanMetrics.overallConfidence) === 'critical' ? 'bg-neon-orange' :
            'bg-glass-border animate-pulse'
          }`} />
        </div>
      </div>
    </TerminalTile>
  );
};