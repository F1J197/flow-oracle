/**
 * Tail Risk Engine - Extreme Value Theory Implementation
 * Detects tail events and calculates dynamic VaR using EVT
 */

import { BaseEngine, EngineConfig, EngineOutput } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'tail-risk',
  name: 'Tail Risk Engine',
  pillar: 3,
  priority: 85,
  updateInterval: 300000, // 5 minutes
  requiredIndicators: ['SPX', 'VIX', 'BTCUSD', 'DXY', 'GOLD']
};

interface TailRiskMetrics {
  var99: number;
  cvar99: number;
  tailIndex: number;
  extremeEvents: number;
  distributionFit: string;
  riskRegime: 'NORMAL' | 'ELEVATED' | 'EXTREME';
}

interface ExtremeValue {
  date: Date;
  value: number;
  severity: 'MODERATE' | 'SEVERE' | 'EXTREME';
  assetClass: string;
}

export class TailRiskEngine extends BaseEngine {
  private readonly EVT_THRESHOLD = 0.95; // 95th percentile for POT method
  private readonly EXTREME_THRESHOLDS = {
    VAR_99: 0.05,   // 5% daily VaR threshold
    CVAR_99: 0.08,  // 8% daily CVaR threshold
    TAIL_INDEX: 0.3 // Tail index threshold
  };

  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    // Extract price data for tail risk analysis
    const spxData = this.extractTimeSeriesData(data.get('SPX')) || [];
    const vixData = this.extractTimeSeriesData(data.get('VIX')) || [];
    const btcData = this.extractTimeSeriesData(data.get('BTCUSD')) || [];
    const dxyData = this.extractTimeSeriesData(data.get('DXY')) || [];
    const goldData = this.extractTimeSeriesData(data.get('GOLD')) || [];

    // Calculate returns for each asset
    const returns = {
      spx: this.calculateReturns(spxData),
      vix: this.calculateReturns(vixData),
      btc: this.calculateReturns(btcData),
      dxy: this.calculateReturns(dxyData),
      gold: this.calculateReturns(goldData)
    };

    // Perform EVT analysis on combined portfolio
    const combinedReturns = this.createCompositeReturns(returns);
    const tailMetrics = this.calculateTailRisk(combinedReturns);
    
    // Detect extreme events across assets
    const extremeEvents = this.detectExtremeEvents(returns);
    
    // Determine risk regime
    const riskRegime = this.determineRiskRegime(tailMetrics, extremeEvents);
    
    // Calculate confidence based on data quality and model fit
    const confidence = this.calculateConfidence(combinedReturns, tailMetrics);
    
    // Determine signal
    const signal = this.determineSignal(riskRegime, tailMetrics);

