import { BaseEngine, EngineOutput } from '../../BaseEngine';

const config = {
  id: 'zscore-foundation',
  name: 'Enhanced Z-Score Foundation',
  pillar: 1,
  priority: 95,
  updateInterval: 60000,
  requiredIndicators: ['VIX', 'SPX', 'DXY', 'TNX']
};

interface ZScoreMetrics {
  composite: number;
  individual: Map<string, number>;
  confidence: number;
  regime: string;
  outliers: string[];
}

export class ZScoreEngine extends BaseEngine {
  private readonly LOOKBACK_PERIODS = 84; // 12 weeks
  private readonly OUTLIER_THRESHOLD = 3.0;
  protected historicalData = new Map<string, number[]>();

  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    try {
      const metrics = this.calculateZScoreMetrics(data);
      const signal = this.determineSignal(metrics);
      const confidence = metrics.confidence;

      return {
        primaryMetric: {
          value: metrics.composite,
          change24h: this.calculateChange(metrics.composite, 24),
          changePercent: this.calculateChangePercent(metrics.composite, 24)
        },
        signal,
        confidence,
        analysis: this.generateAnalysis(metrics),
        subMetrics: {
          regime: metrics.regime,
          outliers: metrics.outliers.length,
          individualScores: Object.fromEntries(metrics.individual),
          dataQuality: this.calculateDataQuality()
        },
        alerts: this.generateAlerts(metrics)
      };
    } catch (error) {
      console.error('[ZScoreEngine] Calculation failed:', error);
      return this.getDefaultOutput();
    }
  }

  private calculateZScoreMetrics(data: Map<string, any>): ZScoreMetrics {
    const individual = new Map<string, number>();
    const outliers: string[] = [];
    
    // Calculate Z-scores for each indicator
    for (const indicator of config.requiredIndicators) {
      const value = this.extractLatestValue(data.get(indicator));
      if (value !== null) {
        const zScore = this.calculateIndicatorZScore(indicator, value);
        individual.set(indicator, zScore);
        
        // Check for outliers
        if (Math.abs(zScore) > this.OUTLIER_THRESHOLD) {
          outliers.push(indicator);
        }
      }
    }

    // Calculate composite Z-score
    const composite = this.calculateCompositeZScore(individual);
    
    // Determine regime
    const regime = this.determineRegime(composite, individual);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(individual, outliers.length);

    return {
      composite,
      individual,
      confidence,
      regime,
      outliers
    };
  }

  private calculateIndicatorZScore(indicator: string, currentValue: number): number {
    // Get or initialize historical data
    if (!this.historicalData.has(indicator)) {
      this.historicalData.set(indicator, []);
    }
    
    const history = this.historicalData.get(indicator)!;
    history.push(currentValue);
    
    // Maintain lookback window
    if (history.length > this.LOOKBACK_PERIODS) {
      history.shift();
    }
    
    // Need minimum data points for meaningful Z-score
    if (history.length < 10) {
      return 0;
    }
    
    // Remove outliers using IQR method for cleaner statistics
    const cleanedHistory = this.removeOutliers(history);
    
    if (cleanedHistory.length < 5) {
      return 0;
    }
    
    // Calculate Z-score with Bessel's correction
    const mean = cleanedHistory.reduce((sum, val) => sum + val, 0) / cleanedHistory.length;
    const variance = cleanedHistory.reduce((sum, val) => 
      sum + Math.pow(val - mean, 2), 0
    ) / (cleanedHistory.length - 1); // Bessel's correction
    
    const standardDeviation = Math.sqrt(variance);
    
    if (standardDeviation === 0) {
      return 0;
    }
    
    // 6-decimal precision as per spec
    return Number(((currentValue - mean) / standardDeviation).toFixed(6));
  }

  private removeOutliers(data: number[]): number[] {
    if (data.length < 4) return data;
    
    const sorted = [...data].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return data.filter(val => val >= lowerBound && val <= upperBound);
  }

  private calculateCompositeZScore(individual: Map<string, number>): number {
    if (individual.size === 0) return 0;
    
    // Weighted composite - VIX gets higher weight for volatility regime
    const weights = {
      'VIX': 0.4,
      'SPX': 0.3,
      'DXY': 0.2,
      'TNX': 0.1
    };
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const [indicator, zScore] of individual) {
      const weight = weights[indicator as keyof typeof weights] || 0.1;
      weightedSum += zScore * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(6)) : 0;
  }

  private determineRegime(composite: number, individual: Map<string, number>): string {
    const absComposite = Math.abs(composite);
    
    if (absComposite > 2.5) return 'EXTREME';
    if (absComposite > 2.0) return 'STRESSED';
    if (absComposite > 1.5) return 'ELEVATED';
    if (absComposite > 1.0) return 'MODERATE';
    if (absComposite > 0.5) return 'MILD';
    return 'NORMAL';
  }

  private calculateConfidence(individual: Map<string, number>, outlierCount: number): number {
    let confidence = 100;
    
    // Reduce confidence for missing indicators
    const expectedIndicators = config.requiredIndicators.length;
    const actualIndicators = individual.size;
    const completeness = actualIndicators / expectedIndicators;
    confidence *= completeness;
    
    // Reduce confidence for outliers
    if (outlierCount > 0) {
      confidence *= (1 - (outlierCount * 0.1));
    }
    
    // Reduce confidence if indicators disagree significantly
    const zScores = Array.from(individual.values());
    if (zScores.length > 1) {
      const agreement = this.calculateAgreement(zScores);
      confidence *= agreement;
    }
    
    return Math.max(0, Math.min(100, confidence));
  }

  private calculateAgreement(zScores: number[]): number {
    if (zScores.length < 2) return 1;
    
    // Check if indicators generally agree on direction
    const positive = zScores.filter(z => z > 0.5).length;
    const negative = zScores.filter(z => z < -0.5).length;
    const neutral = zScores.length - positive - negative;
    
    const maxCount = Math.max(positive, negative, neutral);
    return maxCount / zScores.length;
  }

  protected calculateDataQuality(): number {
    let totalQuality = 0;
    let count = 0;
    
    for (const [indicator, history] of this.historicalData) {
      if (history.length > 0) {
        // Quality based on data completeness and recency
        const completeness = Math.min(history.length / this.LOOKBACK_PERIODS, 1);
        const recency = 1; // Assume recent data for now
        totalQuality += (completeness * recency);
        count++;
      }
    }
    
    return count > 0 ? (totalQuality / count) * 100 : 0;
  }

  private calculateChange(current: number, hours: number): number {
    // Simplified - would need historical composite scores
    return 0;
  }

  private calculateChangePercent(current: number, hours: number): number {
    // Simplified - would need historical composite scores
    return 0;
  }

  private determineSignal(metrics: ZScoreMetrics): EngineOutput['signal'] {
    const composite = metrics.composite;
    
    if (composite > 2.0) return 'RISK_OFF';
    if (composite > 1.0) return 'WARNING';
    if (composite < -2.0) return 'RISK_ON';
    if (composite < -1.0) return 'NEUTRAL';
    return 'NEUTRAL';
  }

  private generateAnalysis(metrics: ZScoreMetrics): string {
    const { composite, regime, outliers } = metrics;
    
    let analysis = `Z-Score regime: ${regime} (${composite.toFixed(2)}σ). `;
    
    if (Math.abs(composite) > 2.0) {
      analysis += `Extreme deviation detected, `;
      analysis += composite > 0 ? 'elevated stress signals.' : 'strong contrarian signals.';
    } else if (Math.abs(composite) > 1.0) {
      analysis += `Moderate deviation, market `;
      analysis += composite > 0 ? 'showing stress patterns.' : 'potentially oversold.';
    } else {
      analysis += 'Market indicators within normal ranges.';
    }
    
    if (outliers.length > 0) {
      analysis += ` Outliers: ${outliers.join(', ')}.`;
    }
    
    return analysis;
  }

  private generateAlerts(metrics: ZScoreMetrics): any[] {
    const alerts: any[] = [];
    
    if (Math.abs(metrics.composite) > 2.5) {
      alerts.push({
        level: 'critical',
        message: `Extreme Z-Score deviation: ${metrics.composite.toFixed(2)}σ`,
        timestamp: Date.now()
      });
    }
    
    if (metrics.outliers.length > 2) {
      alerts.push({
        level: 'warning',
        message: `Multiple outliers detected: ${metrics.outliers.join(', ')}`,
        timestamp: Date.now()
      });
    }
    
    return alerts;
  }

  validateData(data: Map<string, any>): boolean {
    // Require at least 50% of indicators
    const availableIndicators = config.requiredIndicators.filter(
      indicator => data.has(indicator) && this.extractLatestValue(data.get(indicator)) !== null
    );
    
    return availableIndicators.length >= Math.ceil(config.requiredIndicators.length * 0.5);
  }
}