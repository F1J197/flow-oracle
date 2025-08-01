/**
 * Engine Registry - Phase 1 & 2 Implementation
 * Central registry for all 28 LIQUIDITY² engines
 * Manages engine configuration, dependencies, and execution order
 */

import { EngineConfig } from '@/engines/BaseEngine';

// ENGINE EXECUTION TIERS - Dependency Resolution Order
export const ENGINE_EXECUTION_ORDER = [
  // TIER 1: Foundation Layer - No dependencies
  [
    'data-integrity',
    'enhanced-zscore', 
    'enhanced-momentum'
  ],
  
  // TIER 2: Core Engines - Depend on Foundation
  [
    'volatility-regime',
    'net-liquidity',
    'credit-stress',
    'tail-risk',
    'options-flow',
    'trend-quality',
    'funding-pressure',
    'carry-unwind',
    'dollar-liquidity',
    'correlation-breakdown',
    'shadow-banking',
    'market-microstructure',
    'orderbook-imbalance',
    'macro-factor',
    'sentiment-divergence',
    'geopolitical-risk',
    'behavioral-pattern'
  ],
  
  // TIER 3: Advanced Analytics - Depend on Core
  [
    'regime-allocator',
    'dynamic-hedging',
    'risk-parity-optimizer'
  ],
  
  // TIER 4: Synthesis Layer - Depend on Advanced
  [
    'signal-aggregator',
    'execution-engine',
    'performance-attribution',
    'alert-prioritization'
  ],
  
  // TIER 5: Intelligence Layer - Final synthesis
  [
    'narrative-generator',
    'master-control'
  ]
];

