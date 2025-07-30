/**
 * Engine Orchestration Service
 * Coordinates execution of all engines across tiers with proper dependency management
 */

import { IEngine, EngineReport } from '@/types/engines';
import { EngineRegistry } from '@/engines/EngineRegistry';
import { EngineOrchestrator } from '@/engines/EngineOrchestrator';
import { CONFIG } from '@/config';

export interface ExecutionPlan {
  tier: number;
  engines: string[];
  dependencies: string[];
}

export interface OrchestrationState {
  isExecuting: boolean;
  currentTier: number;
  totalEngines: number;
  completedEngines: number;
  failedEngines: number;
  startTime?: Date;
  estimatedCompletion?: Date;
}

class EngineOrchestrationService {
  private static instance: EngineOrchestrationService;
  private registry: EngineRegistry;
  private orchestrator: EngineOrchestrator;
  private state: OrchestrationState;
  private subscribers: ((state: OrchestrationState) => void)[] = [];

  private constructor() {
    this.registry = EngineRegistry.getInstance();
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
      isExecuting: false,
      currentTier: 0,
      totalEngines: 0,
      completedEngines: 0,
      failedEngines: 0,
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
    if (this.state.isExecuting) {
      throw new Error('Engine pipeline is already executing');
    }

    this.updateState({
      isExecuting: true,
      currentTier: 0,
      startTime: new Date(),
      totalEngines: this.registry.getAllMetadata().length,
      completedEngines: 0,
      failedEngines: 0,
    });

    try {
      // Execute in order: Foundation -> Pillar 1 -> Pillar 2 -> Pillar 3 -> Synthesis -> Execution
      const results = new Map<string, any>();

      // Tier 0: Foundation
      await this.executeTier('foundation', results);
      
      // Tiers 1-3: Core Pillars (can run in parallel)
      await Promise.all([
        this.executeTier('pillar1', results),
        this.executeTier('pillar2', results),
        this.executeTier('pillar3', results),
      ]);

      // Tier 4: Synthesis (depends on pillars)
      await this.executeTier('synthesis', results);

      // Tier 5: Execution (final insights)
      await this.executeTier('execution', results);

      this.updateState({
        isExecuting: false,
        currentTier: 5,
      });

      return results;
    } catch (error) {
      this.updateState({
        isExecuting: false,
      });
      throw error;
    }
  }

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
    return this.orchestrator.executeByPillar(pillar);
  }

  async executeEngine(engineId: string): Promise<any> {
    const result = await this.orchestrator.executeEngine(engineId);
    return result;
  }

  getState(): OrchestrationState {
    return { ...this.state };
  }

  subscribe(callback: (state: OrchestrationState) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private updateState(updates: Partial<OrchestrationState>): void {
    this.state = { ...this.state, ...updates };
    this.subscribers.forEach(callback => callback(this.state));
  }

  getEngineStatus(): { total: number; running: number; completed: number; failed: number } {
    return this.orchestrator.getExecutionStatus();
  }

  getAllResults(): Map<string, any> {
    return this.orchestrator.getAllResults();
  }
}

export default EngineOrchestrationService;