import React from 'react';
import { EngineOutput } from '@/engines/BaseEngine';

interface Props {
  data: EngineOutput;
  importance: number;
}

export const EnhancedMomentumTile: React.FC<Props> = ({ data, importance }) => {
  const regime = data.subMetrics?.regime || 'NEUTRAL';
  const velocity = data.subMetrics?.velocity || 0;
  const acceleration = data.subMetrics?.acceleration || 0;
  
  const getRegimeColor = () => {
    if (regime.includes('EXPLOSIVE')) return '#FFD700'; // Gold/Warning
    if (regime.includes('BULLISH')) return '#80FF00'; // Lime/Positive
    if (regime.includes('BEARISH')) return '#FF4500'; // Orange/Negative
    if (regime === 'CHAOTIC') return '#FFD700'; // Gold/Warning
    return '#FFFFFF'; // White/Primary
  };
  
  const getArrow = () => {
    if (acceleration > 2) return '↑↑';
    if (acceleration > 0) return '↑';
    if (acceleration < -2) return '↓↓';
    if (acceleration < 0) return '↓';
    return '→';
  };
  
  const getBorderColor = () => {
    if (importance > 85) return '#FF4500'; // Orange/Negative
    if (importance > 60) return '#F7931A'; // BTC Orange
    return 'hsl(180 100% 50% / 0.3)'; // Cyan border
  };
  
  // Create velocity visualization
  const velocityBars = Array.from({ length: 10 }, (_, i) => {
    const threshold = (i + 1) * 10;
    const absVelocity = Math.abs(velocity);
    const isActive = absVelocity >= threshold;
    const color = velocity > 0 ? '#80FF00' : '#FF4500'; // Lime or Orange
    
    return (
      <div
        key={i}
        style={{
          width: '8px',
          height: '20px',
          backgroundColor: isActive ? color : 'hsl(180 100% 50% / 0.3)',
          marginRight: '2px',
          display: 'inline-block'
        }}
      />
    );
  });
  
  return (
    <div style={{
      border: `1px solid ${getBorderColor()}`,
      padding: '12px',
      height: '200px',
      backgroundColor: '#050505',
      fontFamily: '"JetBrains Mono", monospace'
    }}>
      {/* Header */}
      <div style={{
        color: '#F7931A',
        fontSize: '0.75rem',
        marginBottom: '8px',
        textTransform: 'uppercase'
      }}>
        Momentum Analysis
      </div>
      
      {/* Primary Metric with Arrow */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          fontSize: '1.5rem',
          color: getRegimeColor(),
          fontWeight: 700
        }}>
          {data.primaryMetric.value.toFixed(1)}
        </div>
        <div style={{
          fontSize: '1.125rem',
          color: getRegimeColor(),
          marginLeft: '8px'
        }}>
          {getArrow()}
        </div>
      </div>
      
      {/* Velocity Visualization */}
      <div style={{ marginBottom: '8px' }}>
        {velocityBars}
      </div>
      
      {/* Regime Label */}
      <div style={{
        fontSize: '0.75rem',
        color: getRegimeColor(),
        marginBottom: '4px',
        fontWeight: 700
      }}>
        {regime.replace(/_/g, ' ')}
      </div>
      
      {/* Sub Metrics */}
      <div style={{
        fontSize: '0.625rem',
        color: '#CCCCCC'
      }}>
        <div>VEL: {velocity.toFixed(1)}% | ACC: {acceleration.toFixed(1)}%</div>
        <div>
          {data.subMetrics?.bullishIndicators || 0}↑ / {data.subMetrics?.bearishIndicators || 0}↓
        </div>
      </div>
      
      {/* Analysis (truncated) */}
      <div style={{
        fontSize: '0.625rem',
        color: '#FFFFFF',
        marginTop: '8px',
        borderTop: '1px solid hsl(180 100% 50% / 0.3)',
        paddingTop: '8px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {data.analysis}
      </div>
    </div>
  );
};