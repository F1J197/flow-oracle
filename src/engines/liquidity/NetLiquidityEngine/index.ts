/**
 * Net Liquidity Engine - The Crown Jewel
 * Kalman-Adaptive Net Liquidity with dynamic alpha coefficient
 */

import { BaseEngine, EngineConfig, EngineOutput } from '@/engines/BaseEngine';
import { KalmanFilter } from '@/utils/KalmanFilter';

const config: EngineConfig = {
  id: 'net-liquidity',
  name: 'Net Liquidity Gauge',
  pillar: 1,
  priority: 95,
  updateInterval: 300000, // 5 minutes
  requiredIndicators: ['WALCL', 'WTREGEN', 'RRPONTSYD']
};

interface NetLiquidityMetrics {
  netLiquidity: number;
  alphaCoefficient: number;
  compositeScore: number;
  trend: 'EXPANDING' | 'CONTRACTING' | 'STABLE';
  regime: 'QE' | 'QT' | 'NEUTRAL';
  confidence: number;
}

export class NetLiquidityEngine extends BaseEngine {
  private kalmanFilter: KalmanFilter;
  private readonly ALPHA_BASE = 0.85; // Base treasury coefficient
  private readonly QE_THRESHOLD = 0.02; // 2% weekly expansion
  private readonly QT_THRESHOLD = -0.01; // 1% weekly contraction
  
  constructor() {
    super(config);
    
    // Initialize Kalman filter for alpha adaptation
    this.kalmanFilter = new KalmanFilter({
      initialEstimate: this.ALPHA_BASE,
      processNoise: 0.001,
      measurementNoise: 0.01,
      initialUncertainty: 0.1
    });
  }

  calculate(data: Map<string, any>): EngineOutput {
    // Extract Fed balance sheet components
    const walcl = this.extractLatestValue(data.get('WALCL')) || 7500; // Billions
    const wtregen = this.extractLatestValue(data.get('WTREGEN')) || 500;
    const rrpontsyd = this.extractLatestValue(data.get('RRPONTSYD')) || 2000;
    
    // Calculate adaptive alpha using Kalman filter
    const alphaCoefficient = this.calculateAdaptiveAlpha(walcl, wtregen);
    
    // Core Net Liquidity calculation
    const netLiquidity = walcl - (alphaCoefficient * wtregen) - rrpontsyd;
    
    // Calculate metrics
    const metrics = this.calculateMetrics(netLiquidity, walcl, alphaCoefficient);
    
    // Determine regime and trend
    const regime = this.determineRegime(metrics.trend, netLiquidity);
    const signal = this.determineSignal(regime, metrics.trend);
    
    // Calculate composite score (0-100)
    const compositeScore = this.calculateCompositeScore(netLiquidity, metrics.trend);
    
    return {
      primaryMetric: {
        value: netLiquidity,
        change24h: this.calculateChange24h(netLiquidity),
        changePercent: this.calculateChangePercent(netLiquidity)
      },
      signal,
      confidence: metrics.confidence,
      analysis: this.generateAnalysis(metrics, regime),
      subMetrics: {
        netLiquidity: Math.round(netLiquidity),
        alphaCoefficient: Number(alphaCoefficient.toFixed(3)),
        compositeScore: Math.round(compositeScore),
        regime,
        trend: metrics.trend,
        
        // Component breakdown
        fed_balance_sheet: Math.round(walcl),
        treasury_general_account: Math.round(wtregen),
        reverse_repo: Math.round(rrpontsyd),
        
        // Technical indicators
        qe_threshold: this.QE_THRESHOLD,
        qt_threshold: this.QT_THRESHOLD,
        alpha_adaptation: alphaCoefficient > this.ALPHA_BASE ? 'HAWKISH' : 'DOVISH',
        
        // Flow metrics
        weekly_change: this.calculateWeeklyChange(netLiquidity),
        momentum: this.calculateMomentum(netLiquidity),
        velocity: this.calculateVelocity(netLiquidity)
      }
    };
  }

  private calculateAdaptiveAlpha(walcl: number, wtregen: number): number {
    // Treasury issuance regime detection
    const treasuryRatio = wtregen / walcl;
    const regimeIndicator = treasuryRatio * 100; // Convert to basis points
    
    // Update Kalman filter with regime indicator
    this.kalmanFilter.update(regimeIndicator);
    
    // Get adapted alpha coefficient
    const kalmanState = this.kalmanFilter.getFullState();
    
    // Convert Kalman state back to alpha range (0.7 - 1.0)
    const normalizedAlpha = 0.7 + (kalmanState.estimate / 100) * 0.3;
    
    // Clamp alpha within reasonable bounds
    return Math.max(0.7, Math.min(1.0, normalizedAlpha));
  }

  private calculateMetrics(netLiquidity: number, walcl: number, alpha: number): NetLiquidityMetrics {
    // Get historical net liquidity for trend analysis
    const historical = this.getHistoricalData('netLiquidity') || [];
    historical.push(netLiquidity);
    
    // Keep last 50 data points
    if (historical.length > 50) {
      historical.shift();
    }
    
    // Calculate trend
    const trend = this.calculateTrend(historical);
    
    // Calculate confidence based on data quality and trend clarity
    const confidence = this.calculateConfidence(historical, alpha);
    
    // Calculate composite score
    const compositeScore = this.calculateCompositeScore(netLiquidity, trend);
    
    return {
      netLiquidity,
      alphaCoefficient: alpha,
      compositeScore,
      trend,
      regime: 'NEUTRAL', // Will be determined later
      confidence
    };
  }

