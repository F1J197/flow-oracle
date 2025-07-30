/**
 * Statistical Utilities for Enhanced Z-Score Engine
 * Provides advanced statistical functions for financial data analysis
 */

export interface StatisticalResult {
  value: number;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface OutlierDetectionConfig {
  method: 'iqr' | 'mad' | 'percentile' | 'zscore';
  threshold?: number;
  removeOutliers?: boolean;
}

export interface DistributionMetrics {
  mean: number;
  median: number;
  std: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  quartiles: [number, number, number];
  outliers: number[];
  cleanData: number[];
}

export class StatisticsCalculator {
  
  /**
   * Calculate comprehensive distribution metrics
   */
  static analyzeDistribution(data: number[], config?: OutlierDetectionConfig): DistributionMetrics {
    if (data.length === 0) {
      throw new Error('Cannot analyze distribution of empty dataset');
    }

    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;
    
    // Basic metrics
    const mean = this.mean(data);
    const median = this.median(sorted);
    const variance = this.variance(data, mean);
    const std = Math.sqrt(variance);
    
    // Quartiles
    const q1 = this.percentile(sorted, 25);
    const q3 = this.percentile(sorted, 75);
    const quartiles: [number, number, number] = [q1, median, q3];
    
    // Outlier detection
    const outlierResult = config ? 
      this.detectOutliers(data, config) : 
      { outliers: [], cleanData: data };
    
    // Higher-order moments using clean data
    const cleanMean = this.mean(outlierResult.cleanData);
    const skewness = this.skewness(outlierResult.cleanData, cleanMean, std);
    const kurtosis = this.kurtosis(outlierResult.cleanData, cleanMean, std);
    
    return {
      mean: cleanMean,
      median,
      std,
      variance,
      skewness,
      kurtosis,
      quartiles,
      outliers: outlierResult.outliers,
      cleanData: outlierResult.cleanData
    };
  }

  /**
   * Detect and optionally remove outliers using various methods
   */
  static detectOutliers(data: number[], config: OutlierDetectionConfig) {
    const { method, threshold = 2.5, removeOutliers = false } = config;
    let outliers: number[] = [];
    let cleanData = [...data];

    switch (method) {
      case 'iqr':
        outliers = this.detectOutliersIQR(data, threshold);
        break;
      case 'mad':
        outliers = this.detectOutliersMAD(data, threshold);
        break;
      case 'percentile':
        outliers = this.detectOutliersPercentile(data, threshold);
        break;
      case 'zscore':
        outliers = this.detectOutliersZScore(data, threshold);
        break;
    }

    if (removeOutliers && outliers.length > 0) {
      const outlierSet = new Set(outliers);
      cleanData = data.filter(value => !outlierSet.has(value));
    }

    return { outliers, cleanData };
  }

  /**
   * Calculate Z-score for a value given population parameters
   */
  static zscore(value: number, mean: number, std: number): number {
    if (std === 0) return 0;
    return (value - mean) / std;
  }

  /**
   * Calculate percentile rank of a value in a dataset
   */
  static percentileRank(value: number, data: number[]): number {
    const sorted = [...data].sort((a, b) => a - b);
    const count = sorted.filter(x => x <= value).length;
    return (count / sorted.length) * 100;
  }

  /**
   * Calculate value at given percentile
   */
  static percentile(sortedData: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedData.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sortedData[lower];
    }
    
    const weight = index - lower;
    return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
  }

  /**
   * Calculate mean
   */
  static mean(data: number[]): number {
    return data.reduce((sum, value) => sum + value, 0) / data.length;
  }

  /**
   * Calculate median
   */
  static median(sortedData: number[]): number {
    const mid = Math.floor(sortedData.length / 2);
    return sortedData.length % 2 === 0
      ? (sortedData[mid - 1] + sortedData[mid]) / 2
      : sortedData[mid];
  }

  /**
   * Calculate variance
   */
  static variance(data: number[], mean?: number): number {
    const m = mean ?? this.mean(data);
    return data.reduce((sum, value) => sum + Math.pow(value - m, 2), 0) / (data.length - 1);
  }

  /**
   * Calculate standard deviation
   */
  static standardDeviation(data: number[], mean?: number): number {
    return Math.sqrt(this.variance(data, mean));
  }

