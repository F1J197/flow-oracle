/**
 * Base Engine System - V6 Implementation
 * Master Prompts compliant engine architecture
 */

// Master Prompt Base Engine (Original EventEmitter pattern)
export { MasterPromptBaseEngine } from './MasterPromptBaseEngine';
export { MasterPromptsEngineRegistry } from './MasterPromptsEngineRegistry';
export type { MasterPromptEngineConfig, MasterPromptEngineState } from './MasterPromptBaseEngine';

// Unified Modern Engine System
export { UnifiedBaseEngine } from './UnifiedBaseEngine';
export { UnifiedEngineRegistry } from './UnifiedEngineRegistry';
export { UnifiedEngineOrchestrator } from './UnifiedEngineOrchestrator';

// Enhanced Engine System (Backward compatibility)
export { EnhancedBaseEngine } from './EnhancedBaseEngine';

export type { 
  UnifiedEngineConfig,
  UnifiedEngineState,
  EngineMetrics
} from './UnifiedBaseEngine';

export type { 
  EnhancedEngineConfig, 
  EnhancedEngineState 
} from './EnhancedBaseEngine';

export type {
  UnifiedEngineMetadata,
  RegistryConfig,
  ExecutionContext
} from './UnifiedEngineRegistry';

export type {
  OrchestratorConfig,
  SystemHealth,
  ExecutionPlan,
  ExecutionPhase
} from './UnifiedEngineOrchestrator';