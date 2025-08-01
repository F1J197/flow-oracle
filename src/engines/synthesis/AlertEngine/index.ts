import { BaseEngine, EngineConfig, EngineOutput } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'alert-engine',
  name: 'Alert & Execution System',
  pillar: 5,
  priority: 95,
  updateInterval: 60000, // 1 minute
  requiredIndicators: []
};

export interface Alert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
  engineId: string;
  actionable?: boolean;
  positionSizing?: PositionSizingRecommendation;
}

export interface PositionSizingRecommendation {
  kellyOptimal: number;
  maxRisk: number;
  recommendedSize: number;
  confidence: number;
  reasoning: string;
}

export class AlertEngine extends BaseEngine {
  private alerts: Alert[] = [];
  private alertHistory: Alert[] = [];
  private maxAlerts = 50;
  
  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    // Process all engine outputs to generate alerts
    const activeAlerts = this.processEngineOutputsForAlerts(data);
    
    // Calculate aggregate alert severity
    const criticalCount = activeAlerts.filter(a => a.level === 'critical').length;
    const warningCount = activeAlerts.filter(a => a.level === 'warning').length;
    
    // Determine overall system alert level
    const systemAlertLevel = this.determineSystemAlertLevel(criticalCount, warningCount);
    const confidence = this.calculateAlertConfidence(activeAlerts);
    
    // Generate position sizing recommendations for actionable alerts
    const positionRecommendations = this.generatePositionRecommendations(activeAlerts);
    
