import { BaseEngine, EngineConfig, EngineOutput, Alert } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'performance-attribution',
  name: 'Performance Attribution Engine',
  pillar: 4,
  priority: 60,
  updateInterval: 600000, // 10 minutes
  requiredIndicators: [],
  dependencies: [
    'master-control',
    'signal-aggregator',
    'market-regime',
    'enhanced-momentum',
    'volatility-regime'
  ]
};

interface PerformanceMetrics {
  totalReturn: number;
  engineContributions: Map<string, number>;
  sharpleyValues: Map<string, number>;
  attributionBreakdown: AttributionBreakdown;
  riskAdjustedReturn: number;
  maxDrawdown: number;
  winRate: number;
  informationRatio: number;
}

interface AttributionBreakdown {
  momentumFactor: number;
  volatilityFactor: number;
  liquidityFactor: number;
  creditFactor: number;
  regimeFactor: number;
  alpha: number;
}

export class PerformanceAttributionEngine extends BaseEngine {
  private performanceHistory: Array<{
    timestamp: number;
    engineOutputs: Map<string, any>;
    hypotheticalReturn: number;
  }> = [];

  private readonly BENCHMARK_RETURN = 0.08; // 8% annual benchmark

  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    // Collect all engine outputs for attribution
    const engineOutputs = this.collectEngineOutputs(data);
    
    // Calculate hypothetical performance based on signals
    const hypotheticalReturn = this.calculateHypotheticalReturn(engineOutputs);
    
    // Store performance data
    this.storePerformanceData(engineOutputs, hypotheticalReturn);
    
    // Calculate attribution metrics
    const metrics = this.calculatePerformanceMetrics();
    
    // Generate performance insights
    const insights = this.generatePerformanceInsights(metrics);
    
    // Performance alerts
    const alerts = this.generatePerformanceAlerts(metrics);

