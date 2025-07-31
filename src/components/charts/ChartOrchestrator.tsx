/**
 * ChartOrchestrator - Phase 3 Implementation
 * Advanced chart coordination and management system
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { BrowserEventEmitter } from '@/utils/BrowserEventEmitter';
import { ChartGrid } from './ChartGrid';
import { ChartConfig } from '@/config/charts.config';
import { IndicatorValue } from '@/types/indicators';

export interface ChartOrchestratorConfig {
  maxCharts: number;
  defaultLayout: 'grid' | 'stack' | 'overlay';
  syncCrosshairs: boolean;
  enableRealtime: boolean;
  refreshInterval: number;
}

export interface ChartEventData {
  chartId: string;
  type: 'data' | 'interaction' | 'error';
  data: any;
  timestamp: Date;
}

class ChartEventManager extends BrowserEventEmitter {
  private static instance: ChartEventManager;

  static getInstance(): ChartEventManager {
    if (!ChartEventManager.instance) {
      ChartEventManager.instance = new ChartEventManager();
    }
    return ChartEventManager.instance;
  }

  emitChartEvent(event: ChartEventData) {
    this.emit('chart:event', event);
    this.emit(`chart:${event.type}`, event);
  }

  emitCrosshairSync(timestamp: number, value?: number) {
    this.emit('chart:crosshair-sync', { timestamp, value });
  }

  emitLayoutChange(layout: any) {
    this.emit('chart:layout-change', layout);
  }
}

export interface ChartOrchestratorProps {
  config?: Partial<ChartOrchestratorConfig>;
  initialCharts?: ChartConfig[];
  onChartsChange?: (charts: ChartConfig[]) => void;
  className?: string;
}

const DEFAULT_CONFIG: ChartOrchestratorConfig = {
  maxCharts: 12,
  defaultLayout: 'grid',
  syncCrosshairs: true,
  enableRealtime: true,
  refreshInterval: 15000,
};

export const ChartOrchestrator: React.FC<ChartOrchestratorProps> = ({
  config: configProps,
  initialCharts = [],
  onChartsChange,
  className,
}) => {
  const [config] = useState<ChartOrchestratorConfig>({
    ...DEFAULT_CONFIG,
    ...configProps,
  });
  
  const [charts, setCharts] = useState<ChartConfig[]>(initialCharts);
  const [syncValue, setSyncValue] = useState<number | null>(null);
  const [isRealtime, setIsRealtime] = useState(config.enableRealtime);

  const eventManager = useMemo(() => ChartEventManager.getInstance(), []);

  // Set up event listeners
  useEffect(() => {
    const handleCrosshairSync = (event: { timestamp: number; value?: number }) => {
      if (config.syncCrosshairs) {
        setSyncValue(event.timestamp);
      }
    };

    const handleChartEvent = (event: ChartEventData) => {
      console.log('Chart event:', event);
    };

    eventManager.on('chart:crosshair-sync', handleCrosshairSync);
    eventManager.on('chart:event', handleChartEvent);

    return () => {
      eventManager.off('chart:crosshair-sync', handleCrosshairSync);
      eventManager.off('chart:event', handleChartEvent);
    };
  }, [eventManager, config.syncCrosshairs]);

  // Chart management methods
  const addChart = useCallback((chartConfig: Omit<ChartConfig, 'id'>) => {
    if (charts.length >= config.maxCharts) {
      console.warn(`Maximum charts (${config.maxCharts}) reached`);
      return;
    }

    const newChart: ChartConfig = {
      ...chartConfig,
      id: `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    const updatedCharts = [...charts, newChart];
    setCharts(updatedCharts);
    onChartsChange?.(updatedCharts);

    eventManager.emitChartEvent({
      chartId: newChart.id,
      type: 'data',
      data: { action: 'added', chart: newChart },
      timestamp: new Date(),
    });
  }, [charts, config.maxCharts, onChartsChange, eventManager]);

  const removeChart = useCallback((chartId: string) => {
    const updatedCharts = charts.filter(chart => chart.id !== chartId);
    setCharts(updatedCharts);
    onChartsChange?.(updatedCharts);

    eventManager.emitChartEvent({
      chartId,
      type: 'data',
      data: { action: 'removed' },
      timestamp: new Date(),
    });
  }, [charts, onChartsChange, eventManager]);

  const updateChart = useCallback((chartId: string, updates: Partial<ChartConfig>) => {
    const updatedCharts = charts.map(chart =>
      chart.id === chartId ? { ...chart, ...updates } : chart
    );
    setCharts(updatedCharts);
    onChartsChange?.(updatedCharts);

    eventManager.emitChartEvent({
      chartId,
      type: 'data',
      data: { action: 'updated', updates },
      timestamp: new Date(),
    });
  }, [charts, onChartsChange, eventManager]);

  const duplicateChart = useCallback((chartId: string) => {
    const chartToDuplicate = charts.find(chart => chart.id === chartId);
    if (!chartToDuplicate) return;

    const duplicatedChart: ChartConfig = {
      ...chartToDuplicate,
      id: `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    const updatedCharts = [...charts, duplicatedChart];
    setCharts(updatedCharts);
    onChartsChange?.(updatedCharts);
  }, [charts, onChartsChange]);

  // Realtime data management
  const toggleRealtime = useCallback(() => {
    setIsRealtime(prev => !prev);
    eventManager.emitChartEvent({
      chartId: 'all',
      type: 'data',
      data: { action: 'realtime-toggle', enabled: !isRealtime },
      timestamp: new Date(),
    });
  }, [isRealtime, eventManager]);

  // Chart export functionality
  const exportCharts = useCallback((format: 'png' | 'svg' | 'json' = 'json') => {
    const exportData = {
      config,
      charts,
      timestamp: new Date(),
      format,
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `charts-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    eventManager.emitChartEvent({
      chartId: 'all',
      type: 'data',
      data: { action: 'export', format, data: exportData },
      timestamp: new Date(),
    });
  }, [config, charts, eventManager]);

  // Chart import functionality
  const importCharts = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        if (importData.charts && Array.isArray(importData.charts)) {
          const importedCharts = importData.charts.map((chart: any) => ({
            ...chart,
            id: `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          }));
          
          setCharts(importedCharts);
          onChartsChange?.(importedCharts);

          eventManager.emitChartEvent({
            chartId: 'all',
            type: 'data',
            data: { action: 'import', charts: importedCharts },
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Failed to import charts:', error);
        eventManager.emitChartEvent({
          chartId: 'all',
          type: 'error',
          data: { action: 'import-error', error },
          timestamp: new Date(),
        });
      }
    };
    reader.readAsText(file);
  }, [onChartsChange, eventManager]);

  // Toolbar component
  const ChartToolbar: React.FC = () => (
    <div className="chart-toolbar flex items-center justify-between p-4 border-b border-border/20">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Charts ({charts.length}/{config.maxCharts})</h2>
        <button
        onClick={() => addChart({
          name: 'BTC Chart',
          description: 'Bitcoin price chart',
          chartType: 'line',
          indicatorId: 'bitcoin',
          category: 'crypto',
          pillar: 3,
          priority: 1,
          color: '#FFD700',
          timeFrames: ['1h', '4h', '1d'],
          defaultTimeFrame: '1d',
          aggregationSupported: true,
          overlaySupported: true,
          zoomable: true,
          crosshairSync: true,
          realtime: true
        })}
          className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
          disabled={charts.length >= config.maxCharts}
        >
          Add Chart
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={toggleRealtime}
          className={`px-3 py-1 text-sm rounded ${
            isRealtime 
              ? 'bg-success text-success-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {isRealtime ? '⚡ Live' : '⏸️ Paused'}
        </button>
        
        <button
          onClick={() => exportCharts('json')}
          className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
        >
          Export
        </button>
        
        <label className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 cursor-pointer">
          Import
          <input
            type="file"
            accept=".json"
            onChange={(e) => e.target.files?.[0] && importCharts(e.target.files[0])}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className={`chart-orchestrator h-full ${className || ''}`}>
      <ChartToolbar />
      
      {charts.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <p className="mb-4">No charts added yet</p>
            <button
          onClick={() => addChart({
            name: 'BTC Chart',
            description: 'Bitcoin price chart',
            chartType: 'line',
            indicatorId: 'bitcoin',
            category: 'crypto',
            pillar: 3,
            priority: 1,
            color: '#FFD700',
            timeFrames: ['1h', '4h', '1d'],
            defaultTimeFrame: '1d',
            aggregationSupported: true,
            overlaySupported: true,
            zoomable: true,
            crosshairSync: true,
            realtime: true
          })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Add Your First Chart
            </button>
          </div>
        </div>
      ) : (
        <ChartGrid charts={charts} />
      )}
    </div>
  );
};

export default ChartOrchestrator;