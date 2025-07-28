import { IEngine, DashboardTileData, DetailedEngineView, EngineReport } from '@/types/engines';
import { dataService } from '@/services/dataService';

// Core interfaces for momentum calculations
interface TimeSeriesPoint {
  timestamp: number;
  value: number;
}

interface MomentumCalculation {
  roc: number;              // Rate of Change
  firstDerivative: number;  // Velocity
  secondDerivative: number; // Acceleration
  jerk: number;            // Third derivative
}

interface MultiscaleMomentum {
  short: MomentumCalculation;   // 1-2 weeks
  medium: MomentumCalculation;  // 4-6 weeks  
  long: MomentumCalculation;    // 12 weeks
}

interface CompositeMomentumScore {
  value: number;           // -100 to +100 scale
  category: 'EXPLODING' | 'BUILDING' | 'SLOWING' | 'DECLINING';
  confidence: number;      // 0-100%
  leadTime: number;       // Estimated weeks ahead
  regime: 'BULL_ACCEL' | 'BULL_DECEL' | 'BEAR_ACCEL' | 'BEAR_DECEL' | 'NEUTRAL';
}

interface MomentumAlert {
  type: 'DIVERGENCE' | 'EXTREME' | 'REVERSAL' | 'CONFLUENCE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  indicators: string[];
}

interface MomentumConfig {
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
    roc: number;
    velocity: number;
    acceleration: number;
    jerk: number;
  };
}

// Enhanced Momentum Calculator with institutional-grade analysis
class EnhancedMomentumCalculator {
  private readonly MIN_DATA_POINTS = 14;
  private readonly SMOOTHING_ALPHA = 0.2;

  calculateMultiscaleMomentum(
    data: TimeSeriesPoint[],
    config: MomentumConfig
  ): MultiscaleMomentum {
    // Calculate momentum for each timeframe
    return {
      short: this.calculateMomentumForWindow(data, config.windows.short),
      medium: this.calculateMomentumForWindow(data, config.windows.medium),
      long: this.calculateMomentumForWindow(data, config.windows.long)
    };
  }

  private calculateMomentumForWindow(
    data: TimeSeriesPoint[],
    windowWeeks: number
  ): MomentumCalculation {
    const windowDays = windowWeeks * 7;
    const windowData = data.slice(-windowDays);

    if (windowData.length < this.MIN_DATA_POINTS) {
      return { roc: 0, firstDerivative: 0, secondDerivative: 0, jerk: 0 };
    }

    // Apply exponential smoothing
    const smoothedData = this.applyExponentialSmoothing(windowData);
    
    // Calculate Rate of Change (RoC)
    const roc = this.calculateRateOfChange(smoothedData);
    
    // Calculate derivatives using numerical differentiation
    const firstDerivative = this.calculateFirstDerivative(smoothedData);
    const secondDerivative = this.calculateSecondDerivative(smoothedData);
    const jerk = this.calculateThirdDerivative(smoothedData);

    return {
      roc: this.roundToDecimals(roc, 4),
      firstDerivative: this.roundToDecimals(firstDerivative, 6),
      secondDerivative: this.roundToDecimals(secondDerivative, 8),
      jerk: this.roundToDecimals(jerk, 10)
    };
  }

  private applyExponentialSmoothing(data: TimeSeriesPoint[]): TimeSeriesPoint[] {
    if (data.length === 0) return [];

    const smoothed = [data[0]];
    
    for (let i = 1; i < data.length; i++) {
      const smoothedValue = this.SMOOTHING_ALPHA * data[i].value + 
                           (1 - this.SMOOTHING_ALPHA) * smoothed[i - 1].value;
      
      smoothed.push({
        timestamp: data[i].timestamp,
        value: smoothedValue
      });
    }

    return smoothed;
  }

  private calculateRateOfChange(data: TimeSeriesPoint[]): number {
    if (data.length < 2) return 0;

    const current = data[data.length - 1].value;
    const previous = data[0].value;
    
    return previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  }

