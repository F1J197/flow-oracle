import { EngineOutput } from '@/engines/BaseEngine';
import { EngineIntelligence, MarketNarrative, ActionableItem, MarketIntelligenceSnapshot } from '@/types/intelligence';

export class EngineIntelligenceService {
  private static instance: EngineIntelligenceService;
  private engineIntelligence: Map<string, EngineIntelligence> = new Map();

  static getInstance(): EngineIntelligenceService {
    if (!this.instance) {
      this.instance = new EngineIntelligenceService();
    }
    return this.instance;
  }

  transformEngineOutput(engineId: string, engineName: string, output: EngineOutput): EngineIntelligence {
    const narrative = this.generateNarrative(engineId, output);
    const contextualData = this.generateContextualData(engineId, output);
    
    const intelligence: EngineIntelligence = {
      engineId,
      engineName,
      status: this.determineEngineStatus(output),
      narrative,
      contextualData,
      lastUpdated: new Date()
    };

    this.engineIntelligence.set(engineId, intelligence);
    return intelligence;
  }

  private generateNarrative(engineId: string, output: EngineOutput): MarketNarrative {
    const narrativeGenerators = {
      'enhanced-momentum': this.generateMomentumNarrative,
      'volatility-regime': this.generateVolatilityNarrative,
      'net-liquidity': this.generateLiquidityNarrative,
      'credit-stress': this.generateCreditNarrative,
    };

    const generator = narrativeGenerators[engineId] || this.generateGenericNarrative;
    return generator.call(this, output);
  }

  private generateMomentumNarrative(output: EngineOutput): MarketNarrative {
    const value = output.primaryMetric.value;
    const signal = output.signal;
    
    const headline = this.getMomentumHeadline(value, signal);
    const insights = this.getMomentumInsights(value, signal, output.subMetrics);
    const actionableItems = this.getMomentumActions(signal, output.confidence);

    return {
      headline,
      summary: `Market momentum is ${signal.toLowerCase()} with a composite score of ${value.toFixed(2)}. This indicates ${Math.abs(value) > 1 ? 'strong' : 'moderate'} directional bias.`,
      keyInsights: insights,
      implications: this.getMomentumImplications(signal, value),
      actionableItems,
      riskFactors: this.getMomentumRiskFactors(signal, value),
      confidence: output.confidence,
      timeframe: 'short-term'
    };
  }

  private generateVolatilityNarrative(output: EngineOutput): MarketNarrative {
    const regime = output.subMetrics.regime || 'NORMAL';
    const vix = output.primaryMetric.value;
    
    return {
      headline: `Volatility regime: ${regime.toLowerCase()} (VIX: ${vix.toFixed(1)})`,
      summary: `Markets are operating in a ${regime.toLowerCase()} volatility environment. ${this.getVolatilityContext(regime, vix)}`,
      keyInsights: this.getVolatilityInsights(regime, vix, output.subMetrics),
      implications: this.getVolatilityImplications(regime, output.signal),
      actionableItems: this.getVolatilityActions(regime, output.signal),
      riskFactors: this.getVolatilityRiskFactors(regime, vix),
      confidence: output.confidence,
      timeframe: 'immediate'
    };
  }

  private generateLiquidityNarrative(output: EngineOutput): MarketNarrative {
    const liquidityScore = output.primaryMetric.value;
    const trend = output.primaryMetric.changePercent > 0 ? 'improving' : 'deteriorating';
    
    return {
      headline: `Global liquidity ${trend} (Score: ${liquidityScore.toFixed(1)})`,
      summary: `Net liquidity conditions are ${this.getLiquidityDescription(liquidityScore)} with ${trend} trend dynamics.`,
      keyInsights: this.getLiquidityInsights(liquidityScore, output.subMetrics),
      implications: this.getLiquidityImplications(liquidityScore, output.signal),
      actionableItems: this.getLiquidityActions(liquidityScore, output.signal),
      riskFactors: this.getLiquidityRiskFactors(liquidityScore),
      confidence: output.confidence,
      timeframe: 'medium-term'
    };
  }

