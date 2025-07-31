import { BaseEngine } from '../../BaseEngine';
import { KalmanFilter, MultiKalmanFilter } from '../../../utils/KalmanFilter';
import { 
  NetLiquidityMetrics, 
  LiquidityComponent, 
  LiquidityAlert, 
  KalmanNetLiquidityConfig,
  AdaptiveSignal,
  LiquidityRegime
} from './types';
import type { 
  EngineReport, 
  ActionableInsight, 
  DashboardTileData, 
  IntelligenceViewData, 
  DetailedEngineView,
  DetailedModalData 
} from '../../../types/engines';

export class KalmanNetLiquidityEngine extends BaseEngine {
  public readonly id = 'kalman-net-liquidity';
  public readonly name = 'Kalman-Adaptive Net Liquidity';
  public readonly category = 'core' as const;
  public readonly pillar = 1 as const;
  public readonly priority = 1;

  private kalmanFilters: MultiKalmanFilter;
  private netLiquidityMetrics: NetLiquidityMetrics;
  private engineConfig: KalmanNetLiquidityConfig;
  private lastExecutionStart: number = 0;

  constructor() {
    super({
      refreshInterval: 30000, // 30 seconds
      timeout: 15000,
      retryAttempts: 3,
      cacheTimeout: 60000
    });

    this.engineConfig = this.getDefaultConfig();
    this.kalmanFilters = this.initializeKalmanFilters();
    this.netLiquidityMetrics = this.initializeMetrics();
  }

  private getDefaultConfig(): KalmanNetLiquidityConfig {
    return {
      components: {
        fedBalanceSheet: {
          processNoise: 0.01,
          measurementNoise: 0.05,
          weight: 0.4
        },
        treasuryGeneralAccount: {
          processNoise: 0.02,
          measurementNoise: 0.1,
          weight: 0.3
        },
        reverseRepo: {
          processNoise: 0.015,
          measurementNoise: 0.08,
          weight: 0.2
        },
        currencyInCirculation: {
          processNoise: 0.005,
          measurementNoise: 0.03,
          weight: 0.1
        }
      },
      adaptationSpeed: 0.1,
      signalThreshold: 0.6,
      alertThresholds: {
        extreme: 2.0,
        trendChange: 1.5,
        correlation: 0.3
      },
      refreshInterval: 30000,
      maxRetries: 3
    };
  }

  private initializeKalmanFilters(): MultiKalmanFilter {
    const configs = new Map();
    
    for (const [componentId, config] of Object.entries(this.engineConfig.components)) {
      configs.set(componentId, {
        processNoise: config.processNoise,
        measurementNoise: config.measurementNoise,
        initialEstimate: 0,
        initialCovariance: 1.0
      });
    }

    return new MultiKalmanFilter(configs);
  }

  private initializeMetrics(): NetLiquidityMetrics {
    return {
      total: 0,
      components: {
        fedBalanceSheet: this.createEmptyComponent('fedBalanceSheet', 'Fed Balance Sheet'),
        treasuryGeneralAccount: this.createEmptyComponent('treasuryGeneralAccount', 'Treasury General Account'),
        reverseRepo: this.createEmptyComponent('reverseRepo', 'Reverse Repo'),
        currencyInCirculation: this.createEmptyComponent('currencyInCirculation', 'Currency in Circulation')
      },
      adaptiveSignal: {
        strength: 0,
        direction: 'neutral',
        confidence: 0,
        regime: 'TRANSITION'
      },
      kalmanMetrics: {
        overallConfidence: 0,
        adaptationRate: 0,
        signalNoise: 0,
        convergenceStatus: 'converging'
      },
      lastCalculation: new Date()
    };
  }

  private createEmptyComponent(id: string, name: string): LiquidityComponent {
    return {
      id,
      name,
      value: 0,
      weight: this.engineConfig.components[id]?.weight || 0,
      confidence: 0,
      trend: 'stable',
      kalmanState: {
        estimate: 0,
        uncertainty: 1.0,
        lastUpdate: new Date()
      }
    };
  }

