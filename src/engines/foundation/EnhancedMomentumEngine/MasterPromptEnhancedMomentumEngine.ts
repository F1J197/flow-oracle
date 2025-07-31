/**
 * Master Prompt Compliant Enhanced Momentum Engine - V6 Implementation
 * Migrated from BaseEngine to MasterPromptBaseEngine
 */

import { MasterPromptBaseEngine } from '@/engines/base/MasterPromptBaseEngine';
import type { 
  EngineReport, 
  ActionableInsight, 
  DashboardTileData,
  IntelligenceViewData,
  DetailedEngineView,
  DetailedModalData
} from "@/types/engines";
import type { 
  MomentumMetrics, 
  MomentumConfig, 
  CompositeMomentumScore,
  MomentumAlert
} from "./types";
import UniversalDataService from '@/services/UniversalDataService';

export class MasterPromptEnhancedMomentumEngine extends MasterPromptBaseEngine {
  readonly id = 'master-prompt-enhanced-momentum-foundation';
  readonly name = 'Master Prompt Enhanced Momentum Engine';
  readonly category = 'foundation' as const;
  readonly priority = 2;
  readonly pillar = 1 as const;

  // Internal state
  private momentumMetrics: MomentumMetrics;
  private dataService: UniversalDataService;

  constructor(config: Partial<MomentumConfig> = {}) {
    super({
      refreshInterval: config.refreshInterval || 30000,
      timeout: config.timeout || 15000,
      maxRetries: config.maxRetries || 3,
      cacheTimeout: config.cacheTimeout || 60000,
      gracefulDegradation: true
    });

    this.momentumMetrics = this.initializeMetrics();
    this.dataService = UniversalDataService.getInstance();
  }

  private initializeMetrics(): MomentumMetrics {
    return {
      composite: {
        value: 0,
        category: 'SLOWING',
        confidence: 0,
        leadTime: 0,
        regime: 'NEUTRAL'
      },
      multiscale: {
        short: { roc: 0, firstDerivative: 0, secondDerivative: 0, jerk: 0 },
        medium: { roc: 0, firstDerivative: 0, secondDerivative: 0, jerk: 0 },
        long: { roc: 0, firstDerivative: 0, secondDerivative: 0, jerk: 0 }
      },
      alerts: [],
      lastCalculation: new Date(),
      signalStrength: 0,
      trend: 'neutral',
      confidence: 0
    };
  }

  protected async performExecution(): Promise<EngineReport> {
    try {
      // Simulate momentum analysis with synthetic data
      this.momentumMetrics = {
        ...this.momentumMetrics,
        composite: {
          value: (Math.random() - 0.5) * 20, // -10 to +10
          category: ['EXPLODING', 'BUILDING', 'SLOWING', 'DECLINING', 'NEUTRAL'][Math.floor(Math.random() * 5)] as any,
          confidence: 70 + Math.random() * 25, // 70-95%
          leadTime: 2 + Math.random() * 8, // 2-10 weeks
          regime: ['BULL_ACCEL', 'BULL_DECEL', 'BEAR_ACCEL', 'BEAR_DECEL', 'NEUTRAL'][Math.floor(Math.random() * 5)] as any
        },
        lastCalculation: new Date(),
        signalStrength: Math.random() * 100,
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'neutral',
        confidence: 70 + Math.random() * 25
      };

      return {
        success: true,
        confidence: this.momentumMetrics.confidence / 100,
        signal: this.momentumMetrics.composite.value > 5 ? 'bullish' : 
                this.momentumMetrics.composite.value < -5 ? 'bearish' : 'neutral',
        data: this.momentumMetrics,
        lastUpdated: new Date()
      };
    } catch (error) {
      throw new Error(`Master Prompt Enhanced Momentum Engine execution failed: ${error}`);
    }
  }

  getSingleActionableInsight(): ActionableInsight {
    return {
      actionText: `MOMENTUM ${this.momentumMetrics.composite.category}: ${this.momentumMetrics.composite.regime}`,
      signalStrength: Math.round(this.momentumMetrics.composite.confidence),
      marketAction: this.momentumMetrics.composite.value > 0 ? 'BUY' : 'SELL',
      confidence: this.momentumMetrics.composite.confidence > 80 ? 'HIGH' : 'MED',
      timeframe: 'MEDIUM_TERM'
    };
  }

  getDashboardData(): DashboardTileData {
    return {
      title: 'Enhanced Momentum (MP)',
      primaryMetric: `${this.momentumMetrics.composite.value.toFixed(1)}%`,
      secondaryMetric: this.momentumMetrics.composite.category,
      status: this.momentumMetrics.composite.confidence > 80 ? 'normal' : 'warning',
      trend: this.momentumMetrics.trend,
      actionText: this.momentumMetrics.composite.regime,
      color: this.momentumMetrics.composite.value > 0 ? 'success' : 'critical',
      loading: false
    };
  }

  getIntelligenceView(): IntelligenceViewData {
    return {
      title: this.name,
      status: 'active',
      primaryMetrics: {
        'Composite Score': {
          value: `${this.momentumMetrics.composite.value.toFixed(1)}%`,
          label: 'Momentum strength',
          status: 'normal'
        },
        'Confidence': {
          value: `${this.momentumMetrics.composite.confidence.toFixed(1)}%`,
          label: 'Signal reliability',
          status: 'normal'
        }
      },
      sections: [
        {
          title: 'Analysis',
          data: {
            'Category': {
              value: this.momentumMetrics.composite.category,
              label: 'Momentum state'
            },
            'Regime': {
              value: this.momentumMetrics.composite.regime,
              label: 'Market regime'
            }
          }
        }
      ],
      confidence: Math.round(this.momentumMetrics.composite.confidence),
      lastUpdate: this.momentumMetrics.lastCalculation
    };
  }

  getDetailedView(): DetailedEngineView {
    return {
      title: 'Master Prompt Enhanced Momentum Engine V6',
      primarySection: {
        title: 'Momentum Analysis',
        metrics: {
          'Composite Score': `${this.momentumMetrics.composite.value.toFixed(1)}%`,
          'Category': this.momentumMetrics.composite.category,
          'Regime': this.momentumMetrics.composite.regime,
          'Confidence': `${this.momentumMetrics.composite.confidence.toFixed(1)}%`
        }
      },
      sections: [],
      alerts: []
    };
  }

  getDetailedModal(): DetailedModalData {
    return {
      title: this.name,
      description: 'Master Prompt compliant momentum analysis engine',
      keyInsights: [
        `Momentum: ${this.momentumMetrics.composite.value.toFixed(1)}%`,
        `Category: ${this.momentumMetrics.composite.category}`,
        `Regime: ${this.momentumMetrics.composite.regime}`
      ],
      detailedMetrics: [
        {
          category: 'Momentum',
          metrics: {
            'Score': { 
              value: `${this.momentumMetrics.composite.value.toFixed(1)}%`,
              description: 'Composite momentum score'
            }
          }
        }
      ]
    };
  }

  // Public getters
  getMomentumMetrics(): MomentumMetrics {
    return this.momentumMetrics;
  }

  getCompositeScore(): CompositeMomentumScore {
    return this.momentumMetrics.composite;
  }

  getAlerts(): MomentumAlert[] {
    return this.momentumMetrics.alerts;
  }

  // MasterPromptBaseEngine required methods
  getDashboardTile(): any {
    return this.getDashboardData();
  }

  getIntelligenceTile(): any {
    return this.getIntelligenceView();
  }

  getDetailedAnalysis(): any {
    return this.getDetailedView();
  }

  getDetailModal(): any {
    return this.getDetailedModal();
  }
}