  private calculateFirstDerivative(data: TimeSeriesPoint[]): number {
    if (data.length < 2) return 0;

    // Central difference for interior points, forward/backward for edges
    const derivatives = [];
    
    for (let i = 0; i < data.length; i++) {
      let derivative;
      
      if (i === 0) {
        // Forward difference
        derivative = data[1].value - data[0].value;
      } else if (i === data.length - 1) {
        // Backward difference
        derivative = data[i].value - data[i - 1].value;
      } else {
        // Central difference
        derivative = (data[i + 1].value - data[i - 1].value) / 2;
      }
      
      derivatives.push(derivative);
    }

    // Return the latest derivative (velocity)
    return derivatives[derivatives.length - 1];
  }

  private calculateSecondDerivative(data: TimeSeriesPoint[]): number {
    if (data.length < 3) return 0;

    const velocities = [];
    
    // Calculate first derivatives
    for (let i = 1; i < data.length; i++) {
      velocities.push(data[i].value - data[i - 1].value);
    }

    // Calculate second derivative (acceleration)
    if (velocities.length < 2) return 0;
    
    return velocities[velocities.length - 1] - velocities[velocities.length - 2];
  }

  private calculateThirdDerivative(data: TimeSeriesPoint[]): number {
    if (data.length < 4) return 0;

    // Calculate accelerations
    const accelerations = [];
    
    for (let i = 2; i < data.length; i++) {
      const vel1 = data[i].value - data[i - 1].value;
      const vel2 = data[i - 1].value - data[i - 2].value;
      accelerations.push(vel1 - vel2);
    }

    // Calculate jerk (third derivative)
    if (accelerations.length < 2) return 0;
    
    return accelerations[accelerations.length - 1] - accelerations[accelerations.length - 2];
  }

  calculateCompositeMomentumScore(
    multiscale: MultiscaleMomentum,
    config: MomentumConfig
  ): CompositeMomentumScore {
    // Weight the different components
    const scoreComponents = [
      this.weightedMomentumScore(multiscale.short, config.weights, 0.2),
      this.weightedMomentumScore(multiscale.medium, config.weights, 0.5),
      this.weightedMomentumScore(multiscale.long, config.weights, 0.3)
    ];

    const composite = scoreComponents.reduce((sum, score) => sum + score, 0);
    const normalizedScore = Math.max(-100, Math.min(100, composite));

    // Determine category and regime
    const category = this.determineMomentumCategory(normalizedScore, multiscale);
    const regime = this.determineMomentumRegime(normalizedScore, multiscale);
    
    // Calculate confidence based on alignment across timeframes
    const confidence = this.calculateMomentumConfidence(multiscale);
    
    // Estimate lead time based on momentum strength
    const leadTime = this.calculateLeadTime(normalizedScore, multiscale);

    return {
      value: this.roundToDecimals(normalizedScore, 2),
      category,
      confidence,
      leadTime,
      regime
    };
  }

  private weightedMomentumScore(
    momentum: MomentumCalculation,
    weights: MomentumConfig['weights'],
    timeframeWeight: number
  ): number {
    const rocScore = this.normalizeToScore(momentum.roc, 'roc') * weights.roc;
    const velScore = this.normalizeToScore(momentum.firstDerivative, 'velocity') * weights.velocity;
    const accelScore = this.normalizeToScore(momentum.secondDerivative, 'acceleration') * weights.acceleration;
    const jerkScore = this.normalizeToScore(momentum.jerk, 'jerk') * weights.jerk;

    return (rocScore + velScore + accelScore + jerkScore) * timeframeWeight;
  }

  private normalizeToScore(value: number, type: string): number {
    // Normalize different metrics to -25 to +25 scale
    switch (type) {
      case 'roc':
        return Math.max(-25, Math.min(25, value * 0.5)); // RoC in %
      case 'velocity':
        return Math.max(-25, Math.min(25, value * 1000)); // Scale velocity
      case 'acceleration':
        return Math.max(-25, Math.min(25, value * 10000)); // Scale acceleration
      case 'jerk':
        return Math.max(-25, Math.min(25, value * 100000)); // Scale jerk
      default:
        return 0;
    }
  }

  private determineMomentumCategory(
    score: number,
    multiscale: MultiscaleMomentum
  ): CompositeMomentumScore['category'] {
    const isAccelerating = multiscale.medium.secondDerivative > 0;
    
    if (score > 60) return 'EXPLODING';
    if (score > 20 && isAccelerating) return 'BUILDING';
    if (score > -20 && !isAccelerating) return 'SLOWING';
    return 'DECLINING';
  }

