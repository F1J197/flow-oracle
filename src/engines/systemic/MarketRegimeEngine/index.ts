import { BaseEngine, EngineConfig, EngineOutput, Alert } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'market-regime',
  name: 'Market Regime Engine',
  pillar: 2,
  priority: 85,
  updateInterval: 300000, // 5 minutes
  requiredIndicators: ['VIX', 'SPX', 'BTCUSD', 'DXY', 'DGS10', 'WALCL'],
  dependencies: ['volatility-regime', 'enhanced-momentum']
};

interface RegimeMetrics {
  volatilityState: string;
  momentumDirection: string;
  liquidityCondition: string;
  riskAppetite: number;
  regimeStrength: number;
  transitionProbability: number;
}

type MarketRegime = 
  | 'RISK_ON_TRENDING' 
  | 'RISK_OFF_TRENDING'
  | 'CONSOLIDATION'
  | 'TRANSITION_BULLISH'
  | 'TRANSITION_BEARISH'
  | 'VOLATILITY_SPIKE'
  | 'LIQUIDITY_CRISIS'
  | 'EUPHORIA'
  | 'CAPITULATION';

export class MarketRegimeEngine extends BaseEngine {
  private readonly REGIME_THRESHOLDS = {
    volatility: { low: 15, high: 25, crisis: 40 },
    momentum: { strong: 5, weak: -5 },
    liquidity: { abundant: 6, tight: 4 }
  };

  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    const vix = this.extractLatestValue(data.get('VIX'));
    const spx = this.extractLatestValue(data.get('SPX'));
    const btc = this.extractLatestValue(data.get('BTCUSD'));
    const dxy = this.extractLatestValue(data.get('DXY'));
    
    if (!vix || !spx) return this.getDefaultOutput();

    // Get dependency outputs
    const volRegimeOutput = data.get('ENGINE_volatility-regime');
    const momentumOutput = data.get('ENGINE_enhanced-momentum');

    const metrics = this.calculateRegimeMetrics(data, volRegimeOutput, momentumOutput);
    const currentRegime = this.classifyRegime(metrics, vix, spx);
    const transitionSignals = this.detectTransitions(metrics, currentRegime);
    const alerts = this.generateRegimeAlerts(currentRegime, metrics, transitionSignals);

