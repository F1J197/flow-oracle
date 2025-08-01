import { BaseEngine, EngineConfig, EngineOutput } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'onchain-analytics',
  name: 'Bitcoin On-Chain Analytics Suite',
  pillar: 4,
  priority: 82,
  updateInterval: 900000, // 15 minutes
  requiredIndicators: ['BTC_MVRV', 'BTC_PUELL', 'BTC_ASOPR', 'BTC_RHODL', 'BTC_PRICE']
};

export interface OnChainMetrics {
  mvrvZScore: number;
  puellMultiple: number;
  asopr: number;
  rhodlRatio: number;
  realizerCapTrend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  cohortAnalysis: CohortAnalysis;
}

export interface CohortAnalysis {
  shortTermHolders: number; // % of supply
  longTermHolders: number; // % of supply
  whaleActivity: 'ACCUMULATING' | 'DISTRIBUTING' | 'NEUTRAL';
  exchangeFlows: 'INFLOW' | 'OUTFLOW' | 'NEUTRAL';
  hodlWaves: HodlWave[];
}

export interface HodlWave {
  ageRange: string;
  supplyPercentage: number;
  trend: 'INCREASING' | 'DECREASING' | 'STABLE';
}

export class OnChainAnalyticsEngine extends BaseEngine {
  private readonly MVRV_THRESHOLDS = {
    EXTREME_GREED: 3.0,
    GREED: 2.0,
    NEUTRAL_HIGH: 1.0,
    NEUTRAL_LOW: -0.5,
    FEAR: -1.0,
    EXTREME_FEAR: -1.5
  };

  private readonly PUELL_THRESHOLDS = {
    TOP_SIGNAL: 4.0,
    CAUTION: 2.5,
    NEUTRAL: 1.0,
    ACCUMULATION: 0.5,
    EXTREME_OPPORTUNITY: 0.3
  };

  private readonly ASOPR_THRESHOLDS = {
    PROFIT_TAKING: 1.05,
    NEUTRAL_HIGH: 1.02,
    NEUTRAL_LOW: 0.98,
    CAPITULATION: 0.95
  };

  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    // Extract on-chain indicators
    const mvrvData = this.extractLatestValue(data.get('BTC_MVRV'));
    const puellData = this.extractLatestValue(data.get('BTC_PUELL'));
    const asoprData = this.extractLatestValue(data.get('BTC_ASOPR'));
    const rhodlData = this.extractLatestValue(data.get('BTC_RHODL'));
    const btcPrice = this.extractLatestValue(data.get('BTC_PRICE')) || 50000;

    // Calculate on-chain metrics
    const onChainMetrics = this.calculateOnChainMetrics(mvrvData, puellData, asoprData, rhodlData);
    const cohortAnalysis = this.performCohortAnalysis();
    const sentiment = this.determineOnChainSentiment(onChainMetrics);
    const confidence = this.calculateOnChainConfidence(onChainMetrics);
    
    // Generate composite score
    const compositeScore = this.calculateCompositeScore(onChainMetrics);
    const signal = this.determineSignal(compositeScore, sentiment);

