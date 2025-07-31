import { create } from 'zustand';
import { EngineMetadata } from '@/engines/EngineRegistry';

interface TileData {
  id: string;
  engineId: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  importanceScore: number;
  status: 'active' | 'warning' | 'critical' | 'offline';
  primaryMetric: string;
  secondaryMetric?: string;
  trend: 'up' | 'down' | 'neutral';
  loading: boolean;
  lastUpdated?: Date;
}

interface EngineStore {
  tiles: TileData[];
  lastSortTime: Date | null;
  
  // Actions
  updateTile: (tileId: string, updates: Partial<TileData>) => void;
  sortTilesByImportance: () => void;
  initializeTiles: (engines: EngineMetadata[]) => void;
  updateTileFromEngineResult: (engineId: string, result: any) => void;
}

export const useEngineStore = create<EngineStore>((set, get) => ({
    tiles: [],
    lastSortTime: null,

    updateTile: (tileId: string, updates: Partial<TileData>) => {
      set((state) => ({
        tiles: state.tiles.map((tile) =>
          tile.id === tileId ? { ...tile, ...updates } : tile
        ),
      }));
    },

    sortTilesByImportance: () => {
      set((state) => ({
        tiles: [...state.tiles].sort((a, b) => b.importanceScore - a.importanceScore),
        lastSortTime: new Date(),
      }));
    },

    initializeTiles: (engines: EngineMetadata[]) => {
      const tiles: TileData[] = engines.map((engine) => ({
        id: `tile-${engine.id}`,
        engineId: engine.id,
        title: engine.name,
        size: determineTileSize(engine),
        importanceScore: calculateImportanceScore(engine),
        status: 'offline',
        primaryMetric: 'Loading...',
        trend: 'neutral',
        loading: true,
      }));

      set({ tiles, lastSortTime: new Date() });
    },

    updateTileFromEngineResult: (engineId: string, result: any) => {
      set((state) => ({
        tiles: state.tiles.map((tile) =>
          tile.engineId === engineId
            ? {
                ...tile,
                status: determineTileStatus(result),
                primaryMetric: formatPrimaryMetric(result, engineId),
                secondaryMetric: formatSecondaryMetric(result, engineId),
                trend: determineTrend(result),
                importanceScore: calculateDynamicImportance(tile, result),
                loading: false,
                lastUpdated: new Date(),
              }
            : tile
        ),
      }));
    },
  }));

// Helper functions
function determineTileSize(engine: EngineMetadata): 'small' | 'medium' | 'large' {
  // Critical foundation engines get large tiles
  if (engine.category === 'foundation' && engine.priority >= 90) {
    return 'large';
  }
  
  // High priority engines get medium tiles
  if (engine.priority >= 70) {
    return 'medium';
  }
  
  return 'small';
}

function calculateImportanceScore(engine: EngineMetadata): number {
  let score = engine.priority || 50;
  
  // Boost foundation engines
  if (engine.category === 'foundation') score += 20;
  
  // Boost synthesis engines
  if (engine.category === 'synthesis') score += 15;
  
  return Math.min(100, score);
}

function calculateDynamicImportance(tile: TileData, result: any): number {
  let score = tile.importanceScore;
  
  // Boost score for critical status
  if (result?.status === 'critical') score += 30;
  else if (result?.status === 'warning') score += 15;
  
  // Boost for recent data changes
  if (result?.hasRecentChange) score += 10;
  
  return Math.min(100, score);
}

function formatPrimaryMetric(result: any, engineId: string): string {
  if (!result) return 'No Data';
  
  // Try to get dashboard tile data from engine directly if available
  if (result.success && result.data) {
    try {
      // Import the engine registry to get the engine instance
      const { EngineRegistry } = require('@/engines/EngineRegistry');
      const registry = EngineRegistry.getInstance();
      const engine = registry.getEngine(engineId);
      
      if (engine && typeof engine.getDashboardTile === 'function') {
        const tileData = engine.getDashboardTile();
        if (tileData?.primaryMetric) {
          console.log(`✅ EngineStore: Got dashboard tile data for ${engineId}:`, tileData.primaryMetric);
          return tileData.primaryMetric;
        }
      }
    } catch (error) {
      console.warn(`⚠️ EngineStore: Could not get dashboard tile for ${engineId}:`, error);
    }
  }
  
  // Fallback to direct value extraction
  if (result.primaryValue !== undefined) {
    return formatValue(result.primaryValue, result.unit);
  }
  
  if (result.value !== undefined) {
    return formatValue(result.value, result.unit);
  }
  
  // Try nested data structure
  if (result.data?.composite?.value !== undefined) {
    return formatValue(result.data.composite.value, 'σ');
  }
  
  return 'N/A';
}

function formatSecondaryMetric(result: any, engineId: string): string | undefined {
  if (!result) return undefined;
  
  // Try to get dashboard tile data from engine directly if available
  if (result.success && result.data) {
    try {
      const { EngineRegistry } = require('@/engines/EngineRegistry');
      const registry = EngineRegistry.getInstance();
      const engine = registry.getEngine(engineId);
      
      if (engine && typeof engine.getDashboardTile === 'function') {
        const tileData = engine.getDashboardTile();
        if (tileData?.secondaryMetric) {
          console.log(`✅ EngineStore: Got secondary metric for ${engineId}:`, tileData.secondaryMetric);
          return tileData.secondaryMetric;
        }
      }
    } catch (error) {
      console.warn(`⚠️ EngineStore: Could not get secondary metric for ${engineId}:`, error);
    }
  }
  
  // Fallback to direct value extraction
  const change = result.change || result.changePercent;
  if (change !== undefined) {
    const prefix = change >= 0 ? '+' : '';
    return `${prefix}${change.toFixed(2)}%`;
  }
  
  // Try nested data for regime/confidence
  if (result.data?.composite) {
    const { regime, confidence } = result.data.composite;
    if (regime && confidence !== undefined) {
      return `${regime} • ${(confidence * 100).toFixed(0)}%`;
    }
  }
  
  return result.secondaryValue ? String(result.secondaryValue) : undefined;
}

function determineTrend(result: any): 'up' | 'down' | 'neutral' {
  if (!result) return 'neutral';
  
  // Check for direct trend value first
  if (result.trend) return result.trend;
  
  // Check for change values
  const change = result.change || result.changePercent || 0;
  if (change !== 0) {
    return change > 0 ? 'up' : 'down';
  }
  
  // For Z-Score engines, check composite value
  if (result.data?.composite?.value !== undefined) {
    const value = result.data.composite.value;
    return value > 0.5 ? 'up' : value < -0.5 ? 'down' : 'neutral';
  }
  
  return 'neutral';
}

function determineTileStatus(result: any): 'active' | 'warning' | 'critical' | 'offline' {
  if (!result) return 'offline';
  
  if (!result.success) return 'critical';
  
  // For Z-Score engines, determine status based on magnitude
  if (result.data?.composite?.value !== undefined) {
    const absValue = Math.abs(result.data.composite.value);
    if (absValue > 3) return 'critical';
    if (absValue > 2) return 'warning';
    return 'active';
  }
  
  return result.status || 'active';
}

function formatValue(value: number, unit?: string): string {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  
  if (unit === 'USD' || unit === 'dollars') {
    if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  }
  
  if (unit === 'percentage' || unit === '%') {
    return `${value.toFixed(2)}%`;
  }
  
  return value.toFixed(2);
}