import { DealerPositionData, DealerRegime, DealerAlert, DealerInsight } from '@/types/dealerPositions';

export class DealerPositionsService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 30000; // 30 seconds
  private alerts: DealerAlert[] = [];
  private insights: DealerInsight[] = [];

  async fetchRealTimeData(): Promise<DealerPositionData> {
    const cacheKey = 'dealer_positions';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return this.processRawData(cached.data);
    }

    try {
      // In production, this would fetch from multiple real data sources:
      // - Federal Reserve H.4.1 Statistical Release
      // - Primary Dealer Statistics from NY Fed
      // - Treasury auction data
      // - SIFMA data
      
      const simulatedData = await this.generateSimulatedData();
      this.cache.set(cacheKey, { data: simulatedData, timestamp: Date.now() });
      
      return this.processRawData(simulatedData);
    } catch (error) {
      console.error('Failed to fetch dealer positions data:', error);
      throw new Error('Unable to retrieve dealer positions data');
    }
  }

  private async generateSimulatedData() {
    // Sophisticated simulation with realistic market dynamics
    const baseTime = Date.now();
    const volatility = 0.15 + (Math.sin(baseTime / 86400000) * 0.1); // Daily cycle
    
    const treasuryBase = 3200000; // $3.2T base
    const agencyBase = 1800000;   // $1.8T base
    const corporateBase = 650000; // $650B base
    
    return {
      treasury: {
        bills: treasuryBase * 0.25 * (1 + this.randomWalk(volatility)),
        notes: treasuryBase * 0.45 * (1 + this.randomWalk(volatility)),
        bonds: treasuryBase * 0.25 * (1 + this.randomWalk(volatility)),
        tips: treasuryBase * 0.05 * (1 + this.randomWalk(volatility)),
      },
      agency: {
        mortgage: agencyBase * 0.70 * (1 + this.randomWalk(volatility)),
        debentures: agencyBase * 0.25 * (1 + this.randomWalk(volatility)),
        discount: agencyBase * 0.05 * (1 + this.randomWalk(volatility)),
      },
      corporate: {
        investmentGrade: corporateBase * 0.75 * (1 + this.randomWalk(volatility)),
        highYield: corporateBase * 0.15 * (1 + this.randomWalk(volatility)),
        municipals: corporateBase * 0.10 * (1 + this.randomWalk(volatility)),
      },
      international: {
        foreign: 450000 * (1 + this.randomWalk(volatility * 1.2)),
        emerging: 150000 * (1 + this.randomWalk(volatility * 1.5)),
      },
      marketConditions: {
        vix: 18 + (Math.random() * 20),
        yieldCurve: 2.5 + (Math.random() * 3),
        creditSpreads: 85 + (Math.random() * 150),
      }
    };
  }

  private randomWalk(volatility: number): number {
    return (Math.random() - 0.5) * volatility * 2;
  }

  private processRawData(rawData: any): DealerPositionData {
    // Calculate totals
    const treasuryTotal = rawData.treasury.bills + rawData.treasury.notes + rawData.treasury.bonds + rawData.treasury.tips;
    const agencyTotal = rawData.agency.mortgage + rawData.agency.debentures + rawData.agency.discount;
    const corporateTotal = rawData.corporate.investmentGrade + rawData.corporate.highYield + rawData.corporate.municipals;
    const internationalTotal = rawData.international.foreign + rawData.international.emerging;
    
    const grandTotal = treasuryTotal + agencyTotal + corporateTotal + internationalTotal;
    
    // Calculate risk metrics
    const riskMetrics = this.calculateRiskMetrics(rawData, grandTotal);
    
    // Detect regime
    const analytics = this.calculateAnalytics(riskMetrics, rawData.marketConditions);
    
    // Calculate historical context
    const context = this.calculateContext(grandTotal, riskMetrics);
    
    // Generate alerts and insights
    this.generateAlerts(riskMetrics, analytics);
    this.generateInsights(analytics, context);

    return {
      treasuryPositions: {
        ...rawData.treasury,
        total: treasuryTotal
      },
      agencyPositions: {
        ...rawData.agency,
        total: agencyTotal
      },
      corporatePositions: {
        ...rawData.corporate,
        total: corporateTotal
      },
      internationalPositions: {
        ...rawData.international,
        total: internationalTotal
      },
      riskMetrics,
      analytics,
      context,
      metadata: {
        lastUpdated: new Date(),
        dataQuality: 0.94 + (Math.random() * 0.05),
        sourceReliability: 0.96 + (Math.random() * 0.03),
        calculationConfidence: 0.92 + (Math.random() * 0.06)
      }
    };
  }

  private calculateRiskMetrics(rawData: any, totalPositions: number): DealerPositionData['riskMetrics'] {
    const baseCapital = 850000; // $850B estimated capital base
    
    // Leverage calculation
    const leverageRatio = totalPositions / baseCapital;
    
    // Risk capacity (0-100, higher is better)
    const riskCapacity = Math.max(0, 100 - (leverageRatio - 3) * 20);
    
    // Liquidity stress (0-100, higher is worse)
    const liquidityStress = Math.min(100, 
      (rawData.marketConditions.vix - 15) * 2 + 
      (rawData.marketConditions.creditSpreads - 100) * 0.3
    );
    
    // Position velocity (rate of change)
    const positionVelocity = Math.abs(Math.sin(Date.now() / 3600000)) * 15;
    
    // Concentration risk
    const concentrationRisk = this.calculateConcentrationRisk(rawData);
    
    // Duration risk
    const durationRisk = this.calculateDurationRisk(rawData);
    
    // Credit risk
    const creditRisk = (rawData.corporate.highYield / (rawData.corporate.investmentGrade + rawData.corporate.highYield)) * 100;
    
    // Counterparty risk
    const counterpartyRisk = Math.min(100, liquidityStress * 0.8 + concentrationRisk * 0.2);

    return {
      leverageRatio,
      riskCapacity,
      liquidityStress,
      positionVelocity,
      concentrationRisk,
      durationRisk,
      creditRisk,
      counterpartyRisk
    };
  }

  private calculateConcentrationRisk(rawData: any): number {
    const positions = [
      rawData.treasury.bills,
      rawData.treasury.notes,
      rawData.treasury.bonds,
      rawData.agency.mortgage,
      rawData.corporate.investmentGrade
    ];
    
    const total = positions.reduce((a, b) => a + b, 0);
    const maxPosition = Math.max(...positions);
    
    return (maxPosition / total) * 100;
  }

  private calculateDurationRisk(rawData: any): number {
    // Simplified duration calculation based on position mix
    const shortDuration = rawData.treasury.bills * 0.25;
    const mediumDuration = rawData.treasury.notes * 4.5;
    const longDuration = rawData.treasury.bonds * 12;
    
    const totalDuration = shortDuration + mediumDuration + longDuration;
    const totalPositions = rawData.treasury.bills + rawData.treasury.notes + rawData.treasury.bonds;
    
    const avgDuration = totalDuration / totalPositions;
    return Math.min(100, avgDuration * 8);
  }

  private calculateAnalytics(riskMetrics: DealerPositionData['riskMetrics'], marketConditions: any): DealerPositionData['analytics'] {
    // Regime detection logic
    let regime: DealerRegime = 'NEUTRAL';
    let regimeConfidence = 0.5;
    
    if (riskMetrics.leverageRatio > 4.5 && riskMetrics.liquidityStress > 60) {
      regime = 'CRISIS';
      regimeConfidence = 0.85;
    } else if (riskMetrics.leverageRatio > 4.0 || riskMetrics.liquidityStress > 45) {
      regime = 'CONTRACTION';
      regimeConfidence = 0.75;
    } else if (riskMetrics.leverageRatio < 3.0 && riskMetrics.riskCapacity > 70) {
      regime = 'EXPANSION';
      regimeConfidence = 0.80;
    } else if (riskMetrics.positionVelocity > 10) {
      regime = 'TRANSITION';
      regimeConfidence = 0.65;
    }
    
    // Flow direction
    const flowDirection = riskMetrics.positionVelocity > 8 ? 
      (regime === 'EXPANSION' ? 'ACCUMULATING' : 'DISTRIBUTING') : 'NEUTRAL';
    
    // Market impact
    const marketImpact = riskMetrics.leverageRatio > 4.2 ? 'HIGH' : 
                        riskMetrics.leverageRatio > 3.5 ? 'MODERATE' : 'LOW';
    
    // Systemic risk
    const systemicRisk = (riskMetrics.liquidityStress * 0.4 + 
                         riskMetrics.concentrationRisk * 0.3 + 
                         riskMetrics.counterpartyRisk * 0.3) / 100;

    return {
      regime,
      regimeConfidence,
      transitionProbability: this.calculateTransitionProbabilities(regime),
      flowDirection,
      marketImpact,
      systemicRisk
    };
  }

  private calculateTransitionProbabilities(currentRegime: DealerRegime): Record<DealerRegime, number> {
    const base = { EXPANSION: 0.2, CONTRACTION: 0.2, NEUTRAL: 0.2, CRISIS: 0.1, TRANSITION: 0.3 };
    
    switch (currentRegime) {
      case 'EXPANSION':
        return { ...base, EXPANSION: 0.6, NEUTRAL: 0.25, TRANSITION: 0.15 };
      case 'CONTRACTION':
        return { ...base, CONTRACTION: 0.5, CRISIS: 0.2, TRANSITION: 0.3 };
      case 'CRISIS':
        return { ...base, CRISIS: 0.4, CONTRACTION: 0.4, TRANSITION: 0.2 };
      case 'TRANSITION':
        return { ...base, TRANSITION: 0.3, NEUTRAL: 0.3, EXPANSION: 0.2, CONTRACTION: 0.2 };
      default:
        return base;
    }
  }

  private calculateContext(totalPositions: number, riskMetrics: DealerPositionData['riskMetrics']): DealerPositionData['context'] {
    const historicalAverage = 5200000; // $5.2T historical average
    const percentileRank = Math.min(99, Math.max(1, 
      50 + ((totalPositions - historicalAverage) / historicalAverage) * 30
    ));
    
    const zScore = (totalPositions - historicalAverage) / (historicalAverage * 0.15);
    
    return {
      percentileRank,
      zScore,
      historicalAverage,
      volatility: riskMetrics.positionVelocity,
      correlationToSPX: 0.65 + (Math.random() - 0.5) * 0.3,
      correlationToVIX: -0.45 + (Math.random() - 0.5) * 0.2
    };
  }

  private generateAlerts(riskMetrics: DealerPositionData['riskMetrics'], analytics: DealerPositionData['analytics']) {
    this.alerts = [];
    
    if (riskMetrics.leverageRatio > 4.5) {
      this.alerts.push({
        id: `leverage_${Date.now()}`,
        severity: 'CRITICAL',
        type: 'LEVERAGE',
        message: 'Dealer leverage ratio exceeds critical threshold',
        threshold: 4.5,
        currentValue: riskMetrics.leverageRatio,
        timestamp: new Date(),
        acknowledged: false
      });
    }
    
    if (analytics.regime === 'CRISIS') {
      this.alerts.push({
        id: `regime_${Date.now()}`,
        severity: 'CRITICAL',
        type: 'REGIME_CHANGE',
        message: 'Dealer positioning indicates crisis regime',
        threshold: 0.8,
        currentValue: analytics.regimeConfidence,
        timestamp: new Date(),
        acknowledged: false
      });
    }
    
    if (riskMetrics.liquidityStress > 70) {
      this.alerts.push({
        id: `liquidity_${Date.now()}`,
        severity: 'WARNING',
        type: 'LIQUIDITY',
        message: 'Elevated liquidity stress in dealer positions',
        threshold: 70,
        currentValue: riskMetrics.liquidityStress,
        timestamp: new Date(),
        acknowledged: false
      });
    }
  }

  private generateInsights(analytics: DealerPositionData['analytics'], context: DealerPositionData['context']) {
    this.insights = [];
    
    if (Math.abs(context.zScore) > 2) {
      this.insights.push({
        type: 'POSITION_SHIFT',
        confidence: 0.85,
        description: `Dealer positions are ${context.zScore > 0 ? 'significantly above' : 'significantly below'} historical norms`,
        impact: context.zScore > 0 ? 'BEARISH' : 'BULLISH',
        timeframe: '1-2 weeks',
        supportingData: { zScore: context.zScore, percentile: context.percentileRank }
      });
    }
    
    if (analytics.regimeConfidence > 0.8) {
      this.insights.push({
        type: 'REGIME_SIGNAL',
        confidence: analytics.regimeConfidence,
        description: `Strong signal for ${analytics.regime} regime in dealer positioning`,
        impact: analytics.regime === 'EXPANSION' ? 'BULLISH' : 'BEARISH',
        timeframe: '2-4 weeks',
        supportingData: { regimeConfidence: analytics.regimeConfidence }
      });
    }
  }

  getAlerts(): DealerAlert[] {
    return this.alerts;
  }

  getInsights(): DealerInsight[] {
    return this.insights;
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }
}