  private generateGenericNarrative(output: EngineOutput): MarketNarrative {
    const value = output.primaryMetric.value;
    const signal = output.signal;
    
    return {
      headline: `${signal.toLowerCase()} signal detected`,
      summary: output.analysis || `Current reading: ${value.toFixed(2)}`,
      keyInsights: [
        `Primary metric: ${value.toFixed(2)}`,
        `24h change: ${output.primaryMetric.changePercent.toFixed(1)}%`,
        `Signal: ${signal}`
      ],
      implications: this.getGenericImplications(signal),
      actionableItems: this.getGenericActions(signal, output.confidence),
      riskFactors: this.getGenericRiskFactors(signal),
      confidence: output.confidence,
      timeframe: 'short-term'
    };
  }

  private generateContextualData(engineId: string, output: EngineOutput) {
    return {
      currentReading: {
        value: output.primaryMetric.value,
        label: this.getMetricLabel(engineId),
        unit: this.getMetricUnit(engineId),
        interpretation: this.interpretValue(engineId, output.primaryMetric.value)
      },
      historicalContext: {
        percentile: this.calculatePercentile(output.primaryMetric.value),
        trend: this.determineTrend(output.primaryMetric.changePercent),
        volatility: this.assessVolatility(output.confidence),
        comparison: this.getHistoricalComparison(engineId, output.primaryMetric.value)
      },
      marketImplications: {
        riskAssets: this.getRiskAssetImplication(output.signal),
        liquidityConditions: this.getLiquidityImplication(output.signal),
        regimeShift: this.assessRegimeShift(output.confidence, output.signal),
        probability: output.confidence / 100
      }
    };
  }

  private determineEngineStatus(output: EngineOutput): 'healthy' | 'warning' | 'critical' | 'offline' {
    if (output.confidence < 30) return 'offline';
    if (output.signal === 'RISK_OFF' && output.confidence > 80) return 'critical';
    if (output.signal === 'WARNING') return 'warning';
    return 'healthy';
  }

  // Helper methods for narrative generation
  private getMomentumHeadline(value: number, signal: string): string {
    const strength = Math.abs(value);
    const direction = value > 0 ? 'bullish' : 'bearish';
    const intensity = strength > 2 ? 'strong' : strength > 1 ? 'moderate' : 'weak';
    
    return `${intensity.charAt(0).toUpperCase() + intensity.slice(1)} ${direction} momentum detected`;
  }

  private getMomentumInsights(value: number, signal: string, subMetrics: any): string[] {
    const insights = [
      `Composite momentum score: ${value.toFixed(2)} (${signal.toLowerCase()})`,
      `Multi-timeframe analysis confirms ${value > 0 ? 'upward' : 'downward'} pressure`
    ];

    if (subMetrics.acceleration) {
      insights.push(`Momentum acceleration: ${subMetrics.acceleration > 0 ? 'increasing' : 'decreasing'}`);
    }

    return insights;
  }

  private getMomentumActions(signal: string, confidence: number): ActionableItem[] {
    const actions: ActionableItem[] = [];

    if (signal === 'RISK_ON' && confidence > 70) {
      actions.push({
        type: 'position',
        description: 'Consider increasing risk asset exposure',
        priority: 'medium',
        timeframe: '1-2 weeks',
        rationale: 'Strong momentum signals support continued upward movement'
      });
    } else if (signal === 'RISK_OFF' && confidence > 70) {
      actions.push({
        type: 'hedge',
        description: 'Implement defensive positioning',
        priority: 'high',
        timeframe: 'immediate',
        rationale: 'Momentum deterioration suggests potential downside'
      });
    }

    return actions;
  }

  private getMomentumImplications(signal: string, value: number): string[] {
    const implications = [];
    
    if (signal === 'RISK_ON') {
      implications.push('Positive momentum supports risk asset performance');
      implications.push('Continued central bank liquidity likely supportive');
    } else if (signal === 'RISK_OFF') {
      implications.push('Weakening momentum may pressure risk assets');
      implications.push('Defensive assets may outperform');
    }

    return implications;
  }

