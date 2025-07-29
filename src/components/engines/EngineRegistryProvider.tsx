import React, { createContext, useContext, useEffect } from 'react';
import { EngineRegistry } from '@/engines/EngineRegistry';
import { NetLiquidityEngine } from '@/engines/NetLiquidityEngine';

interface EngineRegistryContextType {
  registry: EngineRegistry;
}

const EngineRegistryContext = createContext<EngineRegistryContextType | null>(null);

export const useEngineRegistryContext = () => {
  const context = useContext(EngineRegistryContext);
  if (!context) {
    throw new Error('useEngineRegistryContext must be used within EngineRegistryProvider');
  }
  return context;
};

interface EngineRegistryProviderProps {
  children: React.ReactNode;
}

export const EngineRegistryProvider: React.FC<EngineRegistryProviderProps> = ({ children }) => {
  const registry = EngineRegistry.getInstance();

  useEffect(() => {
    // Register core engines on startup
    const netLiquidityEngine = new NetLiquidityEngine();
    
    registry.register(netLiquidityEngine, {
      description: 'Analyzes net liquidity conditions in the financial system',
      version: '6.0',
      category: 'foundation',
      dependencies: ['WALCL', 'WTREGEN', 'RRPONTSYD']
    });

    // TODO: Register additional engines as they're created
    // registry.register(new CreditStressEngine(), { ... });
    // registry.register(new MomentumEngine(), { ... });
    
    console.log('Engine registry initialized with engines:', registry.getAllMetadata().length);
  }, [registry]);

  return (
    <EngineRegistryContext.Provider value={{ registry }}>
      {children}
    </EngineRegistryContext.Provider>
  );
};