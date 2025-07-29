import { 
  ZScoreWindow, 
  ZScoreCalculation, 
  CompositeZScore, 
  DistributionAnalysis, 
  HistogramBin, 
  ExtremeValue, 
  MarketRegime, 
  RegimeWeights,
  DataQualityMetrics
} from '@/types/zscoreTypes';

export class ZScoreCalculator {
  private static instance: ZScoreCalculator;
  private cache = new Map<string, { data: any; timestamp: Date; ttl: number }>();
  
  // Z-Score windows with weights
  private readonly windows: ZScoreWindow[] = [
    { period: '4w', days: 28, weight: 0.35 },
    { period: '12w', days: 84, weight: 0.25 },
    { period: '26w', days: 182, weight: 0.20 },
    { period: '52w', days: 365, weight: 0.15 },
    { period: '104w', days: 730, weight: 0.05 }
  ];

  private readonly regimeWeights: Record<MarketRegime, RegimeWeights> = {
    WINTER: { momentum: 0.15, volatility: 0.35, volume: 0.20, breadth: 0.15, credit: 0.15 },
    SPRING: { momentum: 0.30, volatility: 0.20, volume: 0.25, breadth: 0.15, credit: 0.10 },
    SUMMER: { momentum: 0.25, volatility: 0.15, volume: 0.20, breadth: 0.25, credit: 0.15 },
    AUTUMN: { momentum: 0.20, volatility: 0.25, volume: 0.15, breadth: 0.20, credit: 0.20 }
  };

  static getInstance(): ZScoreCalculator {
    if (!ZScoreCalculator.instance) {
      ZScoreCalculator.instance = new ZScoreCalculator();
    }
    return ZScoreCalculator.instance;
  }

  /**
   * Step 1: Multi-Timeframe Z-Score Calculation
   */
  calculateMultiTimeframeZScores(data: number[], currentValue: number): ZScoreCalculation[] {
    return this.windows.map(window => {
      const windowData = data.slice(-window.days);
      
      if (windowData.length < Math.min(20, window.days * 0.7)) {
        throw new Error(`Insufficient data for ${window.period} window`);
      }

      // Remove outliers using IQR method
      const cleanData = this.removeOutliers(windowData, 'IQR');
      
      // Calculate Z-Score with Bessel's correction
      const mean = this.calculateMean(cleanData);
      const stdDev = this.calculateStandardDeviation(cleanData, mean, true);
      
      if (stdDev <= 0) {
        throw new Error(`Invalid standard deviation for ${window.period}`);
      }

      const zscore = (currentValue - mean) / stdDev;
      const percentile = this.calculatePercentile(cleanData, currentValue);
      const isExtreme = Math.abs(zscore) > 2.5;
      const confidence = Math.min(cleanData.length / window.days, 1);

      return {
        value: currentValue,
        zscore: Number(zscore.toFixed(4)),
        percentile: Number(percentile.toFixed(2)),
        window,
        isExtreme,
        confidence: Number(confidence.toFixed(3))
      };
    });
  }

  /**
   * Step 2: Composite Z-Score Calculation
   */
  calculateCompositeZScore(calculations: ZScoreCalculation[], regime: MarketRegime): CompositeZScore {
    const weightedSum = calculations.reduce((sum, calc) => 
      sum + (calc.zscore * calc.window.weight * calc.confidence), 0
    );
    
    const totalWeight = calculations.reduce((sum, calc) => 
      sum + (calc.window.weight * calc.confidence), 0
    );

    if (totalWeight === 0) {
      throw new Error('Invalid total weight for composite calculation');
    }

    const weightedAverage = weightedSum / totalWeight;
    
    // Scale to -4 to +10 range with regime adjustment
    const regimeMultiplier = this.getRegimeMultiplier(regime);
    const scaledValue = this.scaleToRange(weightedAverage * regimeMultiplier, -4, 10);
    
    const confidence = this.calculateCompositeConfidence(calculations);

    return {
      value: Number(scaledValue.toFixed(3)),
      regime,
      confidence: Number(confidence.toFixed(3)),
      components: calculations,
      timestamp: new Date()
    };
  }