  private getMomentumRiskFactors(signal: string, value: number): string[] {
    const risks = [];
    
    if (Math.abs(value) > 2) {
      risks.push('Extreme momentum readings often precede reversals');
    }
    
    if (signal === 'RISK_ON') {
      risks.push('Potential for profit-taking at resistance levels');
    } else {
      risks.push('Risk of momentum-driven selling cascade');
    }

    return risks;
  }

  private getVolatilityContext(regime: string, vix: number): string {
    const contexts = {
      'CRISIS': 'Extreme stress conditions require defensive positioning',
      'STRESSED': 'Elevated volatility suggests caution and hedging',
      'ELEVATED': 'Above-normal volatility warrants close monitoring',
      'NORMAL': 'Stable conditions support normal market operations',
      'LOW_VOL': 'Compressed volatility may indicate building pressures'
    };
    
    return contexts[regime] || `Current VIX level of ${vix.toFixed(1)} indicates ${regime.toLowerCase()} conditions`;
  }

  private getVolatilityInsights(regime: string, vix: number, subMetrics: any): string[] {
    const insights = [
      `Current regime: ${regime} (VIX: ${vix.toFixed(1)})`,
      `Term structure: ${subMetrics.termStructure > 0 ? 'contango' : 'backwardation'}`
    ];

    if (subMetrics.volOfVol) {
      insights.push(`Vol-of-vol elevated, suggesting uncertainty`);
    }

    return insights;
  }

  private getVolatilityActions(regime: string, signal: string): ActionableItem[] {
    const actions: ActionableItem[] = [];

    if (regime === 'CRISIS' || regime === 'STRESSED') {
      actions.push({
        type: 'hedge',
        description: 'Increase portfolio hedging immediately',
        priority: 'critical',
        timeframe: 'immediate',
        rationale: 'Elevated volatility regime requires defensive measures'
      });
    }

    return actions;
  }

  // Additional helper methods...
  private getMetricLabel(engineId: string): string {
    const labels = {
      'enhanced-momentum': 'Momentum Score',
      'volatility-regime': 'VIX Level',
      'net-liquidity': 'Liquidity Score',
      'credit-stress': 'Credit Spread',
      'z-score': 'Z-Score'
    };
    return labels[engineId] || 'Value';
  }

  private getMetricUnit(engineId: string): string | undefined {
    const units = {
      'volatility-regime': '%',
      'credit-stress': 'bps',
      'net-liquidity': 'score'
    };
    return units[engineId];
  }

  private interpretValue(engineId: string, value: number): string {
    // Simplified interpretation logic
    if (value > 1) return 'Above normal';
    if (value < -1) return 'Below normal';
    return 'Within normal range';
  }

  private calculatePercentile(value: number): number {
    // Simplified percentile calculation
    return Math.min(95, Math.max(5, 50 + (value * 20)));
  }

  private determineTrend(changePercent: number): 'rising' | 'falling' | 'stable' {
    if (changePercent > 1) return 'rising';
    if (changePercent < -1) return 'falling';
    return 'stable';
  }

  private assessVolatility(confidence: number): 'low' | 'normal' | 'elevated' | 'extreme' {
    if (confidence > 80) return 'low';
    if (confidence > 60) return 'normal';
    if (confidence > 40) return 'elevated';
    return 'extreme';
  }

  private getHistoricalComparison(engineId: string, value: number): string {
    // Simplified comparison
    const absValue = Math.abs(value);
    if (absValue > 2) return 'Extreme reading vs. history';
    if (absValue > 1) return 'Elevated vs. recent averages';
    return 'Normal vs. historical range';
  }

  private getRiskAssetImplication(signal: string): 'bullish' | 'bearish' | 'neutral' {
    return signal === 'RISK_ON' ? 'bullish' : signal === 'RISK_OFF' ? 'bearish' : 'neutral';
  }

