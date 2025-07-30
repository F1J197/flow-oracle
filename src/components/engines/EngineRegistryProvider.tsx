import React, { createContext, useContext, useEffect } from 'react';
import { EngineRegistry } from '@/engines/EngineRegistry';
import { UnifiedEngineRegistry } from '@/engines/base/UnifiedEngineRegistry';
import { EngineMigrationService, BackwardCompatibilityLayer } from '@/utils/engineMigration';
import { NetLiquidityEngine } from '@/engines/NetLiquidityEngine';
import { CreditStressEngineV6 } from '@/engines/CreditStressEngineV6';
import { CUSIPStealthQEEngine } from '@/engines/CUSIPStealthQEEngine';
import { DataIntegrityEngine } from '@/engines/foundation/DataIntegrityEngine';
import { EnhancedMomentumEngine } from '@/engines/EnhancedMomentumEngine';
import { PrimaryDealerPositionsEngineV6 } from '@/engines/PrimaryDealerPositionsEngineV6';
import { EnhancedZScoreEngine } from '@/engines/foundation/EnhancedZScoreEngine';

interface EngineRegistryContextType {
  registry: EngineRegistry;
  unifiedRegistry: UnifiedEngineRegistry;
  migrationService: EngineMigrationService;
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
  const unifiedRegistry = UnifiedEngineRegistry.getInstance();
  const migrationService = EngineMigrationService.getInstance();

  useEffect(() => {
    // Initialize the unified engine system
    console.log('🚀 Initializing Unified Engine Registry V6 with enhanced patterns...');
    
    // Set up backward compatibility layer
    BackwardCompatibilityLayer.wrapLegacyRegistry();
    BackwardCompatibilityLayer.addLegacyAliases(unifiedRegistry);
    
    // Foundation Engines
    const netLiquidityEngine = new NetLiquidityEngine();
    const dataIntegrityEngine = new DataIntegrityEngine();
    const enhancedMomentumEngine = new EnhancedMomentumEngine();
    const enhancedZScoreEngine = new EnhancedZScoreEngine();
    
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
    
    // Initiate migration process
    migrationService.migrateExistingEngines().then(() => {
      console.log('🎯 Engine migration completed successfully');
      
      // Validate migration
      if (migrationService.validateMigration()) {
        console.log('✅ Migration validation passed');
      } else {
        console.warn('⚠️ Migration validation failed - some engines may not be properly migrated');
      }
    }).catch(error => {
      console.error('❌ Engine migration failed:', error);
    });
    
  }, [registry, unifiedRegistry, migrationService]);

  return (
    <EngineRegistryContext.Provider value={{ registry, unifiedRegistry, migrationService }}>
      {children}
    </EngineRegistryContext.Provider>
  );
};