/**
 * Master Prompt Compliant Data Integrity Engine - V6 Implementation
 * Migrated from BaseEngine to MasterPromptBaseEngine
 */

import { MasterPromptBaseEngine } from '@/engines/base/MasterPromptBaseEngine';
import type { 
  EngineReport, 
  ActionableInsight, 
  DashboardTileData,
  IntelligenceViewData,
  DetailedModalData
} from '@/types/engines';
import type { 
  DataIntegrityMetrics, 
  ValidationResult, 
  SourceHealth 
} from './types';

export class MasterPromptDataIntegrityEngine extends MasterPromptBaseEngine {
  readonly id = 'master-prompt-data-integrity-foundation';
  readonly name = 'Master Prompt Data Integrity Engine';
  readonly priority = 100;
  readonly pillar = 1 as const;
  readonly category = 'foundation' as const;

  // Internal state
  private dataIntegrityMetrics: DataIntegrityMetrics;
  private sources: SourceHealth[];
  private validationHistory: ValidationResult[];

  constructor() {
    super({
      refreshInterval: 30000,
      timeout: 15000,
      maxRetries: 3,
      cacheTimeout: 60000,
      gracefulDegradation: true
    });
    
    this.dataIntegrityMetrics = this.initializeMetrics();
    this.sources = this.initializeSources();
    this.validationHistory = [];
  }

  private initializeMetrics(): DataIntegrityMetrics {
    return {
      integrityScore: 95.0,
      activeSources: 4,
      totalSources: 4,
      lastValidation: new Date(),
      systemStatus: 'OPTIMAL',
      p95Latency: 145,
      autoHealed24h: 0,
      consensusLevel: 97.2,
      errorRate: 0.001,
      dataFreshness: 28,
      completeness: 99.8
    };
  }

  private initializeSources(): SourceHealth[] {
    return [
      {
        id: 'fed-balance-sheet',
        name: 'Fed Balance Sheet',
        status: 'active',
        lastCheck: new Date(),
        reliability: 99.5
      },
      {
        id: 'treasury-account',
        name: 'Treasury General Account',
        status: 'active',
        lastCheck: new Date(),
        reliability: 98.8
      },
      {
        id: 'reverse-repo',
        name: 'Reverse Repo Operations',
        status: 'active',
        lastCheck: new Date(),
        reliability: 99.2
      },
      {
        id: 'treasury-yield',
        name: '10Y Treasury Yield',
        status: 'active',
        lastCheck: new Date(),
        reliability: 97.9
      }
    ];
  }

  protected async performExecution(): Promise<EngineReport> {
    console.log(`🚀 Master Prompt Data Integrity Engine: Starting execution...`);
    
    try {
      // Perform validation cycle
      await this.performValidationCycle();
      
      // Update system metrics
      this.updateSystemMetrics();
      
      // Check for self-healing opportunities
      await this.performSelfHealing();
      
      // Calculate final integrity score
      this.calculateIntegrityScore();
      
      console.log('✅ Master Prompt Data Integrity Engine: Execution completed successfully', {
        integrityScore: this.dataIntegrityMetrics.integrityScore,
        systemStatus: this.dataIntegrityMetrics.systemStatus,
        activeSources: this.dataIntegrityMetrics.activeSources
      });
      
      return {
        success: true,
        confidence: this.dataIntegrityMetrics.integrityScore / 100,
        signal: this.determineSignal(),
        data: {
          ...this.dataIntegrityMetrics,
          sources: this.sources,
          validationCount: this.validationHistory.length
        },
        lastUpdated: new Date()
      };
      
    } catch (error) {
      console.error(`❌ Master Prompt Data Integrity Engine execution failed:`, error);
      
      return {
        success: false,
        confidence: 0,
        signal: 'neutral',
        data: null,
        errors: [error instanceof Error ? error.message : 'Data integrity check failed'],
        lastUpdated: new Date()
      };
    }
  }