    return {
      primaryMetric: {
        value: activeAlerts.length,
        change24h: activeAlerts.length - this.getYesterdayAlertCount(),
        changePercent: this.calculateAlertChangePercent()
      },
      signal: systemAlertLevel,
      confidence,
      analysis: this.generateAlertAnalysis(activeAlerts, systemAlertLevel),
      subMetrics: {
        totalAlerts: activeAlerts.length,
        criticalAlerts: criticalCount,
        warningAlerts: warningCount,
        infoAlerts: activeAlerts.filter(a => a.level === 'info').length,
        actionableAlerts: activeAlerts.filter(a => a.actionable).length,
        systemAlertLevel,
        positionRecommendations,
        alertHistory: this.alertHistory.slice(-10)
      }
    };
  }

  private processEngineOutputsForAlerts(data: Map<string, any>): Alert[] {
    const alerts: Alert[] = [];
    
    // Check each engine output for alert conditions
    for (const [engineId, output] of data.entries()) {
      if (engineId.startsWith('ENGINE_') && output && typeof output === 'object') {
        const engineOutput = output as EngineOutput;
        
        // Critical conditions
        if (engineOutput.confidence < 30) {
          alerts.push(this.createAlert(
            'critical',
            `${engineId} confidence critically low: ${engineOutput.confidence}%`,
            engineId.replace('ENGINE_', ''),
            true
          ));
        }
        
        // Signal-based alerts
        if (engineOutput.signal === 'RISK_OFF') {
          alerts.push(this.createAlert(
            'warning',
            `${engineId} generating RISK_OFF signal`,
            engineId.replace('ENGINE_', ''),
            true
          ));
        }
        
        // Extreme value alerts
        if (Math.abs(engineOutput.primaryMetric.changePercent) > 20) {
          alerts.push(this.createAlert(
            'warning',
            `${engineId} extreme move: ${engineOutput.primaryMetric.changePercent.toFixed(2)}%`,
            engineId.replace('ENGINE_', ''),
            true
          ));
        }
      }
    }
    
    return alerts;
  }

  private createAlert(
    level: Alert['level'],
    message: string,
    engineId: string,
    actionable = false
  ): Alert {
    const alert: Alert = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      timestamp: Date.now(),
      engineId,
      actionable
    };
    
    if (actionable) {
      alert.positionSizing = this.calculateKellyOptimal(level, engineId);
    }
    
    return alert;
  }

  private calculateKellyOptimal(alertLevel: Alert['level'], engineId: string): PositionSizingRecommendation {
    // Kelly Criterion: f* = (bp - q) / b
    // Where: b = odds, p = probability of win, q = probability of loss
    
    const riskParams = this.getRiskParameters(alertLevel);
    const winRate = riskParams.winProbability;
    const avgWin = riskParams.avgWin;
    const avgLoss = riskParams.avgLoss;
    
    const kelly = (winRate * avgWin - (1 - winRate) * avgLoss) / avgWin;
    const kellyOptimal = Math.max(0, Math.min(0.25, kelly)); // Cap at 25%
    
    // Conservative sizing
    const recommendedSize = kellyOptimal * 0.5; // Half-Kelly for safety
    
    return {
      kellyOptimal,
      maxRisk: 0.02, // 2% max risk per position
      recommendedSize,
      confidence: this.calculateSizingConfidence(alertLevel),
      reasoning: `Kelly optimal: ${(kellyOptimal * 100).toFixed(2)}%. Conservative sizing applied for ${alertLevel} alert.`
    };
  }

  private getRiskParameters(alertLevel: Alert['level']) {
    switch (alertLevel) {
      case 'critical':
        return { winProbability: 0.65, avgWin: 1.5, avgLoss: 1.0 };
      case 'warning':
        return { winProbability: 0.58, avgWin: 1.2, avgLoss: 1.0 };
      default:
        return { winProbability: 0.52, avgWin: 1.1, avgLoss: 1.0 };
    }
  }

  private calculateSizingConfidence(alertLevel: Alert['level']): number {
    switch (alertLevel) {
      case 'critical': return 85;
      case 'warning': return 70;
      default: return 55;
    }
  }

  private determineSystemAlertLevel(critical: number, warning: number): EngineOutput['signal'] {
    if (critical >= 3) return 'RISK_OFF';
    if (critical >= 1 || warning >= 5) return 'WARNING';
    if (warning >= 2) return 'NEUTRAL';
    return 'RISK_ON';
  }

  private calculateAlertConfidence(alerts: Alert[]): number {
    if (alerts.length === 0) return 100;
    
    const criticalWeight = alerts.filter(a => a.level === 'critical').length * 0.5;
    const warningWeight = alerts.filter(a => a.level === 'warning').length * 0.3;
    const infoWeight = alerts.filter(a => a.level === 'info').length * 0.1;
    
    const totalWeight = criticalWeight + warningWeight + infoWeight;
    return Math.max(0, 100 - totalWeight * 10);
  }

  private generateAlertAnalysis(alerts: Alert[], systemLevel: string): string {
    if (alerts.length === 0) {
      return 'No active alerts. System operating normally.';
    }
    
    const critical = alerts.filter(a => a.level === 'critical').length;
    const actionable = alerts.filter(a => a.actionable).length;
    
    let analysis = `${alerts.length} active alerts (${critical} critical). System level: ${systemLevel}. `;
    
    if (actionable > 0) {
      analysis += `${actionable} actionable alerts with position sizing recommendations. `;
    }
    
    if (critical > 0) {
      analysis += 'Immediate attention required for critical alerts. ';
    }
    
    return analysis;
  }

  private generatePositionRecommendations(alerts: Alert[]): PositionSizingRecommendation[] {
    return alerts
      .filter(a => a.actionable && a.positionSizing)
      .map(a => a.positionSizing!)
      .slice(0, 5); // Top 5 recommendations
  }

  private getYesterdayAlertCount(): number {
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    return this.alertHistory.filter(a => a.timestamp >= yesterday).length;
  }

  private calculateAlertChangePercent(): number {
    const yesterday = this.getYesterdayAlertCount();
    const today = this.alerts.length;
    if (yesterday === 0) return 0;
    return ((today - yesterday) / yesterday) * 100;
  }

  validateData(data: Map<string, any>): boolean {
    // Always valid - can operate on any data
    return true;
  }

  // Public methods for alert management
  public getActiveAlerts(): Alert[] {
    return [...this.alerts];
  }

  public dismissAlert(alertId: string): void {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
  }

  public getAlertHistory(): Alert[] {
    return [...this.alertHistory];
  }
}