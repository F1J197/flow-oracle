/**
 * Master Prompt Compliant Z-Score Engine - V6 Implementation
 * Migrated from UnifiedBaseEngine to MasterPromptBaseEngine
 */

import { MasterPromptBaseEngine } from '@/engines/base/MasterPromptBaseEngine';
import { StatisticsCalculator } from '@/utils/statistics';
import { ZScoreCalculator } from '@/services/ZScoreCalculator';
import UniversalDataService from '@/services/UniversalDataService';
import { 
  EngineReport, 
  ActionableInsight, 
  DashboardTileData, 
  IntelligenceViewData, 
  DetailedModalData
} from '@/types/engines';
import { 
  ZScoreData, 
  CompositeZScore,
  MarketRegime, 
  ZScoreWindow,
  ZScoreCalculation,
  DistributionAnalysis,
  DataQualityMetrics
} from '@/types/zscoreTypes';

export class MasterPromptZScoreEngine extends MasterPromptBaseEngine {
  readonly id = 'master-prompt-zscore-foundation';
  readonly name = 'Master Prompt Z-Score Engine';
  readonly priority = 95;
  readonly pillar = 1 as const;
  readonly category = 'foundation' as const;

  private calculator: ZScoreCalculator;
  private dataService: UniversalDataService;
  private currentData: ZScoreData | null = null;

  // Core indicators for Z-Score analysis
  private readonly CORE_INDICATORS = [
    'GS10',     // 10-Year Treasury
    'DGS5',     // 5-Year Treasury  
    'DFF',      // Federal Funds Rate
    'UNRATE',   // Unemployment Rate
    'CPIAUCSL', // Consumer Price Index
    'GDP',      // Gross Domestic Product
    'DEXUSEU',  // USD/EUR Exchange Rate
    'DCOILWTICO' // WTI Crude Oil
  ];

  // Time windows for multi-timeframe analysis
  private readonly Z_SCORE_WINDOWS: ZScoreWindow[] = [
    { period: '4w', days: 28, weight: 0.15 },
    { period: '12w', days: 84, weight: 0.25 },
    { period: '26w', days: 182, weight: 0.35 },
    { period: '52w', days: 365, weight: 0.20 },
    { period: '104w', days: 730, weight: 0.05 }
  ];

  constructor() {
    super({
      refreshInterval: 15000,
      timeout: 10000,
      cacheTimeout: 15000,
      maxRetries: 3,
      gracefulDegradation: true
    });
    
    this.calculator = ZScoreCalculator.getInstance();
    this.dataService = UniversalDataService.getInstance();
  }

