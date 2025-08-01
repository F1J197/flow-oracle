import { BaseEngine, EngineConfig, EngineOutput, Alert } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'funding-stress',
  name: 'Funding Stress Engine',
  pillar: 1,
  priority: 80,
  updateInterval: 300000, // 5 minutes
  requiredIndicators: ['SOFR', 'EFFR', 'DGS3MO', 'DGS10', 'BAMLH0A0HYM2'],
  dependencies: ['credit-stress']
};

interface FundingMetrics {
  sofrSpread: number;
  termStructure: number;
  creditSpread: number;
  fundingPressure: number;
  stressLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  liquidityRisk: number;
}

export class FundingStressEngine extends BaseEngine {
  private readonly STRESS_THRESHOLDS = {
    sofrSpread: { moderate: 0.10, high: 0.25, extreme: 0.50 },
    termStructure: { inverted: -0.5, steep: 2.0 },
    creditSpread: { moderate: 300, high: 500, extreme: 800 }
  };

  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    const sofr = this.extractLatestValue(data.get('SOFR'));
    const effr = this.extractLatestValue(data.get('EFFR'));
    const dgs3mo = this.extractLatestValue(data.get('DGS3MO'));
    const dgs10 = this.extractLatestValue(data.get('DGS10'));
    const creditSpread = this.extractLatestValue(data.get('BAMLH0A0HYM2'));

    if (!sofr || !effr) return this.getDefaultOutput();

    const metrics = this.calculateFundingMetrics(sofr, effr, dgs3mo, dgs10, creditSpread);
    const stressSignal = this.assessFundingStress(metrics);
    const alerts = this.generateFundingAlerts(metrics);

