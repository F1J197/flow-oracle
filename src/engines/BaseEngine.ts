import { IEngine, EngineReport, ActionableInsight, DashboardTileData, DetailedEngineView, IntelligenceViewData, DetailedModalData } from '@/types/engines';

// Add missing interfaces for specification compliance
export interface EngineConfig {
  id: string;
  name: string;
  pillar: string;
  updateInterval: number;
  requiredIndicators: string[];
  dependencies: string[];
}

export interface EngineOutput {
  primaryMetric: {
    value: number;
    change24h: number;
    changePercent: number;
  };
  signal: 'RISK_ON' | 'RISK_OFF' | 'WARNING' | 'NEUTRAL';
  confidence: number;
  analysis: string;
  subMetrics: Record<string, any>;
  alerts?: Alert[];
}

export interface Alert {
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
}

export interface BaseEngineConfig {
  refreshInterval: number;
  retryAttempts: number;
  timeout: number;
  cacheTimeout: number;
}

export interface EngineMetrics {
  executionTime: number;
  successRate: number;
  lastError?: string;
  totalExecutions: number;
  averageConfidence: number;
}

export abstract class BaseEngine implements IEngine {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly priority: number;
  abstract readonly pillar: 1 | 2 | 3;
  abstract readonly category: 'foundation' | 'core' | 'synthesis' | 'execution';

  protected config: BaseEngineConfig;
  protected metrics: EngineMetrics;
  protected cache: Map<string, { data: any; timestamp: number }> = new Map();
  protected isExecuting: boolean = false;

  constructor(config: Partial<BaseEngineConfig> = {}) {
    this.config = {
      refreshInterval: 15000,
      retryAttempts: 3,
      timeout: 10000,
      cacheTimeout: 30000,
      ...config
    };

    this.metrics = {
      executionTime: 0,
      successRate: 100,
      totalExecutions: 0,
      averageConfidence: 0
    };
  }

  async execute(): Promise<EngineReport> {
    if (this.isExecuting) {
      return this.getLastReport() || this.createErrorReport('Engine busy');
    }

    this.isExecuting = true;
    const startTime = Date.now();

    try {
      const report = await this.executeWithTimeout();
      this.updateMetrics(true, Date.now() - startTime, report.confidence);
      return report;
    } catch (error) {
      const errorReport = this.createErrorReport(error.message);
      this.updateMetrics(false, Date.now() - startTime, 0);
      return errorReport;
    } finally {
      this.isExecuting = false;
    }
  }

  abstract getSingleActionableInsight(): ActionableInsight;
  abstract getDashboardData(): DashboardTileData;
  abstract getDetailedView(): DetailedEngineView;
  
  // Default implementations that can be overridden
  getDashboardTile(): DashboardTileData {
    return this.getDashboardData();
  }
  
  abstract getIntelligenceView(): IntelligenceViewData;
  abstract getDetailedModal(): DetailedModalData;

  protected abstract performExecution(): Promise<EngineReport>;

  private async executeWithTimeout(): Promise<EngineReport> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Engine execution timeout')), this.config.timeout);
    });

    return Promise.race([
      this.performExecution(),
      timeoutPromise
    ]);
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

  private updateMetrics(success: boolean, executionTime: number, confidence: number): void {
    this.metrics.totalExecutions++;
    this.metrics.executionTime = executionTime;
    
    const successCount = this.metrics.successRate * (this.metrics.totalExecutions - 1) / 100;
    this.metrics.successRate = success 
      ? ((successCount + 1) / this.metrics.totalExecutions) * 100
      : (successCount / this.metrics.totalExecutions) * 100;

    if (success) {
      const totalConfidence = this.metrics.averageConfidence * (this.metrics.totalExecutions - 1);
      this.metrics.averageConfidence = (totalConfidence + confidence) / this.metrics.totalExecutions;
    }
  }

  private createErrorReport(message: string): EngineReport {
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

  private getLastReport(): EngineReport | null {
    const cached = this.getCacheData('lastReport');
    return cached || null;
  }

  getMetrics(): EngineMetrics {
    return { ...this.metrics };
  }

  getStatus(): 'running' | 'idle' | 'error' | 'loading' {
    if (this.isExecuting) return 'running';
    if (this.metrics.lastError) return 'error';
    if (this.metrics.totalExecutions === 0) return 'loading';
    return 'idle';
  }
}