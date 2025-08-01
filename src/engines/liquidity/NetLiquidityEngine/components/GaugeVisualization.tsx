import React from 'react';
import { motion } from 'framer-motion';
import { EngineOutput } from '../../../BaseEngine';

interface GaugeVisualizationProps {
  data: EngineOutput;
  size?: number;
}

export const NetLiquidityGauge: React.FC<GaugeVisualizationProps> = ({
  data,
  size = 200
}) => {
  const value = data.primaryMetric.value;
  const label = "Net Liquidity";
  const min = 0;
  const max = 100;
  const normalizedValue = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const angle = normalizedValue * 180; // Semi-circle
  
  const getColor = () => {
    if (normalizedValue > 0.7) return 'hsl(var(--terminal-green))';
    if (normalizedValue < 0.3) return 'hsl(var(--terminal-red))';
    return 'hsl(var(--terminal-orange))';
  };

  const radius = size / 2 - 20;
  const strokeWidth = 12;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center space-y-4">
      <svg width={size} height={size / 2 + 40} className="overflow-visible">
        {/* Background arc */}
        <path
          d={`M 20 ${center} A ${radius} ${radius} 0 0 1 ${size - 20} ${center}`}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Value arc */}
        <motion.path
          d={`M 20 ${center} A ${radius} ${radius} 0 0 1 ${
            center + radius * Math.cos((180 - angle) * Math.PI / 180)
          } ${
            center - radius * Math.sin((180 - angle) * Math.PI / 180)
          }`}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Center value */}
        <text
          x={center}
          y={center + 10}
          textAnchor="middle"
          className="fill-current text-xl font-bold font-mono"
          style={{ fill: getColor() }}
        >
          {value.toFixed(1)}
        </text>
        
        {/* Min/Max labels */}
        <text
          x={30}
          y={center + 25}
          textAnchor="start"
          className="fill-muted-foreground text-xs"
        >
          {min}
        </text>
        <text
          x={size - 30}
          y={center + 25}
          textAnchor="end"
          className="fill-muted-foreground text-xs"
        >
          {max}
        </text>
      </svg>
      
      <div className="text-center">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
      </div>
    </div>
  );
};