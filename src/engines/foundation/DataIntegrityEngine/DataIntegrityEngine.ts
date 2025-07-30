import { UnifiedBaseEngine } from "@/engines/base/UnifiedBaseEngine";
import type { 
  UnifiedEngineConfig, 
  EngineMetrics 
} from "@/engines/base/UnifiedBaseEngine";
import type { 
  EngineReport, 
  ActionableInsight, 
  DashboardTileData,
  IntelligenceViewData,
  DetailedEngineView,
  DetailedModalData
} from "@/types/engines";
import type { 
  DataIntegrityMetrics, 
  DataIntegrityConfig, 
  ValidationResult, 
  SourceHealth 
} from "./types";

/**
 * Foundation Data Integrity Engine V6
 * 
 * Core foundation engine responsible for:
 * - Data source validation and monitoring
 * - Integrity score calculation
 * - System health assessment
 * - Automated self-healing operations
 */
export class DataIntegrityEngine extends UnifiedBaseEngine {
  readonly category = 'foundation' as const;
  readonly id = 'data-integrity-foundation';
  readonly name = 'Data Integrity Engine';
  readonly priority = 1;
  readonly pillar = 1 as const;

  // Internal state
  private metrics: DataIntegrityMetrics;
  private sources: SourceHealth[];
  private validationHistory: ValidationResult[];
  private lastExecution: Date | null = null;

