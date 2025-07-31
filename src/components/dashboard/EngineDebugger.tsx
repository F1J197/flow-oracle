import React from 'react';
import { useEngineRegistry } from '@/hooks/useEngineRegistry';
import { useEngineStore } from '@/stores/engineStore';

export const EngineDebugger: React.FC = () => {
  const { engines, results, status } = useEngineRegistry();
  const { tiles } = useEngineStore();

  return (
    <div className="fixed bottom-4 left-4 bg-bg-secondary border border-border rounded-lg p-4 text-xs font-mono z-50 max-w-md">
      <div className="text-accent-primary mb-2 font-bold">🔧 Engine Debug Info</div>
      
      <div className="space-y-2">
        <div>
          <span className="text-text-secondary">Registry Engines:</span>
          <span className="text-text-primary ml-2">{engines.length}</span>
        </div>
        
        <div>
          <span className="text-text-secondary">Execution Results:</span>
          <span className="text-text-primary ml-2">{results.size}</span>
        </div>
        
        <div>
          <span className="text-text-secondary">Tiles:</span>
          <span className="text-text-primary ml-2">{tiles.length}</span>
        </div>
        
        <div>
          <span className="text-text-secondary">Status:</span>
          <span className="text-text-primary ml-2">
            {status.completed}/{status.total} completed
          </span>
        </div>
        
        {results.size > 0 && (
          <div className="mt-3">
            <div className="text-text-secondary mb-1">Results:</div>
            {Array.from(results.entries()).map(([engineId, result]) => (
              <div key={engineId} className="text-xs">
                <span className="text-accent-secondary">{engineId}:</span>
                <span className={`ml-1 ${result?.success ? 'text-accent-success' : 'text-accent-danger'}`}>
                  {result?.success ? '✅' : '❌'}
                </span>
                {result?.data?.composite?.value && (
                  <span className="text-text-muted ml-1">
                    ({result.data.composite.value.toFixed(2)}σ)
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        
        {tiles.length > 0 && (
          <div className="mt-3">
            <div className="text-text-secondary mb-1">Tiles:</div>
            {tiles.map((tile) => (
              <div key={tile.id} className="text-xs">
                <span className="text-accent-secondary">{tile.engineId}:</span>
                <span className="text-text-primary ml-1">{tile.primaryMetric}</span>
                <span className={`ml-1 ${
                  tile.status === 'active' ? 'text-accent-success' :
                  tile.status === 'warning' ? 'text-accent-warning' :
                  tile.status === 'critical' ? 'text-accent-danger' : 'text-text-muted'
                }`}>
                  ({tile.status})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};