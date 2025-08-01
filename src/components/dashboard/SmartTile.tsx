/**
 * Smart Tile Component - Dynamic Engine Display
 * Adapts styling based on importance and signal strength
 */

import React from 'react';
import { EngineOutput } from '@/engines/BaseEngine';
import { ENGINE_REGISTRY } from '@/config/engine.registry';

interface SmartTileProps {
  engineId: string;
  data: EngineOutput;
  importance: number;
  size: 'small' | 'medium' | 'large';
}

export const SmartTile: React.FC<SmartTileProps> = ({
  engineId,
  data,
  importance,
  size
}) => {
  const config = ENGINE_REGISTRY[engineId];
  if (!config) return null;

  const getBorderStyle = () => {
    if (importance > 85) return 'border-neon-orange shadow-glow';
    if (importance > 65) return 'border-neon-amber';
    return 'border-border';
  };

  const getSignalColor = () => {
    switch (data.signal) {
      case 'RISK_ON':
        return 'hsl(var(--neon-lime))';
      case 'RISK_OFF':
        return 'hsl(var(--neon-orange))';
      case 'WARNING':
        return 'hsl(var(--neon-gold))';
      default:
        return 'hsl(var(--text-primary))';
    }
  };

  const getMetricColor = (value: number) => {
    if (value > 0) return 'hsl(var(--neon-lime))';
    if (value < 0) return 'hsl(var(--neon-orange))';
    return 'hsl(var(--text-primary))';
  };

  const formatValue = (value: number, decimals = 1) => {
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(decimals);
  };

  const getConfidenceBar = () => {
    const confidence = data.confidence;
    const width = `${confidence}%`;
    let color = 'hsl(var(--neon-lime))';
    
    if (confidence < 50) color = 'hsl(var(--neon-orange))';
    else if (confidence < 75) color = 'hsl(var(--neon-amber))';
    
    return (
      <div className="w-full h-1 bg-secondary rounded-none overflow-hidden">
        <div 
          className="h-full transition-all duration-300"
          style={{ width, backgroundColor: color }}
        />
      </div>
    );
  };

  return (
    <div className={`h-full bg-card border ${getBorderStyle()} p-3 font-mono transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-bold uppercase tracking-wider text-primary">
          {config.name}
        </div>
        <div 
          className="text-xs font-bold px-2 py-1 border"
          style={{ 
            color: getSignalColor(),
            borderColor: getSignalColor()
          }}
        >
          {data.signal}
        </div>
      </div>

      {/* Primary Metric */}
      <div className="mb-3">
        <div 
          className={`${size === 'large' ? 'text-2xl' : size === 'medium' ? 'text-xl' : 'text-lg'} font-bold`}
          style={{ color: getMetricColor(data.primaryMetric.value) }}
        >
          {formatValue(data.primaryMetric.value)}
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span 
            style={{ color: getMetricColor(data.primaryMetric.change24h) }}
          >
            {data.primaryMetric.change24h > 0 ? '+' : ''}{formatValue(data.primaryMetric.change24h)}
          </span>
          <span 
            style={{ color: getMetricColor(data.primaryMetric.changePercent) }}
          >
            ({data.primaryMetric.changePercent > 0 ? '+' : ''}{data.primaryMetric.changePercent.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Sub Metrics Grid */}
      {size !== 'small' && (
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          {Object.entries(data.subMetrics).slice(0, 4).map(([key, value]) => (
            <div key={key}>
              <div className="text-secondary uppercase tracking-wider">
                {key.replace(/_/g, ' ')}
              </div>
              <div className="text-data font-semibold">
                {typeof value === 'number' ? formatValue(value) : String(value)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confidence Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-secondary">CONFIDENCE</span>
          <span className="text-data font-semibold">{Math.round(data.confidence)}%</span>
        </div>
        {getConfidenceBar()}
      </div>

      {/* Analysis (for larger tiles) */}
      {size === 'large' && (
        <div className="text-xs text-secondary leading-relaxed">
          {data.analysis.slice(0, 120)}...
        </div>
      )}

      {/* Importance indicator */}
      <div className="absolute top-2 right-2">
        <div 
          className="w-2 h-2 rounded-full"
          style={{ 
            backgroundColor: importance > 85 ? 'hsl(var(--neon-orange))' : 
                            importance > 65 ? 'hsl(var(--neon-amber))' : 
                            'hsl(var(--text-secondary))'
          }}
        />
      </div>
    </div>
  );
};

export default SmartTile;