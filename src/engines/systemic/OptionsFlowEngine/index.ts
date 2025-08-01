import { BaseEngine, EngineConfig, EngineOutput, Alert } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'options-flow',
  name: 'Smart Money Options Flow',
  pillar: 2,
  priority: 75,
  updateInterval: 180000, // 3 minutes
  requiredIndicators: ['VIX', 'VIX9D', 'VVIX', 'SPX'],
  dependencies: ['volatility-regime']
};

interface OptionsMetrics {
  putCallRatio: number;
  skewIndex: number;
  vixContango: number;
  smartMoneyFlow: number;
  darkPoolActivity: number;
  whaleAlert: boolean;
  flowDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export class OptionsFlowEngine extends BaseEngine {
  private readonly SMART_MONEY_THRESHOLDS = {
    putCall: { extreme: 1.5, elevated: 1.2, normal: 0.8 },
    skew: { high: 20, moderate: 15, low: 10 },
    contango: { steep: 2.0, normal: 0.5, backwardation: -0.5 }
  };

  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    const vix = this.extractLatestValue(data.get('VIX'));
    const vix9d = this.extractLatestValue(data.get('VIX9D'));
    const vvix = this.extractLatestValue(data.get('VVIX'));
    const spx = this.extractLatestValue(data.get('SPX'));

    if (!vix || !spx) return this.getDefaultOutput();

    const metrics = this.calculateOptionsMetrics(vix, vix9d, vvix, spx);
    const smartMoneySignal = this.interpretSmartMoney(metrics);
    const alerts = this.generateOptionsAlerts(metrics);

    return {
      primaryMetric: {
        value: metrics.smartMoneyFlow,
        change24h: this.calculateFlowChange(metrics),
        changePercent: metrics.putCallRatio
      },
      signal: smartMoneySignal,
      confidence: this.calculateConfidence(metrics),
      analysis: this.generateAnalysis(metrics),
      subMetrics: {
        putCallRatio: metrics.putCallRatio,
        skewIndex: metrics.skewIndex,
        vixContango: metrics.vixContango,
        darkPoolActivity: metrics.darkPoolActivity,
        whaleAlert: metrics.whaleAlert,
        flowDirection: metrics.flowDirection,
        optionsFlow: {
          callVolume: this.calculateCallVolume(metrics),
          putVolume: this.calculatePutVolume(metrics),
          netFlow: metrics.smartMoneyFlow,
          unusualActivity: this.detectUnusualActivity(metrics)
        },
        marketStructure: {
          skew: metrics.skewIndex,
          termStructure: metrics.vixContango,
          volatilityRisk: this.assessVolatilityRisk(vix, vvix)
        }
      },
      alerts
    };
  }

  private calculateOptionsMetrics(vix: number, vix9d: number = vix, vvix: number = 90, spx: number): OptionsMetrics {
    // Mock calculations for options flow - in production would use real options data
    
    // Put/Call Ratio (mock based on VIX levels)
    const putCallRatio = vix > 25 ? 1.3 + Math.random() * 0.4 : 
                        vix > 20 ? 1.0 + Math.random() * 0.3 :
                        0.7 + Math.random() * 0.3;

    // Options Skew Index (mock)
    const skewIndex = Math.max(5, Math.min(25, 
      15 + (vix - 20) * 0.5 + (Math.random() - 0.5) * 5
    ));

    // VIX Contango (VIX9D - VIX)
    const vixContango = vix9d - vix;

    // Smart Money Flow Score (-100 to 100)
    let smartMoneyFlow = 0;
    
    // High put/call ratio suggests smart money hedging
    if (putCallRatio > this.SMART_MONEY_THRESHOLDS.putCall.extreme) {
      smartMoneyFlow -= 30;
    } else if (putCallRatio > this.SMART_MONEY_THRESHOLDS.putCall.elevated) {
      smartMoneyFlow -= 15;
    }
    
    // High skew suggests institutional demand for downside protection
    if (skewIndex > this.SMART_MONEY_THRESHOLDS.skew.high) {
      smartMoneyFlow -= 25;
    } else if (skewIndex < this.SMART_MONEY_THRESHOLDS.skew.low) {
      smartMoneyFlow += 15;
    }
    
    // VIX contango interpretation
    if (vixContango > this.SMART_MONEY_THRESHOLDS.contango.steep) {
      smartMoneyFlow += 20; // Complacency
    } else if (vixContango < this.SMART_MONEY_THRESHOLDS.contango.backwardation) {
      smartMoneyFlow -= 25; // Fear structure
    }

    // Dark pool activity (mock)
    const darkPoolActivity = Math.max(0, Math.min(100, 
      50 + (Math.random() - 0.5) * 30 + (vix - 20) * 2
    ));

    // Whale alert detection
    const whaleAlert = Math.abs(smartMoneyFlow) > 40 && Math.random() > 0.7;

    // Flow direction
    let flowDirection: OptionsMetrics['flowDirection'] = 'NEUTRAL';
    if (smartMoneyFlow > 25) flowDirection = 'BULLISH';
    else if (smartMoneyFlow < -25) flowDirection = 'BEARISH';

    return {
      putCallRatio,
      skewIndex,
      vixContango,
      smartMoneyFlow,
      darkPoolActivity,
      whaleAlert,
      flowDirection
    };
  }

