import { BaseEngine, EngineConfig, EngineOutput, Alert } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'enhanced-momentum',
  name: 'Enhanced Momentum Engine',
  pillar: 'foundation',
  updateInterval: 30000, // 30 seconds - high frequency for momentum
  requiredIndicators: ['*'], // Processes ALL indicators
  dependencies: ['enhanced-zscore'] // Needs Z-score data
};

interface MomentumData {
  indicator: string;
  currentValue: number;
  velocity: number;        // First derivative (rate of change)
  acceleration: number;    // Second derivative (change in rate of change)
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength: number;        // 0-100
  signal: 'ACCELERATING' | 'DECELERATING' | 'STEADY';
}

interface MomentumPeriods {
  '4w': number;
  '12w': number;
  '26w': number;
  composite: number;
}

export class EnhancedMomentumEngine extends BaseEngine {
  readonly id = 'enhanced-momentum';
  readonly name = 'Enhanced Momentum Engine';
  readonly priority = 2;
  readonly pillar = 1 as const;
  readonly category = 'foundation' as const;
  
  private momentumData: Map<string, MomentumData> = new Map();
  private historicalMomentum: Map<string, number[]> = new Map();
  private readonly LOOKBACK_PERIODS = {
    short: 20,  // ~4 weeks
    medium: 60, // ~12 weeks
    long: 130   // ~26 weeks
  };
  
  constructor() {
    super({
      refreshInterval: 30000,
      retryAttempts: 3,
      timeout: 10000,
      cacheTimeout: 30000
    });
  }
  
  calculate(data: Map<string, any>): EngineOutput {
    const indicators = Array.from(data.keys());
    const momentumResults: MomentumData[] = [];
    let criticalSignals = 0;
    let extremeMomentum = 0;
    const alerts: Alert[] = [];
    
    // Process each indicator
    indicators.forEach(indicator => {
      const values = data.get(indicator);
      if (!this.isValidData(values)) return;
      
      const momentum = this.calculateIndicatorMomentum(indicator, values);
      if (!momentum) return;
      
      momentumResults.push(momentum);
      this.momentumData.set(indicator, momentum);
      
      // Track critical conditions
      if (Math.abs(momentum.velocity) > 10 && Math.abs(momentum.acceleration) > 5) {
        criticalSignals++;
        if (momentum.acceleration > 0 && momentum.velocity > 0) {
          alerts.push({
            level: 'warning',
            message: `${indicator}: Extreme bullish acceleration detected`,
            timestamp: Date.now()
          });
        } else if (momentum.acceleration < 0 && momentum.velocity < 0) {
          alerts.push({
            level: 'warning',
            message: `${indicator}: Extreme bearish acceleration detected`,
            timestamp: Date.now()
          });
        }
      }
      
      if (Math.abs(momentum.velocity) > 15) extremeMomentum++;
    });
    
    // Calculate aggregate momentum metrics
    const aggregateMomentum = this.calculateAggregateMomentum(momentumResults);
    const jerkFactor = this.calculateJerkFactor(momentumResults);
    const regime = this.determineMomentumRegime(aggregateMomentum, jerkFactor);
    
    // Store historical data for trend analysis
    this.updateHistoricalData('aggregate', aggregateMomentum.composite);
    
    return {
      primaryMetric: {
        value: aggregateMomentum.composite,
        change24h: this.getHistoricalChange('aggregate', 1),
        changePercent: this.getHistoricalChangePercent('aggregate', 1)
      },
      signal: this.determineSignal(regime, criticalSignals),
      confidence: this.calculateConfidence(momentumResults, aggregateMomentum),
      analysis: this.generateAnalysis(regime, aggregateMomentum, jerkFactor, criticalSignals),
      subMetrics: {
        regime,
        velocity: aggregateMomentum.velocity,
        acceleration: aggregateMomentum.acceleration,
        jerkFactor,
        bullishIndicators: momentumResults.filter(m => m.trend === 'BULLISH').length,
        bearishIndicators: momentumResults.filter(m => m.trend === 'BEARISH').length,
        acceleratingIndicators: momentumResults.filter(m => m.signal === 'ACCELERATING').length,
        criticalSignals,
        extremeMomentum,
        topBullish: this.getTopIndicators(momentumResults, 'BULLISH', 3),
        topBearish: this.getTopIndicators(momentumResults, 'BEARISH', 3),
        divergences: this.detectDivergences(momentumResults)
      },
      alerts: alerts.length > 0 ? alerts : undefined
    };
  }
  
