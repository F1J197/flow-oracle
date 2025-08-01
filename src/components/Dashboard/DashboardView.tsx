import { TERMINAL_THEME } from '@/config/theme';
import { EnhancedMomentumEngine } from '@/engines/foundation/EnhancedMomentumEngine';
import { EnhancedMomentumTile } from '@/engines/foundation/EnhancedMomentumEngine/components/DashboardTile';
import { useEffect, useState } from 'react';

export function DashboardView() {
  const [momentumData, setMomentumData] = useState<any>(null);
  
  useEffect(() => {
    const momentumEngine = new EnhancedMomentumEngine();
    const mockData = new Map();
    
    // Add sufficient mock data for calculations
    for (let i = 0; i < 25; i++) {
      mockData.set(`INDICATOR_${i}`, Array.from({length: 150}, (_, j) => 100 + Math.sin(j * 0.1) * 10 + Math.random() * 5));
    }
    
    const output = momentumEngine.calculate(mockData);
    setMomentumData(output);
  }, []);

  const engineTiles = Array.from({ length: 8 }, (_, i) => i + 2);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'repeat(3, 200px)',
      gap: TERMINAL_THEME.spacing.md,
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Enhanced Momentum Engine - First tile */}
      {momentumData && (
        <EnhancedMomentumTile data={momentumData} importance={95} />
      )}
      
      {/* Remaining placeholder tiles */}
      {engineTiles.map(engineNum => (
        <div
          key={engineNum}
          style={{
            height: '200px',
            padding: TERMINAL_THEME.spacing.md,
            border: `1px solid ${TERMINAL_THEME.colors.headers.primary}`,
            backgroundColor: TERMINAL_THEME.colors.background.secondary,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{
            color: TERMINAL_THEME.colors.headers.primary,
            fontSize: TERMINAL_THEME.typography.sizes.large,
            fontWeight: TERMINAL_THEME.typography.weights.bold,
            fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
            textAlign: 'center'
          }}>
            ENGINE {engineNum}
          </div>
          <div style={{
            color: TERMINAL_THEME.colors.text.secondary,
            fontSize: TERMINAL_THEME.typography.sizes.small,
            fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
            marginTop: TERMINAL_THEME.spacing.sm
          }}>
            PLACEHOLDER
          </div>
        </div>
      ))}
    </div>
  );
}