  private interpretSmartMoney(metrics: OptionsMetrics): EngineOutput['signal'] {
    const { smartMoneyFlow, whaleAlert, flowDirection } = metrics;

    if (whaleAlert && Math.abs(smartMoneyFlow) > 50) return 'WARNING';
    if (flowDirection === 'BULLISH' && smartMoneyFlow > 30) return 'RISK_ON';
    if (flowDirection === 'BEARISH' && smartMoneyFlow < -30) return 'RISK_OFF';
    if (metrics.putCallRatio > this.SMART_MONEY_THRESHOLDS.putCall.extreme) return 'WARNING';
    
    return 'NEUTRAL';
  }

  private calculateConfidence(metrics: OptionsMetrics): number {
    let confidence = 60;

    // Higher confidence with extreme readings
    confidence += Math.min(25, Math.abs(metrics.smartMoneyFlow) * 0.5);
    
    // Whale alerts increase confidence
    if (metrics.whaleAlert) confidence += 15;
    
    // Clear directional flow increases confidence
    if (metrics.flowDirection !== 'NEUTRAL') confidence += 10;

    return Math.min(100, confidence);
  }

  private generateAnalysis(metrics: OptionsMetrics): string {
    const { flowDirection, smartMoneyFlow, putCallRatio, skewIndex, whaleAlert } = metrics;

    let analysis = '';

    if (whaleAlert) {
      analysis += `🐋 WHALE ALERT: Large institutional ${flowDirection.toLowerCase()} flow detected. `;
    }

    const flowStorybook: Record<string, string> = {
      'BULLISH': `Smart money showing bullish conviction with ${smartMoneyFlow.toFixed(0)} flow score. Put/call ratio: ${putCallRatio.toFixed(2)}. Skew: ${skewIndex.toFixed(1)}%.`,
      'BEARISH': `Smart money defensive positioning with ${smartMoneyFlow.toFixed(0)} flow score. Elevated put buying and ${skewIndex.toFixed(1)}% skew indicates hedging demand.`,
      'NEUTRAL': `Balanced options flow. Smart money score: ${smartMoneyFlow.toFixed(0)}. Put/call ratio: ${putCallRatio.toFixed(2)} suggests neutral positioning.`
    };

    analysis += flowStorybook[flowDirection];

    // Add specific warnings
    if (putCallRatio > 1.5) {
      analysis += ` EXTREME PUT BUYING: ${putCallRatio.toFixed(2)} ratio suggests major hedging or bearish positioning.`;
    }

    if (metrics.vixContango > 2) {
      analysis += ` VIX structure in steep contango (${metrics.vixContango.toFixed(1)}) indicates complacency.`;
    } else if (metrics.vixContango < -1) {
      analysis += ` VIX backwardation (${metrics.vixContango.toFixed(1)}) signals immediate fear premium.`;
    }

    return analysis;
  }

  private calculateCallVolume(metrics: OptionsMetrics): number {
    // Mock call volume based on put/call ratio
    const totalVolume = 1000000; // Mock total volume
    return totalVolume / (1 + metrics.putCallRatio);
  }

  private calculatePutVolume(metrics: OptionsMetrics): number {
    const totalVolume = 1000000;
    return (totalVolume * metrics.putCallRatio) / (1 + metrics.putCallRatio);
  }

  private detectUnusualActivity(metrics: OptionsMetrics): string[] {
    const unusual: string[] = [];

    if (metrics.putCallRatio > 1.5) unusual.push('EXTREME_PUT_BUYING');
    if (metrics.skewIndex > 20) unusual.push('HIGH_SKEW');
    if (metrics.whaleAlert) unusual.push('WHALE_ACTIVITY');
    if (Math.abs(metrics.vixContango) > 2) unusual.push('UNUSUAL_VIX_STRUCTURE');
    if (metrics.darkPoolActivity > 80) unusual.push('HIGH_DARK_POOL');

    return unusual;
  }

  private assessVolatilityRisk(vix: number, vvix: number): string {
    if (vvix > 130 && vix > 25) return 'EXTREME';
    if (vvix > 110 || vix > 20) return 'HIGH';
    if (vvix < 80 && vix < 15) return 'LOW';
    return 'MODERATE';
  }

  private calculateFlowChange(metrics: OptionsMetrics): number {
    // Mock flow change calculation
    return metrics.smartMoneyFlow * 0.1;
  }

  private generateOptionsAlerts(metrics: OptionsMetrics): Alert[] {
    const alerts: Alert[] = [];

    if (metrics.whaleAlert) {
      alerts.push({
        level: 'warning',
        message: `🐋 WHALE ALERT: Large ${metrics.flowDirection.toLowerCase()} options flow detected`,
        timestamp: Date.now()
      });
    }

    if (metrics.putCallRatio > 1.5) {
      alerts.push({
        level: 'warning',
        message: `Extreme put buying: ${metrics.putCallRatio.toFixed(2)} put/call ratio`,
        timestamp: Date.now()
      });
    }

    if (metrics.skewIndex > 20) {
      alerts.push({
        level: 'info',
        message: `High options skew: ${metrics.skewIndex.toFixed(1)}% indicates hedging demand`,
        timestamp: Date.now()
      });
    }

    if (Math.abs(metrics.vixContango) > 2) {
      const direction = metrics.vixContango > 0 ? 'contango' : 'backwardation';
      alerts.push({
        level: 'info',
        message: `Unusual VIX structure: ${metrics.vixContango.toFixed(1)} ${direction}`,
        timestamp: Date.now()
      });
    }

    return alerts;
  }

  validateData(data: Map<string, any>): boolean {
    const required = ['VIX', 'SPX'];
    return required.every(indicator => {
      const value = data.get(indicator);
      return value !== undefined && value !== null;
    });
  }
}