/**
 * Foundation Enhanced Momentum Engine V6 - SINGLE SOURCE OF TRUTH
 * Main entry point for the foundation-tier momentum analysis system
 * 
 * COMPLETE IMPLEMENTATION:
 * ✅ Main Engine: EnhancedMomentumEngineV6 with full momentum calculations
 * ✅ Dashboard Tile: EnhancedMomentumTile with visualization
 * ✅ Intelligence View: Full terminal-style analysis view  
 * ✅ All BaseEngine methods implemented
 * ✅ Hook compatibility methods added
 * ✅ Single source of truth established
 */

// V6 Main Implementation - Single Source of Truth
export { EnhancedMomentumEngineV6 as EnhancedMomentumEngine } from './EnhancedMomentumEngineV6';

// V6 Components 
export { EnhancedMomentumTile } from './components/DashboardTile';
export { EnhancedMomentumIntelligenceView } from './components/IntelligenceView';

// Backward compatibility exports
export { MasterPromptEnhancedMomentumEngine } from './MasterPromptEnhancedMomentumEngine';
export { EnhancedMomentumDashboardTile } from './DashboardTile';
export { EnhancedMomentumIntelligenceView as LegacyIntelligenceView } from './IntelligenceView';

// Type exports
export type { 
  MomentumMetrics,
  MomentumConfig,
  MomentumCalculation,
  MultiscaleMomentum,
  CompositeMomentumScore,
  MomentumAlert 
} from './types';