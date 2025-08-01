export interface EngineConfig {
  id: string;
  name: string;
  pillar: string;
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
  confidence: number;
  analysis: string;
  subMetrics: Record<string, any>;
  alerts?: Alert[];
}

export interface Alert {
  level: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

export abstract class BaseEngine {
  protected config: EngineConfig;
  protected lastUpdate: number = 0;
  protected engineOutputs: Map<string, EngineOutput> = new Map();

  constructor(config: EngineConfig) {
    this.config = config;
  }

  abstract calculate(data: Map<string, any>): EngineOutput;
  abstract validateData(data: Map<string, any>): boolean;

  protected extractLatestValue(data: any): number | null {
    if (!data) return null;
    if (typeof data === 'number') return data;
    if (Array.isArray(data) && data.length > 0) {
      const latest = data[data.length - 1];
      return typeof latest === 'object' ? latest.value : latest;
    }
    return null;
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
}