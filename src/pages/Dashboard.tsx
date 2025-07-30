import { useState, useEffect, useMemo } from 'react';
import { useEngineRegistry } from '@/hooks/useEngineRegistry';
import { useEngineStore } from '@/stores/engineStore';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { ResponsiveGrid } from '@/components/Dashboard/ResponsiveGrid';
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader';
import { EnhancedSmartTile } from '@/components/Dashboard/EnhancedSmartTile';
import { ProgressiveLoader } from '@/components/Dashboard/ProgressiveLoader';
import { ErrorBoundary } from '@/components/intelligence/ErrorBoundary';
import { LoadingDiagnostics } from '@/components/debug/LoadingDiagnostics';

export const Dashboard = () => {
  const [lastUpdate, setLastUpdate] = useState<Date>();
  const [errors, setErrors] = useState<string[]>([]);
  
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

  // Memoized calculations for performance
  const systemHealth = useMemo(() => 
    status.total > 0 ? ((status.completed / status.total) * 100) : 0,
    [status.completed, status.total]
  );

  const activeEngines = status.completed;
  const totalEngines = status.total;

  // Track errors for progressive loader
  useEffect(() => {
    if (registryError) {
      setErrors(prev => [...prev, registryError].slice(-5)); // Keep last 5 errors
    }
  }, [registryError]);

  // Loading state with progressive loader
  if (registryLoading && tiles.length === 0) {
    return (
      <ResponsiveLayout currentPage="dashboard">
        <ProgressiveLoader
          totalEngines={engines.length || 0}
          loadedEngines={status.completed}
          currentEngine={status.running > 0 ? "Initializing engines..." : undefined}
          errors={errors}
        />
      </ResponsiveLayout>
    );
  }

  return (
    <>
      <LoadingDiagnostics />
      <ResponsiveLayout currentPage="dashboard">
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('🚨 Dashboard ErrorBoundary caught error:', error, errorInfo);
            setErrors(prev => [...prev, error.message].slice(-5));
          }}
          fallback={
            <ProgressiveLoader
              totalEngines={0}
              loadedEngines={0}
              errors={['Dashboard failed to initialize']}
            />
          }
        >
          {/* Dashboard Header */}
          <DashboardHeader
            systemHealth={systemHealth}
            totalEngines={totalEngines}
            activeEngines={activeEngines}
            lastUpdate={lastUpdate}
          />

          {/* Responsive Smart Tiles Grid */}
          <ResponsiveGrid>
            {tiles.map((tile) => (
              <EnhancedSmartTile
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
                aria-label={`${tile.title} engine tile showing ${tile.primaryMetric}`}
              />
            ))}

            {/* Empty State */}
            {!registryLoading && tiles.length === 0 && !registryError && (
              <div className="col-span-full flex items-center justify-center py-12 text-text-muted">
                <div className="text-center font-mono">
                  No engines configured
                </div>
              </div>
            )}
          </ResponsiveGrid>
        </ErrorBoundary>
      </ResponsiveLayout>
    </>
  );
};