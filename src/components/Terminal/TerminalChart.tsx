import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { TERMINAL_TOKENS, hsl, hsla } from '@/config/terminal.tokens';
import { formatValue } from '@/utils/formatting';

export interface TerminalChartProps {
  data: Array<{
    timestamp: number;
    value: number;
    [key: string]: any;
  }>;
  title?: string;
  width?: number | string;
  height?: number | string;
  color?: keyof typeof TERMINAL_TOKENS.colors.neon;
  showGrid?: boolean;
  showTooltip?: boolean;
  showReferenceLine?: boolean;
  referenceValue?: number;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  valueFormatter?: (value: number) => string;
  className?: string;
}

export const TerminalChart: React.FC<TerminalChartProps> = ({
  data,
  title,
  width = '100%',
  height = 200,
  color = 'teal',
  showGrid = true,
  showTooltip = true,
  showReferenceLine = false,
  referenceValue,
  trend = 'neutral',
  loading = false,
  valueFormatter = (value) => formatValue(value),
  className = ''
}) => {
  const chartColor = useMemo(() => hsl(TERMINAL_TOKENS.colors.neon[color]), [color]);
  const referenceColor = useMemo(() => hsl(TERMINAL_TOKENS.colors.neon.gold), []);
  
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp).getTime(),
      formattedTime: new Date(item.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0];
    return (
      <div 
        className="terminal-panel p-2 border"
        style={{
          background: hsl(TERMINAL_TOKENS.colors.background.elevated),
          borderColor: hsla(TERMINAL_TOKENS.colors.neon[color], 0.5),
          fontFamily: TERMINAL_TOKENS.fonts.primary,
        }}
      >
        <div 
          className="text-xs mb-1"
          style={{ color: hsl(TERMINAL_TOKENS.colors.text.secondary) }}
        >
          {new Date(label).toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
        <div 
          className="text-sm font-semibold"
          style={{ 
            color: chartColor,
            fontFamily: TERMINAL_TOKENS.fonts.primary,
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {valueFormatter(data.value)}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div 
        className={`terminal-chart-container ${className}`}
        style={{ 
          width, 
          height,
          background: hsl(TERMINAL_TOKENS.colors.background.tile),
          border: `1px solid ${hsla(TERMINAL_TOKENS.colors.border.muted, 1)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div 
          style={{ 
            color: hsl(TERMINAL_TOKENS.colors.text.muted),
            fontFamily: TERMINAL_TOKENS.fonts.primary,
            fontSize: TERMINAL_TOKENS.typography.scale.sm
          }}
        >
          LOADING CHART DATA...
        </div>
      </div>
    );
  }

  return (
    <div className={`terminal-chart-container ${className}`}>
      {title && (
        <div 
          className="terminal-chart-title mb-2"
          style={{
            fontFamily: TERMINAL_TOKENS.fonts.primary,
            fontSize: TERMINAL_TOKENS.typography.scale.xs,
            fontWeight: TERMINAL_TOKENS.fonts.weights.bold,
            color: hsl(TERMINAL_TOKENS.colors.neon[color]),
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          {title}
        </div>
      )}
      
      <div 
        style={{ 
          width, 
          height,
          background: hsl(TERMINAL_TOKENS.colors.background.tile),
          border: `1px solid ${hsla(TERMINAL_TOKENS.colors.neon[color], 0.3)}`,
          padding: '8px'
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            {showGrid && (
              <>
                <XAxis 
                  dataKey="timestamp"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: hsl(TERMINAL_TOKENS.colors.text.muted),
                    fontSize: 10,
                    fontFamily: TERMINAL_TOKENS.fonts.primary
                  }}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: hsl(TERMINAL_TOKENS.colors.text.muted),
                    fontSize: 10,
                    fontFamily: TERMINAL_TOKENS.fonts.primary
                  }}
                  tickFormatter={valueFormatter}
                />
              </>
            )}
            
            {showReferenceLine && referenceValue !== undefined && (
              <ReferenceLine 
                y={referenceValue} 
                stroke={referenceColor}
                strokeDasharray="2 2"
                strokeOpacity={0.6}
              />
            )}
            
            <Line
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ 
                r: 3, 
                fill: chartColor,
                stroke: hsl(TERMINAL_TOKENS.colors.background.primary),
                strokeWidth: 1
              }}
            />
            
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {trend !== 'neutral' && (
        <div 
          className="terminal-chart-trend mt-1 text-center"
          style={{
            fontFamily: TERMINAL_TOKENS.fonts.primary,
            fontSize: TERMINAL_TOKENS.typography.scale.xs,
            color: trend === 'up' 
              ? hsl(TERMINAL_TOKENS.colors.semantic.positive)
              : hsl(TERMINAL_TOKENS.colors.semantic.negative)
          }}
        >
          {trend === 'up' ? '▲ TRENDING UP' : '▼ TRENDING DOWN'}
        </div>
      )}
    </div>
  );
};

export default TerminalChart;