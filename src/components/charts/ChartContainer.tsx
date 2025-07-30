/**
 * Chart Container - Wrapper for individual chart instances
 */

import React, { useMemo, useCallback } from 'react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartConfig, ChartType } from '@/config/charts.config';
import { DataPoint } from '@/types/indicators';
import { useTerminalTheme } from '@/hooks/useTerminalTheme';
import { format } from 'date-fns';
import { Maximize2, Download, Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ChartContainerProps {
  config: ChartConfig;
  data: DataPoint[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onFullscreen?: () => void;
  onExport?: () => void;
  onSettings?: () => void;
  height?: number;
  crosshairValue?: number | null;
  onCrosshairChange?: (value: number | null) => void;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  config,
  data,
  loading = false,
  error = null,
  onRefresh,
  onFullscreen,
  onExport,
  onSettings,
  height = 400,
  crosshairValue,
  onCrosshairChange
}) => {
  const { theme } = useTerminalTheme();

  // Transform data for Recharts
  const chartData = useMemo(() => {
    return data.map(point => ({
      timestamp: point.timestamp.getTime(),
      value: point.value,
      volume: point.volume || 0,
      date: format(point.timestamp, 'MMM dd, HH:mm')
    }));
  }, [data]);

  // Custom tooltip
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const value = payload[0].value;
    const formattedValue = config.precision !== undefined 
      ? Number(value).toFixed(config.precision)
      : value;

    return (
      <div className="bg-bg-secondary border border-glass-border p-3 rounded shadow-lg">
        <div className="text-text-secondary text-xs mb-1">
          {format(new Date(label), 'MMM dd, yyyy HH:mm')}
        </div>
        <div className="text-text-data font-mono">
          {config.name}: {formattedValue}{config.unit || ''}
        </div>
      </div>
    );
  }, [config]);

  // Chart toolbar
  const ChartToolbar = () => (
    <div className="flex items-center justify-between mb-3">
      <div>
        <h3 className="text-text-primary font-mono text-sm font-medium">
          {config.name}
        </h3>
        <p className="text-text-secondary text-xs">
          {config.description}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-8 w-8 p-0 text-text-secondary hover:text-text-primary"
            disabled={loading}
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        )}
        {onSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            className="h-8 w-8 p-0 text-text-secondary hover:text-text-primary"
          >
            <Settings className="h-3 w-3" />
          </Button>
        )}
        {onExport && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
            className="h-8 w-8 p-0 text-text-secondary hover:text-text-primary"
          >
            <Download className="h-3 w-3" />
          </Button>
        )}
        {onFullscreen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onFullscreen}
            className="h-8 w-8 p-0 text-text-secondary hover:text-text-primary"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );

  // Render chart based on type
  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-text-secondary">Loading chart data...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-red-400 text-sm">{error}</div>
        </div>
      );
    }

    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-text-secondary text-sm">No data available</div>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      onMouseMove: (e: any) => {
        if (config.crosshairSync && e.activeLabel && onCrosshairChange) {
          onCrosshairChange(e.activeLabel);
        }
      },
      onMouseLeave: () => {
        if (config.crosshairSync && onCrosshairChange) {
          onCrosshairChange(null);
        }
      }
    };

    switch (config.chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.default} />
            <XAxis 
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              stroke={theme.colors.text.secondary}
              fontSize={10}
            />
            <YAxis 
              stroke={theme.colors.text.secondary}
              fontSize={10}
              tickFormatter={(value) => {
                const formatted = config.precision !== undefined 
                  ? Number(value).toFixed(config.precision)
                  : value;
                return `${formatted}${config.unit || ''}`;
              }}
            />
            <Tooltip content={CustomTooltip} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={config.color}
              fill={`${config.color}20`}
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        );

      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.default} />
            <XAxis 
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              stroke={theme.colors.text.secondary}
              fontSize={10}
            />
            <YAxis 
              stroke={theme.colors.text.secondary}
              fontSize={10}
              tickFormatter={(value) => {
                const formatted = config.precision !== undefined 
                  ? Number(value).toFixed(config.precision)
                  : value;
                return `${formatted}${config.unit || ''}`;
              }}
            />
            <Tooltip content={CustomTooltip} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={config.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: config.color, strokeWidth: 2 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <Card className="bg-bg-secondary border-glass-border p-4">
      <ChartToolbar />
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};