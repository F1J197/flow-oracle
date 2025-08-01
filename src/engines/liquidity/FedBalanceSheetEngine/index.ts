import { BaseEngine, EngineConfig, EngineOutput, Alert } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'fed-balance-sheet',
  name: 'Fed Balance Sheet Engine',
  pillar: 1,
  priority: 90,
  updateInterval: 300000, // 5 minutes
  requiredIndicators: ['WALCL', 'WTREGEN', 'RRPONTSYD', 'SOFR', 'EFFR'],
  dependencies: []
};

interface BalanceSheetMetrics {
  totalAssets: number;
  weeklyChange: number;
  rateOfChange: number;
  liquidityInjection: number;
  normalizedSize: number;
  qePhase: 'QE' | 'QT' | 'NEUTRAL' | 'TRANSITION';
  significance: number;
}

export class FedBalanceSheetEngine extends BaseEngine {
  private readonly QE_THRESHOLD = 0.05; // 5% monthly growth = QE
  private readonly QT_THRESHOLD = -0.02; // 2% monthly decline = QT
  private readonly CRISIS_THRESHOLD = 8.5; // $8.5T+ = crisis levels
  
  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    const walcl = this.extractLatestValue(data.get('WALCL'));
    const wtregen = this.extractLatestValue(data.get('WTREGEN'));
    const rrpontsyd = this.extractLatestValue(data.get('RRPONTSYD'));
    
    if (!walcl) return this.getDefaultOutput();

    const metrics = this.calculateBalanceSheetMetrics(data);
    const netLiquidity = this.calculateNetLiquidity(walcl, wtregen, rrpontsyd);
    const liquidityRegime = this.determineLiquidityRegime(metrics);
    const alerts = this.generateAlerts(metrics, netLiquidity);

