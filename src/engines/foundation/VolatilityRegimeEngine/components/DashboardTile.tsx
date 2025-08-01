import React from 'react';
import { TERMINAL_THEME } from '@/config/terminal.theme';
import { EngineOutput } from '@/engines/BaseEngine';

interface VolatilityRegimeTileProps {
  data: EngineOutput;
  importance: number;
}

export const VolatilityRegimeTile: React.FC<VolatilityRegimeTileProps> = ({ data, importance }) => {
  const getBorderColor = () => {
    if (importance > 85) return TERMINAL_THEME.colors.border.critical;
    if (importance > 60) return TERMINAL_THEME.colors.border.important;
    return TERMINAL_THEME.colors.border.default;
  };

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'LOW_VOL': return TERMINAL_THEME.colors.semantic.positive;
      case 'NORMAL': return TERMINAL_THEME.colors.text.primary;
      case 'ELEVATED': return TERMINAL_THEME.colors.semantic.warning;
      case 'STRESSED': return TERMINAL_THEME.colors.semantic.negative;
      case 'CRISIS': return TERMINAL_THEME.colors.border.critical;
      default: return TERMINAL_THEME.colors.text.secondary;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'RISK_ON': return TERMINAL_THEME.colors.semantic.positive;
      case 'RISK_OFF': return TERMINAL_THEME.colors.semantic.negative;
      case 'WARNING': return TERMINAL_THEME.colors.semantic.warning;
      default: return TERMINAL_THEME.colors.text.primary;
    }
  };

  const formatNumber = (value: number, decimals = 1) => {
    return value.toFixed(decimals);
  };

  const regime = data.subMetrics?.regime || 'UNKNOWN';
  const vix9d = data.subMetrics?.vix9d || 0;
  const vvix = data.subMetrics?.vvix || 0;
  const regimeStrength = data.subMetrics?.regimeStrength || 0;
  const termStructure = data.subMetrics?.termStructure || 0;

  return (
    <div style={{
      height: '180px',
      padding: '8px',
      border: `1px solid ${getBorderColor()}`,
      backgroundColor: TERMINAL_THEME.colors.background.secondary,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: TERMINAL_THEME.typography.fontFamily.mono
    }}>
      {/* Engine Header */}
      <div style={{
        color: TERMINAL_THEME.colors.headers.primary,
        fontSize: TERMINAL_THEME.typography.sizes.tiny,
        fontWeight: TERMINAL_THEME.typography.weights.bold,
        textTransform: 'uppercase',
        marginBottom: TERMINAL_THEME.spacing.xs,
        borderBottom: `1px solid ${TERMINAL_THEME.colors.border.default}`,
        paddingBottom: '2px'
      }}>
        VOLATILITY REGIME │ LIVE
      </div>

      {/* VIX Value */}
      <div style={{
        fontSize: TERMINAL_THEME.typography.sizes.xlarge,
        fontWeight: TERMINAL_THEME.typography.weights.bold,
        color: getRegimeColor(regime),
        marginBottom: '2px'
      }}>
        {formatNumber(data.primaryMetric.value)}
      </div>

      {/* VIX Label */}
      <div style={{
        fontSize: TERMINAL_THEME.typography.sizes.tiny,
        color: TERMINAL_THEME.colors.text.secondary,
        marginBottom: TERMINAL_THEME.spacing.sm
      }}>
        VIX INDEX
      </div>

      {/* Current Regime */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: TERMINAL_THEME.spacing.xs
      }}>
        <div style={{
          fontSize: TERMINAL_THEME.typography.sizes.small,
          color: getRegimeColor(regime),
          fontWeight: TERMINAL_THEME.typography.weights.semibold
        }}>
          {regime}
        </div>
        <div style={{
          fontSize: TERMINAL_THEME.typography.sizes.tiny,
          color: TERMINAL_THEME.colors.text.secondary
        }}>
          {regimeStrength}% STR
        </div>
      </div>

      {/* Sub-metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: TERMINAL_THEME.spacing.xs,
        fontSize: TERMINAL_THEME.typography.sizes.tiny,
        marginBottom: TERMINAL_THEME.spacing.sm
      }}>
        <div>
          <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>VIX9D</div>
          <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{formatNumber(vix9d)}</div>
        </div>
        <div>
          <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>VVIX</div>
          <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{formatNumber(vvix)}</div>
        </div>
        <div>
          <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>TERM</div>
          <div style={{ 
            color: termStructure > 0 ? 
              TERMINAL_THEME.colors.semantic.negative : 
              TERMINAL_THEME.colors.semantic.positive 
          }}>
            {termStructure > 0 ? '+' : ''}{formatNumber(termStructure)}
          </div>
        </div>
        <div>
          <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>CONF</div>
          <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{data.confidence}%</div>
        </div>
      </div>

      {/* Signal Indicator */}
      <div style={{
        position: 'absolute',
        bottom: TERMINAL_THEME.spacing.xs,
        right: TERMINAL_THEME.spacing.xs,
        fontSize: TERMINAL_THEME.typography.sizes.tiny,
        color: getSignalColor(data.signal),
        fontWeight: TERMINAL_THEME.typography.weights.bold,
        backgroundColor: TERMINAL_THEME.colors.background.primary,
        padding: '2px 4px',
        border: `1px solid ${getSignalColor(data.signal)}`
      }}>
        {data.signal}
      </div>

      {/* Change Indicator */}
      <div style={{
        position: 'absolute',
        top: TERMINAL_THEME.spacing.xs,
        right: TERMINAL_THEME.spacing.xs,
        fontSize: TERMINAL_THEME.typography.sizes.tiny,
        color: data.primaryMetric.changePercent >= 0 ? 
          TERMINAL_THEME.colors.semantic.positive : 
          TERMINAL_THEME.colors.semantic.negative
      }}>
        {data.primaryMetric.changePercent >= 0 ? '+' : ''}{formatNumber(data.primaryMetric.changePercent, 1)}%
      </div>
    </div>
  );
};