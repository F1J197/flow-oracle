import { BaseEngine, EngineConfig, EngineOutput } from '@/engines/BaseEngine';

export class VolatilityRegimeEngine extends BaseEngine {
  private readonly PARAMS = {
    VOL_STATES: ['LOW_VOL', 'NORMAL', 'ELEVATED', 'STRESSED', 'CRISIS'],
    TRANSITION_MATRIX: [
      [0.85, 0.10, 0.04, 0.01, 0.00],
      [0.15, 0.70, 0.10, 0.04, 0.01],
      [0.05, 0.20, 0.50, 0.20, 0.05],
      [0.01, 0.10, 0.25, 0.50, 0.14],
      [0.00, 0.05, 0.15, 0.30, 0.50]
    ],
    EMISSION_PARAMS: {
      LOW_VOL: { mean: 12, std: 2 },
      NORMAL: { mean: 16, std: 3 },
      ELEVATED: { mean: 22, std: 4 },
      STRESSED: { mean: 35, std: 6 },
      CRISIS: { mean: 60, std: 15 }
    }
  };

  constructor() {
    const config: EngineConfig = {
      id: 'volatility-regime',
      name: 'Volatility Regime',
      pillar: 1,
      priority: 90,
      updateInterval: 300000,
      requiredIndicators: ['VIX', 'VIX9D', 'VVIX', 'REALIZED_VOL']
    };
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    try {
      // Extract volatility data
      const vix = this.extractLatestValue(data.get('VIX')) || 16;
      const vix9d = this.extractLatestValue(data.get('VIX9D')) || 16;
      const vvix = this.extractLatestValue(data.get('VVIX')) || 120;
      
      // Determine current regime
      const currentRegime = this.classifyVolatilityRegime(vix);
      const regimeStrength = this.calculateRegimeStrength(vix, vix9d, vvix);
      
      // Calculate regime signals
      const signal = this.determineSignal(currentRegime, regimeStrength);
      const confidence = this.calculateConfidence(regimeStrength, vix, vix9d);
      
      return {
        primaryMetric: {
          value: vix,
          change24h: vix - (this.extractLatestValue(data.get('VIX_PREV')) || vix),
          changePercent: ((vix - (this.extractLatestValue(data.get('VIX_PREV')) || vix)) / vix) * 100
        },
        signal,
        confidence,
        analysis: this.generateAnalysis(currentRegime, regimeStrength),
        subMetrics: {
          regime: currentRegime,
          vix9d,
          vvix,
          regimeStrength,
          termStructure: vix9d - vix
        }
      };
    } catch (error) {
      console.error('[VolatilityRegimeEngine] Calculation error:', error);
      return this.getDefaultOutput();
    }
  }

  validateData(data: Map<string, any>): boolean {
    return this.config.requiredIndicators.every(indicator => data.has(indicator));
  }

  private classifyVolatilityRegime(vix: number): string {
    if (vix < 15) return 'LOW_VOL';
    if (vix < 20) return 'NORMAL';
    if (vix < 30) return 'ELEVATED';
    if (vix < 45) return 'STRESSED';
    return 'CRISIS';
  }

  private calculateRegimeStrength(vix: number, vix9d: number, vvix: number): number {
    const termStructure = vix9d - vix;
    const volOfVol = vvix / 100;
    
    // Normalize regime strength 0-100
    const strength = Math.min(100, Math.max(0, 
      (vix / 100) * 60 + 
      (Math.abs(termStructure) / 10) * 25 + 
      (volOfVol / 2) * 15
    ));
    
    return Math.round(strength);
  }

  private determineSignal(regime: string, strength: number): 'RISK_ON' | 'RISK_OFF' | 'NEUTRAL' | 'WARNING' {
    if (regime === 'CRISIS' || (regime === 'STRESSED' && strength > 80)) {
      return 'RISK_OFF';
    }
    if (regime === 'LOW_VOL' && strength < 30) {
      return 'RISK_ON';
    }
    if (regime === 'ELEVATED' || regime === 'STRESSED') {
      return 'WARNING';
    }
    return 'NEUTRAL';
  }

  private calculateConfidence(strength: number, vix: number, vix9d: number): number {
    let confidence = 60; // Base confidence
    
    // Higher confidence for extreme regimes
    if (vix > 30 || vix < 12) confidence += 20;
    
    // Term structure clarity
    const termStructure = Math.abs(vix9d - vix);
    if (termStructure > 2) confidence += 10;
    
    // Regime strength clarity
    if (strength > 70 || strength < 30) confidence += 10;
    
    return Math.min(100, confidence);
  }

  private generateAnalysis(regime: string, strength: number): string {
    const analyses = {
      LOW_VOL: `Low volatility regime (${strength}% strength) - Markets in risk-on mode`,
      NORMAL: `Normal volatility regime (${strength}% strength) - Balanced market conditions`,
      ELEVATED: `Elevated volatility regime (${strength}% strength) - Caution warranted`,
      STRESSED: `Stressed volatility regime (${strength}% strength) - Risk-off positioning`,
      CRISIS: `Crisis volatility regime (${strength}% strength) - Maximum defensive posture`
    };
    
    return analyses[regime] || 'Volatility regime analysis unavailable';
  }
}