  protected async performExecution(): Promise<EngineReport> {
    console.log('🚀 Master Prompt Z-Score Engine: Starting execution...');
    
    try {
      // Calculate comprehensive Z-Score data
      console.log('📊 Master Prompt Z-Score Engine: Calculating Z-Score data...');
      const zscoreData = await this.calculateZScoreData();
      this.currentData = zscoreData;
      
      const signal = this.determineSignal(zscoreData.composite.value);
      const confidence = zscoreData.composite.confidence;
      
      console.log('✅ Master Prompt Z-Score Engine: Execution completed successfully', {
        composite: zscoreData.composite.value,
        regime: zscoreData.composite.regime,
        confidence: zscoreData.composite.confidence,
        signal
      });
      
      return {
        success: true,
        confidence,
        signal,
        data: zscoreData,
        lastUpdated: new Date()
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Z-Score calculation failed';
      console.error('❌ Master Prompt Z-Score Engine execution failed:', error);
      
      return {
        success: false,
        confidence: 0,
        signal: 'neutral',
        data: null,
        errors: [errorMessage],
        lastUpdated: new Date()
      };
    }
  }

  private async calculateZScoreData(): Promise<ZScoreData> {
    // Check cache first
    const cacheKey = 'master_prompt_zscore_foundation_v6';
    const cached = this.getCacheData(cacheKey);
    if (cached) {
      console.log('📦 Master Prompt Z-Score Engine: Using cached data');
      return { ...cached, cacheHit: true };
    }
    
    // Fetch indicator data
    const indicatorData = await this.fetchIndicatorData();
    
    // Calculate multi-timeframe Z-scores for each indicator
    const allZScores: Map<string, ZScoreCalculation[]> = new Map();
    const allValues: Map<string, number> = new Map();
    
    for (const indicator of this.CORE_INDICATORS) {
      const data = indicatorData.get(indicator);
      if (data && data.length > 0) {
        const zscores = this.calculateMultiTimeframeZScores(data, indicator);
        allZScores.set(indicator, zscores);
        allValues.set(indicator, data[data.length - 1]); // Latest value
      }
    }
    
    // Calculate composite Z-score
    const composite = this.calculateCompositeZScore(allZScores);
    
    // Analyze distribution
    const distribution = this.analyzeDistribution(allValues);
    
    // Assess data quality
    const dataQuality = this.assessDataQuality(indicatorData);
    
    // Flatten multi-timeframe results
    const multiTimeframe = Array.from(allZScores.values()).flat();
    
    const result: ZScoreData = {
      composite,
      distribution,
      multiTimeframe,
      dataQuality,
      lastUpdate: new Date(),
      cacheHit: false
    };
    
    // Cache the result
    this.setCacheData(cacheKey, result);
    return result;
  }

  private async fetchIndicatorData(): Promise<Map<string, number[]>> {
    const indicatorData = new Map<string, number[]>();
    
    for (const indicator of this.CORE_INDICATORS) {
      try {
        // Generate mock data for development
        indicatorData.set(indicator, this.generateMockIndicatorData(indicator));
      } catch (error) {
        console.log(`⚠️ Master Prompt Z-Score: Error fetching data for ${indicator}, using mock data:`, error);
        indicatorData.set(indicator, this.generateMockIndicatorData(indicator));
      }
    }
    
    return indicatorData;
  }

  private generateMockIndicatorData(indicator: string): number[] {
    const baseValues: Record<string, number> = {
      'GS10': 4.5, 'DGS5': 4.2, 'DFF': 5.25, 'UNRATE': 3.8,
      'CPIAUCSL': 310, 'GDP': 27000, 'DEXUSEU': 1.08, 'DCOILWTICO': 75
    };
    
    const baseValue = baseValues[indicator] || 100;
    const volatility = indicator === 'DCOILWTICO' ? 0.03 : 
                      indicator === 'DEXUSEU' ? 0.015 :
                      indicator === 'UNRATE' ? 0.005 : 0.02;
    
    const data: number[] = [];
    let currentValue = baseValue;
    
    // Generate 2 years of daily data (730 points)
    for (let i = 0; i < 730; i++) {
      const trend = (Math.random() - 0.5) * 0.001;
      const seasonal = Math.sin(i / 90) * 0.01; // Quarterly seasonality
      const noise = (Math.random() - 0.5) * volatility;
      
      currentValue *= (1 + trend + seasonal + noise);
      data.push(currentValue);
    }
    
    return data;
  }

  private calculateMultiTimeframeZScores(data: number[], indicator: string): ZScoreCalculation[] {
    const calculations: ZScoreCalculation[] = [];
    const currentValue = data[data.length - 1];
    
    for (const window of this.Z_SCORE_WINDOWS) {
      const windowData = data.slice(-window.days);
      
      if (windowData.length < Math.min(window.days * 0.7, 20)) {
        continue;
      }
      
      const metrics = StatisticsCalculator.analyzeDistribution(windowData, {
        method: 'iqr',
        threshold: 2.5,
        removeOutliers: true
      });
      
      const zscore = StatisticsCalculator.zscore(currentValue, metrics.mean, metrics.std);
      const percentile = StatisticsCalculator.percentileRank(currentValue, metrics.cleanData);
      const isExtreme = Math.abs(zscore) > 2.5;
      const confidence = Math.min((metrics.cleanData.length / window.days) * 0.7 + 0.3, 1.0);
      
      calculations.push({
        value: currentValue,
        zscore,
        percentile,
        window,
        isExtreme,
        confidence
      });
    }
    
    return calculations;
  }

  private calculateCompositeZScore(allZScores: Map<string, ZScoreCalculation[]>): CompositeZScore {
    let totalWeightedZScore = 0;
    let totalWeight = 0;
    let totalConfidence = 0;
    let count = 0;
    
    const components: ZScoreCalculation[] = [];
    
    for (const [indicator, calculations] of allZScores.entries()) {
      for (const calc of calculations) {
        const weight = calc.window.weight * calc.confidence;
        totalWeightedZScore += calc.zscore * weight;
        totalWeight += weight;
        totalConfidence += calc.confidence;
        count++;
        components.push(calc);
      }
    }
    
    const compositeValue = totalWeight > 0 ? totalWeightedZScore / totalWeight : 0;
    const clampedValue = Math.max(-4, Math.min(10, compositeValue));
    const overallConfidence = count > 0 ? totalConfidence / count : 0;
    const regime = this.detectMarketRegime(clampedValue, components);
    
    return {
      value: clampedValue,
      regime,
      confidence: overallConfidence,
      components,
      timestamp: new Date()
    };
  }

  private detectMarketRegime(compositeZScore: number, components: ZScoreCalculation[]): MarketRegime {
    const extremeCount = components.filter(c => c.isExtreme).length;
    const avgConfidence = components.reduce((sum, c) => sum + c.confidence, 0) / components.length;
    
    if (compositeZScore > 2 && extremeCount > components.length * 0.3) {
      return avgConfidence > 0.7 ? 'SUMMER' : 'SPRING';
    } else if (compositeZScore < -1.5 && extremeCount > components.length * 0.4) {
      return avgConfidence > 0.7 ? 'WINTER' : 'AUTUMN';
    } else if (compositeZScore > 0.5) {
      return 'SPRING';
    } else if (compositeZScore < -0.5) {
      return 'AUTUMN';
    } else {
      const recentTrend = components
        .filter(c => ['4w', '12w'].includes(c.window.period))
        .reduce((sum, c) => sum + c.zscore, 0);
      return recentTrend > 0 ? 'SPRING' : 'AUTUMN';
    }
  }

  private analyzeDistribution(allValues: Map<string, number>): DistributionAnalysis {
    const values = Array.from(allValues.values());
    
    if (values.length === 0) {
      return {
        histogram: [],
        skewness: 0,
        kurtosis: 0,
        extremeValues: [],
        outlierCount: 0
      };
    }
    
    const metrics = StatisticsCalculator.analyzeDistribution(values, {
      method: 'iqr',
      threshold: 2.0
    });
    
    const binCount = Math.min(10, Math.max(5, Math.floor(values.length / 10)));
    const min = Math.min(...metrics.cleanData);
    const max = Math.max(...metrics.cleanData);
    const binWidth = (max - min) / binCount;
    
    const histogram = [];
    for (let i = 0; i < binCount; i++) {
      const rangeStart = min + (i * binWidth);
      const rangeEnd = min + ((i + 1) * binWidth);
      const count = metrics.cleanData.filter(v => v >= rangeStart && v < rangeEnd).length;
      const percentage = (count / metrics.cleanData.length) * 100;
      
      histogram.push({
        range: [rangeStart, rangeEnd] as [number, number],
        count,
        percentage,
        isHighlighted: percentage > 20,
        color: percentage > 25 ? 'btc' : 
               percentage > 15 ? 'btc-light' : 
               percentage > 5 ? 'btc-glow' : 'btc-muted'
      });
    }
    
    const extremeValues = Array.from(allValues.entries())
      .filter(([_, value]) => metrics.outliers.includes(value))
      .map(([indicator, value]) => ({
        indicator,
        zscore: StatisticsCalculator.zscore(value, metrics.mean, metrics.std),
        percentile: StatisticsCalculator.percentileRank(value, metrics.cleanData),
        value,
        timestamp: new Date(),
        severity: (Math.abs(StatisticsCalculator.zscore(value, metrics.mean, metrics.std)) > 3 ? 'extreme' :
                 Math.abs(StatisticsCalculator.zscore(value, metrics.mean, metrics.std)) > 2 ? 'significant' : 'notable') as 'extreme' | 'significant' | 'notable'
      }));
    
    return {
      histogram,
      skewness: metrics.skewness,
      kurtosis: metrics.kurtosis,
      extremeValues,
      outlierCount: metrics.outliers.length
    };
  }

  private assessDataQuality(indicatorData: Map<string, number[]>): DataQualityMetrics {
    let totalCompleteness = 0;
    let totalFreshness = 0;
    let sourceCount = 0;
    let validationsTotal = 0;
    let validationsPassed = 0;
    
    for (const [indicator, data] of indicatorData.entries()) {
      sourceCount++;
      
      const completeness = data.filter(v => Number.isFinite(v)).length / data.length;
      totalCompleteness += completeness;
      
      const freshness = 0.95; // Mock freshness
      totalFreshness += freshness;
      
      validationsTotal += 3;
      
      if (data.length > 100) validationsPassed++;
      
      const gaps = data.slice(1).map((val, i) => Math.abs(val - data[i]));
      const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
      const extremeGaps = gaps.filter(gap => gap > avgGap * 5).length;
      if (extremeGaps < data.length * 0.05) validationsPassed++;
      
      const std = StatisticsCalculator.standardDeviation(data);
      const mean = StatisticsCalculator.mean(data);
      if (std / mean < 2) validationsPassed++;
    }
    
    return {
      completeness: sourceCount > 0 ? totalCompleteness / sourceCount : 0,
      freshness: sourceCount > 0 ? totalFreshness / sourceCount : 0,
      accuracy: validationsTotal > 0 ? validationsPassed / validationsTotal : 0,
      sourceCount,
      validationsPassed,
      validationsTotal
    };
  }

  private determineSignal(compositeValue: number): 'bullish' | 'bearish' | 'neutral' {
    if (compositeValue > 2) return 'bullish';
    if (compositeValue < -2) return 'bearish';
    return 'neutral';
  }

  getSingleActionableInsight(): ActionableInsight {
    if (!this.currentData) {
      return {
        actionText: 'Master Prompt Z-Score analysis initializing',
        signalStrength: 0,
        marketAction: 'WAIT',
        confidence: 'LOW',
        timeframe: 'IMMEDIATE'
      };
    }

    const { composite } = this.currentData;
    const absValue = Math.abs(composite.value);
    
    if (absValue > 3) {
      return {
        actionText: `Extreme Z-Score (${composite.value.toFixed(2)}σ) signals significant market deviation in ${composite.regime} regime`,
        signalStrength: Math.min(absValue * 25, 100),
        marketAction: composite.value > 0 ? 'BUY' : 'SELL',
        confidence: 'HIGH',
        timeframe: 'IMMEDIATE'
      };
    }
    
    if (absValue > 2) {
      return {
        actionText: `Strong Z-Score (${composite.value.toFixed(2)}σ) indicates ${composite.regime} market conditions`,
        signalStrength: Math.min(absValue * 20, 80),
        marketAction: composite.value > 0 ? 'BUY' : 'SELL',
        confidence: 'MED',
        timeframe: 'SHORT_TERM'
      };
    }

    return {
      actionText: `Moderate Z-Score (${composite.value.toFixed(2)}σ) in ${composite.regime} regime - monitor for changes`,
      signalStrength: Math.min(absValue * 15, 60),
      marketAction: 'HOLD',
      confidence: 'LOW',
      timeframe: 'MEDIUM_TERM'
    };
  }

  getDashboardData(): DashboardTileData {
    if (!this.currentData) {
      return {
        title: 'Master Prompt Z-Score',
        primaryMetric: '-- σ',
        secondaryMetric: 'Initializing...',
        status: 'normal',
        trend: 'neutral',
        actionText: 'Loading',
        color: 'neutral',
        loading: true
      };
    }

    const { composite } = this.currentData;
    
    return {
      title: 'Master Prompt Z-Score',
      primaryMetric: `${composite.value.toFixed(2)}σ`,
      secondaryMetric: `${composite.regime} regime`,
      status: Math.abs(composite.value) > 2.5 ? 'critical' : 
              Math.abs(composite.value) > 1.5 ? 'warning' : 'normal',
      trend: composite.value > 0.5 ? 'up' : composite.value < -0.5 ? 'down' : 'neutral',
      actionText: `Confidence: ${(composite.confidence * 100).toFixed(0)}%`,
      color: composite.value > 2 ? 'success' : 
             composite.value < -2 ? 'critical' : 'info',
      loading: false
    };
  }

  getDashboardTile(): DashboardTileData {
    return this.getDashboardData();
  }

  getDetailedView(): any {
    return this.currentData;
  }

  getIntelligenceView(): IntelligenceViewData {
    if (!this.currentData) {
      return {
        title: this.name,
        status: 'offline',
        primaryMetrics: {},
        sections: [],
        confidence: 0,
        lastUpdate: new Date()
      };
    }

    const { composite, dataQuality } = this.currentData;
    
    return {
      title: this.name,
      status: Math.abs(composite.value) > 2.5 ? 'critical' : 
              Math.abs(composite.value) > 1.5 ? 'warning' : 'active',
      primaryMetrics: {
        'Composite Z-Score': {
          value: `${composite.value.toFixed(2)}σ`,
          label: 'Multi-timeframe composite',
          status: 'normal'
        },
        'Market Regime': {
          value: composite.regime,
          label: 'Current market state',
          status: 'normal'
        }
      },
      sections: [
        {
          title: 'Statistical Analysis',
          data: {
            'Confidence': {
              value: `${(composite.confidence * 100).toFixed(1)}%`,
              label: 'Analysis confidence'
            },
            'Components': {
              value: composite.components.length.toString(),
              label: 'Z-score calculations'
            },
            'Extreme Values': {
              value: composite.components.filter(c => c.isExtreme).length.toString(),
              label: 'Beyond 2.5σ threshold'
            }
          }
        },
        {
          title: 'Data Quality',
          data: {
            'Completeness': {
              value: `${(dataQuality.completeness * 100).toFixed(1)}%`,
              label: 'Data availability'
            },
            'Accuracy': {
              value: `${(dataQuality.accuracy * 100).toFixed(1)}%`,
              label: 'Validation success'
            },
            'Sources': {
              value: dataQuality.sourceCount.toString(),
              label: 'Active data sources'
            }
          }
        }
      ],
      confidence: Math.round(composite.confidence * 100),
      lastUpdate: composite.timestamp
    };
  }

  getDetailedModal(): DetailedModalData {
    return {
      title: this.name,
      description: 'Master Prompt compliant Z-Score engine for statistical market analysis',
      keyInsights: [
        `Composite Z-Score: ${this.currentData?.composite.value.toFixed(2) || 'N/A'}σ`,
        `Market Regime: ${this.currentData?.composite.regime || 'Unknown'}`,
        `Analysis Confidence: ${this.currentData ? (this.currentData.composite.confidence * 100).toFixed(0) : '0'}%`,
        `Active Indicators: ${this.CORE_INDICATORS.length}`
      ],
      detailedMetrics: [
        {
          category: 'Z-Score Analysis',
          metrics: {
            'Composite Value': { value: `${this.currentData?.composite.value.toFixed(2) || 'N/A'}σ`, description: 'Current composite Z-score' },
            'Market Regime': { value: this.currentData?.composite.regime || 'Unknown', description: 'Current market state' },
            'Components': { value: this.currentData?.composite.components.length.toString() || '0', description: 'Z-score calculations' },
            'Extreme Values': { value: this.currentData?.composite.components.filter(c => c.isExtreme).length.toString() || '0', description: 'Beyond 2.5σ threshold' }
          }
        }
      ],
      actionItems: [
        {
          priority: 'medium' as const,
          action: 'Refresh Analysis',
          timeframe: 'within 1 hour'
        }
      ]
    };
  }
}