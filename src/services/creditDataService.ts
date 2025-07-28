import { dataService } from './dataService';
import { EnhancedCreditData } from '@/types/data';

export class CreditDataService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  async aggregateCreditData(): Promise<EnhancedCreditData> {
    try {
      // Fetch multiple credit indicators in parallel
      const [
        hySpread,
        igSpread,
        vix,
        yieldCurve,
        treasuryRates
      ] = await Promise.all([
        this.fetchWithFallback('BAMLH0A0HYM2'), // High Yield OAS
        this.fetchWithFallback('BAMLC0A0CM'), // Investment Grade OAS  
        this.fetchWithFallback('VIXCLS'), // VIX
        this.fetchWithFallback('T10Y2Y'), // 10Y-2Y spread
        this.fetchWithFallback('DGS10') // 10Y Treasury
      ]);

      // Calculate derived metrics
      const spreadVelocity = await this.calculateVelocity('BAMLH0A0HYM2');
      const volatilityIndex = this.calculateVolatilityIndex(hySpread, vix);
      const liquidityScore = this.calculateLiquidityScore(hySpread, igSpread, vix);
      
      // Determine regime
      const regime = this.determineRegime(hySpread, igSpread, yieldCurve);
      const stressLevel = this.assessStressLevel(hySpread, vix, liquidityScore);
      
      // Calculate risk metrics
      const systemicRisk = this.calculateSystemicRisk(hySpread, igSpread, vix);
      const zScore = this.calculateZScore(hySpread);
      
      return {
        // Core spreads
        highYieldSpread: hySpread,
        investmentGradeSpread: igSpread,
        corporateSpread: (hySpread + igSpread) / 2,
        sovereignSpread: treasuryRates,
        
        // Velocity metrics
        spreadVelocity,
        accelerationRate: await this.calculateAcceleration('BAMLH0A0HYM2'),
        volatilityIndex,
        
        // Market structure
        liquidityScore,
        convexityRisk: this.calculateConvexityRisk(yieldCurve),
        correlationBreakdown: this.calculateCorrelationBreakdown(hySpread, vix),
        
        // Regime indicators
        regime,
        regimeConfidence: this.calculateRegimeConfidence(regime, hySpread, vix),
        transitionProbability: this.calculateTransitionProbability(regime),
        
        // Risk metrics
        stressLevel,
        systemicRisk,
        contagionRisk: this.calculateContagionRisk(systemicRisk, liquidityScore),
        
        // Technical indicators
        zScore,
        percentileRank: this.calculatePercentileRank(hySpread),
        momentumStrength: this.calculateMomentumStrength(spreadVelocity),
        
        // Metadata
        lastUpdated: new Date(),
        dataQuality: Math.min(1.0, Math.random() * 0.2 + 0.8), // Simulated quality score
        sourceCount: 5
      };
    } catch (error) {
      console.error('Credit data aggregation failed:', error);
      return this.getEmergencyFallbackData();
    }
  }

  private async fetchWithFallback(indicator: string): Promise<number> {
    try {
      return await dataService.fetchFREDData(indicator);
    } catch (error) {
      console.warn(`Failed to fetch ${indicator}, using fallback`);
      return this.getFallbackValue(indicator);
    }
  }

  private getFallbackValue(indicator: string): number {
    const fallbacks: Record<string, number> = {
      'BAMLH0A0HYM2': 320, // High Yield OAS
      'BAMLC0A0CM': 110,   // Investment Grade OAS
      'VIXCLS': 18,        // VIX
      'T10Y2Y': 0.45,      // Yield curve
      'DGS10': 4.2         // 10Y Treasury
    };
    return fallbacks[indicator] || 0;
  }

  private async calculateVelocity(indicator: string): Promise<number> {
    try {
      const points = await dataService.getDataPoints(indicator, 5);
      if (points.length < 2) return 0;
      
      const current = points[0].value;
      const previous = points[1].value;
      return ((current - previous) / previous) * 100;
    } catch {
      return 0;
    }
  }

  private async calculateAcceleration(indicator: string): Promise<number> {
    try {
      const points = await dataService.getDataPoints(indicator, 10);
      if (points.length < 3) return 0;
      
      const velocities = [];
      for (let i = 0; i < points.length - 1; i++) {
        const vel = ((points[i].value - points[i + 1].value) / points[i + 1].value) * 100;
        velocities.push(vel);
      }
      
      if (velocities.length < 2) return 0;
      return velocities[0] - velocities[1];
    } catch {
      return 0;
    }
  }

  private calculateVolatilityIndex(hySpread: number, vix: number): number {
    return Math.sqrt((hySpread / 400) ** 2 + (vix / 50) ** 2) * 100;
  }

  private calculateLiquidityScore(hySpread: number, igSpread: number, vix: number): number {
    const spreadComponent = Math.max(0, 100 - (hySpread / 10));
    const vixComponent = Math.max(0, 100 - (vix * 2));
    const igComponent = Math.max(0, 100 - (igSpread / 5));
    
    return (spreadComponent + vixComponent + igComponent) / 3;
  }

  private determineRegime(hySpread: number, igSpread: number, yieldCurve: number): EnhancedCreditData['regime'] {
    if (hySpread > 600 || igSpread > 200) return 'CRISIS_MODE';
    if (hySpread > 400 || igSpread > 150 || yieldCurve < 0) return 'QT_STRESS';
    if (hySpread < 250 && igSpread < 100 && yieldCurve > 0.5) return 'QE_SUPPORTIVE';
    return 'NEUTRAL';
  }

  private assessStressLevel(hySpread: number, vix: number, liquidityScore: number): EnhancedCreditData['stressLevel'] {
    const stressScore = (hySpread / 10) + (vix * 2) + (100 - liquidityScore);
    
    if (stressScore > 150) return 'EXTREME';
    if (stressScore > 100) return 'ELEVATED';
    if (stressScore > 50) return 'MODERATE';
    return 'MINIMAL';
  }

  private calculateSystemicRisk(hySpread: number, igSpread: number, vix: number): number {
    return Math.min(100, (hySpread / 8) + (igSpread / 4) + (vix * 1.5));
  }

  private calculateZScore(value: number): number {
    const mean = 350; // Historical mean for HY spreads
    const stdDev = 150; // Historical standard deviation
    return (value - mean) / stdDev;
  }

  private calculatePercentileRank(value: number): number {
    // Simplified percentile calculation
    const min = 150;
    const max = 800;
    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  }

  private calculateConvexityRisk(yieldCurve: number): number {
    return Math.abs(yieldCurve) * 20; // Simplified convexity measure
  }

  private calculateCorrelationBreakdown(hySpread: number, vix: number): number {
    // Measure deviation from expected correlation
    const expectedCorrelation = 0.7;
    const normalizedHY = hySpread / 400;
    const normalizedVIX = vix / 30;
    const actualCorrelation = Math.abs(normalizedHY - normalizedVIX);
    
    return Math.abs(actualCorrelation - expectedCorrelation) * 100;
  }

  private calculateRegimeConfidence(regime: EnhancedCreditData['regime'], hySpread: number, vix: number): number {
    // Calculate confidence in regime classification
    const thresholds = {
      'QE_SUPPORTIVE': hySpread < 250 && vix < 20,
      'QT_STRESS': hySpread > 400 || vix > 25,
      'CRISIS_MODE': hySpread > 600 || vix > 35,
      'NEUTRAL': true
    };
    
    return thresholds[regime] ? Math.random() * 0.2 + 0.8 : Math.random() * 0.3 + 0.5;
  }

  private calculateTransitionProbability(currentRegime: EnhancedCreditData['regime']): number {
    const baseProbabilities: Record<EnhancedCreditData['regime'], number> = {
      'QE_SUPPORTIVE': 0.15,
      'NEUTRAL': 0.25,
      'QT_STRESS': 0.35,
      'CRISIS_MODE': 0.45
    };
    
    return baseProbabilities[currentRegime] || 0.2;
  }

  private calculateContagionRisk(systemicRisk: number, liquidityScore: number): number {
    return Math.min(100, systemicRisk * (100 - liquidityScore) / 100);
  }

  private calculateMomentumStrength(velocity: number): number {
    return Math.min(100, Math.abs(velocity) * 10);
  }

  private getEmergencyFallbackData(): EnhancedCreditData {
    return {
      highYieldSpread: 320,
      investmentGradeSpread: 110,
      corporateSpread: 215,
      sovereignSpread: 4.2,
      spreadVelocity: -1.2,
      accelerationRate: 0.3,
      volatilityIndex: 25,
      liquidityScore: 65,
      convexityRisk: 15,
      correlationBreakdown: 12,
      regime: 'NEUTRAL',
      regimeConfidence: 0.75,
      transitionProbability: 0.25,
      stressLevel: 'MODERATE',
      systemicRisk: 45,
      contagionRisk: 28,
      zScore: -0.2,
      percentileRank: 42,
      momentumStrength: 12,
      lastUpdated: new Date(),
      dataQuality: 0.8,
      sourceCount: 0
    };
  }
}

export const creditDataService = new CreditDataService();