  private calculateTrend(historical: number[]): 'EXPANDING' | 'CONTRACTING' | 'STABLE' {
    if (historical.length < 5) return 'STABLE';
    
    const recent = historical.slice(-5);
    const change = (recent[recent.length - 1] - recent[0]) / recent[0];
    
    if (change > this.QE_THRESHOLD) return 'EXPANDING';
    if (change < this.QT_THRESHOLD) return 'CONTRACTING';
    return 'STABLE';
  }

  private determineRegime(trend: string, netLiquidity: number): 'QE' | 'QT' | 'NEUTRAL' {
    // Historical context: Net liquidity above 4T typically bullish for risk assets
    const LIQUIDITY_THRESHOLD = 4000; // Billions
    
    if (trend === 'EXPANDING' && netLiquidity > LIQUIDITY_THRESHOLD) return 'QE';
    if (trend === 'CONTRACTING' && netLiquidity < LIQUIDITY_THRESHOLD) return 'QT';
    return 'NEUTRAL';
  }

  private determineSignal(regime: string, trend: string): EngineOutput['signal'] {
    if (regime === 'QE') return 'RISK_ON';
    if (regime === 'QT') return 'RISK_OFF';
    if (trend === 'EXPANDING') return 'RISK_ON';
    if (trend === 'CONTRACTING') return 'WARNING';
    return 'NEUTRAL';
  }

  private calculateCompositeScore(netLiquidity: number, trend: string): number {
    // Base score from absolute liquidity level
    const LIQUIDITY_MAX = 8000; // Historical maximum
    const LIQUIDITY_MIN = 2000; // Historical minimum
    
    let baseScore = ((netLiquidity - LIQUIDITY_MIN) / (LIQUIDITY_MAX - LIQUIDITY_MIN)) * 70;
    baseScore = Math.max(0, Math.min(70, baseScore));
    
    // Trend adjustment
    let trendAdjustment = 0;
    switch (trend) {
      case 'EXPANDING':
        trendAdjustment = 20;
        break;
      case 'CONTRACTING':
        trendAdjustment = -10;
        break;
      case 'STABLE':
        trendAdjustment = 5;
        break;
    }
    
    return Math.max(0, Math.min(100, baseScore + trendAdjustment));
  }

  private calculateConfidence(historical: number[], alpha: number): number {
    let confidence = 70; // Base confidence
    
    // Data sufficiency
    if (historical.length >= 20) confidence += 10;
    
    // Alpha stability (closer to base = more confident)
    const alphaDrift = Math.abs(alpha - this.ALPHA_BASE);
    if (alphaDrift < 0.05) confidence += 10;
    
    // Trend consistency
    if (historical.length >= 10) {
      const recentTrend = this.calculateTrend(historical.slice(-10));
      const olderTrend = this.calculateTrend(historical.slice(-20, -10));
      if (recentTrend === olderTrend) confidence += 10;
    }
    
    return Math.min(100, confidence);
  }

  private calculateChange24h(netLiquidity: number): number {
    // Mock calculation - would use actual historical data
    return (Math.random() - 0.5) * 100; // ±50B range
  }

  private calculateChangePercent(netLiquidity: number): number {
    const change24h = this.calculateChange24h(netLiquidity);
    return (change24h / netLiquidity) * 100;
  }

  private calculateWeeklyChange(netLiquidity: number): number {
    // Mock weekly change calculation
    return (Math.random() - 0.5) * 500; // ±250B range
  }

  private calculateMomentum(netLiquidity: number): number {
    // Rate of change calculation
    const historical = this.getHistoricalData('netLiquidity') || [];
    if (historical.length < 5) return 0;
    
    const recent = historical.slice(-5);
    let momentum = 0;
    for (let i = 1; i < recent.length; i++) {
      momentum += (recent[i] - recent[i-1]) / recent[i-1];
    }
    
    return momentum / (recent.length - 1);
  }

  private calculateVelocity(netLiquidity: number): number {
    // Second derivative (acceleration)
    const historical = this.getHistoricalData('netLiquidity') || [];
    if (historical.length < 3) return 0;
    
    const recent = historical.slice(-3);
    const velocity1 = recent[1] - recent[0];
    const velocity2 = recent[2] - recent[1];
    
    return velocity2 - velocity1;
  }

  private getHistoricalData(key: string): number[] | undefined {
    return this.historicalData.get(key);
  }

  private generateAnalysis(metrics: NetLiquidityMetrics, regime: string): string {
    let analysis = `Net Liquidity at $${(metrics.netLiquidity/1000).toFixed(1)}T `;
    
    analysis += `with ${metrics.trend.toLowerCase()} trend. `;
    
    if (regime === 'QE') {
      analysis += 'QE-like conditions favor risk assets. ';
    } else if (regime === 'QT') {
      analysis += 'QT-like conditions create headwinds. ';
    }
    
    analysis += `Alpha coefficient at ${metrics.alphaCoefficient.toFixed(3)} `;
    analysis += metrics.alphaCoefficient > this.ALPHA_BASE ? 
      'suggests hawkish Treasury operations.' : 
      'suggests dovish Treasury management.';
    
    return analysis;
  }

  validateData(data: Map<string, any>): boolean {
    const required = ['WALCL', 'WTREGEN', 'RRPONTSYD'];
    return required.every(indicator => data.has(indicator));
  }
}
