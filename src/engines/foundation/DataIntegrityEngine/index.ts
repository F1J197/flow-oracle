/**
 * Foundation Data Integrity Engine V6
 * Main entry point for the foundation-tier data integrity system
 * SINGLE SOURCE OF TRUTH IMPLEMENTATION
 */

// Primary implementation - Use this for new code
export { DataIntegrityEngineV6 as DataIntegrityEngine } from './DataIntegrityEngineV6';
export { DataIntegrityEngineV6 } from './DataIntegrityEngineV6';

// Component exports
export { DataIntegrityTile } from './components/DashboardTile';
export { DataIntegrityIntelligenceView } from './components/IntelligenceView';

// Legacy compatibility exports - DEPRECATED
export { DataIntegrityEngine as LegacyDataIntegrityEngine } from './DataIntegrityEngine';
export { MasterPromptDataIntegrityEngine } from './MasterPromptDataIntegrityEngine';
export { MasterPromptDataIntegrityEngineV2 } from './MasterPromptDataIntegrityEngineV2';
export { DataIntegrityDashboardTile } from './DashboardTile';
export { DataIntegrityIntelligenceView as LegacyDataIntegrityIntelligenceView } from './IntelligenceView';

export type { 
  DataIntegrityMetrics,
  DataIntegrityConfig,
  ValidationResult,
  SourceHealth 
} from './types';