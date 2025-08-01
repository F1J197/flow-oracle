import { BaseEngine, EngineConfig, EngineOutput } from './BaseEngine';

const config: EngineConfig = {
  id: 'test-engine',
  name: 'Test Engine',
  pillar: 1,
  priority: 1,
  updateInterval: 5000,
  requiredIndicators: ['VIX']
};

export class TestEngine extends BaseEngine {
  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    const vix = this.extractLatestValue(data.get('VIX')) || 16;
    
    return {
      primaryMetric: {
        value: vix,
        change24h: 1.5,
        changePercent: 2.3
      },
      signal: vix > 30 ? 'RISK_OFF' : vix > 20 ? 'WARNING' : 'RISK_ON',
      confidence: 85,
      analysis: `VIX at ${vix.toFixed(2)} - Market conditions ${vix > 20 ? 'volatile' : 'stable'}`,
      subMetrics: {
        threshold: 20,
        status: vix > 20 ? 'ELEVATED' : 'NORMAL'
      }
    };
  }
  
  validateData(data: Map<string, any>): boolean {
    return data.has('VIX');
  }
}