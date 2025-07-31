/**
 * Foundation Data Integrity Engine V6
 * Main entry point for the foundation-tier data integrity system
 */

export { DataIntegrityEngine } from './DataIntegrityEngine';
export { MasterPromptDataIntegrityEngine } from './MasterPromptDataIntegrityEngine';
export { MasterPromptDataIntegrityEngineV2 } from './MasterPromptDataIntegrityEngineV2';
export { DataIntegrityDashboardTile } from './DashboardTile';
export { DataIntegrityIntelligenceView } from './IntelligenceView';

export type { 
  DataIntegrityMetrics,
  DataIntegrityConfig,
  ValidationResult,
  SourceHealth 
} from './types';