import React from 'react';
import { TerminalBox } from '@/components/Terminal/TerminalBox';
import { EngineOutput } from '@/engines/base/BaseEngine';
import { TERMINAL_THEME } from '@/config/terminal.theme';

interface Props {
  data: EngineOutput;
  importance: number;
}

export const DataIntegrityTile: React.FC<Props> = ({ data, importance }) => {
  const getStatusColor = () => {
    if (data.primaryMetric.value >= 95) return TERMINAL_THEME.colors.semantic.positive;
    if (data.primaryMetric.value >= 80) return TERMINAL_THEME.colors.text.primary;
    if (data.primaryMetric.value >= 60) return TERMINAL_THEME.colors.semantic.warning;
    return TERMINAL_THEME.colors.semantic.negative;
  };
  
  const getBorderColor = () => {
    if (importance > 85) return TERMINAL_THEME.colors.semantic.negative;
    if (importance > 60) return TERMINAL_THEME.colors.semantic.accent;
    return TERMINAL_THEME.colors.border.default;
  };
  
  return (
    <div style={{
      border: `1px solid ${getBorderColor()}`,
      padding: TERMINAL_THEME.spacing.md,
      height: '200px',
      backgroundColor: TERMINAL_THEME.colors.background.secondary,
      fontFamily: TERMINAL_THEME.typography.fontFamily.mono
    }}>
      {/* Header */}
      <div style={{
        color: TERMINAL_THEME.colors.semantic.accent,
        fontSize: TERMINAL_THEME.typography.sizes.small,
        marginBottom: TERMINAL_THEME.spacing.sm,
        textTransform: 'uppercase'
      }}>
        Data Integrity
      </div>
      
      {/* Primary Metric */}
      <div style={{
        fontSize: TERMINAL_THEME.typography.sizes.xlarge,
        color: getStatusColor(),
        fontWeight: TERMINAL_THEME.typography.weights.bold,
        marginBottom: TERMINAL_THEME.spacing.sm
      }}>
        {data.primaryMetric.value.toFixed(1)}%
      </div>
      
      {/* Sub Metrics */}
      <div style={{
        fontSize: TERMINAL_THEME.typography.sizes.small,
        color: TERMINAL_THEME.colors.text.secondary,
        marginBottom: TERMINAL_THEME.spacing.xs
      }}>
        System Health: {data.subMetrics?.healthyIndicators || 0}/{data.subMetrics?.totalIndicators || 0}
      </div>
      
      {/* Critical Issues */}
      {data.subMetrics?.criticalIssues > 0 && (
        <div style={{
          fontSize: TERMINAL_THEME.typography.sizes.small,
          color: TERMINAL_THEME.colors.semantic.negative
        }}>
          ⚠ {data.subMetrics.criticalIssues} CRITICAL ISSUES
        </div>
      )}
      
      {/* Analysis */}
      <div style={{
        fontSize: TERMINAL_THEME.typography.sizes.small,
        color: TERMINAL_THEME.colors.text.primary,
        marginTop: TERMINAL_THEME.spacing.sm,
        borderTop: `1px solid ${TERMINAL_THEME.colors.border.default}`,
        paddingTop: TERMINAL_THEME.spacing.sm
      }}>
        {data.analysis}
      </div>
    </div>
  );
};