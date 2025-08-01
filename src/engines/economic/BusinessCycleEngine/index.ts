import { BaseEngine, EngineConfig, EngineOutput, Alert } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'business-cycle',
  name: 'Business Cycle Engine',
  pillar: 3,
  priority: 70,
  updateInterval: 900000, // 15 minutes
  requiredIndicators: ['DGS10', 'DGS3MO', 'SOFR', 'SPX', 'BTCUSD'],
  dependencies: ['market-regime', 'credit-stress']
};

interface CycleMetrics {
  currentPhase: 'EARLY_CYCLE' | 'MID_CYCLE' | 'LATE_CYCLE' | 'RECESSION' | 'RECOVERY';
  cyclePosition: number; // 0-100 within current phase
  yieldCurve: number;
  growthMomentum: number;
  inflationPressure: number;
  cycleConfidence: number;
  timeToNextPhase: number; // months estimate
}

export class BusinessCycleEngine extends BaseEngine {
  private readonly CYCLE_INDICATORS = {
    yieldCurve: { inversion: -0.5, normal: 1.0, steep: 2.5 },
    growth: { recession: -2, slow: 0, moderate: 2, strong: 4 },
    inflation: { deflation: 0, low: 2, target: 3, high: 5 }
  };

  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    const dgs10 = this.extractLatestValue(data.get('DGS10'));
    const dgs3mo = this.extractLatestValue(data.get('DGS3MO'));
    const sofr = this.extractLatestValue(data.get('SOFR'));
    const spx = this.extractLatestValue(data.get('SPX'));

    if (!dgs10 || !dgs3mo) return this.getDefaultOutput();

    // Get dependency outputs
    const marketRegime = data.get('ENGINE_market-regime');
    const creditStress = data.get('ENGINE_credit-stress');

    const metrics = this.calculateCycleMetrics(dgs10, dgs3mo, sofr, spx, marketRegime, creditStress);
    const cycleSignal = this.interpretCyclePosition(metrics);
    const alerts = this.generateCycleAlerts(metrics);