  private calculateIndicatorMomentum(indicator: string, values: any[]): MomentumData | null {
    if (values.length < this.LOOKBACK_PERIODS.long) return null;
    
    const prices = values.map(v => v.value || v.close || v);
    const currentPrice = prices[prices.length - 1];
    
    // Calculate velocity (Rate of Change) for different periods
    const roc4w = this.calculateROC(prices, this.LOOKBACK_PERIODS.short);
    const roc12w = this.calculateROC(prices, this.LOOKBACK_PERIODS.medium);
    const roc26w = this.calculateROC(prices, this.LOOKBACK_PERIODS.long);
    
    // Weighted composite velocity
    const velocity = (roc4w * 0.5) + (roc12w * 0.3) + (roc26w * 0.2);
    
    // Calculate acceleration (second derivative)
    const velocityHistory = this.calculateVelocityHistory(prices, 20);
    const acceleration = this.calculateAcceleration(velocityHistory);
    
    // Determine trend
    let trend: MomentumData['trend'] = 'NEUTRAL';
    if (velocity > 5 && acceleration > 0) trend = 'BULLISH';
    else if (velocity < -5 && acceleration < 0) trend = 'BEARISH';
    else if (Math.abs(velocity) > 2) trend = velocity > 0 ? 'BULLISH' : 'BEARISH';
    
    // Calculate strength (0-100)
    const strength = Math.min(100, Math.abs(velocity) * 5 + Math.abs(acceleration) * 10);
    
    // Determine signal
    let signal: MomentumData['signal'] = 'STEADY';
    if (acceleration > 2) signal = 'ACCELERATING';
    else if (acceleration < -2) signal = 'DECELERATING';
    
    return {
      indicator,
      currentValue: currentPrice,
      velocity,
      acceleration,
      trend,
      strength,
      signal
    };
  }
  
  private calculateROC(values: number[], period: number): number {
    if (values.length < period) return 0;
    const current = values[values.length - 1];
    const previous = values[values.length - period];
    return ((current - previous) / previous) * 100;
  }
  
  private calculateVelocityHistory(prices: number[], periods: number): number[] {
    const velocities: number[] = [];
    for (let i = periods; i < prices.length; i++) {
      const roc = ((prices[i] - prices[i - periods]) / prices[i - periods]) * 100;
      velocities.push(roc);
    }
    return velocities;
  }
  
  private calculateAcceleration(velocities: number[]): number {
    if (velocities.length < 2) return 0;
    const recentVelocity = velocities[velocities.length - 1];
    const previousVelocity = velocities[velocities.length - 2];
    return recentVelocity - previousVelocity;
  }
  
  private calculateJerkFactor(momentumData: MomentumData[]): number {
    // Jerk is the third derivative - rate of change of acceleration
    // High jerk = unstable market conditions
    const accelerations = momentumData.map(m => m.acceleration);
    const avgAcceleration = accelerations.reduce((a, b) => a + b, 0) / accelerations.length;
    const variance = accelerations.reduce((sum, acc) => 
      sum + Math.pow(acc - avgAcceleration, 2), 0
    ) / accelerations.length;
    return Math.sqrt(variance);
  }
  
