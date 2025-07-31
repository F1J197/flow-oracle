import React from 'react';
import { EngineOutput } from '@/engines/BaseEngine';
import { TERMINAL_THEME } from '@/config/terminal.theme';

interface Props {
  data: EngineOutput;
  importance: number;
}

export const EnhancedMomentumTile: React.FC<Props> = ({ data, importance }) => {
  const regime = data.subMetrics?.regime || 'NEUTRAL';
  const velocity = data.subMetrics?.velocity || 0;
  const acceleration = data.subMetrics?.acceleration || 0;
  
  const getRegimeColor = () => {
    if (regime.includes('EXPLOSIVE')) return TERMINAL_THEME.colors.semantic.warning;
    if (regime.includes('BULLISH')) return TERMINAL_THEME.colors.semantic.positive;
    if (regime.includes('BEARISH')) return TERMINAL_THEME.colors.semantic.negative;
    if (regime === 'CHAOTIC') return TERMINAL_THEME.colors.semantic.warning;
    return TERMINAL_THEME.colors.text.primary;
  };
  
  const getArrow = () => {
    if (acceleration > 2) return '↑↑';
    if (acceleration > 0) return '↑';
    if (acceleration < -2) return '↓↓';
    if (acceleration < 0) return '↓';
    return '→';
  };
  
  const getBorderColor = () => {
    if (importance > 85) return TERMINAL_THEME.colors.semantic.negative;
    if (importance > 60) return TERMINAL_THEME.colors.neon.teal;
    return TERMINAL_THEME.colors.border.default;
  };
  
  // Create velocity visualization
  const velocityBars = Array.from({ length: 10 }, (_, i) => {
    const threshold = (i + 1) * 10;
    const absVelocity = Math.abs(velocity);
    const isActive = absVelocity >= threshold;
    const color = velocity > 0 
      ? TERMINAL_THEME.colors.semantic.positive 
      : TERMINAL_THEME.colors.semantic.negative;
    
    return (
      <div
        key={i}
        style={{
          width: '8px',
          height: '20px',
          backgroundColor: isActive ? color : TERMINAL_THEME.colors.border.default,
          marginRight: '2px',
          display: 'inline-block'
        }}
      />
    );
  });
  
  return (
    <div style={{
      border: `1px solid ${getBorderColor()}`,
      padding: TERMINAL_THEME.layout.spacing.md,
      height: '200px',
      backgroundColor: TERMINAL_THEME.colors.background.secondary,
      fontFamily: TERMINAL_THEME.fonts.primary
    }}>
      {/* Header */}
      <div style={{
        color: TERMINAL_THEME.colors.neon.teal,
        fontSize: TERMINAL_THEME.typography.scale.sm,
        marginBottom: TERMINAL_THEME.layout.spacing.sm,
        textTransform: 'uppercase'
      }}>
        Momentum Analysis
      </div>
      
      {/* Primary Metric with Arrow */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: TERMINAL_THEME.layout.spacing.sm
      }}>
        <div style={{
          fontSize: TERMINAL_THEME.typography.scale.xl,
          color: getRegimeColor(),
          fontWeight: TERMINAL_THEME.fonts.weights.bold
        }}>
          {data.primaryMetric.value.toFixed(1)}
        </div>
        <div style={{
          fontSize: TERMINAL_THEME.typography.scale.lg,
          color: getRegimeColor(),
          marginLeft: TERMINAL_THEME.layout.spacing.sm
        }}>
          {getArrow()}
        </div>
      </div>
      
      {/* Velocity Visualization */}
      <div style={{ marginBottom: TERMINAL_THEME.layout.spacing.sm }}>
        {velocityBars}
      </div>
      
      {/* Regime Label */}
      <div style={{
        fontSize: TERMINAL_THEME.typography.scale.sm,
        color: getRegimeColor(),
        marginBottom: TERMINAL_THEME.layout.spacing.xs,
        fontWeight: TERMINAL_THEME.fonts.weights.bold
      }}>
        {regime.replace(/_/g, ' ')}
      </div>
      
      {/* Sub Metrics */}
      <div style={{
        fontSize: TERMINAL_THEME.typography.scale.xs,
        color: TERMINAL_THEME.colors.text.secondary
      }}>
        <div>VEL: {velocity.toFixed(1)}% | ACC: {acceleration.toFixed(1)}%</div>
        <div>
          {data.subMetrics?.bullishIndicators || 0}↑ / {data.subMetrics?.bearishIndicators || 0}↓
        </div>
      </div>
      
      {/* Analysis (truncated) */}
      <div style={{
        fontSize: TERMINAL_THEME.typography.scale.xs,
        color: TERMINAL_THEME.colors.text.primary,
        marginTop: TERMINAL_THEME.layout.spacing.sm,
        borderTop: `1px solid ${TERMINAL_THEME.colors.border.default}`,
        paddingTop: TERMINAL_THEME.layout.spacing.sm,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {data.analysis}
      </div>
    </div>
  );
};