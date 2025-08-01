/**
 * Chart Grid - Layout system for multiple charts
 */

import React, { useState, useCallback, useMemo } from 'react';
import { ChartContainer } from './ChartContainer';
import { ChartConfig } from '@/config/charts.config';
import { useUnifiedIndicator } from '@/hooks/useUnifiedIndicator';
import { useTerminalTheme } from '@/hooks/useTerminalTheme';
import { Grid, LayoutGrid, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ChartGridProps {
  charts: ChartConfig[];
  columns?: number;
  onChartRemove?: (chartId: string) => void;
  onChartSettings?: (chartId: string) => void;
  onChartExport?: (chartId: string) => void;
}

interface GridLayout {
  columns: number;
  rows: number;
}

const GRID_LAYOUTS: Record<string, GridLayout> = {
  '1x1': { columns: 1, rows: 1 },
  '2x1': { columns: 2, rows: 1 },
  '2x2': { columns: 2, rows: 2 },
  '3x2': { columns: 3, rows: 2 },
  '3x3': { columns: 3, rows: 3 },
  '4x2': { columns: 4, rows: 2 }
};

export const ChartGrid: React.FC<ChartGridProps> = ({
  charts,
  columns = 2,
  onChartRemove,
  onChartSettings,
  onChartExport
}) => {
  const { theme } = useTerminalTheme();
  const [currentLayout, setCurrentLayout] = useState<GridLayout>({ columns, rows: Math.ceil(charts.length / columns) });
  const [crosshairValue, setCrosshairValue] = useState<number | null>(null);
  const [fullscreenChart, setFullscreenChart] = useState<string | null>(null);

  // Calculate grid dimensions
  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${currentLayout.columns}, 1fr)`,
    gap: theme.spacing.md,
    width: '100%'
  }), [currentLayout.columns, theme.spacing.md]);

  // Handle crosshair synchronization
  const handleCrosshairChange = useCallback((value: number | null) => {
    setCrosshairValue(value);
  }, []);

  // Handle fullscreen toggle
  const handleFullscreen = useCallback((chartId: string) => {
    setFullscreenChart(fullscreenChart === chartId ? null : chartId);
  }, [fullscreenChart]);

  // Grid toolbar
  const GridToolbar = () => (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-text-primary font-mono text-lg font-medium">
          CHART ANALYSIS
        </h2>
        <p className="text-text-secondary text-xs">
          {charts.length} indicators • {currentLayout.columns}×{Math.ceil(charts.length / currentLayout.columns)} grid
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {/* Layout selector */}
        <div className="flex items-center space-x-1 border border-glass-border rounded p-1">
          {Object.entries(GRID_LAYOUTS).map(([name, layout]) => (
            <Button
              key={name}
              variant="ghost"
              size="sm"
              onClick={() => setCurrentLayout(layout)}
              className={`h-7 px-2 text-xs ${
                currentLayout.columns === layout.columns && Math.ceil(charts.length / currentLayout.columns) === layout.rows
                  ? 'bg-glass-surface text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {name}
            </Button>
          ))}
        </div>
        
        {fullscreenChart && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFullscreenChart(null)}
            className="text-text-secondary hover:text-text-primary"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  // Individual chart wrapper
  const ChartWrapper: React.FC<{ config: ChartConfig }> = ({ config }) => {
    const { state, historicalData, loading, error, refresh } = useUnifiedIndicator(config.indicatorId, {
      includeHistorical: true,
      historicalPeriod: '30d',
      autoRefresh: config.realtime
    });

    const handleExport = useCallback(() => {
      if (onChartExport) {
        onChartExport(config.id);
      }
    }, [config.id]);

    const handleSettings = useCallback(() => {
      if (onChartSettings) {
        onChartSettings(config.id);
      }
    }, [config.id]);

    const handleFullscreenToggle = useCallback(() => {
      handleFullscreen(config.id);
    }, [config.id]);

    return (
      <ChartContainer
        config={config}
        data={historicalData}
        loading={loading}
        error={error}
        onRefresh={refresh}
        onFullscreen={handleFullscreenToggle}
        onExport={handleExport}
        onSettings={handleSettings}
        height={fullscreenChart === config.id ? 600 : 300}
        crosshairValue={config.crosshairSync ? crosshairValue : null}
        onCrosshairChange={config.crosshairSync ? handleCrosshairChange : undefined}
      />
    );
  };

  if (charts.length === 0) {
    return (
      <Card className="bg-bg-secondary border-glass-border p-8 text-center">
        <div className="text-text-secondary">
          <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-mono mb-2">No Charts Selected</h3>
          <p className="text-sm">Add charts to begin analysis</p>
        </div>
      </Card>
    );
  }

  // Fullscreen mode
  if (fullscreenChart) {
    const chart = charts.find(c => c.id === fullscreenChart);
    if (chart) {
      return (
        <div className="w-full">
          <GridToolbar />
          <ChartWrapper config={chart} />
        </div>
      );
    }
  }

  // Standard grid mode
  return (
    <div className="w-full">
      <GridToolbar />
      <div style={gridStyle}>
        {charts.map(config => (
          <ChartWrapper key={config.id} config={config} />
        ))}
      </div>
    </div>
  );
};