    return {
      primaryMetric: {
        value: compositeScore,
        change24h: 2.3, // Would calculate from historical
        changePercent: 4.7
      },
      signal,
      confidence,
      analysis: this.generateOnChainAnalysis(onChainMetrics, sentiment, cohortAnalysis),
      subMetrics: {
        ...onChainMetrics,
        cohortAnalysis,
        sentiment,
        compositeScore,
        mvrvZScoreRegime: this.getMVRVRegime(onChainMetrics.mvrvZScore),
        puellRegime: this.getPuellRegime(onChainMetrics.puellMultiple),
        asoprRegime: this.getASOPRRegime(onChainMetrics.asopr),
        cyclePosition: this.estimateCyclePosition(onChainMetrics),
        networkHealth: this.assessNetworkHealth(onChainMetrics)
      }
    };
  }

  private calculateOnChainMetrics(mvrv: number, puell: number, asopr: number, rhodl: number): OnChainMetrics {
    // Calculate MVRV Z-Score (simplified - would use full calculation in production)
    const mvrvZScore = mvrv ? (mvrv - 1) / 0.5 : 0; // Normalized MVRV
    
    // Use provided values or defaults
    const puellMultiple = puell || 1.2;
    const asoprValue = asopr || 1.01;
    const rhodlRatio = rhodl || 0.15;

    // Determine realizer cap trend
    const realizerCapTrend = this.determineRealizerCapTrend(mvrvZScore, asoprValue);
    
    // Perform cohort analysis
    const cohortAnalysis = this.performCohortAnalysis();

    return {
      mvrvZScore,
      puellMultiple,
      asopr: asoprValue,
      rhodlRatio,
      realizerCapTrend,
      cohortAnalysis
    };
  }

  private determineRealizerCapTrend(mvrvZScore: number, asopr: number): OnChainMetrics['realizerCapTrend'] {
    if (mvrvZScore > 1 && asopr > 1.02) return 'BULLISH';
    if (mvrvZScore < -0.5 && asopr < 0.98) return 'BEARISH';
    return 'NEUTRAL';
  }

  private performCohortAnalysis(): CohortAnalysis {
    // Mock cohort analysis - would use real blockchain data
    const shortTermHolders = 20 + Math.random() * 10; // 20-30%
    const longTermHolders = 100 - shortTermHolders;
    
    const whaleActivity = this.determineWhaleActivity();
    const exchangeFlows = this.determineExchangeFlows();
    const hodlWaves = this.generateHodlWaves();

    return {
      shortTermHolders,
      longTermHolders,
      whaleActivity,
      exchangeFlows,
      hodlWaves
    };
  }

  private determineWhaleActivity(): CohortAnalysis['whaleActivity'] {
    // Mock whale activity determination
    const random = Math.random();
    if (random > 0.6) return 'ACCUMULATING';
    if (random < 0.4) return 'DISTRIBUTING';
    return 'NEUTRAL';
  }

  private determineExchangeFlows(): CohortAnalysis['exchangeFlows'] {
    // Mock exchange flow analysis
    const random = Math.random();
    if (random > 0.55) return 'OUTFLOW';
    if (random < 0.45) return 'INFLOW';
    return 'NEUTRAL';
  }

  private generateHodlWaves(): HodlWave[] {
    return [
      {
        ageRange: '< 1 month',
        supplyPercentage: 15.2,
        trend: 'INCREASING'
      },
      {
        ageRange: '1-3 months',
        supplyPercentage: 8.7,
        trend: 'STABLE'
      },
      {
        ageRange: '3-6 months',
        supplyPercentage: 12.1,
        trend: 'DECREASING'
      },
      {
        ageRange: '6-12 months',
        supplyPercentage: 18.4,
        trend: 'INCREASING'
      },
      {
        ageRange: '1-2 years',
        supplyPercentage: 22.8,
        trend: 'STABLE'
      },
      {
        ageRange: '2-5 years',
        supplyPercentage: 15.3,
        trend: 'INCREASING'
      },
      {
        ageRange: '> 5 years',
        supplyPercentage: 7.5,
        trend: 'STABLE'
      }
    ];
  }

  private determineOnChainSentiment(metrics: OnChainMetrics): string {
    let score = 0;
    
    // MVRV Z-Score contribution
    if (metrics.mvrvZScore > this.MVRV_THRESHOLDS.EXTREME_GREED) score -= 3;
    else if (metrics.mvrvZScore > this.MVRV_THRESHOLDS.GREED) score -= 2;
    else if (metrics.mvrvZScore > this.MVRV_THRESHOLDS.NEUTRAL_HIGH) score -= 1;
    else if (metrics.mvrvZScore < this.MVRV_THRESHOLDS.EXTREME_FEAR) score += 3;
    else if (metrics.mvrvZScore < this.MVRV_THRESHOLDS.FEAR) score += 2;
    else if (metrics.mvrvZScore < this.MVRV_THRESHOLDS.NEUTRAL_LOW) score += 1;

    // Puell Multiple contribution
    if (metrics.puellMultiple > this.PUELL_THRESHOLDS.TOP_SIGNAL) score -= 2;
    else if (metrics.puellMultiple < this.PUELL_THRESHOLDS.EXTREME_OPPORTUNITY) score += 3;
    else if (metrics.puellMultiple < this.PUELL_THRESHOLDS.ACCUMULATION) score += 2;

    // aSOPR contribution
    if (metrics.asopr > this.ASOPR_THRESHOLDS.PROFIT_TAKING) score -= 1;
    else if (metrics.asopr < this.ASOPR_THRESHOLDS.CAPITULATION) score += 2;

    // Classify sentiment
    if (score >= 4) return 'EXTREME_ACCUMULATION';
    if (score >= 2) return 'ACCUMULATION';
    if (score >= 0) return 'NEUTRAL';
    if (score >= -2) return 'DISTRIBUTION';
    return 'EXTREME_DISTRIBUTION';
  }

  private calculateCompositeScore(metrics: OnChainMetrics): number {
    // Weighted composite of all metrics (0-100 scale)
    let score = 50; // Neutral baseline
    
    // MVRV Z-Score (weight: 30%)
    const mvrvContrib = this.normalizeToContribution(metrics.mvrvZScore, -2, 3, 30);
    
    // Puell Multiple (weight: 25%)
    const puellContrib = this.normalizeToContribution(metrics.puellMultiple, 0.2, 5, 25);
    
    // aSOPR (weight: 20%)
    const asoprContrib = this.normalizeToContribution(metrics.asopr, 0.9, 1.1, 20);
    
    // RHODL Ratio (weight: 15%)
    const rhodlContrib = this.normalizeToContribution(metrics.rhodlRatio, 0.05, 0.5, 15);
    
    // Cohort factors (weight: 10%)
    const cohortContrib = metrics.cohortAnalysis.longTermHolders > 70 ? 10 : 
                         metrics.cohortAnalysis.longTermHolders < 60 ? -10 : 0;
    
    score += mvrvContrib + puellContrib + asoprContrib + rhodlContrib + cohortContrib;
    
    return Math.max(0, Math.min(100, score));
  }

  private normalizeToContribution(value: number, min: number, max: number, weight: number): number {
    const normalized = (value - min) / (max - min);
    const centered = (normalized - 0.5) * 2; // -1 to 1
    return centered * weight;
  }

  private calculateOnChainConfidence(metrics: OnChainMetrics): number {
    let confidence = 70;
    
    // Higher confidence when multiple indicators align
    const indicators = [
      this.getMVRVRegime(metrics.mvrvZScore),
      this.getPuellRegime(metrics.puellMultiple),
      this.getASOPRRegime(metrics.asopr)
    ];
    
    const uniqueRegimes = new Set(indicators).size;
    if (uniqueRegimes === 1) confidence += 20; // All aligned
    else if (uniqueRegimes === 2) confidence += 10; // Mostly aligned
    
    // Boost confidence for extreme readings
    if (metrics.mvrvZScore > 2 || metrics.mvrvZScore < -1) confidence += 10;
    
    return Math.min(100, confidence);
  }

  private getMVRVRegime(mvrvZScore: number): string {
    if (mvrvZScore > this.MVRV_THRESHOLDS.EXTREME_GREED) return 'EXTREME_GREED';
    if (mvrvZScore > this.MVRV_THRESHOLDS.GREED) return 'GREED';
    if (mvrvZScore > this.MVRV_THRESHOLDS.NEUTRAL_HIGH) return 'NEUTRAL_BULLISH';
    if (mvrvZScore > this.MVRV_THRESHOLDS.NEUTRAL_LOW) return 'NEUTRAL';
    if (mvrvZScore > this.MVRV_THRESHOLDS.FEAR) return 'FEAR';
    return 'EXTREME_FEAR';
  }

  private getPuellRegime(puell: number): string {
    if (puell > this.PUELL_THRESHOLDS.TOP_SIGNAL) return 'TOP_SIGNAL';
    if (puell > this.PUELL_THRESHOLDS.CAUTION) return 'CAUTION';
    if (puell > this.PUELL_THRESHOLDS.NEUTRAL) return 'NEUTRAL_HIGH';
    if (puell > this.PUELL_THRESHOLDS.ACCUMULATION) return 'NEUTRAL_LOW';
    return 'EXTREME_OPPORTUNITY';
  }

  private getASOPRRegime(asopr: number): string {
    if (asopr > this.ASOPR_THRESHOLDS.PROFIT_TAKING) return 'PROFIT_TAKING';
    if (asopr > this.ASOPR_THRESHOLDS.NEUTRAL_HIGH) return 'NEUTRAL_HIGH';
    if (asopr > this.ASOPR_THRESHOLDS.NEUTRAL_LOW) return 'NEUTRAL';
    return 'CAPITULATION';
  }

  private estimateCyclePosition(metrics: OnChainMetrics): string {
    // Estimate position in 4-year halving cycle
    const mvrvScore = metrics.mvrvZScore;
    const puellScore = metrics.puellMultiple;
    
    if (mvrvScore > 2 && puellScore > 3) return 'CYCLE_TOP';
    if (mvrvScore > 1 && puellScore > 2) return 'LATE_BULL';
    if (mvrvScore > 0 && puellScore > 1) return 'MID_BULL';
    if (mvrvScore < -1 && puellScore < 0.5) return 'CYCLE_BOTTOM';
    if (mvrvScore < 0 && puellScore < 1) return 'EARLY_BULL';
    return 'ACCUMULATION';
  }

  private assessNetworkHealth(metrics: OnChainMetrics): string {
    let healthScore = 0;
    
    // Long-term holder dominance is healthy
    if (metrics.cohortAnalysis.longTermHolders > 70) healthScore += 2;
    else if (metrics.cohortAnalysis.longTermHolders < 60) healthScore -= 1;
    
    // Whale accumulation is healthy
    if (metrics.cohortAnalysis.whaleActivity === 'ACCUMULATING') healthScore += 1;
    else if (metrics.cohortAnalysis.whaleActivity === 'DISTRIBUTING') healthScore -= 1;
    
    // Exchange outflows are healthy
    if (metrics.cohortAnalysis.exchangeFlows === 'OUTFLOW') healthScore += 1;
    else if (metrics.cohortAnalysis.exchangeFlows === 'INFLOW') healthScore -= 1;
    
    if (healthScore >= 3) return 'EXCELLENT';
    if (healthScore >= 1) return 'GOOD';
    if (healthScore >= -1) return 'NEUTRAL';
    return 'POOR';
  }

  private determineSignal(compositeScore: number, sentiment: string): EngineOutput['signal'] {
    if (sentiment === 'EXTREME_ACCUMULATION' && compositeScore > 70) return 'RISK_ON';
    if (sentiment === 'EXTREME_DISTRIBUTION' && compositeScore < 30) return 'RISK_OFF';
    if (sentiment.includes('ACCUMULATION')) return 'NEUTRAL';
    if (sentiment.includes('DISTRIBUTION')) return 'WARNING';
    return 'NEUTRAL';
  }

  private generateOnChainAnalysis(metrics: OnChainMetrics, sentiment: string, cohort: CohortAnalysis): string {
    let analysis = `On-chain sentiment: ${sentiment.replace('_', ' ')}. `;
    
    analysis += `MVRV Z-Score at ${metrics.mvrvZScore.toFixed(2)} indicates ${this.getMVRVRegime(metrics.mvrvZScore)}. `;
    
    analysis += `Puell Multiple: ${metrics.puellMultiple.toFixed(2)} (${this.getPuellRegime(metrics.puellMultiple)}). `;
    
    analysis += `Long-term holders control ${cohort.longTermHolders.toFixed(1)}% of supply. `;
    
    analysis += `Whales are ${cohort.whaleActivity.toLowerCase()} while exchanges see ${cohort.exchangeFlows.toLowerCase()}.`;
    
    return analysis;
  }

  validateData(data: Map<string, any>): boolean {
    return data.has('BTC_PRICE'); // Minimum requirement
  }
}