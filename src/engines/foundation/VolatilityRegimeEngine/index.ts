import { BaseEngine, EngineConfig, EngineOutput } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'volatility-regime',
  name: 'Volatility Regime Engine',
  pillar: 1,
  priority: 90,
  updateInterval: 300000, // 5 minutes
  requiredIndicators: ['VIX', 'VIX9D', 'VVIX', 'REALIZED_VOL', 'MOVE', 'CVIX']
};

export class VolatilityRegimeEngine extends BaseEngine {
  private readonly REGIME_THRESHOLDS = {
    CRISIS: { vix: 35, vix9d: 40, percentile: 95 },
    STRESSED: { vix: 25, vix9d: 30, percentile: 85 },
    ELEVATED: { vix: 20, vix9d: 22, percentile: 70 },
    NORMAL: { vix: 16, vix9d: 18, percentile: 50 },
    LOW_VOL: { vix: 12, vix9d: 14, percentile: 20 }
  };

  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    // Extract volatility indicators
    const vix = this.extractLatestValue(data.get('VIX')) || 16;
    const vix9d = this.extractLatestValue(data.get('VIX9D')) || vix * 1.1;
    const vvix = this.extractLatestValue(data.get('VVIX')) || 90;
    const realizedVol = this.extractLatestValue(data.get('REALIZED_VOL')) || 15;
    const move = this.extractLatestValue(data.get('MOVE')) || 100;
    const cvix = this.extractLatestValue(data.get('CVIX')) || 85;

    // Calculate regime
    const regime = this.determineRegime(vix, vix9d);
    const termStructure = this.calculateTermStructure(vix, vix9d);
    const volOfVol = this.calculateVolOfVol(vvix, vix);
    const crossAssetVol = this.analyzeCrossAssetVol(move, cvix, vix);
    
    // Calculate confidence based on indicator alignment
    const confidence = this.calculateConfidence(vix, vix9d, vvix, realizedVol);
    
    // Determine signal
    const signal = this.determineSignal(regime, termStructure, volOfVol);
    
    // Calculate percentile rank
    const percentileRank = this.calculatePercentileRank(vix);

    return {
      primaryMetric: {
        value: vix,
        change24h: 1.2, // Would calculate from historical
        changePercent: 7.5
      },
      signal,
      confidence,
      analysis: this.generateAnalysis(regime, vix, termStructure, volOfVol),
      subMetrics: {
        regime,
        vix,
        vix9d,
        vvix,
        realizedVol,
        termStructure,
        volOfVol,
        crossAssetVol,
        percentileRank,
        contango: termStructure > 0,
        backwardation: termStructure < 0
      }
    };
  }

  private determineRegime(vix: number, vix9d: number): string {
    const avgVix = (vix + vix9d) / 2;
    
    if (avgVix >= this.REGIME_THRESHOLDS.CRISIS.vix) return 'CRISIS';
    if (avgVix >= this.REGIME_THRESHOLDS.STRESSED.vix) return 'STRESSED';
    if (avgVix >= this.REGIME_THRESHOLDS.ELEVATED.vix) return 'ELEVATED';
    if (avgVix >= this.REGIME_THRESHOLDS.NORMAL.vix) return 'NORMAL';
    return 'LOW_VOL';
  }

  private calculateTermStructure(vix: number, vix9d: number): number {
    return ((vix9d - vix) / vix) * 100;
  }

  private calculateVolOfVol(vvix: number, vix: number): number {
    return vvix / vix;
  }

  private analyzeCrossAssetVol(move: number, cvix: number, vix: number): string {
    const normalizedMove = move / 100;
    const normalizedCvix = cvix / 85;
    const avgCrossAsset = (normalizedMove + normalizedCvix) / 2;
    
    if (avgCrossAsset > 1.2) return 'EXTREME';
    if (avgCrossAsset > 1.0) return 'HIGH';
    if (avgCrossAsset > 0.8) return 'NORMAL';
    return 'LOW';
  }

  private calculateConfidence(vix: number, vix9d: number, vvix: number, realizedVol: number): number {
    let confidence = 70;
    
    // Term structure alignment
    if ((vix9d > vix && vvix > 90) || (vix9d < vix && vvix < 90)) {
      confidence += 10;
    }
    
    // Realized vs implied alignment
    const volGap = Math.abs(vix - realizedVol) / vix;
    if (volGap < 0.2) confidence += 10;
    
    // Extreme readings boost confidence
    if (vix > 30 || vix < 12) confidence += 10;
    
    return Math.min(100, confidence);
  }

  private determineSignal(regime: string, termStructure: number, volOfVol: number): EngineOutput['signal'] {
    if (regime === 'CRISIS' || regime === 'STRESSED') return 'RISK_OFF';
    if (regime === 'LOW_VOL' && volOfVol < 5) return 'WARNING'; // Complacency
    if (regime === 'ELEVATED' && termStructure < -10) return 'WARNING'; // Inversion
    if (regime === 'NORMAL') return 'NEUTRAL';
    return 'RISK_ON';
  }

  private calculatePercentileRank(vix: number): number {
    // Simplified percentile calculation
    if (vix > 35) return 95;
    if (vix > 25) return 85;
    if (vix > 20) return 70;
    if (vix > 16) return 50;
    if (vix > 12) return 30;
    return 10;
  }

  private generateAnalysis(regime: string, vix: number, termStructure: number, volOfVol: number): string {
    let analysis = `Volatility regime: ${regime} with VIX at ${vix.toFixed(2)}. `;
    
    if (termStructure > 5) {
      analysis += 'Term structure in contango indicating normalized conditions. ';
    } else if (termStructure < -5) {
      analysis += 'Term structure inverted signaling near-term stress. ';
    }
    
    if (volOfVol > 6) {
      analysis += 'Elevated vol-of-vol suggests regime uncertainty. ';
    }
    
    return analysis;
  }

  validateData(data: Map<string, any>): boolean {
    return data.has('VIX');
  }
}