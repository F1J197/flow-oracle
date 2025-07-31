import React from 'react';
import { TERMINAL_TOKENS, hsl, hsla } from '@/config/terminal.tokens';
import { formatValue } from '@/utils/formatting';

export interface TerminalMetricProps {
  label: string;
  value: number | string;
  unit?: string;
  change?: number;
  changeType?: 'absolute' | 'percentage';
  trend?: 'up' | 'down' | 'neutral';
  status?: 'normal' | 'warning' | 'critical' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  orientation?: 'horizontal' | 'vertical';
  showBorder?: boolean;
  valueFormatter?: (value: number | string) => string;
  className?: string;
}

export const TerminalMetric: React.FC<TerminalMetricProps> = ({
  label,
  value,
  unit,
  change,
  changeType = 'percentage',
  trend = 'neutral',
  status = 'normal',
  size = 'md',
  orientation = 'vertical',
  showBorder = false,
  valueFormatter = (val) => typeof val === 'number' ? formatValue(val) : val.toString(),
  className = ''
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          labelSize: TERMINAL_TOKENS.typography.scale.xs,
          valueSize: TERMINAL_TOKENS.typography.scale.base,
          changeSize: TERMINAL_TOKENS.typography.scale.xs,
          padding: TERMINAL_TOKENS.spacing.sm,
          gap: TERMINAL_TOKENS.spacing.xs,
        };
      case 'lg':
        return {
          labelSize: TERMINAL_TOKENS.typography.scale.sm,
          valueSize: TERMINAL_TOKENS.typography.scale['2xl'],
          changeSize: TERMINAL_TOKENS.typography.scale.sm,
          padding: TERMINAL_TOKENS.spacing.lg,
          gap: TERMINAL_TOKENS.spacing.sm,
        };
      case 'xl':
        return {
          labelSize: TERMINAL_TOKENS.typography.scale.base,
          valueSize: TERMINAL_TOKENS.typography.scale['3xl'],
          changeSize: TERMINAL_TOKENS.typography.scale.base,
          padding: TERMINAL_TOKENS.spacing.xl,
          gap: TERMINAL_TOKENS.spacing.md,
        };
      default: // md
        return {
          labelSize: TERMINAL_TOKENS.typography.scale.sm,
          valueSize: TERMINAL_TOKENS.typography.scale.xl,
          changeSize: TERMINAL_TOKENS.typography.scale.sm,
          padding: TERMINAL_TOKENS.spacing.md,
          gap: TERMINAL_TOKENS.spacing.sm,
        };
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'warning':
        return hsl(TERMINAL_TOKENS.colors.semantic.warning);
      case 'critical':
        return hsl(TERMINAL_TOKENS.colors.semantic.critical);
      case 'success':
        return hsl(TERMINAL_TOKENS.colors.semantic.success);
      default:
        return hsl(TERMINAL_TOKENS.colors.text.data);
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return hsl(TERMINAL_TOKENS.colors.semantic.positive);
      case 'down':
        return hsl(TERMINAL_TOKENS.colors.semantic.negative);
      default:
        return hsl(TERMINAL_TOKENS.colors.text.muted);
    }
  };

  const getTrendSymbol = () => {
    switch (trend) {
      case 'up':
        return '▲';
      case 'down':
        return '▼';
      default:
        return '━';
    }
  };

  const formatChange = () => {
    if (change === undefined) return null;
    
    const prefix = change > 0 ? '+' : '';
    const suffix = changeType === 'percentage' ? '%' : '';
    return `${prefix}${formatValue(change)}${suffix}`;
  };

  const sizeConfig = getSizeConfig();
  const isHorizontal = orientation === 'horizontal';

  return (
    <div 
      className={`terminal-metric ${className}`}
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        alignItems: isHorizontal ? 'center' : 'flex-start',
        justifyContent: isHorizontal ? 'space-between' : 'flex-start',
        gap: sizeConfig.gap,
        padding: sizeConfig.padding,
        background: hsl(TERMINAL_TOKENS.colors.background.tile),
        border: showBorder ? `1px solid ${hsla(TERMINAL_TOKENS.colors.border.default, 1)}` : 'none',
        fontFamily: TERMINAL_TOKENS.fonts.primary,
      }}
    >
      {/* Label */}
      <div 
        className="terminal-metric-label"
        style={{
          fontSize: sizeConfig.labelSize,
          fontWeight: TERMINAL_TOKENS.fonts.weights.semibold,
          color: hsl(TERMINAL_TOKENS.colors.text.secondary),
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          lineHeight: 1.2,
        }}
      >
        {label}
      </div>

      {/* Value Container */}
      <div 
        className="terminal-metric-value-container"
        style={{
          display: 'flex',
          flexDirection: isHorizontal ? 'column' : 'row',
          alignItems: isHorizontal ? 'flex-end' : 'baseline',
          gap: TERMINAL_TOKENS.spacing.xs,
        }}
      >
        {/* Primary Value */}
        <div 
          className="terminal-metric-value"
          style={{
            fontSize: sizeConfig.valueSize,
            fontWeight: TERMINAL_TOKENS.fonts.weights.bold,
            color: getStatusColor(),
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.025em',
            lineHeight: 1,
          }}
        >
          {valueFormatter(value)}
          {unit && (
            <span 
              style={{
                fontSize: sizeConfig.labelSize,
                color: hsl(TERMINAL_TOKENS.colors.text.muted),
                marginLeft: '4px'
              }}
            >
              {unit}
            </span>
          )}
        </div>

        {/* Change Indicator */}
        {change !== undefined && (
          <div 
            className="terminal-metric-change"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              fontSize: sizeConfig.changeSize,
              fontWeight: TERMINAL_TOKENS.fonts.weights.medium,
              color: getTrendColor(),
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <span>{getTrendSymbol()}</span>
            <span>{formatChange()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalMetric;