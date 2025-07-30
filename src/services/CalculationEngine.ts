/**
 * LIQUIDITY² Terminal - Calculation Engine
 * Advanced statistical and financial calculations for market analysis
 */

import * as ss from 'simple-statistics';
import { mean, median, standardDeviation, variance } from 'simple-statistics';

export interface StatisticalSummary {
  mean: number;
  median: number;
  standardDeviation: number;
  variance: number;
  min: number;
  max: number;
  count: number;
  sum: number;
  skewness?: number;
  kurtosis?: number;
  percentiles?: {
    p25: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

export interface ZScoreResult {
  value: number;
  zScore: number;
  percentile: number;
  interpretation: 'normal' | 'significant' | 'extreme';
  confidence: number;
}

export interface TrendAnalysis {
  direction: 'up' | 'down' | 'sideways';
  strength: number; // 0-100
  slope: number;
  rSquared: number;
  momentum: number;
  volatility: number;
}

export interface MovingAverageResult {
  simple: number;
  exponential: number;
  weighted: number;
  hull?: number;
}

export interface CorrelationMatrix {
  correlation: number;
  pValue: number;
  significance: 'high' | 'medium' | 'low' | 'none';
}

export class CalculationEngine {
  
  /**
   * Calculate comprehensive statistical summary
   */
  static calculateStatistics(data: number[]): StatisticalSummary {
    if (!data.length) {
      throw new Error('Cannot calculate statistics for empty dataset');
    }

    const filtered = data.filter(x => !isNaN(x) && isFinite(x));
    if (!filtered.length) {
      throw new Error('No valid numbers in dataset');
    }

    const stats: StatisticalSummary = {
      mean: mean(filtered),
      median: median(filtered),
      standardDeviation: standardDeviation(filtered),
      variance: variance(filtered),
      min: Math.min(...filtered),
      max: Math.max(...filtered),
      count: filtered.length,
      sum: filtered.reduce((a, b) => a + b, 0),
    };

    // Add advanced statistics if enough data points
    if (filtered.length >= 4) {
      try {
        stats.skewness = ss.sampleSkewness(filtered);
        stats.kurtosis = ss.sampleKurtosis(filtered);
        
        stats.percentiles = {
          p25: ss.quantile(filtered, 0.25),
          p75: ss.quantile(filtered, 0.75),
          p90: ss.quantile(filtered, 0.90),
          p95: ss.quantile(filtered, 0.95),
          p99: ss.quantile(filtered, 0.99),
        };
      } catch (error) {
        console.warn('Could not calculate advanced statistics:', error);
      }
    }

    return stats;
  }

  /**
   * Calculate Z-Score with interpretation
   */
  static calculateZScore(value: number, dataset: number[]): ZScoreResult {
    const stats = this.calculateStatistics(dataset);
    const zScore = (value - stats.mean) / stats.standardDeviation;
    
    // Calculate percentile using cumulative distribution
    const percentile = ss.cumulativeStdNormalProbability(zScore) * 100;
    
    // Interpret significance
    let interpretation: 'normal' | 'significant' | 'extreme';
    let confidence: number;
    
    const absZ = Math.abs(zScore);
    if (absZ < 1.5) {
      interpretation = 'normal';
      confidence = 0.3 + (absZ / 1.5) * 0.4; // 0.3 to 0.7
    } else if (absZ < 2.5) {
      interpretation = 'significant';
      confidence = 0.7 + ((absZ - 1.5) / 1.0) * 0.2; // 0.7 to 0.9
    } else {
      interpretation = 'extreme';
      confidence = 0.9 + Math.min((absZ - 2.5) / 2.5, 0.1); // 0.9 to 1.0
    }

    return {
      value,
      zScore,
      percentile,
      interpretation,
      confidence,
    };
  }

  /**
   * Analyze trend using linear regression
   */
  static analyzeTrend(data: number[], timePoints?: number[]): TrendAnalysis {
    if (!data.length) {
      throw new Error('Cannot analyze trend for empty dataset');
    }

    const filtered = data.filter(x => !isNaN(x) && isFinite(x));
    const times = timePoints || Array.from({ length: filtered.length }, (_, i) => i);
    
    if (filtered.length < 2) {
      return {
        direction: 'sideways',
        strength: 0,
        slope: 0,
        rSquared: 0,
        momentum: 0,
        volatility: 0,
      };
    }

    // Linear regression
    const points = times.slice(0, filtered.length).map((x, i) => [x, filtered[i]]);
    const regression = ss.linearRegression(points);
    const regressionFunction = ss.linearRegressionLine(regression);
    const rSquared = ss.rSquared(points, regressionFunction);
    
    // Determine direction and strength
    const slope = regression.m;
    const direction = Math.abs(slope) < 0.001 ? 'sideways' : slope > 0 ? 'up' : 'down';
    const strength = Math.min(Math.abs(slope) * 100, 100);
    
    // Calculate momentum (rate of change acceleration)
    let momentum = 0;
    if (filtered.length >= 3) {
      const recent = filtered.slice(-3);
      const older = filtered.slice(-6, -3);
      if (older.length > 0) {
        const recentAvg = mean(recent);
        const olderAvg = mean(older);
        momentum = ((recentAvg - olderAvg) / olderAvg) * 100;
      }
    }
    
    // Calculate volatility
    const volatility = standardDeviation(filtered) / mean(filtered) * 100;

    return {
      direction,
      strength,
      slope,
      rSquared,
      momentum,
      volatility,
    };
  }

  /**
   * Calculate various moving averages
   */
  static calculateMovingAverages(data: number[], period: number): MovingAverageResult {
    if (data.length < period) {
      throw new Error(`Insufficient data for period ${period}`);
    }

    const recent = data.slice(-period);
    
    // Simple Moving Average
    const simple = mean(recent);
    
    // Exponential Moving Average
    const alpha = 2 / (period + 1);
    let exponential = data[0];
    for (let i = 1; i < data.length; i++) {
      exponential = alpha * data[i] + (1 - alpha) * exponential;
    }
    
    // Weighted Moving Average
    const weights = Array.from({ length: period }, (_, i) => i + 1);
    const weightedSum = recent.reduce((sum, val, i) => sum + val * weights[i], 0);
    const weightSum = weights.reduce((sum, w) => sum + w, 0);
    const weighted = weightedSum / weightSum;
    
    // Hull Moving Average (if enough data)
    let hull: number | undefined;
    if (data.length >= period * 2) {
      try {
        const halfPeriod = Math.floor(period / 2);
        const sqrtPeriod = Math.floor(Math.sqrt(period));
        
        const wma1 = this.calculateWeightedMA(data, halfPeriod);
        const wma2 = this.calculateWeightedMA(data, period);
        const rawHull = data.map((_, i) => 2 * wma1[i] - wma2[i]).filter(x => !isNaN(x));
        
        if (rawHull.length >= sqrtPeriod) {
          const hullValues = this.calculateWeightedMA(rawHull, sqrtPeriod);
          hull = hullValues[hullValues.length - 1];
        }
      } catch (error) {
        console.warn('Could not calculate Hull MA:', error);
      }
    }

    return {
      simple,
      exponential,
      weighted,
      hull,
    };
  }

  /**
   * Calculate correlation between two datasets
   */
  static calculateCorrelation(data1: number[], data2: number[]): CorrelationMatrix {
    if (data1.length !== data2.length) {
      throw new Error('Datasets must have equal length for correlation');
    }

    const correlation = ss.sampleCorrelation(data1, data2);
    const n = data1.length;
    
    // Calculate t-statistic for significance testing
    const tStat = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation));
    
    // Approximate p-value (simplified)
    const pValue = Math.max(0.001, 1 - Math.abs(tStat) / (Math.abs(tStat) + Math.sqrt(n - 2)));
    
    // Determine significance
    let significance: 'high' | 'medium' | 'low' | 'none';
    if (pValue < 0.01 && Math.abs(correlation) > 0.7) {
      significance = 'high';
    } else if (pValue < 0.05 && Math.abs(correlation) > 0.5) {
      significance = 'medium';
    } else if (pValue < 0.1 && Math.abs(correlation) > 0.3) {
      significance = 'low';
    } else {
      significance = 'none';
    }

    return {
      correlation,
      pValue,
      significance,
    };
  }

