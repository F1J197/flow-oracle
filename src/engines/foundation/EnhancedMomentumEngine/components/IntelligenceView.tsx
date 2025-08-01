import React from 'react';
import { EngineOutput } from '@/engines/BaseEngine';
import { TERMINAL_THEME } from '@/config/terminal.theme';

interface Props {
  data: EngineOutput;
  historicalData?: any[];
}

export const EnhancedMomentumIntelligenceView: React.FC<Props> = ({ data }) => {
  const compositeScore = data.primaryMetric.value;
  const confidence = data.subMetrics?.confidence || 85;
  
  const getSignalColor = (signal: string) => {
    if (signal === 'BULLISH') return TERMINAL_THEME.colors.semantic.positive;
    if (signal === 'BEARISH') return TERMINAL_THEME.colors.semantic.negative;
    return TERMINAL_THEME.colors.text.secondary;
  };
  
  const getSignal = () => {
    if (compositeScore > 1) return 'BULLISH';
    if (compositeScore < -1) return 'BEARISH';
    return 'NEUTRAL';
  };
  
  return (
    <div style={{
      backgroundColor: TERMINAL_THEME.colors.background.primary,
      color: TERMINAL_THEME.colors.text.primary,
      fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
      minHeight: '100vh',
      padding: '0',
      fontSize: '9px'
    }}>
      {/* Terminal Header */}
      <div style={{
        backgroundColor: TERMINAL_THEME.colors.background.secondary,
        color: TERMINAL_THEME.colors.headers.primary,
        fontSize: '12px',
        fontWeight: TERMINAL_THEME.typography.weights.bold,
        padding: '6px 12px',
        borderBottom: `2px solid ${TERMINAL_THEME.colors.headers.primary}`,
        letterSpacing: '1px'
      }}>
        ENHANCED MOMENTUM ENGINE │ INTELLIGENCE ANALYSIS │ {new Date().toLocaleTimeString('en-US', { hour12: false })} EDT
      </div>
      
      {/* Main Content */}
      <div style={{
        padding: '12px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
        height: 'calc(100vh - 48px)'
      }}>
        {/* Left Panel */}
        <div style={{
          border: `1px dotted ${TERMINAL_THEME.colors.border.default}`,
          padding: '8px',
          backgroundColor: TERMINAL_THEME.colors.background.primary
        }}>
          <div style={{
            color: TERMINAL_THEME.colors.headers.primary,
            fontSize: '10px',
            fontWeight: TERMINAL_THEME.typography.weights.bold,
            marginBottom: '8px',
            borderBottom: `1px solid ${TERMINAL_THEME.colors.border.default}`,
            paddingBottom: '3px'
          }}>
            MOMENTUM METRICS
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary, fontSize: '8px' }}>
              COMPOSITE Z-SCORE
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: TERMINAL_THEME.typography.weights.bold,
              color: compositeScore > 0 ? TERMINAL_THEME.colors.semantic.positive : TERMINAL_THEME.colors.semantic.negative
            }}>
              {compositeScore >= 0 ? '+' : ''}{compositeScore.toFixed(3)}σ
            </div>
            <div style={{
              fontSize: '7px',
              color: getSignalColor(getSignal()),
              fontWeight: TERMINAL_THEME.typography.weights.bold
            }}>
              {getSignal()} │ {confidence}% CONF
            </div>
          </div>
        </div>
        
        {/* Center Panel */}
        <div style={{
          border: `1px dotted ${TERMINAL_THEME.colors.border.default}`,
          padding: '8px',
          backgroundColor: TERMINAL_THEME.colors.background.primary
        }}>
          <div style={{
            color: TERMINAL_THEME.colors.headers.primary,
            fontSize: '10px',
            fontWeight: TERMINAL_THEME.typography.weights.bold,
            marginBottom: '8px',
            borderBottom: `1px solid ${TERMINAL_THEME.colors.border.default}`,
            paddingBottom: '3px'
          }}>
            INDICATOR MATRIX
          </div>
          
          <div style={{ fontSize: '8px', color: TERMINAL_THEME.colors.text.primary }}>
            Detailed momentum analysis across 18 indicators...
          </div>
        </div>
        
        {/* Right Panel */}
        <div style={{
          border: `1px dotted ${TERMINAL_THEME.colors.border.default}`,
          padding: '8px',
          backgroundColor: TERMINAL_THEME.colors.background.primary
        }}>
          <div style={{
            color: TERMINAL_THEME.colors.headers.primary,
            fontSize: '10px',
            fontWeight: TERMINAL_THEME.typography.weights.bold,
            marginBottom: '8px',
            borderBottom: `1px solid ${TERMINAL_THEME.colors.border.default}`,
            paddingBottom: '3px'
          }}>
            ANALYSIS & ALERTS
          </div>
          
          <div style={{
            border: `1px solid ${getSignalColor(getSignal())}`,
            padding: '6px',
            backgroundColor: TERMINAL_THEME.colors.background.secondary,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: TERMINAL_THEME.typography.weights.bold,
              color: getSignalColor(getSignal())
            }}>
              {getSignal()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};