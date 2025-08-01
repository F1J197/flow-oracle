/**
 * Signal Aggregator Engine - Synthesis Layer
 * Aggregates all engine signals into a unified market assessment
 */

import { BaseEngine, EngineConfig, EngineOutput } from '../../BaseEngine';

const config: EngineConfig = {
  id: 'signal-aggregator',
  name: 'Signal Aggregator',
  pillar: 3,
  priority: 95,
  updateInterval: 60000,
  requiredIndicators: [],
  dependencies: [
    'data-integrity',
    'enhanced-momentum', 
    'volatility-regime',
    'net-liquidity',
    'credit-stress'
  ]
};

interface SignalWeight {
  engineId: string;
  weight: number;
  reliability: number;
}

interface AggregatedSignal {
  consensus: number;
  conflictLevel: number;
  dominantSignal: 'RISK_ON' | 'RISK_OFF' | 'WARNING' | 'NEUTRAL';
  participatingEngines: number;
  signalStrength: number;
}

export class SignalAggregatorEngine extends BaseEngine {
  private readonly SIGNAL_WEIGHTS: SignalWeight[] = [
    { engineId: 'enhanced-momentum', weight: 0.20, reliability: 0.85 },
    { engineId: 'volatility-regime', weight: 0.18, reliability: 0.90 },
    { engineId: 'net-liquidity', weight: 0.15, reliability: 0.88 },
    { engineId: 'credit-stress', weight: 0.15, reliability: 0.82 },
    { engineId: 'data-integrity', weight: 0.10, reliability: 0.95 },
  ];

  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    try {
      const engineOutputs = this.extractDependencyOutputs(data);
      const aggregatedSignal = this.aggregateSignals(engineOutputs);
      const confidence = this.calculateAggregateConfidence(engineOutputs, aggregatedSignal);

      return {
        primaryMetric: {
          value: aggregatedSignal.consensus,
          change24h: 0,
          changePercent: 0
        },
        signal: aggregatedSignal.dominantSignal,
        confidence,
        analysis: this.generateConsensusAnalysis(aggregatedSignal, engineOutputs),
        subMetrics: {
          consensus: Math.round(aggregatedSignal.consensus * 100),
          conflictLevel: Math.round(aggregatedSignal.conflictLevel * 100),
          participatingEngines: aggregatedSignal.participatingEngines,
          signalStrength: Math.round(aggregatedSignal.signalStrength * 100),
          riskOnVotes: this.countSignalVotes(engineOutputs, 'RISK_ON'),
          riskOffVotes: this.countSignalVotes(engineOutputs, 'RISK_OFF'),
          warningVotes: this.countSignalVotes(engineOutputs, 'WARNING'),
          neutralVotes: this.countSignalVotes(engineOutputs, 'NEUTRAL')
        }
      };
    } catch (error) {
      console.error('[SignalAggregator] Calculation failed:', error);
      return this.getDefaultOutput();
    }
  }

  private extractDependencyOutputs(data: Map<string, any>): Map<string, any> {
    const outputs = new Map<string, any>();
    
    for (const engineId of this.config.dependencies || []) {
      const engineData = data.get(`ENGINE_${engineId}`);
      if (engineData) {
        outputs.set(engineId, engineData);
      }
    }
    
    return outputs;
  }

  private aggregateSignals(engineOutputs: Map<string, any>): AggregatedSignal {
    const signals = new Map<string, number>();
    let totalWeight = 0;
    let weightedSum = 0;
    let participatingEngines = 0;

    // Initialize signal counts
    signals.set('RISK_ON', 0);
    signals.set('RISK_OFF', 0);
    signals.set('WARNING', 0);
    signals.set('NEUTRAL', 0);

    // Aggregate weighted signals
    for (const [engineId, output] of engineOutputs) {
      const weight = this.getEngineWeight(engineId);
      if (weight && output.signal) {
        const currentCount = signals.get(output.signal) || 0;
        signals.set(output.signal, currentCount + weight.weight);
        
        totalWeight += weight.weight;
        participatingEngines++;

        // Convert signal to numeric for weighted calculation
        const signalValue = this.signalToNumeric(output.signal);
        weightedSum += signalValue * weight.weight;
      }
    }

    // Determine dominant signal
    let dominantSignal: 'RISK_ON' | 'RISK_OFF' | 'WARNING' | 'NEUTRAL' = 'NEUTRAL';
    let maxVotes = 0;

    for (const [signal, votes] of signals) {
      if (votes > maxVotes) {
        maxVotes = votes;
        dominantSignal = signal as any;
      }
    }

    // Calculate consensus and conflict
    const consensus = totalWeight > 0 ? maxVotes / totalWeight : 0;
    const conflictLevel = this.calculateConflictLevel(signals, totalWeight);
    const signalStrength = totalWeight > 0 ? Math.abs(weightedSum / totalWeight) : 0;

    return {
      consensus,
      conflictLevel,
      dominantSignal,
      participatingEngines,
      signalStrength
    };
  }

  private getEngineWeight(engineId: string): SignalWeight | undefined {
    return this.SIGNAL_WEIGHTS.find(w => w.engineId === engineId);
  }

  private signalToNumeric(signal: string): number {
    switch (signal) {
      case 'RISK_ON': return 1;
      case 'WARNING': return 0.5;
      case 'NEUTRAL': return 0;
      case 'RISK_OFF': return -1;
      default: return 0;
    }
  }

  private calculateConflictLevel(signals: Map<string, number>, totalWeight: number): number {
    if (totalWeight === 0) return 0;

    const signalValues = Array.from(signals.values());
    const variance = signalValues.reduce((sum, val) => {
      const normalized = val / totalWeight;
      return sum + Math.pow(normalized - 0.25, 2); // 0.25 = expected if evenly distributed
    }, 0) / signalValues.length;

    return Math.min(1, variance * 4); // Scale to 0-1
  }

  private calculateAggregateConfidence(
    engineOutputs: Map<string, any>, 
    aggregatedSignal: AggregatedSignal
  ): number {
    if (engineOutputs.size === 0) return 0;

    let totalConfidence = 0;
    let totalWeight = 0;

    for (const [engineId, output] of engineOutputs) {
      const weight = this.getEngineWeight(engineId);
      if (weight && typeof output.confidence === 'number') {
        totalConfidence += output.confidence * weight.weight * weight.reliability;
        totalWeight += weight.weight;
      }
    }

    const baseConfidence = totalWeight > 0 ? totalConfidence / totalWeight : 0;
    
    // Adjust for consensus and conflict
    const consensusBonus = aggregatedSignal.consensus * 10;
    const conflictPenalty = aggregatedSignal.conflictLevel * 15;
    
    return Math.max(0, Math.min(100, baseConfidence + consensusBonus - conflictPenalty));
  }

  private countSignalVotes(engineOutputs: Map<string, any>, signal: string): number {
    return Array.from(engineOutputs.values())
      .filter(output => output.signal === signal).length;
  }

  private generateConsensusAnalysis(
    aggregatedSignal: AggregatedSignal, 
    engineOutputs: Map<string, any>
  ): string {
    const { consensus, conflictLevel, dominantSignal, participatingEngines } = aggregatedSignal;
    
    if (participatingEngines === 0) {
      return 'No engine signals available for aggregation.';
    }

    let analysis = `Market consensus: ${(consensus * 100).toFixed(1)}% ${dominantSignal}. `;
    
    if (conflictLevel > 0.4) {
      analysis += `High signal conflict detected (${(conflictLevel * 100).toFixed(1)}%). `;
      analysis += 'Mixed market conditions suggest increased uncertainty.';
    } else if (consensus > 0.7) {
      analysis += `Strong consensus across ${participatingEngines} engines. `;
      analysis += 'Clear directional signal with high confidence.';
    } else {
      analysis += `Moderate consensus with some divergence. `;
      analysis += 'Market direction unclear, monitor for confirmation.';
    }

    return analysis;
  }

  validateData(data: Map<string, any>): boolean {
    // Require at least 2 dependency engines to provide valid aggregation
    const availableDependencies = (this.config.dependencies || [])
      .filter(dep => data.has(`ENGINE_${dep}`));
    
    return availableDependencies.length >= 2;
  }
}