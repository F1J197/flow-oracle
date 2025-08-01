import { BaseEngine, EngineConfig, EngineOutput } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'regime-classifier',
  name: 'AI Regime Classification Engine',
  pillar: 5,
  priority: 92,
  updateInterval: 600000, // 10 minutes
  requiredIndicators: ['VIX', 'SPX', 'DXY', 'TNX', 'GOLD', 'OIL']
};

export interface RegimeFeatures {
  volatility: number;
  momentum: number;
  liquidity: number;
  credit: number;
  crossAsset: number;
  macro: number;
}

export interface RegimeClassification {
  regime: 'GOLDILOCKS' | 'REFLATION' | 'STAGFLATION' | 'DEFLATION' | 'RISK_OFF' | 'CRISIS';
  probability: number;
  confidence: number;
  alternativeRegimes: { regime: string; probability: number }[];
  shapValues: ShapValue[];
  featureImportance: RegimeFeatures;
}

export interface ShapValue {
  feature: string;
  contribution: number;
  baseValue: number;
  featureValue: number;
  description: string;
}

export class RegimeClassifierEngine extends BaseEngine {
  private readonly REGIME_DEFINITIONS = {
    GOLDILOCKS: {
      description: 'Low inflation, steady growth, low volatility',
      characteristics: { vix: [10, 18], growth: [2, 4], inflation: [1, 3] }
    },
    REFLATION: {
      description: 'Rising growth and inflation expectations',
      characteristics: { vix: [15, 25], growth: [3, 6], inflation: [2, 5] }
    },
    STAGFLATION: {
      description: 'High inflation, low growth',
      characteristics: { vix: [20, 35], growth: [-1, 2], inflation: [4, 8] }
    },
    DEFLATION: {
      description: 'Falling prices, economic contraction',
      characteristics: { vix: [25, 45], growth: [-3, 1], inflation: [-2, 1] }
    },
    RISK_OFF: {
      description: 'Flight to quality, risk asset selloff',
      characteristics: { vix: [30, 50], growth: [0, 3], inflation: [0, 4] }
    },
    CRISIS: {
      description: 'Systemic stress, market dysfunction',
      characteristics: { vix: [40, 100], growth: [-5, 0], inflation: [-1, 6] }
    }
  };

  private readonly FEATURE_WEIGHTS = {
    volatility: 0.25,
    momentum: 0.20,
    liquidity: 0.20,
    credit: 0.15,
    crossAsset: 0.10,
    macro: 0.10
  };

  // Mock XGBoost model weights (would be trained model in production)
  private readonly MODEL_WEIGHTS = {
    GOLDILOCKS: { volatility: -0.8, momentum: 0.6, liquidity: 0.7, credit: 0.5, crossAsset: 0.3, macro: 0.4 },
    REFLATION: { volatility: -0.3, momentum: 0.8, liquidity: 0.4, credit: 0.2, crossAsset: 0.6, macro: 0.7 },
    STAGFLATION: { volatility: 0.5, momentum: -0.4, liquidity: -0.6, credit: -0.3, crossAsset: 0.2, macro: -0.5 },
    DEFLATION: { volatility: 0.6, momentum: -0.7, liquidity: -0.8, credit: -0.7, crossAsset: -0.4, macro: -0.8 },
    RISK_OFF: { volatility: 0.9, momentum: -0.6, liquidity: -0.5, credit: -0.6, crossAsset: -0.2, macro: -0.3 },
    CRISIS: { volatility: 1.0, momentum: -0.9, liquidity: -0.9, credit: -0.9, crossAsset: -0.7, macro: -0.6 }
  };

  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    // Extract market indicators
    const features = this.extractFeatures(data);
    
    // Classify regime using ensemble model
    const classification = this.classifyRegime(features);
    
    // Calculate SHAP values for explainability
    const shapValues = this.calculateShapValues(features, classification.regime);
    
    // Generate confidence based on model certainty
    const confidence = this.calculateModelConfidence(classification);
    
    // Determine signal based on regime
    const signal = this.determineSignal(classification.regime);

