import React from 'react';
import { TerminalBox } from '@/components/Terminal/TerminalBox';
import { TerminalTable } from '@/components/Terminal/TerminalTable';
import { EngineOutput } from '@/engines/BaseEngine';

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
        gap: '16px',
        padding: '16px'
      }}>
        {/* Column 1: Core Metrics */}
        <div>
          <h3 style={{ 
            color: '#F7931A',
            marginBottom: '12px',
            fontSize: '1rem'
          }}>
            MOMENTUM METRICS
          </h3>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#CCCCCC' }}>
              Composite Score
            </div>
            <div style={{ 
              fontSize: '1.5rem',
              color: data.primaryMetric.value > 0 ? '#80FF00' : '#FF4500'
            }}>
              {data.primaryMetric.value.toFixed(2)}
            </div>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#CCCCCC' }}>
              Velocity (RoC)
            </div>
            <div style={{ fontSize: '1.125rem' }}>
              {data.subMetrics?.velocity?.toFixed(2)}%
            </div>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#CCCCCC' }}>
              Acceleration (Jerk)
            </div>
            <div style={{ fontSize: '1.125rem' }}>
              {data.subMetrics?.acceleration?.toFixed(2)}%
            </div>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#CCCCCC' }}>
              Market Regime
            </div>
            <div style={{ 
              fontSize: '1rem',
              color: '#FFD700'
            }}>
              {regime.replace(/_/g, ' ')}
            </div>
          </div>
          
          <div>
            <div style={{ color: '#CCCCCC' }}>
              Volatility (Jerk Factor)
            </div>
            <div style={{ 
              color: jerkFactor > 10 ? '#FFD700' : '#FFFFFF'
            }}>
              {jerkFactor.toFixed(2)}
            </div>
          </div>
        </div>
        
        {/* Column 2: Indicator Breakdown */}
        <div>
          <h3 style={{ 
            color: '#F7931A',
            marginBottom: '12px',
            fontSize: '1rem'
          }}>
            INDICATOR ANALYSIS
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ 
              color: '#80FF00',
              marginBottom: '8px'
            }}>
              TOP BULLISH
            </h4>
            {data.subMetrics?.topBullish?.map((item: any, idx: number) => (
              <div key={idx} style={{
                marginBottom: '4px',
                fontSize: '0.75rem',
                fontFamily: '"JetBrains Mono", monospace'
              }}>
                <span style={{ color: '#CCCCCC' }}>
                  {item.indicator}:
                </span>
                <span style={{ color: '#80FF00' }}>
                  {' '}V:{item.velocity}% A:{item.acceleration}%
                </span>
              </div>
            ))}
          </div>
          
          <div>
            <h4 style={{ 
              color: '#FF4500',
              marginBottom: '8px'
            }}>
              TOP BEARISH
            </h4>
            {data.subMetrics?.topBearish?.map((item: any, idx: number) => (
              <div key={idx} style={{
                marginBottom: '4px',
                fontSize: '0.75rem'
              }}>
                <span style={{ color: '#CCCCCC' }}>
                  {item.indicator}:
                </span>
                <span style={{ color: '#FF4500' }}>
                  {' '}V:{item.velocity}% A:{item.acceleration}%
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Column 3: Signal Analysis */}
        <div>
          <h3 style={{ 
            color: '#F7931A',
            marginBottom: '12px',
            fontSize: '1rem'
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
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ 
                color: '#FFD700',
                marginBottom: '8px'
              }}>
                DIVERGENCES DETECTED
              </h4>
              {data.subMetrics.divergences.map((div: string, idx: number) => (
                <div key={idx} style={{
                  color: '#FFD700',
                  fontSize: '0.75rem',
                  marginBottom: '4px',
                  padding: '8px',
                  border: '1px solid #FFD700'
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
        borderTop: '1px solid hsl(180 100% 50% / 0.3)',
        marginTop: '16px',
        paddingTop: '16px',
        paddingLeft: '16px',
        paddingRight: '16px'
      }}>
        <h3 style={{ 
          color: '#F7931A',
          marginBottom: '12px' 
        }}>
          MOMENTUM ANALYSIS
        </h3>
        <div style={{ 
          fontFamily: '"JetBrains Mono", monospace',
          lineHeight: 1.6,
          color: '#FFFFFF'
        }}>
          {data.analysis}
        </div>
        
        {/* Confidence Meter */}
        <div style={{ 
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ color: '#CCCCCC' }}>
            Confidence:
          </span>
          <div style={{ 
            flex: 1,
            height: '20px',
            backgroundColor: '#000000',
            border: '1px solid hsl(180 100% 50% / 0.3)'
          }}>
            <div style={{
              width: `${data.confidence}%`,
              height: '100%',
              backgroundColor: data.confidence > 80 
                ? '#80FF00'
                : data.confidence > 60 
                  ? '#FFD700'
                  : '#FF4500'
            }} />
          </div>
          <span style={{ color: '#FFFFFF' }}>
            {data.confidence}%
          </span>
        </div>
      </div>
    </TerminalBox>
  );
};