  /**
   * Calculate regime detection using change point analysis
   */
  static detectRegimeChange(data: number[], windowSize: number = 20): {
    changePoints: number[];
    regimes: Array<{ start: number; end: number; mean: number; volatility: number }>;
    currentRegime: 'stable' | 'volatile' | 'trending';
  } {
    const changePoints: number[] = [];
    const regimes: Array<{ start: number; end: number; mean: number; volatility: number }> = [];
    
    if (data.length < windowSize * 2) {
      return {
        changePoints,
        regimes,
        currentRegime: 'stable',
      };
    }

    // Simple change point detection using variance change
    for (let i = windowSize; i < data.length - windowSize; i++) {
      const before = data.slice(i - windowSize, i);
      const after = data.slice(i, i + windowSize);
      
      const varBefore = variance(before);
      const varAfter = variance(after);
      const meanBefore = mean(before);
      const meanAfter = mean(after);
      
      // Detect significant changes in variance or mean
      const varRatio = Math.max(varBefore, varAfter) / Math.min(varBefore, varAfter);
      const meanDiff = Math.abs(meanAfter - meanBefore) / standardDeviation(before);
      
      if (varRatio > 2 || meanDiff > 1.5) {
        changePoints.push(i);
      }
    }

    // Build regimes based on change points
    let start = 0;
    for (const changePoint of changePoints) {
      const segment = data.slice(start, changePoint);
      if (segment.length > 0) {
        regimes.push({
          start,
          end: changePoint,
          mean: mean(segment),
          volatility: standardDeviation(segment),
        });
      }
      start = changePoint;
    }
    
    // Add final regime
    if (start < data.length) {
      const segment = data.slice(start);
      regimes.push({
        start,
        end: data.length,
        mean: mean(segment),
        volatility: standardDeviation(segment),
      });
    }

    // Determine current regime
    const recent = data.slice(-windowSize);
    const recentVol = standardDeviation(recent);
    const recentTrend = this.analyzeTrend(recent);
    
    let currentRegime: 'stable' | 'volatile' | 'trending';
    if (recentVol > mean(regimes.map(r => r.volatility)) * 1.5) {
      currentRegime = 'volatile';
    } else if (recentTrend.strength > 50) {
      currentRegime = 'trending';
    } else {
      currentRegime = 'stable';
    }

    return {
      changePoints,
      regimes,
      currentRegime,
    };
  }

