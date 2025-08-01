/**
 * Base Engine Class - Single Source of Truth
 * All engines must extend this class
 */

export interface EngineConfig {
  id: string;
  name: string;
  pillar: number;
  priority: number;
  updateInterval: number;
  requiredIndicators: string[];
  dependencies?: string[];
}

export interface EngineOutput {
  primaryMetric: {
    value: number;
    change24h: number;
    changePercent: number;
  };
  signal: 'RISK_ON' | 'RISK_OFF' | 'NEUTRAL' | 'WARNING';
  confidence: number; // 0-100
  analysis: string;
  subMetrics: Record<string, any>;
  alerts?: Alert[];
}

export interface Alert {
  level: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: number;
  engineId?: string;
}

export interface TierData {
  summary: string;
  metrics: Record<string, any>;
  charts?: any[];
  insights?: string[];
}

export interface ConfidenceComponent {
  type: 'SIGNAL_STRENGTH' | 'DATA_QUALITY' | 'REGIME_CLARITY' | 'HISTORICAL_ACCURACY';
  value: number;
}

export abstract class BaseEngine {
  protected config: EngineConfig;
  protected lastUpdate: number = 0;
  protected historicalData: Map<string, any[]> = new Map();
  protected engineOutputs: Map<string, EngineOutput> = new Map();
  
  constructor(config: EngineConfig) {
    this.config = config;
  }
  
  // MUST BE IMPLEMENTED BY EACH ENGINE
  abstract calculate(data: Map<string, any>): EngineOutput;
  abstract validateData(data: Map<string, any>): boolean;
  
  // 3-TIER PROGRESSIVE DEPTH - PHASE 1 SPECIFICATION
  getTier1Data(): TierData {  // 30-second executive decision view
    const latestOutput = this.getLatestOutput();
    return {
      summary: `${this.config.name}: ${latestOutput?.signal || 'NEUTRAL'}`,
      metrics: {
        primaryValue: latestOutput?.primaryMetric.value || 0,
        signal: latestOutput?.signal || 'NEUTRAL',
        confidence: latestOutput?.confidence || 0,
        lastUpdate: new Date().toISOString()
      },
      insights: latestOutput ? [latestOutput.analysis] : ['No data available']
    };
  }
  
  getTier2Data(): TierData {  // Supporting calculations & context
    const latestOutput = this.getLatestOutput();
    return {
      summary: `${this.config.name} Detailed Analysis`,
      metrics: {
        ...latestOutput?.subMetrics || {},
        change24h: latestOutput?.primaryMetric.change24h || 0,
        changePercent: latestOutput?.primaryMetric.changePercent || 0,
        dataQuality: this.calculateDataQuality(),
        updateFrequency: `${this.config.updateInterval / 1000}s`
      },
      charts: this.generateTier2Charts(),
      insights: this.generateTier2Insights()
    };
  }
  
  getTier3Data(): TierData {  // Full transparency with formulas
    const latestOutput = this.getLatestOutput();
    return {
      summary: `${this.config.name} Complete Technical Breakdown`,
      metrics: {
        ...this.getAllCalculationMetrics(),
        rawInputs: this.getRawInputData(),
        historicalDataPoints: this.historicalData.size,
        dependencies: this.config.dependencies || [],
        algorithmParameters: this.getAlgorithmParameters()
      },
      charts: this.generateTier3Charts(),
      insights: [
        ...this.generateTechnicalExplanation(),
        ...this.generateFormulaBreakdown(),
        ...this.generateDataSourceInfo()
      ]
    };
  }
  
  // SHARED UTILITY METHODS
  protected extractLatestValue(data: any): number | null {
    if (!data) return null;
    if (typeof data === 'number') return data;
    if (Array.isArray(data) && data.length > 0) {
      const latest = data[data.length - 1];
      return typeof latest === 'object' ? latest.value : latest;
    }
    return null;
  }
  
  protected calculateZScore(value: number, data: number[], periods: number): number {
    if (data.length < periods) return 0;
    const subset = data.slice(-periods);
    const mean = subset.reduce((a, b) => a + b, 0) / periods;
    const variance = subset.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / periods;
    const stdDev = Math.sqrt(variance);
    return stdDev === 0 ? 0 : (value - mean) / stdDev;
  }
  
  protected calculateStandardConfidence(components: ConfidenceComponent[]): number {
    let confidence = 50; // Base confidence
    
    components.forEach(comp => {
      switch (comp.type) {
        case 'SIGNAL_STRENGTH':
          confidence += comp.value * 20;
          break;
        case 'DATA_QUALITY':
          confidence += (comp.value > 0.8 ? 10 : -10);
          break;
        case 'REGIME_CLARITY':
          confidence += comp.value * 15;
          break;
        case 'HISTORICAL_ACCURACY':
          confidence += (comp.value - 0.5) * 30;
          break;
      }
    });
    
    return Math.max(0, Math.min(100, confidence));
  }
  
