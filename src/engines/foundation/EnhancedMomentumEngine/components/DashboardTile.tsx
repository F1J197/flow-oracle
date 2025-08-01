import React from 'react';
import { EngineOutput } from '@/engines/BaseEngine';
import { TERMINAL_THEME } from '@/config/theme';

interface Props {
  data: EngineOutput;
  importance: number;
}

export const EnhancedMomentumTile: React.FC<Props> = ({ data, importance }) => {
  const compositeScore = data.primaryMetric.value;
  const velocity = data.subMetrics?.velocity || 0;
  const acceleration = data.subMetrics?.acceleration || 0;
  const regime = data.subMetrics?.regime || 'NEUTRAL';
  const confidence = data.subMetrics?.confidence || 85;
  
  // Momentum indicators simulation (would come from real data)
  const indicators = [
    { name: 'RSI_14', value: 67.3, percentile: 78 },
    { name: 'MACD', value: 0.45, percentile: 82 },
    { name: 'STOCH_K', value: 74.2, percentile: 76 },
    { name: 'CCI', value: 112.5, percentile: 84 },
    { name: 'ROC_20', value: 8.7, percentile: 89 },
    { name: 'ADX', value: 34.8, percentile: 71 }
  ];
  
  const getMetricColor = (value: number) => {
    if (value > 0.5) return TERMINAL_THEME.colors.semantic.positive;
    if (value < -0.5) return TERMINAL_THEME.colors.semantic.negative;
    return TERMINAL_THEME.colors.text.primary;
  };
  
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
  
  const getBorderStyle = () => {
    if (importance > 85) return `2px dotted ${TERMINAL_THEME.colors.headers.primary}`;
    if (importance > 60) return `1px dotted ${TERMINAL_THEME.colors.headers.primary}`;
    return `1px dotted ${TERMINAL_THEME.colors.border.default}`;
  };
  
  const generateConfidenceBar = (confidence: number) => {
    const bars = Math.floor(confidence / 10);
    return '█'.repeat(bars) + '░'.repeat(10 - bars);
  };
  
  return (
    <div style={{
      border: getBorderStyle(),
      height: '180px',
      backgroundColor: TERMINAL_THEME.colors.background.primary,
      fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
      padding: '6px',
      display: 'flex',
      flexDirection: 'column',
      fontSize: '9px',
      lineHeight: '1.1'
    }}>
      {/* Header */}
      <div style={{
        color: TERMINAL_THEME.colors.headers.primary,
        fontSize: '8px',
        fontWeight: TERMINAL_THEME.typography.weights.bold,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: `1px solid ${TERMINAL_THEME.colors.border.default}`,
        paddingBottom: '2px',
        marginBottom: '4px'
      }}>
        ENH-MOMENTUM │ {regime}
      </div>
      
      {/* Primary Score */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: TERMINAL_THEME.typography.weights.bold,
          color: getMetricColor(compositeScore)
        }}>
          {compositeScore >= 0 ? '+' : ''}{compositeScore.toFixed(2)}σ
        </div>
        <div style={{
          fontSize: '7px',
          color: getSignalColor(),
          fontWeight: TERMINAL_THEME.typography.weights.bold
        }}>
          {getSignal()}
        </div>
      </div>
      
      {/* Momentum Indicators Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '2px',
        fontSize: '7px',
        marginBottom: '4px'
      }}>
        {indicators.slice(0, 6).map((indicator, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>
              {indicator.name}
            </div>
            <div style={{
              color: indicator.percentile > 70 
                ? TERMINAL_THEME.colors.semantic.positive 
                : indicator.percentile < 30 
                ? TERMINAL_THEME.colors.semantic.negative 
                : TERMINAL_THEME.colors.text.primary,
              fontWeight: TERMINAL_THEME.typography.weights.semibold
            }}>
              {indicator.value.toFixed(1)}
            </div>
            <div style={{ 
              color: TERMINAL_THEME.colors.text.secondary,
              fontSize: '6px'
            }}>
              {indicator.percentile}%
            </div>
          </div>
        ))}
      </div>
      
      {/* Velocity/Acceleration */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '8px',
        marginBottom: '4px',
        borderTop: `1px solid ${TERMINAL_THEME.colors.border.default}`,
        paddingTop: '2px'
      }}>
        <div>
          <span style={{ color: TERMINAL_THEME.colors.text.secondary }}>VEL:</span>
          <span style={{ 
            color: velocity > 0 ? TERMINAL_THEME.colors.semantic.positive : TERMINAL_THEME.colors.semantic.negative,
            marginLeft: '3px'
          }}>
            {velocity >= 0 ? '+' : ''}{velocity.toFixed(1)}%
          </span>
        </div>
        <div>
          <span style={{ color: TERMINAL_THEME.colors.text.secondary }}>ACC:</span>
          <span style={{ 
            color: acceleration > 0 ? TERMINAL_THEME.colors.semantic.positive : TERMINAL_THEME.colors.semantic.negative,
            marginLeft: '3px'
          }}>
            {acceleration >= 0 ? '+' : ''}{acceleration.toFixed(1)}%
          </span>
        </div>
      </div>
      
      {/* Confidence Bar */}
      <div style={{
        fontSize: '6px',
        color: TERMINAL_THEME.colors.text.secondary,
        marginBottom: '2px'
      }}>
        CONF: {confidence}%
      </div>
      <div style={{
        fontSize: '8px',
        color: TERMINAL_THEME.colors.headers.primary,
        fontFamily: 'monospace',
        letterSpacing: '0.5px'
      }}>
        {generateConfidenceBar(confidence)}
      </div>
      
      {/* Bottom Status */}
      <div style={{
        fontSize: '6px',
        color: TERMINAL_THEME.colors.text.secondary,
        textAlign: 'center',
        marginTop: 'auto',
        borderTop: `1px solid ${TERMINAL_THEME.colors.border.default}`,
        paddingTop: '2px'
      }}>
        {new Date().toLocaleTimeString('en-US', { hour12: false })} EDT
      </div>
    </div>
  );
};