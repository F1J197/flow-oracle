export interface TimeSeriesPoint {
  timestamp: number;
  value: number;
}

export interface MomentumCalculation {
  roc: number;              // Rate of Change
  firstDerivative: number;  // Velocity
  secondDerivative: number; // Acceleration
  jerk: number;            // Third derivative
}

export interface MultiscaleMomentum {
  short: MomentumCalculation;   // 1-2 weeks
  medium: MomentumCalculation;  // 4-6 weeks  
  long: MomentumCalculation;    // 12 weeks
}

export interface CompositeMomentumScore {
  value: number;           // -100 to +100 scale
  category: 'EXPLODING' | 'BUILDING' | 'SLOWING' | 'DECLINING' | 'NEUTRAL';
  confidence: number;      // 0-100%
  leadTime: number;       // Estimated weeks ahead
  regime: 'BULL_ACCEL' | 'BULL_DECEL' | 'BEAR_ACCEL' | 'BEAR_DECEL' | 'NEUTRAL';
}

export interface MomentumAlert {
  type: 'DIVERGENCE' | 'EXTREME' | 'REVERSAL' | 'CONFLUENCE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  indicators: string[];
}

export interface MomentumMetrics {
  composite: CompositeMomentumScore;
  multiscale: MultiscaleMomentum;
  alerts: MomentumAlert[];
  lastCalculation: Date;
  signalStrength: number;
  trend: 'up' | 'down' | 'neutral';
  confidence: number;
}

export interface MomentumConfig {
  windows: {
    short: number;    // weeks
    medium: number;   // weeks  
    long: number;     // weeks
  };
  thresholds: {
    extreme: number;
    reversal: number;
    confluence: number;
  };
  weights: {
    velocity: number;
    acceleration: number;
    jerk: number;
  };
  refreshInterval?: number;
  maxRetries?: number;
  timeout?: number;
  cacheTimeout?: number;
}

export interface MomentumPatternSignal {
  type: 'DIVERGENCE' | 'CONFLUENCE' | 'MOMENTUM_EXHAUSTION' | 'MOMENTUM_PICKUP';
  strength: number;
  indicators: string[];
  reliability: number;
}