import { IEngine, EngineReport, ActionableInsight, DashboardTileData, DetailedEngineView } from '@/types/engines';

export interface ResilientEngineConfig {
  refreshInterval: number;
  maxRetries: number;
  timeout: number;
  cacheTimeout: number;
  gracefulDegradation: boolean;
}

export interface EngineState {
  status: 'idle' | 'running' | 'error' | 'degraded' | 'offline';
  lastReport?: EngineReport;
  lastError?: string;
  retryCount: number;
  lastSuccess?: Date;
  executionTime?: number;
}

/**
 * Resilient Base Engine - V6 Implementation
 * Provides robust error handling, graceful degradation, and consistent patterns
 */
export abstract class ResilientBaseEngine implements IEngine {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly priority: number;
  abstract readonly pillar: 1 | 2 | 3;

  protected config: ResilientEngineConfig;
  protected state: EngineState;
  protected cache: Map<string, { data: any; timestamp: number }> = new Map();
  protected isExecuting: boolean = false;

  constructor(config: Partial<ResilientEngineConfig> = {}) {
    this.config = {
      refreshInterval: 30000, // More conservative default
      maxRetries: 2,         // Fewer retries to prevent loops
      timeout: 15000,        // Longer timeout
      cacheTimeout: 60000,   // 1 minute cache
      gracefulDegradation: true,
      ...config
    };

    this.state = {
      status: 'idle',
      retryCount: 0
    };
  }

  async execute(): Promise<EngineReport> {
    // Prevent concurrent executions
    if (this.isExecuting) {
      return this.getLastSuccessfulReport() || this.createDegradedReport('Engine busy');
    }

    this.isExecuting = true;
    const startTime = Date.now();

    try {
      this.state.status = 'running';
      
      // Try cached data first if available
      const cachedReport = this.getCachedReport();
      if (cachedReport && this.shouldUseCachedData()) {
        console.log(`${this.id}: Using cached data`);
        return cachedReport;
      }

      // Execute with timeout and retry logic
      const report = await this.executeWithRetries();
      
      this.state.executionTime = Date.now() - startTime;
      this.state.lastReport = report;
      this.state.status = report.success ? 'idle' : 'error';
      this.state.retryCount = 0;
      this.state.lastSuccess = report.success ? new Date() : this.state.lastSuccess;
      
      if (report.success) {
        this.setCacheData('lastReport', report);
      }

      return report;

    } catch (error) {
      this.state.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.state.status = 'error';
      this.state.retryCount++;

      console.warn(`${this.id}: Execution failed (attempt ${this.state.retryCount}):`, error);

      // Return degraded service if enabled
      if (this.config.gracefulDegradation) {
        return this.createDegradedReport(this.state.lastError);
      }

      return this.createErrorReport(this.state.lastError);

    } finally {
      this.isExecuting = false;
    }
  }

  private async executeWithRetries(): Promise<EngineReport> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await this.executeWithTimeout();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.maxRetries) {
          // Exponential backoff with jitter
          const delay = Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 1000, 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
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

  protected abstract performExecution(): Promise<EngineReport>;

  private shouldUseCachedData(): boolean {
    const cached = this.cache.get('lastReport');
    if (!cached) return false;

    const age = Date.now() - cached.timestamp;
    const isStale = age > this.config.cacheTimeout;
    
    // Use cached data if not stale or if engine is in error state
    return !isStale || this.state.status === 'error';
  }

  private getCachedReport(): EngineReport | null {
    const cached = this.cache.get('lastReport');
    if (!cached) return null;

    return cached.data;
  }

  private getLastSuccessfulReport(): EngineReport | null {
    const cached = this.getCachedReport();
    return cached?.success ? cached : null;
  }

  private createDegradedReport(message: string): EngineReport {
    const lastSuccess = this.getLastSuccessfulReport();
    
    return {
      success: true, // Still considered successful in degraded mode
      confidence: Math.max(0.3, (lastSuccess?.confidence || 0) * 0.7), // Reduced confidence
      signal: lastSuccess?.signal || 'neutral',
      data: {
        ...lastSuccess?.data,
        degraded: true,
        reason: message,
        lastUpdate: lastSuccess?.lastUpdated || new Date(Date.now() - 300000) // 5 min ago
      },
      lastUpdated: new Date()
    };
  }

  private createErrorReport(message: string): EngineReport {
    return {
      success: false,
      confidence: 0,
      signal: 'neutral',
      data: { error: message },
      errors: [message],
      lastUpdated: new Date()
    };
  }

  protected setCacheData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  protected getCacheData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.config.cacheTimeout;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Abstract methods that must be implemented
  abstract getSingleActionableInsight(): ActionableInsight;
  abstract getDashboardData(): DashboardTileData;
  abstract getDetailedView(): DetailedEngineView;

  // Public status methods
  getState(): EngineState {
    return { ...this.state };
  }

  isHealthy(): boolean {
    return this.state.status === 'idle' && this.state.retryCount === 0;
  }

  getAge(): number {
    if (!this.state.lastSuccess) return Infinity;
    return Date.now() - this.state.lastSuccess.getTime();
  }
}