/**
 * Master Prompts Engine Registry - V6 Implementation
 * Unified registry supporting both original and evolved engine patterns
 */

import { BrowserEventEmitter } from '@/utils/BrowserEventEmitter';
import { IEngine, EngineReport } from '@/types/engines';
import { MasterPromptBaseEngine } from './MasterPromptBaseEngine';
import { UnifiedEngineRegistry } from './UnifiedEngineRegistry';
import { EngineRegistry } from '../EngineRegistry';

export interface MasterPromptsRegistryConfig {
  autoStart: boolean;
  refreshInterval: number;
  maxConcurrentEngines: number;
  enableLegacySupport: boolean;
  globalTimeout: number;
}

export interface EngineExecutionContext {
  engineId: string;
  startTime: number;
  dependencies: string[];
  phase: 'foundation' | 'core' | 'synthesis' | 'execution';
}

export interface RegistryMetrics {
  totalEngines: number;
  activeEngines: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  systemHealth: number;
}

/**
 * Unified Engine Registry - Master Prompts Compliant
 * Supports both original EventEmitter pattern and modern unified engines
 */
export class MasterPromptsEngineRegistry extends BrowserEventEmitter {
  private static instance: MasterPromptsEngineRegistry;
  
  private config: MasterPromptsRegistryConfig;
  private masterPromptEngines: Map<string, MasterPromptBaseEngine> = new Map();
  private unifiedRegistry: UnifiedEngineRegistry;
  private legacyRegistry: EngineRegistry;
  
  private executionContext: Map<string, EngineExecutionContext> = new Map();
  private results: Map<string, EngineReport> = new Map();
  private metrics: RegistryMetrics;
  
  private isExecuting = false;
  private subscribers: Set<(results: Map<string, EngineReport>) => void> = new Set();

  private constructor(config: Partial<MasterPromptsRegistryConfig> = {}) {
    super();
    
    this.config = {
      autoStart: true,
      refreshInterval: 15000,
      maxConcurrentEngines: 10,
      enableLegacySupport: true,
      globalTimeout: 120000,
      ...config
    };

    this.unifiedRegistry = UnifiedEngineRegistry.getInstance();
    this.legacyRegistry = EngineRegistry.getInstance();
    
    this.metrics = {
      totalEngines: 0,
      activeEngines: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      systemHealth: 1.0
    };

    this.setupEventListeners();
  }

  static getInstance(config?: Partial<MasterPromptsRegistryConfig>): MasterPromptsEngineRegistry {
    if (!MasterPromptsEngineRegistry.instance) {
      MasterPromptsEngineRegistry.instance = new MasterPromptsEngineRegistry(config);
    }
    return MasterPromptsEngineRegistry.instance;
  }

  /**
   * Register Master Prompt compliant engine
   */
  registerMasterPromptEngine(engine: MasterPromptBaseEngine): void {
    this.masterPromptEngines.set(engine.id, engine);
    this.updateMetrics();
    
    // Setup engine event listeners
    engine.on('execution:start', (data) => {
      this.executionContext.set(engine.id, {
        engineId: engine.id,
        startTime: data.timestamp,
        dependencies: [],
        phase: this.getPhaseFromCategory(engine.category)
      });
      this.emit('engine:start', data);
    });

    engine.on('execution:success', (data) => {
      this.results.set(engine.id, data.report);
      this.metrics.successfulExecutions++;
      this.emit('engine:success', data);
    });

    engine.on('execution:error', (data) => {
      this.metrics.failedExecutions++;
      this.emit('engine:error', data);
    });

    this.emit('engine:registered', { engineId: engine.id, type: 'master-prompt' });
    console.log(`Master Prompt Engine registered: ${engine.name} (${engine.id})`);
  }

  /**
   * Register unified engine (modern pattern)
   */
  registerUnifiedEngine(engine: IEngine, metadata?: any): void {
    this.unifiedRegistry.register(engine, metadata);
    this.updateMetrics();
    this.emit('engine:registered', { engineId: engine.id, type: 'unified' });
  }

  /**
   * Register legacy engine (backward compatibility)
   */
  registerLegacyEngine(engine: IEngine, metadata?: any): void {
    if (this.config.enableLegacySupport) {
      this.legacyRegistry.register(engine, metadata);
      this.updateMetrics();
      this.emit('engine:registered', { engineId: engine.id, type: 'legacy' });
    }
  }