  private calculateAggregateMomentum(momentumData: MomentumData[]): any {
    // Weight important indicators higher
    const weights = this.getIndicatorWeights();
    let weightedVelocity = 0;
    let weightedAcceleration = 0;
    let totalWeight = 0;
    
    momentumData.forEach(m => {
      const weight = weights.get(m.indicator) || 1;
      weightedVelocity += m.velocity * weight;
      weightedAcceleration += m.acceleration * weight;
      totalWeight += weight;
    });
    
    const velocity = totalWeight > 0 ? weightedVelocity / totalWeight : 0;
    const acceleration = totalWeight > 0 ? weightedAcceleration / totalWeight : 0;
    
    // Composite score combines velocity and acceleration
    const composite = velocity + (acceleration * 0.5);
    
    return { velocity, acceleration, composite };
  }
  
  private getIndicatorWeights(): Map<string, number> {
    // Critical indicators get higher weights
    return new Map([
      ['WALCL', 3],
      ['RRPONTSYD', 3],
      ['BAMLH0A0HYM2', 2.5],
      ['BTCUSD', 2],
      ['SPX', 2],
      ['DXY', 1.5],
      ['VIX', 1.5]
    ]);
  }
  
  private determineMomentumRegime(aggregate: any, jerkFactor: number): string {
    const { velocity, acceleration } = aggregate;
    
    if (velocity > 10 && acceleration > 2) return 'EXPLOSIVE_BULLISH';
    if (velocity > 5 && acceleration > 0) return 'STRONG_BULLISH';
    if (velocity > 0 && acceleration > 0) return 'BUILDING_BULLISH';
    if (velocity < -10 && acceleration < -2) return 'EXPLOSIVE_BEARISH';
    if (velocity < -5 && acceleration < 0) return 'STRONG_BEARISH';
    if (velocity < 0 && acceleration < 0) return 'BUILDING_BEARISH';
    if (jerkFactor > 10) return 'CHAOTIC';
    if (Math.abs(velocity) < 2) return 'NEUTRAL';
    
    return velocity > 0 ? 'MILD_BULLISH' : 'MILD_BEARISH';
  }
  
  private determineSignal(regime: string, criticalSignals: number): EngineOutput['signal'] {
    if (regime.includes('EXPLOSIVE')) return 'WARNING';
    if (criticalSignals > 5) return 'WARNING';
    if (regime.includes('STRONG_BULLISH')) return 'RISK_ON';
    if (regime.includes('STRONG_BEARISH')) return 'RISK_OFF';
    if (regime === 'CHAOTIC') return 'WARNING';
    return 'NEUTRAL';
  }
  
  private calculateConfidence(momentumData: MomentumData[], aggregate: any): number {
    // Higher confidence when indicators align
    const alignedBullish = momentumData.filter(m => 
      m.trend === 'BULLISH' && m.signal === 'ACCELERATING'
    ).length;
    const alignedBearish = momentumData.filter(m => 
      m.trend === 'BEARISH' && m.signal === 'DECELERATING'
    ).length;
    
    const alignment = Math.max(alignedBullish, alignedBearish) / momentumData.length;
    const strengthAvg = momentumData.reduce((sum, m) => sum + m.strength, 0) / momentumData.length;
    
    return Math.min(100, (alignment * 50) + (strengthAvg * 0.5));
  }
  
