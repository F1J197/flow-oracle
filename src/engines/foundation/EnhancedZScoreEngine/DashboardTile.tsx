import React from 'react';
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
import { StaticTileWrapper } from '@/components/dashboard/StaticTileWrapper';
import { ZScoreHistogram } from '@/components/intelligence/ZScoreHistogram';
import { useZScoreData } from '@/hooks/useZScoreData';
import { MarketRegime } from '@/types/zscoreTypes';

interface ZScoreFoundationTileProps {
  className?: string;
}

export const ZScoreFoundationTile: React.FC<ZScoreFoundationTileProps> = ({ 
  className 
}) => {
  const { tileData, loading, error } = useZScoreData({ 
    autoRefresh: true,
    refreshInterval: 15000,
    includeDistribution: true 
  });

  // Terminal-compliant status mapping
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'extreme_positive':
      case 'positive':
        return <TrendingUp className="h-3 w-3 text-btc" />;
      case 'extreme_negative':
      case 'negative':
        return <TrendingDown className="h-3 w-3 text-btc-orange" />;
      case 'neutral':
        return <Activity className="h-3 w-3 text-btc-muted" />;
      default:
        return <AlertTriangle className="h-3 w-3 text-btc-gold" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'extreme_positive':
      case 'positive':
        return 'text-btc';
      case 'extreme_negative':
      case 'negative':
        return 'text-btc-orange';
      case 'neutral':
        return 'text-btc-muted';
      default:
        return 'text-btc-gold';
    }
  };

  const getRegimeColor = (regime: MarketRegime): string => {
    switch (regime) {
      case 'SUMMER':
        return 'text-btc';
      case 'SPRING':
        return 'text-btc-light';
      case 'WINTER':
        return 'text-btc-muted';
      case 'AUTUMN':
        return 'text-btc-orange';
      default:
        return 'text-btc-muted';
    }
  };

  const getRegimeEmoji = (regime: MarketRegime): string => {
    switch (regime) {
      case 'SUMMER':
        return '☀️';
      case 'SPRING':
        return '🌱';
      case 'WINTER':
        return '❄️';
      case 'AUTUMN':
        return '🍂';
      default:
        return '🔄';
    }
  };

  if (loading || !tileData) {
    return (
      <StaticTileWrapper>
        <div className="glass-tile p-6">
          <div className="text-xs text-btc-muted font-mono mb-4">
            ENHANCED Z-SCORE ENGINE
          </div>
          <div className="space-y-4">
            <div className="h-16 bg-btc-muted/10 rounded animate-pulse" />
            <div className="h-20 bg-btc-muted/10 rounded animate-pulse" />
          </div>
        </div>
      </StaticTileWrapper>
    );
  }

  if (error) {
    return (
      <StaticTileWrapper>
        <div className="glass-tile p-6">
          <div className="text-xs text-btc-muted font-mono mb-4">
            ENHANCED Z-SCORE ENGINE
          </div>
          <div className="flex items-center justify-center h-32 text-btc-orange">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <span className="text-sm">Engine Offline</span>
          </div>
        </div>
      </StaticTileWrapper>
    );
  }

  return (
    <StaticTileWrapper>
      <div className="glass-tile p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-btc-muted font-mono">
            ENHANCED Z-SCORE ENGINE
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <div className="w-2 h-2 bg-btc-glow rounded-full animate-pulse" />
            <span className="text-btc-glow">LIVE</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Primary Metric Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(tileData.primaryMetric.status)}
              <span className="text-xs text-btc-muted font-mono">
                COMPOSITE
              </span>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-mono font-bold ${getStatusColor(tileData.primaryMetric.status)}`}>
                {tileData.primaryMetric.formatted}
              </div>
            </div>
          </div>

          {/* Z-Score Distribution Histogram */}
          <div className="bg-btc-dark/30 rounded p-3">
            <div className="text-xs text-btc-muted mb-2 font-mono">
              DISTRIBUTION
            </div>
            <ZScoreHistogram
              bins={tileData.histogram.bins}
              currentValue={tileData.histogram.currentValue}
              extremeThreshold={tileData.histogram.extremeThreshold}
              height={60}
            />
          </div>

          {/* Market Regime & Confidence */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-btc-muted font-mono mb-1">
                REGIME
              </div>
              <div className={`text-sm font-mono ${getRegimeColor(tileData.regime.current)}`}>
                {getRegimeEmoji(tileData.regime.current)} {tileData.regime.current}
              </div>
            </div>
            <div>
              <div className="text-xs text-btc-muted font-mono mb-1">
                CONFIDENCE
              </div>
              <div className="text-sm font-mono text-btc">
                {(tileData.confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Last Update */}
          <div className="flex justify-between items-center text-xs text-btc-muted font-mono">
            <span>LAST UPDATE</span>
            <span>{tileData.lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </StaticTileWrapper>
  );
};