import { BaseEngine, EngineConfig, EngineOutput, Alert } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'master-control',
  name: 'Master Control Engine',
  pillar: 3,
  priority: 100, // Highest priority
  updateInterval: 60000, // 1 minute
  requiredIndicators: [],
  dependencies: [
    'enhanced-momentum',
    'volatility-regime',
    'net-liquidity',
    'credit-stress',
    'market-regime',
    'signal-aggregator'
  ]
};

interface MasterSignal {
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength: number; // 0-100
  conviction: number; // 0-100
  timeframe: 'IMMEDIATE' | 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
}

interface SystemStatus {
  overallHealth: number; // 0-100
  enginePerformance: number;
  dataQuality: number;
  systemStress: number;
  operationalStatus: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL' | 'EMERGENCY';
}

export class MasterControlEngine extends BaseEngine {
  private readonly CONSENSUS_THRESHOLD = 0.75; // 75% agreement required
  private readonly CRITICAL_ALERT_THRESHOLD = 90;
  private masterSignalHistory: MasterSignal[] = [];
  
  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    // Collect all engine outputs
    const engineOutputs = this.collectEngineOutputs(data);
    
    // Generate master signal
    const masterSignal = this.generateMasterSignal(engineOutputs);
    
    // Assess system status
    const systemStatus = this.assessSystemStatus(engineOutputs);
    
    // Generate execution recommendations
    const executionPlan = this.generateExecutionPlan(masterSignal, systemStatus);
    
    // Master alerts
    const alerts = this.generateMasterAlerts(masterSignal, systemStatus, engineOutputs);
    
    // Store signal history
    this.masterSignalHistory.push(masterSignal);
    if (this.masterSignalHistory.length > 100) {
      this.masterSignalHistory.shift();
    }

