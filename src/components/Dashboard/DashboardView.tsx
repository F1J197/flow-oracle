import { TERMINAL_THEME } from '@/config/theme';
import { EnhancedMomentumEngine } from '@/engines/foundation/EnhancedMomentumEngine';
import { EnhancedMomentumTile } from '@/engines/foundation/EnhancedMomentumEngine/components/DashboardTile';
import { VolatilityRegimeEngine } from '@/engines/foundation/VolatilityRegimeEngine';
import { VolatilityRegimeTile } from '@/engines/foundation/VolatilityRegimeEngine/components/DashboardTile';
import { TestEngineTile } from '@/engines/TestEngine/components/DashboardTile';
import { useEffect, useState } from 'react';

export function DashboardView() {
  const [momentumData, setMomentumData] = useState<any>(null);
  const [volatilityData, setVolatilityData] = useState<any>(null);
  
  useEffect(() => {
    const momentumEngine = new EnhancedMomentumEngine();
    const volatilityEngine = new VolatilityRegimeEngine();
    const mockData = new Map();
    
    // Add sufficient mock data for calculations
    for (let i = 0; i < 25; i++) {
      mockData.set(`INDICATOR_${i}`, Array.from({length: 150}, (_, j) => 100 + Math.sin(j * 0.1) * 10 + Math.random() * 5));
    }
    
    // Add volatility-specific mock data
    mockData.set('VIX', 18.7);
    mockData.set('VIX9D', 19.2);
    mockData.set('VVIX', 115.3);
    mockData.set('REALIZED_VOL', 16.8);
    mockData.set('VIX_PREV', 18.4);
    
    const momentumOutput = momentumEngine.calculate(mockData);
    const volatilityOutput = volatilityEngine.calculate(mockData);
    
    setMomentumData(momentumOutput);
    setVolatilityData(volatilityOutput);
  }, []);

  const engineTiles = Array.from({ length: 8 }, (_, i) => i + 2);

  return (
    <div style={{
      backgroundColor: TERMINAL_THEME.colors.background.primary,
      minHeight: '100vh',
      padding: '0',
      fontFamily: TERMINAL_THEME.typography.fontFamily.mono
    }}>
      {/* Terminal Header */}
      <div style={{
        backgroundColor: TERMINAL_THEME.colors.background.secondary,
        color: TERMINAL_THEME.colors.headers.primary,
        fontSize: '14px',
        fontWeight: TERMINAL_THEME.typography.weights.bold,
        padding: '8px 12px',
        borderBottom: `2px solid ${TERMINAL_THEME.colors.headers.primary}`,
        letterSpacing: '1px'
      }}>
        LIQUIDITY² TERMINAL │ LIVE FEED │ {new Date().toLocaleTimeString('en-US', { hour12: false })} EDT
      </div>
      
      {/* 3x3 Bloomberg Terminal Grid - EXACT SPECIFICATION */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 200px)',
        gap: TERMINAL_THEME.spacing.md,
        maxWidth: '1400px',
        margin: '0 auto',
        padding: TERMINAL_THEME.spacing.lg
      }}>
        {momentumData && (
          <EnhancedMomentumTile data={momentumData} importance={90} />
        )}
        
        {/* Volatility Regime Engine */}
        {volatilityData && (
          <VolatilityRegimeTile data={volatilityData} importance={85} />
        )}
        
        {/* Test Engine */}
        <TestEngineTile 
          data={{
            primaryMetric: { value: 0.247, change24h: 0.03, changePercent: 2.1 },
            signal: 'RISK_ON',
            confidence: 82,
            analysis: 'Risk metrics stable - momentum building',
            subMetrics: { confidence: 82 }
          }} 
          importance={75} 
        />
        
        {/* Additional placeholder tiles - 6 more to complete 3x3 grid */}
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={{
            height: TERMINAL_THEME.tile.height,
            padding: TERMINAL_THEME.tile.padding,
            border: `${TERMINAL_THEME.tile.borderWidth} solid ${TERMINAL_THEME.colors.border.default}`,
            backgroundColor: TERMINAL_THEME.colors.background.secondary,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: TERMINAL_THEME.colors.text.secondary,
            fontSize: TERMINAL_THEME.typography.sizes.small,
            fontFamily: TERMINAL_THEME.typography.fontFamily.mono
          }}>
            <div style={{
              color: TERMINAL_THEME.colors.headers.primary,
              fontSize: TERMINAL_THEME.typography.sizes.small,
              fontWeight: TERMINAL_THEME.typography.weights.semibold,
              textTransform: 'uppercase',
              borderBottom: `1px solid ${TERMINAL_THEME.colors.border.default}`,
              paddingBottom: '4px',
              marginBottom: '8px'
            }}>
              ENGINE-{String(i + 4).padStart(2, '0')} │ OFFLINE
            </div>
            <div style={{
              fontSize: TERMINAL_THEME.typography.sizes.xxlarge,
              color: TERMINAL_THEME.colors.text.secondary,
              textAlign: 'center',
              marginTop: 'auto',
              marginBottom: 'auto'
            }}>
              ---
            </div>
            <div style={{
              fontSize: TERMINAL_THEME.typography.sizes.micro,
              color: TERMINAL_THEME.colors.text.secondary,
              textAlign: 'center',
              borderTop: `1px solid ${TERMINAL_THEME.colors.border.default}`,
              paddingTop: '4px'
            }}>
              INITIALIZING...
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}