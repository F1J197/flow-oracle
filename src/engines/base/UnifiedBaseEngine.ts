/**
 * Unified Base Engine - V6 Implementation
 * Single source of truth for all engine functionality
 */

import { BrowserEventEmitter } from '../../utils/BrowserEventEmitter';
import type { 
  IEngine, 
  EngineReport, 
  ActionableInsight, 
  DashboardTileData, 
  IntelligenceViewData, 
  DetailedModalData, 
  DetailedEngineView 
} from '../../types/engines';

export interface UnifiedEngineConfig {
  refreshInterval: number;
  retryAttempts: number;
  timeout: number;
  cacheTimeout: number;
  gracefulDegradation: boolean;
  enableEvents: boolean;
}

export interface UnifiedEngineState {
  status: 'idle' | 'running' | 'error' | 'loading';
  lastReport: EngineReport | null;
  lastError: string | null;
  retryCount: number;
  isHealthy: boolean;
  executionCount: number;
  averageExecutionTime: number;
  lastSuccessfulExecution: Date | null;
}

export interface EngineMetrics {
  executionTime: number;
  successRate: number;
  confidenceScore: number;
  dataQuality: number;
}

export abstract class UnifiedBaseEngine extends BrowserEventEmitter implements IEngine {
  // Abstract properties - must be implemented by subclasses
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly priority: number;
  abstract readonly pillar: 1 | 2 | 3;
  abstract readonly category: 'foundation' | 'core' | 'synthesis' | 'execution';

  protected config: UnifiedEngineConfig;
  protected state: UnifiedEngineState;
  protected cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private executionPromise: Promise<EngineReport> | null = null;

  constructor(config: Partial<UnifiedEngineConfig> = {}) {
    super();
    
    this.config = {
      refreshInterval: 15000,
      retryAttempts: 3,
      timeout: 10000,
      cacheTimeout: 30000,
      gracefulDegradation: true,
      enableEvents: true,
      ...config
    };

    this.state = {
      status: 'idle',
      lastReport: null,
      lastError: null,
      retryCount: 0,
      isHealthy: true,
      executionCount: 0,
      averageExecutionTime: 0,
      lastSuccessfulExecution: null
    };
  }

  async execute(): Promise<EngineReport> {
    // Prevent concurrent executions
    if (this.executionPromise) {
      return this.executionPromise;
    }

    this.executionPromise = this.executeInternal();
    
    try {
      const result = await this.executionPromise;
      return result;
    } finally {
      this.executionPromise = null;
    }
  }

  private async executeInternal(): Promise<EngineReport> {
    const startTime = Date.now();
    
    this.updateState({ status: 'running' });
    this.emit('execution:start', { engineId: this.id, timestamp: startTime });

    try {
      // Check cache first
      const cachedReport = this.getCachedReport();
      if (cachedReport && this.shouldUseCachedData()) {
        this.emit('execution:cache-hit', { engineId: this.id, data: cachedReport });
        return cachedReport;
      }

      // Execute with retries
      const report = await this.executeWithRetries();
      
      // Update metrics and state
      const executionTime = Date.now() - startTime;
      this.updateExecutionMetrics(executionTime, true);
      this.setCachedReport(report);
      
      this.updateState({ 
        status: 'idle',
        lastReport: report,
        lastError: null,
        retryCount: 0,
        isHealthy: true,
        lastSuccessfulExecution: new Date()
      });

      this.emit('execution:success', { 
        engineId: this.id, 
        report, 
        executionTime,
        timestamp: Date.now()
      });

      return report;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.updateExecutionMetrics(executionTime, false);
      
      // Try graceful degradation
      let report: EngineReport;
      if (this.config.gracefulDegradation) {
        report = this.createDegradedReport(errorMessage);
      } else {
        report = this.createErrorReport(errorMessage);
      }

      this.updateState({
        status: 'error',
        lastReport: report,
        lastError: errorMessage,
        isHealthy: false
      });

      this.emit('execution:error', { 
        engineId: this.id, 
        error: errorMessage, 
        report,
        executionTime,
        timestamp: Date.now()
      });

      return report;
    }
  }

  private async executeWithRetries(): Promise<EngineReport> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        this.updateState({ retryCount: attempt });
        