  /**
   * Execute all engines across all registries
   */
  async executeAll(): Promise<Map<string, EngineReport>> {
    if (this.isExecuting) {
      this.emit('warning', 'Registry is already executing');
      return new Map(this.results);
    }

    this.isExecuting = true;
    this.emit('execution:start', { timestamp: Date.now() });

    try {
      const allResults = new Map<string, EngineReport>();

      // Execute Master Prompt engines (Phase-based)
      const masterPromptResults = await this.executeMasterPromptEngines();
      masterPromptResults.forEach((result, engineId) => {
        allResults.set(engineId, result);
      });

      // Execute Unified engines
      const unifiedResults = await this.unifiedRegistry.executeAll();
      unifiedResults.forEach((result, engineId) => {
        allResults.set(engineId, result);
      });

      // Execute Legacy engines (if enabled)
      if (this.config.enableLegacySupport) {
        const legacyResults = await this.legacyRegistry.executeAll();
        legacyResults.forEach((result, engineId) => {
          allResults.set(engineId, result);
        });
      }

      this.results = allResults;
      this.notifySubscribers();
      this.emit('execution:complete', { 
        totalEngines: allResults.size,
        results: allResults 
      });

      return allResults;

    } catch (error) {
      this.emit('execution:error', { error });
      throw error;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Execute Master Prompt engines by phase
   */
  private async executeMasterPromptEngines(): Promise<Map<string, EngineReport>> {
    const results = new Map<string, EngineReport>();
    const phases: Array<'foundation' | 'core' | 'synthesis' | 'execution'> = 
      ['foundation', 'core', 'synthesis', 'execution'];

    for (const phase of phases) {
      const phaseEngines = Array.from(this.masterPromptEngines.values())
        .filter(engine => this.getPhaseFromCategory(engine.category) === phase)
        .sort((a, b) => a.priority - b.priority);

      this.emit('phase:start', { phase, engineCount: phaseEngines.length });

      // Execute phase engines in parallel (with concurrency limit)
      const phaseResults = await this.executeEnginesInPhase(phaseEngines);
      phaseResults.forEach((result, engineId) => {
        results.set(engineId, result);
      });

      this.emit('phase:complete', { phase, results: phaseResults });
    }

    return results;
  }

  /**
   * Execute engines within a phase with concurrency control
   */
  private async executeEnginesInPhase(engines: MasterPromptBaseEngine[]): Promise<Map<string, EngineReport>> {
    const results = new Map<string, EngineReport>();
    const executing = new Set<Promise<void>>();

    for (const engine of engines) {
      // Wait if we've hit the concurrency limit
      if (executing.size >= this.config.maxConcurrentEngines) {
        await Promise.race(executing);
      }

      const execution = engine.execute()
        .then(result => {
          results.set(engine.id, result);
        })
        .catch(error => {
          console.error(`Engine ${engine.id} failed:`, error);
          // Create error report
          results.set(engine.id, {
            success: false,
            confidence: 0,
            signal: 'neutral',
            data: {},
            errors: [error.message],
            lastUpdated: new Date()
          });
        })
        .finally(() => {
          executing.delete(execution);
        });

      executing.add(execution);
    }

    // Wait for all remaining executions
    await Promise.all(executing);
    return results;
  }

  /**
   * Get engine by ID from any registry
   */
  getEngine(engineId: string): IEngine | MasterPromptBaseEngine | null {
    // Check Master Prompt engines first
    const masterPromptEngine = this.masterPromptEngines.get(engineId);
    if (masterPromptEngine) return masterPromptEngine;

    // Check Unified registry
    const unifiedEngine = this.unifiedRegistry.getEngine(engineId);
    if (unifiedEngine) return unifiedEngine;

    // Check Legacy registry
    if (this.config.enableLegacySupport) {
      return this.legacyRegistry.getEngine(engineId);
    }

    return null;
  }

  /**
   * Subscribe to execution results
   */
  subscribe(callback: (results: Map<string, EngineReport>) => void): () => void {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Get current metrics
   */
  getMetrics(): RegistryMetrics {
    return { ...this.metrics };
  }

  /**
   * Get execution results
   */
  getResults(): Map<string, EngineReport> {
    return new Map(this.results);
  }

  /**
   * Check if registry is currently executing
   */
  isExecutionInProgress(): boolean {
    return this.isExecuting;
  }

  /**
   * Private helper methods
   */
  private getPhaseFromCategory(category: string): 'foundation' | 'core' | 'synthesis' | 'execution' {
    switch (category) {
      case 'foundation': return 'foundation';
      case 'core': return 'core';
      case 'synthesis': return 'synthesis';
      case 'execution': return 'execution';
      default: return 'core';
    }
  }

  private updateMetrics(): void {
    this.metrics.totalEngines = 
      this.masterPromptEngines.size + 
      1 + // Unified registry engines count placeholder
      (this.config.enableLegacySupport ? this.legacyRegistry.getAllMetadata().length : 0);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(new Map(this.results));
      } catch (error) {
        console.error('Error in registry subscriber:', error);
      }
    });
  }

  private setupEventListeners(): void {
    // Setup global event listeners for system health monitoring
    this.on('engine:error', () => {
      this.updateSystemHealth();
    });

    this.on('engine:success', () => {
      this.updateSystemHealth();
    });
  }

  private updateSystemHealth(): void {
    const total = this.metrics.successfulExecutions + this.metrics.failedExecutions;
    if (total > 0) {
      this.metrics.systemHealth = this.metrics.successfulExecutions / total;
    }
  }
}