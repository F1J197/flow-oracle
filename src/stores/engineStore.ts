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
                status: result?.status || 'active',
                primaryMetric: formatPrimaryMetric(result),
                secondaryMetric: formatSecondaryMetric(result),
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

function formatPrimaryMetric(result: any): string {
  if (!result) return 'No Data';
  
  if (result.primaryValue !== undefined) {
    return formatValue(result.primaryValue, result.unit);
  }
  
  if (result.value !== undefined) {
    return formatValue(result.value, result.unit);
  }
  
  return 'N/A';
}

function formatSecondaryMetric(result: any): string | undefined {
  if (!result) return undefined;
  
  const change = result.change || result.changePercent;
  if (change !== undefined) {
    const prefix = change >= 0 ? '+' : '';
    return `${prefix}${change.toFixed(2)}%`;
  }
  
  return result.secondaryValue ? String(result.secondaryValue) : undefined;
}

function determineTrend(result: any): 'up' | 'down' | 'neutral' {
  if (!result) return 'neutral';
  
  const change = result.change || result.changePercent || 0;
  return change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
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