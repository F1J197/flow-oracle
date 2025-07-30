import React from 'react';
import { useGlobalPlumbingEngine } from '@/hooks/useGlobalPlumbingEngine';
import { useEngineRegistryContext } from '@/components/engines/EngineRegistryProvider';

export const ContextInitializationTest: React.FC = () => {
  const context = useEngineRegistryContext();
  const globalPlumbing = useGlobalPlumbingEngine({ autoRefresh: false });

  return (
    <div className="bg-bg-secondary border border-glass-border rounded-lg p-4 space-y-4">
      <h3 className="text-neon-teal text-lg font-bold">🧪 Context Initialization Test</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-text-secondary">Registry Initialized:</span>
          <span className={context.isInitialized ? "text-neon-lime" : "text-neon-orange"}>
            {context.isInitialized ? "✅ Yes" : "❌ No"}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-text-secondary">Initialization Error:</span>
          <span className={context.initializationError ? "text-neon-orange" : "text-neon-lime"}>
            {context.initializationError ? `❌ ${context.initializationError.message}` : "✅ None"}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-text-secondary">Global Plumbing Hook:</span>
          <span className={globalPlumbing.loading ? "text-neon-gold" : globalPlumbing.error ? "text-neon-orange" : "text-neon-lime"}>
            {globalPlumbing.loading ? "🔄 Loading" : globalPlumbing.error ? `❌ ${globalPlumbing.error}` : "✅ Ready"}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-text-secondary">Engine Available:</span>
          <span className={globalPlumbing.engine ? "text-neon-lime" : "text-neon-orange"}>
            {globalPlumbing.engine ? "✅ Yes" : "❌ No"}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-text-secondary">Dashboard Data:</span>
          <span className={globalPlumbing.dashboardData ? "text-neon-lime" : "text-text-secondary"}>
            {globalPlumbing.dashboardData ? "✅ Available" : "⏳ Not loaded"}
          </span>
        </div>
      </div>
      
      {context.isInitialized && (
        <div className="mt-4 p-3 bg-bg-primary/50 rounded border border-neon-teal/30">
          <div className="text-neon-teal text-sm">✅ Context successfully initialized!</div>
          <div className="text-text-secondary text-xs mt-1">
            Registered engines: {context.unifiedRegistry.getAllMetadata().length}
          </div>
        </div>
      )}
    </div>
  );
};