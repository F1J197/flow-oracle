/**
 * Kalman Filter Implementation for Financial Data
 * Provides adaptive estimation with uncertainty quantification
 */

export interface KalmanState {
  estimate: number;
  errorCovariance: number;
  timestamp: Date;
  confidence: number;
}

export interface KalmanConfig {
  processNoise: number;      // Q - how much we trust the model
  measurementNoise: number;  // R - how much we trust observations
  initialEstimate: number;   // Initial state estimate
  initialCovariance: number; // Initial error covariance
}

export class KalmanFilter {
  private state: KalmanState;
  private config: KalmanConfig;
  private isInitialized: boolean = false;

  constructor(config: KalmanConfig) {
    this.config = config;
    this.state = {
      estimate: config.initialEstimate,
      errorCovariance: config.initialCovariance,
      timestamp: new Date(),
      confidence: 0.5
    };
  }

  /**
   * Update the filter with a new observation
   */
  update(measurement: number, timestamp?: Date): KalmanState {
    if (!this.isInitialized) {
      this.state.estimate = measurement;
      this.isInitialized = true;
      this.state.timestamp = timestamp || new Date();
      this.state.confidence = this.calculateConfidence();
      return { ...this.state };
    }

    // Prediction step
    const predictedEstimate = this.state.estimate;
    const predictedCovariance = this.state.errorCovariance + this.config.processNoise;

    // Update step
    const kalmanGain = predictedCovariance / (predictedCovariance + this.config.measurementNoise);
    const newEstimate = predictedEstimate + kalmanGain * (measurement - predictedEstimate);
    const newCovariance = (1 - kalmanGain) * predictedCovariance;

    this.state = {
      estimate: newEstimate,
      errorCovariance: newCovariance,
      timestamp: timestamp || new Date(),
      confidence: this.calculateConfidence()
    };

    return { ...this.state };
  }

  /**
   * Calculate confidence based on error covariance
   */
  private calculateConfidence(): number {
    // Convert covariance to confidence (0-1 scale)
    const maxCovariance = this.config.initialCovariance * 2;
    const normalizedCovariance = Math.min(this.state.errorCovariance / maxCovariance, 1);
    return Math.max(0, 1 - normalizedCovariance);
  }

  /**
   * Get current state
   */
  getState(): KalmanState {
    return { ...this.state };
  }

  /**
   * Reset the filter
   */
  reset(newConfig?: Partial<KalmanConfig>): void {
    if (newConfig) {
      this.config = { ...this.config, ...newConfig };
    }
    this.state = {
      estimate: this.config.initialEstimate,
      errorCovariance: this.config.initialCovariance,
      timestamp: new Date(),
      confidence: 0.5
    };
    this.isInitialized = false;
  }

  /**
   * Predict next value without updating state
   */
  predict(): number {
    return this.state.estimate;
  }

  /**
   * Get uncertainty bounds
   */
  getUncertaintyBounds(confidenceLevel: number = 0.95): { lower: number; upper: number } {
    const standardDeviation = Math.sqrt(this.state.errorCovariance);
    const zScore = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.58 : 1.64;
    const margin = zScore * standardDeviation;

    return {
      lower: this.state.estimate - margin,
      upper: this.state.estimate + margin
    };
  }
}

/**
 * Multi-dimensional Kalman Filter for multiple correlated indicators
 */
export class MultiKalmanFilter {
  private filters: Map<string, KalmanFilter> = new Map();
  private correlations: Map<string, number> = new Map();

  constructor(private configs: Map<string, KalmanConfig>) {
    for (const [id, config] of configs) {
      this.filters.set(id, new KalmanFilter(config));
    }
  }

  updateAll(measurements: Map<string, number>, timestamp?: Date): Map<string, KalmanState> {
    const results = new Map<string, KalmanState>();
    
    for (const [id, measurement] of measurements) {
      const filter = this.filters.get(id);
      if (filter) {
        const state = filter.update(measurement, timestamp);
        results.set(id, state);
      }
    }

    return results;
  }

  getFilter(id: string): KalmanFilter | undefined {
    return this.filters.get(id);
  }

  getAllStates(): Map<string, KalmanState> {
    const states = new Map<string, KalmanState>();
    for (const [id, filter] of this.filters) {
      states.set(id, filter.getState());
    }
    return states;
  }
}