  private getLiquidityImplication(signal: string): 'ample' | 'tightening' | 'stressed' {
    return signal === 'RISK_ON' ? 'ample' : signal === 'RISK_OFF' ? 'stressed' : 'tightening';
  }

  private assessRegimeShift(confidence: number, signal: string): boolean {
    return confidence > 75 && (signal === 'RISK_OFF' || signal === 'RISK_ON');
  }

  // Generic helper methods
  private getGenericImplications(signal: string): string[] {
    const implications = {
      'RISK_ON': ['Supportive environment for risk assets', 'Growth conditions favorable'],
      'RISK_OFF': ['Defensive positioning warranted', 'Risk asset headwinds likely'],
      'WARNING': ['Mixed signals require careful monitoring', 'Potential inflection point'],
      'NEUTRAL': ['Balanced conditions', 'No clear directional bias']
    };
    return implications[signal] || ['Monitor for developments'];
  }

  private getGenericActions(signal: string, confidence: number): ActionableItem[] {
    if (confidence < 50) return [];

    const baseAction = {
      type: 'monitor' as const,
      priority: 'medium' as const,
      timeframe: '1-2 days',
      rationale: `${signal} signal with ${confidence}% confidence`
    };

    if (signal === 'RISK_OFF') {
      return [{
        ...baseAction,
        type: 'alert',
        description: 'Review risk exposures',
        priority: 'high'
      }];
    }

    return [{
      ...baseAction,
      description: `Monitor for ${signal.toLowerCase()} confirmation`
    }];
  }

  private getGenericRiskFactors(signal: string): string[] {
    const factors = {
      'RISK_ON': ['Potential for reversal at extremes'],
      'RISK_OFF': ['Momentum may accelerate downside'],
      'WARNING': ['Signal uncertainty increases volatility'],
      'NEUTRAL': ['Lack of direction may persist']
    };
    return factors[signal] || ['Monitor for changes'];
  }

  // Continued narrative generators for other engines...
  private getVolatilityImplications(regime: string, signal: string): string[] {
    const implications = [];
    
    if (regime === 'CRISIS' || regime === 'STRESSED') {
      implications.push('Flight-to-quality flows likely to intensify');
      implications.push('Credit spreads may widen further');
    } else if (regime === 'LOW_VOL') {
      implications.push('Compressed volatility may be building pressure');
      implications.push('Risk-parity strategies likely adding leverage');
    }
    
    return implications;
  }

  private getVolatilityRiskFactors(regime: string, vix: number): string[] {
    const risks = [];
    
    if (regime === 'LOW_VOL' && vix < 15) {
      risks.push('Extreme complacency may precede volatility spike');
    }
    
    if (regime === 'CRISIS') {
      risks.push('Forced selling and deleveraging risks');
    }
    
    return risks;
  }

  private getLiquidityDescription(score: number): string {
    if (score > 75) return 'abundant';
    if (score > 50) return 'adequate';
    if (score > 25) return 'tightening';
    return 'stressed';
  }

  private getLiquidityInsights(score: number, subMetrics: any): string[] {
    const insights = [
      `Net liquidity score: ${score.toFixed(1)}/100`,
      `Federal Reserve balance sheet: ${subMetrics.fedAssets ? '$' + (subMetrics.fedAssets/1000).toFixed(1) + 'T' : 'monitoring'}`
    ];

    if (subMetrics.treasuryAccount) {
      insights.push(`Treasury General Account: $${(subMetrics.treasuryAccount/1000).toFixed(1)}T`);
    }

    return insights;
  }

  private getLiquidityImplications(score: number, signal: string): string[] {
    const implications = [];
    
    if (score > 70) {
      implications.push('Ample liquidity supports risk asset valuations');
      implications.push('Low volatility environment likely to persist');
    } else if (score < 30) {
      implications.push('Liquidity stress may pressure all risk assets');
      implications.push('Correlations likely to increase during stress');
    }
    
    return implications;
  }

