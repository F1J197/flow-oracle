import React from 'react';
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
import { StaticTileWrapper } from './StaticTileWrapper';
import { ZScoreHistogram } from '@/components/intelligence/ZScoreHistogram';
import { useZScoreData } from '@/hooks/useZScoreData';

interface ZScoreDashboardTileProps {
  className?: string;
}

export const ZScoreDashboardTile: React.FC<ZScoreDashboardTileProps> = ({ className }) => {
  const { tileData, loading, error, confidence, lastUpdate } = useZScoreData({
    autoRefresh: true,
    refreshInterval: 15000,
    includeDistribution: true
  });

  const getStatusIcon = () => {
    if (!tileData) return <Activity className="w-4 h-4" />;
    
    switch (tileData.primaryMetric.status) {
      case 'extreme_positive':
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-neon-lime" />;
      case 'extreme_negative':
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-neon-orange" />;
      case 'neutral':
        return <Activity className="w-4 h-4 text-neon-teal" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-neon-gold" />;
    }
  };

  const getStatusColor = () => {
    if (!tileData) return 'text-text-secondary';
    
    switch (tileData.primaryMetric.status) {
      case 'extreme_positive':
        return 'text-neon-lime';
      case 'positive':
        return 'text-btc-light';
      case 'neutral':
        return 'text-neon-teal';
      case 'negative':
        return 'text-neon-orange';
      case 'extreme_negative':
        return 'text-neon-fuchsia';
      default:
        return 'text-neon-gold';
    }
  };

  const getRegimeColor = () => {
    if (!tileData) return 'text-text-secondary';
    
    switch (tileData.regime.current) {
      case 'SPRING':
      case 'SUMMER':
        return 'text-neon-lime';
      case 'AUTUMN':
        return 'text-neon-gold';
      case 'WINTER':
        return 'text-neon-teal';
      default:
        return 'text-text-secondary';
    }
  };

  if (error) {
    return (
      <div className={className}>
        <StaticTileWrapper>
          <div className="text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-neon-orange mx-auto" />
            <div className="text-sm text-text-secondary">
              Z-Score calculation error
            </div>
            <div className="text-xs text-neon-orange">
              {error}
            </div>
          </div>
        </StaticTileWrapper>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={className}>
        <StaticTileWrapper>
          <div className="glass-tile p-6 animate-pulse">
            <div className="h-4 bg-glass-bg rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-glass-bg rounded w-1/2"></div>
          </div>
        </StaticTileWrapper>
      </div>
    );
  }

  return (
    <div className={className}>
      <StaticTileWrapper>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-text-primary">
              {tileData?.title || 'Enhanced Z-Score Engine'}
            </h3>
            {getStatusIcon()}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-neon-lime rounded-full animate-pulse" />
            <span className="text-xs text-text-secondary">LIVE</span>
          </div>
        </div>

        {/* Primary Metric */}
        <div className="text-center space-y-1">
          <div className={`text-3xl font-mono font-bold ${getStatusColor()}`}>
            {tileData?.primaryMetric.formatted || '0.00σ'}
          </div>
          <div className="text-xs text-text-secondary">
            Composite Z-Score
          </div>
        </div>

        {/* Histogram */}
        {tileData?.histogram && (
          <div className="space-y-2">
            <div className="text-xs text-text-secondary text-center">
              Distribution Analysis
            </div>
            <ZScoreHistogram
              bins={tileData.histogram.bins}
              currentValue={tileData.histogram.currentValue}
              extremeThreshold={tileData.histogram.extremeThreshold}
              height={40}
              className="px-2"
            />
          </div>
        )}

        {/* Regime & Confidence */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-glass-border">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-lg">{tileData?.regime.emoji || '🌱'}</span>
              <span className={`text-xs font-medium ${getRegimeColor()}`}>
                {tileData?.regime.current || 'SPRING'}
              </span>
            </div>
            <div className="text-xs text-text-secondary">
              Market Regime
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-mono font-bold text-neon-teal mb-1">
              {tileData ? `${(tileData.confidence * 100).toFixed(0)}%` : '0%'}
            </div>
            <div className="text-xs text-text-secondary">
              Confidence
            </div>
          </div>
        </div>

        {/* Footer */}
        {lastUpdate && (
          <div className="text-xs text-text-secondary text-center pt-2 border-t border-glass-border">
            Updated {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>
      </StaticTileWrapper>
    </div>
  );
};