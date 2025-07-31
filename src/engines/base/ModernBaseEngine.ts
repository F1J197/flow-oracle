/**
 * LIQUIDITY² V6 - Modern Base Engine
 * Phase 2: Engine System Architecture Modernization
 * 
 * Enhanced base engine with improved error handling, metrics, and real-time capabilities
 */

import { IEngine, EngineReport, ActionableInsight, DashboardTileData, DetailedEngineView, IntelligenceViewData, DetailedModalData } from '@/types/engines';
import { EventEmitter } from 'events';

export interface ModernEngineConfig {
  refreshInterval: number;
  retryAttempts: number;
  timeout: number;
  cacheTimeout: number;
  enableMetrics: boolean;
  enableRealtime: boolean;
  gracefulDegradation: boolean;
}

export interface EngineMetrics {
  executionTime: number;
  successRate: number;
  lastError?: string;
  totalExecutions: number;
  averageConfidence: number;
  healthScore: number;
  uptime: number;
  lastSuccess?: Date;
  consecutiveFailures: number;
}

export interface EngineState {
  status: 'idle' | 'running' | 'error' | 'degraded' | 'healthy';
  lastReport?: EngineReport;
  lastError?: string;
  retryCount: number;
  isHealthy: boolean;
  startTime: Date;
}

export abstract class ModernBaseEngine extends EventEmitter implements IEngine {
  // Abstract properties that must be implemented
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly priority: number;
  abstract readonly pillar: 1 | 2 | 3;
  abstract readonly category: 'foundation' | 'core' | 'synthesis' | 'execution';
  abstract readonly dependencies: string[];

  protected config: ModernEngineConfig;
  protected metrics: EngineMetrics;
  protected state: EngineState;
  protected cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private executionPromise?: Promise<EngineReport>;

  constructor(config: Partial<ModernEngineConfig> = {}) {
    super();
    
    this.config = {
      refreshInterval: 15000,
      retryAttempts: 3,
      timeout: 10000,
      cacheTimeout: 30000,
      enableMetrics: true,
      enableRealtime: false,
      gracefulDegradation: true,
      ...config
    };

    this.metrics = {
      executionTime: 0,
      successRate: 100,
      totalExecutions: 0,
      averageConfidence: 0,
      healthScore: 100,
      uptime: 0,
      consecutiveFailures: 0
    };

    this.state = {
      status: 'idle',
      retryCount: 0,
      isHealthy: true,
      startTime: new Date()
    };

    this.initializeEngine();
  }

  // === CORE EXECUTION ===
  public async execute(): Promise<EngineReport> {
    // Prevent concurrent executions
    if (this.executionPromise) {
      return this.executionPromise;
    }

    this.executionPromise = this.executeWithMetrics();
    
    try {
      const result = await this.executionPromise;
      return result;
    } finally {
      this.executionPromise = undefined;
    }
  }