    return {
      primaryMetric: {
        value: metrics.regimeStrength,
        change24h: metrics.transitionProbability,
        changePercent: metrics.riskAppetite
      },
      signal: this.determineSignal(currentRegime, transitionSignals),
      confidence: this.calculateConfidence(metrics, currentRegime),
      analysis: this.generateAnalysis(currentRegime, metrics, transitionSignals),
      subMetrics: {
        currentRegime,
        volatilityState: metrics.volatilityState,
        momentumDirection: metrics.momentumDirection,
        liquidityCondition: metrics.liquidityCondition,
        riskAppetite: metrics.riskAppetite,
        regimeStrength: metrics.regimeStrength,
        transitionProbability: metrics.transitionProbability,
        nextLikelyRegime: this.predictNextRegime(currentRegime, metrics),
        regimeHistory: this.getRegimeHistory(),
        crossAssetAlignment: this.calculateCrossAssetAlignment(data),
        transitionSignals
      },
      alerts
    };
  }

  private calculateRegimeMetrics(
    data: Map<string, any>, 
    volOutput: any, 
    momentumOutput: any
  ): RegimeMetrics {
    const vixData = data.get('VIX');
    const spxData = data.get('SPX');
    const walcl = this.extractLatestValue(data.get('WALCL'));

    // Extract volatility state
    const volatilityState = volOutput?.subMetrics?.regime || 'UNKNOWN';
    
    // Extract momentum direction
    const momentumDirection = momentumOutput?.subMetrics?.regime || 'NEUTRAL';
    
    // Determine liquidity condition
    const liquidityCondition = this.assessLiquidityCondition(walcl);
    
    // Calculate risk appetite (0-100)
    const riskAppetite = this.calculateRiskAppetite(data);
    
    // Calculate regime strength (how established the current regime is)
    const regimeStrength = this.calculateRegimeStrength(vixData, spxData);
    
    // Calculate transition probability
    const transitionProbability = this.calculateTransitionProbability(
      volatilityState, momentumDirection, riskAppetite
    );

    return {
      volatilityState,
      momentumDirection,
      liquidityCondition,
      riskAppetite,
      regimeStrength,
      transitionProbability
    };
  }

  private classifyRegime(metrics: RegimeMetrics, vix: number, spx: number): MarketRegime {
    const { volatilityState, momentumDirection, liquidityCondition, riskAppetite } = metrics;

    // Crisis conditions
    if (vix > this.REGIME_THRESHOLDS.volatility.crisis) {
      return riskAppetite < 20 ? 'CAPITULATION' : 'VOLATILITY_SPIKE';
    }

    if (liquidityCondition === 'CRISIS') {
      return 'LIQUIDITY_CRISIS';
    }

    // Euphoria conditions
    if (riskAppetite > 85 && vix < this.REGIME_THRESHOLDS.volatility.low) {
      return 'EUPHORIA';
    }

    // Trending regimes
    if (momentumDirection.includes('BULLISH') && riskAppetite > 60) {
      return vix < this.REGIME_THRESHOLDS.volatility.low ? 'RISK_ON_TRENDING' : 'TRANSITION_BULLISH';
    }

    if (momentumDirection.includes('BEARISH') && riskAppetite < 40) {
      return vix > this.REGIME_THRESHOLDS.volatility.high ? 'RISK_OFF_TRENDING' : 'TRANSITION_BEARISH';
    }

    // Transition states
    if (metrics.transitionProbability > 70) {
      return riskAppetite > 50 ? 'TRANSITION_BULLISH' : 'TRANSITION_BEARISH';
    }

    // Default to consolidation
    return 'CONSOLIDATION';
  }

  private assessLiquidityCondition(walcl: number = 7.5): string {
    if (walcl > this.REGIME_THRESHOLDS.liquidity.abundant) return 'ABUNDANT';
    if (walcl < this.REGIME_THRESHOLDS.liquidity.tight) return 'TIGHT';
    if (walcl < 3) return 'CRISIS';
    return 'NORMAL';
  }

  private calculateRiskAppetite(data: Map<string, any>): number {
    const vix = this.extractLatestValue(data.get('VIX')) || 20;
    const spx = this.extractLatestValue(data.get('SPX')) || 4500;
    const btc = this.extractLatestValue(data.get('BTCUSD')) || 45000;
    const dxy = this.extractLatestValue(data.get('DXY')) || 104;

    // Risk appetite inversely related to VIX, positively to risk assets
    let appetite = 50; // Base level

    // VIX component (inverted)
    appetite += (25 - vix) * 2;

    // Risk asset momentum (simple)
    const spxData = data.get('SPX');
    if (Array.isArray(spxData) && spxData.length > 5) {
      const spxChange = ((spx - spxData[spxData.length - 6].value) / spxData[spxData.length - 6].value) * 100;
      appetite += spxChange * 10;
    }

    // Dollar strength (inverted for risk appetite)
    appetite -= (dxy - 100) * 5;

    return Math.max(0, Math.min(100, appetite));
  }

  private calculateRegimeStrength(vixData: any[], spxData: any[]): number {
    // Measure how established/persistent the current regime is
    if (!Array.isArray(vixData) || !Array.isArray(spxData) || vixData.length < 10) return 50;

    const recentVix = vixData.slice(-10).map(d => d.value);
    const recentSpx = vixData.slice(-10).map(d => d.value);

    // Calculate consistency in recent behavior
    const vixTrend = this.calculateTrendConsistency(recentVix);
    const spxTrend = this.calculateTrendConsistency(recentSpx);

    return (vixTrend + spxTrend) / 2;
  }

  private calculateTrendConsistency(values: number[]): number {
    if (values.length < 3) return 50;

    let consistent = 0;
    for (let i = 1; i < values.length - 1; i++) {
      const prev = values[i - 1];
      const curr = values[i];
      const next = values[i + 1];

      if ((curr > prev && next > curr) || (curr < prev && next < curr)) {
        consistent++;
      }
    }

    return (consistent / (values.length - 2)) * 100;
  }

  private calculateTransitionProbability(
    volState: string, 
    momentum: string, 
    riskAppetite: number
  ): number {
    let probability = 20; // Base transition probability

    // Volatility regime changes increase transition probability
    if (volState.includes('TRANSITION') || volState === 'ELEVATED') {
      probability += 30;
    }

    // Momentum divergences
    if (momentum.includes('CHAOTIC') || momentum.includes('TRANSITION')) {
      probability += 25;
    }

    // Extreme risk appetite levels are unstable
    if (riskAppetite > 80 || riskAppetite < 20) {
      probability += 20;
    }

    return Math.min(100, probability);
  }

  private detectTransitions(metrics: RegimeMetrics, currentRegime: MarketRegime): string[] {
    const signals: string[] = [];

    if (metrics.transitionProbability > 70) {
      signals.push('HIGH_TRANSITION_PROBABILITY');
    }

    if (metrics.volatilityState.includes('TRANSITION')) {
      signals.push('VOLATILITY_REGIME_SHIFT');
    }

    if (metrics.riskAppetite > 85) {
      signals.push('EXTREME_COMPLACENCY');
    }

    if (metrics.riskAppetite < 15) {
      signals.push('EXTREME_FEAR');
    }

    if (currentRegime === 'EUPHORIA') {
      signals.push('BUBBLE_WARNING');
    }

    if (currentRegime === 'CAPITULATION') {
      signals.push('CAPITULATION_SIGNAL');
    }

    return signals;
  }

  private predictNextRegime(currentRegime: MarketRegime, metrics: RegimeMetrics): string {
    const transitionMap: Record<MarketRegime, string> = {
      'RISK_ON_TRENDING': metrics.riskAppetite > 80 ? 'EUPHORIA' : 'CONSOLIDATION',
      'RISK_OFF_TRENDING': metrics.riskAppetite < 20 ? 'CAPITULATION' : 'CONSOLIDATION',
      'EUPHORIA': 'VOLATILITY_SPIKE',
      'CAPITULATION': 'TRANSITION_BULLISH',
      'VOLATILITY_SPIKE': 'CONSOLIDATION',
      'LIQUIDITY_CRISIS': 'TRANSITION_BULLISH',
      'CONSOLIDATION': metrics.riskAppetite > 60 ? 'TRANSITION_BULLISH' : 'TRANSITION_BEARISH',
      'TRANSITION_BULLISH': 'RISK_ON_TRENDING',
      'TRANSITION_BEARISH': 'RISK_OFF_TRENDING'
    };

    return transitionMap[currentRegime] || 'CONSOLIDATION';
  }

  private calculateCrossAssetAlignment(data: Map<string, any>): number {
    // Measure how aligned different asset classes are
    const spx = this.extractLatestValue(data.get('SPX'));
    const btc = this.extractLatestValue(data.get('BTCUSD'));
    const dxy = this.extractLatestValue(data.get('DXY'));
    const dgs10 = this.extractLatestValue(data.get('DGS10'));

    // Calculate simple momentum for each asset (placeholder)
    // In real implementation, this would be more sophisticated
    return 75; // Mock alignment score
  }

  private getRegimeHistory(): string[] {
    // Placeholder for regime history tracking
    return ['CONSOLIDATION', 'TRANSITION_BULLISH', 'RISK_ON_TRENDING'];
  }

  private determineSignal(regime: MarketRegime, transitions: string[]): EngineOutput['signal'] {
    if (regime === 'EUPHORIA' || transitions.includes('BUBBLE_WARNING')) return 'WARNING';
    if (regime === 'CAPITULATION' || regime === 'LIQUIDITY_CRISIS') return 'RISK_OFF';
    if (regime === 'RISK_ON_TRENDING' || regime === 'TRANSITION_BULLISH') return 'RISK_ON';
    if (regime === 'RISK_OFF_TRENDING' || regime === 'TRANSITION_BEARISH') return 'RISK_OFF';
    if (transitions.includes('HIGH_TRANSITION_PROBABILITY')) return 'WARNING';
    
    return 'NEUTRAL';
  }

  private calculateConfidence(metrics: RegimeMetrics, regime: MarketRegime): number {
    let confidence = 50;

    // Higher confidence with stronger regime establishment
    confidence += Math.min(25, metrics.regimeStrength * 0.5);

    // Lower confidence during transitions
    confidence -= Math.min(20, metrics.transitionProbability * 0.3);

    // Higher confidence for extreme regimes
    if (regime === 'EUPHORIA' || regime === 'CAPITULATION') {
      confidence += 20;
    }

    return Math.max(0, Math.min(100, confidence));
  }

  private generateAnalysis(regime: MarketRegime, metrics: RegimeMetrics, transitions: string[]): string {
    const storybook: Record<MarketRegime, string> = {
      'RISK_ON_TRENDING': `Risk-on momentum established. Strong bullish regime with ${metrics.riskAppetite.toFixed(0)}% risk appetite. Trend strength: ${metrics.regimeStrength.toFixed(0)}%.`,
      'RISK_OFF_TRENDING': `Risk-off pressure intensifying. Bearish momentum with ${metrics.riskAppetite.toFixed(0)}% risk appetite decline. Defensive positioning recommended.`,
      'EUPHORIA': `EXTREME EUPHORIA WARNING! Risk appetite at ${metrics.riskAppetite.toFixed(0)}%. Market complacency dangerous - prepare for volatility spike.`,
      'CAPITULATION': `CAPITULATION EVENT! Risk appetite collapsed to ${metrics.riskAppetite.toFixed(0)}%. Extreme fear creating potential buying opportunity.`,
      'VOLATILITY_SPIKE': `Volatility explosion in progress. Regime instability with ${metrics.transitionProbability.toFixed(0)}% transition probability. Risk management critical.`,
      'LIQUIDITY_CRISIS': `LIQUIDITY CRISIS DETECTED! Market stress extreme. Emergency Fed intervention likely required. Preserve capital.`,
      'CONSOLIDATION': `Market consolidation phase. Neutral regime with balanced ${metrics.riskAppetite.toFixed(0)}% risk appetite. Awaiting directional catalyst.`,
      'TRANSITION_BULLISH': `Bullish transition developing. Early risk-on signals emerging with improving sentiment. Monitor for confirmation.`,
      'TRANSITION_BEARISH': `Bearish transition underway. Risk appetite declining to ${metrics.riskAppetite.toFixed(0)}%. Defensive positioning advised.`
    };

    let analysis = storybook[regime] || `Market regime: ${regime}`;
    
    if (transitions.length > 0) {
      analysis += ` Transition signals: ${transitions.join(', ')}.`;
    }

    return analysis;
  }

  private generateRegimeAlerts(regime: MarketRegime, metrics: RegimeMetrics, transitions: string[]): Alert[] {
    const alerts: Alert[] = [];

    if (regime === 'EUPHORIA') {
      alerts.push({
        level: 'critical',
        message: 'EUPHORIA DETECTED: Extreme market complacency - major correction risk',
        timestamp: Date.now()
      });
    }

    if (regime === 'CAPITULATION') {
      alerts.push({
        level: 'critical',
        message: 'CAPITULATION EVENT: Extreme fear - potential major bottom forming',
        timestamp: Date.now()
      });
    }

    if (regime === 'LIQUIDITY_CRISIS') {
      alerts.push({
        level: 'critical',
        message: 'LIQUIDITY CRISIS: System stress - emergency intervention required',
        timestamp: Date.now()
      });
    }

    if (metrics.transitionProbability > 80) {
      alerts.push({
        level: 'warning',
        message: `High regime transition probability: ${metrics.transitionProbability.toFixed(0)}%`,
        timestamp: Date.now()
      });
    }

    return alerts;
  }

  validateData(data: Map<string, any>): boolean {
    const required = ['VIX', 'SPX'];
    return required.every(indicator => {
      const values = data.get(indicator);
      return values !== undefined && values !== null;
    });
  }
}