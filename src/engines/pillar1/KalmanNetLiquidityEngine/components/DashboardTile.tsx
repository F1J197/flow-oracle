import React from 'react';
import { EngineOutput } from '@/engines/BaseEngine';

interface Props {
  data: EngineOutput;
  importance: number;
}

export const KalmanNetLiquidityTile: React.FC<Props> = ({ data, importance }) => {
  const netLiquidity = data.primaryMetric.value;
  const regime = data.subMetrics?.regime || 'TRANSITION';
  const weeklyChange = data.subMetrics?.weeklyChange || 0;
  const december2022 = data.subMetrics?.december2022Pattern || false;
  const stealthQE = data.subMetrics?.stealthQE || false;
  
  const getRegimeColor = () => {
    switch (regime) {
      case 'QE_ACTIVE': return 'hsl(90 100% 50%)'; // lime
      case 'QT_ACTIVE': return 'hsl(14 100% 55%)'; // orange
      case 'TRANSITION': return 'hsl(50 100% 50%)'; // gold
      default: return 'hsl(0 0% 90%)'; // white
    }
  };
  
  const getBorderColor = () => {
    if (importance > 85 || Math.abs(weeklyChange) > 200) {
      return 'hsl(14 100% 55%)'; // orange
    }
    if (importance > 60) return 'hsl(180 100% 50%)'; // teal
    return 'hsl(0 0% 20%)'; // gray
  };
  
  const getSpecialIndicator = () => {
    if (stealthQE) return { text: 'STEALTH QE', color: 'hsl(90 100% 50%)' };
    if (december2022) return { text: 'DEC 2022 PATTERN', color: 'hsl(50 100% 50%)' };
    return null;
  };
  
  const specialIndicator = getSpecialIndicator();
  
  return (
    <div style={{
      border: `1px solid ${getBorderColor()}`,
      padding: '16px',
      height: '200px',
      backgroundColor: 'hsl(0 0% 2%)',
      fontFamily: '"JetBrains Mono", monospace',
      position: 'relative'
    }}>
      {/* Special Indicator Badge */}
      {specialIndicator && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          backgroundColor: specialIndicator.color,
          color: 'hsl(0 0% 0%)',
          padding: '2px 6px',
          fontSize: '10px',
          fontWeight: 700
        }}>
          {specialIndicator.text}
        </div>
      )}
      
      {/* Header */}
      <div style={{
        color: 'hsl(180 100% 50%)',
        fontSize: '12px',
        marginBottom: '8px',
        textTransform: 'uppercase'
      }}>
        Net Liquidity
      </div>
      
      {/* Primary Metric */}
      <div style={{
        fontSize: '24px',
        color: getRegimeColor(),
        fontWeight: 700,
        marginBottom: '4px'
      }}>
        ${netLiquidity.toFixed(2)}T
      </div>
      
      {/* Change Indicator */}
      <div style={{
        fontSize: '12px',
        color: data.primaryMetric.changePercent >= 0 
          ? 'hsl(90 100% 50%)' 
          : 'hsl(14 100% 55%)',
        marginBottom: '8px'
      }}>
        {data.primaryMetric.changePercent >= 0 ? '+' : ''}
        {data.primaryMetric.changePercent.toFixed(2)}% (24h)
      </div>
      
      {/* Regime Label */}
      <div style={{
        fontSize: '12px',
        color: getRegimeColor(),
        fontWeight: 700,
        marginBottom: '4px'
      }}>
        {regime.replace('_', ' ')}
      </div>
      
      {/* Sub Metrics */}
      <div style={{
        fontSize: '10px',
        color: 'hsl(0 0% 60%)',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '4px'
      }}>
        <div>FED: ${((data.subMetrics?.fedBalance || 0) / 1000).toFixed(1)}B</div>
        <div>TGA: ${((data.subMetrics?.treasuryAccount || 0) / 1000).toFixed(1)}B</div>
        <div>RRP: ${(data.subMetrics?.reverseRepo || 0).toFixed(1)}B</div>
        <div>α: {(data.subMetrics?.kalmanAlpha || 0).toFixed(3)}</div>
      </div>
      
      {/* Weekly Change Alert */}
      {Math.abs(weeklyChange) > 100 && (
        <div style={{
          marginTop: '8px',
          padding: '4px',
          backgroundColor: Math.abs(weeklyChange) > 200 
            ? 'hsl(14 100% 55%)' 
            : 'hsl(50 100% 50%)',
          color: 'hsl(0 0% 0%)',
          fontSize: '10px',
          textAlign: 'center'
        }}>
          WEEKLY: {weeklyChange > 0 ? '+' : ''}{weeklyChange.toFixed(0)}B
        </div>
      )}
    </div>
  );
};