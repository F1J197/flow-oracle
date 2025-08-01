/**
 * Credit Stress Engine - Corporate Bond Stress Detection
 * Tracks credit spreads with -0.8 correlation to risk assets
 */

import { BaseEngine, EngineConfig, EngineOutput } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'credit-stress',
  name: 'Credit Stress Engine',
  pillar: 2,
  priority: 88,
  updateInterval: 300000, // 5 minutes
  requiredIndicators: ['BAMLH0A0HYM2', 'BAMLC0A0CM', 'DGS10', 'VIX', 'SPX']
};

interface CreditMetrics {
  highYieldSpread: number;
  investmentGradeSpread: number;
  spreadVelocity: number;
  zScore: number;
  percentileRank: number;
  stressLevel: 'MINIMAL' | 'MODERATE' | 'ELEVATED' | 'EXTREME';
  regime: 'QE_SUPPORTIVE' | 'QT_STRESS' | 'NEUTRAL' | 'CRISIS_MODE';
}

export class CreditStressEngine extends BaseEngine {
  private readonly STRESS_THRESHOLDS = {
    QE_THRESHOLD: 400,    // <400bps = QE territory
    QT_THRESHOLD: 500,    // >500bps = QT stress
    CRISIS_THRESHOLD: 800, // >800bps = crisis
    EXTREME_THRESHOLD: 1200 // >1200bps = extreme crisis
  };

  private readonly CORRELATION_COEFFICIENT = -0.8; // Historical correlation with SPX

  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    // Extract credit indicators
    const hySpread = this.extractLatestValue(data.get('BAMLH0A0HYM2')) || 450; // High Yield OAS
    const igSpread = this.extractLatestValue(data.get('BAMLC0A0CM')) || 120;   // Investment Grade
    const treasury10y = this.extractLatestValue(data.get('DGS10')) || 4.5;
    const vix = this.extractLatestValue(data.get('VIX')) || 16;
    const spx = this.extractLatestValue(data.get('SPX')) || 4500;

    // Calculate credit metrics
    const metrics = this.calculateCreditMetrics(hySpread, igSpread, treasury10y);
    
    // Determine regime and stress level
    const regime = this.determineRegime(hySpread, metrics.spreadVelocity);
    const stressLevel = this.determineStressLevel(hySpread, igSpread);
    
    // Calculate correlation with equity markets
    const equityCorrelation = this.calculateEquityCorrelation(hySpread, spx);
    
    // Determine signal based on credit conditions
    const signal = this.determineSignal(regime, stressLevel, metrics.spreadVelocity);
    
    // Calculate confidence based on indicator alignment
    const confidence = this.calculateConfidence(hySpread, vix, equityCorrelation);

