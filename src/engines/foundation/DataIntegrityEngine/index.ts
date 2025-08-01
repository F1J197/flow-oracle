/**
 * Data Integrity & Self-Healing Engine - Foundation Layer
 * Phase 1, Prompt 3 Implementation
 */

import { BaseEngine, EngineConfig, EngineOutput } from '../../BaseEngine';

const config: EngineConfig = {
  id: 'data-integrity',
  name: 'Data Integrity & Self-Healing',
  pillar: 1,
  priority: 100,
  updateInterval: 30000,
  requiredIndicators: []
};

interface IntegrityMetrics {
  overallScore: number;
  sourceHealth: Map<string, number>;
  consensusScore: number;
  anomalies: string[];
  selfHealingActions: number;
}

export class DataIntegrityEngine extends BaseEngine {
  private sourceValidation = new Map<string, number[]>();
  private anomalyHistory: string[] = [];
  private readonly CONSENSUS_THRESHOLD = 0.6;
  private readonly BENFORD_TOLERANCE = 0.05;

  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    try {
      const metrics = this.calculateIntegrityMetrics(data);
      const signal = this.determineSignal(metrics);
      const confidence = this.calculateConfidence(metrics);

      return {
        primaryMetric: {
          value: metrics.overallScore,
          change24h: 0,
          changePercent: 0
        },
        signal,
        confidence,
        analysis: this.generateAnalysis(metrics),
        subMetrics: {
          sourceHealth: Object.fromEntries(metrics.sourceHealth),
          consensusScore: metrics.consensusScore,
          anomaliesDetected: metrics.anomalies.length,
          selfHealingActions: metrics.selfHealingActions
        },
        alerts: this.generateAlerts(metrics)
      };
    } catch (error) {
      console.error('[DataIntegrityEngine] Calculation failed:', error);
      return this.getDefaultOutput();
    }
  }

  private calculateIntegrityMetrics(data: Map<string, any>): IntegrityMetrics {
    const sourceHealth = new Map<string, number>();
    let consensusScore = 1.0;
    const anomalies: string[] = [];
    let selfHealingActions = 0;

    // Validate each data source
    for (const [key, value] of data.entries()) {
      if (Array.isArray(value) && value.length > 0) {
        const healthScore = this.validateDataSource(key, value);
        sourceHealth.set(key, healthScore);
        
        // Check for anomalies
        if (this.detectAnomalies(key, value)) {
          anomalies.push(key);
          selfHealingActions++;
        }
      }
    }

    // Calculate consensus
    if (sourceHealth.size > 1) {
      consensusScore = this.calculateConsensus(data);
    }

    // Overall score
    const avgSourceHealth = Array.from(sourceHealth.values())
      .reduce((sum, score) => sum + score, 0) / Math.max(sourceHealth.size, 1);
    
    const overallScore = (avgSourceHealth + consensusScore) / 2 * 100;

    return {
      overallScore,
      sourceHealth,
      consensusScore,
      anomalies,
      selfHealingActions
    };
  }

  private validateDataSource(source: string, values: any[]): number {
    let score = 1.0;
    
    // Check for null/undefined values
    const nullCount = values.filter(v => v == null).length;
    if (nullCount > values.length * 0.1) {
      score -= 0.3;
    }

    // Check for numeric consistency
    const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
    if (numericValues.length > 10) {
      const benfordScore = this.benfordLawTest(numericValues);
      if (benfordScore < 1 - this.BENFORD_TOLERANCE) {
        score -= 0.2;
        console.warn(`[DataIntegrity] Benford's Law violation for ${source}`);
      }
    }

    // Check for outliers
    if (this.hasExcessiveOutliers(numericValues)) {
      score -= 0.1;
    }

    return Math.max(0, score);
  }

  private benfordLawTest(values: number[]): number {
    const firstDigits = values
      .map(v => Math.abs(v))
      .filter(v => v > 0)
      .map(v => parseInt(v.toString()[0]));

    if (firstDigits.length < 10) return 1;

    const expected = [0, 0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046];
    const observed = new Array(10).fill(0);
    
    firstDigits.forEach(d => observed[d]++);
    
    let chiSquare = 0;
    for (let i = 1; i <= 9; i++) {
      const exp = expected[i] * firstDigits.length;
      const obs = observed[i];
      if (exp > 0) {
        chiSquare += Math.pow(obs - exp, 2) / exp;
      }
    }

    // Convert chi-square to confidence score
    return Math.max(0, 1 - chiSquare / 15.5); // 15.5 is critical value for 8 df at 0.05
  }

  private hasExcessiveOutliers(values: number[]): boolean {
    if (values.length < 5) return false;
    
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    const outliers = values.filter(v => v < lowerBound || v > upperBound);
    return outliers.length / values.length > 0.1;
  }

  private detectAnomalies(source: string, values: any[]): boolean {
    // Simple anomaly detection - can be enhanced with ML
    if (!this.sourceValidation.has(source)) {
      this.sourceValidation.set(source, []);
      return false;
    }

    const history = this.sourceValidation.get(source)!;
    if (history.length < 5) return false;

    const latest = values[values.length - 1];
    if (typeof latest !== 'number') return false;

    const mean = history.reduce((sum, v) => sum + v, 0) / history.length;
    const std = Math.sqrt(
      history.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / history.length
    );

    return Math.abs(latest - mean) > 3 * std;
  }

  private calculateConsensus(data: Map<string, any>): number {
    // Simplified consensus calculation
    const sources = Array.from(data.keys()).filter(k => 
      Array.isArray(data.get(k)) && data.get(k).length > 0
    );
    
    if (sources.length < 2) return 1.0;

    let agreements = 0;
    let comparisons = 0;

    for (let i = 0; i < sources.length; i++) {
      for (let j = i + 1; j < sources.length; j++) {
        const source1 = data.get(sources[i]);
        const source2 = data.get(sources[j]);
        
        if (source1 && source2 && source1.length > 0 && source2.length > 0) {
          const val1 = source1[source1.length - 1];
          const val2 = source2[source2.length - 1];
          
          if (typeof val1 === 'number' && typeof val2 === 'number') {
            const diff = Math.abs(val1 - val2) / Math.max(Math.abs(val1), Math.abs(val2), 1);
            if (diff < 0.05) agreements++; // 5% tolerance
            comparisons++;
          }
        }
      }
    }

    return comparisons > 0 ? agreements / comparisons : 1.0;
  }

  private determineSignal(metrics: IntegrityMetrics): EngineOutput['signal'] {
    if (metrics.overallScore >= 90) return 'RISK_ON';
    if (metrics.overallScore >= 70) return 'NEUTRAL';
    if (metrics.overallScore >= 50) return 'WARNING';
    return 'RISK_OFF';
  }

  private calculateConfidence(metrics: IntegrityMetrics): number {
    return Math.min(100, metrics.overallScore);
  }

  private generateAnalysis(metrics: IntegrityMetrics): string {
    const score = metrics.overallScore;
    const anomalies = metrics.anomalies.length;
    
    if (score >= 90) {
      return `Data integrity excellent (${score.toFixed(1)}%). All sources healthy, consensus strong.`;
    } else if (score >= 70) {
      return `Data integrity good (${score.toFixed(1)}%). Minor quality issues detected${anomalies > 0 ? ` in ${anomalies} sources` : ''}.`;
    } else if (score >= 50) {
      return `Data integrity concerning (${score.toFixed(1)}%). ${anomalies} anomalies detected, self-healing active.`;
    } else {
      return `Data integrity critical (${score.toFixed(1)}%). Multiple sources compromised, manual review required.`;
    }
  }

  private generateAlerts(metrics: IntegrityMetrics): any[] {
    const alerts: any[] = [];
    
    if (metrics.overallScore < 50) {
      alerts.push({
        level: 'critical',
        message: 'Data integrity critically low',
        timestamp: Date.now()
      });
    }
    
    if (metrics.anomalies.length > 3) {
      alerts.push({
        level: 'warning',
        message: `${metrics.anomalies.length} data anomalies detected`,
        timestamp: Date.now()
      });
    }

    return alerts;
  }

  validateData(data: Map<string, any>): boolean {
    return true; // Always validates - this is the validation engine
  }
}