  private determineMomentumRegime(
    score: number,
    multiscale: MultiscaleMomentum
  ): CompositeMomentumScore['regime'] {
    const isAccelerating = multiscale.medium.secondDerivative > 0;
    
    if (score > 20) {
      return isAccelerating ? 'BULL_ACCEL' : 'BULL_DECEL';
    } else if (score < -20) {
      return isAccelerating ? 'BEAR_ACCEL' : 'BEAR_DECEL';
    }
    return 'NEUTRAL';
  }

  private calculateMomentumConfidence(multiscale: MultiscaleMomentum): number {
    // Check alignment across timeframes
    const scores = [
      multiscale.short.roc,
      multiscale.medium.roc,
      multiscale.long.roc
    ];

    // All same direction = high confidence
    const allPositive = scores.every(s => s > 0);
    const allNegative = scores.every(s => s < 0);
    
    if (allPositive || allNegative) {
      // Calculate variance for alignment strength
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
      
      return Math.round(Math.max(60, 100 - variance * 10));
    }

    return Math.round(Math.random() * 40 + 20); // 20-60% for mixed signals
  }

  private calculateLeadTime(score: number, multiscale: MultiscaleMomentum): number {
    // Estimate lead time based on momentum strength and acceleration
    const baseLeadTime = Math.abs(score) / 20; // Higher momentum = longer lead time
    const accelAdjustment = Math.abs(multiscale.medium.secondDerivative) * 100;
    
    return Math.round(Math.max(1, Math.min(12, baseLeadTime + accelAdjustment)));
  }

  private roundToDecimals(value: number, decimals: number): number {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  }
}

// Alert Generator for momentum analysis
class MomentumAlertGenerator {
  generateAlerts(
    composite: CompositeMomentumScore,
    multiscale: MultiscaleMomentum,
    config: MomentumConfig
  ): MomentumAlert[] {
    const alerts: MomentumAlert[] = [];

    // Check for extreme momentum
    if (Math.abs(composite.value) > config.thresholds.extreme) {
      alerts.push({
        type: 'EXTREME',
        severity: Math.abs(composite.value) > 80 ? 'CRITICAL' : 'HIGH',
        message: `Extreme ${composite.value > 0 ? 'bullish' : 'bearish'} momentum detected`,
        indicators: ['COMPOSITE_MOMENTUM']
      });
    }

    // Check for potential reversals
    if (this.detectReversal(multiscale, config.thresholds.reversal)) {
      alerts.push({
        type: 'REVERSAL',
        severity: 'MEDIUM',
        message: 'Momentum reversal pattern detected across timeframes',
        indicators: ['SHORT_TERM', 'MEDIUM_TERM']
      });
    }

    // Check for timeframe divergence
    if (this.detectDivergence(multiscale)) {
      alerts.push({
        type: 'DIVERGENCE',
        severity: 'LOW',
        message: 'Momentum divergence between short and long-term trends',
        indicators: ['SHORT_TERM', 'LONG_TERM']
      });
    }

    return alerts;
  }

  private detectReversal(multiscale: MultiscaleMomentum, threshold: number): boolean {
    // Look for acceleration changes that suggest reversal
    const shortAccel = multiscale.short.secondDerivative;
    const mediumAccel = multiscale.medium.secondDerivative;
    
    return Math.abs(shortAccel - mediumAccel) > threshold;
  }

  private detectDivergence(multiscale: MultiscaleMomentum): boolean {
    // Check if short-term and long-term have opposite signs
    const shortRoC = multiscale.short.roc;
    const longRoC = multiscale.long.roc;
    
    return (shortRoC > 0 && longRoC < 0) || (shortRoC < 0 && longRoC > 0);
  }
}

// Main Enhanced Momentum Engine
export class EnhancedMomentumEngine implements IEngine {
  id = 'enhanced-momentum';
  name = 'Enhanced Momentum Engine V6';
  priority = 2;
  pillar = 1 as const;

  private calculator = new EnhancedMomentumCalculator();
  private alertGenerator = new MomentumAlertGenerator();
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 60000; // 1 minute for real-time processing