  private getLiquidityActions(score: number, signal: string): ActionableItem[] {
    const actions: ActionableItem[] = [];

    if (score < 30 && signal === 'RISK_OFF') {
      actions.push({
        type: 'alert',
        description: 'Liquidity stress detected - reduce risk exposures',
        priority: 'critical',
        timeframe: 'immediate',
        rationale: 'Deteriorating liquidity conditions threaten all risk assets'
      });
    } else if (score > 70 && signal === 'RISK_ON') {
      actions.push({
        type: 'position',
        description: 'Abundant liquidity supports risk-on positioning',
        priority: 'medium',
        timeframe: '1-2 weeks',
        rationale: 'Strong liquidity backdrop supports continued asset appreciation'
      });
    }

    return actions;
  }

  private getLiquidityRiskFactors(score: number): string[] {
    const risks = [];
    
    if (score < 30) {
      risks.push('Liquidity crunch may trigger forced selling');
      risks.push('Central bank intervention may be required');
    } else if (score > 90) {
      risks.push('Excessive liquidity may create asset bubbles');
      risks.push('Policy normalization risks ahead');
    }
    
    return risks;
  }

  // Additional narrative generators for other engines would go here...
  private generateCreditNarrative(output: EngineOutput): MarketNarrative {
    const spread = output.primaryMetric.value;
    const trend = output.primaryMetric.changePercent > 0 ? 'widening' : 'tightening';
    
    return {
      headline: `Credit spreads ${trend} (${spread.toFixed(0)} bps)`,
      summary: `Corporate credit conditions are ${this.getCreditCondition(spread)} with spreads ${trend}.`,
      keyInsights: [
        `Investment grade spreads: ${spread.toFixed(0)} basis points`,
        `Trend: ${trend} (${output.primaryMetric.changePercent.toFixed(1)}% change)`,
        `Credit quality: ${this.getCreditQuality(spread)}`
      ],
      implications: this.getCreditImplications(spread, output.signal),
      actionableItems: this.getCreditActions(spread, output.signal),
      riskFactors: this.getCreditRiskFactors(spread),
      confidence: output.confidence,
      timeframe: 'medium-term'
    };
  }

  private getCreditCondition(spread: number): string {
    if (spread < 100) return 'exceptionally tight';
    if (spread < 200) return 'tight';
    if (spread < 400) return 'normal';
    if (spread < 600) return 'stressed';
    return 'severely stressed';
  }

  private getCreditQuality(spread: number): string {
    if (spread < 150) return 'excellent';
    if (spread < 300) return 'good';
    if (spread < 500) return 'deteriorating';
    return 'poor';
  }

  private getCreditImplications(spread: number, signal: string): string[] {
    const implications = [];
    
    if (spread > 400) {
      implications.push('Credit stress may spill over to equity markets');
      implications.push('Corporate funding costs rising significantly');
    } else if (spread < 150) {
      implications.push('Tight credit spreads support corporate investment');
      implications.push('Risk-on environment favors credit assets');
    }
    
    return implications;
  }

  private getCreditActions(spread: number, signal: string): ActionableItem[] {
    const actions: ActionableItem[] = [];

    if (spread > 500 && signal === 'RISK_OFF') {
      actions.push({
        type: 'hedge',
        description: 'Hedge credit exposure immediately',
        priority: 'critical',
        timeframe: 'immediate',
        rationale: 'Severe credit stress threatens broader market stability'
      });
    }

    return actions;
  }

  private getCreditRiskFactors(spread: number): string[] {
    const risks = [];
    
    if (spread > 400) {
      risks.push('Credit event contagion risk');
      risks.push('Corporate refinancing stress');
    } else if (spread < 100) {
      risks.push('Excessive risk-taking in credit markets');
      risks.push('Potential for sharp spread widening');
    }
    
    return risks;
  }

