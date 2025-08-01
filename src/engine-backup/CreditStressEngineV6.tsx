import { IEngine, EngineReport, DashboardTileData, DetailedEngineView, ActionableInsight } from '@/types/engines';
import { ResilientBaseEngine } from './ResilientBaseEngine';
import UniversalDataService from '@/services/UniversalDataService';

// ============= INTERFACES =============

interface CreditDataSources {
  primary: {
    id: string;
    name: string;
    weight: number;
  };
  secondary: {
    id: string;
    name: string;
    weight: number;
  };
  tertiary: {
    id: string;
    name: string;
    weight: number;
  };
}

interface SpreadComponent {
  source: string;
  value: number;
  weight: number;
  timestamp: string;
  valid: boolean;
}

interface SpreadVelocity {
  daily: number;
  weekly: number;
  monthly: number;
}

interface CreditSpreadResult {
  composite: number;
  components: SpreadComponent[];
  velocity: SpreadVelocity;
  stressLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRISIS';
  regime: 'QE_SUPPORTIVE' | 'NEUTRAL' | 'QT_STRESS';
  timestamp: number;
  confidence: number;
}

interface TermStructure {
  hySpread: number;
  igSpread: number;
  ratio: number;
  shape: 'FLAT' | 'NORMAL' | 'INVERTED' | 'STEEPENING' | 'FLATTENING';
  zScore: number;
}

interface DivergenceResult {
  aligned: boolean;
  divergenceMagnitude: number;
  significance: 'MINOR' | 'MODERATE' | 'MAJOR';
  creditDirection: number;
  metricDirection: number;
  message: string;
}

interface DivergenceAnalysis {
  creditVsEquity: DivergenceResult;
  creditVsRates: DivergenceResult;
  creditVsCommodities: DivergenceResult;
  overallAlignment: number;
}

interface LeadingIndicators {
  cdsIndex: {
    spread: number;
    basis: number;
    percentile: number;
    trend: 'RISK_AVERSION' | 'RISK_SEEKING';
  };
  fallenAngels: {
    value: number;
    count: number;
    trend: string;
  };
  risingStars: {
    value: number;
    count: number;
    trend: string;
  };
  netMigration: number;
  distressRatio: number;
}

export class CreditStressEngineV6 extends ResilientBaseEngine {
  readonly id = 'credit-stress-v6';
  readonly name = 'Credit Stress Engine V6';
  readonly priority = 1;
  readonly pillar = 2 as const;
  readonly category = 'core' as const;

  private currentData: CreditSpreadResult | null = null;
  private termStructure: TermStructure | null = null;
  private divergences: DivergenceAnalysis | null = null;
  private leadingIndicators: LeadingIndicators | null = null;

  constructor() {
    super({
      refreshInterval: 30000,
      maxRetries: 2,
      timeout: 15000,
      cacheTimeout: 60000,
      gracefulDegradation: true
    });
    console.log('🚀 Credit Stress Engine V6 initialized');
  }

  protected async performExecution(): Promise<EngineReport> {
    console.log('⚡ Executing Credit Stress Engine V6...');
    
    try {
      // Simulate calculation
      this.currentData = {
        composite: 350,
        components: [],
        velocity: { daily: 1.2, weekly: 8.4, monthly: 25.2 },
        stressLevel: 'MODERATE',
        regime: 'NEUTRAL',
        timestamp: Date.now(),
        confidence: 85
      };

      return {
        success: true,
        confidence: this.currentData.confidence,
        signal: this.currentData.stressLevel === 'CRISIS' ? 'bearish' : 
               this.currentData.stressLevel === 'HIGH' ? 'bearish' : 'neutral',
        data: {
          creditSpread: this.currentData,
          termStructure: this.termStructure,
          divergences: this.divergences,
          leadingIndicators: this.leadingIndicators
        },
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('❌ Credit Stress Engine execution failed:', error);
      return {
        success: false,
        confidence: 0,
        signal: 'neutral',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        lastUpdated: new Date()
      };
    }
  }

  getDashboardData(): DashboardTileData {
    if (!this.currentData) {
      return {
        title: 'CREDIT STRESS V6',
        primaryMetric: '--',
        secondaryMetric: 'INITIALIZING',
        status: 'normal' as const,
        color: 'warning' as const,
        actionText: 'Loading credit stress data...'
      };
    }

    return {
      title: 'CREDIT STRESS V6',
      primaryMetric: `${this.currentData.composite} bps`,
      secondaryMetric: `${this.currentData.stressLevel}`,
      status: this.currentData.stressLevel === 'CRISIS' ? 'critical' :
              this.currentData.stressLevel === 'HIGH' ? 'warning' : 'normal',
      trend: this.currentData.velocity.weekly > 0 ? 'up' : 'down',
      color: this.currentData.stressLevel === 'CRISIS' ? 'critical' : 'normal',
      actionText: `Regime: ${this.currentData.regime}`
    };
  }

  getSingleActionableInsight(): ActionableInsight {
    return {
      id: 'credit-stress-primary',
      title: 'Credit Stress Analysis',
      description: 'Monitoring credit market stress indicators',
      action: 'Monitor credit spreads for widening',
      priority: 'medium',
      confidence: this.currentData?.confidence || 0,
      timestamp: Date.now()
    };
  }

  getDetailedView(): DetailedEngineView {
    return {
      title: 'Credit Stress Engine V6',
      sections: [
        {
          title: 'Current State',
          content: {
            composite: this.currentData?.composite || 0,
            stressLevel: this.currentData?.stressLevel || 'UNKNOWN',
            regime: this.currentData?.regime || 'UNKNOWN'
          }
        }
      ]
    };
  }
}