/**
 * TileOrchestrator - Smart tile management system for dynamic dashboard layouts
 * Phase 5 Implementation: Complete tile coordination and rendering system
 */

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { BrowserEventEmitter } from '@/utils/BrowserEventEmitter';
import { useUnifiedEngineRegistry } from '@/hooks/useUnifiedEngineRegistry';
import { DashboardTileData } from '@/types/engines';

export interface TileConfiguration {
  id: string;
  engineId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  priority: number;
  minSize: { width: number; height: number };
  maxSize: { width: number; height: number };
  locked: boolean;
  visible: boolean;
  theme?: 'default' | 'critical' | 'warning' | 'success';
}

export interface LayoutConfig {
  columns: number;
  gap: number;
  autoArrange: boolean;
  responsive: boolean;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export interface TileOrchestratorProps {
  layout?: Partial<LayoutConfig>;
  tiles?: TileConfiguration[];
  onTileUpdate?: (tiles: TileConfiguration[]) => void;
  onLayoutChange?: (layout: LayoutConfig) => void;
  className?: string;
}

interface TileRenderData {
  config: TileConfiguration;
  data: DashboardTileData | null;
  isLoading: boolean;
  error: Error | null;
}

class TileEventManager extends BrowserEventEmitter {
  private static instance: TileEventManager;

  static getInstance(): TileEventManager {
    if (!TileEventManager.instance) {
      TileEventManager.instance = new TileEventManager();
    }
    return TileEventManager.instance;
  }

  emitTileUpdate(tileId: string, data: any) {
    this.emit('tile:update', { tileId, data, timestamp: new Date() });
  }

  emitLayoutChange(layout: LayoutConfig) {
    this.emit('layout:change', { layout, timestamp: new Date() });
  }

  emitTileInteraction(tileId: string, interaction: string, data?: any) {
    this.emit('tile:interaction', { tileId, interaction, data, timestamp: new Date() });
  }
}

const DEFAULT_LAYOUT: LayoutConfig = {
  columns: 4,
  gap: 20,
  autoArrange: true,
  responsive: true,
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1440,
  },
};