    return {
      primaryMetric: {
        value: metrics.totalReturn * 100, // Convert to percentage
        change24h: this.calculateRecentPerformance(),
        changePercent: metrics.riskAdjustedReturn * 100
      },
      signal: this.determinePerformanceSignal(metrics),
      confidence: this.calculateAttributionConfidence(metrics),
      analysis: this.generateAnalysis(metrics, insights),
      subMetrics: {
        totalReturn: metrics.totalReturn,
        annualizedReturn: this.annualizeReturn(metrics.totalReturn),
        riskAdjustedReturn: metrics.riskAdjustedReturn,
        sharpeRatio: this.calculateSharpeRatio(metrics),
        maxDrawdown: metrics.maxDrawdown,
        winRate: metrics.winRate,
        informationRatio: metrics.informationRatio,
        engineContributions: Object.fromEntries(metrics.engineContributions),
        attributionBreakdown: metrics.attributionBreakdown,
        factorAnalysis: this.analyzeFactorPerformance(metrics),
        performanceDecomposition: this.decomposePerformance(metrics),
        risMetrics: this.calculateRiskMetrics(metrics)
      },
      alerts
    };
  }

  private collectEngineOutputs(data: Map<string, any>): Map<string, any> {
    const outputs = new Map<string, any>();
    
    config.dependencies.forEach(engineId => {
      const output = data.get(`ENGINE_${engineId}`);
      if (output) {
        outputs.set(engineId, output);
      }
    });
    
    return outputs;
  }

  private calculateHypotheticalReturn(engineOutputs: Map<string, any>): number {
    let totalReturn = 0;
    let totalWeight = 0;

    // Weight engines by their confidence and priority
    const engineWeights: Record<string, number> = {
      'master-control': 0.30,
      'signal-aggregator': 0.25,
      'market-regime': 0.20,
      'enhanced-momentum': 0.15,
      'volatility-regime': 0.10
    };

    engineOutputs.forEach((output, engineId) => {
      const weight = engineWeights[engineId] || 0.1;
      const engineReturn = this.convertSignalToReturn(output.signal, output.confidence);
      
      totalReturn += engineReturn * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalReturn / totalWeight : 0;
  }

  private convertSignalToReturn(signal: string, confidence: number): number {
    const baseReturn = 0.001; // 0.1% base daily return
    const confidenceMultiplier = confidence / 100;

    const signalMultipliers: Record<string, number> = {
      'RISK_ON': 1.5,
      'RISK_OFF': -1.2,
      'WARNING': -0.5,
      'NEUTRAL': 0
    };

    const multiplier = signalMultipliers[signal] || 0;
    return baseReturn * multiplier * confidenceMultiplier;
  }

  private storePerformanceData(engineOutputs: Map<string, any>, hypotheticalReturn: number): void {
    this.performanceHistory.push({
      timestamp: Date.now(),
      engineOutputs: new Map(engineOutputs),
      hypotheticalReturn
    });

    // Keep last 100 data points
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }
  }

  private calculatePerformanceMetrics(): PerformanceMetrics {
    if (this.performanceHistory.length < 10) {
      return this.getDefaultMetrics();
    }

    // Calculate total return
    const totalReturn = this.performanceHistory.reduce((sum, entry) => sum + entry.hypotheticalReturn, 0);
    
    // Calculate engine contributions using Shapley values
    const engineContributions = this.calculateEngineContributions();
    const sharpleyValues = this.calculateShapleyValues(engineContributions);
    
    // Attribution breakdown
    const attributionBreakdown = this.calculateAttributionBreakdown();
    
    // Risk metrics
    const returns = this.performanceHistory.map(entry => entry.hypotheticalReturn);
    const riskAdjustedReturn = this.calculateRiskAdjustedReturn(returns);
    const maxDrawdown = this.calculateMaxDrawdown(returns);
    const winRate = this.calculateWinRate(returns);
    const informationRatio = this.calculateInformationRatio(returns);

    return {
      totalReturn,
      engineContributions,
      sharpleyValues,
      attributionBreakdown,
      riskAdjustedReturn,
      maxDrawdown,
      winRate,
      informationRatio
    };
  }

  private calculateEngineContributions(): Map<string, number> {
    const contributions = new Map<string, number>();
    
    if (this.performanceHistory.length === 0) return contributions;

    // Calculate each engine's contribution to total return
    config.dependencies.forEach(engineId => {
      let engineReturn = 0;
      let count = 0;

      this.performanceHistory.forEach(entry => {
        const engineOutput = entry.engineOutputs.get(engineId);
        if (engineOutput) {
          const engineDailyReturn = this.convertSignalToReturn(engineOutput.signal, engineOutput.confidence);
          engineReturn += engineDailyReturn;
          count++;
        }
      });

      if (count > 0) {
        contributions.set(engineId, engineReturn);
      }
    });

    return contributions;
  }

  private calculateShapleyValues(contributions: Map<string, number>): Map<string, number> {
    // Simplified Shapley value calculation
    const shapleyValues = new Map<string, number>();
    const totalContribution = Array.from(contributions.values()).reduce((sum, val) => sum + Math.abs(val), 0);

    if (totalContribution === 0) return shapleyValues;

    contributions.forEach((contribution, engineId) => {
      shapleyValues.set(engineId, Math.abs(contribution) / totalContribution);
    });

    return shapleyValues;
  }

  private calculateAttributionBreakdown(): AttributionBreakdown {
    // Factor-based attribution analysis
    const momentumContrib = this.calculateFactorContribution('enhanced-momentum');
    const volatilityContrib = this.calculateFactorContribution('volatility-regime');
    const liquidityContrib = this.calculateFactorContribution('net-liquidity');
    const creditContrib = this.calculateFactorContribution('credit-stress');
    const regimeContrib = this.calculateFactorContribution('market-regime');
    
    // Alpha is unexplained return
    const totalExplained = momentumContrib + volatilityContrib + liquidityContrib + creditContrib + regimeContrib;
    const totalReturn = this.performanceHistory.reduce((sum, entry) => sum + entry.hypotheticalReturn, 0);
    const alpha = totalReturn - totalExplained;

    return {
      momentumFactor: momentumContrib,
      volatilityFactor: volatilityContrib,
      liquidityFactor: liquidityContrib,
      creditFactor: creditContrib,
      regimeFactor: regimeContrib,
      alpha
    };
  }

  private calculateFactorContribution(factorEngine: string): number {
    // Calculate contribution of specific factor
    let contribution = 0;
    let count = 0;

    this.performanceHistory.forEach(entry => {
      const engineOutput = entry.engineOutputs.get(factorEngine);
      if (engineOutput) {
        const factorReturn = this.convertSignalToReturn(engineOutput.signal, engineOutput.confidence);
        contribution += factorReturn * 0.2; // Weight factor contribution
        count++;
      }
    });

    return count > 0 ? contribution : 0;
  }

  private calculateRiskAdjustedReturn(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev === 0 ? 0 : avgReturn / stdDev;
  }

  private calculateMaxDrawdown(returns: number[]): number {
    let peak = 0;
    let maxDrawdown = 0;
    let cumReturn = 0;

    returns.forEach(ret => {
      cumReturn += ret;
      peak = Math.max(peak, cumReturn);
      const drawdown = (peak - cumReturn) / Math.max(peak, 0.001);
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    });

    return maxDrawdown;
  }

  private calculateWinRate(returns: number[]): number {
    if (returns.length === 0) return 0;
    const wins = returns.filter(ret => ret > 0).length;
    return wins / returns.length;
  }

  private calculateInformationRatio(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const benchmarkReturn = this.BENCHMARK_RETURN / 252; // Daily benchmark
    const excessReturns = returns.map(ret => ret - benchmarkReturn);
    const avgExcess = excessReturns.reduce((sum, ret) => sum + ret, 0) / excessReturns.length;
    const trackingError = Math.sqrt(
      excessReturns.reduce((sum, ret) => sum + Math.pow(ret - avgExcess, 2), 0) / excessReturns.length
    );
    
    return trackingError === 0 ? 0 : avgExcess / trackingError;
  }

  private calculateSharpeRatio(metrics: PerformanceMetrics): number {
    const riskFreeRate = 0.03 / 252; // 3% annual risk-free rate, daily
    const excessReturn = metrics.totalReturn - (riskFreeRate * this.performanceHistory.length);
    
    return metrics.riskAdjustedReturn === 0 ? 0 : excessReturn / Math.abs(metrics.riskAdjustedReturn);
  }

  private annualizeReturn(totalReturn: number): number {
    if (this.performanceHistory.length === 0) return 0;
    const days = this.performanceHistory.length;
    return totalReturn * (252 / days); // Annualize based on trading days
  }

  private calculateRecentPerformance(): number {
    if (this.performanceHistory.length < 5) return 0;
    return this.performanceHistory.slice(-5).reduce((sum, entry) => sum + entry.hypotheticalReturn, 0);
  }

  private determinePerformanceSignal(metrics: PerformanceMetrics): EngineOutput['signal'] {
    if (metrics.totalReturn > 0.02 && metrics.winRate > 0.6) return 'RISK_ON';
    if (metrics.totalReturn < -0.02 || metrics.maxDrawdown > 0.1) return 'RISK_OFF';
    if (metrics.informationRatio < -0.5) return 'WARNING';
    return 'NEUTRAL';
  }

  private calculateAttributionConfidence(metrics: PerformanceMetrics): number {
    let confidence = 50;
    
    // More data = higher confidence
    confidence += Math.min(25, this.performanceHistory.length);
    
    // Consistent performance = higher confidence
    if (metrics.winRate > 0.6) confidence += 15;
    if (metrics.informationRatio > 0.5) confidence += 10;
    
    return Math.min(100, confidence);
  }

  private generatePerformanceInsights(metrics: PerformanceMetrics): any {
    return {
      topPerformingEngine: this.getTopPerformingEngine(metrics),
      worstPerformingEngine: this.getWorstPerformingEngine(metrics),
      consistencyScore: this.calculateConsistencyScore(metrics),
      riskEfficiency: this.calculateRiskEfficiency(metrics)
    };
  }

  private getTopPerformingEngine(metrics: PerformanceMetrics): string {
    let topEngine = '';
    let maxContribution = -Infinity;
    
    metrics.engineContributions.forEach((contribution, engine) => {
      if (contribution > maxContribution) {
        maxContribution = contribution;
        topEngine = engine;
      }
    });
    
    return topEngine;
  }

  private getWorstPerformingEngine(metrics: PerformanceMetrics): string {
    let worstEngine = '';
    let minContribution = Infinity;
    
    metrics.engineContributions.forEach((contribution, engine) => {
      if (contribution < minContribution) {
        minContribution = contribution;
        worstEngine = engine;
      }
    });
    
    return worstEngine;
  }

  private calculateConsistencyScore(metrics: PerformanceMetrics): number {
    return metrics.winRate * 100;
  }

  private calculateRiskEfficiency(metrics: PerformanceMetrics): number {
    return metrics.maxDrawdown === 0 ? 100 : Math.max(0, 100 - (metrics.maxDrawdown * 1000));
  }

  private analyzeFactorPerformance(metrics: PerformanceMetrics): any {
    const breakdown = metrics.attributionBreakdown;
    return {
      topFactor: this.getTopFactor(breakdown),
      factorBalance: this.calculateFactorBalance(breakdown),
      factorRisk: this.assessFactorRisk(breakdown)
    };
  }

  private getTopFactor(breakdown: AttributionBreakdown): string {
    const factors = {
      momentum: breakdown.momentumFactor,
      volatility: breakdown.volatilityFactor,
      liquidity: breakdown.liquidityFactor,
      credit: breakdown.creditFactor,
      regime: breakdown.regimeFactor
    };
    
    return Object.entries(factors).reduce((top, [factor, value]) => 
      value > factors[top] ? factor : top, 'momentum'
    );
  }

  private calculateFactorBalance(breakdown: AttributionBreakdown): number {
    const factors = [
      breakdown.momentumFactor,
      breakdown.volatilityFactor,
      breakdown.liquidityFactor,
      breakdown.creditFactor,
      breakdown.regimeFactor
    ];
    
    const total = factors.reduce((sum, factor) => sum + Math.abs(factor), 0);
    if (total === 0) return 100;
    
    const maxFactor = Math.max(...factors.map(f => Math.abs(f)));
    return Math.max(0, 100 - (maxFactor / total * 100));
  }

  private assessFactorRisk(breakdown: AttributionBreakdown): string {
    const totalFactor = Math.abs(breakdown.momentumFactor) + 
                       Math.abs(breakdown.volatilityFactor) + 
                       Math.abs(breakdown.liquidityFactor) + 
                       Math.abs(breakdown.creditFactor) + 
                       Math.abs(breakdown.regimeFactor);
    
    if (Math.abs(breakdown.alpha) > totalFactor) return 'HIGH_ALPHA_RISK';
    if (totalFactor > 0.05) return 'HIGH_FACTOR_EXPOSURE';
    return 'BALANCED';
  }

  private decomposePerformance(metrics: PerformanceMetrics): any {
    return {
      skillReturn: metrics.attributionBreakdown.alpha,
      factorReturn: metrics.totalReturn - metrics.attributionBreakdown.alpha,
      riskContribution: this.calculateRiskContribution(metrics),
      timingContribution: this.calculateTimingContribution()
    };
  }

  private calculateRiskContribution(metrics: PerformanceMetrics): number {
    return metrics.maxDrawdown * -1; // Risk detracted from return
  }

  private calculateTimingContribution(): number {
    // Mock timing contribution
    return Math.random() * 0.01 - 0.005;
  }

  private calculateRiskMetrics(metrics: PerformanceMetrics): any {
    return {
      volatility: Math.abs(metrics.riskAdjustedReturn),
      downside_deviation: metrics.maxDrawdown,
      calmar_ratio: metrics.totalReturn / Math.max(metrics.maxDrawdown, 0.001),
      sortino_ratio: metrics.riskAdjustedReturn * 1.5 // Mock Sortino
    };
  }

  private getDefaultMetrics(): PerformanceMetrics {
    return {
      totalReturn: 0,
      engineContributions: new Map(),
      sharpleyValues: new Map(),
      attributionBreakdown: {
        momentumFactor: 0,
        volatilityFactor: 0,
        liquidityFactor: 0,
        creditFactor: 0,
        regimeFactor: 0,
        alpha: 0
      },
      riskAdjustedReturn: 0,
      maxDrawdown: 0,
      winRate: 0,
      informationRatio: 0
    };
  }

  private generateAnalysis(metrics: PerformanceMetrics, insights: any): string {
    const annualizedReturn = this.annualizeReturn(metrics.totalReturn);
    const { topPerformingEngine, consistencyScore } = insights;
    
    return `Performance Attribution: ${(annualizedReturn * 100).toFixed(1)}% annualized return with ${(metrics.winRate * 100).toFixed(0)}% win rate. 
            Top contributor: ${topPerformingEngine} engine. Max drawdown: ${(metrics.maxDrawdown * 100).toFixed(1)}%. 
            Sharpe ratio: ${this.calculateSharpeRatio(metrics).toFixed(2)}. Alpha generation: ${(metrics.attributionBreakdown.alpha * 100).toFixed(2)}%.`;
  }

  private generatePerformanceAlerts(metrics: PerformanceMetrics): Alert[] {
    const alerts: Alert[] = [];

    if (metrics.maxDrawdown > 0.1) {
      alerts.push({
        level: 'warning',
        message: `High drawdown detected: ${(metrics.maxDrawdown * 100).toFixed(1)}%`,
        timestamp: Date.now()
      });
    }

    if (metrics.winRate < 0.4) {
      alerts.push({
        level: 'warning',
        message: `Low win rate: ${(metrics.winRate * 100).toFixed(0)}% - review strategy`,
        timestamp: Date.now()
      });
    }

    if (metrics.informationRatio < -0.5) {
      alerts.push({
        level: 'critical',
        message: `Negative information ratio: ${metrics.informationRatio.toFixed(2)} - underperforming benchmark`,
        timestamp: Date.now()
      });
    }

    return alerts;
  }

  validateData(data: Map<string, any>): boolean {
    // Check if we have at least some engine outputs
    return config.dependencies.some(engineId => data.has(`ENGINE_${engineId}`));
  }
}
