import React, { createContext, useContext, useEffect } from 'react';
import { EngineRegistry } from '@/engines/EngineRegistry';
import { NetLiquidityEngine } from '@/engines/NetLiquidityEngine';
import { CreditStressEngineV6 } from '@/engines/CreditStressEngineV6';
import { CUSIPStealthQEEngine } from '@/engines/CUSIPStealthQEEngine';
import { SimplifiedDataIntegrityEngine } from '@/engines/SimplifiedDataIntegrityEngine';
import { EnhancedMomentumEngine } from '@/engines/EnhancedMomentumEngine';
import { PrimaryDealerPositionsEngineV6 } from '@/engines/PrimaryDealerPositionsEngineV6';
import { EnhancedZScoreEngine } from '@/engines/EnhancedZScoreEngine';

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
    // Register all engines on startup
    console.log('🚀 Initializing Engine Registry with all V6 engines...');
    
    // Foundation Engines
    const netLiquidityEngine = new NetLiquidityEngine();
    const dataIntegrityEngine = new SimplifiedDataIntegrityEngine();
    const enhancedMomentumEngine = new EnhancedMomentumEngine();
    const enhancedZScoreEngine = new EnhancedZScoreEngine();
    
    // Pillar 2 Engines  
    const creditStressEngine = new CreditStressEngineV6();
    const cusipStealthEngine = new CUSIPStealthQEEngine();
    const primaryDealerEngine = new PrimaryDealerPositionsEngineV6();
    
    // Register Foundation Engines (Pillar 1)
    registry.register(netLiquidityEngine, {
      description: 'Analyzes net liquidity conditions in the financial system',
      version: '6.0',
      category: 'foundation',
      dependencies: ['WALCL', 'WTREGEN', 'RRPONTSYD']
    });
    
    registry.register(dataIntegrityEngine, {
      description: 'Validates data sources and performs self-healing operations',
      version: '6.0',
      category: 'foundation',
      dependencies: ['WALCL', 'WTREGEN', 'RRPONTSYD', 'DGS10']
    });
    
    registry.register(enhancedMomentumEngine, {
      description: 'Multi-scale momentum analysis with pattern recognition',
      version: '6.0',
      category: 'foundation',
      dependencies: ['MULTIPLE_INDICATORS']
    });
    
    registry.register(enhancedZScoreEngine, {
      description: 'Enhanced Z-score analysis with multi-timeframe statistical rigor',
      version: '6.0',
      category: 'foundation',
      dependencies: ['DGS10', 'DGS2', 'VIXCLS', 'T10Y2Y', 'BAMLH0A0HYM2']
    });
    
    // Register Pillar 2 Engines
    registry.register(creditStressEngine, {
      description: 'Analyzes credit stress conditions and corporate bond spreads',
      version: '6.0',
      category: 'core',
      dependencies: ['BAMLH0A0HYM2', 'BAMLC0A0CM', 'VIXCLS']
    });
    
    registry.register(cusipStealthEngine, {
      description: 'Detects stealth QE operations at CUSIP level',
      version: '6.0',
      category: 'core',
      dependencies: ['SOMA_HOLDINGS', 'CUSIP_METADATA']
    });
    
    registry.register(primaryDealerEngine, {
      description: 'Analyzes primary dealer positioning and risk appetite',
      version: '6.0',
      category: 'core',
      dependencies: ['DEALER_POSITIONS', 'MARKET_DATA']
    });
    
    console.log(`✅ Engine registry initialized with ${registry.getAllMetadata().length} engines`);
    
    // Log all registered engines
    registry.getAllMetadata().forEach(metadata => {
      console.log(`📊 Registered: ${metadata.name} (${metadata.category}) - v${metadata.version}`);
    });
  }, [registry]);

  return (
    <EngineRegistryContext.Provider value={{ registry }}>
      {children}
    </EngineRegistryContext.Provider>
  );
};