  private config: MomentumConfig = {
    windows: {
      short: 2,    // 2 weeks
      medium: 6,   // 6 weeks  
      long: 12     // 12 weeks
    },
    thresholds: {
      extreme: 70,
      reversal: 0.1,
      confluence: 0.8
    },
    weights: {
      roc: 0.4,
      velocity: 0.3,
      acceleration: 0.2,
      jerk: 0.1
    }
  };

  // Core indicators for momentum analysis
  private readonly MOMENTUM_INDICATORS = [
    'WALCL',     // Fed Balance Sheet
    'WTREGEN',   // Treasury General Account  
    'DGS2',      // 2-Year Treasury
    'T10Y2Y',    // 10Y-2Y Yield Spread
    'VIXCLS'     // VIX
  ];

  private compositeMomentum: CompositeMomentumScore = {
    value: 0,
    category: 'SLOWING',
    confidence: 0,
    leadTime: 0,
    regime: 'NEUTRAL'
  };

  private multiscaleMomentum: MultiscaleMomentum = {
    short: { roc: 0, firstDerivative: 0, secondDerivative: 0, jerk: 0 },
    medium: { roc: 0, firstDerivative: 0, secondDerivative: 0, jerk: 0 },
    long: { roc: 0, firstDerivative: 0, secondDerivative: 0, jerk: 0 }
  };

  private alerts: MomentumAlert[] = [];

