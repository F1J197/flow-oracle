import React from 'react';
import { TerminalBox } from '@/components/Terminal/TerminalBox';
import { TerminalTable } from '@/components/Terminal/TerminalTable';
import { EngineOutput } from '@/engines/BaseEngine';
import { TERMINAL_THEME } from '@/config/terminal.theme';

interface Props {
  data: EngineOutput;
  historicalData?: any[];
}

export const EnhancedMomentumIntelligenceView: React.FC<Props> = ({ data }) => {
  const regime = data.subMetrics?.regime || 'NEUTRAL';
  const jerkFactor = data.subMetrics?.jerkFactor || 0;
  
  return (
    <TerminalBox title="ENHANCED MOMENTUM ENGINE" status={data.signal === 'WARNING' ? 'warning' : 'active'}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: TERMINAL_THEME.layout.spacing.lg,
        padding: TERMINAL_THEME.layout.spacing.lg
      }}>
        {/* Column 1: Core Metrics */}
        <div>
          <h3 style={{ 
            color: TERMINAL_THEME.colors.neon.teal,
            marginBottom: TERMINAL_THEME.layout.spacing.md,
            fontSize: TERMINAL_THEME.typography.scale.lg
          }}>
            MOMENTUM METRICS
          </h3>
          
          <div style={{ marginBottom: TERMINAL_THEME.layout.spacing.md }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>
              Composite Score
            </div>
            <div style={{ 
              fontSize: TERMINAL_THEME.typography.scale.xl,
              color: data.primaryMetric.value > 0 
                ? TERMINAL_THEME.colors.semantic.positive
                : TERMINAL_THEME.colors.semantic.negative
            }}>
              {data.primaryMetric.value.toFixed(2)}
            </div>
          </div>
          
          <div style={{ marginBottom: TERMINAL_THEME.layout.spacing.md }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>
              Velocity (RoC)
            </div>
            <div style={{ fontSize: TERMINAL_THEME.typography.scale.lg }}>
              {data.subMetrics?.velocity?.toFixed(2)}%
            </div>
          </div>
          
          <div style={{ marginBottom: TERMINAL_THEME.layout.spacing.md }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>
              Acceleration (Jerk)
            </div>
            <div style={{ fontSize: TERMINAL_THEME.typography.scale.lg }}>
              {data.subMetrics?.acceleration?.toFixed(2)}%
            </div>
          </div>
          
          <div style={{ marginBottom: TERMINAL_THEME.layout.spacing.md }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>
              Market Regime
            </div>
            <div style={{ 
              fontSize: TERMINAL_THEME.typography.scale.base,
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
            color: TERMINAL_THEME.colors.neon.teal,
            marginBottom: TERMINAL_THEME.layout.spacing.md,
            fontSize: TERMINAL_THEME.typography.scale.lg
          }}>
            INDICATOR ANALYSIS
          </h3>
          
          <div style={{ marginBottom: TERMINAL_THEME.layout.spacing.xl }}>
            <h4 style={{ 
              color: TERMINAL_THEME.colors.semantic.positive,
              marginBottom: TERMINAL_THEME.layout.spacing.sm
            }}>
              TOP BULLISH
            </h4>
            {data.subMetrics?.topBullish?.map((item: any, idx: number) => (
              <div key={idx} style={{
                marginBottom: TERMINAL_THEME.layout.spacing.xs,
                fontSize: TERMINAL_THEME.typography.scale.sm,
                fontFamily: TERMINAL_THEME.fonts.primary
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
              marginBottom: TERMINAL_THEME.layout.spacing.sm
            }}>
              TOP BEARISH
            </h4>
            {data.subMetrics?.topBearish?.map((item: any, idx: number) => (
              <div key={idx} style={{
                marginBottom: TERMINAL_THEME.layout.spacing.xs,
                fontSize: TERMINAL_THEME.typography.scale.sm
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
            color: TERMINAL_THEME.colors.neon.teal,
            marginBottom: TERMINAL_THEME.layout.spacing.md,
            fontSize: TERMINAL_THEME.typography.scale.lg
          }}>
            SIGNAL BREAKDOWN
          </h3>
          
          <TerminalTable
            headers={['Metric', 'Count', 'Percent']}
            rows={[
              ['Bullish', data.subMetrics?.bullishIndicators || 0, `${((data.subMetrics?.bullishIndicators || 0) / 50 * 100).toFixed(0)}%`],
              ['Bearish', data.subMetrics?.bearishIndicators || 0, `${((data.subMetrics?.bearishIndicators || 0) / 50 * 100).toFixed(0)}%`],
              ['Accelerating', data.subMetrics?.acceleratingIndicators || 0, `${((data.subMetrics?.acceleratingIndicators || 0) / 50 * 100).toFixed(0)}%`],
              ['Critical', data.subMetrics?.criticalSignals || 0, 'N/A'],
              ['Extreme', data.subMetrics?.extremeMomentum || 0, 'N/A']
            ]}
          />
          
          {/* Divergences */}
          {data.subMetrics?.divergences && data.subMetrics.divergences.length > 0 && (
            <div style={{ marginTop: TERMINAL_THEME.layout.spacing.xl }}>
              <h4 style={{ 
                color: TERMINAL_THEME.colors.semantic.warning,
                marginBottom: TERMINAL_THEME.layout.spacing.sm
              }}>
                DIVERGENCES DETECTED
              </h4>
              {data.subMetrics.divergences.map((div: string, idx: number) => (
                <div key={idx} style={{
                  color: TERMINAL_THEME.colors.semantic.warning,
                  fontSize: TERMINAL_THEME.typography.scale.sm,
                  marginBottom: TERMINAL_THEME.layout.spacing.xs,
                  padding: TERMINAL_THEME.layout.spacing.sm,
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
        marginTop: TERMINAL_THEME.layout.spacing.xl,
        paddingTop: TERMINAL_THEME.layout.spacing.xl,
        paddingLeft: TERMINAL_THEME.layout.spacing.xl,
        paddingRight: TERMINAL_THEME.layout.spacing.xl
      }}>
        <h3 style={{ 
          color: TERMINAL_THEME.colors.neon.teal,
          marginBottom: TERMINAL_THEME.layout.spacing.md 
        }}>
          MOMENTUM ANALYSIS
        </h3>
        <div style={{ 
          fontFamily: TERMINAL_THEME.fonts.primary,
          color: TERMINAL_THEME.colors.text.primary
        }}>
          {data.analysis}
        </div>
        
        {/* Confidence Meter */}
        <div style={{ 
          marginTop: TERMINAL_THEME.layout.spacing.xl,
          display: 'flex',
          alignItems: 'center',
          gap: TERMINAL_THEME.layout.spacing.md
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
    </TerminalBox>
  );
};