    return {
      primaryMetric: {
        value: metrics.cyclePosition,
        change24h: this.estimateCycleChange(metrics),
        changePercent: metrics.cycleConfidence
      },
      signal: cycleSignal,
      confidence: metrics.cycleConfidence,
      analysis: this.generateAnalysis(metrics),
      subMetrics: {
        currentPhase: metrics.currentPhase,
        cyclePosition: metrics.cyclePosition,
        yieldCurve: metrics.yieldCurve,
        growthMomentum: metrics.growthMomentum,
        inflationPressure: metrics.inflationPressure,
        timeToNextPhase: metrics.timeToNextPhase,
        cycleForces: this.analyzeCycleForces(metrics),
        sectorRotation: this.recommendSectorRotation(metrics),
        assetAllocation: this.recommendAssetAllocation(metrics),
        riskFactors: this.identifyRiskFactors(metrics)
      },
      alerts
    };
  }

  private calculateCycleMetrics(
    dgs10: number,
    dgs3mo: number,
    sofr: number = 5.3,
    spx: number = 4500,
    marketRegime: any,
    creditStress: any
  ): CycleMetrics {
    // Yield curve analysis
    const yieldCurve = dgs10 - dgs3mo;
    
    // Growth momentum proxy (using market performance)
    const growthMomentum = this.calculateGrowthMomentum(spx, marketRegime);
    
    // Inflation pressure proxy (using rates and credit)
    const inflationPressure = this.calculateInflationPressure(sofr, dgs10, creditStress);
    
    // Determine cycle phase
    const currentPhase = this.determineCyclePhase(yieldCurve, growthMomentum, inflationPressure);
    
    // Position within phase (0-100)
    const cyclePosition = this.calculateCyclePosition(currentPhase, yieldCurve, growthMomentum);
    
    // Confidence in cycle assessment
    const cycleConfidence = this.calculateCycleConfidence(yieldCurve, growthMomentum, marketRegime);
    
    // Time to next phase estimate
    const timeToNextPhase = this.estimateTimeToNextPhase(currentPhase, cyclePosition);

    return {
      currentPhase,
      cyclePosition,
      yieldCurve,
      growthMomentum,
      inflationPressure,
      cycleConfidence,
      timeToNextPhase
    };
  }

  private calculateGrowthMomentum(spx: number, marketRegime: any): number {
    // Proxy growth using market performance and regime
    let momentum = 0;
    
    // Market regime component
    if (marketRegime?.subMetrics?.currentRegime === 'RISK_ON_TRENDING') momentum += 3;
    else if (marketRegime?.subMetrics?.currentRegime === 'RISK_OFF_TRENDING') momentum -= 3;
    else if (marketRegime?.subMetrics?.currentRegime === 'CONSOLIDATION') momentum += 1;
    
    // Add some variation
    momentum += (Math.random() - 0.5) * 2;
    
    return Math.max(-5, Math.min(5, momentum));
  }

  private calculateInflationPressure(sofr: number, dgs10: number, creditStress: any): number {
    // Inflation pressure based on rates and credit conditions
    let pressure = 2; // Base 2% target
    
    // Rate environment
    if (sofr > 5.5) pressure += 1;
    if (dgs10 > 5) pressure += 0.5;
    
    // Credit stress impact
    if (creditStress?.subMetrics?.stressLevel === 'HIGH') pressure -= 1;
    if (creditStress?.subMetrics?.stressLevel === 'LOW') pressure += 0.5;
    
    return Math.max(0, Math.min(8, pressure));
  }

  private determineCyclePhase(yieldCurve: number, growth: number, inflation: number): CycleMetrics['currentPhase'] {
    // Classic business cycle mapping
    if (yieldCurve < this.CYCLE_INDICATORS.yieldCurve.inversion && growth < 0) {
      return 'RECESSION';
    }
    
    if (growth < 0 && yieldCurve > 0) {
      return 'RECOVERY';
    }
    
    if (growth > 2 && yieldCurve > this.CYCLE_INDICATORS.yieldCurve.normal && inflation < 3) {
      return 'EARLY_CYCLE';
    }
    
    if (growth > 1 && inflation > 3 && yieldCurve > 0) {
      return 'MID_CYCLE';
    }
    
    if (yieldCurve < 1 && inflation > 4) {
      return 'LATE_CYCLE';
    }
    
    // Default based on yield curve
    if (yieldCurve < 0) return 'LATE_CYCLE';
    if (growth > 2) return 'EARLY_CYCLE';
    
    return 'MID_CYCLE';
  }

  private calculateCyclePosition(phase: string, yieldCurve: number, growth: number): number {
    // Position within the current phase (0-100)
    const phaseMap: Record<string, () => number> = {
      'EARLY_CYCLE': () => Math.max(0, Math.min(100, (growth + 2) * 20 + (yieldCurve * 10))),
      'MID_CYCLE': () => Math.max(0, Math.min(100, 50 + (growth * 10) - (yieldCurve * 5))),
      'LATE_CYCLE': () => Math.max(0, Math.min(100, 70 - (yieldCurve * 20) + (growth * 5))),
      'RECESSION': () => Math.max(0, Math.min(100, 20 - (growth * 10))),
      'RECOVERY': () => Math.max(0, Math.min(100, (growth + 3) * 15 + (yieldCurve * 8)))
    };
    
    return phaseMap[phase]?.() || 50;
  }

  private calculateCycleConfidence(yieldCurve: number, growth: number, marketRegime: any): number {
    let confidence = 60;
    
    // Clear yield curve signals increase confidence
    if (Math.abs(yieldCurve) > 1) confidence += 15;
    
    // Strong growth signals increase confidence
    if (Math.abs(growth) > 2) confidence += 15;
    
    // Market regime alignment
    if (marketRegime?.confidence > 70) confidence += 10;
    
    return Math.min(100, confidence);
  }

  private estimateTimeToNextPhase(phase: string, position: number): number {
    // Typical cycle phase durations in months
    const phaseDurations: Record<string, number> = {
      'EARLY_CYCLE': 18,
      'MID_CYCLE': 24,
      'LATE_CYCLE': 12,
      'RECESSION': 9,
      'RECOVERY': 6
    };
    
    const totalDuration = phaseDurations[phase] || 18;
    const remaining = (100 - position) / 100;
    
    return Math.round(totalDuration * remaining);
  }

  private interpretCyclePosition(metrics: CycleMetrics): EngineOutput['signal'] {
    const { currentPhase, cyclePosition } = metrics;
    
    if (currentPhase === 'RECESSION') return 'RISK_OFF';
    if (currentPhase === 'RECOVERY' || currentPhase === 'EARLY_CYCLE') return 'RISK_ON';
    if (currentPhase === 'LATE_CYCLE' && cyclePosition > 80) return 'WARNING';
    if (currentPhase === 'MID_CYCLE') return 'NEUTRAL';
    
    return 'NEUTRAL';
  }

  private analyzeCycleForces(metrics: CycleMetrics): any {
    return {
      monetaryPolicy: this.assessMonetaryPolicy(metrics),
      fiscalPolicy: 'NEUTRAL', // Mock
      globalSync: this.assessGlobalSync(metrics),
      structuralForces: this.assessStructuralForces(metrics)
    };
  }

  private assessMonetaryPolicy(metrics: CycleMetrics): string {
    if (metrics.yieldCurve < -0.5) return 'RESTRICTIVE';
    if (metrics.yieldCurve > 2) return 'ACCOMMODATIVE';
    return 'NEUTRAL';
  }

  private assessGlobalSync(metrics: CycleMetrics): string {
    // Mock global synchronization assessment
    return Math.random() > 0.5 ? 'SYNCHRONIZED' : 'DIVERGENT';
  }

  private assessStructuralForces(metrics: CycleMetrics): string[] {
    const forces: string[] = [];
    
    if (metrics.inflationPressure > 4) forces.push('INFLATION_PRESSURE');
    if (metrics.yieldCurve < 0) forces.push('MONETARY_TIGHTENING');
    if (metrics.growthMomentum < 0) forces.push('GROWTH_SLOWDOWN');
    
    return forces;
  }

  private recommendSectorRotation(metrics: CycleMetrics): Record<string, string> {
    const rotations: Record<string, Record<string, string>> = {
      'EARLY_CYCLE': { overweight: 'FINANCIALS,INDUSTRIALS', underweight: 'UTILITIES,STAPLES' },
      'MID_CYCLE': { overweight: 'TECHNOLOGY,DISCRETIONARY', underweight: 'MATERIALS,ENERGY' },
      'LATE_CYCLE': { overweight: 'STAPLES,HEALTHCARE', underweight: 'GROWTH,CYCLICALS' },
      'RECESSION': { overweight: 'UTILITIES,BONDS', underweight: 'CYCLICALS,GROWTH' },
      'RECOVERY': { overweight: 'CYCLICALS,SMALL_CAPS', underweight: 'DEFENSIVE,UTILITIES' }
    };
    
    return rotations[metrics.currentPhase] || { overweight: 'BALANCED', underweight: 'NONE' };
  }

  private recommendAssetAllocation(metrics: CycleMetrics): Record<string, number> {
    const allocations: Record<string, Record<string, number>> = {
      'EARLY_CYCLE': { equity: 70, bonds: 20, commodities: 10, cash: 0 },
      'MID_CYCLE': { equity: 60, bonds: 25, commodities: 10, cash: 5 },
      'LATE_CYCLE': { equity: 45, bonds: 35, commodities: 15, cash: 5 },
      'RECESSION': { equity: 30, bonds: 50, commodities: 5, cash: 15 },
      'RECOVERY': { equity: 65, bonds: 20, commodities: 10, cash: 5 }
    };
    
    return allocations[metrics.currentPhase] || { equity: 50, bonds: 30, commodities: 10, cash: 10 };
  }

  private identifyRiskFactors(metrics: CycleMetrics): string[] {
    const risks: string[] = [];
    
    if (metrics.currentPhase === 'LATE_CYCLE') risks.push('RECESSION_RISK');
    if (metrics.yieldCurve < -0.5) risks.push('INVERTED_CURVE');
    if (metrics.inflationPressure > 5) risks.push('INFLATION_RISK');
    if (metrics.timeToNextPhase < 6) risks.push('CYCLE_TRANSITION');
    
    return risks;
  }

  private estimateCycleChange(metrics: CycleMetrics): number {
    // Mock cycle change calculation
    return metrics.cyclePosition > 80 ? -5 : 2;
  }

  private generateAnalysis(metrics: CycleMetrics): string {
    const { currentPhase, cyclePosition, timeToNextPhase, yieldCurve } = metrics;
    
    const phaseStorybook: Record<string, string> = {
      'EARLY_CYCLE': `Early cycle expansion underway. Growth accelerating with supportive monetary conditions. Yield curve: ${yieldCurve.toFixed(1)}%. Favor cyclicals and risk assets.`,
      'MID_CYCLE': `Mid-cycle maturity. Balanced growth with moderate inflation pressure. ${timeToNextPhase} months estimated to late cycle. Maintain diversified positioning.`,
      'LATE_CYCLE': `Late cycle warning signs emerging. Yield curve at ${yieldCurve.toFixed(1)}% with ${cyclePosition.toFixed(0)}% cycle position. Begin defensive positioning.`,
      'RECESSION': `Recession phase active. Growth contraction with defensive positioning recommended. Recovery estimated in ${timeToNextPhase} months.`,
      'RECOVERY': `Economic recovery building momentum. Early signs of expansion emerging. Position for early cycle transition in ${timeToNextPhase} months.`
    };
    
    return phaseStorybook[currentPhase] || `Business cycle: ${currentPhase} at ${cyclePosition.toFixed(0)}% position`;
  }

  private generateCycleAlerts(metrics: CycleMetrics): Alert[] {
    const alerts: Alert[] = [];

    if (metrics.currentPhase === 'LATE_CYCLE' && metrics.cyclePosition > 85) {
      alerts.push({
        level: 'warning',
        message: `Late cycle risk: ${metrics.cyclePosition.toFixed(0)}% through phase - recession risk elevated`,
        timestamp: Date.now()
      });
    }

    if (metrics.yieldCurve < -0.5) {
      alerts.push({
        level: 'warning',
        message: `Yield curve inversion: ${metrics.yieldCurve.toFixed(1)}% indicates recession risk`,
        timestamp: Date.now()
      });
    }

    if (metrics.timeToNextPhase < 3) {
      alerts.push({
        level: 'info',
        message: `Cycle transition approaching: ${metrics.timeToNextPhase} months to next phase`,
        timestamp: Date.now()
      });
    }

    return alerts;
  }

  validateData(data: Map<string, any>): boolean {
    const required = ['DGS10', 'DGS3MO'];
    return required.every(indicator => {
      const value = data.get(indicator);
      return value !== undefined && value !== null;
    });
  }
}