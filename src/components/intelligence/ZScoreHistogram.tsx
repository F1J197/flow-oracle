import React from 'react';
import { HistogramBin } from '@/types/zscoreTypes';

interface ZScoreHistogramProps {
  bins: HistogramBin[];
  currentValue: number;
  extremeThreshold: number;
  height?: number;
  className?: string;
}

export const ZScoreHistogram: React.FC<ZScoreHistogramProps> = ({
  bins,
  currentValue,
  extremeThreshold,
  height = 60,
  className = ''
}) => {
  if (!bins.length) {
    return (
      <div className={`flex items-center justify-center h-${height} ${className}`}>
        <span className="text-text-secondary text-sm">No histogram data available</span>
      </div>
    );
  }

  const maxPercentage = Math.max(...bins.map(bin => bin.percentage));
  
  const getBarColor = (bin: HistogramBin): string => {
    const baseClasses = 'transition-all duration-200 hover:opacity-80';
    
    if (bin.isHighlighted) {
      return `bg-btc-glow ${baseClasses} shadow-glow`;
    }
    
    switch (bin.color) {
      case 'btc':
        return `bg-btc ${baseClasses}`;
      case 'btc-light':
        return `bg-btc-light ${baseClasses}`;
      case 'btc-glow':
        return `bg-btc-glow ${baseClasses}`;
      case 'btc-muted':
        return `bg-btc-muted ${baseClasses}`;
      default:
        return `bg-glass-bg ${baseClasses}`;
    }
  };

  const getBarHeight = (percentage: number): number => {
    return Math.max((percentage / maxPercentage) * height, 2);
  };

  const isExtremeRange = (range: [number, number]): boolean => {
    return Math.abs(range[0]) > extremeThreshold || Math.abs(range[1]) > extremeThreshold;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Histogram bars */}
      <div 
        className="flex items-end justify-between gap-0.5"
        style={{ height: `${height}px` }}
      >
        {bins.map((bin, index) => {
          const barHeight = getBarHeight(bin.percentage);
          const isExtreme = isExtremeRange(bin.range);
          
          return (
            <div
              key={index}
              className="relative flex-1 group"
              style={{ height: `${height}px` }}
            >
              {/* Bar */}
              <div
                className={`
                  w-full relative
                  ${getBarColor(bin)}
                  ${isExtreme ? 'ring-1 ring-neon-orange/50' : ''}
                `}
                style={{ 
                  height: `${barHeight}px`,
                  marginTop: `${height - barHeight}px`
                }}
              >
                {/* Current value indicator */}
                {bin.isHighlighted && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-neon-lime rounded-full animate-pulse shadow-glow" />
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <span className="text-xs font-medium text-neon-lime bg-bg-secondary px-1 rounded">
                        {currentValue.toFixed(2)}σ
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <div className="bg-bg-secondary border border-glass-border rounded px-2 py-1 text-xs whitespace-nowrap shadow-elegant">
                  <div className="text-text-primary font-medium">
                    {bin.range[0].toFixed(1)} to {bin.range[1].toFixed(1)}σ
                  </div>
                  <div className="text-text-secondary">
                    {bin.count} values ({bin.percentage.toFixed(1)}%)
                  </div>
                  {isExtreme && (
                    <div className="text-neon-orange text-xs">
                      Extreme Range
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Extreme thresholds */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Negative extreme line */}
        <div 
          className="absolute h-full border-l border-neon-orange/50 border-dashed"
          style={{ 
            left: `${((extremeThreshold + 4) / 14) * 100}%` // Scale from -4 to +10 range
          }}
        >
          <span className="absolute -top-4 -left-3 text-xs text-neon-orange">
            -{extremeThreshold}σ
          </span>
        </div>
        
        {/* Positive extreme line */}
        <div 
          className="absolute h-full border-l border-neon-orange/50 border-dashed"
          style={{ 
            left: `${((extremeThreshold + 4) / 14) * 100}%` // Scale from -4 to +10 range
          }}
        >
          <span className="absolute -top-4 -left-2 text-xs text-neon-orange">
            +{extremeThreshold}σ
          </span>
        </div>
      </div>
      
      {/* Zero line */}
      <div 
        className="absolute h-full border-l border-text-secondary/30"
        style={{ left: '28.5%' }} // (4/14) * 100% for zero on -4 to +10 scale
      >
        <span className="absolute -top-4 -left-1 text-xs text-text-secondary">
          0σ
        </span>
      </div>
    </div>
  );
};