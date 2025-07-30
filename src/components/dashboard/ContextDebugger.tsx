import React from 'react';
import { useEngineRegistryContext } from '@/components/engines/EngineRegistryProvider';

export const ContextDebugger: React.FC = () => {
  const context = useEngineRegistryContext();
  
  return (
    <div className="fixed bottom-4 right-4 bg-bg-secondary border border-neon-teal/30 rounded p-3 text-xs font-mono z-50">
      <div className="text-neon-teal mb-2">🔧 Context Status</div>
      <div className={`mb-1 ${context.isInitialized ? 'text-neon-lime' : 'text-neon-orange'}`}>
        Init: {context.isInitialized ? '✅' : '❌'}
      </div>
      <div className={`mb-1 ${context.initializationError ? 'text-neon-orange' : 'text-neon-lime'}`}>
        Error: {context.initializationError ? '❌' : '✅'}
      </div>
      <div className="text-text-secondary">
        Engines: {context.unifiedRegistry.getAllMetadata().length}
      </div>
    </div>
  );
};