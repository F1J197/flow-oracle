import React from 'react';
import { EngineOutput } from '@/engines/BaseEngine';
import { TERMINAL_THEME } from '@/config/theme';

interface Props {
  data: EngineOutput;
  importance: number;
}

export const TestEngineTile: React.FC<Props> = ({ data, importance }) => {
  const primaryValue = data.primaryMetric.value;
  const signal = data.signal;
  const confidence = data.subMetrics?.confidence || 75;
  
  // Test engine specific metrics
  const metrics = [
    { label: 'ALPHA', value: 0.15, unit: '%' },
    { label: 'BETA', value: 1.23, unit: '' },
    { label: 'SHARPE', value: 1.45, unit: '' },
    { label: 'SORTINO', value: 1.78, unit: '' },
    { label: 'CALMAR', value: 0.89, unit: '' },
    { label: 'MAXDD', value: -0.12, unit: '%' }
  ];
  
  const getMetricColor = (value: number) => {
    if (value > 0) return TERMINAL_THEME.colors.semantic.positive;
    if (value < 0) return TERMINAL_THEME.colors.semantic.negative;
    return TERMINAL_THEME.colors.text.primary;
  };
  
  const getSignalColor = () => {
    if (signal === 'RISK_ON') return TERMINAL_THEME.colors.semantic.positive;
    if (signal === 'RISK_OFF') return TERMINAL_THEME.colors.semantic.negative;
    if (signal === 'WARNING') return TERMINAL_THEME.colors.semantic.warning;
    return TERMINAL_THEME.colors.text.secondary;
  };
  
  const getBorderStyle = () => {
    if (importance > 85) return `2px dotted ${TERMINAL_THEME.colors.headers.primary}`;
    if (importance > 60) return `1px dotted ${TERMINAL_THEME.colors.headers.primary}`;
    return `1px dotted ${TERMINAL_THEME.colors.border.default}`;
  };
  
  const generateStatusBar = (value: number) => {
    const normalized = Math.max(0, Math.min(100, (value + 1) * 50)); // Convert -1 to 1 range to 0-100
    const bars = Math.floor(normalized / 10);
    const char = value > 0.5 ? '█' : value < -0.5 ? '▓' : '▒';
    return char.repeat(bars) + '░'.repeat(10 - bars);
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
        TEST-ENGINE │ {signal}
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
          color: getMetricColor(primaryValue)
        }}>
          {primaryValue >= 0 ? '+' : ''}{primaryValue.toFixed(3)}
        </div>
        <div style={{
          fontSize: '7px',
          color: getSignalColor(),
          fontWeight: TERMINAL_THEME.typography.weights.bold
        }}>
          {signal}
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '2px',
        fontSize: '7px',
        marginBottom: '4px'
      }}>
        {metrics.map((metric, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>
              {metric.label}
            </div>
            <div style={{
              color: getMetricColor(metric.value),
              fontWeight: TERMINAL_THEME.typography.weights.semibold
            }}>
              {metric.value >= 0 ? '+' : ''}{metric.value.toFixed(2)}{metric.unit}
            </div>
          </div>
        ))}
      </div>
      
      {/* Status Bar */}
      <div style={{
        borderTop: `1px solid ${TERMINAL_THEME.colors.border.default}`,
        paddingTop: '2px',
        marginBottom: '4px'
      }}>
        <div style={{
          fontSize: '6px',
          color: TERMINAL_THEME.colors.text.secondary,
          marginBottom: '2px'
        }}>
          STATUS: {primaryValue.toFixed(3)} │ CONF: {confidence}%
        </div>
        <div style={{
          fontSize: '8px',
          color: getMetricColor(primaryValue),
          fontFamily: 'monospace',
          letterSpacing: '0.5px'
        }}>
          {generateStatusBar(primaryValue)}
        </div>
      </div>
      
      {/* Bottom Analysis */}
      <div style={{
        fontSize: '6px',
        color: TERMINAL_THEME.colors.text.primary,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        marginTop: 'auto',
        borderTop: `1px solid ${TERMINAL_THEME.colors.border.default}`,
        paddingTop: '2px'
      }}>
        {data.analysis || 'System operational - monitoring active'}
      </div>
      
      {/* Timestamp */}
      <div style={{
        fontSize: '6px',
        color: TERMINAL_THEME.colors.text.secondary,
        textAlign: 'center',
        marginTop: '2px'
      }}>
        {new Date().toLocaleTimeString('en-US', { hour12: false })} EDT
      </div>
    </div>
  );
};