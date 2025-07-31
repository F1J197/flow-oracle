/**
 * Master Prompt Base Engine - V6 Implementation
 * Original EventEmitter-based pattern from Master Prompt 2.1
 */

import { BrowserEventEmitter } from '@/utils/BrowserEventEmitter';
import { IEngine, EngineReport, DashboardTileData, IntelligenceViewData, DetailedModalData, ActionableInsight } from '@/types/engines';

export interface MasterPromptEngineConfig {
  refreshInterval: number;
  maxRetries: number;
  timeout: number;
  cacheTimeout: number;
  gracefulDegradation: boolean;
}

export interface MasterPromptEngineState {
  status: 'idle' | 'running' | 'error' | 'completed';
  lastReport: EngineReport | null;
  lastError: Error | null;
  retryCount: number;
  lastSuccess: Date | null;
  executionTime: number;
  isHealthy: boolean;
}

/**
 * Master Prompt Base Engine - Following original specification
 * Implements EventEmitter pattern with resilient execution
 */
export abstract class MasterPromptBaseEngine extends BrowserEventEmitter implements IEngine {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly pillar: 1 | 2 | 3;
  abstract readonly priority: number;
  abstract readonly category: 'foundation' | 'core' | 'synthesis' | 'execution';

  protected config: MasterPromptEngineConfig;
  protected state: MasterPromptEngineState;
  protected cache: Map<string, { data: any; timestamp: number }> = new Map();
  private isExecuting = false;

  constructor(config: Partial<MasterPromptEngineConfig> = {}) {
    super();
    
    this.config = {
      refreshInterval: 15000,
      maxRetries: 3,
      timeout: 30000,
      cacheTimeout: 300000,
      gracefulDegradation: true,
      ...config
    };

    this.state = {
      status: 'idle',
      lastReport: null,
      lastError: null,
      retryCount: 0,
      lastSuccess: null,
      executionTime: 0,
      isHealthy: true
    };
  }

  /**
   * Main execution method with EventEmitter pattern
   */
  async execute(): Promise<EngineReport> {
    if (this.isExecuting) {
      this.emit('warning', `Engine ${this.id} is already executing`);
      return this.state.lastReport || this.createErrorReport('Engine busy');
    }

    this.isExecuting = true;
    this.emit('execution:start', { engineId: this.id, timestamp: Date.now() });
    
    const startTime = Date.now();

    try {
      // Check cache first
      if (this.shouldUseCachedData()) {
        const cachedReport = this.getCachedReport();
        if (cachedReport) {
          this.emit('cache:hit', { engineId: this.id });
          return cachedReport;
        }
      }

      this.updateState({ status: 'running', retryCount: 0 });
      
      // Execute with retries
      const report = await this.executeWithRetries();
      
      // Update state and cache
      this.state.executionTime = Date.now() - startTime;
      this.updateState({
        status: 'completed',
        lastReport: report,
        lastSuccess: new Date(),
        lastError: null,
        isHealthy: true
      });

      this.setCacheData('lastReport', report);
      this.emit('execution:success', { engineId: this.id, report, executionTime: this.state.executionTime });
      
      return report;

    } catch (error) {
      this.state.executionTime = Date.now() - startTime;
      this.updateState({
        status: 'error',
        lastError: error as Error,
        isHealthy: false
      });

      this.emit('execution:error', { engineId: this.id, error, executionTime: this.state.executionTime });
      
      // Return degraded report if enabled
      if (this.config.gracefulDegradation) {
        return this.createDegradedReport(error as Error);
      }
      
      throw error;

    } finally {
      this.isExecuting = false;
      this.emit('execution:complete', { engineId: this.id, status: this.state.status });
    }
  }

  /**
   * Execute with retry logic
   */
  private async executeWithRetries(): Promise<EngineReport> {
    let lastError: Error;

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        this.state.retryCount = attempt;
        
        if (attempt > 0) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          this.emit('retry:attempt', { engineId: this.id, attempt, delay });
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        return await this.executeWithTimeout();

      } catch (error) {
        lastError = error as Error;
        this.emit('retry:failed', { engineId: this.id, attempt, error });
        
        if (attempt === this.config.maxRetries - 1) {
          break;
        }
      }
    }

    throw lastError!;
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout(): Promise<EngineReport> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Engine ${this.id} execution timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);

      this.performExecution()
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeout));
    });
  }

  /**
   * Abstract method for concrete engine implementation
   */
  protected abstract performExecution(): Promise<EngineReport>;

  /**
   * Cache management
   */
  protected shouldUseCachedData(): boolean {
    const cached = this.cache.get('lastReport');
    return cached ? (Date.now() - cached.timestamp) < this.config.cacheTimeout : false;
  }

  protected getCachedReport(): EngineReport | null {
    const cached = this.cache.get('lastReport');
    return cached ? cached.data : null;
  }

  protected setCacheData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  protected getCacheData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.config.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * State management
   */
  protected updateState(updates: Partial<MasterPromptEngineState>): void {
    this.state = { ...this.state, ...updates };
    this.emit('state:change', { engineId: this.id, state: this.state });
  }

  public getState(): MasterPromptEngineState {
    return { ...this.state };
  }

  public isHealthy(): boolean {
    return this.state.isHealthy;
  }

  public getAge(): number {
    return this.state.lastSuccess ? Date.now() - this.state.lastSuccess.getTime() : Infinity;
  }

  /**
   * Report factory methods
   */
  protected createDegradedReport(error: Error): EngineReport {
    return {
      success: false,
      confidence: 0.3,
      signal: 'neutral',
      data: { degraded: true, error: error.message },
      errors: [error.message],
      lastUpdated: new Date()
    };
  }

  protected createErrorReport(message: string): EngineReport {
    return {
      success: false,
      confidence: 0,
      signal: 'neutral',
      data: {},
      errors: [message],
      lastUpdated: new Date()
    };
  }

  /**
   * Abstract methods for UI data - to be implemented by concrete engines
   */
  abstract getSingleActionableInsight(): ActionableInsight;
  abstract getDashboardData(): DashboardTileData;
  abstract getDashboardTile(): DashboardTileData;
  abstract getDetailedView(): any;
  abstract getIntelligenceView(): IntelligenceViewData;
  abstract getDetailedModal(): DetailedModalData;
}