/**
 * Engine Orchestration Service - V6 Enhanced Implementation
 * Coordinates engine execution with both legacy and unified registry systems
 */

import { IEngine, EngineReport } from '@/types/engines';
import { EngineRegistry } from '@/engines/EngineRegistry';
import { UnifiedEngineRegistry } from '@/engines/base/UnifiedEngineRegistry';
import { EngineOrchestrator } from '@/engines/EngineOrchestrator';
import type { UnifiedEngineMetadata, ExecutionContext } from '@/engines/base/UnifiedEngineRegistry';
import { CONFIG } from '@/config';

export interface ExecutionPlan {
  tier: number;
  engines: string[];
  dependencies: string[];
}

export interface OrchestrationState {
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentTier: string;
  totalEngines: number;
  completedEngines: number;
  failedEngines: number;
  runningEngines: number;
  results: Map<string, any>;
  startTime?: Date;
  endTime?: Date;
  errors: string[];
  // Legacy compatibility
  isExecuting?: boolean;
  estimatedCompletion?: Date;
}

class EngineOrchestrationService {
  private static instance: EngineOrchestrationService;
  private registry: EngineRegistry;
  private unifiedRegistry: UnifiedEngineRegistry;
  private orchestrator: EngineOrchestrator;
  private state: OrchestrationState;
  private subscribers: Set<(state: OrchestrationState) => void> = new Set();

  private constructor() {
    this.registry = EngineRegistry.getInstance();
    this.unifiedRegistry = UnifiedEngineRegistry.getInstance();
    this.orchestrator = new EngineOrchestrator({
      maxConcurrentEngines: CONFIG.ENGINES.MAX_CONCURRENT,
      globalTimeout: CONFIG.ENGINES.TIMEOUT,
      retryPolicy: {
        maxRetries: CONFIG.ENGINES.RETRY_ATTEMPTS,
        backoffMultiplier: 1.5,
        baseDelay: 1000,
      }
    });

    this.state = {
      status: 'idle',
      currentTier: '',
      totalEngines: 0,
      completedEngines: 0,
      failedEngines: 0,
      runningEngines: 0,
      results: new Map(),
      errors: [],
      // Legacy compatibility
      isExecuting: false,
    };

    this.initializeEngines();
  }

  static getInstance(): EngineOrchestrationService {
    if (!EngineOrchestrationService.instance) {
      EngineOrchestrationService.instance = new EngineOrchestrationService();
    }
    return EngineOrchestrationService.instance;
  }

  private initializeEngines(): void {
    // Register engines with the orchestrator - will be done when engines are registered
    // This is handled by the registry automatically
  }

  async executeFullPipeline(): Promise<Map<string, any>> {
    if (this.state.status === 'running') {
      throw new Error('Engine pipeline is already executing');
    }

    console.log('🚀 Starting full engine pipeline execution (V6 Enhanced)...');
    
    this.updateState({
      status: 'running',
      isExecuting: true,
      startTime: new Date(),
      currentTier: 'foundation',
      totalEngines: this.unifiedRegistry.getAllMetadata().length,
      completedEngines: 0,
      failedEngines: 0,
      runningEngines: 0,
      results: new Map(),
      errors: []
    });

    try {
      // Execute tiers in order using unified registry: Foundation → Core → Synthesis → Execution
      const allResults = new Map<string, any>();
      const tiers = ['foundation', 'core', 'synthesis', 'execution'] as const;
      
      for (const tier of tiers) {
        console.log(`📊 Executing ${tier} tier...`);
        this.updateState({ currentTier: tier });
        
        const tierResults = await this.executeTierUnified(tier, allResults);
        
        // Merge results
        tierResults.forEach((result, engineId) => {
          allResults.set(engineId, result);
        });
        
        console.log(`✅ ${tier} tier completed with ${tierResults.size} engines`);
      }

      this.updateState({
        status: 'completed',
        isExecuting: false,
        endTime: new Date(),
        results: allResults,
        runningEngines: 0
      });

      console.log(`🎯 Pipeline execution completed: ${allResults.size} engines executed`);
      return allResults;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.updateState({
        status: 'failed',
        isExecuting: false,
        endTime: new Date(),
        errors: [...this.state.errors, errorMessage],
        runningEngines: 0
      });

      console.error('❌ Pipeline execution failed:', error);
      throw error;
    }
  }