    return {
      primaryMetric: {
        value: masterSignal.strength,
        change24h: this.calculateSignalChange(),
        changePercent: masterSignal.conviction
      },
      signal: this.convertToEngineSignal(masterSignal),
      confidence: masterSignal.conviction,
      analysis: this.generateMasterAnalysis(masterSignal, systemStatus, executionPlan),
      subMetrics: {
        masterSignal,
        systemStatus,
        executionPlan,
        engineConsensus: this.calculateEngineConsensus(engineOutputs),
        conflictAnalysis: this.analyzeEngineConflicts(engineOutputs),
        signalEvolution: this.analyzeSignalEvolution(),
        riskAssessment: this.assessRiskEnvironment(engineOutputs),
        operationalMetrics: {
          enginesActive: engineOutputs.size,
          averageConfidence: this.calculateAverageConfidence(engineOutputs),
          dataFreshness: this.assessDataFreshness(engineOutputs),
          systemLatency: this.calculateSystemLatency()
        }
      },
      alerts
    };
  }

  private collectEngineOutputs(data: Map<string, any>): Map<string, EngineOutput> {
    const outputs = new Map<string, EngineOutput>();
    
    config.dependencies.forEach(engineId => {
      const output = data.get(`ENGINE_${engineId}`);
      if (output) {
        outputs.set(engineId, output);
      }
    });
    
    return outputs;
  }

  private generateMasterSignal(engineOutputs: Map<string, EngineOutput>): MasterSignal {
    const signals = Array.from(engineOutputs.values());
    if (signals.length === 0) {
      return {
        direction: 'NEUTRAL',
        strength: 0,
        conviction: 0,
        timeframe: 'IMMEDIATE',
        riskLevel: 'MODERATE'
      };
    }

    // Weight engines by priority and confidence
    const weightedSignals = this.calculateWeightedSignals(engineOutputs);
    
    // Determine direction based on consensus
    const direction = this.determineSignalDirection(weightedSignals);
    
    // Calculate strength (0-100)
    const strength = this.calculateSignalStrength(weightedSignals, direction);
    
    // Calculate conviction (confidence in the signal)
    const conviction = this.calculateSignalConviction(engineOutputs, direction);
    
    // Determine timeframe
    const timeframe = this.determineTimeframe(engineOutputs);
    
    // Assess risk level
    const riskLevel = this.assessRiskLevel(engineOutputs);

    return {
      direction,
      strength,
      conviction,
      timeframe,
      riskLevel
    };
  }

  private calculateWeightedSignals(engineOutputs: Map<string, EngineOutput>): Array<{signal: string, weight: number, confidence: number}> {
    const weights: Record<string, number> = {
      'enhanced-momentum': 1.2,
      'volatility-regime': 1.1,
      'net-liquidity': 1.5,
      'credit-stress': 1.3,
      'market-regime': 1.4,
      'signal-aggregator': 1.0
    };

    return Array.from(engineOutputs.entries()).map(([engineId, output]) => ({
      signal: output.signal,
      weight: weights[engineId] || 1.0,
      confidence: output.confidence
    }));
  }

  private determineSignalDirection(weightedSignals: Array<{signal: string, weight: number, confidence: number}>): MasterSignal['direction'] {
    let bullishScore = 0;
    let bearishScore = 0;
    let totalWeight = 0;

    weightedSignals.forEach(({ signal, weight, confidence }) => {
      const adjustedWeight = weight * (confidence / 100);
      totalWeight += adjustedWeight;

      if (signal === 'RISK_ON') {
        bullishScore += adjustedWeight;
      } else if (signal === 'RISK_OFF') {
        bearishScore += adjustedWeight;
      }
    });

    const bullishRatio = bullishScore / totalWeight;
    const bearishRatio = bearishScore / totalWeight;

    if (bullishRatio > this.CONSENSUS_THRESHOLD) return 'BULLISH';
    if (bearishRatio > this.CONSENSUS_THRESHOLD) return 'BEARISH';
    if (bullishRatio > bearishRatio) return 'BULLISH';
    if (bearishRatio > bullishRatio) return 'BEARISH';
    
    return 'NEUTRAL';
  }

  private calculateSignalStrength(weightedSignals: Array<{signal: string, weight: number, confidence: number}>, direction: string): number {
    if (direction === 'NEUTRAL') return 0;

    const alignedSignals = weightedSignals.filter(s => 
      (direction === 'BULLISH' && s.signal === 'RISK_ON') ||
      (direction === 'BEARISH' && s.signal === 'RISK_OFF')
    );

    const totalAlignedWeight = alignedSignals.reduce((sum, s) => sum + s.weight * (s.confidence / 100), 0);
    const totalWeight = weightedSignals.reduce((sum, s) => sum + s.weight, 0);

    return Math.min(100, (totalAlignedWeight / totalWeight) * 100);
  }

  private calculateSignalConviction(engineOutputs: Map<string, EngineOutput>, direction: string): number {
    const confidences = Array.from(engineOutputs.values()).map(o => o.confidence);
    const averageConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    
    // Adjust for consensus
    const consensus = this.calculateEngineConsensus(engineOutputs);
    
    return Math.min(100, averageConfidence * (1 + consensus / 100));
  }

  private determineTimeframe(engineOutputs: Map<string, EngineOutput>): MasterSignal['timeframe'] {
    // Analyze engine characteristics to determine signal timeframe
    const momentumOutput = engineOutputs.get('enhanced-momentum');
    const liquidityOutput = engineOutputs.get('net-liquidity');
    
    if (momentumOutput?.signal === 'WARNING' || liquidityOutput?.signal === 'WARNING') {
      return 'IMMEDIATE';
    }
    
    return 'SHORT_TERM'; // Default for now
  }

  private assessRiskLevel(engineOutputs: Map<string, EngineOutput>): MasterSignal['riskLevel'] {
    const warningCount = Array.from(engineOutputs.values()).filter(o => o.signal === 'WARNING').length;
    const averageConfidence = this.calculateAverageConfidence(engineOutputs);
    
    if (warningCount >= 3) return 'EXTREME';
    if (warningCount >= 2) return 'HIGH';
    if (averageConfidence < 50) return 'HIGH';
    if (warningCount >= 1) return 'MODERATE';
    
    return 'LOW';
  }

  private assessSystemStatus(engineOutputs: Map<string, EngineOutput>): SystemStatus {
    const engineCount = engineOutputs.size;
    const expectedEngines = config.dependencies.length;
    
    const overallHealth = (engineCount / expectedEngines) * 100;
    const enginePerformance = this.calculateAverageConfidence(engineOutputs);
    const dataQuality = this.assessDataQuality(engineOutputs);
    const systemStress = this.calculateSystemStress(engineOutputs);

    let operationalStatus: SystemStatus['operationalStatus'] = 'OPTIMAL';
    if (overallHealth < 50 || systemStress > 80) operationalStatus = 'CRITICAL';
    else if (overallHealth < 75 || systemStress > 60) operationalStatus = 'DEGRADED';
    else if (systemStress > 40) operationalStatus = 'DEGRADED';

    return {
      overallHealth,
      enginePerformance,
      dataQuality,
      systemStress,
      operationalStatus
    };
  }

  private generateExecutionPlan(masterSignal: MasterSignal, systemStatus: SystemStatus): any {
    return {
      primaryAction: this.determinePrimaryAction(masterSignal),
      positionSizing: this.calculatePositionSizing(masterSignal, systemStatus),
      riskParameters: this.generateRiskParameters(masterSignal),
      timeHorizon: masterSignal.timeframe,
      contingencyPlan: this.generateContingencyPlan(masterSignal),
      executionTiming: this.determineExecutionTiming(masterSignal, systemStatus)
    };
  }

  private calculateEngineConsensus(engineOutputs: Map<string, EngineOutput>): number {
    const signals = Array.from(engineOutputs.values()).map(o => o.signal);
    const signalCounts = signals.reduce((acc, signal) => {
      acc[signal] = (acc[signal] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maxCount = Math.max(...Object.values(signalCounts));
    return (maxCount / signals.length) * 100;
  }

  private analyzeEngineConflicts(engineOutputs: Map<string, EngineOutput>): string[] {
    const conflicts: string[] = [];
    const signals = Array.from(engineOutputs.entries());

    // Check for major signal disagreements
    const riskOn = signals.filter(([_, o]) => o.signal === 'RISK_ON').length;
    const riskOff = signals.filter(([_, o]) => o.signal === 'RISK_OFF').length;

    if (riskOn > 0 && riskOff > 0 && Math.abs(riskOn - riskOff) <= 1) {
      conflicts.push('MAJOR_SIGNAL_DIVERGENCE');
    }

    return conflicts;
  }

  private analyzeSignalEvolution(): any {
    if (this.masterSignalHistory.length < 3) return { trend: 'INSUFFICIENT_DATA' };

    const recent = this.masterSignalHistory.slice(-3);
    const directions = recent.map(s => s.direction);
    const strengths = recent.map(s => s.strength);

    return {
      trend: this.determineTrend(directions),
      strengthTrend: this.calculateTrend(strengths),
      stability: this.calculateStability(directions)
    };
  }

  private convertToEngineSignal(masterSignal: MasterSignal): EngineOutput['signal'] {
    if (masterSignal.riskLevel === 'EXTREME') return 'WARNING';
    if (masterSignal.direction === 'BULLISH') return 'RISK_ON';
    if (masterSignal.direction === 'BEARISH') return 'RISK_OFF';
    return 'NEUTRAL';
  }

  // Helper methods with placeholder implementations
  private calculateSignalChange(): number {
    if (this.masterSignalHistory.length < 2) return 0;
    const current = this.masterSignalHistory[this.masterSignalHistory.length - 1];
    const previous = this.masterSignalHistory[this.masterSignalHistory.length - 2];
    return current.strength - previous.strength;
  }

  private calculateAverageConfidence(engineOutputs: Map<string, EngineOutput>): number {
    const confidences = Array.from(engineOutputs.values()).map(o => o.confidence);
    return confidences.length > 0 ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0;
  }

  private assessDataQuality(engineOutputs: Map<string, EngineOutput>): number {
    // Placeholder - would assess data freshness, completeness, etc.
    return 85;
  }

  private calculateSystemStress(engineOutputs: Map<string, EngineOutput>): number {
    const warningCount = Array.from(engineOutputs.values()).filter(o => o.signal === 'WARNING').length;
    return Math.min(100, (warningCount / engineOutputs.size) * 100);
  }

  private determinePrimaryAction(masterSignal: MasterSignal): string {
    if (masterSignal.direction === 'BULLISH' && masterSignal.strength > 70) return 'AGGRESSIVE_LONG';
    if (masterSignal.direction === 'BEARISH' && masterSignal.strength > 70) return 'AGGRESSIVE_SHORT';
    if (masterSignal.direction === 'BULLISH') return 'MODERATE_LONG';
    if (masterSignal.direction === 'BEARISH') return 'MODERATE_SHORT';
    return 'HOLD';
  }

  private calculatePositionSizing(masterSignal: MasterSignal, systemStatus: SystemStatus): number {
    let baseSize = 10; // Base 10% position
    
    // Adjust for signal strength
    baseSize *= (masterSignal.strength / 100);
    
    // Adjust for conviction
    baseSize *= (masterSignal.conviction / 100);
    
    // Adjust for risk level
    const riskMultipliers = { LOW: 1.2, MODERATE: 1.0, HIGH: 0.7, EXTREME: 0.3 };
    baseSize *= riskMultipliers[masterSignal.riskLevel];
    
    return Math.max(1, Math.min(25, baseSize));
  }

  private generateRiskParameters(masterSignal: MasterSignal): any {
    return {
      stopLoss: masterSignal.riskLevel === 'EXTREME' ? 2 : 5,
      takeProfit: masterSignal.strength > 80 ? 15 : 10,
      maxDrawdown: 10,
      positionLimit: this.calculatePositionSizing(masterSignal, {} as SystemStatus)
    };
  }

  private generateContingencyPlan(masterSignal: MasterSignal): string[] {
    const plan: string[] = [];
    
    if (masterSignal.riskLevel === 'EXTREME') {
      plan.push('IMMEDIATE_RISK_REDUCTION');
      plan.push('HEDGE_ACTIVATION');
    }
    
    if (masterSignal.conviction < 60) {
      plan.push('REDUCE_POSITION_SIZE');
      plan.push('INCREASE_MONITORING');
    }
    
    return plan;
  }

  private determineExecutionTiming(masterSignal: MasterSignal, systemStatus: SystemStatus): string {
    if (masterSignal.timeframe === 'IMMEDIATE') return 'EXECUTE_NOW';
    if (systemStatus.operationalStatus === 'CRITICAL') return 'WAIT_FOR_STABILITY';
    if (masterSignal.conviction > 80) return 'EXECUTE_NEXT_CYCLE';
    return 'MONITOR_AND_WAIT';
  }

  private assessRiskEnvironment(engineOutputs: Map<string, EngineOutput>): any {
    return {
      volatilityLevel: 'MODERATE',
      liquidityConditions: 'NORMAL',
      systemicRisk: 'LOW',
      marketRegime: 'TRENDING'
    };
  }

  private assessDataFreshness(engineOutputs: Map<string, EngineOutput>): number {
    // Placeholder - would check how recent engine updates are
    return 95;
  }

  private calculateSystemLatency(): number {
    // Placeholder - would measure actual system response times
    return 150; // ms
  }

  private determineTrend(values: any[]): string {
    return 'STABLE'; // Placeholder
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    return values[values.length - 1] - values[0];
  }

  private calculateStability(values: any[]): number {
    return 75; // Placeholder
  }

  private generateMasterAnalysis(masterSignal: MasterSignal, systemStatus: SystemStatus, executionPlan: any): string {
    return `MASTER CONTROL: ${masterSignal.direction} signal with ${masterSignal.strength}% strength and ${masterSignal.conviction}% conviction. 
            Risk Level: ${masterSignal.riskLevel}. System Status: ${systemStatus.operationalStatus} (${systemStatus.overallHealth.toFixed(0)}% health). 
            Recommended Action: ${executionPlan.primaryAction} with ${executionPlan.positionSizing.toFixed(1)}% position sizing.`;
  }

  private generateMasterAlerts(masterSignal: MasterSignal, systemStatus: SystemStatus, engineOutputs: Map<string, EngineOutput>): Alert[] {
    const alerts: Alert[] = [];

    if (masterSignal.riskLevel === 'EXTREME') {
      alerts.push({
        level: 'critical',
        message: `EXTREME RISK ENVIRONMENT: ${masterSignal.direction} signal with maximum risk`,
        timestamp: Date.now()
      });
    }

    if (systemStatus.operationalStatus === 'CRITICAL') {
      alerts.push({
        level: 'critical',
        message: `SYSTEM CRITICAL: ${systemStatus.overallHealth.toFixed(0)}% operational health`,
        timestamp: Date.now()
      });
    }

    if (masterSignal.strength > this.CRITICAL_ALERT_THRESHOLD) {
      alerts.push({
        level: 'warning',
        message: `STRONG MASTER SIGNAL: ${masterSignal.direction} at ${masterSignal.strength}% strength`,
        timestamp: Date.now()
      });
    }

    return alerts;
  }

  validateData(data: Map<string, any>): boolean {
    // Check if we have outputs from core dependency engines
    const coreEngines = ['enhanced-momentum', 'volatility-regime', 'net-liquidity'];
    return coreEngines.some(engineId => data.has(`ENGINE_${engineId}`));
  }
}