  /**
   * Helper: Calculate weighted moving average
   */
  private static calculateWeightedMA(data: number[], period: number): number[] {
    const result: number[] = [];
    const weights = Array.from({ length: period }, (_, i) => i + 1);
    const weightSum = weights.reduce((sum, w) => sum + w, 0);
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const weightedSum = slice.reduce((sum, val, idx) => sum + val * weights[idx], 0);
      result.push(weightedSum / weightSum);
    }
    
    return result;
  }

  /**
   * Calculate Bollinger Bands
   */
  static calculateBollingerBands(data: number[], period: number = 20, multiplier: number = 2): {
    middle: number;
    upper: number;
    lower: number;
    bandwidth: number;
    position: number; // Position within bands (0-1)
  } {
    if (data.length < period) {
      throw new Error(`Insufficient data for Bollinger Bands calculation`);
    }

    const recent = data.slice(-period);
    const middle = mean(recent);
    const stdDev = standardDeviation(recent);
    
    const upper = middle + (multiplier * stdDev);
    const lower = middle - (multiplier * stdDev);
    const bandwidth = ((upper - lower) / middle) * 100;
    
    const currentPrice = data[data.length - 1];
    const position = (currentPrice - lower) / (upper - lower);

    return {
      middle,
      upper,
      lower,
      bandwidth,
      position: Math.max(0, Math.min(1, position)),
    };
  }

  /**
   * Calculate RSI (Relative Strength Index)
   */
  static calculateRSI(data: number[], period: number = 14): number {
    if (data.length < period + 1) {
      throw new Error(`Insufficient data for RSI calculation`);
    }

    const changes = [];
    for (let i = 1; i < data.length; i++) {
      changes.push(data[i] - data[i - 1]);
    }

    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);

    const avgGain = mean(gains.slice(-period));
    const avgLoss = mean(losses.slice(-period));

    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }
}