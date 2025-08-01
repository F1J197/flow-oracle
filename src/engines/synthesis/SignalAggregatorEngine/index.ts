/**
 * Signal Aggregator Engine - Master Signal Synthesis
 * Combines all engine outputs with intelligent conflict detection
 */

import { BaseEngine, EngineConfig, EngineOutput } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'signal-aggregator',
  name: 'Signal Aggregator',
  pillar: 5,
  priority: 95,
  updateInterval: 60000, // 1 minute - fastest synthesis
  requiredIndicators: [],
  dependencies: [
    'enhanced-momentum',
    'volatility-regime', 
    'net-liquidity',
    'credit-stress',
    'tail-risk'
  ]
};

interface SignalWeights {
  momentum: number;
  volatility: number;
  liquidity: number;
  credit: number;
  tail: number;
}

interface ConflictAnalysis {
  hasConflict: boolean;
  conflictLevel: 'LOW' | 'MODERATE' | 'HIGH';
  conflictingEngines: string[];
  dominantSignal: string;
  confidence: number;
}

interface MarketRegimeAnalysis {
  primary: 'BULL_MARKET' | 'BEAR_MARKET' | 'SIDEWAYS' | 'CRISIS';
  subRegime: string;
  confidence: number;
  duration: number; // estimated duration in weeks
  transitionProbability: number;
}

export class SignalAggregatorEngine extends BaseEngine {
  private readonly SIGNAL_WEIGHTS: SignalWeights = {
    momentum: 0.25,    // 25% weight
    volatility: 0.20,  // 20% weight
    liquidity: 0.25,   // 25% weight (highest with momentum)
    credit: 0.20,      // 20% weight
    tail: 0.10         // 10% weight (risk overlay)
  };

  private readonly CONFLICT_THRESHOLD = 0.4; // 40% disagreement = conflict
  private readonly CONFIDENCE_THRESHOLD = 70; // Minimum confidence for strong signal

  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    // Extract engine outputs
    const engineOutputs = this.extractEngineOutputs(data);
    
    // Validate we have minimum required engines
    if (engineOutputs.size < 3) {
      return this.getDefaultOutput();
    }

    // Calculate weighted signal consensus
    const signalConsensus = this.calculateSignalConsensus(engineOutputs);
    
    // Detect and analyze conflicts
    const conflictAnalysis = this.analyzeConflicts(engineOutputs);
    
    // Determine market regime
    const regimeAnalysis = this.analyzeMarketRegime(engineOutputs);
    
    // Calculate composite confidence
    const compositeConfidence = this.calculateCompositeConfidence(engineOutputs, conflictAnalysis);
    
    // Generate master signal
    const masterSignal = this.generateMasterSignal(signalConsensus, conflictAnalysis, compositeConfidence);
    
    // Calculate signal strength (0-100)
    const signalStrength = this.calculateSignalStrength(signalConsensus, compositeConfidence);