  /**
   * Calculate skewness (third moment)
   */
  static skewness(data: number[], mean?: number, std?: number): number {
    const m = mean ?? this.mean(data);
    const s = std ?? this.standardDeviation(data, m);
    
    if (s === 0) return 0;
    
    const sum = data.reduce((acc, value) => acc + Math.pow((value - m) / s, 3), 0);
    return sum / data.length;
  }

  /**
   * Calculate kurtosis (fourth moment)
   */
  static kurtosis(data: number[], mean?: number, std?: number): number {
    const m = mean ?? this.mean(data);
    const s = std ?? this.standardDeviation(data, m);
    
    if (s === 0) return 0;
    
    const sum = data.reduce((acc, value) => acc + Math.pow((value - m) / s, 4), 0);
    return (sum / data.length) - 3; // Excess kurtosis
  }

  /**
   * Detect outliers using Interquartile Range method
   */
  private static detectOutliersIQR(data: number[], multiplier: number = 1.5): number[] {
    const sorted = [...data].sort((a, b) => a - b);
    const q1 = this.percentile(sorted, 25);
    const q3 = this.percentile(sorted, 75);
    const iqr = q3 - q1;
    
    const lowerBound = q1 - multiplier * iqr;
    const upperBound = q3 + multiplier * iqr;
    
    return data.filter(value => value < lowerBound || value > upperBound);
  }

  /**
   * Detect outliers using Median Absolute Deviation method
   */
  private static detectOutliersMAD(data: number[], threshold: number = 2.5): number[] {
    const median = this.median([...data].sort((a, b) => a - b));
    const deviations = data.map(value => Math.abs(value - median));
    const mad = this.median([...deviations].sort((a, b) => a - b));
    
    if (mad === 0) return [];
    
    const modifiedZScores = data.map(value => 
      0.6745 * Math.abs(value - median) / mad
    );
    
    return data.filter((_, index) => modifiedZScores[index] > threshold);
  }

  /**
   * Detect outliers using percentile method
   */
  private static detectOutliersPercentile(data: number[], threshold: number = 5): number[] {
    const sorted = [...data].sort((a, b) => a - b);
    const lowerThreshold = this.percentile(sorted, threshold);
    const upperThreshold = this.percentile(sorted, 100 - threshold);
    
    return data.filter(value => value < lowerThreshold || value > upperThreshold);
  }

  /**
   * Detect outliers using Z-score method
   */
  private static detectOutliersZScore(data: number[], threshold: number = 2.5): number[] {
    const mean = this.mean(data);
    const std = this.standardDeviation(data, mean);
    
    if (std === 0) return [];
    
    return data.filter(value => Math.abs(this.zscore(value, mean, std)) > threshold);
  }

  /**
   * Calculate rolling statistics for time series data
   */
  static rollingStatistics(data: number[], windowSize: number) {
    if (windowSize > data.length) {
      throw new Error('Window size cannot be larger than data length');
    }

    const result = [];
    for (let i = windowSize - 1; i < data.length; i++) {
      const window = data.slice(i - windowSize + 1, i + 1);
      const mean = this.mean(window);
      const std = this.standardDeviation(window, mean);
      
      result.push({
        index: i,
        mean,
        std,
        min: Math.min(...window),
        max: Math.max(...window),
        range: Math.max(...window) - Math.min(...window)
      });
    }
    
    return result;
  }

  /**
   * Calculate correlation coefficient between two datasets
   */
  static correlation(x: number[], y: number[]): number {
    if (x.length !== y.length) {
      throw new Error('Datasets must have same length for correlation calculation');
    }

    const n = x.length;
    const meanX = this.mean(x);
    const meanY = this.mean(y);
    
    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;
    
    for (let i = 0; i < n; i++) {
      const deltaX = x[i] - meanX;
      const deltaY = y[i] - meanY;
      
      numerator += deltaX * deltaY;
      sumXSquared += deltaX * deltaX;
      sumYSquared += deltaY * deltaY;
    }
    
    const denominator = Math.sqrt(sumXSquared * sumYSquared);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Validate statistical inputs
   */
  static validateInputs(data: number[], label: string = 'dataset'): void {
    if (!Array.isArray(data)) {
      throw new Error(`${label} must be an array`);
    }
    
    if (data.length === 0) {
      throw new Error(`${label} cannot be empty`);
    }
    
    if (data.some(value => !Number.isFinite(value))) {
      throw new Error(`${label} contains non-finite values`);
    }
  }
}