    return {
      primaryMetric: {
        value: metrics.fundingPressure,
        change24h: this.calculateChange(data, 'SOFR'),
        changePercent: ((sofr - effr) / effr) * 100
      },
      signal: stressSignal,
      confidence: this.calculateConfidence(metrics),
      analysis: this.generateAnalysis(metrics),
      subMetrics: {
        sofrEffrSpread: metrics.sofrSpread,
        termStructure: metrics.termStructure,
        creditSpread: metrics.creditSpread,
        stressLevel: metrics.stressLevel,
        liquidityRisk: metrics.liquidityRisk,
        fundingConditions: this.assessFundingConditions(metrics),
        riskFactors: this.identifyRiskFactors(metrics)
      },
      alerts
    };
  }

  private calculateFundingMetrics(
    sofr: number, 
    effr: number, 
    dgs3mo: number = 5.0, 
    dgs10: number = 4.5, 
    creditSpread: number = 350
  ): FundingMetrics {
    const sofrSpread = (sofr - effr) * 100; // basis points
    const termStructure = dgs10 - dgs3mo; // yield curve slope
    
    // Calculate composite funding pressure (0-100)
    let fundingPressure = 0;
    
    // SOFR-EFFR spread component (40% weight)
    if (Math.abs(sofrSpread) > this.STRESS_THRESHOLDS.sofrSpread.extreme * 100) {
      fundingPressure += 40;
    } else if (Math.abs(sofrSpread) > this.STRESS_THRESHOLDS.sofrSpread.high * 100) {
      fundingPressure += 30;
    } else if (Math.abs(sofrSpread) > this.STRESS_THRESHOLDS.sofrSpread.moderate * 100) {
      fundingPressure += 15;
    }
    
    // Credit spread component (35% weight)
    if (creditSpread > this.STRESS_THRESHOLDS.creditSpread.extreme) {
      fundingPressure += 35;
    } else if (creditSpread > this.STRESS_THRESHOLDS.creditSpread.high) {
      fundingPressure += 25;
    } else if (creditSpread > this.STRESS_THRESHOLDS.creditSpread.moderate) {
      fundingPressure += 10;
    }
    
    // Term structure component (25% weight)
    if (termStructure < this.STRESS_THRESHOLDS.termStructure.inverted) {
      fundingPressure += 25; // Inverted curve = stress
    } else if (termStructure > this.STRESS_THRESHOLDS.termStructure.steep) {
      fundingPressure += 10; // Very steep = potential stress
    }

    // Determine stress level
    let stressLevel: FundingMetrics['stressLevel'] = 'LOW';
    if (fundingPressure > 70) stressLevel = 'EXTREME';
    else if (fundingPressure > 50) stressLevel = 'HIGH';
    else if (fundingPressure > 25) stressLevel = 'MODERATE';

    // Calculate liquidity risk (0-100)
    const liquidityRisk = Math.min(100, 
      (Math.abs(sofrSpread) / 0.5) * 50 + 
      (creditSpread / 1000) * 50
    );

    return {
      sofrSpread,
      termStructure,
      creditSpread,
      fundingPressure,
      stressLevel,
      liquidityRisk
    };
  }

  private assessFundingStress(metrics: FundingMetrics): EngineOutput['signal'] {
    if (metrics.stressLevel === 'EXTREME') return 'RISK_OFF';
    if (metrics.stressLevel === 'HIGH') return 'WARNING';
    if (metrics.stressLevel === 'MODERATE') return 'WARNING';
    if (metrics.fundingPressure < 10) return 'RISK_ON';
    return 'NEUTRAL';
  }

  private calculateConfidence(metrics: FundingMetrics): number {
    let confidence = 60; // Base confidence
    
    // Higher confidence with clearer stress signals
    if (metrics.stressLevel === 'EXTREME' || metrics.stressLevel === 'LOW') {
      confidence += 20;
    }
    
    // Adjust for spread magnitude
    confidence += Math.min(15, Math.abs(metrics.sofrSpread));
    
    return Math.min(100, confidence);
  }

  private generateAnalysis(metrics: FundingMetrics): string {
    const { stressLevel, sofrSpread, termStructure, fundingPressure } = metrics;
    
    const storybook: Record<string, string> = {
      'EXTREME': `CRITICAL FUNDING STRESS! SOFR-EFFR spread at ${sofrSpread.toFixed(1)}bp indicates severe money market dislocation. Emergency liquidity measures may be required.`,
      'HIGH': `High funding stress detected. SOFR-EFFR spread of ${sofrSpread.toFixed(1)}bp suggests significant money market pressure. Monitor for escalation.`,
      'MODERATE': `Moderate funding pressure building. Spread at ${sofrSpread.toFixed(1)}bp with ${termStructure.toFixed(1)}% term structure. Watch for deterioration.`,
      'LOW': `Funding conditions stable. SOFR-EFFR spread contained at ${sofrSpread.toFixed(1)}bp. Money markets functioning normally.`
    };

    let analysis = storybook[stressLevel] || `Funding stress: ${stressLevel}`;
    
    if (termStructure < -0.5) {
      analysis += ` YIELD CURVE INVERSION: ${termStructure.toFixed(1)}% signals recession risk.`;
    }
    
    return analysis;
  }

  private assessFundingConditions(metrics: FundingMetrics): string {
    if (metrics.stressLevel === 'EXTREME') return 'CRISIS';
    if (metrics.stressLevel === 'HIGH') return 'STRESSED';
    if (metrics.stressLevel === 'MODERATE') return 'TIGHTENING';
    if (metrics.fundingPressure < 5) return 'ACCOMMODATIVE';
    return 'NORMAL';
  }

  private identifyRiskFactors(metrics: FundingMetrics): string[] {
    const factors: string[] = [];
    
    if (Math.abs(metrics.sofrSpread) > 25) {
      factors.push('MONEY_MARKET_DISLOCATION');
    }
    
    if (metrics.termStructure < -0.5) {
      factors.push('YIELD_CURVE_INVERSION');
    }
    
    if (metrics.creditSpread > 500) {
      factors.push('CREDIT_STRESS');
    }
    
    if (metrics.liquidityRisk > 70) {
      factors.push('LIQUIDITY_SHORTAGE');
    }
    
    return factors;
  }

  private calculateChange(data: Map<string, any>, indicator: string): number {
    const values = data.get(indicator);
    if (!Array.isArray(values) || values.length < 2) return 0;
    
    const current = values[values.length - 1].value;
    const previous = values[values.length - 2].value;
    return current - previous;
  }

  private generateFundingAlerts(metrics: FundingMetrics): Alert[] {
    const alerts: Alert[] = [];

    if (metrics.stressLevel === 'EXTREME') {
      alerts.push({
        level: 'critical',
        message: `CRITICAL: Funding stress extreme - SOFR spread ${metrics.sofrSpread.toFixed(1)}bp`,
        timestamp: Date.now()
      });
    }

    if (Math.abs(metrics.sofrSpread) > 50) {
      alerts.push({
        level: 'warning',
        message: `Large SOFR-EFFR spread: ${metrics.sofrSpread.toFixed(1)}bp indicates money market stress`,
        timestamp: Date.now()
      });
    }

    if (metrics.termStructure < -0.5) {
      alerts.push({
        level: 'warning',
        message: `Yield curve inversion: ${metrics.termStructure.toFixed(1)}% signals recession risk`,
        timestamp: Date.now()
      });
    }

    return alerts;
  }

  validateData(data: Map<string, any>): boolean {
    const required = ['SOFR', 'EFFR'];
    return required.every(indicator => {
      const value = data.get(indicator);
      return value !== undefined && value !== null;
    });
  }
}