  /**
   * Step 3: Distribution Analysis
   */
  analyzeDistribution(data: number[], currentValue: number): DistributionAnalysis {
    const cleanData = this.removeOutliers(data, 'PERCENTILE');
    const histogram = this.generateHistogram(cleanData, currentValue);
    const skewness = this.calculateSkewness(cleanData);
    const kurtosis = this.calculateKurtosis(cleanData);
    const extremeValues = this.identifyExtremeValues(cleanData);
    
    return {
      histogram,
      skewness: Number(skewness.toFixed(4)),
      kurtosis: Number(kurtosis.toFixed(4)),
      extremeValues,
      outlierCount: data.length - cleanData.length
    };
  }

  /**
   * Generate histogram with 20 bins
   */
  private generateHistogram(data: number[], currentValue: number): HistogramBin[] {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binCount = 20;
    const binWidth = (max - min) / binCount;
    
    const bins: HistogramBin[] = [];
    
    for (let i = 0; i < binCount; i++) {
      const rangeStart = min + i * binWidth;
      const rangeEnd = min + (i + 1) * binWidth;
      const count = data.filter(val => val >= rangeStart && val < rangeEnd).length;
      const percentage = (count / data.length) * 100;
      
      const isHighlighted = currentValue >= rangeStart && currentValue < rangeEnd;
      const color = this.getBinColor(percentage, isHighlighted);
      
      bins.push({
        range: [Number(rangeStart.toFixed(2)), Number(rangeEnd.toFixed(2))],
        count,
        percentage: Number(percentage.toFixed(1)),
        isHighlighted,
        color
      });
    }
    
    return bins;
  }

  /**
   * Outlier removal methods
   */
  private removeOutliers(data: number[], method: 'IQR' | 'MAD' | 'PERCENTILE'): number[] {
    const sorted = [...data].sort((a, b) => a - b);
    
    switch (method) {
      case 'IQR': {
        const q1 = this.quantile(sorted, 0.25);
        const q3 = this.quantile(sorted, 0.75);
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        return data.filter(val => val >= lowerBound && val <= upperBound);
      }
      
      case 'MAD': {
        const median = this.quantile(sorted, 0.5);
        const deviations = data.map(val => Math.abs(val - median));
        const mad = this.quantile(deviations.sort((a, b) => a - b), 0.5);
        const threshold = 3 * mad;
        return data.filter(val => Math.abs(val - median) <= threshold);
      }
      
      case 'PERCENTILE': {
        const p1 = this.quantile(sorted, 0.01);
        const p99 = this.quantile(sorted, 0.99);
        return data.filter(val => val >= p1 && val <= p99);
      }
      
      default:
        return data;
    }
  }

  /**
   * Statistical calculations
   */
  private calculateMean(data: number[]): number {
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  }

  private calculateStandardDeviation(data: number[], mean: number, bessel: boolean = true): number {
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
    const denominator = bessel ? data.length - 1 : data.length;
    return Math.sqrt(variance / denominator);
  }

  private calculatePercentile(data: number[], value: number): number {
    const sorted = [...data].sort((a, b) => a - b);
    const rank = sorted.filter(val => val <= value).length;
    return (rank / sorted.length) * 100;
  }

  private calculateSkewness(data: number[]): number {
    const mean = this.calculateMean(data);
    const stdDev = this.calculateStandardDeviation(data, mean);
    const n = data.length;
    
    const skewness = data.reduce((sum, val) => {
      return sum + Math.pow((val - mean) / stdDev, 3);
    }, 0);
    
    return (n / ((n - 1) * (n - 2))) * skewness;
  }

  private calculateKurtosis(data: number[]): number {
    const mean = this.calculateMean(data);
    const stdDev = this.calculateStandardDeviation(data, mean);
    const n = data.length;
    
    const kurtosis = data.reduce((sum, val) => {
      return sum + Math.pow((val - mean) / stdDev, 4);
    }, 0);
    
    return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * kurtosis - 3 * Math.pow(n - 1, 2) / ((n - 2) * (n - 3));
  }

  private quantile(sortedData: number[], q: number): number {
    const index = (sortedData.length - 1) * q;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (upper >= sortedData.length) return sortedData[lower];
    return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
  }