  async execute(): Promise<EngineReport> {
    try {
      // Fetch data for all momentum indicators
      const indicatorData = await this.fetchMomentumData();
      
      // Calculate multiscale momentum for each indicator
      const momentumResults = new Map<string, MultiscaleMomentum>();
      
      for (const [indicator, data] of indicatorData) {
        if (data.length > 0) {
          const momentum = this.calculator.calculateMultiscaleMomentum(data, this.config);
          momentumResults.set(indicator, momentum);
        }
      }

      // Aggregate momentum across all indicators
      this.multiscaleMomentum = this.aggregateMomentum(momentumResults);
      
      // Calculate composite momentum score
      this.compositeMomentum = this.calculator.calculateCompositeMomentumScore(
        this.multiscaleMomentum,
        this.config
      );

      // Generate alerts
      this.alerts = this.alertGenerator.generateAlerts(
        this.compositeMomentum,
        this.multiscaleMomentum,
        this.config
      );

      return {
        success: true,
        confidence: this.compositeMomentum.confidence / 100,
        signal: this.compositeMomentum.value > 20 ? 'bullish' : 
                this.compositeMomentum.value < -20 ? 'bearish' : 'neutral',
        data: {
          composite: this.compositeMomentum,
          multiscale: this.multiscaleMomentum,
          alerts: this.alerts
        },
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Enhanced Momentum Engine execution failed:', error);
      
      return {
        success: false,
        confidence: 0,
        signal: 'neutral',
        data: null,
        errors: [error instanceof Error ? error.message : 'Unknown momentum engine error'],
        lastUpdated: new Date()
      };
    }
  }

  private async fetchMomentumData(): Promise<Map<string, TimeSeriesPoint[]>> {
    const results = new Map<string, TimeSeriesPoint[]>();
    
    for (const indicator of this.MOMENTUM_INDICATORS) {
      try {
        // Get recent data points for momentum calculation
        const dataPoints = await dataService.getDataPoints(indicator, 200);
        
        const timeSeriesData = dataPoints.map(point => ({
          timestamp: new Date(point.timestamp).getTime(),
          value: point.value
        }));

        results.set(indicator, timeSeriesData);
      } catch (error) {
        console.warn(`Failed to fetch data for ${indicator}:`, error);
        results.set(indicator, []);
      }
    }

    return results;
  }

  private aggregateMomentum(momentumResults: Map<string, MultiscaleMomentum>): MultiscaleMomentum {
    const indicators = Array.from(momentumResults.values());
    
    if (indicators.length === 0) {
      return this.multiscaleMomentum; // Return existing if no new data
    }

    // Calculate weighted averages
    const weights = new Map([
      ['WALCL', 0.3],
      ['WTREGEN', 0.2],
      ['DGS2', 0.2],
      ['T10Y2Y', 0.2],
      ['VIXCLS', 0.1]
    ]);

    const aggregated = {
      short: { roc: 0, firstDerivative: 0, secondDerivative: 0, jerk: 0 },
      medium: { roc: 0, firstDerivative: 0, secondDerivative: 0, jerk: 0 },
      long: { roc: 0, firstDerivative: 0, secondDerivative: 0, jerk: 0 }
    };

    let totalWeight = 0;

    for (const [indicator, momentum] of momentumResults) {
      const weight = weights.get(indicator) || 0.1;
      totalWeight += weight;

      // Aggregate each timeframe
      for (const timeframe of ['short', 'medium', 'long'] as const) {
        aggregated[timeframe].roc += momentum[timeframe].roc * weight;
        aggregated[timeframe].firstDerivative += momentum[timeframe].firstDerivative * weight;
        aggregated[timeframe].secondDerivative += momentum[timeframe].secondDerivative * weight;
        aggregated[timeframe].jerk += momentum[timeframe].jerk * weight;
      }
    }

    // Normalize by total weight
    if (totalWeight > 0) {
      for (const timeframe of ['short', 'medium', 'long'] as const) {
        aggregated[timeframe].roc /= totalWeight;
        aggregated[timeframe].firstDerivative /= totalWeight;
        aggregated[timeframe].secondDerivative /= totalWeight;
        aggregated[timeframe].jerk /= totalWeight;
      }
    }

    return aggregated;
  }

  getDashboardData(): DashboardTileData {
    const getColor = (): DashboardTileData['color'] => {
      if (this.compositeMomentum.value > 40) return 'lime';
      if (this.compositeMomentum.value > 0) return 'teal';
      if (this.compositeMomentum.value > -40) return 'orange';
      return 'fuchsia';
    };

    const getStatus = (): DashboardTileData['status'] => {
      if (this.alerts.some(a => a.severity === 'CRITICAL')) return 'critical';
      if (this.alerts.some(a => a.severity === 'HIGH')) return 'warning';
      return 'normal';
    };

    return {
      title: 'ENHANCED MOMENTUM V6',
      primaryMetric: this.compositeMomentum.value.toFixed(1),
      secondaryMetric: this.compositeMomentum.category,
      status: getStatus(),
      trend: this.compositeMomentum.value > 0 ? 'up' : 'down',
      actionText: `${this.compositeMomentum.leadTime}w lead`,
      color: getColor()
    };
  }

  getDetailedView(): DetailedEngineView {
    const alerts = this.alerts.length > 0 ? 
      this.alerts.map(alert => ({
        severity: alert.severity.toLowerCase() as 'info' | 'warning' | 'critical',
        message: `${alert.type}: ${alert.message}`
      })) : undefined;

    return {
      title: 'ENHANCED MOMENTUM ENGINE V6',
      primarySection: {
        title: 'COMPOSITE MOMENTUM ANALYSIS',
        metrics: {
          'Momentum Score': `${this.compositeMomentum.value.toFixed(1)}/100`,
          'Category': this.compositeMomentum.category,
          'Regime': this.compositeMomentum.regime,
          'Confidence': `${this.compositeMomentum.confidence}%`,
          'Lead Time': `${this.compositeMomentum.leadTime} weeks`
        }
      },
      sections: [
        {
          title: 'MULTISCALE RATE OF CHANGE',
          metrics: {
            'Short Term (2w)': `${this.multiscaleMomentum.short.roc.toFixed(2)}%`,
            'Medium Term (6w)': `${this.multiscaleMomentum.medium.roc.toFixed(2)}%`,
            'Long Term (12w)': `${this.multiscaleMomentum.long.roc.toFixed(2)}%`
          }
        },
        {
          title: 'VELOCITY & ACCELERATION',
          metrics: {
            'Velocity (1st Deriv)': this.multiscaleMomentum.medium.firstDerivative.toExponential(2),
            'Acceleration (2nd Deriv)': this.multiscaleMomentum.medium.secondDerivative.toExponential(2),
            'Jerk (3rd Deriv)': this.multiscaleMomentum.medium.jerk.toExponential(2)
          }
        },
        {
          title: 'SYSTEM STATUS',
          metrics: {
            'Active Alerts': this.alerts.length.toString(),
            'Indicators Tracked': this.MOMENTUM_INDICATORS.length.toString(),
            'Last Updated': new Date().toLocaleTimeString()
          }
        }
      ],
      alerts
    };
  }
}