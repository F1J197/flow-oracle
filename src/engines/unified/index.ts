/**
 * Unified Engine Examples - V6 Implementation
 * Examples and template engines using the UnifiedBaseEngine system
 */

export { UnifiedNetLiquidityEngine } from './UnifiedNetLiquidityEngine';

// Re-export base types for convenience
export type { 
  UnifiedEngineConfig,
  UnifiedEngineState,
  EngineMetrics
} from '../base/UnifiedBaseEngine';

export type {
  UnifiedEngineMetadata,
  RegistryConfig,
  ExecutionContext
} from '../base/UnifiedEngineRegistry';

export type {
  OrchestratorConfig,
  SystemHealth,
  ExecutionPlan,
  ExecutionPhase
} from '../base/UnifiedEngineOrchestrator';