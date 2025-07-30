/**
 * Unified Engine Registry - V6 Implementation
 * Combines existing registry functionality with enhanced patterns
 */

import { BrowserEventEmitter } from '../../utils/BrowserEventEmitter';
import type { IEngine } from '../../types/engines';
// Engine adapter removed - using direct registration

export interface UnifiedEngineMetadata {
  id: string;
  name: string;
  pillar: 1 | 2 | 3;
  priority: number;
  dependencies: string[];
  category: 'foundation' | 'core' | 'synthesis' | 'execution';
  description?: string;
  version?: string;
  isLegacy?: boolean;
  migrated?: boolean;
  estimatedDuration?: number;
  tags?: string[];
}

export interface RegistryConfig {
  autoStart: boolean;
  refreshInterval: number;
  maxRetries: number;
  enableEvents: boolean;
  gracefulDegradation: boolean;
}

export interface ExecutionContext {
  pillar?: 1 | 2 | 3;
  category?: 'foundation' | 'core' | 'synthesis' | 'execution';
  dependencies?: string[];
  parallel?: boolean;
  tags?: string[];
}

export class UnifiedEngineRegistry extends BrowserEventEmitter {
  private static instance: UnifiedEngineRegistry;
  private engines: Map<string, IEngine> = new Map();
  private metadata: Map<string, UnifiedEngineMetadata> = new Map();
  private executionResults: Map<string, any> = new Map();
  private subscriptions: Map<string, Set<(data: any) => void>> = new Map();
  private config: RegistryConfig;

  private constructor(config: Partial<RegistryConfig> = {}) {
    super();
    
    this.config = {
      autoStart: false,
      refreshInterval: 15000,
      maxRetries: 3,
      enableEvents: true,
      gracefulDegradation: true,
      ...config
    };

    if (this.config.enableEvents) {
      this.emit('registry:initialized', { timestamp: new Date() });
    }
  }

  static getInstance(config?: Partial<RegistryConfig>): UnifiedEngineRegistry {
    if (!UnifiedEngineRegistry.instance) {
      UnifiedEngineRegistry.instance = new UnifiedEngineRegistry(config);
    }
    return UnifiedEngineRegistry.instance;
  }

  // Direct registration without adaptation
  register(engine: IEngine, metadata?: Partial<UnifiedEngineMetadata>): void {

    const engineMetadata: UnifiedEngineMetadata = {
      id: engine.id,
      name: engine.name,
      pillar: engine.pillar,
      priority: engine.priority,
      category: engine.category,
      dependencies: [],
      isLegacy: !('getState' in engine && typeof engine.getState === 'function'),
      migrated: true,
      version: '6.0',
      ...metadata
    };

    this.engines.set(engine.id, engine);
    this.metadata.set(engine.id, engineMetadata);

    // Set up event forwarding for engines
    if ('on' in engine && typeof engine.on === 'function') {
      engine.on('execution:success', (data: any) => {
        this.handleEngineEvent('success', engine.id, data);
      });
      
      engine.on('execution:error', (data: any) => {
        this.handleEngineEvent('error', engine.id, data);
      });
    }

    this.emit('engine:registered', { 
      engineId: engine.id, 
      metadata: engineMetadata 
    });
  }

  unregister(engineId: string): void {
    const engine = this.engines.get(engineId);
    if (engine) {
      // Clean up event listeners
      if ('removeAllListeners' in engine && typeof engine.removeAllListeners === 'function') {
        engine.removeAllListeners();
      }
      
      this.engines.delete(engineId);
      this.metadata.delete(engineId);
      this.executionResults.delete(engineId);
      this.subscriptions.delete(engineId);

      this.emit('engine:unregistered', { engineId });
    }
  }

  // Enhanced execution methods
  async executeAll(context: ExecutionContext = {}): Promise<Map<string, any>> {
    const engines = this.getEnginesForContext(context);
    return this.executeEngines(engines, context);
  }

  async executeByPillar(pillar: 1 | 2 | 3, parallel = true): Promise<Map<string, any>> {
    return this.executeAll({ pillar, parallel });
  }

  async executeByCategory(category: 'foundation' | 'core' | 'synthesis' | 'execution', parallel = true): Promise<Map<string, any>> {
    return this.executeAll({ category, parallel });
  }

  async executeEngine(engineId: string): Promise<any> {
    const engine = this.engines.get(engineId);
    if (!engine) {
      throw new Error(`Engine ${engineId} not found`);
    }

    try {
      this.emit('execution:start', { engineId });
      
      const result = await engine.execute();
      
      this.executionResults.set(engineId, result);
      this.notifySubscribers(engineId, result);
      
      this.emit('execution:success', { engineId, result });
      
      return result;
    } catch (error) {
      this.emit('execution:error', { engineId, error });
      
      if (this.config.gracefulDegradation) {
        const fallbackResult = {
          success: false,
          confidence: 0,
          signal: 'neutral' as const,
          data: { 
            error: error instanceof Error ? error.message : 'Unknown error',
            fallback: true
          },
          lastUpdated: new Date()
        };
        
        this.executionResults.set(engineId, fallbackResult);
        return fallbackResult;
      }
      
      throw error;
    }
  }

