/**
 * Fixed Chart Container - Uses Unified Configuration
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { useUnifiedIndicatorFixed } from '@/hooks/useUnifiedIndicatorFixed';
import { getIndicatorById } from '@/config/unifiedIndicators.config';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartContainerFixedProps {
  indicatorId: string;
  height?: number;
  showTitle?: boolean;
}

export function ChartContainerFixed({ 
  indicatorId, 
  height = 300, 
  showTitle = true 
}: ChartContainerFixedProps) {
  const { data, isLoading, error, lastUpdated } = useUnifiedIndicatorFixed(indicatorId, {
    autoRefresh: true,
    refreshInterval: 60000
  });

  const config = getIndicatorById(indicatorId);

  if (!config) {
    return (
      <Card className="p-4">
        <div className="text-red-500">Configuration not found for {indicatorId}</div>
      </Card>
    );
  }

  const chartData = data ? [
    { timestamp: data.timestamp.toISOString(), value: data.current }
  ] : [];

  return (
    <Card className="p-4 bg-[var(--bg-tile)] border-[var(--glass-border)]">
      {showTitle && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            {config.name}
          </h3>
          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
            <span>Source: {data?.source || config.source}</span>
            <span>Last Updated: {lastUpdated?.toLocaleTimeString() || 'Never'}</span>
            {data && (
              <span className={`font-medium ${data.changePercent >= 0 ? 'text-[var(--neon-teal)]' : 'text-[var(--neon-orange)]'}`}>
                {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      )}

      <div style={{ height }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-[var(--text-secondary)]">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-[var(--neon-orange)]">Error: {error}</div>
          </div>
        ) : data ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="timestamp" 
                stroke="var(--text-secondary)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                fontSize={12}
                label={{ 
                  value: config.yAxisLabel || config.unit || '', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: 'var(--text-secondary)' }
                }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
                formatter={(value: number) => [
                  `${value.toFixed(config.precision || 2)} ${config.unit || ''}`,
                  config.name
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={config.color || '#32CD32'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: config.color || '#32CD32' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-[var(--text-secondary)]">No data available</div>
          </div>
        )}
      </div>

      {data && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-[var(--text-secondary)]">Current</div>
            <div className="text-[var(--text-data)] font-mono text-lg">
              {data.current.toFixed(config.precision || 2)} {config.unit || ''}
            </div>
          </div>
          <div>
            <div className="text-[var(--text-secondary)]">Change</div>
            <div className={`font-mono ${data.change >= 0 ? 'text-[var(--neon-teal)]' : 'text-[var(--neon-orange)]'}`}>
              {data.change >= 0 ? '+' : ''}{data.change.toFixed(config.precision || 2)}
            </div>
          </div>
          <div>
            <div className="text-[var(--text-secondary)]">Confidence</div>
            <div className="text-[var(--text-data)] font-mono">
              {(data.confidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}