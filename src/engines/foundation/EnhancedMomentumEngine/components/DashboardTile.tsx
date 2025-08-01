import React from 'react';
import { EngineOutput } from '@/engines/BaseEngine';
import { TERMINAL_THEME } from '@/config/theme';

interface Props {
  data: EngineOutput;
  importance: number;
}

export const EnhancedMomentumTile: React.FC<Props> = ({ data, importance }) => {
  const regime = data.subMetrics?.regime || 'NEUTRAL';
  const velocity = data.subMetrics?.velocity || 0;
  const acceleration = data.subMetrics?.acceleration || 0;
  const compositeScore = data.primaryMetric.value;
  
  // Primary metric color coding
  const getPrimaryColor = () => {
    if (compositeScore > 0.5) return TERMINAL_THEME.colors.semantic.positive;
    if (compositeScore < -0.5) return TERMINAL_THEME.colors.semantic.negative;
    return TERMINAL_THEME.colors.text.primary;
  };
  
  // Signal determination
  const getSignal = () => {
    if (compositeScore > 1) return 'BULLISH';
    if (compositeScore < -1) return 'BEARISH';
    return 'NEUTRAL';
  };
  
  const getSignalColor = () => {
    const signal = getSignal();
    if (signal === 'BULLISH') return TERMINAL_THEME.colors.semantic.positive;
    if (signal === 'BEARISH') return TERMINAL_THEME.colors.semantic.negative;
    return TERMINAL_THEME.colors.text.secondary;
  };
  
  // ASCII trend chart generation
  const generateTrendChart = () => {
    const bars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    const trendData = Array.from({ length: 8 }, (_, i) => {
      // Simulate trend data based on velocity and some variation
      const baseLevel = Math.max(0, Math.min(7, 4 + velocity * 0.1 + Math.sin(i * 0.5) * 2));
      return Math.floor(baseLevel);
    });
    return trendData.map(level => bars[level]).join('');
  };
  
  const getBorderColor = () => {
    if (importance > 85) return TERMINAL_THEME.colors.semantic.negative;
    if (importance > 60) return TERMINAL_THEME.colors.headers.primary;
    return TERMINAL_THEME.colors.border.default;
  };
  
  return (
    <div style={{
      border: `1px solid ${getBorderColor()}`,
      padding: '8px',
      height: '200px',
      backgroundColor: TERMINAL_THEME.colors.background.secondary,
      fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* Header */}
      <div style={{
        color: TERMINAL_THEME.colors.headers.primary,
        fontSize: '10px',
        fontWeight: TERMINAL_THEME.typography.weights.semibold,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '6px'
      }}>
        MOMENTUM ANALYSIS
      </div>
      
      {/* Primary Metric */}
      <div style={{
        fontSize: '28px',
        fontWeight: TERMINAL_THEME.typography.weights.bold,
        color: getPrimaryColor(),
        lineHeight: '1',
        marginBottom: '8px'
      }}>
        {compositeScore >= 0 ? '+' : ''}{compositeScore.toFixed(2)}
      </div>
      
      {/* ASCII Trend Chart */}
      <div style={{
        fontSize: '14px',
        color: getPrimaryColor(),
        fontFamily: 'monospace',
        letterSpacing: '1px',
        marginBottom: '8px'
      }}>
        {generateTrendChart()}
      </div>
      
      {/* Sub-metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px',
        fontSize: '9px',
        color: TERMINAL_THEME.colors.text.secondary,
        marginBottom: '8px'
      }}>
        <div>VEL: {velocity.toFixed(1)}%</div>
        <div>ACC: {acceleration.toFixed(1)}%</div>
        <div style={{ color: getSignalColor(), fontWeight: TERMINAL_THEME.typography.weights.semibold }}>
          {getSignal()}
        </div>
        <div>{Math.abs(velocity) > 10 ? 'HIGH' : 'NORM'} VOL</div>
      </div>
      
      {/* Analysis Line */}
      <div style={{
        fontSize: '8px',
        color: TERMINAL_THEME.colors.text.primary,
        borderTop: `1px solid ${TERMINAL_THEME.colors.border.default}`,
        paddingTop: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        opacity: 0.9
      }}>
        {data.analysis}
      </div>
    </div>
  );
};