  private async executeWithMetrics(): Promise<EngineReport> {
    const startTime = Date.now();
    this.state.status = 'running';
    this.emit('execution:start', { engineId: this.id });

    try {
      const report = await this.executeWithTimeout();
      const executionTime = Date.now() - startTime;

      this.updateMetricsOnSuccess(executionTime, report.confidence);
      this.state.status = 'healthy';
      this.state.lastReport = report;
      this.state.retryCount = 0;
      this.metrics.consecutiveFailures = 0;

      this.emit('execution:success', { 
        engineId: this.id, 
        report, 
        executionTime 
      });

      return report;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      return this.handleExecutionError(error, executionTime);
    }
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

  private handleExecutionError(error: any, executionTime: number): EngineReport {
    this.metrics.consecutiveFailures++;
    this.updateMetricsOnFailure(executionTime);
    
    const errorMessage = error?.message || 'Unknown execution error';
    this.state.lastError = errorMessage;
    this.state.status = this.config.gracefulDegradation ? 'degraded' : 'error';

    this.emit('execution:error', { 
      engineId: this.id, 
      error: errorMessage, 
      executionTime 
    });

    if (this.config.gracefulDegradation) {
      return this.createDegradedReport(errorMessage);
    } else {
      return this.createErrorReport(errorMessage);
    }
  }

  // === ABSTRACT METHODS ===
  protected abstract performExecution(): Promise<EngineReport>;
  
  public abstract getSingleActionableInsight(): ActionableInsight;
  public abstract getDashboardData(): DashboardTileData;
  public abstract getDetailedView(): DetailedEngineView;
  public abstract getIntelligenceView(): IntelligenceViewData;
  public abstract getDetailedModal(): DetailedModalData;

  // === CACHING SYSTEM ===
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

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  protected clearCache(): void {
    this.cache.clear();
  }

  // === METRICS AND MONITORING ===
  private updateMetricsOnSuccess(executionTime: number, confidence: number): void {
    if (!this.config.enableMetrics) return;

    this.metrics.totalExecutions++;
    this.metrics.executionTime = executionTime;
    this.metrics.lastSuccess = new Date();

    // Update success rate
    const successCount = (this.metrics.successRate / 100) * (this.metrics.totalExecutions - 1);
    this.metrics.successRate = ((successCount + 1) / this.metrics.totalExecutions) * 100;

    // Update average confidence
    const totalConfidence = this.metrics.averageConfidence * (this.metrics.totalExecutions - 1);
    this.metrics.averageConfidence = (totalConfidence + confidence) / this.metrics.totalExecutions;

    // Calculate health score
    this.metrics.healthScore = this.calculateHealthScore();

    this.emit('metrics:updated', this.metrics);
  }

  private updateMetricsOnFailure(executionTime: number): void {
    if (!this.config.enableMetrics) return;

    this.metrics.totalExecutions++;
    this.metrics.executionTime = executionTime;

    // Update success rate
    const successCount = (this.metrics.successRate / 100) * (this.metrics.totalExecutions - 1);
    this.metrics.successRate = (successCount / this.metrics.totalExecutions) * 100;

    // Calculate health score
    this.metrics.healthScore = this.calculateHealthScore();

    this.emit('metrics:updated', this.metrics);
  }

  private calculateHealthScore(): number {
    const successWeight = 0.4;
    const failureWeight = 0.3;
    const uptimeWeight = 0.3;

    const successScore = this.metrics.successRate;
    const failureScore = Math.max(0, 100 - (this.metrics.consecutiveFailures * 20));
    const uptimeScore = Math.min(100, (Date.now() - this.state.startTime.getTime()) / 3600000 * 10); // 10 points per hour up to 100

    return (successScore * successWeight) + (failureScore * failureWeight) + (uptimeScore * uptimeWeight);
  }

  // === REPORT CREATION ===
  protected createDegradedReport(message: string): EngineReport {
    return {
      success: true,
      confidence: 25, // Low confidence for degraded mode
      signal: 'neutral',
      data: { 
        degraded: true,
        message: `Engine operating in degraded mode: ${message}`,
        fallbackData: this.getFallbackData()
      },
      errors: [],
      lastUpdated: new Date()
    };
  }

  protected createErrorReport(message: string): EngineReport {
    this.metrics.lastError = message;
    return {
      success: false,
      confidence: 0,
      signal: 'neutral',
      data: { error: message },
      errors: [message],
      lastUpdated: new Date()
    };
  }

  protected getFallbackData(): any {
    // Return cached data or default values
    const lastReport = this.state.lastReport;
    if (lastReport?.success) {
      return {
        ...lastReport.data,
        stale: true,
        timestamp: lastReport.lastUpdated
      };
    }
    return {};
  }

  // === HEALTH AND STATUS ===
  public getStatus(): 'running' | 'idle' | 'error' | 'loading' | 'degraded' | 'healthy' {
    return this.state.status;
  }

  public getMetrics(): EngineMetrics {
    this.metrics.uptime = Date.now() - this.state.startTime.getTime();
    return { ...this.metrics };
  }

  public getState(): EngineState {
    return { ...this.state };
  }

  public isHealthy(): boolean {
    return this.metrics.healthScore > 50 && this.metrics.consecutiveFailures < 3;
  }

  public getAge(): number {
    return Date.now() - this.state.startTime.getTime();
  }

  // === LIFECYCLE ===
  private initializeEngine(): void {
    if (this.config.enableRealtime) {
      this.setupRealtimeUpdates();
    }

    this.emit('engine:initialized', { 
      engineId: this.id, 
      config: this.config 
    });
  }

  private setupRealtimeUpdates(): void {
    // Setup real-time data subscriptions if enabled
    // This would integrate with WebSocket manager
    this.emit('realtime:setup', { engineId: this.id });
  }

  public shutdown(): void {
    this.state.status = 'idle';
    this.clearCache();
    this.removeAllListeners();
    this.emit('engine:shutdown', { engineId: this.id });
  }

  // === DEFAULT TILE IMPLEMENTATION ===
  public getDashboardTile(): DashboardTileData {
    return this.getDashboardData();
  }
}