  // Enhanced execution with dependency resolution
  private async executeEngines(engines: UnifiedEngineMetadata[], context: ExecutionContext): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    
    if (context.parallel !== false) {
      // Parallel execution
      const promises = engines.map(async (metadata) => {
        try {
          const result = await this.executeEngine(metadata.id);
          return { id: metadata.id, result };
        } catch (error) {
          console.warn(`Engine ${metadata.id} failed:`, error);
          return { 
            id: metadata.id, 
            result: this.createFailureResult(error instanceof Error ? error.message : 'Unknown error') 
          };
        }
      });

      const settled = await Promise.allSettled(promises);
      
      settled.forEach((outcome, index) => {
        if (outcome.status === 'fulfilled' && outcome.value) {
          results.set(outcome.value.id, outcome.value.result);
        } else {
          const engineId = engines[index].id;
          results.set(engineId, this.createFailureResult('Execution failed'));
        }
      });
    } else {
      // Sequential execution with dependency resolution
      const sorted = this.resolveDependencies(engines);
      
      for (const metadata of sorted) {
        try {
          const result = await this.executeEngine(metadata.id);
          results.set(metadata.id, result);
        } catch (error) {
          console.warn(`Engine ${metadata.id} failed:`, error);
          results.set(metadata.id, this.createFailureResult(error instanceof Error ? error.message : 'Unknown error'));
        }
      }
    }

    return results;
  }

  // Dependency resolution
  private resolveDependencies(engines: UnifiedEngineMetadata[]): UnifiedEngineMetadata[] {
    const resolved: UnifiedEngineMetadata[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (engine: UnifiedEngineMetadata) => {
      if (visited.has(engine.id)) return;
      if (visiting.has(engine.id)) {
        throw new Error(`Circular dependency detected involving ${engine.id}`);
      }

      visiting.add(engine.id);

      for (const depId of engine.dependencies) {
        const dep = engines.find(e => e.id === depId);
        if (dep) {
          visit(dep);
        }
      }

      visiting.delete(engine.id);
      visited.add(engine.id);
      resolved.push(engine);
    };

    engines.forEach(visit);
    return resolved;
  }

  // Context filtering
  private getEnginesForContext(context: ExecutionContext): UnifiedEngineMetadata[] {
    const allEngines = Array.from(this.metadata.values());
    
    return allEngines.filter(engine => {
      if (context.pillar && engine.pillar !== context.pillar) return false;
      if (context.category && engine.category !== context.category) return false;
      return true;
    }).sort((a, b) => a.priority - b.priority);
  }

  // Event handling
  private handleEngineEvent(type: 'success' | 'error', engineId: string, data: any): void {
    if (type === 'success') {
      this.executionResults.set(engineId, data.result || data);
      this.notifySubscribers(engineId, data.result || data);
    }
    
    this.emit(`engine:${type}`, { engineId, data });
  }

  // Subscription management
  subscribe(engineId: string, callback: (data: any) => void): () => void {
    if (!this.subscriptions.has(engineId)) {
      this.subscriptions.set(engineId, new Set());
    }
    
    this.subscriptions.get(engineId)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const subs = this.subscriptions.get(engineId);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscriptions.delete(engineId);
        }
      }
    };
  }

  private notifySubscribers(engineId: string, data: any): void {
    const subscribers = this.subscriptions.get(engineId);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.warn(`Subscriber error for engine ${engineId}:`, error);
        }
      });
    }
  }

  // Utility methods
  private createFailureResult(message: string) {
    return {
      success: false,
      confidence: 0,
      signal: 'neutral' as const,
      data: { error: message },
      lastUpdated: new Date()
    };
  }

  // Public query methods
  getEngine(engineId: string): IEngine | null {
    return this.engines.get(engineId) || null;
  }

  getMetadata(engineId: string): UnifiedEngineMetadata | null {
    return this.metadata.get(engineId) || null;
  }

  getAllMetadata(): UnifiedEngineMetadata[] {
    return Array.from(this.metadata.values());
  }

  getEnginesByPillar(pillar: 1 | 2 | 3): UnifiedEngineMetadata[] {
    return this.getAllMetadata().filter(engine => engine.pillar === pillar);
  }

  getEnginesByCategory(category: 'foundation' | 'core' | 'synthesis' | 'execution'): UnifiedEngineMetadata[] {
    return this.getAllMetadata().filter(engine => engine.category === category);
  }

  getExecutionStatus(): { total: number; running: number; completed: number; failed: number } {
    const engines = Array.from(this.engines.values());
    const results = Array.from(this.executionResults.values());
    
    return {
      total: engines.length,
      running: engines.filter(e => 'getState' in e && typeof e.getState === 'function' && e.getState().status === 'running').length,
      completed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
  }

  getAllResults(): Map<string, any> {
    return new Map(this.executionResults);
  }
}