/**
 * LIQUIDITY² Engine Registry - Central Configuration
 * Manages all 28 engines with dependency resolution
 */

import { EngineConfig } from '@/engines/BaseEngine';

export const ENGINE_REGISTRY: Record<string, EngineConfig> = {
  // ===== FOUNDATION LAYER (3 Engines) =====
  'data-integrity': {
    id: 'data-integrity',
    name: 'Data Integrity & Self-Healing',
    pillar: 0,
    priority: 100,
    updateInterval: 60000,
    requiredIndicators: ['VIX', 'SPX', 'DXY'],
    dependencies: []
  },
  
  'enhanced-zscore': {
    id: 'enhanced-zscore',
    name: 'Enhanced Z-Score Engine',
    pillar: 0,
    priority: 95,
    updateInterval: 300000,
    requiredIndicators: ['VIX', 'MOVE', 'DXY', 'BTCUSD'],
    dependencies: ['data-integrity']
  },
  
  'enhanced-momentum': {
    id: 'enhanced-momentum',
    name: 'Enhanced Momentum Engine',
    pillar: 1,
    priority: 85,
    updateInterval: 30000,
    requiredIndicators: ['*'],
    dependencies: []
  },

  'fed-balance-sheet': {
    id: 'fed-balance-sheet',
    name: 'Fed Balance Sheet Engine',
    pillar: 1,
    priority: 90,
    updateInterval: 300000,
    requiredIndicators: ['WALCL', 'WTREGEN', 'RRPONTSYD', 'SOFR', 'EFFR'],
    dependencies: []
  },

  'market-regime': {
    id: 'market-regime',
    name: 'Market Regime Engine',
    pillar: 2,
    priority: 85,
    updateInterval: 300000,
    requiredIndicators: ['VIX', 'SPX', 'BTCUSD', 'DXY', 'DGS10', 'WALCL'],
    dependencies: ['volatility-regime', 'enhanced-momentum']
  },

  'master-control': {
    id: 'master-control',
    name: 'Master Control Engine',
    pillar: 4,
    priority: 100,
    updateInterval: 60000,
    requiredIndicators: [],
    dependencies: ['enhanced-momentum', 'volatility-regime', 'net-liquidity', 'credit-stress', 'market-regime', 'signal-aggregator']
  },

  'funding-stress': {
    id: 'funding-stress',
    name: 'Funding Stress Engine',
    pillar: 1,
    priority: 80,
    updateInterval: 300000,
    requiredIndicators: ['SOFR', 'EFFR', 'DGS3MO', 'DGS10', 'BAMLH0A0HYM2'],
    dependencies: ['credit-stress']
  },

  'options-flow': {
    id: 'options-flow',
    name: 'Smart Money Options Flow',
    pillar: 2,
    priority: 75,
    updateInterval: 180000,
    requiredIndicators: ['VIX', 'VIX9D', 'VVIX', 'SPX'],
    dependencies: ['volatility-regime']
  },

  'business-cycle': {
    id: 'business-cycle',
    name: 'Business Cycle Engine',
    pillar: 3,
    priority: 70,
    updateInterval: 900000,
    requiredIndicators: ['DGS10', 'DGS3MO', 'SOFR', 'SPX', 'BTCUSD'],
    dependencies: ['market-regime', 'credit-stress']
  },

  'performance-attribution': {
    id: 'performance-attribution',
    name: 'Performance Attribution Engine',
    pillar: 4,
    priority: 60,
    updateInterval: 600000,
    requiredIndicators: [],
    dependencies: ['master-control', 'signal-aggregator', 'market-regime', 'enhanced-momentum', 'volatility-regime']
  },

  // ===== PILLAR 1: LIQUIDITY (7 Engines) =====
  'net-liquidity': {
    id: 'net-liquidity',
    name: 'Net Liquidity Gauge',
    pillar: 1,
    priority: 95,
    updateInterval: 300000,
    requiredIndicators: ['WALCL', 'WTREGEN', 'RRPONTSYD'],
    dependencies: ['data-integrity']
  },
  
  'credit-stress': {
    id: 'credit-stress',
    name: 'Credit Stress Engine',
    pillar: 1,
    priority: 85,
    updateInterval: 300000,
    requiredIndicators: ['BAMLH0A0HYM2', 'BAMLC0A0CM', 'DGS10'],
    dependencies: ['enhanced-zscore']
  },
  
  'volatility-regime': {
    id: 'volatility-regime',
    name: 'Volatility Regime Engine',
    pillar: 1,
    priority: 90,
    updateInterval: 300000,
    requiredIndicators: ['VIX', 'VIX9D', 'VVIX', 'REALIZED_VOL', 'MOVE', 'CVIX'],
    dependencies: []
  },
  
  'fed-liquidity': {
    id: 'fed-liquidity',
    name: 'Fed Liquidity Monitor',
    pillar: 1,
    priority: 80,
    updateInterval: 900000,
    requiredIndicators: ['SOFR', 'EFFR', 'IORB'],
    dependencies: ['net-liquidity']
  },
  
  'treasury-operations': {
    id: 'treasury-operations',
    name: 'Treasury Operations Tracker',
    pillar: 1,
    priority: 75,
    updateInterval: 900000,
    requiredIndicators: ['WTREGEN', 'TREASURY_AUCTIONS'],
    dependencies: ['net-liquidity']
  },
  
  'dealer-positions': {
    id: 'dealer-positions',
    name: 'Primary Dealer Positions',
    pillar: 1,
    priority: 70,
    updateInterval: 900000,
    requiredIndicators: ['DEALER_NET', 'DEALER_GROSS'],
    dependencies: ['credit-stress']
  },
  
  'reverse-repo': {
    id: 'reverse-repo',
    name: 'Reverse Repo Operations',
    pillar: 1,
    priority: 65,
    updateInterval: 900000,
    requiredIndicators: ['RRPONTSYD', 'RRPONT_RATE'],
    dependencies: ['net-liquidity']
  },

  // ===== PILLAR 2: NETWORK & MARKET (6 Engines) =====

  'cusip-anomaly': {
    id: 'cusip-anomaly',
    name: 'CUSIP Anomaly Detection',
    pillar: 2,
    priority: 85,
    updateInterval: 600000,
    requiredIndicators: ['SOMA_HOLDINGS'],
    dependencies: ['data-integrity']
  },
  
  'stealth-qe': {
    id: 'stealth-qe',
    name: 'Stealth QE Detection',
    pillar: 2,
    priority: 90,
    updateInterval: 600000,
    requiredIndicators: ['SOMA_HOLDINGS', 'CUSIP_FLOWS'],
    dependencies: ['cusip-anomaly']
  },
  
  'market-structure': {
    id: 'market-structure',
    name: 'Market Microstructure',
    pillar: 2,
    priority: 75,
    updateInterval: 60000,
    requiredIndicators: ['ORDERBOOK', 'VOLUME_PROFILE'],
    dependencies: ['volatility-regime']
  },
  
  'cross-asset': {
    id: 'cross-asset',
    name: 'Cross-Asset Correlation',
    pillar: 2,
    priority: 70,
    updateInterval: 300000,
    requiredIndicators: ['SPX', 'BTCUSD', 'DXY', 'DGS10'],
    dependencies: ['enhanced-momentum']
  },
  
  'fx-swaps': {
    id: 'fx-swaps',
    name: 'FX Swap Monitor',
    pillar: 2,
    priority: 65,
    updateInterval: 900000,
    requiredIndicators: ['FXSWAP_USD', 'FXSWAP_EUR'],
    dependencies: ['fed-liquidity']
  },
  
  'global-liquidity': {
    id: 'global-liquidity',
    name: 'Global CB Coordination',
    pillar: 2,
    priority: 80,
    updateInterval: 3600000,
    requiredIndicators: ['ECB_ASSETS', 'BOJ_ASSETS', 'PBOC_ASSETS'],
    dependencies: ['net-liquidity']
  },

  // ===== PILLAR 3: ECONOMIC CONTEXT (3 Engines) =====
  'macro-regime': {
    id: 'macro-regime',
    name: 'Macro Regime Classification',
    pillar: 3,
    priority: 75,
    updateInterval: 3600000,
    requiredIndicators: ['ISM_PMI', 'CPI', 'UNEMPLOYMENT'],
    dependencies: ['enhanced-zscore']
  },
  
  'cycle-position': {
    id: 'cycle-position',
    name: 'Economic Cycle Positioning',
    pillar: 3,
    priority: 70,
    updateInterval: 3600000,
    requiredIndicators: ['GDP_NOWCAST', 'YIELD_CURVE'],
    dependencies: ['macro-regime']
  },
  
  'geopolitical': {
    id: 'geopolitical',
    name: 'Geopolitical Risk Monitor',
    pillar: 3,
    priority: 65,
    updateInterval: 3600000,
    requiredIndicators: ['VIX_NEWS', 'SAFE_HAVEN_FLOWS'],
    dependencies: ['volatility-regime']
  },

  // ===== SYNTHESIS LAYER (9 Engines) =====
  'signal-aggregator': {
    id: 'signal-aggregator',
    name: 'Signal Aggregator',
    pillar: 4,
    priority: 100,
    updateInterval: 300000,
    requiredIndicators: [],
    dependencies: [
      'enhanced-momentum',
      'volatility-regime',
      'net-liquidity',
      'credit-stress',
      'stealth-qe'
    ]
  },
  
  'regime-classifier': {
    id: 'regime-classifier',
    name: 'AI Regime Classifier',
    pillar: 4,
    priority: 95,
    updateInterval: 600000,
    requiredIndicators: [],
    dependencies: [
      'volatility-regime',
      'macro-regime',
      'credit-stress',
      'net-liquidity'
    ]
  },
  
  'risk-allocator': {
    id: 'risk-allocator',
    name: 'Dynamic Risk Allocator',
    pillar: 4,
    priority: 90,
    updateInterval: 900000,
    requiredIndicators: [],
    dependencies: [
      'signal-aggregator',
      'volatility-regime',
      'cross-asset'
    ]
  },
  
  'position-sizer': {
    id: 'position-sizer',
    name: 'Kelly Position Sizer',
    pillar: 4,
    priority: 85,
    updateInterval: 900000,
    requiredIndicators: [],
    dependencies: [
      'signal-aggregator',
      'volatility-regime'
    ]
  },
  
  'execution-engine': {
    id: 'execution-engine',
    name: 'Execution Engine',
    pillar: 4,
    priority: 80,
    updateInterval: 60000,
    requiredIndicators: [],
    dependencies: [
      'market-structure',
      'volatility-regime'
    ]
  },
  
  'alert-engine': {
    id: 'alert-engine',
    name: 'Alert Prioritization',
    pillar: 4,
    priority: 75,
    updateInterval: 300000,
    requiredIndicators: [],
    dependencies: [
      'signal-aggregator',
      'stealth-qe',
      'credit-stress'
    ]
  },
  
  'tail-risk': {
    id: 'tail-risk',
    name: 'Tail Risk Engine',
    pillar: 4,
    priority: 70,
    updateInterval: 3600000,
    requiredIndicators: [],
    dependencies: [
      'signal-aggregator',
      'regime-classifier'
    ]
  },
  
  'predictive-engine': {
    id: 'predictive-engine',
    name: 'Apex Predictive Engine',
    pillar: 4,
    priority: 95,
    updateInterval: 900000,
    requiredIndicators: [],
    dependencies: [
      'signal-aggregator',
      'regime-classifier',
      'macro-regime',
      'volatility-regime'
    ]
  },
  
  'narrative-generator': {
    id: 'narrative-generator',
    name: 'Narrative Generator',
    pillar: 4,
    priority: 65,
    updateInterval: 1800000,
    requiredIndicators: [],
    dependencies: [
      'signal-aggregator',
      'regime-classifier',
      'alert-engine'
    ]
  }
};

