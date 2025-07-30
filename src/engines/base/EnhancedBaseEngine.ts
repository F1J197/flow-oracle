/**
 * Enhanced Base Engine - V6 Implementation
 * Combines resilient patterns with event-driven architecture
 */

import { EventEmitter } from 'events';
import type { 
  IEngine, 
  EngineReport, 
  ActionableInsight, 
  DashboardTileData, 
  IntelligenceViewData, 
  DetailedModalData,
  DetailedEngineView 
} from '../../types/engines';

export interface EnhancedEngineConfig {
  refreshInterval: number;
  maxRetries: number;
  timeout: number;
  cacheTimeout: number;
  gracefulDegradation: boolean;
  enableEvents: boolean;
}

export interface EnhancedEngineState {
  status: 'idle' | 'running' | 'success' | 'error';
  lastReport?: EngineReport;
  lastError?: string;
  retryCount: number;
  lastSuccess: Date;
  executionTime: number;
  isHealthy: boolean;
}

export abstract class EnhancedBaseEngine extends EventEmitter implements IEngine {
  // Abstract properties that must be implemented
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly priority: number;
  abstract readonly pillar: 1 | 2 | 3;
  abstract readonly category: 'foundation' | 'core' | 'synthesis' | 'execution';

  protected config: EnhancedEngineConfig;
  protected state: EnhancedEngineState;
  protected cache: Map<string, { data: any; timestamp: number }> = new Map();
  private executing = false;

  constructor(config: Partial<EnhancedEngineConfig> = {}) {
    super();
    
    this.config = {
      refreshInterval: 15000,
      maxRetries: 3,
      timeout: 10000,
      cacheTimeout: 60000,
      gracefulDegradation: true,
      enableEvents: true,
      ...config
    };

    this.state = {
      status: 'idle',
      retryCount: 0,
      lastSuccess: new Date(),
      executionTime: 0,
      isHealthy: true
    };
  }

  async execute(): Promise<EngineReport> {
    if (this.executing) {
      this.emit('warning', 'Engine already executing');
      return this.state.lastReport || this.createErrorReport('Already executing');
    }

    this.executing = true;
    const startTime = Date.now();
    
    try {
      this.updateState({ status: 'running', retryCount: 0 });
      this.emit('execution:start', { engineId: this.id });

      // Check cache first
      if (this.shouldUseCachedData()) {
        const cached = this.getCachedReport();
        if (cached) {
          this.emit('execution:cached', { engineId: this.id, data: cached });
          return cached;
        }
      }

      const result = await this.executeWithRetries();
      
      this.state.executionTime = Date.now() - startTime;
      this.updateState({ 
        status: 'success', 
        lastReport: result, 
        lastSuccess: new Date(),
        isHealthy: true
      });

      this.setCacheData('lastReport', result);
      this.emit('execution:success', { engineId: this.id, result, executionTime: this.state.executionTime });
      
      return result;

    } catch (error) {
      this.state.executionTime = Date.now() - startTime;
      const errorReport = this.createErrorReport(error instanceof Error ? error.message : 'Unknown error');
      
      this.updateState({ 
        status: 'error', 
        lastError: error instanceof Error ? error.message : 'Unknown error',
        isHealthy: false
      });

      this.emit('execution:error', { engineId: this.id, error, executionTime: this.state.executionTime });
      
      if (this.config.gracefulDegradation) {
        return this.createDegradedReport(error instanceof Error ? error.message : 'Unknown error');
      }
      
      throw error;
    } finally {
      this.executing = false;
    }
  }

  private async executeWithRetries(): Promise<EngineReport> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        this.updateState({ retryCount: attempt });
        
        const result = await this.executeWithTimeout();
        
        if (result.success) {
          return result;
        } else if (attempt === this.config.maxRetries - 1) {
          throw new Error(`Engine failed after ${this.config.maxRetries} attempts`);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        this.emit('execution:retry', { 
          engineId: this.id, 
          attempt: attempt + 1, 
          error: lastError,
          maxRetries: this.config.maxRetries 
        });
        
        if (attempt < this.config.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  private async executeWithTimeout(): Promise<EngineReport> {
    return Promise.race([
      this.performExecution(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Execution timeout')), this.config.timeout)
      )
    ]);
  }

  // Abstract method that concrete engines must implement
  protected abstract performExecution(): Promise<EngineReport>;

  // Cache management
  protected shouldUseCachedData(): boolean {
    const cached = this.cache.get('lastReport');
    if (!cached) return false;
    
    return (Date.now() - cached.timestamp) < this.config.cacheTimeout;
  }

  protected getCachedReport(): EngineReport | null {
    const cached = this.cache.get('lastReport');
    return cached ? cached.data : null;
  }

  protected setCacheData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  protected getCacheData(key: string): any {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if ((Date.now() - cached.timestamp) > this.config.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // State management
  private updateState(updates: Partial<EnhancedEngineState>): void {
    this.state = { ...this.state, ...updates };
    if (this.config.enableEvents) {
      this.emit('state:change', { engineId: this.id, state: this.state });
    }
  }

  // Factory methods for different report types
  protected createDegradedReport(reason: string): EngineReport {
    return {
      success: true,
      confidence: 0.3,
      signal: 'neutral',
      data: {
        degraded: true,
        reason,
        fallbackMode: true,
        timestamp: new Date()
      },
      lastUpdated: new Date()
    };
  }

  protected createErrorReport(message: string): EngineReport {
    return {
      success: false,
      confidence: 0,
      signal: 'neutral',
      data: { error: message },
      errors: [message],
      lastUpdated: new Date()
    };
  }

  // Public interface methods
  getState(): EnhancedEngineState {
    return { ...this.state };
  }

  isHealthy(): boolean {
    return this.state.isHealthy && 
           this.state.status !== 'error' && 
           (Date.now() - this.state.lastSuccess.getTime()) < (this.config.refreshInterval * 3);
  }

  getAge(): number {
    return Date.now() - this.state.lastSuccess.getTime();
  }

  // Abstract methods that must be implemented by subclasses
  abstract getSingleActionableInsight(): ActionableInsight;
  abstract getDashboardData(): DashboardTileData;
  abstract getDashboardTile(): DashboardTileData;
  abstract getIntelligenceView(): IntelligenceViewData;
  abstract getDetailedModal(): DetailedModalData;
  abstract getDetailedView(): DetailedEngineView;
}