import React from 'react';
import { EngineOutput } from '@/engines/BaseEngine';
import { TERMINAL_THEME } from '@/config/theme';

interface Props {
  data: EngineOutput;
  historicalData?: any[];
}

export const EnhancedMomentumIntelligenceView: React.FC<Props> = ({ data }) => {
  const regime = data.subMetrics?.regime || 'NEUTRAL';
  const velocity = data.subMetrics?.velocity || 0;
  const acceleration = data.subMetrics?.acceleration || 0;
  const jerkFactor = data.subMetrics?.jerkFactor || 0;
  const compositeScore = data.primaryMetric.value;
  
  // Mock momentum indicators data for Bloomberg-style display
  const momentumIndicators = [
    { name: 'MOCS_26', value: 84.2, percentile: 78 },
    { name: 'MOCS_52', value: 91.7, percentile: 85 },
    { name: 'MOCS_126', value: 67.3, percentile: 45 },
    { name: 'MOCS_252', value: 23.1, percentile: 12 },
    { name: 'ADX_14', value: 45.8, percentile: 62 },
    { name: 'RSI_21', value: 72.4, percentile: 81 },
    { name: 'STOCH_14', value: 38.9, percentile: 28 },
    { name: 'CCI_20', value: 156.2, percentile: 89 },
    { name: 'WILLR_14', value: -18.5, percentile: 73 },
    { name: 'ROC_21', value: 8.7, percentile: 76 }
  ];
  
  const getIndicatorColor = (percentile: number) => {
    if (percentile > 70) return TERMINAL_THEME.colors.semantic.positive;
    if (percentile < 30) return TERMINAL_THEME.colors.semantic.negative;
    return TERMINAL_THEME.colors.text.primary;
  };
  
  const getPrimaryColor = () => {
    if (compositeScore > 0.5) return TERMINAL_THEME.colors.semantic.positive;
    if (compositeScore < -0.5) return TERMINAL_THEME.colors.semantic.negative;
    return TERMINAL_THEME.colors.text.primary;
  };
  
  const getSignal = () => {
    if (compositeScore > 1) return 'BULLISH';
    if (compositeScore < -1) return 'BEARISH';
    return 'NEUTRAL';
  };
  
  // Generate ASCII confidence bar
  const generateConfidenceBar = (confidence: number) => {
    const bars = 20;
    const filled = Math.round((confidence / 100) * bars);
    return '█'.repeat(filled) + '░'.repeat(bars - filled);
  };
  
  // Calculate signal distribution
  const bullishCount = data.subMetrics?.bullishIndicators || 8;
  const bearishCount = data.subMetrics?.bearishIndicators || 3;
  const neutralCount = 25 - bullishCount - bearishCount;
  const totalSignals = bullishCount + bearishCount + neutralCount;
  
  return (
    <div style={{
      backgroundColor: TERMINAL_THEME.colors.background.primary,
      color: TERMINAL_THEME.colors.text.primary,
      fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
      fontSize: '12px',
      padding: '16px',
      height: '100vh',
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        color: TERMINAL_THEME.colors.headers.primary,
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '24px',
        letterSpacing: '2px',
        textAlign: 'center',
        borderBottom: `1px solid ${TERMINAL_THEME.colors.border.default}`,
        paddingBottom: '8px'
      }}>
        ENHANCED MOMENTUM ENGINE - INTELLIGENCE VIEW
      </div>

      {/* 3-Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '24px',
        marginBottom: '32px',
        height: '60vh'
      }}>
        
        {/* LEFT COLUMN - MOMENTUM METRICS */}
        <div style={{
          border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
          padding: '12px'
        }}>
          <div style={{
            color: TERMINAL_THEME.colors.headers.primary,
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '16px',
            textAlign: 'center',
            borderBottom: `1px solid ${TERMINAL_THEME.colors.border.default}`,
            paddingBottom: '4px'
          }}>
            MOMENTUM METRICS
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary, fontSize: '10px' }}>
              COMPOSITE SCORE
            </div>
            <div style={{ 
              fontSize: '32px',
              color: getPrimaryColor(),
              fontWeight: 'bold',
              lineHeight: '1'
            }}>
              {compositeScore >= 0 ? '+' : ''}{compositeScore.toFixed(2)}
            </div>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary, fontSize: '10px' }}>
              VELOCITY (RoC)
            </div>
            <div style={{ fontSize: '18px', color: TERMINAL_THEME.colors.text.primary }}>
              {velocity >= 0 ? '+' : ''}{velocity.toFixed(1)}%
            </div>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary, fontSize: '10px' }}>
              ACCELERATION (JERK)
            </div>
            <div style={{ fontSize: '18px', color: TERMINAL_THEME.colors.text.primary }}>
              {acceleration >= 0 ? '+' : ''}{acceleration.toFixed(1)}%
            </div>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary, fontSize: '10px' }}>
              MARKET REGIME
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: TERMINAL_THEME.colors.semantic.warning,
              fontWeight: 'bold'
            }}>
              {regime.replace(/_/g, ' ')}
            </div>
          </div>
          
          <div>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary, fontSize: '10px' }}>
              VOLATILITY FACTOR
            </div>
            <div style={{ 
              fontSize: '14px',
              color: jerkFactor > 10 ? TERMINAL_THEME.colors.semantic.warning : TERMINAL_THEME.colors.text.primary
            }}>
              {jerkFactor.toFixed(2)}
            </div>
          </div>
        </div>
        
        {/* MIDDLE COLUMN - INDICATOR ANALYSIS */}
        <div style={{
          border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
          padding: '12px'
        }}>
          <div style={{
            color: TERMINAL_THEME.colors.headers.primary,
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '16px',
            textAlign: 'center',
            borderBottom: `1px solid ${TERMINAL_THEME.colors.border.default}`,
            paddingBottom: '4px'
          }}>
            INDICATOR ANALYSIS
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '8px',
            fontSize: '10px',
            marginBottom: '8px'
          }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary, fontWeight: 'bold' }}>SYMBOL</div>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary, fontWeight: 'bold' }}>VALUE</div>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary, fontWeight: 'bold' }}>%ILE</div>
          </div>
          
          {momentumIndicators.map((indicator, idx) => (
            <div key={idx} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
              fontSize: '11px',
              marginBottom: '4px',
              padding: '2px 0'
            }}>
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>
                {indicator.name}
              </div>
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>
                {indicator.value.toFixed(1)}
              </div>
              <div style={{ color: getIndicatorColor(indicator.percentile), fontWeight: 'bold' }}>
                {indicator.percentile}
              </div>
            </div>
          ))}
        </div>
        
        {/* RIGHT COLUMN - SIGNAL BREAKDOWN */}
        <div style={{
          border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
          padding: '12px'
        }}>
          <div style={{
            color: TERMINAL_THEME.colors.headers.primary,
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '16px',
            textAlign: 'center',
            borderBottom: `1px solid ${TERMINAL_THEME.colors.border.default}`,
            paddingBottom: '4px'
          }}>
            SIGNAL BREAKDOWN
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '8px',
            fontSize: '10px',
            marginBottom: '8px'
          }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary, fontWeight: 'bold' }}>TYPE</div>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary, fontWeight: 'bold' }}>COUNT</div>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary, fontWeight: 'bold' }}>PCT</div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '8px',
            fontSize: '11px',
            marginBottom: '4px'
          }}>
            <div style={{ color: TERMINAL_THEME.colors.semantic.positive }}>BULLISH</div>
            <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{bullishCount}</div>
            <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{((bullishCount / totalSignals) * 100).toFixed(0)}%</div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '8px',
            fontSize: '11px',
            marginBottom: '4px'
          }}>
            <div style={{ color: TERMINAL_THEME.colors.semantic.negative }}>BEARISH</div>
            <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{bearishCount}</div>
            <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{((bearishCount / totalSignals) * 100).toFixed(0)}%</div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '8px',
            fontSize: '11px',
            marginBottom: '4px'
          }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>NEUTRAL</div>
            <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{neutralCount}</div>
            <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{((neutralCount / totalSignals) * 100).toFixed(0)}%</div>
          </div>
          
          <div style={{
            borderTop: `1px solid ${TERMINAL_THEME.colors.border.default}`,
            marginTop: '12px',
            paddingTop: '8px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
              fontSize: '11px',
              marginBottom: '4px'
            }}>
              <div style={{ color: TERMINAL_THEME.colors.semantic.warning }}>CRITICAL</div>
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{data.subMetrics?.criticalSignals || 2}</div>
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>--</div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
              fontSize: '11px',
              marginBottom: '4px'
            }}>
              <div style={{ color: TERMINAL_THEME.colors.semantic.warning }}>EXTREME</div>
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>{data.subMetrics?.extremeMomentum || 1}</div>
              <div style={{ color: TERMINAL_THEME.colors.text.primary }}>--</div>
            </div>
          </div>
          
          <div style={{
            marginTop: '16px',
            padding: '8px',
            border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
            backgroundColor: TERMINAL_THEME.colors.background.secondary
          }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary, fontSize: '10px', marginBottom: '4px' }}>
              CURRENT SIGNAL
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: getSignal() === 'BULLISH' ? TERMINAL_THEME.colors.semantic.positive :
                     getSignal() === 'BEARISH' ? TERMINAL_THEME.colors.semantic.negative :
                     TERMINAL_THEME.colors.text.secondary
            }}>
              {getSignal()}
            </div>
          </div>
        </div>
      </div>
      
      {/* BOTTOM SECTION - FULL WIDTH ANALYSIS */}
      <div style={{
        border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
        padding: '16px'
      }}>
        <div style={{
          color: TERMINAL_THEME.colors.headers.primary,
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '12px',
          letterSpacing: '1px'
        }}>
          MOMENTUM ANALYSIS
        </div>
        
        <div style={{
          color: TERMINAL_THEME.colors.text.primary,
          lineHeight: '1.5',
          fontSize: '12px',
          marginBottom: '16px'
        }}>
          {data.analysis}
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ color: TERMINAL_THEME.colors.text.secondary, fontSize: '11px' }}>
            CONFIDENCE:
          </div>
          <div style={{ 
            fontFamily: 'monospace',
            fontSize: '12px',
            color: data.confidence > 80 ? TERMINAL_THEME.colors.semantic.positive :
                   data.confidence > 60 ? TERMINAL_THEME.colors.semantic.warning :
                   TERMINAL_THEME.colors.semantic.negative
          }}>
            {generateConfidenceBar(data.confidence)}
          </div>
          <div style={{ color: TERMINAL_THEME.colors.text.primary, fontSize: '11px' }}>
            {data.confidence}%
          </div>
        </div>
      </div>
    </div>
  );
};