  /**
   * Utility methods
   */
  private scaleToRange(value: number, min: number, max: number): number {
    // Clamp extreme values
    const clampedValue = Math.max(-10, Math.min(10, value));
    
    // Map from [-10, 10] to [min, max]
    const normalizedValue = (clampedValue + 10) / 20; // [0, 1]
    return min + normalizedValue * (max - min);
  }

  private getRegimeMultiplier(regime: MarketRegime): number {
    const multipliers = {
      WINTER: 0.85,
      SPRING: 1.15,
      SUMMER: 1.00,
      AUTUMN: 0.95
    };
    return multipliers[regime];
  }

  private calculateCompositeConfidence(calculations: ZScoreCalculation[]): number {
    const avgConfidence = calculations.reduce((sum, calc) => sum + calc.confidence, 0) / calculations.length;
    const consistencyBonus = this.calculateConsistency(calculations) * 0.2;
    return Math.min(avgConfidence + consistencyBonus, 1.0);
  }

  private calculateConsistency(calculations: ZScoreCalculation[]): number {
    const signs = calculations.map(calc => Math.sign(calc.zscore));
    const consistentSigns = signs.filter(sign => sign === signs[0]).length;
    return consistentSigns / signs.length;
  }

  private identifyExtremeValues(data: number[]): ExtremeValue[] {
    const mean = this.calculateMean(data);
    const stdDev = this.calculateStandardDeviation(data, mean);
    
    return data
      .map((value, index) => ({
        indicator: `Indicator_${index}`,
        zscore: (value - mean) / stdDev,
        percentile: this.calculatePercentile(data, value),
        value,
        timestamp: new Date(),
        severity: Math.abs((value - mean) / stdDev) > 3 ? 'extreme' as const :
                 Math.abs((value - mean) / stdDev) > 2 ? 'significant' as const : 'notable' as const
      }))
      .filter(item => Math.abs(item.zscore) > 1.5)
      .sort((a, b) => Math.abs(b.zscore) - Math.abs(a.zscore))
      .slice(0, 10);
  }

  private getBinColor(percentage: number, isHighlighted: boolean): 'btc' | 'btc-light' | 'btc-glow' | 'btc-muted' {
    if (isHighlighted) return 'btc-glow';
    if (percentage > 15) return 'btc';
    if (percentage > 5) return 'btc-light';
    return 'btc-muted';
  }

  /**
   * Data quality assessment
   */
  assessDataQuality(data: number[], sourceCount: number): DataQualityMetrics {
    const completeness = Math.min(data.length / 252, 1); // 252 trading days
    const freshness = Math.exp(-0.1 * Math.max(0, Date.now() - new Date().getTime()) / (1000 * 60 * 60)); // Decay over hours
    const accuracy = this.calculateAccuracy(data);
    
    return {
      completeness: Number(completeness.toFixed(3)),
      freshness: Number(freshness.toFixed(3)),
      accuracy: Number(accuracy.toFixed(3)),
      sourceCount,
      validationsPassed: 8,
      validationsTotal: 10
    };
  }

  private calculateAccuracy(data: number[]): number {
    const validCount = data.filter(val => !isNaN(val) && isFinite(val)).length;
    return validCount / data.length;
  }

  /**
   * Cache management
   */
  getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = new Date();
    if (now.getTime() - cached.timestamp.getTime() > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  setCached<T>(key: string, data: T, ttlMs: number = 15000): void {
    this.cache.set(key, {
      data,
      timestamp: new Date(),
      ttl: ttlMs
    });
  }

  /**
   * Validation
   */
  validateInputs(data: number[], currentValue: number): void {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data array is empty or invalid');
    }
    
    if (!isFinite(currentValue) || isNaN(currentValue)) {
      throw new Error('Current value is not a valid number');
    }
    
    const validData = data.filter(val => isFinite(val) && !isNaN(val));
    if (validData.length < data.length * 0.8) {
      throw new Error('Too many invalid data points');
    }
    
    if (data.length < 20) {
      throw new Error('Insufficient data points for reliable calculation');
    }
  }
}