// COMPLETE ENGINE REGISTRY - 28 Engines
export const ENGINE_REGISTRY: Record<string, EngineConfig> = {
  // FOUNDATION LAYER (3 engines)
  'data-integrity': {
    id: 'data-integrity',
    name: 'Data Integrity & Self-Healing',
    pillar: 0,
    priority: 100,
    updateInterval: 30000,
    requiredIndicators: ['VIX', 'SPX', 'TNX', 'DXY'],
    dependencies: []
  },
  
  'enhanced-zscore': {
    id: 'enhanced-zscore', 
    name: 'Enhanced Z-Score Foundation',
    pillar: 0,
    priority: 95,
    updateInterval: 60000,
    requiredIndicators: ['VIX', 'SPX', 'DXY', 'TNX'],
    dependencies: ['data-integrity']
  },
  
  'enhanced-momentum': {
    id: 'enhanced-momentum',
    name: 'Enhanced Momentum Engine',
    pillar: 0,
    priority: 90,
    updateInterval: 300000,
    requiredIndicators: ['SPX', 'NDX', 'VIX'],
    dependencies: ['enhanced-zscore']
  },

  // PILLAR 1: LIQUIDITY (7 engines)
  'net-liquidity': {
    id: 'net-liquidity',
    name: 'Kalman-Adaptive Net Liquidity',
    pillar: 1,
    priority: 95,
    updateInterval: 300000,
    requiredIndicators: ['WALCL', 'WTREGEN', 'RRPONTSYD'],
    dependencies: ['enhanced-zscore']
  },
  
  'credit-stress': {
    id: 'credit-stress',
    name: 'Credit Stress Engine',
    pillar: 1,
    priority: 85,
    updateInterval: 300000,
    requiredIndicators: ['BAMLH0A0HYM2', 'BAMLC0A0CM', 'VIX'],
    dependencies: ['enhanced-zscore']
  },
  
  'funding-pressure': {
    id: 'funding-pressure',
    name: 'Funding Pressure Monitor',
    pillar: 1, 
    priority: 80,
    updateInterval: 300000,
    requiredIndicators: ['SOFR', 'EFFR', 'REPO'],
    dependencies: ['enhanced-zscore']
  },
  
  'carry-unwind': {
    id: 'carry-unwind',
    name: 'Carry Unwind Detector',
    pillar: 1,
    priority: 75,
    updateInterval: 300000,
    requiredIndicators: ['USDJPY', 'AUDUSD', 'VIX'],
    dependencies: ['enhanced-zscore']
  },
  
  'dollar-liquidity': {
    id: 'dollar-liquidity',
    name: 'Dollar Liquidity Engine',
    pillar: 1,
    priority: 70,
    updateInterval: 300000,
    requiredIndicators: ['DXY', 'EURUSD', 'JPYUSD'],
    dependencies: ['enhanced-zscore']
  },
  
  // PILLAR 2: NETWORK & MARKET (6 engines)
  'volatility-regime': {
    id: 'volatility-regime',
    name: 'Volatility Regime Engine',
    pillar: 2,
    priority: 90,
    updateInterval: 300000,
    requiredIndicators: ['VIX', 'VIX9D', 'VVIX', 'MOVE'],
    dependencies: ['enhanced-zscore']
  },
  
  'tail-risk': {
    id: 'tail-risk',
    name: 'Tail Risk Engine',
    pillar: 2,
    priority: 85,
    updateInterval: 300000,
    requiredIndicators: ['SPX', 'VIX', 'SKEW'],
    dependencies: ['enhanced-zscore', 'volatility-regime']
  },
  
  'options-flow': {
    id: 'options-flow',
    name: 'Options Flow Engine',
    pillar: 2,
    priority: 75,
    updateInterval: 180000,
    requiredIndicators: ['PUT_CALL_RATIO', 'VIX', 'GAMMA_EX'],
    dependencies: ['volatility-regime']
  },
  
  'correlation-breakdown': {
    id: 'correlation-breakdown',
    name: 'Correlation Breakdown Engine',
    pillar: 2,
    priority: 70,
    updateInterval: 300000,
    requiredIndicators: ['SPX', 'VIX', 'TLT', 'GLD'],
    dependencies: ['enhanced-zscore']
  },
  
  'market-microstructure': {
    id: 'market-microstructure', 
    name: 'Market Microstructure Engine',
    pillar: 2,
    priority: 65,
    updateInterval: 60000,
    requiredIndicators: ['SPX_VOLUME', 'BID_ASK_SPREAD'],
    dependencies: ['enhanced-zscore']
  },
  
  'orderbook-imbalance': {
    id: 'orderbook-imbalance',
    name: 'Orderbook Imbalance Engine', 
    pillar: 2,
    priority: 60,
    updateInterval: 60000,
    requiredIndicators: ['ORDERBOOK_DATA'],
    dependencies: ['market-microstructure']
  },

  // PILLAR 3: ECONOMIC CONTEXT (3 engines)
  'macro-factor': {
    id: 'macro-factor',
    name: 'Macro Factor Engine',
    pillar: 3,
    priority: 80,
    updateInterval: 600000,
    requiredIndicators: ['ISM_PMI', 'PAYROLLS', 'CPI', 'PCE'],
    dependencies: ['enhanced-zscore']
  },
  
  'sentiment-divergence': {
    id: 'sentiment-divergence',
    name: 'Sentiment Divergence Engine',
    pillar: 3,
    priority: 70,
    updateInterval: 300000,
    requiredIndicators: ['AAII_SENTIMENT', 'VIX', 'PUT_CALL_RATIO'],
    dependencies: ['enhanced-zscore']
  },
  
  'geopolitical-risk': {
    id: 'geopolitical-risk',
    name: 'Geopolitical Risk Engine',
    pillar: 3,
    priority: 65,
    updateInterval: 600000,
    requiredIndicators: ['VIX', 'GOLD', 'OIL', 'USD'],
    dependencies: ['enhanced-zscore']
  },

  // SYNTHESIS LAYER (9 engines)
  'signal-aggregator': {
    id: 'signal-aggregator',
    name: 'Signal Aggregator Engine',
    pillar: 4,
    priority: 95,
    updateInterval: 300000,
    requiredIndicators: [],
    dependencies: [
      'enhanced-momentum',
      'volatility-regime', 
      'net-liquidity',
      'credit-stress',
      'tail-risk'
    ]
  },
  
  'regime-allocator': {
    id: 'regime-allocator',
    name: 'Dynamic Regime Allocator',
    pillar: 4,
    priority: 85,
    updateInterval: 300000,
    requiredIndicators: [],
    dependencies: ['volatility-regime', 'macro-factor', 'credit-stress']
  },
  
  'risk-parity-optimizer': {
    id: 'risk-parity-optimizer',
    name: 'Risk Parity Optimizer',
    pillar: 4,
    priority: 75,
    updateInterval: 600000,
    requiredIndicators: [],
    dependencies: ['correlation-breakdown', 'volatility-regime']
  },
  
  'dynamic-hedging': {
    id: 'dynamic-hedging',
    name: 'Dynamic Hedging Engine',
    pillar: 4,
    priority: 70,
    updateInterval: 300000,
    requiredIndicators: [],
    dependencies: ['tail-risk', 'volatility-regime', 'options-flow']
  },
  
  'execution-engine': {
    id: 'execution-engine',
    name: 'Execution Engine',
    pillar: 4,
    priority: 65,
    updateInterval: 60000,
    requiredIndicators: [],
    dependencies: ['signal-aggregator', 'market-microstructure']
  },
  
  'performance-attribution': {
    id: 'performance-attribution',
    name: 'Performance Attribution Engine',
    pillar: 4,
    priority: 60,
    updateInterval: 600000,
    requiredIndicators: [],
    dependencies: ['signal-aggregator']
  },
  
  'alert-prioritization': {
    id: 'alert-prioritization',
    name: 'Alert Prioritization Engine',
    pillar: 4,
    priority: 90,
    updateInterval: 60000,
    requiredIndicators: [],
    dependencies: [] // Can access all engines
  },
  
  'narrative-generator': {
    id: 'narrative-generator',
    name: 'Narrative Generator',
    pillar: 4,
    priority: 85,
    updateInterval: 300000,
    requiredIndicators: [],
    dependencies: ['signal-aggregator', 'regime-allocator']
  },
  
  'master-control': {
    id: 'master-control',
    name: 'Master Control Engine',
    pillar: 4,
    priority: 100,
    updateInterval: 300000,
    requiredIndicators: [],
    dependencies: ['narrative-generator', 'alert-prioritization']
  },

  // ADDITIONAL ENGINES FOR COMPLETENESS
  'trend-quality': {
    id: 'trend-quality',
    name: 'Trend Quality Engine',
    pillar: 2,
    priority: 60,
    updateInterval: 300000,
    requiredIndicators: ['SPX', 'ADX', 'RSI'],
    dependencies: ['enhanced-momentum']
  },
  
  'shadow-banking': {
    id: 'shadow-banking',
    name: 'Shadow Banking Monitor',
    pillar: 1,
    priority: 65,
    updateInterval: 600000,
    requiredIndicators: ['REPO_MARKET', 'MMF_ASSETS'],
    dependencies: ['credit-stress']
  },
  
  'behavioral-pattern': {
    id: 'behavioral-pattern',
    name: 'Behavioral Pattern Engine',
    pillar: 3,
    priority: 55,
    updateInterval: 600000,
    requiredIndicators: ['SENTIMENT_INDICATORS'],
    dependencies: ['sentiment-divergence']
  }
};