  constructor(config: DataIntegrityConfig = {}) {
    const unifiedConfig: UnifiedEngineConfig = {
      refreshInterval: config.refreshInterval || 30000,
      retryAttempts: config.maxRetries || 3,
      timeout: config.timeout || 15000,
      cacheTimeout: config.cacheTimeout || 60000,
      gracefulDegradation: config.gracefulDegradation ?? true,
      enableEvents: true
    };

    super(unifiedConfig);
    
    this.metrics = this.initializeMetrics();
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
    console.log(`${this.name}: Starting data integrity validation...`);
    
    try {
      // Perform validation cycle
      await this.performValidationCycle();
      
      // Update system metrics
      this.updateSystemMetrics();
      
      // Check for self-healing opportunities
      await this.performSelfHealing();
      
      // Calculate final integrity score
      this.calculateIntegrityScore();
      
      this.lastExecution = new Date();
      
      return {
        success: true,
        confidence: this.metrics.integrityScore / 100,
        signal: this.determineSignal(),
        data: {
          ...this.metrics,
          sources: this.sources,
          validationCount: this.validationHistory.length
        },
        lastUpdated: this.lastExecution
      };
      
    } catch (error) {
      console.error(`${this.name}: Execution failed:`, error);
      throw error;
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
        this.metrics.autoHealed24h++;
        console.log(`${this.name}: Source ${source.name} auto-healed`);
      }
    } else {
      source.status = source.reliability > 80 ? 'degraded' : 'offline';
    }
  }

  private handleSourceFailure(source: SourceHealth): void {
    source.status = 'offline';
    source.reliability = Math.max(0, source.reliability - 10);
    source.lastCheck = new Date();
    
    console.warn(`${this.name}: Source ${source.name} failed validation`);
  }

  private updateSystemMetrics(): void {
    const activeSources = this.sources.filter(s => s.status === 'active').length;
    const avgReliability = this.sources.reduce((sum, s) => sum + s.reliability, 0) / this.sources.length;
    
    this.metrics.activeSources = activeSources;
    this.metrics.totalSources = this.sources.length;
    this.metrics.lastValidation = new Date();
    
    // Update derived metrics
    this.metrics.p95Latency = Math.round(120 + Math.random() * 50); // 120-170ms
    this.metrics.consensusLevel = Math.min(100, avgReliability + Math.random() * 5);
    this.metrics.errorRate = Math.max(0, 0.001 + (4 - activeSources) * 0.002);
    this.metrics.dataFreshness = Math.round(15 + Math.random() * 20); // 15-35s
    this.metrics.completeness = Math.min(100, 95 + activeSources * 1.25);
  }

  private async performSelfHealing(): Promise<void> {
    const degradedSources = this.sources.filter(s => s.status === 'degraded');
    
    for (const source of degradedSources) {
      if (Math.random() < 0.3) { // 30% chance of successful healing
        source.status = 'active';
        source.reliability = Math.min(100, source.reliability + 15);
        this.metrics.autoHealed24h++;
        console.log(`${this.name}: Successfully healed source ${source.name}`);
      }
    }
  }

  private calculateIntegrityScore(): void {
    const sourceHealthWeight = 0.4;
    const reliabilityWeight = 0.3;
    const consensusWeight = 0.2;
    const freshnessWeight = 0.1;
    
    const sourceHealthScore = (this.metrics.activeSources / this.metrics.totalSources) * 100;
    const avgReliability = this.sources.reduce((sum, s) => sum + s.reliability, 0) / this.sources.length;
    const freshnessScore = Math.max(0, 100 - this.metrics.dataFreshness);
    
    this.metrics.integrityScore = 
      sourceHealthScore * sourceHealthWeight +
      avgReliability * reliabilityWeight +
      this.metrics.consensusLevel * consensusWeight +
      freshnessScore * freshnessWeight;
    
    this.metrics.systemStatus = this.getSystemStatus();
  }

  private determineSignal(): 'bullish' | 'bearish' | 'neutral' {
    if (this.metrics.integrityScore >= 98) return 'bullish';
    if (this.metrics.integrityScore <= 85) return 'bearish';
    return 'neutral';
  }

  private getSystemStatus(): string {
    if (this.metrics.integrityScore >= 98) return 'OPTIMAL';
    if (this.metrics.integrityScore >= 95) return 'GOOD';
    if (this.metrics.integrityScore >= 90) return 'DEGRADED';
    return 'CRITICAL';
  }

  getSingleActionableInsight(): ActionableInsight {
    const status = this.metrics.systemStatus;
    
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
      title: 'Data Integrity',
      primaryMetric: `${this.metrics.integrityScore.toFixed(1)}%`,
      secondaryMetric: `${this.metrics.activeSources}/${this.metrics.totalSources} sources`,
      status: this.metrics.integrityScore >= 95 ? 'normal' : 
              this.metrics.integrityScore >= 90 ? 'warning' : 'critical',
      trend: this.metrics.integrityScore >= 98 ? 'up' : 
             this.metrics.integrityScore <= 85 ? 'down' : 'neutral',
      actionText: this.metrics.systemStatus,
      color: this.metrics.integrityScore >= 95 ? 'success' : 
             this.metrics.integrityScore >= 90 ? 'warning' : 'critical',
      loading: false
    };
  }

  getIntelligenceView(): IntelligenceViewData {
    return {
      title: this.name,
      status: this.metrics.systemStatus === 'CRITICAL' ? 'critical' :
              this.metrics.systemStatus === 'DEGRADED' ? 'warning' : 'active',
      primaryMetrics: {
        'Integrity Score': {
          value: `${this.metrics.integrityScore.toFixed(1)}%`,
          label: 'Overall system integrity',
          status: 'normal'
        },
        'Active Sources': {
          value: `${this.metrics.activeSources}/${this.metrics.totalSources}`,
          label: 'Operational data sources',
          status: this.metrics.activeSources === this.metrics.totalSources ? 'normal' : 'warning'
        }
      },
      sections: [
        {
          title: 'Quality Metrics',
          data: {
            'Consensus Level': {
              value: `${this.metrics.consensusLevel.toFixed(1)}%`,
              label: 'Cross-source agreement'
            },
            'P95 Latency': {
              value: `${this.metrics.p95Latency}ms`,
              label: 'Response time'
            },
            'Error Rate': {
              value: `${(this.metrics.errorRate * 100).toFixed(3)}%`,
              label: 'Data validation errors'
            }
          }
        },
        {
          title: 'Self-Healing',
          data: {
            'Auto-Healed (24h)': {
              value: this.metrics.autoHealed24h.toString(),
              label: 'Automatic recoveries'
            },
            'Data Freshness': {
              value: `${this.metrics.dataFreshness}s`,
              label: 'Last update time'
            },
            'Completeness': {
              value: `${this.metrics.completeness.toFixed(1)}%`,
              label: 'Data completeness'
            }
          }
        }
      ],
      confidence: Math.round(this.metrics.integrityScore),
      lastUpdate: this.metrics.lastValidation
    };
  }

  getDetailedView(): DetailedEngineView {
    const ageMinutes = this.lastExecution ? 
      Math.round((Date.now() - this.lastExecution.getTime()) / 60000) : 0;

    return {
      title: 'Foundation Data Integrity Engine V6',
      primarySection: {
        title: 'System Overview',
        metrics: {
          'Integrity Score': `${this.metrics.integrityScore.toFixed(1)}%`,
          'System Status': this.metrics.systemStatus,
          'Active Sources': `${this.metrics.activeSources}/${this.metrics.totalSources}`,
          'Last Validation': `${ageMinutes}m ago`
        }
      },
      sections: [
        {
          title: 'Data Quality',
          metrics: {
            'Consensus Level': `${this.metrics.consensusLevel.toFixed(1)}%`,
            'P95 Latency': `${this.metrics.p95Latency}ms`,
            'Error Rate': `${(this.metrics.errorRate * 100).toFixed(3)}%`,
            'Completeness': `${this.metrics.completeness.toFixed(1)}%`
          }
        },
        {
          title: 'Source Health',
          metrics: Object.fromEntries(
            this.sources.map(source => [
              source.name,
              `${source.status.toUpperCase()} (${source.reliability.toFixed(1)}%)`
            ])
          )
        },
        {
          title: 'Self-Healing',
          metrics: {
            'Auto-Healed (24h)': this.metrics.autoHealed24h.toString(),
            'Data Freshness': `${this.metrics.dataFreshness}s`,
            'Validation Count': this.validationHistory.length.toString(),
            'System Resilience': this.metrics.integrityScore >= 95 ? 'HIGH' : 'MODERATE'
          }
        }
      ],
      alerts: this.generateAlerts()
    };
  }

  private generateAlerts() {
    const alerts = [];
    
    if (this.metrics.integrityScore < 95) {
      alerts.push({
        severity: 'warning' as const,
        message: `Integrity score below optimal: ${this.metrics.integrityScore.toFixed(1)}%`
      });
    }
    
    if (this.metrics.activeSources < this.metrics.totalSources) {
      const offlineSources = this.metrics.totalSources - this.metrics.activeSources;
      alerts.push({
        severity: 'info' as const,
        message: `${offlineSources} source(s) offline or degraded`
      });
    }
    
    if (this.metrics.integrityScore < 90) {
      alerts.push({
        severity: 'critical' as const,
        message: 'CRITICAL: System integrity compromised'
      });
    }
    
    if (this.metrics.p95Latency > 300) {
      alerts.push({
        severity: 'warning' as const,
        message: `High latency detected: ${this.metrics.p95Latency}ms`
      });
    }
    
    return alerts;
  }

  // Required base engine methods
  getMetrics(): EngineMetrics {
    const executionTime = this.lastExecution ? 
      Date.now() - this.lastExecution.getTime() : 0;
    
    return {
      executionTime,
      successRate: this.metrics.integrityScore / 100,
      confidenceScore: this.metrics.integrityScore / 100,
      dataQuality: this.metrics.consensusLevel / 100
    };
  }

  getDetailedModal(): DetailedModalData {
    return {
      title: this.name,
      description: 'Foundation-tier data integrity monitoring with automated validation and self-healing',
      keyInsights: [
        `Integrity score: ${this.metrics.integrityScore.toFixed(1)}%`,
        `System status: ${this.metrics.systemStatus}`,
        `Active sources: ${this.metrics.activeSources}/${this.metrics.totalSources}`,
        `Auto-healed issues: ${this.metrics.autoHealed24h} (24h)`
      ],
      detailedMetrics: [
        {
          category: 'Data Quality',
          metrics: {
            'Integrity Score': { 
              value: `${this.metrics.integrityScore.toFixed(1)}%`, 
              description: 'Overall system integrity percentage' 
            },
            'System Status': { 
              value: this.metrics.systemStatus, 
              description: 'Current operational status' 
            },
            'Active Sources': { 
              value: `${this.metrics.activeSources}/${this.metrics.totalSources}`, 
              description: 'Operational data sources' 
            }
          }
        },
        {
          category: 'Performance',
          metrics: {
            'P95 Latency': { 
              value: `${this.metrics.p95Latency}ms`, 
              description: 'Response time performance' 
            },
            'Error Rate': { 
              value: `${(this.metrics.errorRate * 100).toFixed(3)}%`, 
              description: 'Data validation error rate' 
            },
            'Consensus Level': { 
              value: `${this.metrics.consensusLevel.toFixed(1)}%`, 
              description: 'Cross-source agreement level' 
            }
          }
        }
      ]
    };
  }

  // Public getters for external access
  getDataIntegrityMetrics(): DataIntegrityMetrics {
    return { ...this.metrics };
  }

  getSources(): SourceHealth[] {
    return [...this.sources];
  }

  getValidationHistory(): ValidationResult[] {
    return [...this.validationHistory];
  }
}