  protected getDefaultOutput(): EngineOutput {
    return {
      primaryMetric: { value: 0, change24h: 0, changePercent: 0 },
      signal: 'NEUTRAL',
      confidence: 0,
      analysis: 'Insufficient data',
      subMetrics: {}
    };
  }
  
  // ERROR BOUNDARIES
  protected wrapCalculation<T>(calculation: () => T, fallback: T): T {
    try {
      return calculation();
    } catch (error) {
      console.error(`[${this.config.id}] Calculation error:`, error);
      return fallback;
    }
  }
  
  protected validateNumeric(value: any, fallback = 0): number {
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? fallback : num;
  }
  
  // 3-TIER PROGRESSIVE DEPTH - HELPER METHODS
  protected getLatestOutput(): EngineOutput | null {
    return this.engineOutputs.get(this.config.id) || null;
  }
  
  protected calculateDataQuality(): number {
    // Calculate data quality based on freshness, completeness, consistency
    const requiredDataPresent = this.config.requiredIndicators.length;
    const actualDataPresent = Array.from(this.historicalData.keys()).length;
    const completeness = actualDataPresent / requiredDataPresent;
    
    // Factor in data freshness (last update time)
    const timeSinceUpdate = Date.now() - this.lastUpdate;
    const freshnessScore = Math.max(0, 1 - (timeSinceUpdate / (this.config.updateInterval * 2)));
    
    return Math.round((completeness * 0.7 + freshnessScore * 0.3) * 100);
  }
  
  protected generateTier2Charts(): any[] {
    // Override in subclasses to provide specific chart data
    return [{
      type: 'line',
      data: this.getHistoricalValues(),
      title: `${this.config.name} Trend`
    }];
  }
  
  protected generateTier3Charts(): any[] {
    // Override in subclasses for detailed technical charts
    return [
      ...this.generateTier2Charts(),
      {
        type: 'correlation',
        data: this.getCorrelationMatrix(),
        title: 'Input Correlation Matrix'
      }
    ];
  }
  
  protected generateTier2Insights(): string[] {
    const output = this.getLatestOutput();
    if (!output) return ['No analysis available'];
    
    return [
      output.analysis,
      `Confidence Level: ${output.confidence}%`,
      `Current Signal: ${output.signal}`,
      `Data Quality: ${this.calculateDataQuality()}%`
    ];
  }
  
  protected generateTechnicalExplanation(): string[] {
    return [
      `Engine Type: ${this.constructor.name}`,
      `Update Frequency: Every ${this.config.updateInterval / 1000} seconds`,
      `Required Indicators: ${this.config.requiredIndicators.join(', ')}`,
      `Dependencies: ${this.config.dependencies?.join(', ') || 'None'}`
    ];
  }
  
  protected generateFormulaBreakdown(): string[] {
    // Override in subclasses to provide specific formula explanations
    return [`Formula details available in ${this.constructor.name} implementation`];
  }
  
  protected generateDataSourceInfo(): string[] {
    return [
      `Data Sources: ${this.config.requiredIndicators.length} indicators`,
      `Historical Data Points: ${Array.from(this.historicalData.values()).reduce((sum, arr) => sum + arr.length, 0)}`,
      `Last Updated: ${new Date(this.lastUpdate).toISOString()}`
    ];
  }
  
  protected getAllCalculationMetrics(): Record<string, any> {
    // Override in subclasses to expose all calculation intermediates
    return {
      engineId: this.config.id,
      lastCalculation: this.lastUpdate,
      dataQuality: this.calculateDataQuality()
    };
  }
  
  protected getRawInputData(): Record<string, any> {
    const rawData: Record<string, any> = {};
    this.historicalData.forEach((values, key) => {
      rawData[key] = values.slice(-10); // Last 10 data points
    });
    return rawData;
  }
  
  protected getAlgorithmParameters(): Record<string, any> {
    // Override in subclasses to expose algorithm-specific parameters
    return {
      updateInterval: this.config.updateInterval,
      priority: this.config.priority
    };
  }
  
  protected getHistoricalValues(): Array<{timestamp: number, value: number}> {
    // Get historical values for trending
    const output = this.getLatestOutput();
    if (!output) return [];
    
    // Simulate historical data - override in subclasses with real data
    return Array.from({length: 50}, (_, i) => ({
      timestamp: Date.now() - (50 - i) * this.config.updateInterval,
      value: output.primaryMetric.value * (0.95 + Math.random() * 0.1)
    }));
  }
  
  protected getCorrelationMatrix(): Array<{indicator: string, correlation: number}> {
    // Calculate correlations between indicators - override in subclasses
    return this.config.requiredIndicators.map(indicator => ({
      indicator,
      correlation: 0.5 + Math.random() * 0.5 // Placeholder
    }));
  }

  // Getters
  get id(): string { return this.config.id; }
  get name(): string { return this.config.name; }
  get pillar(): number { return this.config.pillar; }
  get priority(): number { return this.config.priority; }
}