  protected async performExecution(): Promise<EngineReport> {
    this.lastExecutionStart = Date.now();
    
    try {
      // Fetch raw liquidity data
      const rawData = await this.fetchLiquidityData();
      
      // Update Kalman filters with new observations
      const kalmanStates = this.kalmanFilters.updateAll(rawData);
      
      // Update component metrics
      this.updateComponentMetrics(kalmanStates);
      
      // Calculate net liquidity
      this.calculateNetLiquidity();
      
      // Generate adaptive signal
      const adaptiveSignal = this.generateAdaptiveSignal();
      this.netLiquidityMetrics.adaptiveSignal = adaptiveSignal;
      
      // Update Kalman-specific metrics
      this.updateKalmanMetrics();
      
      // Generate alerts
      const alerts = this.generateAlerts();
      
      this.netLiquidityMetrics.lastCalculation = new Date();

      return {
        success: true,
        data: this.netLiquidityMetrics,
        confidence: this.netLiquidityMetrics.kalmanMetrics.overallConfidence,
        signal: this.determineSignal(),
        executionTime: Date.now() - this.lastExecutionStart
      };

    } catch (error) {
      console.error('Kalman Net Liquidity Engine execution failed:', error);
      return this.createEngineErrorReport(error);
    }
  }

  private async fetchLiquidityData(): Promise<Map<string, number>> {
    // Simulate fetching real liquidity data
    const data = new Map<string, number>();
    
    // Generate realistic liquidity data with some variation
    const baseValues = {
      fedBalanceSheet: 8500000, // $8.5T
      treasuryGeneralAccount: 750000, // $750B
      reverseRepo: 2200000, // $2.2T
      currencyInCirculation: 2300000 // $2.3T
    };

    for (const [component, baseValue] of Object.entries(baseValues)) {
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      data.set(component, baseValue * (1 + variation));
    }

    return data;
  }

  private updateComponentMetrics(kalmanStates: Map<string, any>): void {
    for (const [componentId, state] of kalmanStates) {
      const component = this.netLiquidityMetrics.components[componentId as keyof typeof this.netLiquidityMetrics.components];
      if (component) {
        const previousValue = component.value;
        
        component.value = state.estimate;
        component.confidence = state.confidence;
        component.kalmanState = {
          estimate: state.estimate,
          uncertainty: state.errorCovariance,
          lastUpdate: state.timestamp
        };
        
        // Determine trend
        if (Math.abs(component.value - previousValue) / previousValue > 0.001) {
          component.trend = component.value > previousValue ? 'expanding' : 'contracting';
        } else {
          component.trend = 'stable';
        }
      }
    }
  }

  private calculateNetLiquidity(): void {
    const { components } = this.netLiquidityMetrics;
    
    // Net Liquidity = Fed Balance Sheet - TGA - RRP + Currency
    this.netLiquidityMetrics.total = 
      components.fedBalanceSheet.value - 
      components.treasuryGeneralAccount.value - 
      components.reverseRepo.value + 
      components.currencyInCirculation.value;
  }

  private generateAdaptiveSignal(): AdaptiveSignal {
    const { total, components } = this.netLiquidityMetrics;
    const overallConfidence = this.calculateOverallConfidence();
    
    // Calculate signal strength based on rate of change and confidence
    const fedTrend = components.fedBalanceSheet.trend;
    const tgaTrend = components.treasuryGeneralAccount.trend;
    const rrpTrend = components.reverseRepo.trend;
    
    let signalStrength = 0;
    let direction: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    
    // Bullish conditions: Fed expanding, TGA contracting, RRP contracting
    if (fedTrend === 'expanding' && (tgaTrend === 'contracting' || rrpTrend === 'contracting')) {
      signalStrength = Math.min(0.8, overallConfidence);
      direction = 'bullish';
    }
    // Bearish conditions: Fed contracting, TGA expanding, RRP expanding
    else if (fedTrend === 'contracting' && (tgaTrend === 'expanding' || rrpTrend === 'expanding')) {
      signalStrength = Math.min(0.8, overallConfidence);
      direction = 'bearish';
    }
    // Mixed or stable conditions
    else {
      signalStrength = overallConfidence * 0.3;
      direction = 'neutral';
    }

    // Determine regime
    let regime: 'EXPANSION' | 'CONTRACTION' | 'TRANSITION' = 'TRANSITION';
    if (signalStrength > 0.6) {
      regime = direction === 'bullish' ? 'EXPANSION' : 'CONTRACTION';
    }

    return {
      value: total,
      confidence: overallConfidence,
      direction,
      strength: signalStrength,
      timeframe: '1w',
      regime
    };
  }

  private calculateOverallConfidence(): number {
    const { components } = this.netLiquidityMetrics;
    const confidences = Object.values(components).map(c => c.confidence * c.weight);
    return confidences.reduce((sum, conf) => sum + conf, 0);
  }

