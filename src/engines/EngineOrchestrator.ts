import { BaseEngine } from './BaseEngine';
import { IEngine, EngineReport } from '@/types/engines';

export interface OrchestratorConfig {
  maxConcurrentEngines: number;
  globalTimeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    baseDelay: number;
  };
}

export interface ExecutionPlan {
  engines: IEngine[];
  dependencies: Map<string, string[]>;
  executionOrder: string[][];
}

export interface ExecutionResult {
  engineId: string;
  report: EngineReport;
  executionTime: number;
  success: boolean;
}

export class EngineOrchestrator {
  private engines: Map<string, IEngine> = new Map();
  private config: OrchestratorConfig;
  private executionQueue: Set<string> = new Set();
  private results: Map<string, ExecutionResult> = new Map();

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = {
      maxConcurrentEngines: 8,
      globalTimeout: 30000,
      retryPolicy: {
        maxRetries: 2,
        backoffMultiplier: 1.5,
        baseDelay: 1000
      },
      ...config
    };
  }

  registerEngine(engine: IEngine): void {
    this.engines.set(engine.id, engine);
  }

  unregisterEngine(engineId: string): void {
    this.engines.delete(engineId);
    this.results.delete(engineId);
  }

  async executeAll(): Promise<Map<string, ExecutionResult>> {
    console.log('🚀 EngineOrchestrator: Starting execution of all engines...', {
      totalEngines: this.engines.size,
      engineIds: Array.from(this.engines.keys())
    });
    
    const plan = this.createExecutionPlan();
    console.log('📋 EngineOrchestrator: Execution plan created', {
      stageCount: plan.executionOrder.length,
      totalEngines: plan.engines.length
    });
    
    const results = await this.executePlan(plan);
    
    console.log('✅ EngineOrchestrator: All engines executed', {
      resultCount: results.size,
      successCount: Array.from(results.values()).filter(r => r.success).length,
      failureCount: Array.from(results.values()).filter(r => !r.success).length
    });
    
    return results;
  }

  async executeByPillar(pillar: 1 | 2 | 3): Promise<Map<string, ExecutionResult>> {
    const engines = Array.from(this.engines.values()).filter(e => e.pillar === pillar);
    const plan = this.createExecutionPlan(engines);
    return this.executePlan(plan);
  }

  async executeById(engineIds: string[]): Promise<Map<string, ExecutionResult>> {
    const engines = engineIds
      .map(id => this.engines.get(id))
      .filter((engine): engine is IEngine => engine !== undefined);
    
    const plan = this.createExecutionPlan(engines);
    return this.executePlan(plan);
  }

  async executeEngine(engineId: string): Promise<ExecutionResult | null> {
    const engine = this.engines.get(engineId);
    if (!engine) return null;

    if (this.executionQueue.has(engineId)) {
      const existing = this.results.get(engineId);
      return existing || null;
    }

    return this.executeWithRetry(engine);
  }

  private createExecutionPlan(engines?: IEngine[]): ExecutionPlan {
    const targetEngines = engines || Array.from(this.engines.values());
    
    // Sort by priority (higher priority = lower number = executes first)
    const sortedEngines = targetEngines.sort((a, b) => a.priority - b.priority);
    
    // Group engines by pillar for parallel execution within each pillar
    const pillarGroups = new Map<number, IEngine[]>();
    sortedEngines.forEach(engine => {
      const pillar = engine.pillar;
      if (!pillarGroups.has(pillar)) {
        pillarGroups.set(pillar, []);
      }
      pillarGroups.get(pillar)!.push(engine);
    });
    
    // Create execution batches: each pillar can run in parallel
    const executionOrder: string[][] = [];
    for (const [pillar, engines] of Array.from(pillarGroups.entries()).sort(([a], [b]) => a - b)) {
      executionOrder.push(engines.map(e => e.id));
    }
    
    return {
      engines: sortedEngines,
      dependencies: new Map(),
      executionOrder
    };
  }

  private async executePlan(plan: ExecutionPlan): Promise<Map<string, ExecutionResult>> {
    const results = new Map<string, ExecutionResult>();
    
    for (const batch of plan.executionOrder) {
      const batchPromises = batch
        .slice(0, this.config.maxConcurrentEngines)
        .map(async (engineId) => {
          const engine = this.engines.get(engineId);
          if (!engine) return null;
          
          const result = await this.executeWithRetry(engine);
          if (result) {
            results.set(engineId, result);
          }
          return result;
        });

      await Promise.allSettled(batchPromises);
    }

    return results;
  }

  private async executeWithRetry(engine: IEngine): Promise<ExecutionResult> {
    this.executionQueue.add(engine.id);
    
    let lastError: Error | null = null;
    const { maxRetries, baseDelay, backoffMultiplier } = this.config.retryPolicy;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const startTime = Date.now();
        const report = await this.executeWithTimeout(engine);
        const executionTime = Date.now() - startTime;
        
        const result: ExecutionResult = {
          engineId: engine.id,
          report,
          executionTime,
          success: report.success
        };
        
        this.results.set(engine.id, result);
        this.executionQueue.delete(engine.id);
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt <= maxRetries) {
          const delay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    const failedResult: ExecutionResult = {
      engineId: engine.id,
      report: {
        success: false,
        confidence: 0,
        signal: 'neutral',
        data: { error: lastError?.message || 'Unknown error' },
        errors: [lastError?.message || 'Unknown error'],
        lastUpdated: new Date()
      },
      executionTime: 0,
      success: false
    };

    this.results.set(engine.id, failedResult);
    this.executionQueue.delete(engine.id);
    return failedResult;
  }

  private async executeWithTimeout(engine: IEngine): Promise<EngineReport> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Global execution timeout')), this.config.globalTimeout);
    });

    return Promise.race([
      engine.execute(),
      timeoutPromise
    ]);
  }

  getExecutionStatus(): {
    total: number;
    running: number;
    completed: number;
    failed: number;
  } {
    const total = this.engines.size;
    const running = this.executionQueue.size;
    const completed = this.results.size;
    const failed = Array.from(this.results.values()).filter(r => !r.success).length;

    return { total, running, completed, failed };
  }

  getEngineResult(engineId: string): ExecutionResult | null {
    return this.results.get(engineId) || null;
  }

  getAllResults(): Map<string, ExecutionResult> {
    return new Map(this.results);
  }

  clearResults(): void {
    this.results.clear();
  }

  getRegisteredEngines(): IEngine[] {
    return Array.from(this.engines.values());
  }
}