// UTILITY FUNCTIONS
export const getEngineById = (id: string): EngineConfig | undefined => {
  return ENGINE_REGISTRY[id];
};

export const getEnginesByPillar = (pillar: number): EngineConfig[] => {
  return Object.values(ENGINE_REGISTRY).filter(engine => engine.pillar === pillar);
};

export const getEngineExecutionTier = (engineId: string): number => {
  for (let tier = 0; tier < ENGINE_EXECUTION_ORDER.length; tier++) {
    if (ENGINE_EXECUTION_ORDER[tier].includes(engineId)) {
      return tier;
    }
  }
  return -1;
};

export const getEnginesPriority = (): EngineConfig[] => {
  return Object.values(ENGINE_REGISTRY).sort((a, b) => b.priority - a.priority);
};

export const validateEngineConfig = (config: EngineConfig): boolean => {
  return !!(
    config.id &&
    config.name &&
    typeof config.pillar === 'number' &&
    typeof config.priority === 'number' &&
    typeof config.updateInterval === 'number' &&
    Array.isArray(config.requiredIndicators)
  );
};

// ENGINE STATUS TRACKING
export interface EngineStatus {
  id: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  lastUpdate: number;
  performance: {
    avgCalculationTime: number;
    successRate: number;
    dataQuality: number;
  };
  alerts: number;
}

export const createDefaultEngineStatus = (engineId: string): EngineStatus => ({
  id: engineId,
  status: 'offline',
  lastUpdate: 0,
  performance: {
    avgCalculationTime: 0,
    successRate: 0,
    dataQuality: 0
  },
  alerts: 0
});

// PILLAR ORGANIZATION
export const PILLAR_NAMES = {
  0: 'Foundation Layer',
  1: 'Liquidity Intelligence', 
  2: 'Network & Market Structure',
  3: 'Economic Context',
  4: 'Synthesis & Intelligence'
};

export const getPillarName = (pillar: number): string => {
  return PILLAR_NAMES[pillar as keyof typeof PILLAR_NAMES] || 'Unknown';
};

// DEPENDENCY VALIDATION  
export const validateDependencies = (): string[] => {
  const errors: string[] = [];
  
  Object.values(ENGINE_REGISTRY).forEach(engine => {
    if (engine.dependencies) {
      engine.dependencies.forEach(depId => {
        if (!ENGINE_REGISTRY[depId]) {
          errors.push(`Engine ${engine.id} depends on non-existent engine: ${depId}`);
        }
      });
    }
  });
  
  return errors;
};

export const getEngineWithoutCircularDeps = (): EngineConfig[] => {
  // Simple topological sort to detect circular dependencies
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const sorted: EngineConfig[] = [];
  
  const visit = (engineId: string): boolean => {
    if (visiting.has(engineId)) return false; // Circular dependency
    if (visited.has(engineId)) return true;
    
    visiting.add(engineId);
    
    const engine = ENGINE_REGISTRY[engineId];
    if (engine?.dependencies) {
      for (const depId of engine.dependencies) {
        if (!visit(depId)) return false;
      }
    }
    
    visiting.delete(engineId);
    visited.add(engineId);
    sorted.push(engine);
    
    return true;
  };
  
  Object.keys(ENGINE_REGISTRY).forEach(engineId => {
    if (!visited.has(engineId)) {
      visit(engineId);
    }
  });
  
  return sorted;
};