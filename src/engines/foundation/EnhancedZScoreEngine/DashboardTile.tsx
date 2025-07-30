import React from 'react';
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
import { TerminalTile } from '@/components/terminal/TerminalTile';
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
        return <TrendingUp className="h-3 w-3 text-neon-lime" />;
      case 'extreme_negative':
      case 'negative':
        return <TrendingDown className="h-3 w-3 text-neon-orange" />;
      case 'neutral':
        return <Activity className="h-3 w-3 text-text-muted" />;
      default:
        return <AlertTriangle className="h-3 w-3 text-neon-gold" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'extreme_positive':
      case 'positive':
        return 'text-neon-lime';
      case 'extreme_negative':
      case 'negative':
        return 'text-neon-orange';
      case 'neutral':
        return 'text-text-muted';
      default:
        return 'text-neon-gold';
    }
  };

  const getRegimeColor = (regime: MarketRegime): string => {
    switch (regime) {
      case 'SUMMER':
        return 'text-neon-lime';
      case 'SPRING':
        return 'text-neon-teal';
      case 'WINTER':
        return 'text-text-muted';
      case 'AUTUMN':
        return 'text-neon-orange';
      default:
        return 'text-text-muted';
    }
  };

  const getRegimeSymbol = (regime: MarketRegime): string => {
    switch (regime) {
      case 'SUMMER':
        return '█';
      case 'SPRING':
        return '▲';
      case 'WINTER':
        return '○';
      case 'AUTUMN':
        return '▼';
      default:
        return '~';
    }
  };

  if (loading || !tileData) {
    return (
      <div className="space-y-4">
        <div className="h-16 bg-glass-bg animate-pulse" />
        <div className="h-20 bg-glass-bg animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32 text-neon-orange">
        <AlertTriangle className="h-6 w-6 mr-2" />
        <span className="text-sm font-mono">ENGINE OFFLINE</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Primary Metric Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon(tileData.primaryMetric.status)}
          <span className="terminal-label">
            COMPOSITE
          </span>
        </div>
        <div className="text-right">
          <div className={`terminal-data text-2xl ${getStatusColor(tileData.primaryMetric.status)}`}>
            {tileData.primaryMetric.formatted}
          </div>
        </div>
      </div>

      {/* Z-Score Distribution Histogram */}
      <div className="bg-glass-bg border border-glass-border p-3">
        <div className="terminal-label mb-2">
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
          <div className="terminal-label mb-1">
            REGIME
          </div>
          <div className={`terminal-data ${getRegimeColor(tileData.regime.current)}`}>
            {getRegimeSymbol(tileData.regime.current)} {tileData.regime.current}
          </div>
        </div>
        <div>
          <div className="terminal-label mb-1">
            CONFIDENCE
          </div>
          <div className="terminal-data text-neon-teal">
            {(tileData.confidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Last Update */}
      <div className="flex justify-between items-center terminal-label">
        <span>LAST UPDATE</span>
        <span>{tileData.lastUpdate.toLocaleTimeString()}</span>
      </div>
    </div>
  );
};