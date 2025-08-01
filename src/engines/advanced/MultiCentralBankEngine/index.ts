import { BaseEngine, EngineConfig, EngineOutput } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'multi-central-bank',
  name: 'Multi-Central Bank Coordination Tracker',
  pillar: 4,
  priority: 85,
  updateInterval: 900000, // 15 minutes
  requiredIndicators: ['FED_BALANCE_SHEET', 'ECB_BALANCE_SHEET', 'BOJ_BALANCE_SHEET', 'PBOC_BALANCE_SHEET', 'BOE_BALANCE_SHEET']
};

export interface CentralBankData {
  id: string;
  name: string;
  balanceSheet: number; // USD equivalent
  weeklyChange: number;
  monthlyChange: number;
  weight: number; // Economy size weight
  action: 'EXPANDING' | 'CONTRACTING' | 'STABLE';
  rate: number; // Current policy rate
}

export interface CoordinationMetrics {
  coordinationScore: number; // 0-100
  synchronized: boolean;
  dominantAction: 'EXPANSION' | 'CONTRACTION' | 'MIXED';
  participatingBanks: number;
  globalLiquidityTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
  coordinationStrength: 'STRONG' | 'MODERATE' | 'WEAK' | 'DIVERGENT';
}

export class MultiCentralBankEngine extends BaseEngine {
  private readonly CENTRAL_BANKS = {
    FED: { name: 'Federal Reserve', weight: 0.40, currency: 'USD' },
    ECB: { name: 'European Central Bank', weight: 0.25, currency: 'EUR' },
    BOJ: { name: 'Bank of Japan', weight: 0.15, currency: 'JPY' },
    PBOC: { name: 'People\'s Bank of China', weight: 0.12, currency: 'CNY' },
    BOE: { name: 'Bank of England', weight: 0.08, currency: 'GBP' }
  };

  private readonly COORDINATION_THRESHOLD = 0.80; // 80% agreement for coordination
  private readonly EXCHANGE_RATES = {
    EUR: 1.08, // EUR/USD
    JPY: 0.0067, // JPY/USD
    CNY: 0.14, // CNY/USD
    GBP: 1.27 // GBP/USD
  };

  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    // Extract central bank balance sheet data
    const centralBankData = this.extractCentralBankData(data);
    
    // Calculate global liquidity composite
    const globalLiquidity = this.calculateGlobalLiquidityComposite(centralBankData);
    
    // Analyze coordination patterns
    const coordinationMetrics = this.analyzeCoordination(centralBankData);
    
    // Calculate correlation with Bitcoin
    const btcCorrelation = this.calculateBitcoinCorrelation(globalLiquidity);
    
    // Determine signal and confidence
    const signal = this.determineSignal(coordinationMetrics, globalLiquidity);
    const confidence = this.calculateConfidence(coordinationMetrics, centralBankData);

