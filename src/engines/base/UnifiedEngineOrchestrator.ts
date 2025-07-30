/**
 * Unified Engine Orchestrator - V6 Implementation
 * Coordinates execution, dependency resolution, and system health
 */

import { BrowserEventEmitter } from '../../utils/BrowserEventEmitter';
import type { IEngine } from '../../types/engines';
import type { UnifiedEngineMetadata, ExecutionContext } from './UnifiedEngineRegistry';

export interface OrchestratorConfig {
  maxConcurrentEngines: number;
  healthCheckInterval: number;
  dependencyTimeout: number;
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold: number;
}

export interface SystemHealth {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  healthyEngines: number;
  totalEngines: number;
  averageConfidence: number;
  systemLoad: number;
}

export interface ExecutionPlan {
  phases: ExecutionPhase[];
  totalEngines: number;
  estimatedDuration: number;
}

export interface ExecutionPhase {
  phaseNumber: number;
  engines: string[];
  dependencies: string[];
  estimatedDuration: number;
}

export class UnifiedEngineOrchestrator extends BrowserEventEmitter {
  private config: OrchestratorConfig;
  private engineRegistry: Map<string, IEngine> = new Map();
  private metadataRegistry: Map<string, UnifiedEngineMetadata> = new Map();
  private executionQueue: Map<string, Promise<any>> = new Map();
  private circuitBreakers: Map<string, { failures: number; lastFailure: Date; isOpen: boolean }> = new Map();
  private healthTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<OrchestratorConfig> = {}) {
    super();
    
    this.config = {
      maxConcurrentEngines: 8,
      healthCheckInterval: 30000,
      dependencyTimeout: 60000,
      enableCircuitBreaker: true,
      circuitBreakerThreshold: 3,
      ...config
    };

    this.startHealthMonitoring();
  }

  registerEngine(engine: IEngine, metadata: UnifiedEngineMetadata): void {
    this.engineRegistry.set(engine.id, engine);
    this.metadataRegistry.set(engine.id, metadata);
    
    // Initialize circuit breaker
    if (this.config.enableCircuitBreaker) {
      this.circuitBreakers.set(engine.id, {
        failures: 0,
        lastFailure: new Date(0),
        isOpen: false
      });
    }

    this.emit('engine:registered', { engineId: engine.id, metadata });
  }

  unregisterEngine(engineId: string): void {
    this.engineRegistry.delete(engineId);
    this.metadataRegistry.delete(engineId);
    this.circuitBreakers.delete(engineId);
    this.executionQueue.delete(engineId);
    
    this.emit('engine:unregistered', { engineId });
  }

  async executeAll(context: ExecutionContext = {}): Promise<Map<string, any>> {
    const engines = this.getEnginesForContext(context);
    const executionPlan = this.createExecutionPlan(engines);
    
    this.emit('execution:plan-created', { plan: executionPlan, context });

    if (context.parallel) {
      return this.executeInParallel(engines);
    } else {
      return this.executeByPhases(executionPlan);
    }
  }

  async executeEngine(engineId: string): Promise<any> {
    const engine = this.engineRegistry.get(engineId);
    if (!engine) {
      throw new Error(`Engine ${engineId} not found`);
    }

    // Check circuit breaker
    if (this.isCircuitBreakerOpen(engineId)) {
      throw new Error(`Circuit breaker open for engine ${engineId}`);
    }

    // Check if already executing
    if (this.executionQueue.has(engineId)) {
      return this.executionQueue.get(engineId);
    }

    const executionPromise = this.executeEngineInternal(engine);
    this.executionQueue.set(engineId, executionPromise);

    try {
      const result = await executionPromise;
      this.onEngineSuccess(engineId);
      return result;
    } catch (error) {
      this.onEngineFailure(engineId, error);
      throw error;
    } finally {
      this.executionQueue.delete(engineId);
    }
  }

  private async executeEngineInternal(engine: IEngine): Promise<any> {
    const startTime = Date.now();
    
    this.emit('engine:execution-start', { 
      engineId: engine.id, 
      timestamp: startTime 
    });

    try {
      const result = await engine.execute();
      const duration = Date.now() - startTime;
      
      this.emit('engine:execution-success', { 
        engineId: engine.id, 
        result, 
        duration,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.emit('engine:execution-error', { 
        engineId: engine.id, 
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        timestamp: Date.now()
      });

      throw error;
    }
  }

  private async executeInParallel(engines: UnifiedEngineMetadata[]): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    const semaphore = new Semaphore(this.config.maxConcurrentEngines);

    const executionPromises = engines.map(async (metadata) => {
      await semaphore.acquire();
      
      try {
        const result = await this.executeEngine(metadata.id);
        results.set(metadata.id, result);
      } catch (error) {
        console.error(`Engine ${metadata.id} failed:`, error);
        results.set(metadata.id, { error: error.message });
      } finally {
        semaphore.release();
      }
    });

    await Promise.all(executionPromises);
    return results;
  }

  private async executeByPhases(plan: ExecutionPlan): Promise<Map<string, any>> {
    const results = new Map<string, any>();

    for (const phase of plan.phases) {
      this.emit('execution:phase-start', { 
        phase: phase.phaseNumber, 
        engines: phase.engines 
      });

      const phasePromises = phase.engines.map(async (engineId) => {
        try {
          const result = await this.executeEngine(engineId);
          results.set(engineId, result);
        } catch (error) {
          console.error(`Engine ${engineId} failed in phase ${phase.phaseNumber}:`, error);
          results.set(engineId, { error: error.message });
        }
      });

      await Promise.all(phasePromises);

      this.emit('execution:phase-complete', { 
        phase: phase.phaseNumber, 
        results: phase.engines.map(id => ({ id, result: results.get(id) }))
      });
    }

    return results;
  }

  private createExecutionPlan(engines: UnifiedEngineMetadata[]): ExecutionPlan {
    const resolved = this.resolveDependencies(engines);
    const phases: ExecutionPhase[] = [];
    const processed = new Set<string>();

    let phaseNumber = 1;
    while (processed.size < resolved.length) {
      const phaseEngines = resolved
        .filter(engine => !processed.has(engine.id))
        .filter(engine => 
          engine.dependencies.every(dep => processed.has(dep))
        );

      if (phaseEngines.length === 0) {
        // Circular dependency or missing dependency
        const remaining = resolved.filter(engine => !processed.has(engine.id));
        throw new Error(`Circular or missing dependencies detected: ${remaining.map(e => e.id).join(', ')}`);
      }

      phases.push({
        phaseNumber,
        engines: phaseEngines.map(e => e.id),
        dependencies: phaseEngines.flatMap(e => e.dependencies),
        estimatedDuration: Math.max(...phaseEngines.map(e => e.estimatedDuration || 5000))
      });

      phaseEngines.forEach(engine => processed.add(engine.id));
      phaseNumber++;
    }

    return {
      phases,
      totalEngines: engines.length,
      estimatedDuration: phases.reduce((sum, phase) => sum + phase.estimatedDuration, 0)
    };
  }

  private resolveDependencies(engines: UnifiedEngineMetadata[]): UnifiedEngineMetadata[] {
    // Topological sort for dependency resolution
    const result: UnifiedEngineMetadata[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (engineId: string) => {
      if (visiting.has(engineId)) {
        throw new Error(`Circular dependency detected involving ${engineId}`);
      }
      
      if (visited.has(engineId)) {
        return;
      }

      const engine = engines.find(e => e.id === engineId);
      if (!engine) {
        throw new Error(`Dependency ${engineId} not found`);
      }

      visiting.add(engineId);

      for (const depId of engine.dependencies) {
        visit(depId);
      }

      visiting.delete(engineId);
      visited.add(engineId);
      result.push(engine);
    };

    // Sort by priority first
    const sortedEngines = [...engines].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    for (const engine of sortedEngines) {
      if (!visited.has(engine.id)) {
        visit(engine.id);
      }
    }

    return result;
  }

  private getEnginesForContext(context: ExecutionContext): UnifiedEngineMetadata[] {
    let engines = Array.from(this.metadataRegistry.values());

    if (context.pillar) {
      engines = engines.filter(e => e.pillar === context.pillar);
    }

    if (context.category) {
      engines = engines.filter(e => e.category === context.category);
    }

    if (context.tags && context.tags.length > 0) {
      engines = engines.filter(e => 
        context.tags!.some(tag => e.tags?.includes(tag))
      );
    }

    return engines.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  // Circuit breaker management
  private isCircuitBreakerOpen(engineId: string): boolean {
    if (!this.config.enableCircuitBreaker) return false;
    
    const breaker = this.circuitBreakers.get(engineId);
    if (!breaker) return false;

    // Reset if enough time has passed
    const timeSinceLastFailure = Date.now() - breaker.lastFailure.getTime();
    if (timeSinceLastFailure > 60000) { // 1 minute
      breaker.failures = 0;
      breaker.isOpen = false;
    }

    return breaker.isOpen;
  }

  private onEngineSuccess(engineId: string): void {
    const breaker = this.circuitBreakers.get(engineId);
    if (breaker) {
      breaker.failures = 0;
      breaker.isOpen = false;
    }
  }

  private onEngineFailure(engineId: string, error: any): void {
    const breaker = this.circuitBreakers.get(engineId);
    if (breaker) {
      breaker.failures++;
      breaker.lastFailure = new Date();
      
      if (breaker.failures >= this.config.circuitBreakerThreshold) {
        breaker.isOpen = true;
        this.emit('circuit-breaker:opened', { engineId, failures: breaker.failures });
      }
    }
  }

  // Health monitoring
  private startHealthMonitoring(): void {
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
    }

    this.healthTimer = setInterval(() => {
      const health = this.getSystemHealth();
      this.emit('system:health-update', health);
    }, this.config.healthCheckInterval);
  }

  getSystemHealth(): SystemHealth {
    const engines = Array.from(this.engineRegistry.values());
    const totalEngines = engines.length;
    
    if (totalEngines === 0) {
      return {
        overallStatus: 'healthy',
        healthyEngines: 0,
        totalEngines: 0,
        averageConfidence: 0,
        systemLoad: 0
      };
    }

    let healthyEngines = 0;
    let totalConfidence = 0;
    let validConfidenceCount = 0;

    engines.forEach(engine => {
      // Check if engine has isHealthy method (from UnifiedBaseEngine)
      if ('isHealthy' in engine && typeof engine.isHealthy === 'function') {
        try {
          if (engine.isHealthy()) {
            healthyEngines++;
          }
        } catch (error) {
          // Engine health check failed, consider unhealthy
        }
      } else {
        // Fallback: consider healthy if no method available
        healthyEngines++;
      }
      
      // Check if engine has getMetrics method (from UnifiedBaseEngine)
      if ('getMetrics' in engine && typeof engine.getMetrics === 'function') {
        try {
          const metrics = engine.getMetrics();
          if (metrics && typeof metrics.confidenceScore === 'number') {
            totalConfidence += metrics.confidenceScore;
            validConfidenceCount++;
          }
        } catch (error) {
          // Metrics failed, skip this engine for confidence calculation
        }
      }
    });

    const healthRatio = healthyEngines / totalEngines;
    const averageConfidence = validConfidenceCount > 0 ? totalConfidence / validConfidenceCount : 0;
    const systemLoad = this.executionQueue.size / this.config.maxConcurrentEngines;

    let overallStatus: 'healthy' | 'degraded' | 'critical';
    if (healthRatio >= 0.8 && averageConfidence >= 0.7) {
      overallStatus = 'healthy';
    } else if (healthRatio >= 0.5 && averageConfidence >= 0.4) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'critical';
    }

    return {
      overallStatus,
      healthyEngines,
      totalEngines,
      averageConfidence,
      systemLoad
    };
  }

  destroy(): void {
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = null;
    }
    
    this.removeAllListeners();
    this.engineRegistry.clear();
    this.metadataRegistry.clear();
    this.executionQueue.clear();
    this.circuitBreakers.clear();
  }
}

// Utility class for managing concurrent executions
class Semaphore {
  private permits: number;
  private waiting: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }

  release(): void {
    this.permits++;
    
    if (this.waiting.length > 0) {
      const next = this.waiting.shift();
      if (next) {
        this.permits--;
        next();
      }
    }
  }
}