import { IEngine } from '@/types/engines';
import { EngineOrchestrator } from './EngineOrchestrator';

export interface EngineRegistryConfig {
  autoStart: boolean;
  refreshInterval: number;
  maxRetries: number;
}

export interface EngineMetadata {
  id: string;
  name: string;
  pillar: 1 | 2 | 3;
  priority: number;
  dependencies: string[];
  category: 'foundation' | 'core' | 'synthesis' | 'execution';
  description?: string;
  version?: string;
}

export class EngineRegistry {
  private static instance: EngineRegistry;
  private orchestrator: EngineOrchestrator;
  private metadata: Map<string, EngineMetadata> = new Map();
  private subscriptions: Map<string, Set<(data: any) => void>> = new Map();
  private config: EngineRegistryConfig;

  private constructor(config: Partial<EngineRegistryConfig> = {}) {
    this.config = {
      autoStart: true,
      refreshInterval: 15000,
      maxRetries: 3,
      ...config
    };
    
    this.orchestrator = new EngineOrchestrator();
  }

  static getInstance(config?: Partial<EngineRegistryConfig>): EngineRegistry {
    if (!EngineRegistry.instance) {
      EngineRegistry.instance = new EngineRegistry(config);
    }
    return EngineRegistry.instance;
  }

  register(engine: IEngine, metadata?: Partial<EngineMetadata>): void {
    // Register with orchestrator
    this.orchestrator.registerEngine(engine);
    
    // Store metadata
    const engineMetadata: EngineMetadata = {
      id: engine.id,
      name: engine.name,
      pillar: engine.pillar,
      priority: engine.priority,
      dependencies: [],
      category: this.getCategoryFromPillar(engine.pillar),
      ...metadata
    };
    
    this.metadata.set(engine.id, engineMetadata);
    
    console.log(`Engine registered: ${engine.name} (${engine.id})`);
  }

  unregister(engineId: string): void {
    this.orchestrator.unregisterEngine(engineId);
    this.metadata.delete(engineId);
    this.subscriptions.delete(engineId);
    
    console.log(`Engine unregistered: ${engineId}`);
  }

  async executeAll(): Promise<Map<string, any>> {
    console.log('🚀 EngineRegistry: Executing all engines...', {
      totalRegistered: this.metadata.size,
      engineIds: Array.from(this.metadata.keys())
    });
    
    const results = await this.orchestrator.executeAll();
    
    console.log('✅ EngineRegistry: Execution completed', {
      resultCount: results.size,
      resultEngines: Array.from(results.keys())
    });
    
    this.notifySubscribers(results);
    return results;
  }

  async executeByPillar(pillar: 1 | 2 | 3): Promise<Map<string, any>> {
    const results = await this.orchestrator.executeByPillar(pillar);
    this.notifySubscribers(results);
    return results;
  }

  async executeByCategory(category: 'foundation' | 'core' | 'synthesis' | 'execution'): Promise<Map<string, any>> {
    const engineIds = Array.from(this.metadata.values())
      .filter(meta => meta.category === category)
      .map(meta => meta.id);
    
    const results = await this.orchestrator.executeById(engineIds);
    this.notifySubscribers(results);
    return results;
  }

  async executeEngine(engineId: string): Promise<any> {
    const result = await this.orchestrator.executeEngine(engineId);
    if (result) {
      this.notifyEngineSubscribers(engineId, result);
    }
    return result;
  }

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

  getEngine(engineId: string): IEngine | null {
    return this.orchestrator.getRegisteredEngines().find(e => e.id === engineId) || null;
  }

  getMetadata(engineId: string): EngineMetadata | null {
    return this.metadata.get(engineId) || null;
  }

  getAllMetadata(): EngineMetadata[] {
    return Array.from(this.metadata.values());
  }

  getEnginesByPillar(pillar: 1 | 2 | 3): EngineMetadata[] {
    return Array.from(this.metadata.values()).filter(meta => meta.pillar === pillar);
  }

  getEnginesByCategory(category: 'foundation' | 'core' | 'synthesis' | 'execution'): EngineMetadata[] {
    return Array.from(this.metadata.values()).filter(meta => meta.category === category);
  }

  getExecutionStatus(): {
    total: number;
    running: number;
    completed: number;
    failed: number;
  } {
    return this.orchestrator.getExecutionStatus();
  }

  private getCategoryFromPillar(pillar: 1 | 2 | 3): 'foundation' | 'core' | 'synthesis' | 'execution' {
    switch (pillar) {
      case 1: return 'foundation';
      case 2: return 'core';
      case 3: return 'synthesis';
      default: return 'core';
    }
  }

  private notifySubscribers(results: Map<string, any>): void {
    results.forEach((result, engineId) => {
      this.notifyEngineSubscribers(engineId, result);
    });
  }

  private notifyEngineSubscribers(engineId: string, result: any): void {
    const subscribers = this.subscriptions.get(engineId);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(result);
        } catch (error) {
          console.error(`Error in engine subscriber for ${engineId}:`, error);
        }
      });
    }
  }
}