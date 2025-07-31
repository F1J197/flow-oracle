/**
 * LIQUIDITY² V6 - Enhanced Engine Registry
 * Phase 2: Engine System Architecture Modernization
 * 
 * Centralized registry for all 28 engines with pillar-based organization
 * Supports real-time updates, dependency management, and execution orchestration
 */

import { IEngine, EngineReport } from '@/types/engines';
import { EventEmitter } from 'events';

export interface EngineMetadata {
  id: string;
  name: string;
  pillar: 'foundation' | 'pillar1' | 'pillar2' | 'pillar3' | 'synthesis' | 'execution';
  priority: number;
  dependencies: string[];
  category: 'foundation' | 'core' | 'synthesis' | 'execution';
  description?: string;
  version?: string;
  enabled: boolean;
  lastExecution?: Date;
  averageExecutionTime?: number;
  successRate?: number;
}

export interface RegistryConfig {
  autoStart: boolean;
  refreshInterval: number;
  maxRetries: number;
  enableHealthChecks: boolean;
  healthCheckInterval: number;
  enableMetrics: boolean;
}

export interface ExecutionPlan {
  foundation: IEngine[];
  pillar1: IEngine[];
  pillar2: IEngine[];
  pillar3: IEngine[];
  synthesis: IEngine[];
  execution: IEngine[];
  totalEngines: number;
  estimatedExecutionTime: number;
}

export interface RegistryStatus {
  totalEngines: number;
  registeredEngines: number;
  enabledEngines: number;
  runningEngines: number;
  healthyEngines: number;
  avgExecutionTime: number;
  avgSuccessRate: number;
  lastFullExecution?: Date;
}

export class EnhancedEngineRegistry extends EventEmitter {
  private static instance: EnhancedEngineRegistry;
  
  private engines: Map<string, IEngine> = new Map();
  private metadata: Map<string, EngineMetadata> = new Map();
  private results: Map<string, EngineReport> = new Map();
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private executionQueue: string[] = [];
  private isExecuting = false;
  private config: RegistryConfig;
  private healthCheckTimer?: NodeJS.Timeout;
  private metricsTimer?: NodeJS.Timeout;

  private constructor(config: Partial<RegistryConfig> = {}) {
    super();
    this.config = {
      autoStart: false,
      refreshInterval: 15000,
      maxRetries: 3,
      enableHealthChecks: true,
      healthCheckInterval: 30000,
      enableMetrics: true,
      ...config
    };

    this.initializeMonitoring();
  }

  public static getInstance(config?: Partial<RegistryConfig>): EnhancedEngineRegistry {
    if (!EnhancedEngineRegistry.instance) {
      EnhancedEngineRegistry.instance = new EnhancedEngineRegistry(config);
    }
    return EnhancedEngineRegistry.instance;
  }

  // === ENGINE REGISTRATION ===
  public register(engine: IEngine, metadata?: Partial<EngineMetadata>): void {
    const engineMetadata: EngineMetadata = {
      id: engine.id || engine.constructor.name,
      name: engine.name || engine.constructor.name,
      pillar: (engine as any).pillar || 'foundation',
      priority: (engine as any).priority || 1,
      dependencies: (engine as any).dependencies || [],
      category: (engine as any).category || 'core',
      enabled: true,
      ...metadata
    };

    this.engines.set(engineMetadata.id, engine);
    this.metadata.set(engineMetadata.id, engineMetadata);

    this.emit('engine:registered', { 
      engineId: engineMetadata.id, 
      metadata: engineMetadata 
    });

    console.log(`[EnhancedEngineRegistry] Registered engine: ${engineMetadata.name} (${engineMetadata.pillar})`);
  }

  public unregister(engineId: string): boolean {
    const success = this.engines.delete(engineId) && this.metadata.delete(engineId);
    
    if (success) {
      this.results.delete(engineId);
      this.subscribers.delete(engineId);
      this.emit('engine:unregistered', { engineId });
      console.log(`[EnhancedEngineRegistry] Unregistered engine: ${engineId}`);
    }

    return success;
  }

