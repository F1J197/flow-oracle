import { ResilientBaseEngine } from './ResilientBaseEngine';
import { ZScoreCalculator } from '@/services/ZScoreCalculator';
import { 
  EngineReport, 
  ActionableInsight, 
  DashboardTileData, 
  IntelligenceViewData, 
  DetailedModalData,
  DetailedEngineView 
} from '@/types/engines';
import { 
  ZScoreData, 
  MarketRegime, 
  ZScoreTileData, 
  ZScoreIntelligenceData 
} from '@/types/zscoreTypes';

export class EnhancedZScoreEngineV6 extends ResilientBaseEngine {
  readonly category = 'foundation' as const;
  readonly id = 'enhanced-zscore-v6';
  readonly name = 'Enhanced Z-Score Engine V6';
  readonly priority = 95;
  readonly pillar = 1;

  private calculator: ZScoreCalculator;
  private currentData: ZScoreData | null = null;
  private lastCalculationTime = 0;
  
  constructor() {
    super({
      refreshInterval: 15000, // 15 seconds
      maxRetries: 3,
      timeout: 10000,
      cacheTimeout: 15000,
      gracefulDegradation: true
    });
    
    this.calculator = ZScoreCalculator.getInstance();
  }

  protected async performExecution(): Promise<EngineReport> {
    try {
      const startTime = Date.now();
      
      // Generate or fetch current data
      const zscoreData = await this.calculateZScoreData();
      this.currentData = zscoreData;
      this.lastCalculationTime = Date.now() - startTime;
      
      const signal = this.determineSignal(zscoreData.composite.value);
      const confidence = zscoreData.composite.confidence;
      
      return {
        success: true,
        confidence,
        signal,
        data: zscoreData,
        lastUpdated: new Date()
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Z-Score calculation failed';
      
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
    const cacheKey = 'zscore_data_v6';
    const cached = this.calculator.getCached<ZScoreData>(cacheKey);
    if (cached) {
      return { ...cached, cacheHit: true };
    }
    
    // Generate mock historical data (in production, this would fetch real data)
    const historicalData = this.generateMockData();
    const currentValue = historicalData[historicalData.length - 1];
    const regime = this.detectMarketRegime();
    
    // Validate inputs
    this.calculator.validateInputs(historicalData, currentValue);
    
    // Calculate multi-timeframe Z-scores
    const multiTimeframe = this.calculator.calculateMultiTimeframeZScores(historicalData, currentValue);
    
    // Calculate composite Z-score
    const composite = this.calculator.calculateCompositeZScore(multiTimeframe, regime);
    
    // Analyze distribution
    const distribution = this.calculator.analyzeDistribution(historicalData, currentValue);
    
    // Assess data quality
    const dataQuality = this.calculator.assessDataQuality(historicalData, 5);
    
    const result: ZScoreData = {
      composite,
      distribution,
      multiTimeframe,
      dataQuality,
      lastUpdate: new Date(),
      cacheHit: false
    };
    
    // Cache the result
    this.calculator.setCached(cacheKey, result, 15000);
    
    return result;
  }

  private generateMockData(): number[] {
    // Generate realistic market data with trends and volatility
    const baseValue = 100;
    const trend = 0.0002; // Slight upward trend
    const volatility = 0.015;
    const data: number[] = [];
    
    for (let i = 0; i < 730; i++) { // 2 years of data
      const trendComponent = baseValue + (i * trend);
      const randomComponent = (Math.random() - 0.5) * volatility * baseValue;
      const cyclicalComponent = Math.sin(i / 50) * 5; // Cyclical pattern
      
      data.push(trendComponent + randomComponent + cyclicalComponent);
    }
    
    return data;
  }

  private detectMarketRegime(): MarketRegime {
    // Simple regime detection based on current market conditions
    const now = new Date();
    const quarter = Math.floor((now.getMonth()) / 3);
    
    // Mock regime detection - in production this would use real indicators
    const regimes: MarketRegime[] = ['WINTER', 'SPRING', 'SUMMER', 'AUTUMN'];
    return regimes[quarter];
  }

  private determineSignal(compositeValue: number): 'bullish' | 'bearish' | 'neutral' {
    if (compositeValue > 2) return 'bullish';
    if (compositeValue < -2) return 'bearish';
    return 'neutral';
  }

  getSingleActionableInsight(): ActionableInsight {
    if (!this.currentData) {
      return {
        actionText: 'Z-Score analysis unavailable',
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
        actionText: `Extreme Z-Score (${composite.value.toFixed(2)}σ) signals significant market deviation`,
        signalStrength: Math.min(absValue * 25, 100),
        marketAction: composite.value > 0 ? 'BUY' : 'SELL',
        confidence: 'HIGH',
        timeframe: 'IMMEDIATE'
      };
    }
    
    if (absValue > 2) {
      return {
        actionText: `Notable Z-Score (${composite.value.toFixed(2)}σ) indicates potential opportunity`,
        signalStrength: absValue * 20,
        marketAction: composite.value > 0 ? 'BUY' : 'SELL',
        confidence: 'MED',
        timeframe: 'SHORT_TERM'
      };
    }
    
    return {
      actionText: `Z-Score (${composite.value.toFixed(2)}σ) within normal range`,
      signalStrength: 30,
      marketAction: 'HOLD',
      confidence: 'MED',
      timeframe: 'MEDIUM_TERM'
    };
  }

  getDashboardData(): DashboardTileData {
    return this.getDashboardTile();
  }

  getDashboardTile(): DashboardTileData {
    if (!this.currentData) {
      return {
        title: 'Enhanced Z-Score Engine V6',
        primaryMetric: 'N/A',
        secondaryMetric: 'Calculating...',
        status: 'warning',
        trend: 'neutral',
        loading: true
      };
    }

    const { composite } = this.currentData;
    const formatted = composite.value >= 0 ? 
      `+${composite.value.toFixed(2)}σ` : 
      `${composite.value.toFixed(2)}σ`;
    
    let status: 'normal' | 'warning' | 'critical';
    if (Math.abs(composite.value) > 3) status = 'critical';
    else if (Math.abs(composite.value) > 2) status = 'warning';
    else status = 'normal';

    const trend = composite.value > 0 ? 'up' : composite.value < 0 ? 'down' : 'neutral';

    return {
      title: 'Enhanced Z-Score Engine V6',
      primaryMetric: formatted,
      secondaryMetric: `${composite.regime} (${(composite.confidence * 100).toFixed(0)}%)`,
      status,
      trend,
      actionText: this.getSingleActionableInsight().actionText,
      loading: false
    };
  }

  getIntelligenceView(): IntelligenceViewData {
    if (!this.currentData) {
      return {
        title: 'Enhanced Z-Score Engine V6',
        status: 'offline',
        primaryMetrics: {},
        sections: [],
        confidence: 0,
        lastUpdate: new Date()
      };
    }

    const { composite, dataQuality, multiTimeframe, distribution } = this.currentData;

    return {
      title: 'Enhanced Z-Score Engine V6',
      status: 'active',
      primaryMetrics: {
        compositeZScore: {
          value: composite.value,
          label: 'Composite Z-Score',
          status: Math.abs(composite.value) > 3 ? 'critical' : 
                 Math.abs(composite.value) > 2 ? 'warning' : 'normal',
          trend: composite.value > 0 ? 'up' : composite.value < 0 ? 'down' : 'neutral'
        },
        regime: {
          value: composite.regime,
          label: 'Market Regime',
          status: 'normal'
        },
        confidence: {
          value: `${(composite.confidence * 100).toFixed(1)}%`,
          label: 'Confidence',
          status: composite.confidence > 0.8 ? 'normal' : 'warning'
        }
      },
      sections: [
        {
          title: 'Multi-Timeframe Analysis',
          data: multiTimeframe.reduce((acc, calc) => {
            acc[calc.window.period] = {
              value: calc.zscore,
              label: `${calc.window.period} Z-Score`,
              unit: 'σ',
              status: calc.isExtreme ? 'critical' : 'normal'
            };
            return acc;
          }, {} as Record<string, any>)
        },
        {
          title: 'Distribution Analysis',
          data: {
            skewness: {
              value: distribution.skewness,
              label: 'Skewness',
              status: Math.abs(distribution.skewness) > 1 ? 'warning' : 'normal'
            },
            kurtosis: {
              value: distribution.kurtosis,
              label: 'Kurtosis',
              status: Math.abs(distribution.kurtosis) > 3 ? 'warning' : 'normal'
            },
            outliers: {
              value: distribution.outlierCount,
              label: 'Outliers Removed',
              unit: 'points'
            }
          }
        },
        {
          title: 'Data Quality',
          data: {
            completeness: {
              value: `${(dataQuality.completeness * 100).toFixed(1)}%`,
              label: 'Completeness',
              status: dataQuality.completeness > 0.9 ? 'normal' : 'warning'
            },
            freshness: {
              value: `${(dataQuality.freshness * 100).toFixed(1)}%`,
              label: 'Freshness',
              status: dataQuality.freshness > 0.8 ? 'normal' : 'warning'
            },
            accuracy: {
              value: `${(dataQuality.accuracy * 100).toFixed(1)}%`,
              label: 'Accuracy',
              status: dataQuality.accuracy > 0.95 ? 'normal' : 'warning'
            }
          }
        }
      ],
      confidence: composite.confidence,
      lastUpdate: this.currentData.lastUpdate
    };
  }

  getDetailedModal(): DetailedModalData {
    if (!this.currentData) {
      return {
        title: 'Enhanced Z-Score Engine V6',
        description: 'Multi-timeframe statistical analysis engine for market regime detection',
        keyInsights: ['Engine offline or data unavailable'],
        detailedMetrics: []
      };
    }

    const { composite, distribution, multiTimeframe, dataQuality } = this.currentData;

    return {
      title: 'Enhanced Z-Score Engine V6',
      description: 'Advanced multi-timeframe Z-Score analysis with regime detection and institutional insights',
      keyInsights: [
        `Composite Z-Score: ${composite.value.toFixed(3)}σ (${composite.regime} regime)`,
        `Confidence Level: ${(composite.confidence * 100).toFixed(1)}%`,
        `Distribution Skewness: ${distribution.skewness.toFixed(3)}`,
        `Data Quality Score: ${((dataQuality.completeness + dataQuality.freshness + dataQuality.accuracy) / 3 * 100).toFixed(0)}%`
      ],
      detailedMetrics: [
        {
          category: 'Composite Analysis',
          metrics: {
            'Composite Z-Score': {
              value: composite.value,
              description: 'Weighted average of multi-timeframe Z-scores',
              calculation: 'Σ(weight × z-score × confidence) / Σ(weight × confidence)',
              significance: Math.abs(composite.value) > 3 ? 'high' : Math.abs(composite.value) > 2 ? 'medium' : 'low'
            },
            'Market Regime': {
              value: composite.regime,
              description: 'Current market regime classification',
              significance: 'high'
            },
            'Regime Confidence': {
              value: `${(composite.confidence * 100).toFixed(1)}%`,
              description: 'Statistical confidence in regime classification',
              significance: composite.confidence > 0.8 ? 'high' : 'medium'
            }
          }
        },
        {
          category: 'Multi-Timeframe Breakdown',
          metrics: multiTimeframe.reduce((acc, calc) => {
            acc[`${calc.window.period} Z-Score`] = {
              value: calc.zscore,
              description: `Z-Score for ${calc.window.days}-day window`,
              calculation: '(current - mean) / standard_deviation',
              significance: calc.isExtreme ? 'high' : 'medium'
            };
            return acc;
          }, {} as Record<string, any>)
        },
        {
          category: 'Distribution Statistics',
          metrics: {
            'Skewness': {
              value: distribution.skewness,
              description: 'Measure of distribution asymmetry',
              significance: Math.abs(distribution.skewness) > 1 ? 'high' : 'low'
            },
            'Kurtosis': {
              value: distribution.kurtosis,
              description: 'Measure of distribution tail heaviness',
              significance: Math.abs(distribution.kurtosis) > 3 ? 'high' : 'low'
            },
            'Extreme Values': {
              value: distribution.extremeValues.length,
              description: 'Number of statistical outliers detected',
              significance: 'medium'
            }
          }
        },
        {
          category: 'Performance Metrics',
          metrics: {
            'Calculation Time': {
              value: `${this.lastCalculationTime}ms`,
              description: 'Time taken for last calculation',
              significance: 'low'
            },
            'Cache Hit Rate': {
              value: this.currentData.cacheHit ? '100%' : '0%',
              description: 'Percentage of requests served from cache',
              significance: 'low'
            },
            'Data Sources': {
              value: dataQuality.sourceCount,
              description: 'Number of data sources used',
              significance: 'medium'
            }
          }
        }
      ],
      historicalContext: {
        period: '2 Years',
        comparison: 'Current Z-Score vs historical distribution',
        significance: 'Multi-timeframe analysis provides robust statistical foundation'
      },
      actionItems: [
        {
          priority: Math.abs(composite.value) > 3 ? 'high' : 'medium',
          action: 'Monitor for regime transition signals',
          timeframe: 'Next 1-7 days'
        },
        {
          priority: 'medium',
          action: 'Review portfolio positioning relative to current regime',
          timeframe: 'Within 24 hours'
        },
        {
          priority: 'low',
          action: 'Update risk management parameters',
          timeframe: 'Next week'
        }
      ]
    };
  }

  // Backward compatibility
  getDetailedView(): DetailedEngineView {
    const modal = this.getDetailedModal();
    
    return {
      title: modal.title,
      primarySection: {
        title: 'Key Metrics',
        metrics: {
          'Composite Z-Score': this.currentData?.composite.value.toFixed(3) || 'N/A',
          'Market Regime': this.currentData?.composite.regime || 'Unknown',
          'Confidence': this.currentData ? `${(this.currentData.composite.confidence * 100).toFixed(1)}%` : 'N/A'
        }
      },
      sections: modal.detailedMetrics.map(category => ({
        title: category.category,
        metrics: Object.entries(category.metrics).reduce((acc, [key, metric]) => {
          acc[key] = typeof metric.value === 'number' ? metric.value.toFixed(3) : metric.value;
          return acc;
        }, {} as Record<string, string | number>)
      })),
      alerts: modal.actionItems?.map(item => ({
        severity: item.priority === 'high' ? 'critical' as const : 
                 item.priority === 'medium' ? 'warning' as const : 'info' as const,
        message: `${item.action} (${item.timeframe})`
      }))
    };
  }

  // Performance monitoring
  getPerformanceMetrics() {
    return {
      lastUpdateTime: this.currentData?.lastUpdate || new Date(),
      processingTime: this.lastCalculationTime,
      successRate: this.getState().lastReport?.success ? 100 : 0,
      dataFreshness: this.currentData?.dataQuality.freshness || 0,
      indicatorsProcessed: this.currentData?.multiTimeframe.length || 0,
      cacheHitRate: this.currentData?.cacheHit ? 100 : 0,
      distributionAnalysisTime: Math.floor(this.lastCalculationTime * 0.3) // Estimate
    };
  }
}