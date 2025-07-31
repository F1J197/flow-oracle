/**
 * Foundation Enhanced Momentum Engine V6
 * Main entry point for the foundation-tier momentum analysis system
 */

// Export the new V6 implementation
export { EnhancedMomentumEngineV6 as EnhancedMomentumEngine } from './EnhancedMomentumEngineV6';

// Backward compatibility exports
export { MasterPromptEnhancedMomentumEngine } from './MasterPromptEnhancedMomentumEngine';
export { EnhancedMomentumDashboardTile } from './DashboardTile';
export { EnhancedMomentumIntelligenceView } from './IntelligenceView';

// V6 specification-compliant components  
export { EnhancedMomentumTile } from './components/DashboardTile';
export { EnhancedMomentumIntelligenceView as EnhancedMomentumIntelligenceViewV6 } from './components/IntelligenceView';

export type { 
  MomentumMetrics,
  MomentumConfig,
  MomentumCalculation,
  MultiscaleMomentum,
  CompositeMomentumScore,
  MomentumAlert 
} from './types';