    return {
      primaryMetric: {
        value: hySpread,
        change24h: metrics.spreadVelocity * 24, // Convert to daily change
        changePercent: (metrics.spreadVelocity / hySpread) * 100
      },
      signal,
      confidence,
      analysis: this.generateAnalysis(metrics, regime, stressLevel),
      subMetrics: {
        highYieldSpread: hySpread,
        investmentGradeSpread: igSpread,
        spreadVelocity: metrics.spreadVelocity,
        zScore: metrics.zScore,
        percentileRank: metrics.percentileRank,
        stressLevel,
        regime,
        
        // Technical indicators
        credit_risk_premium: hySpread - treasury10y,
        quality_spread: hySpread - igSpread,
        credit_beta: this.calculateCreditBeta(hySpread),
        
        // Market relationships
        equity_correlation: equityCorrelation,
        vix_credit_ratio: vix / (hySpread / 100),
        risk_appetite: this.calculateRiskAppetite(hySpread, vix),
        
        // Thresholds and signals
        qe_proximity: Math.max(0, this.STRESS_THRESHOLDS.QE_THRESHOLD - hySpread),
        qt_signal: hySpread > this.STRESS_THRESHOLDS.QT_THRESHOLD,
        crisis_warning: hySpread > this.STRESS_THRESHOLDS.CRISIS_THRESHOLD,
        
        // Leading indicators (2-3 month lead)
        leading_signal: this.calculateLeadingSignal(metrics.spreadVelocity, metrics.zScore),
        mean_reversion_signal: this.calculateMeanReversionSignal(hySpread)
      }
    };
  }

  private calculateCreditMetrics(hySpread: number, igSpread: number, treasury10y: number): CreditMetrics {
    // Get historical spread data for calculations
    const historical = this.getHistoricalData('hySpread') || [];
    historical.push(hySpread);
    
    // Keep last 252 data points (1 year of daily data)
    if (historical.length > 252) {
      historical.shift();
    }
    
    // Calculate spread velocity (rate of change)
    const spreadVelocity = this.calculateSpreadVelocity(historical);
    
    // Calculate Z-score
    const zScore = this.calculateZScore(hySpread, historical, 63); // 3-month window
    
    // Calculate percentile rank
    const percentileRank = this.calculatePercentileRank(hySpread, historical);
    
    // Determine stress level
    const stressLevel = this.determineStressLevel(hySpread, igSpread);
    
    return {
      highYieldSpread: hySpread,
      investmentGradeSpread: igSpread,
      spreadVelocity,
      zScore,
      percentileRank,
      stressLevel,
      regime: 'NEUTRAL' // Will be determined separately
    };
  }

  private calculateSpreadVelocity(historical: number[]): number {
    if (historical.length < 5) return 0;
    
    const recent = historical.slice(-5);
    let velocity = 0;
    
    for (let i = 1; i < recent.length; i++) {
      velocity += recent[i] - recent[i-1];
    }
    
    return velocity / (recent.length - 1); // Average daily change
  }

  private calculatePercentileRank(value: number, historical: number[]): number {
    if (historical.length < 10) return 50;
    
    const sorted = [...historical].sort((a, b) => a - b);
    const rank = sorted.findIndex(v => v >= value);
    
    return (rank / sorted.length) * 100;
  }

  private determineStressLevel(hySpread: number, igSpread: number): CreditMetrics['stressLevel'] {
    const avgSpread = (hySpread + igSpread) / 2;
    
    if (avgSpread > 600) return 'EXTREME';
    if (avgSpread > 350) return 'ELEVATED';
    if (avgSpread > 200) return 'MODERATE';
    return 'MINIMAL';
  }

  private determineRegime(hySpread: number, velocity: number): CreditMetrics['regime'] {
    // QE supportive: Low spreads with stable/improving conditions
    if (hySpread < this.STRESS_THRESHOLDS.QE_THRESHOLD && velocity <= 0) {
      return 'QE_SUPPORTIVE';
    }
    
    // QT stress: High spreads with worsening conditions
    if (hySpread > this.STRESS_THRESHOLDS.QT_THRESHOLD && velocity > 0) {
      return 'QT_STRESS';
    }
    
    // Crisis mode: Extreme spreads
    if (hySpread > this.STRESS_THRESHOLDS.CRISIS_THRESHOLD) {
      return 'CRISIS_MODE';
    }
    
    return 'NEUTRAL';
  }

  private calculateEquityCorrelation(hySpread: number, spx: number): number {
    // Simplified correlation calculation - in reality would use rolling correlation
    const historical = this.getHistoricalData('correlation') || [];
    
    // Mock correlation based on theoretical relationship
    // Higher spreads should correlate with lower equity prices
    const normalizedSpread = Math.max(0, Math.min(1, (hySpread - 200) / 800));
    const correlation = -0.6 - (normalizedSpread * 0.4); // Range: -0.6 to -1.0
    
    return Math.max(-1, Math.min(0, correlation));
  }

  private calculateCreditBeta(hySpread: number): number {
    // Credit beta measures sensitivity to market stress
    // Higher spreads = higher beta (more sensitivity)
    const baseBeta = 1.0;
    const stressMultiplier = Math.max(1, hySpread / 400); // Base at 400bps
    
    return baseBeta * stressMultiplier;
  }

  private calculateRiskAppetite(hySpread: number, vix: number): number {
    // Risk appetite index: Lower spreads + Lower VIX = Higher appetite
    const normalizedSpread = 1 - Math.max(0, Math.min(1, (hySpread - 200) / 600));
    const normalizedVix = 1 - Math.max(0, Math.min(1, (vix - 10) / 40));
    
    return (normalizedSpread * 0.6 + normalizedVix * 0.4) * 100;
  }

  private calculateLeadingSignal(velocity: number, zScore: number): string {
    // Leading indicator for 2-3 month outlook
    if (velocity > 5 && zScore > 1.5) return 'DETERIORATING';
    if (velocity < -5 && zScore < -1.5) return 'IMPROVING';
    if (Math.abs(velocity) > 10) return 'VOLATILE';
    return 'STABLE';
  }

  private calculateMeanReversionSignal(hySpread: number): string {
    // Mean reversion opportunities
    if (hySpread > 800) return 'OVERSOLD';
    if (hySpread < 300) return 'OVERBOUGHT';
    return 'NEUTRAL';
  }

  private determineSignal(regime: string, stressLevel: string, velocity: number): EngineOutput['signal'] {
    // Crisis mode = immediate risk-off
    if (regime === 'CRISIS_MODE') return 'RISK_OFF';
    
    // QT stress with worsening conditions
    if (regime === 'QT_STRESS' && velocity > 2) return 'RISK_OFF';
    
    // QE supportive conditions
    if (regime === 'QE_SUPPORTIVE') return 'RISK_ON';
    
    // Warning on deteriorating conditions
    if (stressLevel === 'ELEVATED' && velocity > 0) return 'WARNING';
    
    return 'NEUTRAL';
  }

  private calculateConfidence(hySpread: number, vix: number, correlation: number): number {
    let confidence = 70; // Base confidence
    
    // Higher confidence in extreme readings
    if (hySpread < 350 || hySpread > 600) confidence += 15;
    
    // VIX-credit alignment boosts confidence
    const vixCreditAlignment = (vix > 20 && hySpread > 500) || (vix < 15 && hySpread < 400);
    if (vixCreditAlignment) confidence += 10;
    
    // Strong correlation boosts confidence
    if (Math.abs(correlation) > 0.7) confidence += 10;
    
    return Math.min(100, confidence);
  }

  private generateAnalysis(metrics: CreditMetrics, regime: string, stressLevel: string): string {
    let analysis = `Credit stress at ${metrics.highYieldSpread}bps (${stressLevel.toLowerCase()}). `;
    
    if (regime === 'QE_SUPPORTIVE') {
      analysis += 'Supportive credit conditions favor risk-taking. ';
    } else if (regime === 'QT_STRESS') {
      analysis += 'Tightening credit creates headwinds for risk assets. ';
    } else if (regime === 'CRISIS_MODE') {
      analysis += 'Crisis-level spreads signal extreme stress. ';
    }
    
    if (metrics.spreadVelocity > 5) {
      analysis += 'Rapidly widening spreads suggest deteriorating conditions. ';
    } else if (metrics.spreadVelocity < -5) {
      analysis += 'Tightening spreads indicate improving sentiment. ';
    }
    
    analysis += `Z-score of ${metrics.zScore.toFixed(2)} suggests `;
    analysis += metrics.zScore > 1.5 ? 'elevated stress levels.' : 
                metrics.zScore < -1.5 ? 'compressed spread environment.' : 
                'normalized credit conditions.';
    
    return analysis;
  }

  private getHistoricalData(key: string): number[] | undefined {
    return this.historicalData.get(key);
  }

  validateData(data: Map<string, any>): boolean {
    const required = ['BAMLH0A0HYM2', 'BAMLC0A0CM'];
    return required.every(indicator => data.has(indicator));
  }
}