    return {
      primaryMetric: {
        value: classification.probability * 100,
        change24h: 2.1, // Would calculate from historical
        changePercent: 3.4
      },
      signal,
      confidence,
      analysis: this.generateRegimeAnalysis(classification, shapValues),
      subMetrics: {
        regime: classification.regime,
        probability: classification.probability,
        alternativeRegimes: classification.alternativeRegimes,
        shapValues,
        featureImportance: classification.featureImportance,
        modelConfidence: confidence,
        regimeDescription: this.REGIME_DEFINITIONS[classification.regime].description,
        regimeCharacteristics: this.REGIME_DEFINITIONS[classification.regime].characteristics,
        transitionProbability: this.calculateTransitionProbability(classification)
      }
    };
  }

  private extractFeatures(data: Map<string, any>): RegimeFeatures {
    // Extract and normalize features from market data
    const vix = this.extractLatestValue(data.get('VIX')) || 16;
    const spx = this.extractLatestValue(data.get('SPX')) || 4500;
    const dxy = this.extractLatestValue(data.get('DXY')) || 103;
    const tnx = this.extractLatestValue(data.get('TNX')) || 4.5;
    const gold = this.extractLatestValue(data.get('GOLD')) || 2000;
    const oil = this.extractLatestValue(data.get('OIL')) || 75;

    // Calculate normalized features (0-1 scale)
    const volatility = this.normalizeVolatility(vix);
    const momentum = this.calculateMomentum(spx);
    const liquidity = this.calculateLiquidityScore(vix, tnx);
    const credit = this.calculateCreditScore(tnx);
    const crossAsset = this.calculateCrossAssetScore(gold, oil, dxy);
    const macro = this.calculateMacroScore(tnx, dxy);

    return {
      volatility,
      momentum,
      liquidity,
      credit,
      crossAsset,
      macro
    };
  }

  private normalizeVolatility(vix: number): number {
    // Normalize VIX to 0-1 scale (10-50 range)
    return Math.max(0, Math.min(1, (vix - 10) / 40));
  }

  private calculateMomentum(spx: number): number {
    // Mock momentum calculation - would use actual historical data
    const mockReturns = (Math.random() - 0.5) * 0.1; // -5% to +5%
    return Math.max(0, Math.min(1, (mockReturns + 0.05) / 0.1));
  }

  private calculateLiquidityScore(vix: number, tnx: number): number {
    // Combine VIX and rates for liquidity proxy
    const vixComponent = 1 - this.normalizeVolatility(vix); // Inverse VIX
    const rateComponent = Math.max(0, Math.min(1, (6 - tnx) / 6)); // Lower rates = more liquidity
    return (vixComponent * 0.7) + (rateComponent * 0.3);
  }

  private calculateCreditScore(tnx: number): number {
    // Mock credit score based on rates
    return Math.max(0, Math.min(1, (6 - tnx) / 6));
  }

  private calculateCrossAssetScore(gold: number, oil: number, dxy: number): number {
    // Mock cross-asset momentum
    const goldScore = (gold - 1800) / 400; // Normalize around $2000
    const oilScore = (oil - 60) / 40; // Normalize around $80
    const dxyScore = (100 - dxy) / 20; // Inverse DXY
    
    return Math.max(0, Math.min(1, (goldScore + oilScore + dxyScore) / 3 + 0.5));
  }

  private calculateMacroScore(tnx: number, dxy: number): number {
    // Mock macro score
    const rateScore = (tnx - 2) / 6; // Normalize rates
    const dollarScore = (dxy - 90) / 20; // Normalize DXY
    
    return Math.max(0, Math.min(1, (rateScore + dollarScore) / 2));
  }

  private classifyRegime(features: RegimeFeatures): RegimeClassification {
    // Ensemble classification using mock XGBoost-style scoring
    const regimeScores: { [key: string]: number } = {};
    
    // Calculate scores for each regime
    Object.entries(this.MODEL_WEIGHTS).forEach(([regime, weights]) => {
      let score = 0;
      score += features.volatility * weights.volatility;
      score += features.momentum * weights.momentum;
      score += features.liquidity * weights.liquidity;
      score += features.credit * weights.credit;
      score += features.crossAsset * weights.crossAsset;
      score += features.macro * weights.macro;
      
      regimeScores[regime] = score;
    });

    // Apply softmax to get probabilities
    const softmaxScores = this.applySoftmax(regimeScores);
    
    // Get primary regime and alternatives
    const sortedRegimes = Object.entries(softmaxScores)
      .sort(([,a], [,b]) => b - a);
    
    const primaryRegime = sortedRegimes[0][0] as RegimeClassification['regime'];
    const primaryProbability = sortedRegimes[0][1];
    
    const alternativeRegimes = sortedRegimes.slice(1, 4).map(([regime, prob]) => ({
      regime,
      probability: prob
    }));

    return {
      regime: primaryRegime,
      probability: primaryProbability,
      confidence: this.calculateClassificationConfidence(primaryProbability, alternativeRegimes),
      alternativeRegimes,
      shapValues: [],
      featureImportance: features
    };
  }

  private applySoftmax(scores: { [key: string]: number }): { [key: string]: number } {
    const maxScore = Math.max(...Object.values(scores));
    const expScores: { [key: string]: number } = {};
    let sumExp = 0;
    
    Object.entries(scores).forEach(([regime, score]) => {
      expScores[regime] = Math.exp(score - maxScore);
      sumExp += expScores[regime];
    });
    
    const probabilities: { [key: string]: number } = {};
    Object.entries(expScores).forEach(([regime, expScore]) => {
      probabilities[regime] = expScore / sumExp;
    });
    
    return probabilities;
  }

  private calculateShapValues(features: RegimeFeatures, regime: string): ShapValue[] {
    const weights = this.MODEL_WEIGHTS[regime as keyof typeof this.MODEL_WEIGHTS];
    const baselineValue = 0.16667; // 1/6 for uniform distribution
    
    return Object.entries(features).map(([feature, value]) => {
      const weight = weights[feature as keyof typeof weights];
      const contribution = value * weight;
      
      return {
        feature,
        contribution,
        baseValue: baselineValue,
        featureValue: value,
        description: this.getFeatureDescription(feature, value, contribution)
      };
    });
  }

  private getFeatureDescription(feature: string, value: number, contribution: number): string {
    const impact = contribution > 0 ? 'increases' : 'decreases';
    const strength = Math.abs(contribution) > 0.5 ? 'strongly' : 'moderately';
    
    return `${feature} (${(value * 100).toFixed(1)}%) ${strength} ${impact} regime probability`;
  }

  private calculateClassificationConfidence(primary: number, alternatives: any[]): number {
    const secondBest = alternatives[0]?.probability || 0;
    const gap = primary - secondBest;
    
    // Higher gap = higher confidence
    return Math.min(100, 60 + (gap * 200));
  }

  private calculateModelConfidence(classification: RegimeClassification): number {
    let confidence = classification.confidence;
    
    // Boost confidence for extreme regimes with high probability
    if ((classification.regime === 'CRISIS' || classification.regime === 'GOLDILOCKS') && 
        classification.probability > 0.7) {
      confidence += 10;
    }
    
    // Reduce confidence for uncertain classifications
    if (classification.probability < 0.4) {
      confidence -= 20;
    }
    
    return Math.max(0, Math.min(100, confidence));
  }

  private calculateTransitionProbability(classification: RegimeClassification): any {
    // Mock transition probabilities to other regimes
    const transitions: { [key: string]: number } = {};
    
    classification.alternativeRegimes.forEach(alt => {
      transitions[alt.regime] = alt.probability * 0.3; // 30% of alternative probability
    });
    
    return transitions;
  }

  private determineSignal(regime: RegimeClassification['regime']): EngineOutput['signal'] {
    switch (regime) {
      case 'GOLDILOCKS':
      case 'REFLATION':
        return 'RISK_ON';
      case 'CRISIS':
      case 'DEFLATION':
        return 'RISK_OFF';
      case 'STAGFLATION':
      case 'RISK_OFF':
        return 'WARNING';
      default:
        return 'NEUTRAL';
    }
  }

  private generateRegimeAnalysis(classification: RegimeClassification, shapValues: ShapValue[]): string {
    const { regime, probability } = classification;
    const definition = this.REGIME_DEFINITIONS[regime];
    
    let analysis = `Market regime: ${regime} with ${(probability * 100).toFixed(1)}% probability. `;
    analysis += `${definition.description}. `;
    
    // Add top contributing factors
    const topContributors = shapValues
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      .slice(0, 2);
    
    if (topContributors.length > 0) {
      const topFactor = topContributors[0];
      analysis += `Primary driver: ${topFactor.feature} `;
      analysis += topFactor.contribution > 0 ? 'supporting' : 'contradicting';
      analysis += ' this regime classification.';
    }
    
    return analysis;
  }

  validateData(data: Map<string, any>): boolean {
    const requiredIndicators = ['VIX', 'SPX', 'DXY'];
    return requiredIndicators.every(indicator => data.has(indicator));
  }
}