    return {
      primaryMetric: {
        value: walcl,
        change24h: metrics.weeklyChange,
        changePercent: metrics.rateOfChange
      },
      signal: this.determineSignal(liquidityRegime, metrics),
      confidence: this.calculateConfidence(metrics),
      analysis: this.generateAnalysis(liquidityRegime, metrics, netLiquidity),
      subMetrics: {
        netLiquidity,
        liquidityInjection: metrics.liquidityInjection,
        qePhase: metrics.qePhase,
        normalizedSize: metrics.normalizedSize,
        significance: metrics.significance,
        weeklyChangePercent: metrics.rateOfChange,
        treasuryAccount: wtregen,
        reverseRepo: rrpontsyd,
        liquidityMetrics: {
          gross: walcl,
          net: netLiquidity,
          velocity: metrics.rateOfChange,
          regime: liquidityRegime
        }
      },
      alerts
    };
  }

  private calculateBalanceSheetMetrics(data: Map<string, any>): BalanceSheetMetrics {
    const walclData = data.get('WALCL');
    if (!Array.isArray(walclData) || walclData.length < 8) {
      return {
        totalAssets: 0,
        weeklyChange: 0,
        rateOfChange: 0,
        liquidityInjection: 0,
        normalizedSize: 0,
        qePhase: 'NEUTRAL',
        significance: 0
      };
    }

    const current = walclData[walclData.length - 1].value;
    const weekAgo = walclData[walclData.length - 8].value; // ~7 days
    const monthAgo = walclData[walclData.length - 30]?.value || weekAgo;

    const weeklyChange = current - weekAgo;
    const rateOfChange = ((current - weekAgo) / weekAgo) * 100;
    const monthlyROC = monthAgo ? ((current - monthAgo) / monthAgo) * 100 : 0;

    // Determine QE/QT phase
    let qePhase: BalanceSheetMetrics['qePhase'] = 'NEUTRAL';
    if (monthlyROC > this.QE_THRESHOLD) qePhase = 'QE';
    else if (monthlyROC < this.QT_THRESHOLD) qePhase = 'QT';
    else if (Math.abs(rateOfChange) > 1) qePhase = 'TRANSITION';

    // Calculate significance (0-100)
    const significance = Math.min(100, 
      (Math.abs(rateOfChange) * 20) + 
      (current > this.CRISIS_THRESHOLD ? 30 : 0) +
      (Math.abs(monthlyROC) * 10)
    );

    return {
      totalAssets: current,
      weeklyChange,
      rateOfChange,
      liquidityInjection: weeklyChange > 0 ? weeklyChange : 0,
      normalizedSize: (current / 25) * 100, // % of GDP (rough)
      qePhase,
      significance
    };
  }

  private calculateNetLiquidity(walcl: number, wtregen: number = 0.5, rrpontsyd: number = 2.0): number {
    // Net Liquidity = Fed Assets - Treasury Account - Reverse Repo
    return walcl - wtregen - rrpontsyd;
  }

  private determineLiquidityRegime(metrics: BalanceSheetMetrics): string {
    const { qePhase, rateOfChange, totalAssets } = metrics;
    
    if (qePhase === 'QE' && rateOfChange > 2) return 'AGGRESSIVE_QE';
    if (qePhase === 'QE') return 'MODERATE_QE';
    if (qePhase === 'QT' && rateOfChange < -1) return 'AGGRESSIVE_QT';
    if (qePhase === 'QT') return 'MODERATE_QT';
    if (totalAssets > this.CRISIS_THRESHOLD) return 'CRISIS_SUPPORT';
    if (qePhase === 'TRANSITION') return 'POLICY_TRANSITION';
    
    return 'MAINTENANCE';
  }

  private determineSignal(regime: string, metrics: BalanceSheetMetrics): EngineOutput['signal'] {
    if (regime.includes('AGGRESSIVE_QE') || regime === 'CRISIS_SUPPORT') return 'RISK_ON';
    if (regime.includes('AGGRESSIVE_QT')) return 'RISK_OFF';
    if (regime === 'POLICY_TRANSITION' && metrics.significance > 70) return 'WARNING';
    if (regime.includes('QE')) return 'RISK_ON';
    if (regime.includes('QT')) return 'RISK_OFF';
    
    return 'NEUTRAL';
  }

  private calculateConfidence(metrics: BalanceSheetMetrics): number {
    // Higher confidence with clearer trends and higher significance
    let confidence = 50;
    
    confidence += Math.min(30, Math.abs(metrics.rateOfChange) * 5);
    confidence += Math.min(20, metrics.significance * 0.3);
    
    if (metrics.qePhase !== 'NEUTRAL' && metrics.qePhase !== 'TRANSITION') {
      confidence += 20;
    }
    
    return Math.min(100, confidence);
  }

  private generateAnalysis(regime: string, metrics: BalanceSheetMetrics, netLiquidity: number): string {
    const storybook: Record<string, string> = {
      'AGGRESSIVE_QE': `MASSIVE LIQUIDITY INJECTION! Fed balance sheet expanding at ${metrics.rateOfChange.toFixed(1)}% weekly rate. Net liquidity surge to $${netLiquidity.toFixed(1)}T driving risk asset rally.`,
      'MODERATE_QE': `Quantitative easing in progress. Balance sheet growth of ${metrics.rateOfChange.toFixed(1)}% supporting market liquidity. Net liquidity at $${netLiquidity.toFixed(1)}T.`,
      'AGGRESSIVE_QT': `RAPID BALANCE SHEET REDUCTION! QT accelerating at ${Math.abs(metrics.rateOfChange).toFixed(1)}% weekly pace. Liquidity drain pressuring risk assets.`,
      'MODERATE_QT': `Quantitative tightening underway. Controlled balance sheet reduction of ${Math.abs(metrics.rateOfChange).toFixed(1)}% draining market liquidity gradually.`,
      'CRISIS_SUPPORT': `CRISIS INTERVENTION MODE! Balance sheet at $${metrics.totalAssets.toFixed(1)}T - extreme levels indicating financial system stress. Emergency liquidity provision active.`,
      'POLICY_TRANSITION': `Fed policy in transition. Balance sheet volatility at ${metrics.rateOfChange.toFixed(1)}% suggests policy uncertainty. Monitor for directional clarity.`,
      'MAINTENANCE': `Balance sheet maintenance mode. Minimal policy impact with $${metrics.totalAssets.toFixed(1)}T stable positioning. Net liquidity steady at $${netLiquidity.toFixed(1)}T.`
    };

    return storybook[regime] || `Fed balance sheet at $${metrics.totalAssets.toFixed(1)}T, changing ${metrics.rateOfChange.toFixed(2)}% weekly. Net liquidity: $${netLiquidity.toFixed(1)}T.`;
  }

  private generateAlerts(metrics: BalanceSheetMetrics, netLiquidity: number): Alert[] {
    const alerts: Alert[] = [];

    if (metrics.totalAssets > this.CRISIS_THRESHOLD) {
      alerts.push({
        level: 'critical',
        message: `Fed balance sheet at crisis levels: $${metrics.totalAssets.toFixed(1)}T`,
        timestamp: Date.now()
      });
    }

    if (Math.abs(metrics.rateOfChange) > 3) {
      alerts.push({
        level: 'warning',
        message: `Extreme balance sheet volatility: ${metrics.rateOfChange.toFixed(1)}% weekly change`,
        timestamp: Date.now()
      });
    }

    if (netLiquidity < 4) {
      alerts.push({
        level: 'warning',
        message: `Net liquidity falling to $${netLiquidity.toFixed(1)}T - potential liquidity stress`,
        timestamp: Date.now()
      });
    }

    return alerts;
  }

  validateData(data: Map<string, any>): boolean {
    const required = ['WALCL'];
    return required.every(indicator => {
      const values = data.get(indicator);
      return Array.isArray(values) && values.length >= 30;
    });
  }
}