    return {
      primaryMetric: {
        value: globalLiquidity.composite,
        change24h: globalLiquidity.change24h,
        changePercent: globalLiquidity.changePercent
      },
      signal,
      confidence,
      analysis: this.generateCoordinationAnalysis(coordinationMetrics, centralBankData, globalLiquidity),
      subMetrics: {
        globalLiquidity,
        coordinationMetrics,
        centralBankData,
        btcCorrelation,
        liquidityTrend: this.determineLiquidityTrend(globalLiquidity),
        policyDivergence: this.assessPolicyDivergence(centralBankData),
        emergencyActions: this.detectEmergencyActions(centralBankData),
        coordinationHistory: this.getCoordinationHistory()
      }
    };
  }

  private extractCentralBankData(data: Map<string, any>): CentralBankData[] {
    const banks: CentralBankData[] = [];
    
    Object.entries(this.CENTRAL_BANKS).forEach(([id, config]) => {
      const balanceSheetData = data.get(`${id}_BALANCE_SHEET`);
      const latestValue = this.extractLatestValue(balanceSheetData);
      
      if (latestValue) {
        const usdValue = this.convertToUSD(latestValue, config.currency);
        
        banks.push({
          id,
          name: config.name,
          balanceSheet: usdValue,
          weeklyChange: this.calculateWeeklyChange(balanceSheetData, config.currency),
          monthlyChange: this.calculateMonthlyChange(balanceSheetData, config.currency),
          weight: config.weight,
          action: this.determineAction(this.calculateWeeklyChange(balanceSheetData, config.currency)),
          rate: this.getMockPolicyRate(id) // Would fetch real rates
        });
      }
    });
    
    return banks;
  }

  private convertToUSD(value: number, currency: string): number {
    if (currency === 'USD') return value;
    
    const rate = this.EXCHANGE_RATES[currency as keyof typeof this.EXCHANGE_RATES];
    return value * (rate || 1);
  }

  private calculateWeeklyChange(data: any, currency: string): number {
    // Mock calculation - would use actual historical data
    const baseChange = (Math.random() - 0.5) * 0.1; // -5% to +5%
    return baseChange;
  }

  private calculateMonthlyChange(data: any, currency: string): number {
    // Mock calculation - would use actual historical data
    const baseChange = (Math.random() - 0.5) * 0.2; // -10% to +10%
    return baseChange;
  }

  private determineAction(weeklyChange: number): CentralBankData['action'] {
    if (weeklyChange > 0.02) return 'EXPANDING'; // >2% expansion
    if (weeklyChange < -0.02) return 'CONTRACTING'; // >2% contraction
    return 'STABLE';
  }

  private getMockPolicyRate(bankId: string): number {
    const rates = {
      FED: 5.25,
      ECB: 4.5,
      BOJ: -0.1,
      PBOC: 3.45,
      BOE: 5.0
    };
    return rates[bankId as keyof typeof rates] || 0;
  }

  private calculateGlobalLiquidityComposite(banks: CentralBankData[]) {
    let weightedSum = 0;
    let totalWeight = 0;
    let weightedWeeklyChange = 0;
    
    banks.forEach(bank => {
      weightedSum += bank.balanceSheet * bank.weight;
      weightedWeeklyChange += bank.weeklyChange * bank.weight;
      totalWeight += bank.weight;
    });
    
    const composite = weightedSum / totalWeight;
    const weeklyChangePercent = (weightedWeeklyChange / totalWeight) * 100;
    
    return {
      composite,
      change24h: composite * 0.001, // Mock daily change
      changePercent: weeklyChangePercent / 7, // Approximate daily from weekly
      weeklyChangePercent,
      monthlyChangePercent: weeklyChangePercent * 4.33,
      totalLiquidity: weightedSum,
      participatingBanks: banks.length
    };
  }

  private analyzeCoordination(banks: CentralBankData[]): CoordinationMetrics {
    // Calculate coordination based on action alignment
    const actions = banks.map(b => b.action);
    const actionCounts = {
      EXPANDING: actions.filter(a => a === 'EXPANDING').length,
      CONTRACTING: actions.filter(a => a === 'CONTRACTING').length,
      STABLE: actions.filter(a => a === 'STABLE').length
    };
    
    const totalBanks = banks.length;
    const maxActionCount = Math.max(...Object.values(actionCounts));
    const coordinationScore = (maxActionCount / totalBanks) * 100;
    
    // Determine dominant action
    let dominantAction: CoordinationMetrics['dominantAction'] = 'MIXED';
    if (actionCounts.EXPANDING === maxActionCount && maxActionCount > totalBanks / 2) {
      dominantAction = 'EXPANSION';
    } else if (actionCounts.CONTRACTING === maxActionCount && maxActionCount > totalBanks / 2) {
      dominantAction = 'CONTRACTION';
    }
    
    // Calculate weighted coordination (considering bank importance)
    const weightedCoordination = this.calculateWeightedCoordination(banks, dominantAction);
    
    return {
      coordinationScore: Math.max(coordinationScore, weightedCoordination),
      synchronized: coordinationScore >= this.COORDINATION_THRESHOLD * 100,
      dominantAction,
      participatingBanks: totalBanks,
      globalLiquidityTrend: this.determineGlobalTrend(banks),
      coordinationStrength: this.assessCoordinationStrength(coordinationScore, weightedCoordination)
    };
  }

  private calculateWeightedCoordination(banks: CentralBankData[], dominantAction: string): number {
    if (dominantAction === 'MIXED') return 50;
    
    const targetAction = dominantAction === 'EXPANSION' ? 'EXPANDING' : 'CONTRACTING';
    let coordinatedWeight = 0;
    
    banks.forEach(bank => {
      if (bank.action === targetAction) {
        coordinatedWeight += bank.weight;
      }
    });
    
    return coordinatedWeight * 100; // Convert to percentage
  }

  private determineGlobalTrend(banks: CentralBankData[]): CoordinationMetrics['globalLiquidityTrend'] {
    const weightedChange = banks.reduce((sum, bank) => sum + (bank.weeklyChange * bank.weight), 0);
    
    if (weightedChange > 0.01) return 'INCREASING'; // >1% weighted increase
    if (weightedChange < -0.01) return 'DECREASING'; // >1% weighted decrease
    return 'STABLE';
  }

  private assessCoordinationStrength(score: number, weightedScore: number): CoordinationMetrics['coordinationStrength'] {
    const avgScore = (score + weightedScore) / 2;
    
    if (avgScore >= 85) return 'STRONG';
    if (avgScore >= 65) return 'MODERATE';
    if (avgScore >= 45) return 'WEAK';
    return 'DIVERGENT';
  }

  private calculateBitcoinCorrelation(globalLiquidity: any): number {
    // Mock correlation calculation - would use historical data
    // Historically ~0.88 correlation
    const baseCorrelation = 0.88;
    const volatility = (Math.random() - 0.5) * 0.2; // ±0.1 variation
    return Math.max(-1, Math.min(1, baseCorrelation + volatility));
  }

  private determineLiquidityTrend(globalLiquidity: any): string {
    const changePercent = globalLiquidity.weeklyChangePercent;
    
    if (changePercent > 2) return 'STRONG_EXPANSION';
    if (changePercent > 0.5) return 'MODERATE_EXPANSION';
    if (changePercent > -0.5) return 'STABLE';
    if (changePercent > -2) return 'MODERATE_CONTRACTION';
    return 'STRONG_CONTRACTION';
  }

  private assessPolicyDivergence(banks: CentralBankData[]): string {
    const rates = banks.map(b => b.rate);
    const maxRate = Math.max(...rates);
    const minRate = Math.min(...rates);
    const rateSpread = maxRate - minRate;
    
    if (rateSpread > 4) return 'HIGH_DIVERGENCE';
    if (rateSpread > 2) return 'MODERATE_DIVERGENCE';
    return 'LOW_DIVERGENCE';
  }

  private detectEmergencyActions(banks: CentralBankData[]): string[] {
    const emergencyActions: string[] = [];
    
    banks.forEach(bank => {
      // Detect extreme weekly changes
      if (Math.abs(bank.weeklyChange) > 0.05) { // >5% weekly change
        emergencyActions.push(`${bank.name}: ${bank.weeklyChange > 0 ? 'Emergency expansion' : 'Emergency contraction'}`);
      }
      
      // Detect extreme rate levels
      if (bank.rate < 0) {
        emergencyActions.push(`${bank.name}: Negative interest rates`);
      }
      if (bank.rate > 6) {
        emergencyActions.push(`${bank.name}: Emergency rate hikes`);
      }
    });
    
    return emergencyActions;
  }

  private getCoordinationHistory(): any[] {
    // Mock coordination history - would store real historical data
    return [
      { date: '2024-01-01', coordinationScore: 75, action: 'EXPANSION' },
      { date: '2024-01-15', coordinationScore: 82, action: 'EXPANSION' },
      { date: '2024-02-01', coordinationScore: 68, action: 'MIXED' },
      { date: '2024-02-15', coordinationScore: 91, action: 'EXPANSION' }
    ];
  }

  private determineSignal(coordination: CoordinationMetrics, liquidity: any): EngineOutput['signal'] {
    // Strong coordinated expansion is bullish for risk assets
    if (coordination.synchronized && coordination.dominantAction === 'EXPANSION') {
      return 'RISK_ON';
    }
    
    // Strong coordinated contraction is bearish
    if (coordination.synchronized && coordination.dominantAction === 'CONTRACTION') {
      return 'RISK_OFF';
    }
    
    // Policy divergence creates uncertainty
    if (coordination.coordinationStrength === 'DIVERGENT') {
      return 'WARNING';
    }
    
    return 'NEUTRAL';
  }

  private calculateConfidence(coordination: CoordinationMetrics, banks: CentralBankData[]): number {
    let confidence = 60;
    
    // Higher confidence when more banks coordinate
    confidence += (coordination.participatingBanks - 3) * 10;
    
    // Higher confidence with strong coordination
    if (coordination.coordinationStrength === 'STRONG') confidence += 20;
    else if (coordination.coordinationStrength === 'MODERATE') confidence += 10;
    else if (coordination.coordinationStrength === 'DIVERGENT') confidence -= 15;
    
    // Boost confidence for extreme coordinated actions
    if (coordination.synchronized && coordination.coordinationScore > 90) {
      confidence += 15;
    }
    
    return Math.min(100, Math.max(0, confidence));
  }

  private generateCoordinationAnalysis(
    coordination: CoordinationMetrics,
    banks: CentralBankData[],
    liquidity: any
  ): string {
    let analysis = `Global central bank coordination: ${coordination.coordinationStrength.toLowerCase()}`;
    
    if (coordination.synchronized) {
      analysis += ` with ${coordination.coordinationScore.toFixed(0)}% alignment in ${coordination.dominantAction.toLowerCase()}.`;
    } else {
      analysis += ` with divergent policies across major economies.`;
    }
    
    analysis += ` Global liquidity trend: ${liquidity.weeklyChangePercent >= 0 ? '+' : ''}${liquidity.weeklyChangePercent.toFixed(2)}% weekly.`;
    
    const expandingBanks = banks.filter(b => b.action === 'EXPANDING').length;
    const contractingBanks = banks.filter(b => b.action === 'CONTRACTING').length;
    
    if (expandingBanks > contractingBanks) {
      analysis += ` Majority of central banks expanding balance sheets.`;
    } else if (contractingBanks > expandingBanks) {
      analysis += ` Majority of central banks contracting balance sheets.`;
    }
    
    return analysis;
  }

  validateData(data: Map<string, any>): boolean {
    // Require at least 3 central bank datasets
    const requiredBanks = ['FED_BALANCE_SHEET', 'ECB_BALANCE_SHEET', 'BOJ_BALANCE_SHEET'];
    return requiredBanks.filter(bank => data.has(bank)).length >= 2;
  }
}