/**
 * Foundation Engine Orchestrator
 * Coordinates execution and dependency management for foundation engines
 */

import { EventEmitter } from 'events';
import { DataIntegrityEngine } from './DataIntegrityEngine';
import { EnhancedMomentumEngine } from './EnhancedMomentumEngine';
import { EnhancedZScoreEngine } from './EnhancedZScoreEngine';
import type { EngineReport } from '@/types/engines';

export interface FoundationEngineStatus {
  dataIntegrity: {
    status: 'running' | 'idle' | 'error' | 'loading';
    lastExecution: Date | null;
    report: EngineReport | null;
  };
  momentum: {
    status: 'running' | 'idle' | 'error' | 'loading';
    lastExecution: Date | null;
    report: EngineReport | null;
  };
  zScore: {
    status: 'running' | 'idle' | 'error' | 'loading';
    lastExecution: Date | null;
    report: EngineReport | null;
  };
}

export interface FoundationOrchestratorConfig {
  executionInterval?: number;
  maxConcurrentEngines?: number;
  retryAttempts?: number;
  healthCheckInterval?: number;
}

export class FoundationEngineOrchestrator extends EventEmitter {
  private static instance: FoundationEngineOrchestrator;
  
  private dataIntegrityEngine: DataIntegrityEngine;
  private momentumEngine: EnhancedMomentumEngine;
  private zScoreEngine: EnhancedZScoreEngine;
  
  private config: FoundationOrchestratorConfig;
  private status: FoundationEngineStatus;
  private isExecuting = false;
  private executionInterval?: NodeJS.Timeout;
  private healthCheckInterval?: NodeJS.Timeout;

  private constructor(config: FoundationOrchestratorConfig = {}) {
    super();
    
    this.config = {
      executionInterval: 30000, // 30 seconds
      maxConcurrentEngines: 3,
      retryAttempts: 2,
      healthCheckInterval: 60000, // 1 minute
      ...config
    };

    // Initialize engines
    this.dataIntegrityEngine = new DataIntegrityEngine();
    this.momentumEngine = new EnhancedMomentumEngine();
    this.zScoreEngine = new EnhancedZScoreEngine();

    // Initialize status
    this.status = {
      dataIntegrity: {
        status: 'idle',
        lastExecution: null,
        report: null
      },
      momentum: {
        status: 'idle',
        lastExecution: null,
        report: null
      },
      zScore: {
        status: 'idle',
        lastExecution: null,
        report: null
      }
    };

    // Event listeners removed - engines don't extend EventEmitter
  }

  public static getInstance(config?: FoundationOrchestratorConfig): FoundationEngineOrchestrator {
    if (!FoundationEngineOrchestrator.instance) {
      FoundationEngineOrchestrator.instance = new FoundationEngineOrchestrator(config);
    }
    return FoundationEngineOrchestrator.instance;
  }

  // Event listeners removed - engines use BaseEngine pattern

  public async executeAll(): Promise<Map<string, EngineReport>> {
    if (this.isExecuting) {
      throw new Error('Foundation engines are already executing');
    }

    this.isExecuting = true;
    const results = new Map<string, EngineReport>();

    try {
      this.emit('orchestrator:start');

      // Execute engines in dependency order
      // 1. Data Integrity first (validates data sources)
      const dataIntegrityResult = await this.executeEngine('dataIntegrity');
      results.set('dataIntegrity', dataIntegrityResult);

      // 2. Execute Momentum and Z-Score in parallel (both depend on data integrity)
      const [momentumResult, zScoreResult] = await Promise.allSettled([
        this.executeEngine('momentum'),
        this.executeEngine('zScore')
      ]);

      if (momentumResult.status === 'fulfilled') {
        results.set('momentum', momentumResult.value);
      } else {
        console.error('Momentum engine failed:', momentumResult.reason);
      }

      if (zScoreResult.status === 'fulfilled') {
        results.set('zScore', zScoreResult.value);
      } else {
        console.error('Z-Score engine failed:', zScoreResult.reason);
      }

      this.emit('orchestrator:success', { results });
      return results;

    } catch (error) {
      this.emit('orchestrator:error', { error });
      throw error;
    } finally {
      this.isExecuting = false;
      this.emit('orchestrator:complete');
    }
  }

  private async executeEngine(engineName: 'dataIntegrity' | 'momentum' | 'zScore'): Promise<EngineReport> {
    const engine = this.getEngine(engineName);
    
    try {
      const report = await engine.execute();
      return report;
    } catch (error) {
      console.error(`Foundation engine ${engineName} execution failed:`, error);
      throw error;
    }
  }

  private getEngine(engineName: 'dataIntegrity' | 'momentum' | 'zScore') {
    switch (engineName) {
      case 'dataIntegrity':
        return this.dataIntegrityEngine;
      case 'momentum':
        return this.momentumEngine;
      case 'zScore':
        return this.zScoreEngine;
      default:
        throw new Error(`Unknown engine: ${engineName}`);
    }
  }

  public getStatus(): FoundationEngineStatus {
    return { ...this.status };
  }

  public getEngineStatus(engineName: 'dataIntegrity' | 'momentum' | 'zScore') {
    return this.status[engineName];
  }

  public getHealthScore(): number {
    const engines = [this.status.dataIntegrity, this.status.momentum, this.status.zScore];
    const healthyEngines = engines.filter(engine => 
      engine.status === 'idle' && engine.lastExecution && engine.report?.success
    ).length;
    
    return Math.round((healthyEngines / engines.length) * 100);
  }

  public startAutoExecution(): void {
    if (this.executionInterval) {
      this.stopAutoExecution();
    }

    this.executionInterval = setInterval(async () => {
      try {
        await this.executeAll();
      } catch (error) {
        console.error('Auto-execution failed:', error);
      }
    }, this.config.executionInterval);

    this.emit('auto-execution:started');
  }

  public stopAutoExecution(): void {
    if (this.executionInterval) {
      clearInterval(this.executionInterval);
      this.executionInterval = undefined;
      this.emit('auto-execution:stopped');
    }
  }

  public startHealthCheck(): void {
    if (this.healthCheckInterval) {
      this.stopHealthCheck();
    }

    this.healthCheckInterval = setInterval(() => {
      const healthScore = this.getHealthScore();
      this.emit('health-check', { score: healthScore, status: this.status });
      
      if (healthScore < 50) {
        this.emit('health-warning', { score: healthScore });
      }
    }, this.config.healthCheckInterval);
  }

  public stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  public destroy(): void {
    this.stopAutoExecution();
    this.stopHealthCheck();
    this.removeAllListeners();
  }
}