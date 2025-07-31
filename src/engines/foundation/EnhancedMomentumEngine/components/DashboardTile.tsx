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
    if (regime.includes('EXPLOSIVE')) return '#FFD700';
    if (regime.includes('BULLISH')) return '#32CD32';
    if (regime.includes('BEARISH')) return '#FF4500';
    if (regime === 'CHAOTIC') return '#FFD700';
    return '#EAEAEA';
  };
  
  const getArrow = () => {
    if (acceleration > 2) return '↑↑';
    if (acceleration > 0) return '↑';
    if (acceleration < -2) return '↓↓';
    if (acceleration < 0) return '↓';
    return '→';
  };
  
  const getBorderColor = () => {
    if (importance > 85) return '#FF4500';
    if (importance > 60) return '#00BFFF';
    return 'rgba(255, 255, 255, 0.1)';
  };
  
  return (
    <div style={{
      border: `1px solid ${getBorderColor()}`,
      padding: '16px',
      height: '200px',
      backgroundColor: '#1A1A1A',
      fontFamily: 'monospace',
      color: '#EAEAEA'
    }}>
      {/* Header */}
      <div style={{
        color: '#00BFFF',
        fontSize: '0.875rem',
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
          fontWeight: 'bold'
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
      
      {/* Regime Label */}
      <div style={{
        fontSize: '0.875rem',
        color: getRegimeColor(),
        marginBottom: '4px',
        fontWeight: 'bold'
      }}>
        {regime.replace(/_/g, ' ')}
      </div>
      
      {/* Sub Metrics */}
      <div style={{
        fontSize: '0.75rem',
        color: '#999999'
      }}>
        <div>VEL: {velocity.toFixed(1)}% | ACC: {acceleration.toFixed(1)}%</div>
        <div>
          {data.subMetrics?.bullishIndicators || 0}↑ / {data.subMetrics?.bearishIndicators || 0}↓
        </div>
      </div>
      
      {/* Analysis (truncated) */}
      <div style={{
        fontSize: '0.75rem',
        color: '#EAEAEA',
        marginTop: '8px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
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