  /**
   * Execute engines for a specific tier using unified registry
   */
  private async executeTierUnified(category: 'foundation' | 'core' | 'synthesis' | 'execution', previousResults: Map<string, any>): Promise<Map<string, any>> {
    const context: ExecutionContext = {
      category,
      parallel: true // Execute engines in parallel within the same tier
    };

    try {
      const results = await this.unifiedRegistry.executeAll(context);
      
      // Update state
      const executionStatus = this.unifiedRegistry.getExecutionStatus();
      this.updateState({
        completedEngines: executionStatus.completed,
        failedEngines: executionStatus.failed,
        runningEngines: executionStatus.running
      });

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to execute ${category} tier:`, error);
      
      this.updateState({
        errors: [...this.state.errors, `${category}: ${errorMessage}`],
        failedEngines: this.state.failedEngines + 1
      });
      
      throw error;
    }
  }

  /**
   * Legacy tier execution method for backward compatibility
   */
  private async executeTier(category: string, results: Map<string, any>): Promise<void> {
    const tierEngines = this.registry.getEnginesByCategory(category as any);
    
    if (tierEngines.length === 0) {
      console.warn(`No engines found for category: ${category}`);
      return;
    }

    try {
      const tierResults = await this.registry.executeByCategory(category as any);
      
      // Merge results
      tierResults.forEach((result, engineId) => {
        results.set(engineId, result);
        if (result.success) {
          this.updateState({
            completedEngines: this.state.completedEngines + 1,
          });
        } else {
          this.updateState({
            failedEngines: this.state.failedEngines + 1,
          });
        }
      });
    } catch (error) {
      console.error(`Error executing tier ${category}:`, error);
      this.updateState({
        failedEngines: this.state.failedEngines + tierEngines.length,
      });
    }
  }

  async executeByPillar(pillar: 1 | 2 | 3): Promise<Map<string, any>> {
    console.log(`🎯 Executing engines for pillar ${pillar}...`);
    
    this.updateState({
      status: 'running',
      currentTier: `pillar-${pillar}`,
      startTime: new Date()
    });

    try {
      const results = await this.unifiedRegistry.executeByPillar(pillar);
      
      this.updateState({
        status: 'completed',
        endTime: new Date(),
        results: results
      });

      return results;
    } catch (error) {
      this.updateState({
        status: 'failed',
        endTime: new Date(),
        errors: [...this.state.errors, error instanceof Error ? error.message : 'Unknown error']
      });
      throw error;
    }
  }

  async executeEngine(engineId: string): Promise<any> {
    try {
      this.updateState({ runningEngines: this.state.runningEngines + 1 });
      
      const result = await this.unifiedRegistry.executeEngine(engineId);
      
      this.updateState({
        completedEngines: this.state.completedEngines + 1,
        runningEngines: Math.max(0, this.state.runningEngines - 1),
        results: new Map(this.state.results.set(engineId, result))
      });

      return result;
    } catch (error) {
      this.updateState({
        failedEngines: this.state.failedEngines + 1,
        runningEngines: Math.max(0, this.state.runningEngines - 1),
        errors: [...this.state.errors, `${engineId}: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
      throw error;
    }
  }

  getState(): OrchestrationState {
    return { ...this.state };
  }

  subscribe(callback: (state: OrchestrationState) => void): () => void {
    this.subscribers.add(callback);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private updateState(updates: Partial<OrchestrationState>): void {
    this.state = { ...this.state, ...updates };
    
    // Notify all subscribers
    this.subscribers.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Error in orchestration state subscriber:', error);
      }
    });
  }

  getEngineStatus(): { total: number; running: number; completed: number; failed: number } {
    return this.unifiedRegistry.getExecutionStatus();
  }

  getAllResults(): Map<string, any> {
    return new Map(this.state.results);
  }
}

export default EngineOrchestrationService;