  // === EXECUTION METHODS ===
  public async executeAll(): Promise<Map<string, EngineReport>> {
    const plan = this.createExecutionPlan();
    return this.executePlan(plan);
  }

  public async executeByPillar(pillar: keyof ExecutionPlan): Promise<Map<string, EngineReport>> {
    const engines = Array.from(this.engines.values()).filter(engine => {
      const metadata = this.metadata.get(engine.id || engine.constructor.name);
      return metadata?.pillar === pillar && metadata?.enabled;
    });

    return this.executeEngines(engines);
  }

  public async executeByCategory(category: EngineMetadata['category']): Promise<Map<string, EngineReport>> {
    const engines = Array.from(this.engines.values()).filter(engine => {
      const metadata = this.metadata.get(engine.id || engine.constructor.name);
      return metadata?.category === category && metadata?.enabled;
    });

    return this.executeEngines(engines);
  }

  public async executeEngine(engineId: string): Promise<EngineReport | null> {
    const engine = this.engines.get(engineId);
    const metadata = this.metadata.get(engineId);

    if (!engine || !metadata?.enabled) {
      console.warn(`[EnhancedEngineRegistry] Engine not found or disabled: ${engineId}`);
      return null;
    }

    const startTime = Date.now();
    
    try {
      this.emit('engine:execution:start', { engineId });
      
      const report = await engine.execute();
      const executionTime = Date.now() - startTime;

      // Update metadata
      metadata.lastExecution = new Date();
      metadata.averageExecutionTime = metadata.averageExecutionTime 
        ? (metadata.averageExecutionTime + executionTime) / 2
        : executionTime;

      // Store result
      this.results.set(engineId, report);

      // Notify subscribers
      this.notifySubscribers(engineId, report);

      this.emit('engine:execution:complete', { 
        engineId, 
        report, 
        executionTime 
      });

      return report;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`[EnhancedEngineRegistry] Engine execution failed: ${engineId}`, error);
      
      this.emit('engine:execution:error', { 
        engineId, 
        error: error.message, 
        executionTime 
      });

      return null;
    }
  }

  // === EXECUTION PLANNING ===
  private createExecutionPlan(): ExecutionPlan {
    const plan: ExecutionPlan = {
      foundation: [],
      pillar1: [],
      pillar2: [],
      pillar3: [],
      synthesis: [],
      execution: [],
      totalEngines: 0,
      estimatedExecutionTime: 0
    };

    for (const [engineId, engine] of this.engines) {
      const metadata = this.metadata.get(engineId);
      if (!metadata?.enabled) continue;

      const pillar = metadata.pillar;
      if (pillar in plan && Array.isArray(plan[pillar])) {
        (plan[pillar] as IEngine[]).push(engine);
        plan.totalEngines++;
        plan.estimatedExecutionTime += metadata.averageExecutionTime || 1000;
      }
    }

    // Sort by priority within each pillar
    Object.keys(plan).forEach(key => {
      if (Array.isArray(plan[key as keyof ExecutionPlan])) {
        (plan[key as keyof ExecutionPlan] as IEngine[]).sort((a, b) => {
          const metaA = this.metadata.get(a.id || a.constructor.name);
          const metaB = this.metadata.get(b.id || b.constructor.name);
          return (metaB?.priority || 0) - (metaA?.priority || 0);
        });
      }
    });

    return plan;
  }

  private async executePlan(plan: ExecutionPlan): Promise<Map<string, EngineReport>> {
    if (this.isExecuting) {
      console.warn('[EnhancedEngineRegistry] Execution already in progress');
      return new Map();
    }

    this.isExecuting = true;
    const allResults = new Map<string, EngineReport>();

    try {
      this.emit('execution:start', { plan });

      // Execute in order: foundation -> pillars (parallel) -> synthesis -> execution
      const foundationResults = await this.executeEngines(plan.foundation);
      this.mergeResults(allResults, foundationResults);

      // Execute pillars in parallel
      const pillarPromises = [
        this.executeEngines(plan.pillar1),
        this.executeEngines(plan.pillar2),
        this.executeEngines(plan.pillar3)
      ];

      const pillarResults = await Promise.all(pillarPromises);
      pillarResults.forEach(results => this.mergeResults(allResults, results));

      // Execute synthesis engines
      const synthesisResults = await this.executeEngines(plan.synthesis);
      this.mergeResults(allResults, synthesisResults);

      // Execute execution engines
      const executionResults = await this.executeEngines(plan.execution);
      this.mergeResults(allResults, executionResults);

      this.emit('execution:complete', { 
        totalEngines: plan.totalEngines,
        successfulEngines: allResults.size,
        results: allResults
      });

      return allResults;

    } finally {
      this.isExecuting = false;
    }
  }

  private async executeEngines(engines: IEngine[]): Promise<Map<string, EngineReport>> {
    const results = new Map<string, EngineReport>();
    
    const promises = engines.map(async (engine) => {
      const result = await this.executeEngine(engine.id || engine.constructor.name);
      if (result) {
        results.set(engine.id || engine.constructor.name, result);
      }
    });

    await Promise.all(promises);
    return results;
  }

  private mergeResults(target: Map<string, EngineReport>, source: Map<string, EngineReport>): void {
    for (const [key, value] of source) {
      target.set(key, value);
    }
  }

  // === SUBSCRIPTION SYSTEM ===
  public subscribe(engineId: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(engineId)) {
      this.subscribers.set(engineId, new Set());
    }
    
    this.subscribers.get(engineId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const engineSubscribers = this.subscribers.get(engineId);
      if (engineSubscribers) {
        engineSubscribers.delete(callback);
        if (engineSubscribers.size === 0) {
          this.subscribers.delete(engineId);
        }
      }
    };
  }

  private notifySubscribers(engineId: string, data: any): void {
    const subscribers = this.subscribers.get(engineId);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[EnhancedEngineRegistry] Subscriber error for ${engineId}:`, error);
        }
      });
    }
  }

  // === STATUS AND METRICS ===
  public getStatus(): RegistryStatus {
    const totalEngines = this.engines.size;
    const enabledEngines = Array.from(this.metadata.values()).filter(m => m.enabled).length;
    const runningEngines = this.isExecuting ? 1 : 0; // Simplified for now
    
    const avgExecutionTime = Array.from(this.metadata.values())
      .filter(m => m.averageExecutionTime)
      .reduce((sum, m) => sum + (m.averageExecutionTime || 0), 0) / totalEngines;

    const avgSuccessRate = Array.from(this.metadata.values())
      .filter(m => m.successRate)
      .reduce((sum, m) => sum + (m.successRate || 100), 0) / totalEngines;

    return {
      totalEngines,
      registeredEngines: totalEngines,
      enabledEngines,
      runningEngines,
      healthyEngines: enabledEngines, // Simplified
      avgExecutionTime,
      avgSuccessRate
    };
  }

  public getEngine(engineId: string): IEngine | null {
    return this.engines.get(engineId) || null;
  }

  public getMetadata(engineId: string): EngineMetadata | null {
    return this.metadata.get(engineId) || null;
  }

  public getAllMetadata(): EngineMetadata[] {
    return Array.from(this.metadata.values());
  }

  public getResult(engineId: string): EngineReport | null {
    return this.results.get(engineId) || null;
  }

  public getAllResults(): Map<string, EngineReport> {
    return new Map(this.results);
  }

  // === HEALTH CHECKS AND MONITORING ===
  private initializeMonitoring(): void {
    if (this.config.enableHealthChecks) {
      this.healthCheckTimer = setInterval(() => {
        this.performHealthChecks();
      }, this.config.healthCheckInterval);
    }

    if (this.config.enableMetrics) {
      this.metricsTimer = setInterval(() => {
        this.updateMetrics();
      }, this.config.refreshInterval);
    }
  }

  private async performHealthChecks(): Promise<void> {
    // Simplified health check - could be expanded
    const status = this.getStatus();
    this.emit('health:check', status);
  }

  private updateMetrics(): void {
    const status = this.getStatus();
    this.emit('metrics:update', status);
  }

  // === LIFECYCLE MANAGEMENT ===
  public shutdown(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }

    this.removeAllListeners();
    console.log('[EnhancedEngineRegistry] Shutdown complete');
  }
}