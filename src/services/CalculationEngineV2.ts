/**
 * Calculation Engine V2 - Enhanced Calculation Framework
 * Handles computed indicators with dependencies and transformations
 */

import { UniversalIndicatorData } from './UniversalDataServiceV3';
import { IndicatorRegistry } from './IndicatorRegistry';

export interface CalculatedIndicator {
  id: string;
  formula: string;
  dependencies: string[];
  transformFunction?: string;
  unit?: string;
  description?: string;
}

export interface CalculationContext {
  data: Map<string, UniversalIndicatorData>;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class CalculationEngineV2 {
  private static instance: CalculationEngineV2;
  private calculatedIndicators: Map<string, CalculatedIndicator> = new Map();
  private calculationCache: Map<string, { result: UniversalIndicatorData; expiry: number }> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes

  private constructor() {
    this.initializeCalculatedIndicators();
  }

  static getInstance(): CalculationEngineV2 {
    if (!CalculationEngineV2.instance) {
      CalculationEngineV2.instance = new CalculationEngineV2();
    }
    return CalculationEngineV2.instance;
  }

  /**
   * Initialize all calculated indicators
   */
  private initializeCalculatedIndicators(): void {
    // Net Liquidity: Fed Balance Sheet - Treasury Account - Reverse Repo
    this.registerCalculatedIndicator({
      id: 'net-liquidity',
      formula: 'WALCL - WTREGEN - RRPONTSYD',
      dependencies: ['fed-balance-sheet', 'treasury-general-account', 'reverse-repo-operations'],
      unit: 'Trillions USD',
      description: 'Net global liquidity calculation',
      transformFunction: 'convertToTrillions'
    });

    // Credit Stress Index: Aggregate of credit spreads
    this.registerCalculatedIndicator({
      id: 'credit-stress',
      formula: 'WEIGHTED_AVERAGE(BAMLH0A0HYM2 * 0.6, BAMLC0A0CM * 0.4)',
      dependencies: ['high-yield-spread', 'investment-grade-spread'],
      unit: 'bps',
      description: 'Weighted credit stress indicator',
      transformFunction: 'aggregateCreditSpreads'
    });

    // Term Spread: 10Y - 2Y Treasury Yields
    this.registerCalculatedIndicator({
      id: 'term-spread',
      formula: 'GS10 - GS2',
      dependencies: ['10y-treasury-yield', '2y-treasury-yield'],
      unit: '%',
      description: '10Y-2Y yield curve spread'
    });

    // Real Interest Rate: Fed Funds - PCE Inflation (YoY)
    this.registerCalculatedIndicator({
      id: 'real-fed-funds-rate',
      formula: 'DFF - PCE_YOY',
      dependencies: ['federal-funds-rate', 'pce-inflation'],
      unit: '%',
      description: 'Real federal funds rate',
      transformFunction: 'calculateRealRate'
    });

    // Enhanced Momentum Score
    this.registerCalculatedIndicator({
      id: 'enhanced-momentum',
      formula: 'MOMENTUM_COMPOSITE(SP500, NASDAQ, VIX_INV, BTC, ETH)',
      dependencies: ['sp500', 'nasdaq', 'vix', 'btc-price', 'eth-price'],
      unit: 'Score',
      description: 'Multi-asset momentum score',
      transformFunction: 'calculateMomentumComposite'
    });

    // Dollar Strength Index (alternative DXY)
    this.registerCalculatedIndicator({
      id: 'dollar-strength-index',
      formula: 'BASKET_WEIGHTED(EUR_USD_INV, GBP_USD_INV, JPY_USD, CHF_USD_INV)',
      dependencies: ['eur-usd', 'gbp-usd', 'usd-jpy'],
      unit: 'Index',
      description: 'Alternative dollar strength calculation',
      transformFunction: 'calculateDollarBasket'
    });

    // Risk-On/Risk-Off Score
    this.registerCalculatedIndicator({
      id: 'risk-sentiment',
      formula: 'RISK_SCORE(SP500, VIX_INV, HYG_SPREAD_INV, GOLD_INV)',
      dependencies: ['sp500', 'vix', 'high-yield-spread', 'gold'],
      unit: 'Score',
      description: 'Market risk sentiment composite',
      transformFunction: 'calculateRiskSentiment'
    });
  }

  /**
   * Register a calculated indicator
   */
  registerCalculatedIndicator(indicator: CalculatedIndicator): void {
    this.calculatedIndicators.set(indicator.id, indicator);
  }

  /**
   * Calculate a specific indicator value
   */
  async calculateIndicator(
    indicatorId: string, 
    context: CalculationContext
  ): Promise<UniversalIndicatorData | null> {
    const cacheKey = `${indicatorId}_${context.timestamp.getTime()}`;
    const cached = this.calculationCache.get(cacheKey);
    
    if (cached && Date.now() < cached.expiry) {
      return cached.result;
    }

    const calculatedIndicator = this.calculatedIndicators.get(indicatorId);
    if (!calculatedIndicator) {
      console.warn(`No calculation defined for indicator: ${indicatorId}`);
      return null;
    }

    try {
      const result = await this.executeCalculation(calculatedIndicator, context);
      
      if (result) {
        this.calculationCache.set(cacheKey, {
          result,
          expiry: Date.now() + this.CACHE_TTL
        });
      }
      
      return result;
    } catch (error) {
      console.error(`Error calculating ${indicatorId}:`, error);
      return null;
    }
  }

  /**
   * Execute the calculation based on formula and transform function
   */
  private async executeCalculation(
    indicator: CalculatedIndicator,
    context: CalculationContext
  ): Promise<UniversalIndicatorData | null> {
    // Check if all dependencies are available
    const missingDeps = indicator.dependencies.filter(
      dep => !context.data.has(dep)
    );

    if (missingDeps.length > 0) {
      console.warn(`Missing dependencies for ${indicator.id}:`, missingDeps);
      return null;
    }

    // Apply specific transform function if defined
    if (indicator.transformFunction) {
      return this.applyTransformFunction(
        indicator.transformFunction,
        indicator,
        context
      );
    }

    // Default calculation using simple arithmetic
    return this.executeArithmeticCalculation(indicator, context);
  }

  /**
   * Apply specific transform functions
   */
  private applyTransformFunction(
    transformFunction: string,
    indicator: CalculatedIndicator,
    context: CalculationContext
  ): UniversalIndicatorData | null {
    switch (transformFunction) {
      case 'convertToTrillions':
        return this.calculateNetLiquidity(context);
      
      case 'aggregateCreditSpreads':
        return this.calculateCreditStress(context);
      
      case 'calculateMomentumComposite':
        return this.calculateMomentumComposite(context);
      
      case 'calculateRiskSentiment':
        return this.calculateRiskSentiment(context);
      
      case 'calculateDollarBasket':
        return this.calculateDollarBasket(context);
      
      case 'calculateRealRate':
        return this.calculateRealRate(indicator, context);
      
      default:
        console.warn(`Unknown transform function: ${transformFunction}`);
        return this.executeArithmeticCalculation(indicator, context);
    }
  }

  /**
   * Net Liquidity Calculation
   */
  private calculateNetLiquidity(context: CalculationContext): UniversalIndicatorData | null {
    const fedBs = context.data.get('fed-balance-sheet');
    const tga = context.data.get('treasury-general-account');
    const rrp = context.data.get('reverse-repo-operations');

    if (!fedBs || !tga || !rrp) return null;

    // Convert billions to trillions
    const netLiquidity = (fedBs.current - tga.current - rrp.current) / 1000;
    const prevNetLiquidity = fedBs.previous && tga.previous && rrp.previous 
      ? (fedBs.previous - tga.previous - rrp.previous) / 1000 
      : netLiquidity;

    return {
      symbol: 'NET_LIQ',
      current: netLiquidity,
      previous: prevNetLiquidity,
      change: netLiquidity - prevNetLiquidity,
      changePercent: ((netLiquidity - prevNetLiquidity) / prevNetLiquidity) * 100,
      timestamp: context.timestamp,
      confidence: Math.min(fedBs.confidence, tga.confidence, rrp.confidence),
      source: 'CALCULATED',
      provider: 'engine',
      metadata: {
        components: {
          fedBalanceSheet: fedBs.current,
          treasuryAccount: tga.current,
          reverseRepo: rrp.current
        }
      }
    };
  }

  /**
   * Credit Stress Calculation
   */
  private calculateCreditStress(context: CalculationContext): UniversalIndicatorData | null {
    const hySpread = context.data.get('high-yield-spread');
    const igSpread = context.data.get('investment-grade-spread');

    if (!hySpread || !igSpread) return null;

    // Weighted average: 60% HY, 40% IG
    const creditStress = (hySpread.current * 0.6) + (igSpread.current * 0.4);
    const prevCreditStress = hySpread.previous && igSpread.previous
      ? (hySpread.previous * 0.6) + (igSpread.previous * 0.4)
      : creditStress;

    return {
      symbol: 'CREDIT_STRESS',
      current: creditStress,
      previous: prevCreditStress,
      change: creditStress - prevCreditStress,
      changePercent: ((creditStress - prevCreditStress) / prevCreditStress) * 100,
      timestamp: context.timestamp,
      confidence: Math.min(hySpread.confidence, igSpread.confidence),
      source: 'CALCULATED',
      provider: 'engine',
      metadata: {
        components: {
          highYieldSpread: hySpread.current,
          investmentGradeSpread: igSpread.current,
          weights: { hy: 0.6, ig: 0.4 }
        }
      }
    };
  }

  /**
   * Enhanced Momentum Composite
   */
  private calculateMomentumComposite(context: CalculationContext): UniversalIndicatorData | null {
    const sp500 = context.data.get('sp500');
    const nasdaq = context.data.get('nasdaq');
    const vix = context.data.get('vix');
    const btc = context.data.get('btc-price');
    const eth = context.data.get('eth-price');

    if (!sp500 || !nasdaq || !vix) return null;

    // Calculate momentum scores (simplified)
    const sp500Momentum = sp500.changePercent || 0;
    const nasdaqMomentum = nasdaq.changePercent || 0;
    const vixMomentum = -(vix.changePercent || 0); // Inverse VIX
    const btcMomentum = btc?.changePercent || 0;
    const ethMomentum = eth?.changePercent || 0;

    // Weighted composite
    const momentum = (
      sp500Momentum * 0.3 +
      nasdaqMomentum * 0.2 +
      vixMomentum * 0.2 +
      btcMomentum * 0.15 +
      ethMomentum * 0.15
    );

    return {
      symbol: 'ENHANCED_MOMENTUM',
      current: momentum,
      previous: 0, // Would need historical calculation
      change: momentum,
      changePercent: momentum,
      timestamp: context.timestamp,
      confidence: 0.85,
      source: 'CALCULATED',
      provider: 'engine',
      metadata: {
        components: {
          sp500Momentum,
          nasdaqMomentum,
          vixMomentum,
          btcMomentum,
          ethMomentum
        }
      }
    };
  }

  /**
   * Risk Sentiment Calculation
   */
  private calculateRiskSentiment(context: CalculationContext): UniversalIndicatorData | null {
    const sp500 = context.data.get('sp500');
    const vix = context.data.get('vix');
    const hySpread = context.data.get('high-yield-spread');
    const gold = context.data.get('gold');

    if (!sp500 || !vix) return null;

    // Risk-on indicators (positive contribution)
    const riskOnScore = (sp500.changePercent || 0) - (vix.changePercent || 0);
    
    // Risk-off indicators (negative contribution)
    const riskOffScore = (hySpread?.changePercent || 0) + (gold?.changePercent || 0);
    
    const riskSentiment = riskOnScore - (riskOffScore * 0.5);

    return {
      symbol: 'RISK_SENTIMENT',
      current: riskSentiment,
      previous: 0,
      change: riskSentiment,
      changePercent: riskSentiment,
      timestamp: context.timestamp,
      confidence: 0.8,
      source: 'CALCULATED',
      provider: 'engine',
      metadata: {
        components: {
          riskOnScore,
          riskOffScore,
          netRiskSentiment: riskSentiment
        }
      }
    };
  }

  /**
   * Dollar Basket Calculation
   */
  private calculateDollarBasket(context: CalculationContext): UniversalIndicatorData | null {
    const eurUsd = context.data.get('eur-usd');
    const gbpUsd = context.data.get('gbp-usd');
    const usdJpy = context.data.get('usd-jpy');

    if (!eurUsd || !gbpUsd || !usdJpy) return null;

    // Calculate inverse rates and weight them
    const dollarStrength = (
      (1 / eurUsd.current) * 0.4 +  // EUR weight
      (1 / gbpUsd.current) * 0.3 +  // GBP weight
      usdJpy.current * 0.3           // JPY weight (already in USD terms)
    );

    return {
      symbol: 'DOLLAR_STRENGTH',
      current: dollarStrength,
      previous: dollarStrength, // Simplified
      change: 0,
      changePercent: 0,
      timestamp: context.timestamp,
      confidence: Math.min(eurUsd.confidence, gbpUsd.confidence, usdJpy.confidence),
      source: 'CALCULATED',
      provider: 'engine'
    };
  }

  /**
   * Real Interest Rate Calculation
   */
  private calculateRealRate(
    indicator: CalculatedIndicator,
    context: CalculationContext
  ): UniversalIndicatorData | null {
    const fedFunds = context.data.get('federal-funds-rate');
    const pceInflation = context.data.get('pce-inflation');

    if (!fedFunds || !pceInflation) return null;

    const realRate = fedFunds.current - (pceInflation.changePercent || 0);

    return {
      symbol: 'REAL_FED_FUNDS',
      current: realRate,
      previous: realRate,
      change: 0,
      changePercent: 0,
      timestamp: context.timestamp,
      confidence: Math.min(fedFunds.confidence, pceInflation.confidence),
      source: 'CALCULATED',
      provider: 'engine'
    };
  }

  /**
   * Simple arithmetic calculation fallback
   */
  private executeArithmeticCalculation(
    indicator: CalculatedIndicator,
    context: CalculationContext
  ): UniversalIndicatorData | null {
    // This is a simplified implementation
    // In production, you'd parse the formula properly
    const deps = indicator.dependencies.map(dep => context.data.get(dep)).filter(Boolean);
    
    if (deps.length < indicator.dependencies.length) return null;

    // Simple addition/subtraction for now
    let result = deps[0].current;
    if (indicator.formula.includes('-')) {
      for (let i = 1; i < deps.length; i++) {
        result -= deps[i].current;
      }
    } else if (indicator.formula.includes('+')) {
      for (let i = 1; i < deps.length; i++) {
        result += deps[i].current;
      }
    }

    return {
      symbol: indicator.id.toUpperCase(),
      current: result,
      previous: result,
      change: 0,
      changePercent: 0,
      timestamp: context.timestamp,
      confidence: Math.min(...deps.map(d => d.confidence)),
      source: 'CALCULATED',
      provider: 'engine'
    };
  }

  /**
   * Get all registered calculated indicators
   */
  getCalculatedIndicators(): string[] {
    return Array.from(this.calculatedIndicators.keys());
  }

  /**
   * Check if an indicator is calculated
   */
  isCalculatedIndicator(indicatorId: string): boolean {
    return this.calculatedIndicators.has(indicatorId);
  }

  /**
   * Get dependencies for a calculated indicator
   */
  getDependencies(indicatorId: string): string[] {
    const indicator = this.calculatedIndicators.get(indicatorId);
    return indicator?.dependencies || [];
  }
}

export default CalculationEngineV2;