export const TileOrchestrator: React.FC<TileOrchestratorProps> = ({
  layout: layoutProps,
  tiles: tilesProps,
  onTileUpdate,
  onLayoutChange,
  className,
}) => {
  const [layout, setLayout] = useState<LayoutConfig>({
    ...DEFAULT_LAYOUT,
    ...layoutProps,
  });
  const [tiles, setTiles] = useState<TileConfiguration[]>(tilesProps || []);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  const eventManager = useMemo(() => TileEventManager.getInstance(), []);
  const { executeEngines, getEngineResult, loading } = useUnifiedEngineRegistry();

  // Responsive layout management
  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive columns calculation
  const responsiveColumns = useMemo(() => {
    if (!layout.responsive) return layout.columns;

    const { width } = viewportSize;
    if (width <= layout.breakpoints.mobile) return 1;
    if (width <= layout.breakpoints.tablet) return 2;
    if (width <= layout.breakpoints.desktop) return 3;
    return layout.columns;
  }, [viewportSize.width, layout]);

  // Tile data fetching and management
  const tileRenderData = useMemo(() => {
    return tiles.map((config): TileRenderData => {
      const result = getEngineResult(config.engineId);
      return {
        config,
        data: result?.dashboardTile || null,
        isLoading: loading,
        error: result?.error || null,
      };
    });
  }, [tiles, getEngineResult, loading]);

  // Auto-arrange tiles based on priority and size
  const arrangedTiles = useMemo(() => {
    if (!layout.autoArrange) return tileRenderData;

    const sorted = [...tileRenderData].sort((a, b) => b.config.priority - a.config.priority);
    
    let currentX = 0;
    let currentY = 0;
    let rowHeight = 0;

    return sorted.map((tile) => {
      const { config } = tile;
      
      if (currentX + config.size.width > responsiveColumns) {
        currentX = 0;
        currentY += rowHeight;
        rowHeight = 0;
      }

      const arrangedConfig = {
        ...config,
        position: { x: currentX, y: currentY },
      };

      currentX += config.size.width;
      rowHeight = Math.max(rowHeight, config.size.height);

      return {
        ...tile,
        config: arrangedConfig,
      };
    });
  }, [tileRenderData, layout.autoArrange, responsiveColumns]);

  // Grid style calculation
  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${responsiveColumns}, 1fr)`,
    gap: `${layout.gap}px`,
    padding: `${layout.gap}px`,
    minHeight: '100vh',
  }), [responsiveColumns, layout.gap]);

  // Tile update handlers
  const handleTileUpdate = useCallback((updatedTiles: TileConfiguration[]) => {
    setTiles(updatedTiles);
    onTileUpdate?.(updatedTiles);
    eventManager.emitLayoutChange(layout);
  }, [onTileUpdate, eventManager, layout]);

  const handleTileInteraction = useCallback((tileId: string, interaction: string, data?: any) => {
    eventManager.emitTileInteraction(tileId, interaction, data);
    
    switch (interaction) {
      case 'resize':
        setTiles(prev => prev.map(tile => 
          tile.id === tileId ? { ...tile, size: data.size } : tile
        ));
        break;
      case 'move':
        setTiles(prev => prev.map(tile => 
          tile.id === tileId ? { ...tile, position: data.position } : tile
        ));
        break;
      case 'toggle':
        setTiles(prev => prev.map(tile => 
          tile.id === tileId ? { ...tile, visible: !tile.visible } : tile
        ));
        break;
      case 'lock':
        setTiles(prev => prev.map(tile => 
          tile.id === tileId ? { ...tile, locked: !tile.locked } : tile
        ));
        break;
    }
  }, [eventManager]);

  // Layout update handler
  const handleLayoutChange = useCallback((newLayout: Partial<LayoutConfig>) => {
    const updatedLayout = { ...layout, ...newLayout };
    setLayout(updatedLayout);
    onLayoutChange?.(updatedLayout);
    eventManager.emitLayoutChange(updatedLayout);
  }, [layout, onLayoutChange, eventManager]);

  // Error boundary for individual tiles
  const TileErrorBoundary: React.FC<{ tileId: string; children: React.ReactNode }> = ({ 
    tileId, 
    children 
  }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
      setHasError(false);
    }, [tileId]);

    if (hasError) {
      return (
        <div className="tile-error p-4 border border-destructive/20 rounded-lg bg-destructive/10">
          <h3 className="text-destructive font-medium mb-2">Tile Error</h3>
          <p className="text-sm text-muted-foreground">
            Failed to render tile: {tileId}
          </p>
          <button 
            onClick={() => setHasError(false)}
            className="mt-2 text-xs text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      );
    }

    return <>{children}</>;
  };

  // Individual tile renderer
  const renderTile = useCallback((tileData: TileRenderData) => {
    const { config, data, isLoading, error } = tileData;
    
    if (!config.visible) return null;

    const tileStyle = {
      gridColumn: `span ${Math.min(config.size.width, responsiveColumns)}`,
      gridRow: `span ${config.size.height}`,
      minHeight: `${config.minSize.height * 60}px`, // Base height unit
    };

    const tileClassName = [
      'tile-container',
      'relative',
      'rounded-lg',
      'border',
      'border-border/20',
      'bg-card/80',
      'backdrop-blur-sm',
      'transition-all',
      'duration-300',
      'hover:border-border/40',
      'hover:shadow-lg',
      config.locked ? 'cursor-default' : 'cursor-pointer',
      config.theme === 'critical' && 'border-destructive/40 bg-destructive/5',
      config.theme === 'warning' && 'border-warning/40 bg-warning/5',
      config.theme === 'success' && 'border-success/40 bg-success/5',
    ].filter(Boolean).join(' ');

    return (
      <div
        key={config.id}
        style={tileStyle}
        className={tileClassName}
        onClick={() => handleTileInteraction(config.id, 'click')}
      >
        <TileErrorBoundary tileId={config.id}>
          {isLoading ? (
            <TileLoadingState />
          ) : error ? (
            <TileErrorState error={error} tileId={config.id} />
          ) : data ? (
            <TileContent data={data} config={config} />
          ) : (
            <TileEmptyState tileId={config.id} />
          )}
        </TileErrorBoundary>
      </div>
    );
  }, [responsiveColumns, handleTileInteraction]);

  return (
    <div 
      className={`tile-orchestrator ${className || ''}`}
      style={gridStyle}
    >
      {arrangedTiles.map(renderTile)}
    </div>
  );
};

// Tile state components
const TileLoadingState: React.FC = () => (
  <div className="tile-loading p-6 animate-pulse">
    <div className="h-4 bg-muted rounded mb-4"></div>
    <div className="h-8 bg-muted rounded mb-2"></div>
    <div className="h-3 bg-muted rounded w-2/3"></div>
  </div>
);

const TileErrorState: React.FC<{ error: Error; tileId: string }> = ({ error, tileId }) => (
  <div className="tile-error p-6">
    <div className="text-destructive text-sm font-medium mb-2">Error in {tileId}</div>
    <div className="text-muted-foreground text-xs">{error.message}</div>
  </div>
);

const TileEmptyState: React.FC<{ tileId: string }> = ({ tileId }) => (
  <div className="tile-empty p-6 text-center">
    <div className="text-muted-foreground text-sm">No data available</div>
    <div className="text-xs text-muted-foreground/70">{tileId}</div>
  </div>
);

const TileContent: React.FC<{ 
  data: DashboardTileData; 
  config: TileConfiguration;
}> = ({ data, config }) => (
  <div className="tile-content p-6">
    <div className="tile-header flex justify-between items-start mb-4">
      <h3 className="text-lg font-semibold text-foreground">{data.title}</h3>
      {data.status && (
        <span className={`
          px-2 py-1 rounded-full text-xs font-medium
          ${data.status === 'normal' ? 'bg-success/20 text-success' : ''}
          ${data.status === 'warning' ? 'bg-warning/20 text-warning' : ''}
          ${data.status === 'critical' ? 'bg-destructive/20 text-destructive' : ''}
        `}>
          {data.status}
        </span>
      )}
    </div>
    
    <div className="tile-value mt-2">
      <div className="text-2xl font-mono font-bold text-foreground">
        {data.primaryMetric}
      </div>
      {data.secondaryMetric && (
        <div className="text-sm text-muted-foreground mt-1">
          {data.secondaryMetric}
        </div>
      )}
    </div>

    {data.actionText && (
      <div className="tile-action mt-4 p-3 bg-muted/30 rounded-md">
        <p className="text-sm text-foreground/80">{data.actionText}</p>
      </div>
    )}
  </div>
);

export default TileOrchestrator;