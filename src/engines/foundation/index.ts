/**
 * Foundation Tier Engines
 * Core data processing and validation engines that other engines depend on
 */

// Enhanced Z-Score Engine - Foundation Tier
export * from './EnhancedZScoreEngine';

// Keep legacy engine for backward compatibility  
// Legacy export removed - EnhancedZScoreEngineV6 has been replaced by EnhancedZScoreEngine

// Re-export types for foundation engines
export type { EngineReport, ActionableInsight, DashboardTileData } from '@/types/engines';
export type { DataIntegrityMetrics, SourceHealth } from './DataIntegrityEngine';