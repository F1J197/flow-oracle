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
  
  // 3-TIER PROGRESSIVE DEPTH - DEFAULT IMPLEMENTATIONS
  getTier1Data(): TierData {  // 30-second decision view
    return {
      summary: `${this.config.name} Summary`,
      metrics: { status: 'active' }
    };
  }
  
  getTier2Data(): TierData {  // Supporting calculations  
    return {
      summary: `${this.config.name} Detailed Analysis`,
      metrics: { status: 'active', details: 'Available' }
    };
  }
  
  getTier3Data(): TierData {  // Full transparency
    return {
      summary: `${this.config.name} Complete Breakdown`,
      metrics: { status: 'active', fullData: 'Available' }
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
  
  // Getters
  get id(): string { return this.config.id; }
  get name(): string { return this.config.name; }
  get pillar(): number { return this.config.pillar; }
  get priority(): number { return this.config.priority; }
}