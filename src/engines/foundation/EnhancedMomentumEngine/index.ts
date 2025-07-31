/**
 * Foundation Enhanced Momentum Engine V6
 * Main entry point for the foundation-tier momentum analysis system
 */

export { EnhancedMomentumEngine } from './EnhancedMomentumEngine';
export { MasterPromptEnhancedMomentumEngine } from './MasterPromptEnhancedMomentumEngine';
export { EnhancedMomentumDashboardTile } from './DashboardTile';
export { EnhancedMomentumIntelligenceView } from './IntelligenceView';

// Specification-compliant components (V6)
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