// Execution order for dependency resolution
export const ENGINE_EXECUTION_ORDER = [
  // TIER 1: Foundation & No dependencies
  [
    'data-integrity',
    'volatility-regime',
    'market-structure',
    'geopolitical'
  ],
  
  // TIER 2: Depends on Tier 1
  [
    'enhanced-zscore',
    'net-liquidity',
    'cusip-anomaly'
  ],
  
  // TIER 3: Depends on Tiers 1-2
  [
    'enhanced-momentum',
    'credit-stress',
    'fed-liquidity',
    'treasury-operations',
    'stealth-qe',
    'cross-asset',
    'macro-regime'
  ],
  
  // TIER 4: Depends on Tiers 1-3
  [
    'dealer-positions',
    'reverse-repo',
    'fx-swaps',
    'global-liquidity',
    'cycle-position'
  ],
  
  // TIER 5: Synthesis engines
  [
    'signal-aggregator',
    'regime-classifier',
    'execution-engine'
  ],
  
  // TIER 6: Final synthesis
  [
    'risk-allocator',
    'position-sizer',
    'alert-engine',
    'predictive-engine'
  ],
  
  // TIER 7: Analytics & Reporting
  [
    'performance-attribution',
    'narrative-generator'
  ]
];

export const getEnginesByPillar = (pillar: number): EngineConfig[] => {
  return Object.values(ENGINE_REGISTRY).filter(engine => engine.pillar === pillar);
};

export const getEngineConfig = (engineId: string): EngineConfig | undefined => {
  return ENGINE_REGISTRY[engineId];
};

export const validateEngineOrder = (): boolean => {
  const flatOrder = ENGINE_EXECUTION_ORDER.flat();
  const registryKeys = Object.keys(ENGINE_REGISTRY);
  
  return flatOrder.length === registryKeys.length &&
         flatOrder.every(id => registryKeys.includes(id));
};