  private generateAnalysis(regime: string, aggregate: any, jerkFactor: number, critical: number): string {
    const storybook: Record<string, string> = {
      'EXPLOSIVE_BULLISH': `EXTREME MOMENTUM SURGE! Velocity at ${aggregate.velocity.toFixed(1)}% with acceleration ${aggregate.acceleration.toFixed(1)}%. Market in full melt-up mode.`,
      'STRONG_BULLISH': `Strong bullish momentum building. ${critical} indicators showing extreme readings. Trend acceleration confirms risk-on environment.`,
      'BUILDING_BULLISH': `Momentum turning positive. Early signs of trend reversal with improving breadth across indicators.`,
      'EXPLOSIVE_BEARISH': `MOMENTUM COLLAPSE! Velocity at ${aggregate.velocity.toFixed(1)}% with acceleration ${aggregate.acceleration.toFixed(1)}%. Liquidation cascade in progress.`,
      'STRONG_BEARISH': `Heavy bearish momentum. ${critical} indicators in freefall. Risk-off acceleration intensifying.`,
      'BUILDING_BEARISH': `Momentum deteriorating. Negative divergences expanding as trend weakens across markets.`,
      'CHAOTIC': `EXTREME VOLATILITY! Jerk factor ${jerkFactor.toFixed(1)} indicates unstable, whipsawing conditions. Exercise extreme caution.`,
      'NEUTRAL': `Momentum balanced near zero. Market in consolidation phase awaiting directional catalyst.`,
      'MILD_BULLISH': `Gentle positive momentum. Gradual trend improvement without excessive speculation.`,
      'MILD_BEARISH': `Mild negative momentum. Orderly decline without panic selling pressure.`
    };
    
    return storybook[regime] || `Momentum regime: ${regime}. Velocity: ${aggregate.velocity.toFixed(2)}%, Acceleration: ${aggregate.acceleration.toFixed(2)}%`;
  }
  
  private detectDivergences(momentumData: MomentumData[]): string[] {
    const divergences: string[] = [];
    
    // Check for price vs momentum divergences
    const btcMomentum = momentumData.find(m => m.indicator === 'BTCUSD');
    const liquidityMomentum = momentumData.find(m => m.indicator === 'WALCL');
    
    if (btcMomentum && liquidityMomentum) {
      if (btcMomentum.trend === 'BULLISH' && liquidityMomentum.trend === 'BEARISH') {
        divergences.push('CRITICAL: Price rising but liquidity falling - unsustainable rally');
      }
      if (btcMomentum.trend === 'BEARISH' && liquidityMomentum.trend === 'BULLISH') {
        divergences.push('OPPORTUNITY: Price falling but liquidity rising - potential bottom');
      }
    }
    
    return divergences;
  }
  
  private getTopIndicators(data: MomentumData[], trend: string, count: number): any[] {
    return data
      .filter(m => m.trend === trend)
      .sort((a, b) => b.strength - a.strength)
      .slice(0, count)
      .map(m => ({
        indicator: m.indicator,
        velocity: m.velocity.toFixed(2),
        acceleration: m.acceleration.toFixed(2),
        strength: m.strength.toFixed(0)
      }));
  }
  
  private isValidData(values: any): boolean {
    return Array.isArray(values) && values.length >= this.LOOKBACK_PERIODS.long;
  }
  
  private updateHistoricalData(key: string, value: number): void {
    if (!this.historicalMomentum.has(key)) {
      this.historicalMomentum.set(key, []);
    }
    const history = this.historicalMomentum.get(key)!;
    history.push(value);
    // Keep last 100 data points
    if (history.length > 100) history.shift();
  }
  
  private getHistoricalChange(key: string, periods: number): number {
    const history = this.historicalMomentum.get(key);
    if (!history || history.length < periods + 1) return 0;
    return history[history.length - 1] - history[history.length - 1 - periods];
  }
  
  private getHistoricalChangePercent(key: string, periods: number): number {
    const history = this.historicalMomentum.get(key);
    if (!history || history.length < periods + 1) return 0;
    const previous = history[history.length - 1 - periods];
    if (previous === 0) return 0;
    return ((history[history.length - 1] - previous) / Math.abs(previous)) * 100;
  }
  
  validateData(data: Map<string, any>): boolean {
    // Need at least 20 indicators with sufficient history
    let validCount = 0;
    data.forEach(values => {
      if (Array.isArray(values) && values.length >= this.LOOKBACK_PERIODS.long) {
        validCount++;
      }
    });
    return validCount >= 20;
  }
  
