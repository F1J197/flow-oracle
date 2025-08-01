/**
 * Net Liquidity Gauge - Iconic Semi-Circular Visualization
 * Bloomberg Terminal inspired gauge with neon aesthetics
 */

import React from 'react';
import { EngineOutput } from '@/engines/BaseEngine';

interface NetLiquidityGaugeProps {
  data: EngineOutput;
  size?: number;
}

export const NetLiquidityGauge: React.FC<NetLiquidityGaugeProps> = ({ 
  data, 
  size = 200 
}) => {
  const { subMetrics } = data;
  const compositeScore = subMetrics?.compositeScore || 0;
  const netLiquidity = subMetrics?.netLiquidity || 0;
  const trend = subMetrics?.trend || 'STABLE';
  const regime = subMetrics?.regime || 'NEUTRAL';
  
  // Gauge parameters
  const centerX = size / 2;
  const centerY = size * 0.75; // Position gauge lower
  const radius = size * 0.35;
  const strokeWidth = size * 0.08;
  
  // Calculate angle for needle (180 degrees = semi-circle)
  const angle = (compositeScore / 100) * 180;
  const needleAngle = (angle - 90) * (Math.PI / 180); // Convert to radians
  
  // Needle tip position
  const needleX = centerX + Math.cos(needleAngle) * (radius - strokeWidth / 2);
  const needleY = centerY + Math.sin(needleAngle) * (radius - strokeWidth / 2);
  
  // Get colors based on score and trend
  const getGaugeColor = () => {
    if (compositeScore > 70) return 'hsl(var(--semantic-positive))'; // Green zone
    if (compositeScore > 40) return 'hsl(var(--semantic-warning))'; // Amber zone
    return 'hsl(var(--semantic-negative))'; // Red zone
  };
  
  const getGlowEffect = () => {
    const color = getGaugeColor();
    return trend === 'EXPANDING' ? 
      `drop-shadow(0 0 8px ${color})` : 
      'none';
  };
  
  // Create gradient for gauge fill
  const createGradient = () => {
    const fillPercent = compositeScore;
    return `conic-gradient(
      from 180deg,
      hsl(var(--neon-orange)) 0%,
      hsl(var(--neon-amber)) 40%,
      hsl(var(--neon-lime)) 70%,
      hsl(var(--neon-lime)) ${fillPercent}%,
      hsl(var(--bg-secondary) / 0.3) ${fillPercent}%
    )`;
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Gauge SVG */}
      <div className="relative" style={{ width: size, height: size * 0.8 }}>
        <svg width={size} height={size * 0.8} className="overflow-visible">
          {/* Background arc */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            fill="none"
            stroke="hsl(var(--bg-elevated))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Filled arc */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${needleX} ${needleY}`}
            fill="none"
            stroke={getGaugeColor()}
            strokeWidth={strokeWidth * 0.8}
            strokeLinecap="round"
            style={{ filter: getGlowEffect() }}
          />
          
          {/* Center dot */}
          <circle
            cx={centerX}
            cy={centerY}
            r={strokeWidth / 4}
            fill="hsl(var(--text-primary))"
          />
          
          {/* Needle */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke="hsl(var(--text-primary))"
            strokeWidth={2}
            strokeLinecap="round"
          />
          
          {/* Score markers */}
          {[0, 25, 50, 75, 100].map((score, index) => {
            const markerAngle = (score / 100) * 180 - 90;
            const markerRad = markerAngle * (Math.PI / 180);
            const innerX = centerX + Math.cos(markerRad) * (radius - strokeWidth);
            const innerY = centerY + Math.sin(markerRad) * (radius - strokeWidth);
            const outerX = centerX + Math.cos(markerRad) * (radius + strokeWidth / 4);
            const outerY = centerY + Math.sin(markerRad) * (radius + strokeWidth / 4);
            
            return (
              <g key={score}>
                <line
                  x1={innerX}
                  y1={innerY}
                  x2={outerX}
                  y2={outerY}
                  stroke="hsl(var(--text-secondary))"
                  strokeWidth={1}
                />
                <text
                  x={centerX + Math.cos(markerRad) * (radius + strokeWidth / 2 + 8)}
                  y={centerY + Math.sin(markerRad) * (radius + strokeWidth / 2 + 8)}
                  fill="hsl(var(--text-secondary))"
                  fontSize={size * 0.06}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="'Roboto Mono', monospace"
                >
                  {score}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* Central display */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ top: size * 0.4 }}
        >
          <div className="text-center">
            <div 
              className="text-2xl font-bold font-mono"
              style={{ color: getGaugeColor() }}
            >
              {compositeScore}
            </div>
            <div className="text-xs text-secondary font-mono uppercase tracking-wider">
              Composite
            </div>
          </div>
        </div>
      </div>
      
      {/* Metrics display */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm text-center">
        <div>
          <div className="text-lg font-bold font-mono text-data">
            ${(netLiquidity / 1000).toFixed(1)}T
          </div>
          <div className="text-xs text-secondary font-mono uppercase">
            Net Liq
          </div>
        </div>
        
        <div>
          <div 
            className="text-lg font-bold font-mono"
            style={{ 
              color: trend === 'EXPANDING' ? 'hsl(var(--neon-lime))' : 
                     trend === 'CONTRACTING' ? 'hsl(var(--neon-orange))' : 
                     'hsl(var(--text-primary))' 
            }}
          >
            {trend}
          </div>
          <div className="text-xs text-secondary font-mono uppercase">
            Trend
          </div>
        </div>
        
        <div>
          <div 
            className="text-lg font-bold font-mono"
            style={{ 
              color: regime === 'QE' ? 'hsl(var(--neon-lime))' : 
                     regime === 'QT' ? 'hsl(var(--neon-orange))' : 
                     'hsl(var(--text-primary))' 
            }}
          >
            {regime}
          </div>
          <div className="text-xs text-secondary font-mono uppercase">
            Regime
          </div>
        </div>
      </div>
      
      {/* Alpha coefficient indicator */}
      <div className="text-center">
        <div className="text-sm font-mono text-secondary">
          α = {subMetrics?.alphaCoefficient?.toFixed(3) || '0.850'}
        </div>
        <div className="text-xs text-muted font-mono">
          {subMetrics?.alpha_adaptation || 'NEUTRAL'} Treasury Ops
        </div>
      </div>
    </div>
  );
};

export default NetLiquidityGauge;