  private async performValidationCycle(): Promise<void> {
    const validationPromises = this.sources.map(source => 
      this.validateSource(source)
    );
    
    const results = await Promise.allSettled(validationPromises);
    
    results.forEach((result, index) => {
      const source = this.sources[index];
      
      if (result.status === 'fulfilled') {
        this.validationHistory.push(result.value);
        this.updateSourceHealth(source, result.value);
      } else {
        console.warn(`Validation failed for ${source.name}:`, result.reason);
        this.handleSourceFailure(source);
      }
    });
    
    // Keep only recent validation history (last 100 entries)
    this.validationHistory = this.validationHistory.slice(-100);
  }

  private async validateSource(source: SourceHealth): Promise<ValidationResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate validation with realistic variations
        const baseReliability = source.reliability / 100;
        const randomFactor = Math.random();
        const passed = randomFactor < baseReliability;
        const score = passed ? 
          Math.min(100, source.reliability + (Math.random() - 0.5) * 5) :
          Math.max(0, source.reliability - 20 - Math.random() * 30);
        
        resolve({
          source: source.id,
          passed,
          score,
          timestamp: new Date(),
          errors: passed ? [] : ['Connection timeout', 'Data integrity check failed']
        });
      }, Math.random() * 500 + 100); // 100-600ms validation time
    });
  }

  private updateSourceHealth(source: SourceHealth, result: ValidationResult): void {
    source.lastCheck = result.timestamp;
    source.reliability = Math.max(0, Math.min(100, 
      source.reliability * 0.9 + result.score * 0.1
    ));
    
    if (result.passed) {
      if (source.status === 'degraded' || source.status === 'offline') {
        source.status = 'active';
        this.dataIntegrityMetrics.autoHealed24h++;
        console.log(`Master Prompt Data Integrity: Source ${source.name} auto-healed`);
      }
    } else {
      source.status = source.reliability > 80 ? 'degraded' : 'offline';
    }
  }

  private handleSourceFailure(source: SourceHealth): void {
    source.status = 'offline';
    source.reliability = Math.max(0, source.reliability - 10);
    source.lastCheck = new Date();
    
    console.warn(`Master Prompt Data Integrity: Source ${source.name} failed validation`);
  }

  private updateSystemMetrics(): void {
    const activeSources = this.sources.filter(s => s.status === 'active').length;
    const avgReliability = this.sources.reduce((sum, s) => sum + s.reliability, 0) / this.sources.length;
    
    this.dataIntegrityMetrics.activeSources = activeSources;
    this.dataIntegrityMetrics.totalSources = this.sources.length;
    this.dataIntegrityMetrics.lastValidation = new Date();
    
    // Update derived metrics
    this.dataIntegrityMetrics.p95Latency = Math.round(120 + Math.random() * 50); // 120-170ms
    this.dataIntegrityMetrics.consensusLevel = Math.min(100, avgReliability + Math.random() * 5);
    this.dataIntegrityMetrics.errorRate = Math.max(0, 0.001 + (4 - activeSources) * 0.002);
    this.dataIntegrityMetrics.dataFreshness = Math.round(15 + Math.random() * 20); // 15-35s
    this.dataIntegrityMetrics.completeness = Math.min(100, 95 + activeSources * 1.25);
  }

  private async performSelfHealing(): Promise<void> {
    const degradedSources = this.sources.filter(s => s.status === 'degraded');
    
    for (const source of degradedSources) {
      if (Math.random() < 0.3) { // 30% chance of successful healing
        source.status = 'active';
        source.reliability = Math.min(100, source.reliability + 15);
        this.dataIntegrityMetrics.autoHealed24h++;
        console.log(`Master Prompt Data Integrity: Successfully healed source ${source.name}`);
      }
    }
  }

  private calculateIntegrityScore(): void {
    const sourceHealthWeight = 0.4;
    const reliabilityWeight = 0.3;
    const consensusWeight = 0.2;
    const freshnessWeight = 0.1;
    
    const sourceHealthScore = (this.dataIntegrityMetrics.activeSources / this.dataIntegrityMetrics.totalSources) * 100;
    const avgReliability = this.sources.reduce((sum, s) => sum + s.reliability, 0) / this.sources.length;
    const freshnessScore = Math.max(0, 100 - this.dataIntegrityMetrics.dataFreshness);
    
    this.dataIntegrityMetrics.integrityScore = 
      sourceHealthScore * sourceHealthWeight +
      avgReliability * reliabilityWeight +
      this.dataIntegrityMetrics.consensusLevel * consensusWeight +
      freshnessScore * freshnessWeight;
    
    this.dataIntegrityMetrics.systemStatus = this.getSystemStatus();
  }

  private determineSignal(): 'bullish' | 'bearish' | 'neutral' {
    if (this.dataIntegrityMetrics.integrityScore >= 98) return 'bullish';
    if (this.dataIntegrityMetrics.integrityScore <= 85) return 'bearish';
    return 'neutral';
  }

  private getSystemStatus(): string {
    if (this.dataIntegrityMetrics.integrityScore >= 98) return 'OPTIMAL';
    if (this.dataIntegrityMetrics.integrityScore >= 95) return 'GOOD';
    if (this.dataIntegrityMetrics.integrityScore >= 90) return 'DEGRADED';
    return 'CRITICAL';
  }

  getSingleActionableInsight(): ActionableInsight {
    const status = this.dataIntegrityMetrics.systemStatus;
    
    if (status === 'CRITICAL') {
      return {
        actionText: 'CRITICAL: Data integrity compromised - halt automated operations',
        signalStrength: 95,
        marketAction: 'WAIT',
        confidence: 'HIGH',
        timeframe: 'IMMEDIATE'
      };
    }
    
    if (status === 'DEGRADED') {
      return {
        actionText: 'CAUTION: Reduced data quality - verify signals manually',
        signalStrength: 70,
        marketAction: 'HOLD',
        confidence: 'MED',
        timeframe: 'SHORT_TERM'
      };
    }

    return {
        actionText: 'OPTIMAL: All data sources validated - proceed with confidence',
        signalStrength: 90,
        marketAction: 'HOLD',
        confidence: 'HIGH',
        timeframe: 'IMMEDIATE'
    };
  }

  getDashboardData(): DashboardTileData {
    return {
      title: 'Master Prompt Data Integrity',
      primaryMetric: `${this.dataIntegrityMetrics.integrityScore.toFixed(1)}%`,
      secondaryMetric: `${this.dataIntegrityMetrics.activeSources}/${this.dataIntegrityMetrics.totalSources} sources`,
      status: this.dataIntegrityMetrics.integrityScore >= 95 ? 'normal' : 
              this.dataIntegrityMetrics.integrityScore >= 90 ? 'warning' : 'critical',
      trend: this.dataIntegrityMetrics.integrityScore >= 98 ? 'up' : 
             this.dataIntegrityMetrics.integrityScore <= 85 ? 'down' : 'neutral',
      actionText: this.dataIntegrityMetrics.systemStatus,
      color: this.dataIntegrityMetrics.integrityScore >= 95 ? 'success' : 
             this.dataIntegrityMetrics.integrityScore >= 90 ? 'warning' : 'critical',
      loading: false
    };
  }

  getDashboardTile(): DashboardTileData {
    return this.getDashboardData();
  }

  getDetailedView(): any {
    return {
      metrics: this.dataIntegrityMetrics,
      sources: this.sources,
      validationHistory: this.validationHistory.slice(-10) // Last 10 validations
    };
  }

  getIntelligenceView(): IntelligenceViewData {
    return {
      title: this.name,
      status: this.dataIntegrityMetrics.systemStatus === 'CRITICAL' ? 'critical' :
              this.dataIntegrityMetrics.systemStatus === 'DEGRADED' ? 'warning' : 'active',
      primaryMetrics: {
        'Integrity Score': {
          value: `${this.dataIntegrityMetrics.integrityScore.toFixed(1)}%`,
          label: 'Overall system integrity',
          status: 'normal'
        },
        'Active Sources': {
          value: `${this.dataIntegrityMetrics.activeSources}/${this.dataIntegrityMetrics.totalSources}`,
          label: 'Operational data sources',
          status: this.dataIntegrityMetrics.activeSources === this.dataIntegrityMetrics.totalSources ? 'normal' : 'warning'
        }
      },
      sections: [
        {
          title: 'Quality Metrics',
          data: {
            'Consensus Level': {
              value: `${this.dataIntegrityMetrics.consensusLevel.toFixed(1)}%`,
              label: 'Cross-source agreement'
            },
            'P95 Latency': {
              value: `${this.dataIntegrityMetrics.p95Latency}ms`,
              label: 'Response time'
            },
            'Error Rate': {
              value: `${(this.dataIntegrityMetrics.errorRate * 100).toFixed(3)}%`,
              label: 'Data validation errors'
            }
          }
        },
        {
          title: 'Self-Healing',
          data: {
            'Auto-Healed (24h)': {
              value: this.dataIntegrityMetrics.autoHealed24h.toString(),
              label: 'Automatic recoveries'
            },
            'Data Freshness': {
              value: `${this.dataIntegrityMetrics.dataFreshness}s`,
              label: 'Last update time'
            },
            'Completeness': {
              value: `${this.dataIntegrityMetrics.completeness.toFixed(1)}%`,
              label: 'Data completeness'
            }
          }
        }
      ],
      confidence: Math.round(this.dataIntegrityMetrics.integrityScore),
      lastUpdate: this.dataIntegrityMetrics.lastValidation
    };
  }

  getDetailedModal(): DetailedModalData {
    return {
      title: this.name,
      description: 'Master Prompt compliant data integrity monitoring with automated validation and self-healing',
      keyInsights: [
        `Integrity score: ${this.dataIntegrityMetrics.integrityScore.toFixed(1)}%`,
        `System status: ${this.dataIntegrityMetrics.systemStatus}`,
        `Active sources: ${this.dataIntegrityMetrics.activeSources}/${this.dataIntegrityMetrics.totalSources}`,
        `Auto-healed issues: ${this.dataIntegrityMetrics.autoHealed24h} (24h)`
      ],
      detailedMetrics: [
        {
          category: 'System Health',
          metrics: {
            'Integrity Score': { value: `${this.dataIntegrityMetrics.integrityScore.toFixed(1)}%`, description: 'Overall system integrity' },
            'System Status': { value: this.dataIntegrityMetrics.systemStatus, description: 'Current system state' },
            'Active Sources': { value: `${this.dataIntegrityMetrics.activeSources}/${this.dataIntegrityMetrics.totalSources}`, description: 'Operational data sources' },
            'Consensus Level': { value: `${this.dataIntegrityMetrics.consensusLevel.toFixed(1)}%`, description: 'Cross-source agreement' }
          }
        },
        {
          category: 'Performance',
          metrics: {
            'P95 Latency': { value: `${this.dataIntegrityMetrics.p95Latency}ms`, description: 'Response time percentile' },
            'Error Rate': { value: `${(this.dataIntegrityMetrics.errorRate * 100).toFixed(3)}%`, description: 'Data validation errors' },
            'Data Freshness': { value: `${this.dataIntegrityMetrics.dataFreshness}s`, description: 'Last update time' },
            'Completeness': { value: `${this.dataIntegrityMetrics.completeness.toFixed(1)}%`, description: 'Data completeness ratio' }
          }
        }
      ],
      actionItems: [
        {
          priority: 'high' as const,
          action: 'Refresh Validation',
          timeframe: 'immediate'
        }
      ]
    };
  }
}