    return {
      primaryMetric: {
        value: tailMetrics.var99 * 100, // Convert to percentage
        change24h: this.calculateVarChange(tailMetrics.var99),
        changePercent: this.calculateVarChangePercent(tailMetrics.var99)
      },
      signal,
      confidence,
      analysis: this.generateAnalysis(tailMetrics, riskRegime, extremeEvents),
      subMetrics: {
        var99_percent: Math.round(tailMetrics.var99 * 10000) / 100, // 99% VaR as percentage
        cvar99_percent: Math.round(tailMetrics.cvar99 * 10000) / 100, // 99% CVaR as percentage
        tail_index: Number(tailMetrics.tailIndex.toFixed(3)),
        extreme_events_count: extremeEvents.length,
        risk_regime: riskRegime,
        distribution_fit: tailMetrics.distributionFit,
        
        // Asset-specific tail risks
        spx_tail_risk: this.calculateAssetTailRisk(returns.spx),
        btc_tail_risk: this.calculateAssetTailRisk(returns.btc),
        vix_tail_protection: this.calculateVixTailProtection(returns.vix),
        
        // Cross-asset tail correlations
        tail_correlation: this.calculateTailCorrelation(returns),
        contagion_risk: this.calculateContagionRisk(extremeEvents),
        
        // Early warning indicators
        kurtosis: this.calculateKurtosis(combinedReturns),
        skewness: this.calculateSkewness(combinedReturns),
        max_drawdown: this.calculateMaxDrawdown(combinedReturns),
        
        // Historical context
        historical_percentile: this.calculateHistoricalPercentile(tailMetrics.var99),
        stress_test_result: this.performStressTest(returns),
        
        // Hedging recommendations
        hedge_ratio: this.calculateOptimalHedgeRatio(returns),
        tail_hedge_cost: this.estimateTailHedgeCost(tailMetrics.var99)
      }
    };
  }

  private extractTimeSeriesData(data: any): number[] {
    if (!data) return [];
    if (Array.isArray(data)) {
      return data.map(d => typeof d === 'object' ? d.value || d.close || d.price : d);
    }
    return [typeof data === 'object' ? data.value || data.close || data.price : data];
  }

  private calculateReturns(prices: number[]): number[] {
    if (prices.length < 2) return [];
    
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      const ret = (prices[i] - prices[i-1]) / prices[i-1];
      if (isFinite(ret)) {
        returns.push(ret);
      }
    }
    return returns;
  }

  private createCompositeReturns(returns: Record<string, number[]>): number[] {
    // Create equal-weighted composite portfolio returns
    const weights = { spx: 0.4, btc: 0.2, dxy: 0.2, gold: 0.2 };
    const maxLength = Math.max(...Object.values(returns).map(arr => arr.length));
    const composite: number[] = [];
    
    for (let i = 0; i < maxLength; i++) {
      let weightedReturn = 0;
      let totalWeight = 0;
      
      Object.entries(returns).forEach(([asset, rets]) => {
        if (i < rets.length && isFinite(rets[i])) {
          weightedReturn += weights[asset as keyof typeof weights] * rets[i];
          totalWeight += weights[asset as keyof typeof weights];
        }
      });
      
      if (totalWeight > 0) {
        composite.push(weightedReturn / totalWeight);
      }
    }
    
    return composite;
  }

  private calculateTailRisk(returns: number[]): TailRiskMetrics {
    if (returns.length < 50) {
      return {
        var99: 0.02,
        cvar99: 0.03,
        tailIndex: 0.2,
        extremeEvents: 0,
        distributionFit: 'INSUFFICIENT_DATA',
        riskRegime: 'NORMAL'
      };
    }

    // Sort returns for percentile calculation
    const sortedReturns = [...returns].sort((a, b) => a - b);
    
    // Calculate threshold for POT method (95th percentile of losses)
    const losses = sortedReturns.filter(r => r < 0).map(r => -r);
    const thresholdIndex = Math.floor(losses.length * this.EVT_THRESHOLD);
    const threshold = losses.sort((a, b) => a - b)[thresholdIndex] || 0.01;
    
    // Extract exceedances above threshold
    const exceedances = losses.filter(loss => loss > threshold);
    
    if (exceedances.length < 10) {
      // Fallback to empirical quantiles
      const var99 = -sortedReturns[Math.floor(returns.length * 0.01)] || 0.02;
      const cvar99 = this.calculateEmpiricalCVaR(sortedReturns, 0.01);
      
      return {
        var99,
        cvar99,
        tailIndex: 0.2,
        extremeEvents: exceedances.length,
        distributionFit: 'EMPIRICAL',
        riskRegime: 'NORMAL'
      };
    }

    // Fit GPD parameters using Method of Moments
    const excessValues = exceedances.map(e => e - threshold);
    const { xi, beta } = this.fitGPD(excessValues);
    
    // Calculate VaR and CVaR using GPD
    const alpha = 0.01; // 99% confidence level
    const n = returns.length;
    const nu = exceedances.length;
    
    // GPD-based VaR
    const var99 = threshold + (beta / xi) * (Math.pow((n / nu) * alpha, -xi) - 1);
    
    // GPD-based CVaR
    const cvar99 = (var99 + beta - xi * threshold) / (1 - xi);
    
    return {
      var99: Math.abs(var99),
      cvar99: Math.abs(cvar99),
      tailIndex: xi,
      extremeEvents: exceedances.length,
      distributionFit: 'GPD',
      riskRegime: 'NORMAL'
    };
  }

  private fitGPD(excessValues: number[]): { xi: number; beta: number } {
    // Method of Moments estimation for GPD
    const n = excessValues.length;
    const mean = excessValues.reduce((sum, x) => sum + x, 0) / n;
    const variance = excessValues.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
    
    // GPD parameters from method of moments
    const xi = 0.5 * ((mean * mean / variance) - 1);
    const beta = 0.5 * mean * ((mean * mean / variance) + 1);
    
    // Ensure reasonable bounds
    const boundedXi = Math.max(-0.5, Math.min(0.5, xi));
    const boundedBeta = Math.max(0.001, beta);
    
    return { xi: boundedXi, beta: boundedBeta };
  }

  private calculateEmpiricalCVaR(sortedReturns: number[], alpha: number): number {
    const cutoffIndex = Math.floor(sortedReturns.length * alpha);
    const tailReturns = sortedReturns.slice(0, cutoffIndex);
    
    if (tailReturns.length === 0) return 0.03;
    
    const avgTailReturn = tailReturns.reduce((sum, ret) => sum + ret, 0) / tailReturns.length;
    return Math.abs(avgTailReturn);
  }

  private detectExtremeEvents(returns: Record<string, number[]>): ExtremeValue[] {
    const events: ExtremeValue[] = [];
    const today = new Date();
    
    Object.entries(returns).forEach(([asset, rets]) => {
      rets.forEach((ret, index) => {
        const absRet = Math.abs(ret);
        let severity: ExtremeValue['severity'] | null = null;
        
        if (absRet > 0.08) severity = 'EXTREME';   // >8% daily move
        else if (absRet > 0.05) severity = 'SEVERE';    // >5% daily move
        else if (absRet > 0.03) severity = 'MODERATE';  // >3% daily move
        
        if (severity) {
          events.push({
            date: new Date(today.getTime() - (rets.length - index) * 24 * 60 * 60 * 1000),
            value: ret,
            severity,
            assetClass: asset.toUpperCase()
          });
        }
      });
    });
    
    return events.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 20);
  }

  private calculateAssetTailRisk(returns: number[]): number {
    if (returns.length < 10) return 0;
    
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const var95 = -sortedReturns[Math.floor(returns.length * 0.05)] || 0;
    
    return Math.round(var95 * 10000) / 100; // As percentage
  }

  private calculateVixTailProtection(vixReturns: number[]): number {
    // VIX typically spikes during market stress (negative correlation)
    const avgVixReturn = vixReturns.reduce((sum, ret) => sum + ret, 0) / vixReturns.length;
    const volatility = this.calculateVolatility(vixReturns);
    
    // Higher volatility and positive average = better tail protection
    return Math.round((volatility + Math.max(0, avgVixReturn)) * 10000) / 100;
  }

  private calculateTailCorrelation(returns: Record<string, number[]>): number {
    // Calculate correlation between assets during tail events
    const spxReturns = returns.spx || [];
    const btcReturns = returns.btc || [];
    
    if (spxReturns.length < 10 || btcReturns.length < 10) return 0;
    
    // Focus on tail events (bottom 5% of returns)
    const minLength = Math.min(spxReturns.length, btcReturns.length);
    const cutoff = Math.floor(minLength * 0.05);
    
    const spxTail = [...spxReturns].sort((a, b) => a - b).slice(0, cutoff);
    const btcTail = [...btcReturns].sort((a, b) => a - b).slice(0, cutoff);
    
    return this.calculateCorrelation(spxTail, btcTail);
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 3) return 0;
    
    const meanX = x.reduce((sum, val) => sum + val, 0) / x.length;
    const meanY = y.reduce((sum, val) => sum + val, 0) / y.length;
    
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < x.length; i++) {
      const devX = x[i] - meanX;
      const devY = y[i] - meanY;
      numerator += devX * devY;
      denomX += devX * devX;
      denomY += devY * devY;
    }
    
    const denominator = Math.sqrt(denomX * denomY);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateContagionRisk(extremeEvents: ExtremeValue[]): number {
    // Count simultaneous extreme events across assets
    const dateGroups = new Map<string, ExtremeValue[]>();
    
    extremeEvents.forEach(event => {
      const dateKey = event.date.toDateString();
      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, []);
      }
      dateGroups.get(dateKey)!.push(event);
    });
    
    // Calculate percentage of days with multiple extreme events
    const multiAssetEvents = Array.from(dateGroups.values()).filter(events => events.length > 1);
    const contagionRate = multiAssetEvents.length / Math.max(1, dateGroups.size);
    
    return Math.round(contagionRate * 100);
  }

  private calculateKurtosis(returns: number[]): number {
    if (returns.length < 4) return 3; // Normal distribution kurtosis
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return 3;
    
    const fourthMoment = returns.reduce((sum, ret) => {
      return sum + Math.pow((ret - mean) / stdDev, 4);
    }, 0) / returns.length;
    
    return fourthMoment;
  }

  private calculateSkewness(returns: number[]): number {
    if (returns.length < 3) return 0;
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return 0;
    
    const thirdMoment = returns.reduce((sum, ret) => {
      return sum + Math.pow((ret - mean) / stdDev, 3);
    }, 0) / returns.length;
    
    return thirdMoment;
  }

  private calculateMaxDrawdown(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    let cumulative = 1;
    let peak = 1;
    let maxDrawdown = 0;
    
    returns.forEach(ret => {
      cumulative *= (1 + ret);
      peak = Math.max(peak, cumulative);
      const drawdown = (peak - cumulative) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    });
    
    return Math.round(maxDrawdown * 10000) / 100; // As percentage
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / (returns.length - 1);
    
    return Math.sqrt(variance);
  }

  private calculateHistoricalPercentile(currentVar: number): number {
    // Mock historical percentile - would use actual historical VaR data
    const historicalVars = [0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05, 0.055, 0.06];
    const position = historicalVars.findIndex(varValue => varValue >= currentVar);
    
    return position === -1 ? 100 : (position / historicalVars.length) * 100;
  }

  private performStressTest(returns: Record<string, number[]>): string {
    // Simulate 2008-style stress scenario
    const spxStress = -0.20; // -20% SPX move
    const btcStress = -0.30; // -30% BTC move
    const vixStress = 3.0;   // VIX triples
    
    const portfolioStress = 0.4 * spxStress + 0.2 * btcStress + 0.2 * 0.1 + 0.2 * 0.05;
    
    if (portfolioStress < -0.15) return 'FAIL';
    if (portfolioStress < -0.10) return 'MARGINAL';
    return 'PASS';
  }

  private calculateOptimalHedgeRatio(returns: Record<string, number[]>): number {
    // Calculate hedge ratio for VIX-based tail hedge
    const spxReturns = returns.spx || [];
    const vixReturns = returns.vix || [];
    
    if (spxReturns.length < 10 || vixReturns.length < 10) return 0.1;
    
    const correlation = this.calculateCorrelation(spxReturns, vixReturns);
    const spxVol = this.calculateVolatility(spxReturns);
    const vixVol = this.calculateVolatility(vixReturns);
    
    if (vixVol === 0) return 0.1;
    
    // Optimal hedge ratio = correlation * (spx_vol / vix_vol)
    const hedgeRatio = Math.abs(correlation) * (spxVol / vixVol);
    
    return Math.max(0.05, Math.min(0.25, hedgeRatio)); // Bounded between 5-25%
  }

  private estimateTailHedgeCost(var99: number): number {
    // Estimate annual cost of tail hedge as % of portfolio
    // Higher VaR = higher hedge cost
    const baseCost = 0.02; // 2% base cost
    const riskPremium = var99 * 10; // Scale with VaR
    
    return Math.round((baseCost + riskPremium) * 100 * 100) / 100; // As percentage
  }

  private determineRiskRegime(tailMetrics: TailRiskMetrics, extremeEvents: ExtremeValue[]): TailRiskMetrics['riskRegime'] {
    const { var99, tailIndex } = tailMetrics;
    const recentExtremes = extremeEvents.filter(e => 
      Date.now() - e.date.getTime() < 30 * 24 * 60 * 60 * 1000 // Last 30 days
    ).length;
    
    if (var99 > this.EXTREME_THRESHOLDS.VAR_99 || recentExtremes > 5) {
      return 'EXTREME';
    }
    
    if (var99 > this.EXTREME_THRESHOLDS.VAR_99 * 0.7 || tailIndex > this.EXTREME_THRESHOLDS.TAIL_INDEX) {
      return 'ELEVATED';
    }
    
    return 'NORMAL';
  }

  private determineSignal(riskRegime: string, tailMetrics: TailRiskMetrics): EngineOutput['signal'] {
    if (riskRegime === 'EXTREME') return 'RISK_OFF';
    if (riskRegime === 'ELEVATED') return 'WARNING';
    if (tailMetrics.var99 < this.EXTREME_THRESHOLDS.VAR_99 * 0.5) return 'RISK_ON';
    return 'NEUTRAL';
  }

  private calculateConfidence(returns: number[], tailMetrics: TailRiskMetrics): number {
    let confidence = 70; // Base confidence
    
    // More data = higher confidence
    if (returns.length > 100) confidence += 15;
    else if (returns.length > 50) confidence += 10;
    
    // Good distribution fit = higher confidence
    if (tailMetrics.distributionFit === 'GPD' && tailMetrics.extremeEvents > 10) {
      confidence += 15;
    }
    
    // Extreme readings reduce confidence due to model uncertainty
    if (tailMetrics.var99 > this.EXTREME_THRESHOLDS.VAR_99 * 2) {
      confidence -= 10;
    }
    
    return Math.min(100, confidence);
  }

  private calculateVarChange(currentVar: number): number {
    // Mock 24h change calculation
    return (Math.random() - 0.5) * currentVar * 0.2; // ±10% of current VaR
  }

  private calculateVarChangePercent(currentVar: number): number {
    const change24h = this.calculateVarChange(currentVar);
    return (change24h / currentVar) * 100;
  }

  private generateAnalysis(tailMetrics: TailRiskMetrics, riskRegime: string, extremeEvents: ExtremeValue[]): string {
    let analysis = `Tail risk at ${(tailMetrics.var99 * 100).toFixed(2)}% (99% VaR) `;
    analysis += `with ${riskRegime.toLowerCase()} risk regime. `;
    
    if (tailMetrics.distributionFit === 'GPD') {
      analysis += `GPD fit shows tail index of ${tailMetrics.tailIndex.toFixed(3)}. `;
    }
    
    const recentExtremes = extremeEvents.filter(e => 
      Date.now() - e.date.getTime() < 7 * 24 * 60 * 60 * 1000
    ).length;
    
    if (recentExtremes > 2) {
      analysis += `${recentExtremes} extreme events in past week signal elevated risk. `;
    }
    
    if (tailMetrics.var99 > this.EXTREME_THRESHOLDS.VAR_99) {
      analysis += 'Consider tail hedging strategies. ';
    }
    
    return analysis;
  }

  validateData(data: Map<string, any>): boolean {
    const required = ['SPX', 'VIX'];
    return required.every(indicator => data.has(indicator));
  }
}