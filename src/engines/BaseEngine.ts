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

export abstract class BaseEngine {
  protected config: EngineConfig;
  protected lastUpdate: number = 0;
  protected historicalData: Map<string, any[]> = new Map();
  
  constructor(config: EngineConfig) {
    this.config = config;
  }
  
  // MUST BE IMPLEMENTED BY EACH ENGINE
  abstract calculate(data: Map<string, any>): EngineOutput;
  abstract validateData(data: Map<string, any>): boolean;
  
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
  
  protected getDefaultOutput(): EngineOutput {
    return {
      primaryMetric: { value: 0, change24h: 0, changePercent: 0 },
      signal: 'NEUTRAL',
      confidence: 0,
      analysis: 'Insufficient data',
      subMetrics: {}
    };
  }
  
  // Getters
  get id(): string { return this.config.id; }
  get name(): string { return this.config.name; }
  get pillar(): number { return this.config.pillar; }
  get priority(): number { return this.config.priority; }
}