import React from 'react';
import { BaseTile } from '../../../components/tiles/BaseTile';
import { formatCurrency, formatPercentage, getStatusColor } from '../../../utils/formatting';
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
  const getStatus = () => {
    if (error) return 'critical';
    if (loading || !data) return 'loading';
    if (data.kalmanMetrics.overallConfidence < 0.4) return 'warning';
    return 'normal';
  };

  const getSignalColor = (direction?: string) => {
    switch (direction) {
      case 'bullish': return 'text-neon-lime';
      case 'bearish': return 'text-neon-orange';
      default: return 'text-neon-teal';
    }
  };

  const getVariant = () => {
    if (error) return 'critical';
    if (!data || loading) return 'default';
    if (data.adaptiveSignal.direction === 'bullish') return 'positive';
    if (data.adaptiveSignal.direction === 'bearish') return 'negative';
    return 'default';
  };

  return (
    <BaseTile
      size="md"
      variant={getVariant()}
      status={getStatus()}
      interactive={onClick ? 'clickable' : 'hover'}
      onClick={onClick}
      className={className}
    >
      {/* Header */}
      <div className="tile-header">
        <div className="tile-title">KALMAN NET LIQUIDITY</div>
        <div className={`terminal-status ${
          getStatus() === 'normal' ? 'text-neon-lime' :
          getStatus() === 'warning' ? 'text-neon-gold' :
          getStatus() === 'critical' ? 'text-neon-orange' :
          'text-text-muted'
        }`}>
          {getStatus() === 'normal' ? '█' :
           getStatus() === 'warning' ? '▲' :
           getStatus() === 'critical' ? '✕' :
           '○'}
        </div>
      </div>

      {/* Primary Metric */}
      <div className="tile-content">
        <div className="text-center mb-4">
          <div className="metric-display text-text-data">
            {loading ? (
              <div className="animate-pulse opacity-60">---</div>
            ) : error ? (
              <div className="text-neon-orange">ERR</div>
            ) : data ? (
              formatCurrency(data.total, { compact: true, decimals: 1 })
            ) : (
              '---'
            )}
          </div>
          <div className="text-xs text-text-secondary mt-1 terminal-label">
            NET LIQUIDITY
          </div>
        </div>

        {/* Signal Status */}
        {data && !loading && !error && (
          <>
            <div className="flex justify-between items-center mb-3 text-sm">
              <div className="flex items-center space-x-2">
                <span className={`font-mono font-semibold ${getSignalColor(data.adaptiveSignal.direction)}`}>
                  {data.adaptiveSignal.direction.toUpperCase()}
                </span>
                <span className="text-text-secondary terminal-data">
                  {formatPercentage(data.adaptiveSignal.strength * 100, { decimals: 0 })}
                </span>
              </div>
              <div className="text-text-secondary terminal-data">
                {data.adaptiveSignal.regime}
              </div>
            </div>

            {/* Component Grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs terminal-text">
              <div className="flex justify-between">
                <span className="text-text-secondary">FED BS:</span>
                <span className={`terminal-data ${
                  data.components.fedBalanceSheet.trend === 'expanding' ? 'text-neon-lime' : 
                  data.components.fedBalanceSheet.trend === 'contracting' ? 'text-neon-orange' : 
                  'text-neon-teal'
                }`}>
                  {data.components.fedBalanceSheet.trend === 'expanding' ? '↗' : 
                   data.components.fedBalanceSheet.trend === 'contracting' ? '↘' : '→'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">TGA:</span>
                <span className={`terminal-data ${
                  data.components.treasuryGeneralAccount.trend === 'expanding' ? 'text-neon-orange' : 
                  data.components.treasuryGeneralAccount.trend === 'contracting' ? 'text-neon-lime' : 
                  'text-neon-teal'
                }`}>
                  {data.components.treasuryGeneralAccount.trend === 'expanding' ? '↗' : 
                   data.components.treasuryGeneralAccount.trend === 'contracting' ? '↘' : '→'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">RRP:</span>
                <span className={`terminal-data ${
                  data.components.reverseRepo.trend === 'expanding' ? 'text-neon-orange' : 
                  data.components.reverseRepo.trend === 'contracting' ? 'text-neon-lime' : 
                  'text-neon-teal'
                }`}>
                  {data.components.reverseRepo.trend === 'expanding' ? '↗' : 
                   data.components.reverseRepo.trend === 'contracting' ? '↘' : '→'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">CONF:</span>
                <span className="text-text-data terminal-data">
                  {formatPercentage(data.kalmanMetrics.overallConfidence * 100, { decimals: 0 })}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Status Footer */}
        <div className="flex justify-between items-center mt-4 pt-2 border-t border-glass-border text-xs">
          <span className="text-text-secondary terminal-text">
            {loading ? 'UPDATING...' : 
             error ? 'CONNECTION ERROR' :
             data ? `KALMAN: ${data.kalmanMetrics.convergenceStatus?.toUpperCase()}` : 
             'NO DATA'}
          </span>
          <div className={`w-2 h-2 status-indicator ${
            getStatus() === 'normal' ? 'status-active' :
            getStatus() === 'warning' ? 'status-warning' :
            getStatus() === 'critical' ? 'status-critical' :
            'status-offline'
          }`} />
        </div>
      </div>
    </BaseTile>
  );
};