  // Required BaseEngine methods implementation
  protected async performExecution(): Promise<any> {
    // Mock data for now - will be replaced with real data fetching
    const mockData = new Map([
      ['WALCL', Array.from({length: 150}, (_, i) => ({ value: 8000 + Math.random() * 1000 + i * 10 }))],
      ['RRPONTSYD', Array.from({length: 150}, (_, i) => ({ value: 2000 + Math.random() * 500 + i * 5 }))],
      ['SPX', Array.from({length: 150}, (_, i) => ({ value: 4000 + Math.random() * 200 + i * 3 }))],
      ['VIX', Array.from({length: 150}, (_, i) => ({ value: 20 + Math.random() * 10 - i * 0.05 }))],
    ]);
    
    return this.calculate(mockData);
  }
  
  public getSingleActionableInsight(): any {
    return {
      actionText: 'Monitor momentum regime changes for optimal positioning',
      signalStrength: 75,
      marketAction: 'ACCUMULATE',
      confidence: 'HIGH',
      timeframe: 'SHORT_TERM'
    };
  }
  
  public getDashboardData(): any {
    const output = this.calculate(new Map());
    return {
      title: 'Enhanced Momentum',
      primaryMetric: output.primaryMetric.value.toFixed(1),
      secondaryMetric: `${output.subMetrics.regime.replace(/_/g, ' ')}`,
      status: output.signal.toLowerCase(),
      trend: output.primaryMetric.changePercent > 0 ? 'up' : 'down',
      color: output.signal === 'RISK_ON' ? 'positive' : output.signal === 'RISK_OFF' ? 'negative' : 'neutral',
      actionText: output.analysis
    };
  }
  
  public getIntelligenceView(): any {
    const output = this.calculate(new Map());
    return {
      primaryMetrics: [
        { label: 'Composite Score', value: output.primaryMetric.value.toFixed(2), unit: '' },
        { label: 'Velocity', value: output.subMetrics.velocity.toFixed(2), unit: '%' },
        { label: 'Acceleration', value: output.subMetrics.acceleration.toFixed(2), unit: '%' }
      ],
      sections: [
        {
          title: 'MOMENTUM METRICS',
          data: [
            { label: 'Regime', value: output.subMetrics.regime.replace(/_/g, ' ') },
            { label: 'Jerk Factor', value: output.subMetrics.jerkFactor.toFixed(2) },
            { label: 'Confidence', value: `${output.confidence}%` }
          ]
        }
      ]
    };
  }
  
  public getDetailedView(): any {
    const output = this.calculate(new Map());
    return {
      title: 'Enhanced Momentum Engine - Detailed Analysis',
      sections: [
        {
          title: 'Core Momentum Metrics',
          data: [
            { label: 'Composite Score', value: output.primaryMetric.value.toFixed(2) },
            { label: 'Velocity', value: `${output.subMetrics.velocity.toFixed(2)}%` },
            { label: 'Acceleration', value: `${output.subMetrics.acceleration.toFixed(2)}%` }
          ]
        }
      ],
      analysis: output.analysis
    };
  }
  
  public getDetailedModal(): any {
    return this.getDetailedView();
  }
  
  // Hook compatibility methods
  public getMomentumMetrics(): any {
    const output = this.calculate(new Map());
    return {
      composite: output.primaryMetric.value,
      velocity: output.subMetrics.velocity,
      acceleration: output.subMetrics.acceleration,
      jerkFactor: output.subMetrics.jerkFactor,
      regime: output.subMetrics.regime,
      confidence: output.confidence,
      bullishCount: output.subMetrics.bullishIndicators,
      bearishCount: output.subMetrics.bearishIndicators,
      lastUpdated: new Date()
    };
  }
  
  public getCompositeScore(): any {
    const output = this.calculate(new Map());
    return {
      value: output.primaryMetric.value,
      change24h: output.primaryMetric.change24h,
      changePercent: output.primaryMetric.changePercent,
      signal: output.signal,
      confidence: output.confidence,
      regime: output.subMetrics.regime
    };
  }
  
  public getAlerts(): any {
    const output = this.calculate(new Map());
    return {
      alerts: output.alerts || [],
      criticalCount: output.subMetrics.criticalSignals,
      extremeCount: output.subMetrics.extremeMomentum,
      divergences: output.subMetrics.divergences || []
    };
  }
}