        if (attempt > 0) {
          this.emit('execution:retry', { 
            engineId: this.id, 
            attempt, 
            maxAttempts: this.config.retryAttempts 
          });
        }

        return await this.executeWithTimeout();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < this.config.retryAttempts) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  private async executeWithTimeout(): Promise<EngineReport> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Engine execution timeout')), this.config.timeout);
    });

    return Promise.race([
      this.performExecution(),
      timeoutPromise
    ]);
  }

  // Abstract method that subclasses must implement
  protected abstract performExecution(): Promise<EngineReport>;

  // Cache management
  protected shouldUseCachedData(): boolean {
    const cached = this.cache.get('report');
    if (!cached) return false;
    
    const age = Date.now() - cached.timestamp;
    return age < cached.ttl;
  }

  protected getCachedReport(): EngineReport | null {
    const cached = this.cache.get('report');
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > cached.ttl) {
      this.cache.delete('report');
      return null;
    }
    
    return cached.data;
  }

  protected setCachedReport(report: EngineReport): void {
    this.cache.set('report', {
      data: report,
      timestamp: Date.now(),
      ttl: this.config.cacheTimeout
    });
  }

  protected setCacheData(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.cacheTimeout
    });
  }

  protected getCacheData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // State management
  private updateState(updates: Partial<UnifiedEngineState>): void {
    this.state = { ...this.state, ...updates };
    
    if (this.config.enableEvents) {
      this.emit('state:change', { 
        engineId: this.id, 
        state: this.state,
        timestamp: Date.now()
      });
    }
  }

  private updateExecutionMetrics(executionTime: number, success: boolean): void {
    this.state.executionCount++;
    
    // Update average execution time
    const totalTime = this.state.averageExecutionTime * (this.state.executionCount - 1) + executionTime;
    this.state.averageExecutionTime = totalTime / this.state.executionCount;
  }

  // Report factories
  protected createDegradedReport(reason: string): EngineReport {
    const lastReport = this.state.lastReport;
    
    return {
      success: false,
      confidence: lastReport ? Math.max(0, lastReport.confidence - 0.3) : 0.1,
      signal: lastReport?.signal || 'neutral',
      data: {
        degraded: true,
        reason,
        lastKnownData: lastReport?.data || null,
        timestamp: new Date()
      },
      errors: [`Degraded operation: ${reason}`],
      lastUpdated: new Date()
    };
  }

  protected createErrorReport(message: string): EngineReport {
    return {
      success: false,
      confidence: 0,
      signal: 'neutral',
      data: { 
        error: message,
        timestamp: new Date()
      },
      errors: [message],
      lastUpdated: new Date()
    };
  }

  // Public getters
  getState(): UnifiedEngineState {
    return { ...this.state };
  }

  getMetrics(): EngineMetrics {
    const report = this.state.lastReport;
    
    return {
      executionTime: this.state.averageExecutionTime,
      successRate: this.calculateSuccessRate(),
      confidenceScore: report?.confidence || 0,
      dataQuality: this.calculateDataQuality()
    };
  }

  isHealthy(): boolean {
    return this.state.isHealthy && this.getAge() < 300000; // 5 minutes
  }

  getAge(): number {
    if (!this.state.lastSuccessfulExecution) return Infinity;
    return Date.now() - this.state.lastSuccessfulExecution.getTime();
  }

  private calculateSuccessRate(): number {
    if (this.state.executionCount === 0) return 100;
    
    // Simple implementation - can be enhanced based on actual success tracking
    return this.state.isHealthy ? 95 : 60;
  }

  private calculateDataQuality(): number {
    const report = this.state.lastReport;
    if (!report) return 0;
    
    const age = this.getAge();
    const freshnessScore = Math.max(0, 1 - (age / 300000)); // Degrade over 5 minutes
    const confidenceScore = report.confidence;
    
    return (freshnessScore + confidenceScore) / 2;
  }

  // Abstract methods that subclasses must implement
  abstract getSingleActionableInsight(): ActionableInsight;
  abstract getDashboardData(): DashboardTileData;
  abstract getDetailedView(): DetailedEngineView;
  abstract getIntelligenceView(): IntelligenceViewData;
  abstract getDetailedModal(): DetailedModalData;

  // Default implementation for getDashboardTile
  getDashboardTile(): DashboardTileData {
    return this.getDashboardData();
  }
}