  private updateKalmanMetrics(): void {
    const overallConfidence = this.calculateOverallConfidence();
    const { components } = this.netLiquidityMetrics;
    
    // Calculate adaptation rate (how quickly filters are adapting)
    const adaptationRate = Object.values(components)
      .map(c => 1 - c.confidence) // Lower confidence = higher adaptation
      .reduce((sum, rate) => sum + rate, 0) / Object.keys(components).length;
    
    // Signal-to-noise ratio
    const signalNoise = Math.max(0, 1 - overallConfidence);
    
    // Convergence status
    let convergenceStatus: 'converged' | 'converging' | 'diverging' = 'converging';
    if (overallConfidence > 0.8) convergenceStatus = 'converged';
    else if (overallConfidence < 0.3) convergenceStatus = 'diverging';

    this.netLiquidityMetrics.kalmanMetrics = {
      overallConfidence,
      adaptationRate,
      signalNoise,
      convergenceStatus
    };
  }

  private generateAlerts(): LiquidityAlert[] {
    const alerts: LiquidityAlert[] = [];
    const { components, adaptiveSignal, kalmanMetrics } = this.netLiquidityMetrics;

    // Check for extreme values
    for (const [id, component] of Object.entries(components)) {
      if (component.kalmanState.uncertainty > this.engineConfig.alertThresholds.extreme) {
        alerts.push({
          type: 'EXTREME_VALUE',
          severity: 'HIGH',
          component: id,
          message: `${component.name} showing extreme uncertainty`,
          confidence: component.confidence,
          timestamp: new Date()
        });
      }
    }

    return alerts;
  }

  private determineSignal(): 'bullish' | 'bearish' | 'neutral' {
    return this.netLiquidityMetrics.adaptiveSignal.direction;
  }

  private createEngineErrorReport(error: any): EngineReport {
    return {
      success: false,
      data: this.netLiquidityMetrics,
      confidence: 0,
      signal: 'neutral',
      executionTime: Date.now() - this.lastExecutionStart,
      error: error.message
    };
  }

  // Implementation of BaseEngine abstract methods
  public getSingleActionableInsight(): ActionableInsight {
    const { adaptiveSignal, total } = this.netLiquidityMetrics;
    
    return {
      actionText: adaptiveSignal.direction === 'bullish' ? 'Consider risk-on positioning' : 
                  adaptiveSignal.direction === 'bearish' ? 'Consider defensive positioning' : 
                  'Monitor for regime change',
      signalStrength: adaptiveSignal.strength,
      marketAction: adaptiveSignal.direction === 'bullish' ? 'BUY' : 
                   adaptiveSignal.direction === 'bearish' ? 'SELL' : 'HOLD',
      confidence: adaptiveSignal.strength > 0.7 ? 'HIGH' : adaptiveSignal.strength > 0.4 ? 'MED' : 'LOW',
      timeframe: 'MEDIUM_TERM',
      data: {
        netLiquidity: total,
        regime: adaptiveSignal.regime,
        signalStrength: adaptiveSignal.strength
      }
    };
  }

  public getDashboardData(): DashboardTileData {
    const { total, adaptiveSignal, kalmanMetrics } = this.netLiquidityMetrics;
    
    return {
      title: 'Kalman Net Liquidity',
      primaryMetric: `$${(total / 1000000).toFixed(1)}T`,
      secondaryMetrics: [
        { label: 'Signal Strength', value: `${(adaptiveSignal.strength * 100).toFixed(0)}%` },
        { label: 'Confidence', value: `${(kalmanMetrics.overallConfidence * 100).toFixed(0)}%` },
        { label: 'Regime', value: adaptiveSignal.regime }
      ],
      status: kalmanMetrics.convergenceStatus === 'converged' ? 'normal' : 'warning',
      lastUpdated: this.netLiquidityMetrics.lastCalculation,
      loading: false
    };
  }