  getMarketIntelligenceSnapshot(): MarketIntelligenceSnapshot {
    const engines = Array.from(this.engineIntelligence.values());
    
    const criticalEngines = engines.filter(e => e.status === 'critical');
    const riskOffSignals = engines.filter(e => e.narrative.actionableItems.some(a => a.priority === 'critical'));
    
    const globalTheme = this.determineGlobalTheme(engines);
    const riskLevel = this.assessGlobalRisk(engines);
    
    return {
      globalTheme,
      dominantNarrative: this.getDominantNarrative(engines),
      riskLevel,
      liquidityConditions: this.assessGlobalLiquidity(engines),
      regimeStatus: this.assessRegimeStatus(engines),
      topInsights: this.getTopInsights(engines),
      criticalAlerts: this.getCriticalAlerts(engines),
      engineIntelligence: engines
    };
  }

  private determineGlobalTheme(engines: EngineIntelligence[]): string {
    const riskOnCount = engines.filter(e => e.contextualData.marketImplications.riskAssets === 'bullish').length;
    const riskOffCount = engines.filter(e => e.contextualData.marketImplications.riskAssets === 'bearish').length;
    
    if (riskOffCount > riskOnCount * 1.5) return 'Risk-Off Dominance';
    if (riskOnCount > riskOffCount * 1.5) return 'Risk-On Momentum';
    return 'Mixed Signals';
  }

  private getDominantNarrative(engines: EngineIntelligence[]): string {
    // Find the engine with highest confidence and critical status
    const sortedByConfidence = engines
      .filter(e => e.status === 'critical' || e.status === 'warning')
      .sort((a, b) => b.narrative.confidence - a.narrative.confidence);
    
    return sortedByConfidence[0]?.narrative.headline || 'Markets in transition';
  }

  private assessGlobalRisk(engines: EngineIntelligence[]): 'low' | 'medium' | 'high' | 'extreme' {
    const criticalCount = engines.filter(e => e.status === 'critical').length;
    const warningCount = engines.filter(e => e.status === 'warning').length;
    
    if (criticalCount > 2) return 'extreme';
    if (criticalCount > 0 || warningCount > 3) return 'high';
    if (warningCount > 1) return 'medium';
    return 'low';
  }

  private assessGlobalLiquidity(engines: EngineIntelligence[]): 'abundant' | 'adequate' | 'tightening' | 'stressed' {
    const liquidityEngines = engines.filter(e => 
      e.engineId.includes('liquidity') || e.engineId.includes('credit') || e.engineId.includes('funding')
    );
    
    const stressedCount = liquidityEngines.filter(e => 
      e.contextualData.marketImplications.liquidityConditions === 'stressed'
    ).length;
    
    if (stressedCount > liquidityEngines.length / 2) return 'stressed';
    if (stressedCount > 0) return 'tightening';
    
    const abundantCount = liquidityEngines.filter(e => 
      e.contextualData.marketImplications.liquidityConditions === 'ample'
    ).length;
    
    return abundantCount > liquidityEngines.length / 2 ? 'abundant' : 'adequate';
  }

  private assessRegimeStatus(engines: EngineIntelligence[]) {
    const regimeShifts = engines.filter(e => e.contextualData.marketImplications.regimeShift).length;
    const avgConfidence = engines.reduce((sum, e) => sum + e.narrative.confidence, 0) / engines.length;
    
    return {
      current: regimeShifts > engines.length / 3 ? 'Transitional' : 'Stable',
      confidence: avgConfidence,
      nextLikely: regimeShifts > 0 ? 'Volatility Regime' : 'Continuation',
      timeframe: '2-4 weeks'
    };
  }

  private getTopInsights(engines: EngineIntelligence[]): string[] {
    return engines
      .flatMap(e => e.narrative.keyInsights)
      .filter((insight, index, array) => array.indexOf(insight) === index)
      .slice(0, 5);
  }

  private getCriticalAlerts(engines: EngineIntelligence[]): ActionableItem[] {
    return engines
      .flatMap(e => e.narrative.actionableItems)
      .filter(a => a.priority === 'critical' || a.priority === 'high')
      .slice(0, 3);
  }
}