    return {
      primaryMetric: {
        value: signalStrength,
        change24h: this.calculateSignalChange(signalStrength),
        changePercent: this.calculateSignalChangePercent(signalStrength)
      },
      signal: masterSignal,
      confidence: compositeConfidence,
      analysis: this.generateAnalysis(signalConsensus, conflictAnalysis, regimeAnalysis),
      subMetrics: {
        // Core consensus metrics
        signal_strength: signalStrength,
        consensus_score: Math.round(signalConsensus.consensus * 100),
        conflict_level: conflictAnalysis.conflictLevel,
        has_conflict: conflictAnalysis.hasConflict,
        
        // Individual engine signals
        momentum_signal: engineOutputs.get('enhanced-momentum')?.signal || 'NEUTRAL',
        volatility_signal: engineOutputs.get('volatility-regime')?.signal || 'NEUTRAL', 
        liquidity_signal: engineOutputs.get('net-liquidity')?.signal || 'NEUTRAL',
        credit_signal: engineOutputs.get('credit-stress')?.signal || 'NEUTRAL',
        tail_signal: engineOutputs.get('tail-risk')?.signal || 'NEUTRAL',
        
        // Weighted contributions
        momentum_weight: this.SIGNAL_WEIGHTS.momentum,
        volatility_weight: this.SIGNAL_WEIGHTS.volatility,
        liquidity_weight: this.SIGNAL_WEIGHTS.liquidity,
        credit_weight: this.SIGNAL_WEIGHTS.credit,
        tail_weight: this.SIGNAL_WEIGHTS.tail,
        
        // Regime analysis
        market_regime: regimeAnalysis.primary,
        regime_subtype: regimeAnalysis.subRegime,
        regime_confidence: regimeAnalysis.confidence,
        transition_probability: regimeAnalysis.transitionProbability,
        
        // Conflict details
        conflicting_engines: conflictAnalysis.conflictingEngines,
        dominant_signal: conflictAnalysis.dominantSignal,
        
        // Quality metrics
        engine_count: engineOutputs.size,
        high_confidence_engines: this.countHighConfidenceEngines(engineOutputs),
        avg_engine_confidence: this.calculateAverageConfidence(engineOutputs),
        
        // Risk overlay
        tail_risk_override: this.shouldTailRiskOverride(engineOutputs),
        crisis_mode: this.detectCrisisMode(engineOutputs),
        
        // Historical context
        signal_persistence: this.calculateSignalPersistence(masterSignal),
        regime_duration_estimate: regimeAnalysis.duration
      }
    };
  }

  private extractEngineOutputs(data: Map<string, any>): Map<string, EngineOutput> {
    const outputs = new Map<string, EngineOutput>();
    
    this.config.dependencies?.forEach(engineId => {
      const engineData = data.get(`ENGINE_${engineId}`);
      if (engineData && typeof engineData === 'object' && engineData.signal) {
        outputs.set(engineId, engineData as EngineOutput);
      }
    });
    
    return outputs;
  }

  private calculateSignalConsensus(engineOutputs: Map<string, EngineOutput>): {
    consensus: number;
    weightedSignal: number;
    signalDistribution: Record<string, number>;
  } {
    const signalScores = {
      'RISK_ON': 1,
      'NEUTRAL': 0,
      'WARNING': -0.5,
      'RISK_OFF': -1
    };

    let weightedSum = 0;
    let totalWeight = 0;
    const signalCounts = { 'RISK_ON': 0, 'NEUTRAL': 0, 'WARNING': 0, 'RISK_OFF': 0 };
    
    engineOutputs.forEach((output, engineId) => {
      const weight = this.getEngineWeight(engineId);
      const signalScore = signalScores[output.signal] || 0;
      
      weightedSum += signalScore * weight * (output.confidence / 100);
      totalWeight += weight;
      signalCounts[output.signal]++;
    });

    const weightedSignal = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    // Calculate consensus (how much engines agree)
    const totalSignals = Object.values(signalCounts).reduce((sum, count) => sum + count, 0);
    const maxCount = Math.max(...Object.values(signalCounts));
    const consensus = totalSignals > 0 ? maxCount / totalSignals : 0;
    
    // Signal distribution
    const signalDistribution: Record<string, number> = {};
    Object.entries(signalCounts).forEach(([signal, count]) => {
      signalDistribution[signal] = totalSignals > 0 ? count / totalSignals : 0;
    });

    return {
      consensus,
      weightedSignal,
      signalDistribution
    };
  }

  private getEngineWeight(engineId: string): number {
    const weightMap: Record<string, keyof SignalWeights> = {
      'enhanced-momentum': 'momentum',
      'volatility-regime': 'volatility',
      'net-liquidity': 'liquidity',
      'credit-stress': 'credit',
      'tail-risk': 'tail'
    };
    
    const weightKey = weightMap[engineId];
    return weightKey ? this.SIGNAL_WEIGHTS[weightKey] : 0.05; // Default small weight
  }

  private analyzeConflicts(engineOutputs: Map<string, EngineOutput>): ConflictAnalysis {
    const signals = Array.from(engineOutputs.values()).map(output => output.signal);
    const uniqueSignals = new Set(signals);
    
    // No conflict if all engines agree or only 1 engine
    if (uniqueSignals.size <= 1 || signals.length <= 1) {
      return {
        hasConflict: false,
        conflictLevel: 'LOW',
        conflictingEngines: [],
        dominantSignal: signals[0] || 'NEUTRAL',
        confidence: 95
      };
    }

    // Calculate conflict level based on signal distribution
    const signalCounts: Record<string, string[]> = {};
    engineOutputs.forEach((output, engineId) => {
      if (!signalCounts[output.signal]) {
        signalCounts[output.signal] = [];
      }
      signalCounts[output.signal].push(engineId);
    });

    // Find dominant signal
    const dominantEntry = Object.entries(signalCounts).reduce((max, current) => 
      current[1].length > max[1].length ? current : max
    );
    const dominantSignal = dominantEntry[0];
    const dominantCount = dominantEntry[1].length;
    
    // Calculate disagreement rate
    const disagreementRate = (signals.length - dominantCount) / signals.length;
    
    // Determine conflict level
    let conflictLevel: ConflictAnalysis['conflictLevel'];
    if (disagreementRate > 0.6) conflictLevel = 'HIGH';
    else if (disagreementRate > this.CONFLICT_THRESHOLD) conflictLevel = 'MODERATE';
    else conflictLevel = 'LOW';
    
    // Find conflicting engines
    const conflictingEngines = Array.from(engineOutputs.entries())
      .filter(([_, output]) => output.signal !== dominantSignal)
      .map(([engineId, _]) => engineId);

    return {
      hasConflict: disagreementRate > this.CONFLICT_THRESHOLD,
      conflictLevel,
      conflictingEngines,
      dominantSignal,
      confidence: Math.round((1 - disagreementRate) * 100)
    };
  }

  private analyzeMarketRegime(engineOutputs: Map<string, EngineOutput>): MarketRegimeAnalysis {
    // Get specific engine insights for regime analysis
    const volatilityRegime = engineOutputs.get('volatility-regime')?.subMetrics?.regime || 'NORMAL';
    const liquidityRegime = engineOutputs.get('net-liquidity')?.subMetrics?.regime || 'NEUTRAL';
    const creditRegime = engineOutputs.get('credit-stress')?.subMetrics?.regime || 'NEUTRAL';
    const tailRisk = engineOutputs.get('tail-risk')?.subMetrics?.risk_regime || 'NORMAL';
    
    // Determine primary regime
    let primaryRegime: MarketRegimeAnalysis['primary'];
    let subRegime: string;
    let confidence: number;
    
    // Crisis detection (highest priority)
    if (tailRisk === 'EXTREME' || creditRegime === 'CRISIS_MODE' || volatilityRegime === 'CRISIS') {
      primaryRegime = 'CRISIS';
      subRegime = 'FINANCIAL_STRESS';
      confidence = 90;
    }
    // Bear market conditions
    else if (liquidityRegime === 'QT' && creditRegime === 'QT_STRESS' && volatilityRegime === 'STRESSED') {
      primaryRegime = 'BEAR_MARKET';
      subRegime = 'TIGHTENING_CYCLE';
      confidence = 85;
    }
    // Bull market conditions
    else if (liquidityRegime === 'QE' && creditRegime === 'QE_SUPPORTIVE' && volatilityRegime === 'LOW_VOL') {
      primaryRegime = 'BULL_MARKET';
      subRegime = 'EASY_MONEY';
      confidence = 85;
    }
    // Mixed/sideways conditions
    else {
      primaryRegime = 'SIDEWAYS';
      subRegime = 'TRANSITION';
      confidence = 60;
    }
    
    // Estimate duration and transition probability
    const duration = this.estimateRegimeDuration(primaryRegime, engineOutputs);
    const transitionProbability = this.calculateTransitionProbability(primaryRegime, engineOutputs);

    return {
      primary: primaryRegime,
      subRegime,
      confidence,
      duration,
      transitionProbability
    };
  }

  private estimateRegimeDuration(regime: string, engineOutputs: Map<string, EngineOutput>): number {
    // Estimate regime duration in weeks based on current conditions
    const avgConfidence = this.calculateAverageConfidence(engineOutputs);
    
    const baseDurations: Record<string, number> = {
      'CRISIS': 8,        // 2 months
      'BEAR_MARKET': 52,  // 1 year
      'BULL_MARKET': 104, // 2 years
      'SIDEWAYS': 26      // 6 months
    };
    
    const baseDuration = baseDurations[regime] || 26;
    
    // Adjust based on signal confidence (higher confidence = longer duration)
    const confidenceMultiplier = avgConfidence / 100;
    
    return Math.round(baseDuration * confidenceMultiplier);
  }

  private calculateTransitionProbability(regime: string, engineOutputs: Map<string, EngineOutput>): number {
    // Calculate probability of regime transition in next 30 days
    const conflictAnalysis = this.analyzeConflicts(engineOutputs);
    
    // Higher conflict = higher transition probability
    const baseTransition = {
      'CRISIS': 0.15,     // Crisis unstable
      'BEAR_MARKET': 0.05, // Bears persistent
      'BULL_MARKET': 0.03, // Bulls persistent
      'SIDEWAYS': 0.20     // Sideways transitions frequently
    };
    
    const base = baseTransition[regime as keyof typeof baseTransition] || 0.1;
    
    // Increase probability based on conflicts
    const conflictMultiplier = conflictAnalysis.hasConflict ? 2.0 : 1.0;
    
    return Math.min(0.5, base * conflictMultiplier); // Cap at 50%
  }

  private calculateCompositeConfidence(engineOutputs: Map<string, EngineOutput>, conflictAnalysis: ConflictAnalysis): number {
    // Start with average engine confidence
    let confidence = this.calculateAverageConfidence(engineOutputs);
    
    // Reduce confidence based on conflicts
    if (conflictAnalysis.conflictLevel === 'HIGH') {
      confidence *= 0.6; // 40% reduction
    } else if (conflictAnalysis.conflictLevel === 'MODERATE') {
      confidence *= 0.8; // 20% reduction
    }
    
    // Boost confidence if engines are aligned
    if (!conflictAnalysis.hasConflict && engineOutputs.size >= 4) {
      confidence = Math.min(100, confidence * 1.1);
    }
    
    // Reduce confidence if too few engines
    if (engineOutputs.size < 3) {
      confidence *= 0.7;
    }
    
    return Math.round(confidence);
  }

  private generateMasterSignal(
    consensus: { weightedSignal: number; consensus: number }, 
    conflictAnalysis: ConflictAnalysis,
    confidence: number
  ): EngineOutput['signal'] {
    // Override for high conflicts
    if (conflictAnalysis.conflictLevel === 'HIGH') {
      return 'WARNING';
    }
    
    // Override for low confidence
    if (confidence < this.CONFIDENCE_THRESHOLD) {
      return 'NEUTRAL';
    }
    
    // Use weighted signal
    const { weightedSignal } = consensus;
    
    if (weightedSignal > 0.3) return 'RISK_ON';
    if (weightedSignal < -0.3) return 'RISK_OFF';
    if (weightedSignal < -0.1) return 'WARNING';
    return 'NEUTRAL';
  }

  private calculateSignalStrength(consensus: { weightedSignal: number; consensus: number }, confidence: number): number {
    // Combine signal magnitude with consensus and confidence
    const signalMagnitude = Math.abs(consensus.weightedSignal) * 50; // 0-50 range
    const consensusBonus = consensus.consensus * 30; // 0-30 range
    const confidenceBonus = (confidence / 100) * 20; // 0-20 range
    
    return Math.round(signalMagnitude + consensusBonus + confidenceBonus);
  }

  private countHighConfidenceEngines(engineOutputs: Map<string, EngineOutput>): number {
    return Array.from(engineOutputs.values()).filter(output => 
      output.confidence >= this.CONFIDENCE_THRESHOLD
    ).length;
  }

  private calculateAverageConfidence(engineOutputs: Map<string, EngineOutput>): number {
    if (engineOutputs.size === 0) return 0;
    
    const totalConfidence = Array.from(engineOutputs.values()).reduce(
      (sum, output) => sum + output.confidence, 0
    );
    
    return totalConfidence / engineOutputs.size;
  }

  private shouldTailRiskOverride(engineOutputs: Map<string, EngineOutput>): boolean {
    const tailRiskOutput = engineOutputs.get('tail-risk');
    return tailRiskOutput?.signal === 'RISK_OFF' && 
           (tailRiskOutput?.subMetrics?.risk_regime === 'EXTREME' || false);
  }

  private detectCrisisMode(engineOutputs: Map<string, EngineOutput>): boolean {
    const crisisIndicators = [
      engineOutputs.get('tail-risk')?.subMetrics?.risk_regime === 'EXTREME',
      engineOutputs.get('credit-stress')?.subMetrics?.regime === 'CRISIS_MODE',
      engineOutputs.get('volatility-regime')?.subMetrics?.regime === 'CRISIS'
    ];
    
    return crisisIndicators.filter(Boolean).length >= 2; // 2+ crisis indicators
  }

  private calculateSignalPersistence(signal: EngineOutput['signal']): number {
    // Mock signal persistence calculation
    // In reality, would track signal history
    const basePeristence = {
      'RISK_ON': 0.7,
      'RISK_OFF': 0.8,
      'WARNING': 0.5,
      'NEUTRAL': 0.6
    };
    
    return basePeristence[signal] || 0.5;
  }

  private calculateSignalChange(signalStrength: number): number {
    // Mock 24h change in signal strength
    return (Math.random() - 0.5) * 20; // ±10 points
  }

  private calculateSignalChangePercent(signalStrength: number): number {
    if (signalStrength === 0) return 0;
    const change24h = this.calculateSignalChange(signalStrength);
    return (change24h / signalStrength) * 100;
  }

  private generateAnalysis(
    consensus: { consensus: number; weightedSignal: number; signalDistribution: Record<string, number> },
    conflictAnalysis: ConflictAnalysis,
    regimeAnalysis: MarketRegimeAnalysis
  ): string {
    let analysis = `Master signal shows ${consensus.weightedSignal > 0 ? 'bullish' : 'bearish'} bias `;
    analysis += `with ${Math.round(consensus.consensus * 100)}% consensus across engines. `;
    
    if (conflictAnalysis.hasConflict) {
      analysis += `Conflict detected (${conflictAnalysis.conflictLevel}) between engines. `;
      analysis += `Dominant signal: ${conflictAnalysis.dominantSignal}. `;
    }
    
    analysis += `Market regime: ${regimeAnalysis.primary} (${regimeAnalysis.subRegime}) `;
    analysis += `with ${regimeAnalysis.confidence}% confidence. `;
    
    if (regimeAnalysis.transitionProbability > 0.2) {
      analysis += `High transition probability (${Math.round(regimeAnalysis.transitionProbability * 100)}%) `;
      analysis += 'suggests regime change possible. ';
    }
    
    return analysis;
  }

  validateData(data: Map<string, any>): boolean {
    // Needs at least 3 engine dependencies
    const availableEngines = this.config.dependencies?.filter(engineId => 
      data.has(`ENGINE_${engineId}`)
    ) || [];
    
    return availableEngines.length >= 3;
  }
}