  public getIntelligenceView(): IntelligenceViewData {
    const { components, adaptiveSignal, kalmanMetrics } = this.netLiquidityMetrics;
    
    return {
      title: 'Kalman-Adaptive Net Liquidity Intelligence',
      status: kalmanMetrics.convergenceStatus === 'converged' ? 'active' : 'warning',
      primaryMetric: {
        label: 'Net Liquidity',
        value: `$${(this.netLiquidityMetrics.total / 1000000).toFixed(2)}T`,
        unit: 'USD',
        color: adaptiveSignal.direction === 'bullish' ? 'lime' : 
               adaptiveSignal.direction === 'bearish' ? 'orange' : 'teal'
      },
      keyMetrics: [
        { label: 'Fed Balance Sheet', value: `$${(components.fedBalanceSheet.value / 1000000).toFixed(1)}T`, status: components.fedBalanceSheet.trend === 'expanding' ? 'good' : 'warning' },
        { label: 'Treasury GA', value: `$${(components.treasuryGeneralAccount.value / 1000).toFixed(0)}B`, status: components.treasuryGeneralAccount.trend === 'contracting' ? 'good' : 'warning' },
        { label: 'Reverse Repo', value: `$${(components.reverseRepo.value / 1000000).toFixed(1)}T`, status: components.reverseRepo.trend === 'contracting' ? 'good' : 'warning' },
        { label: 'Signal Strength', value: `${(adaptiveSignal.strength * 100).toFixed(0)}%` },
        { label: 'Overall Confidence', value: `${(kalmanMetrics.overallConfidence * 100).toFixed(0)}%` }
      ],
      insights: [
        `Liquidity regime: ${adaptiveSignal.regime}`,
        `Adaptive signal: ${adaptiveSignal.direction.toUpperCase()} with ${(adaptiveSignal.strength * 100).toFixed(0)}% strength`,
        `Kalman filters: ${kalmanMetrics.convergenceStatus}`,
        `Model adaptation rate: ${(kalmanMetrics.adaptationRate * 100).toFixed(1)}%`
      ],
      lastUpdated: this.netLiquidityMetrics.lastCalculation
    };
  }

  public getDetailedView(): DetailedEngineView {
    return {
      title: 'Kalman-Adaptive Net Liquidity Engine',
      primarySection: {
        title: 'Net Liquidity Overview',
        metrics: {
          'Total Net Liquidity': `$${(this.netLiquidityMetrics.total / 1000000).toFixed(2)}T`,
          'Adaptive Signal': this.netLiquidityMetrics.adaptiveSignal.direction.toUpperCase(),
          'Regime': this.netLiquidityMetrics.adaptiveSignal.regime,
          'Overall Confidence': `${(this.netLiquidityMetrics.kalmanMetrics.overallConfidence * 100).toFixed(1)}%`
        }
      },
      sections: [
        {
          title: 'Liquidity Components',
          metrics: Object.fromEntries(
            Object.entries(this.netLiquidityMetrics.components).map(([id, component]) => [
              component.name,
              `$${(component.value / 1000000).toFixed(2)}T (${component.trend})`
            ])
          )
        },
        {
          title: 'Kalman Filter Metrics',
          metrics: {
            'Convergence Status': this.netLiquidityMetrics.kalmanMetrics.convergenceStatus.toUpperCase(),
            'Adaptation Rate': `${(this.netLiquidityMetrics.kalmanMetrics.adaptationRate * 100).toFixed(1)}%`,
            'Signal-to-Noise': `${(this.netLiquidityMetrics.kalmanMetrics.signalNoise * 100).toFixed(1)}%`
          }
        }
      ],
      lastUpdated: this.netLiquidityMetrics.lastCalculation,
      confidence: this.netLiquidityMetrics.kalmanMetrics.overallConfidence,
      status: this.netLiquidityMetrics.kalmanMetrics.convergenceStatus === 'converged' ? 'active' : 'warning'
    };
  }

  public getDetailedModal(): DetailedModalData {
    return {
      title: 'Kalman-Adaptive Net Liquidity Engine',
      subtitle: 'Advanced liquidity analysis with adaptive filtering',
      content: this.getDetailedView(),
      actions: [
        { label: 'Export Data', action: 'export' },
        { label: 'Reset Filters', action: 'reset' },
        { label: 'Adjust Sensitivity', action: 'configure' }
      ]
    };
  }

  // Getters for external access
  public getNetLiquidityMetrics(): NetLiquidityMetrics {
    return { ...this.netLiquidityMetrics };
  }

  public getKalmanStates(): Map<string, any> {
    return this.kalmanFilters.getAllStates();
  }

  public resetKalmanFilters(): void {
    this.kalmanFilters = this.initializeKalmanFilters();
    this.netLiquidityMetrics = this.initializeMetrics();
  }
}