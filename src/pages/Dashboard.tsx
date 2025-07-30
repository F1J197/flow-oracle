import { useState, useEffect } from 'react';
import { useEngineRegistry } from '@/hooks/useEngineRegistry';
import { useEngineStore } from '@/stores/engineStore';
import { useTerminalTheme } from '@/hooks/useTerminalTheme';
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader';
import { SmartTile } from '@/components/Dashboard/SmartTile';
import { ErrorBoundary } from '@/components/intelligence/ErrorBoundary';
import { LoadingDiagnostics } from '@/components/debug/LoadingDiagnostics';

export const Dashboard = () => {
  const { theme } = useTerminalTheme();
  const [lastUpdate, setLastUpdate] = useState<Date>();
  
  // Engine registry integration
  const {
    engines,
    results,
    status,
    loading: registryLoading,
    error: registryError,
    executeEngines,
  } = useEngineRegistry({
    autoExecute: true,
    refreshInterval: 15000,
  });

  // Engine store for smart tiles
  const {
    tiles,
    sortTilesByImportance,
    initializeTiles,
    updateTileFromEngineResult,
  } = useEngineStore();

  // Initialize tiles when engines are loaded
  useEffect(() => {
    if (engines.length > 0) {
      initializeTiles(engines);
    }
  }, [engines, initializeTiles]);

  // Update tiles when engine results change
  useEffect(() => {
    results.forEach((result, engineId) => {
      updateTileFromEngineResult(engineId, result);
    });
    if (results.size > 0) {
      setLastUpdate(new Date());
    }
  }, [results, updateTileFromEngineResult]);

  // Auto-sort tiles every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      sortTilesByImportance();
    }, 5000);

    return () => clearInterval(interval);
  }, [sortTilesByImportance]);

  // Calculate system health
  const systemHealth = status.total > 0 
    ? ((status.completed / status.total) * 100) 
    : 0;

  const activeEngines = status.completed;
  const totalEngines = status.total;

  if (registryError) {
    return (
      <div 
        className="h-screen flex items-center justify-center"
        style={{ 
          backgroundColor: theme.colors.background.primary,
          color: theme.colors.text.primary,
          fontFamily: theme.typography.terminal.mono.fontFamily,
        }}
      >
        <div className="text-center space-y-4">
          <div 
            className="text-2xl"
            style={{ color: theme.colors.semantic.critical }}
          >
            ⚠️ ENGINE REGISTRY ERROR
          </div>
          <div style={{ color: theme.colors.text.secondary }}>
            {registryError}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 border"
            style={{
              backgroundColor: `${theme.colors.neon.teal}20`,
              color: theme.colors.neon.teal,
              borderColor: `${theme.colors.neon.teal}30`,
              fontFamily: theme.typography.terminal.mono.fontFamily,
            }}
          >
            RELOAD DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoadingDiagnostics />
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('🚨 Dashboard ErrorBoundary caught error:', error, errorInfo);
        }}
        fallback={
          <div 
            className="h-screen flex items-center justify-center"
            style={{ 
              backgroundColor: theme.colors.background.primary,
              color: theme.colors.text.primary,
              fontFamily: theme.typography.terminal.mono.fontFamily,
            }}
          >
            <div className="text-center space-y-4">
              <div 
                className="text-2xl"
                style={{ color: theme.colors.semantic.critical }}
              >
                ⚠️ TERMINAL ERROR
              </div>
              <div style={{ color: theme.colors.text.secondary }}>
                Dashboard failed to initialize
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 border"
                style={{
                  backgroundColor: `${theme.colors.neon.teal}20`,
                  color: theme.colors.neon.teal,
                  borderColor: `${theme.colors.neon.teal}30`,
                  fontFamily: theme.typography.terminal.mono.fontFamily,
                }}
              >
                RELOAD TERMINAL
              </button>
            </div>
          </div>
        }
      >
        <div 
          className="min-h-screen"
          style={{ backgroundColor: theme.colors.background.primary }}
        >
          {/* Dashboard Header */}
          <DashboardHeader
            systemHealth={systemHealth}
            totalEngines={totalEngines}
            activeEngines={activeEngines}
            lastUpdate={lastUpdate}
          />

          {/* Smart Tiles Grid */}
          <div 
            className="p-4"
            style={{ padding: theme.layout.spacing.lg }}
          >
            <div 
              className="grid auto-rows-fr gap-4"
              style={{
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridAutoFlow: 'dense',
                gap: theme.layout.spacing.md,
              }}
            >
              {tiles.map((tile) => (
                <SmartTile
                  key={tile.id}
                  id={tile.id}
                  title={tile.title}
                  size={tile.size}
                  status={tile.status}
                  primaryMetric={tile.primaryMetric}
                  secondaryMetric={tile.secondaryMetric}
                  trend={tile.trend}
                  loading={tile.loading}
                  lastUpdated={tile.lastUpdated}
                  onClick={() => {
                    // Navigate to engine detail or intelligence view
                    console.log(`Clicked tile: ${tile.engineId}`);
                  }}
                />
              ))}
            </div>

            {/* Loading State */}
            {registryLoading && tiles.length === 0 && (
              <div 
                className="flex items-center justify-center py-12"
                style={{ color: theme.colors.text.secondary }}
              >
                <div className="text-center">
                  <div 
                    className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                    style={{ borderColor: theme.colors.neon.teal }}
                  />
                  <div style={{ fontFamily: theme.typography.terminal.mono.fontFamily }}>
                    Initializing Engines...
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!registryLoading && tiles.length === 0 && !registryError && (
              <div 
                className="flex items-center justify-center py-12"
                style={{ color: theme.colors.text.muted }}
              >
                <div className="text-center">
                  <div style={{ fontFamily: theme.typography.terminal.mono.fontFamily }}>
                    No engines configured
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>
    </>
  );
};