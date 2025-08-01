import React from 'react';
import { TERMINAL_THEME } from '@/config/theme';
import { IntelligenceViewData } from '@/types/intelligenceView';

export const VolatilityRegimeIntelligenceView: React.FC = () => {
  const data: IntelligenceViewData = {
    title: 'VOLATILITY REGIME ENGINE',
    status: 'active',
    primaryMetric: {
      label: 'Current VIX Level',
      value: '18.7',
      unit: '',
      color: 'orange'
    },
    keyMetrics: [
      { label: 'Regime State', value: 'NORMAL', status: 'good' },
      { label: 'Regime Strength', value: '64%', status: 'good' },
      { label: 'VIX9D', value: '19.2', status: 'good' },
      { label: 'VVIX', value: '115.3', status: 'good' },
      { label: 'Term Structure', value: '+0.5', status: 'warning' },
      { label: 'Confidence', value: '87%', status: 'good' }
    ],
    insights: [
      'Market volatility in normal regime with moderate strength',
      'Slight contango in VIX term structure suggests forward-looking calm',
      'VVIX levels indicate stable vol-of-vol environment',
      'Regime classification confidence high at 87%',
      'No immediate regime transition signals detected'
    ],
    lastUpdated: new Date()
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return TERMINAL_THEME.colors.semantic.positive;
      case 'warning': return TERMINAL_THEME.colors.semantic.warning;
      case 'critical': return TERMINAL_THEME.colors.semantic.negative;
      default: return TERMINAL_THEME.colors.text.secondary;
    }
  };

  const getMetricStatusColor = (status?: string) => {
    switch (status) {
      case 'good': return TERMINAL_THEME.colors.semantic.positive;
      case 'warning': return TERMINAL_THEME.colors.semantic.warning;
      case 'critical': return TERMINAL_THEME.colors.semantic.negative;
      default: return TERMINAL_THEME.colors.text.primary;
    }
  };

  const getPrimaryMetricColor = (color: string) => {
    switch (color) {
      case 'orange': return TERMINAL_THEME.colors.headers.primary;
      case 'teal': return TERMINAL_THEME.colors.semantic.info;
      case 'lime': return TERMINAL_THEME.colors.semantic.positive;
      case 'gold': return TERMINAL_THEME.colors.semantic.warning;
      default: return TERMINAL_THEME.colors.text.primary;
    }
  };

  return (
    <div style={{
      backgroundColor: TERMINAL_THEME.colors.background.primary,
      color: TERMINAL_THEME.colors.text.primary,
      fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
      padding: TERMINAL_THEME.spacing.lg,
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: `2px solid ${TERMINAL_THEME.colors.headers.primary}`,
        paddingBottom: TERMINAL_THEME.spacing.sm,
        marginBottom: TERMINAL_THEME.spacing.xl
      }}>
        <h1 style={{
          color: TERMINAL_THEME.colors.headers.primary,
          fontSize: TERMINAL_THEME.typography.sizes.xxlarge,
          fontWeight: TERMINAL_THEME.typography.weights.bold,
          margin: 0,
          letterSpacing: '1px'
        }}>
          {data.title}
        </h1>
        <div style={{
          color: getStatusColor(data.status),
          fontSize: TERMINAL_THEME.typography.sizes.small,
          marginTop: TERMINAL_THEME.spacing.xs,
          textTransform: 'uppercase',
          fontWeight: TERMINAL_THEME.typography.weights.semibold
        }}>
          STATUS: {data.status} │ LAST UPDATE: {data.lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Primary Metric */}
      <div style={{
        backgroundColor: TERMINAL_THEME.colors.background.secondary,
        border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
        padding: TERMINAL_THEME.spacing.lg,
        marginBottom: TERMINAL_THEME.spacing.xl
      }}>
        <div style={{
          fontSize: TERMINAL_THEME.typography.sizes.small,
          color: TERMINAL_THEME.colors.text.secondary,
          marginBottom: TERMINAL_THEME.spacing.xs,
          textTransform: 'uppercase'
        }}>
          {data.primaryMetric.label}
        </div>
        <div style={{
          fontSize: '48px',
          color: getPrimaryMetricColor(data.primaryMetric.color),
          fontWeight: TERMINAL_THEME.typography.weights.bold,
          lineHeight: 1
        }}>
          {data.primaryMetric.value}
          {data.primaryMetric.unit && (
            <span style={{
              fontSize: TERMINAL_THEME.typography.sizes.large,
              marginLeft: TERMINAL_THEME.spacing.xs
            }}>
              {data.primaryMetric.unit}
            </span>
          )}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: TERMINAL_THEME.spacing.lg,
        marginBottom: TERMINAL_THEME.spacing.xl
      }}>
        {data.keyMetrics.map((metric, index) => (
          <div key={index} style={{
            backgroundColor: TERMINAL_THEME.colors.background.secondary,
            border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
            padding: TERMINAL_THEME.spacing.md
          }}>
            <div style={{
              fontSize: TERMINAL_THEME.typography.sizes.tiny,
              color: TERMINAL_THEME.colors.text.secondary,
              marginBottom: TERMINAL_THEME.spacing.xs,
              textTransform: 'uppercase'
            }}>
              {metric.label}
            </div>
            <div style={{
              fontSize: TERMINAL_THEME.typography.sizes.large,
              color: getMetricStatusColor(metric.status),
              fontWeight: TERMINAL_THEME.typography.weights.semibold
            }}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      {/* Insights Section */}
      <div style={{
        backgroundColor: TERMINAL_THEME.colors.background.secondary,
        border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
        padding: TERMINAL_THEME.spacing.lg
      }}>
        <h2 style={{
          color: TERMINAL_THEME.colors.headers.primary,
          fontSize: TERMINAL_THEME.typography.sizes.large,
          fontWeight: TERMINAL_THEME.typography.weights.bold,
          marginBottom: TERMINAL_THEME.spacing.md,
          textTransform: 'uppercase'
        }}>
          Market Intelligence
        </h2>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}>
          {data.insights.map((insight, index) => (
            <li key={index} style={{
              color: TERMINAL_THEME.colors.text.primary,
              fontSize: TERMINAL_THEME.typography.sizes.medium,
              marginBottom: TERMINAL_THEME.spacing.sm,
              paddingLeft: TERMINAL_THEME.spacing.md,
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                color: TERMINAL_THEME.colors.headers.primary
              }}>
                ▸
              </span>
              {insight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};