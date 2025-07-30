/**
 * Foundation Data Integrity Engine V6
 * Main entry point for the foundation-tier data integrity system
 */

export { DataIntegrityEngine } from './DataIntegrityEngine';
export { DataIntegrityDashboardTile } from './DashboardTile';
export { DataIntegrityIntelligenceView } from './IntelligenceView';

export type { 
  DataIntegrityMetrics,
  DataIntegrityConfig,
  ValidationResult,
  SourceHealth 
} from './types';