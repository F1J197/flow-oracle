import React from 'react';
import { EngineOutput } from '@/engines/BaseEngine';
import { TERMINAL_THEME } from '@/config/theme';

interface Props {
  data: EngineOutput;
  historicalData?: any[];
}

export const EnhancedMomentumIntelligenceView: React.FC<Props> = ({ data }) => {
  const regime = data.subMetrics?.regime || 'NEUTRAL';
  const jerkFactor = data.subMetrics?.jerkFactor || 0;
  
  return (
    <div style={{
      backgroundColor: TERMINAL_THEME.colors.background.secondary,
      border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
      padding: TERMINAL_THEME.spacing.lg
    }}>
      {/* Header */}
      <div style={{
        color: TERMINAL_THEME.colors.headers.primary,
        fontSize: TERMINAL_THEME.typography.sizes.xlarge,
        fontWeight: TERMINAL_THEME.typography.weights.bold,
        fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
        marginBottom: TERMINAL_THEME.spacing.lg,
        letterSpacing: '1px'
      }}>
        ENHANCED MOMENTUM ENGINE
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: TERMINAL_THEME.spacing.lg,
        padding: TERMINAL_THEME.spacing.lg
      }}>
        {/* Column 1: Core Metrics */}
        <div>
          <h3 style={{ 
            color: TERMINAL_THEME.colors.headers.primary,
            marginBottom: TERMINAL_THEME.spacing.md,
            fontSize: TERMINAL_THEME.typography.sizes.medium
          }}>
            MOMENTUM METRICS
          </h3>
          
          <div style={{ marginBottom: TERMINAL_THEME.spacing.md }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>
              Composite Score
            </div>
            <div style={{ 
              fontSize: TERMINAL_THEME.typography.sizes.xlarge,
              color: data.primaryMetric.value > 0 
                ? TERMINAL_THEME.colors.semantic.positive
                : TERMINAL_THEME.colors.semantic.negative
            }}>
              {data.primaryMetric.value.toFixed(2)}
            </div>
          </div>
          
          <div style={{ marginBottom: TERMINAL_THEME.spacing.md }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>
              Velocity (RoC)
            </div>
            <div style={{ fontSize: TERMINAL_THEME.typography.sizes.large }}>
              {data.subMetrics?.velocity?.toFixed(2)}%
            </div>
          </div>
          
          <div style={{ marginBottom: TERMINAL_THEME.spacing.md }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>
              Acceleration (Jerk)
            </div>
            <div style={{ fontSize: TERMINAL_THEME.typography.sizes.large }}>
              {data.subMetrics?.acceleration?.toFixed(2)}%
            </div>
          </div>
          
          <div style={{ marginBottom: TERMINAL_THEME.spacing.md }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>
              Market Regime
            </div>
            <div style={{ 
              fontSize: TERMINAL_THEME.typography.sizes.medium,
              color: TERMINAL_THEME.colors.semantic.warning
            }}>
              {regime.replace(/_/g, ' ')}
            </div>
          </div>
          
          <div>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>
              Volatility (Jerk Factor)
            </div>
            <div style={{ 
              color: jerkFactor > 10 
                ? TERMINAL_THEME.colors.semantic.warning 
                : TERMINAL_THEME.colors.text.primary
            }}>
              {jerkFactor.toFixed(2)}
            </div>
          </div>
        </div>
        
        {/* Column 2: Indicator Breakdown */}
        <div>
          <h3 style={{ 
            color: TERMINAL_THEME.colors.headers.primary,
            marginBottom: TERMINAL_THEME.spacing.md,
            fontSize: TERMINAL_THEME.typography.sizes.medium
          }}>
            INDICATOR ANALYSIS
          </h3>
          
          <div style={{ marginBottom: TERMINAL_THEME.spacing.lg }}>
            <h4 style={{ 
              color: TERMINAL_THEME.colors.semantic.positive,
              marginBottom: TERMINAL_THEME.spacing.sm
            }}>
              TOP BULLISH
            </h4>
            {data.subMetrics?.topBullish?.map((item: any, idx: number) => (
              <div key={idx} style={{
                marginBottom: TERMINAL_THEME.spacing.xs,
                fontSize: TERMINAL_THEME.typography.sizes.small,
                fontFamily: TERMINAL_THEME.typography.fontFamily.mono
              }}>
                <span style={{ color: TERMINAL_THEME.colors.text.secondary }}>
                  {item.indicator}:
                </span>
                <span style={{ color: TERMINAL_THEME.colors.semantic.positive }}>
                  {' '}V:{item.velocity}% A:{item.acceleration}%
                </span>
              </div>
            ))}
          </div>
          
          <div>
            <h4 style={{ 
              color: TERMINAL_THEME.colors.semantic.negative,
              marginBottom: TERMINAL_THEME.spacing.sm
            }}>
              TOP BEARISH
            </h4>
            {data.subMetrics?.topBearish?.map((item: any, idx: number) => (
              <div key={idx} style={{
                marginBottom: TERMINAL_THEME.spacing.xs,
                fontSize: TERMINAL_THEME.typography.sizes.small
              }}>
                <span style={{ color: TERMINAL_THEME.colors.text.secondary }}>
                  {item.indicator}:
                </span>
                <span style={{ color: TERMINAL_THEME.colors.semantic.negative }}>
                  {' '}V:{item.velocity}% A:{item.acceleration}%
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Column 3: Signal Analysis */}
        <div>
          <h3 style={{ 
            color: TERMINAL_THEME.colors.headers.primary,
            marginBottom: TERMINAL_THEME.spacing.md,
            fontSize: TERMINAL_THEME.typography.sizes.medium
          }}>
            SIGNAL BREAKDOWN
          </h3>
          
          <div style={{
            backgroundColor: TERMINAL_THEME.colors.background.primary,
            border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
            padding: TERMINAL_THEME.spacing.sm,
            marginBottom: TERMINAL_THEME.spacing.md
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: TERMINAL_THEME.spacing.sm,
              fontSize: TERMINAL_THEME.typography.sizes.small
            }}>
              {/* Headers */}
              <div style={{ color: TERMINAL_THEME.colors.text.secondary, fontWeight: 'bold' }}>Metric</div>
              <div style={{ color: TERMINAL_THEME.colors.text.secondary, fontWeight: 'bold' }}>Count</div>
              <div style={{ color: TERMINAL_THEME.colors.text.secondary, fontWeight: 'bold' }}>Percent</div>
              
              {/* Data Rows */}
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>Bullish</div>
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{data.subMetrics?.bullishIndicators || 0}</div>
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{((data.subMetrics?.bullishIndicators || 0) / 50 * 100).toFixed(0)}%</div>
              
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>Bearish</div>
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{data.subMetrics?.bearishIndicators || 0}</div>
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{((data.subMetrics?.bearishIndicators || 0) / 50 * 100).toFixed(0)}%</div>
              
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>Accelerating</div>
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{data.subMetrics?.acceleratingIndicators || 0}</div>
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{((data.subMetrics?.acceleratingIndicators || 0) / 50 * 100).toFixed(0)}%</div>
              
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>Critical</div>
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{data.subMetrics?.criticalSignals || 0}</div>
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>N/A</div>
              
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>Extreme</div>
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{data.subMetrics?.extremeMomentum || 0}</div>
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>N/A</div>
            </div>
          </div>
          
          {/* Divergences */}
          {data.subMetrics?.divergences && data.subMetrics.divergences.length > 0 && (
            <div style={{ marginTop: TERMINAL_THEME.spacing.lg }}>
              <h4 style={{ 
                color: TERMINAL_THEME.colors.semantic.warning,
                marginBottom: TERMINAL_THEME.spacing.sm
              }}>
                DIVERGENCES DETECTED
              </h4>
              {data.subMetrics.divergences.map((div: string, idx: number) => (
                <div key={idx} style={{
                  color: TERMINAL_THEME.colors.semantic.warning,
                  fontSize: TERMINAL_THEME.typography.sizes.small,
                  marginBottom: TERMINAL_THEME.spacing.xs,
                  padding: TERMINAL_THEME.spacing.sm,
                  border: `1px solid ${TERMINAL_THEME.colors.semantic.warning}`
                }}>
                  {div}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Full Analysis */}
      <div style={{
        borderTop: `1px solid ${TERMINAL_THEME.colors.border.default}`,
        marginTop: TERMINAL_THEME.spacing.lg,
        paddingTop: TERMINAL_THEME.spacing.lg,
        paddingLeft: TERMINAL_THEME.spacing.lg,
        paddingRight: TERMINAL_THEME.spacing.lg
      }}>
        <h3 style={{ 
          color: TERMINAL_THEME.colors.headers.primary,
          marginBottom: TERMINAL_THEME.spacing.md 
        }}>
          MOMENTUM ANALYSIS
        </h3>
        <div style={{ 
          fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
          lineHeight: '1.6',
          color: TERMINAL_THEME.colors.text.primary
        }}>
          {data.analysis}
        </div>
        
        {/* Confidence Meter */}
        <div style={{ 
          marginTop: TERMINAL_THEME.spacing.lg,
          display: 'flex',
          alignItems: 'center',
          gap: TERMINAL_THEME.spacing.md
        }}>
          <span style={{ color: TERMINAL_THEME.colors.text.secondary }}>
            Confidence:
          </span>
          <div style={{ 
            flex: 1,
            height: '20px',
            backgroundColor: TERMINAL_THEME.colors.background.primary,
            border: `1px solid ${TERMINAL_THEME.colors.border.default}`
          }}>
            <div style={{
              width: `${data.confidence}%`,
              height: '100%',
              backgroundColor: data.confidence > 80 
                ? TERMINAL_THEME.colors.semantic.positive
                : data.confidence > 60 
                  ? TERMINAL_THEME.colors.semantic.warning
                  : TERMINAL_THEME.colors.semantic.negative
            }} />
          </div>
          <span style={{ color: TERMINAL_THEME.colors.text.primary }}>
            {data.confidence}%
          </span>
        </div>
      </div>
    </div>
  );
};