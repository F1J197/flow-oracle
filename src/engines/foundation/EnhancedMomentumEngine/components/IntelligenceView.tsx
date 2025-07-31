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
        gap: '24px',
        padding: '24px',
        color: '#EAEAEA',
        fontFamily: 'monospace'
      }}>
        {/* Column 1: Core Metrics */}
        <div>
          <h3 style={{ 
            color: '#00BFFF',
            marginBottom: '16px',
            fontSize: '1.125rem'
          }}>
            MOMENTUM METRICS
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#999999' }}>Composite Score</div>
            <div style={{ 
              fontSize: '1.5rem',
              color: data.primaryMetric.value > 0 ? '#32CD32' : '#FF4500'
            }}>
              {data.primaryMetric.value.toFixed(2)}
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#999999' }}>Velocity (RoC)</div>
            <div style={{ fontSize: '1.125rem' }}>
              {data.subMetrics?.velocity?.toFixed(2)}%
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#999999' }}>Acceleration</div>
            <div style={{ fontSize: '1.125rem' }}>
              {data.subMetrics?.acceleration?.toFixed(2)}%
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#999999' }}>Market Regime</div>
            <div style={{ color: '#FFD700' }}>
              {regime.replace(/_/g, ' ')}
            </div>
          </div>
          
          <div>
            <div style={{ color: '#999999' }}>Jerk Factor</div>
            <div style={{ 
              color: jerkFactor > 10 ? '#FFD700' : '#EAEAEA'
            }}>
              {jerkFactor.toFixed(2)}
            </div>
          </div>
        </div>
        
        {/* Column 2: Indicator Breakdown */}
        <div>
          <h3 style={{ 
            color: '#00BFFF',
            marginBottom: '16px',
            fontSize: '1.125rem'
          }}>
            INDICATOR ANALYSIS
          </h3>
          
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ 
              color: '#32CD32',
              marginBottom: '8px'
            }}>
              TOP BULLISH
            </h4>
            {data.subMetrics?.topBullish?.map((item: any, idx: number) => (
              <div key={idx} style={{
                marginBottom: '4px',
                fontSize: '0.875rem'
              }}>
                <span style={{ color: '#999999' }}>{item.indicator}:</span>
                <span style={{ color: '#32CD32' }}>
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
                fontSize: '0.875rem'
              }}>
                <span style={{ color: '#999999' }}>{item.indicator}:</span>
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
            color: '#00BFFF',
            marginBottom: '16px',
            fontSize: '1.125rem'
          }}>
            SIGNAL BREAKDOWN
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <div>Bullish: {data.subMetrics?.bullishIndicators || 0}</div>
            <div>Bearish: {data.subMetrics?.bearishIndicators || 0}</div>
            <div>Accelerating: {data.subMetrics?.acceleratingIndicators || 0}</div>
            <div>Critical: {data.subMetrics?.criticalSignals || 0}</div>
            <div>Extreme: {data.subMetrics?.extremeMomentum || 0}</div>
          </div>
          
          <div>
            <h4 style={{ color: '#00BFFF' }}>CONFIDENCE</h4>
            <div style={{ 
              color: '#EAEAEA',
              fontSize: '1.125rem'
            }}>
              {data.confidence}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Full Analysis */}
      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        marginTop: '24px',
        paddingTop: '24px',
        paddingLeft: '24px',
        paddingRight: '24px'
      }}>
        <div style={{ 
          fontFamily: 'monospace',
          color: '#EAEAEA'
        }}>
          {data.analysis}
        </div>
      </div>
    </TerminalBox>
  );
};