import React, { createContext, useContext, useEffect } from 'react';
import { EngineRegistry } from '@/engines/EngineRegistry';
import { UnifiedEngineRegistry } from '@/engines/base/UnifiedEngineRegistry';
// Migration services removed - using simplified initialization
import { NetLiquidityEngine } from '@/engines/NetLiquidityEngine';
import { CreditStressEngineV6 } from '@/engines/CreditStressEngineV6';
import { CUSIPStealthQEEngine } from '@/engines/CUSIPStealthQEEngine';
import { DataIntegrityEngine } from '@/engines/foundation/DataIntegrityEngine';
import { EnhancedMomentumEngine } from '@/engines/EnhancedMomentumEngine';
import { PrimaryDealerPositionsEngineV6 } from '@/engines/PrimaryDealerPositionsEngineV6';
import { EnhancedZScoreEngine } from '@/engines/foundation/EnhancedZScoreEngine';
import { GlobalFinancialPlumbingEngine } from '@/engines/pillar1/GlobalFinancialPlumbingEngine';

interface EngineRegistryContextType {
  registry: EngineRegistry;
  unifiedRegistry: UnifiedEngineRegistry;
  isInitialized: boolean;
  initializationError: Error | null;
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
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [initializationError, setInitializationError] = React.useState<Error | null>(null);
  const registry = EngineRegistry.getInstance();
  const unifiedRegistry = UnifiedEngineRegistry.getInstance();

  useEffect(() => {
    const initializeEngines = async () => {
      try {
        setIsInitialized(false);
        setInitializationError(null);
        
        // Initialize the unified engine system
        console.log('🚀 Initializing Unified Engine Registry V6 with enhanced patterns...');
        
        // Initialize engine registries
    
    // Foundation Engines
    const netLiquidityEngine = new NetLiquidityEngine();
    const dataIntegrityEngine = new DataIntegrityEngine();
    const enhancedMomentumEngine = new EnhancedMomentumEngine();
    const enhancedZScoreEngine = new EnhancedZScoreEngine();
    
    // Pillar 1 Engines
    const globalPlumbingEngine = new GlobalFinancialPlumbingEngine();
    
    // Pillar 2 Engines  
    const creditStressEngine = new CreditStressEngineV6();
    const cusipStealthEngine = new CUSIPStealthQEEngine();
    const primaryDealerEngine = new PrimaryDealerPositionsEngineV6();
    
    // Register Foundation Engines (Pillar 1) - Using both registries during migration
    registry.register(netLiquidityEngine, {
      description: 'Analyzes net liquidity conditions in the financial system',
      version: '6.0',
      category: 'foundation',
      dependencies: ['WALCL', 'WTREGEN', 'RRPONTSYD']
    });
    
    unifiedRegistry.register(netLiquidityEngine, {
      description: 'Analyzes net liquidity conditions in the financial system',
      version: '6.0',
      category: 'foundation',
      dependencies: ['WALCL', 'WTREGEN', 'RRPONTSYD']
    });
    
    registry.register(dataIntegrityEngine, {
      description: 'Advanced data integrity & self-healing engine with manipulation detection',
      version: '6.0',
      category: 'foundation',
      dependencies: ['MULTI_SOURCE_FEEDS', 'STATISTICAL_VALIDATION', 'CONSENSUS_ALGORITHMS']
    });
    
    unifiedRegistry.register(dataIntegrityEngine, {
      description: 'Advanced data integrity & self-healing engine with manipulation detection',
      version: '6.0',
      category: 'foundation',
      dependencies: ['MULTI_SOURCE_FEEDS', 'STATISTICAL_VALIDATION', 'CONSENSUS_ALGORITHMS']
    });
    
    registry.register(enhancedMomentumEngine, {
      description: 'Multi-scale momentum analysis with pattern recognition',
      version: '6.0',
      category: 'foundation',
      dependencies: ['MULTIPLE_INDICATORS']
    });
    
    unifiedRegistry.register(enhancedMomentumEngine, {
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
    
    unifiedRegistry.register(enhancedZScoreEngine, {
      description: 'Enhanced Z-score analysis with multi-timeframe statistical rigor',
      version: '6.0',
      category: 'foundation',
      dependencies: ['DGS10', 'DGS2', 'VIXCLS', 'T10Y2Y', 'BAMLH0A0HYM2']
    });
    
    // Register Pillar 1 Engines
    registry.register(globalPlumbingEngine, {
      description: 'Monitors global financial plumbing and cross-currency funding markets',
      version: '6.0',
      category: 'core',
      dependencies: ['BASIS_SWAPS', 'FED_SWAP_LINES', 'LIBOR_OIS']
    });
    
    unifiedRegistry.register(globalPlumbingEngine, {
      description: 'Monitors global financial plumbing and cross-currency funding markets',
      version: '6.0',
      category: 'core',
      dependencies: ['BASIS_SWAPS', 'FED_SWAP_LINES', 'LIBOR_OIS']
    });
    
    // Register Pillar 2 Engines
    registry.register(creditStressEngine, {
      description: 'Analyzes credit stress conditions and corporate bond spreads',
      version: '6.0',
      category: 'core',
      dependencies: ['BAMLH0A0HYM2', 'BAMLC0A0CM', 'VIXCLS']
    });
    
    unifiedRegistry.register(creditStressEngine, {
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
    
    unifiedRegistry.register(cusipStealthEngine, {
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
    
    unifiedRegistry.register(primaryDealerEngine, {
      description: 'Analyzes primary dealer positioning and risk appetite',
      version: '6.0',
      category: 'core',
      dependencies: ['DEALER_POSITIONS', 'MARKET_DATA']
    });
    
    console.log(`✅ Unified engine registry initialized with ${unifiedRegistry.getAllMetadata().length} engines`);
    
    // Log all registered engines
    unifiedRegistry.getAllMetadata().forEach(metadata => {
      console.log(`📊 Registered: ${metadata.name} (${metadata.category}) - v${metadata.version}${metadata.isLegacy ? ' [LEGACY]' : ''}`);
    });
    
        console.log('✅ All engines registered successfully');
        
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Engine initialization failed:', error);
        setInitializationError(error instanceof Error ? error : new Error(String(error)));
      }
    };
    
    initializeEngines();
  }, [registry, unifiedRegistry]);

  // Show loading state during initialization
  if (!isInitialized && !initializationError) {
    return (
      <div className="bg-bg-primary text-text-primary font-mono h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-neon-teal text-2xl">⚡ LIQUIDITY²</div>
          <div className="text-text-secondary">Initializing Engine Registry...</div>
          <div className="animate-pulse text-neon-lime">▶ Loading financial intelligence engines</div>
        </div>
      </div>
    );
  }
  
  // Show error state if initialization failed
  if (initializationError) {
    return (
      <div className="bg-bg-primary text-text-primary font-mono h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-neon-orange text-2xl">⚠️ INITIALIZATION ERROR</div>
          <div className="text-text-secondary">Engine registry failed to initialize</div>
          <div className="text-sm text-text-muted">{initializationError.message}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-neon-teal/20 text-neon-teal border border-neon-teal/30 px-4 py-2 font-mono"
          >
            RELOAD TERMINAL
          </button>
        </div>
      </div>
    );
  }

  return (
    <EngineRegistryContext.Provider value={{ 
      registry, 
      unifiedRegistry, 
      isInitialized, 
      initializationError 
    }}>
      {children}
    </EngineRegistryContext.Provider>
  );
};