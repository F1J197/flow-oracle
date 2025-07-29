import { IEngine, DashboardTileData, DetailedEngineView, EngineReport, ActionableInsight } from "@/types/engines";
import { dataService } from "@/services/dataService";

interface CUSIPData {
  id: string;
  name: string;
  maturity: string;
  outstandingAmount: number;
  yieldCurveContribution: number;
  technicalFlows: number;
  stealthScore: number;
}

interface TreasurySegment {
  name: string;
  cusips: CUSIPData[];
  avgStealthScore: number;
  flowDirection: 'STEALTH_BUY' | 'STEALTH_SELL' | 'NEUTRAL';
  intensity: number;
}

export class CUSIPStealthQEEngine implements IEngine {
  id = 'cusip-stealth-qe';
  name = 'CUSIP-Level Stealth QE Detection V6';
  priority = 2;
  pillar = 2 as const;

  // Core stealth QE metrics
  private segments: TreasurySegment[] = [];
  private overallStealthScore = 0;
  private detectionConfidence = 0;
  private operationIntensity = 0;
  private hiddenFlowsDetected = 0;
  private primaryDealerAnomalies = 0;
  private confidence = 92;
  private cache = new Map<string, any>();
  private readonly CACHE_TTL = 45000; // 45 seconds cache

  constructor() {
    this.initializeDefaultSegments();
  }

  private initializeDefaultSegments(): void {
    this.segments = [
      {
        name: '2-5Y BILLS',
        cusips: this.generateMockCUSIPs('BILLS', 5),
        avgStealthScore: 0,
        flowDirection: 'NEUTRAL',
        intensity: 0
      },
      {
        name: '5-10Y NOTES', 
        cusips: this.generateMockCUSIPs('NOTES', 8),
        avgStealthScore: 0,
        flowDirection: 'NEUTRAL',
        intensity: 0
      },
      {
        name: '10-30Y BONDS',
        cusips: this.generateMockCUSIPs('BONDS', 6),
        avgStealthScore: 0,
        flowDirection: 'NEUTRAL',
        intensity: 0
      },
      {
        name: 'TIPS COMPLEX',
        cusips: this.generateMockCUSIPs('TIPS', 4),
        avgStealthScore: 0,
        flowDirection: 'NEUTRAL',
        intensity: 0
      }
    ];
  }

  private generateMockCUSIPs(type: string, count: number): CUSIPData[] {
    const cusips: CUSIPData[] = [];
    const baseValues = {
      BILLS: { yield: 5.2, outstanding: 1200, maturity: '2027' },
      NOTES: { yield: 4.1, outstanding: 2800, maturity: '2032' },
      BONDS: { yield: 4.5, outstanding: 1900, maturity: '2054' },
      TIPS: { yield: 2.8, outstanding: 450, maturity: '2034' }
    };
    
    const base = baseValues[type as keyof typeof baseValues];
    
    for (let i = 0; i < count; i++) {
      const variation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 multiplier
      cusips.push({
        id: `912828${type.charAt(0)}${i.toString().padStart(2, '0')}`,
        name: `${type} ${base.maturity}-${i + 1}`,
        maturity: base.maturity,
        outstandingAmount: base.outstanding * variation,
        yieldCurveContribution: base.yield * variation,
        technicalFlows: (Math.random() - 0.5) * 50, // -25 to +25
        stealthScore: 0
      });
    }
    
    return cusips;
  }

  private fetchWithTimeout<T>(fn: () => Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
  }

  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { ...data, timestamp: Date.now() });
  }

  private calculateStealthScores(): void {
    let totalStealth = 0;
    let maxIntensity = 0;
    let anomalyCount = 0;

    this.segments.forEach(segment => {
      let segmentStealth = 0;
      let segmentFlows = 0;

      segment.cusips.forEach(cusip => {
        // Calculate stealth score based on technical flows vs expected patterns
        const expectedFlow = cusip.outstandingAmount * 0.01; // 1% baseline
        const flowAnomaly = Math.abs(cusip.technicalFlows - expectedFlow);
        const stealthIndicator = flowAnomaly / expectedFlow;
        
        cusip.stealthScore = Math.min(100, stealthIndicator * 20); // Scale to 0-100
        segmentStealth += cusip.stealthScore;
        segmentFlows += cusip.technicalFlows;

        if (cusip.stealthScore > 75) anomalyCount++;
      });

      segment.avgStealthScore = segmentStealth / segment.cusips.length;
      segment.intensity = Math.abs(segmentFlows) / 100;
      
      // Determine flow direction
      if (segmentFlows > 15) {
        segment.flowDirection = 'STEALTH_BUY';
      } else if (segmentFlows < -15) {
        segment.flowDirection = 'STEALTH_SELL';
      } else {
        segment.flowDirection = 'NEUTRAL';
      }

      totalStealth += segment.avgStealthScore;
      maxIntensity = Math.max(maxIntensity, segment.intensity);
    });

    this.overallStealthScore = totalStealth / this.segments.length;
    this.operationIntensity = maxIntensity;
    this.primaryDealerAnomalies = anomalyCount;
    this.hiddenFlowsDetected = this.segments.filter(s => s.flowDirection !== 'NEUTRAL').length;
    
    // Calculate detection confidence based on multiple factors
    const scoreConfidence = this.overallStealthScore / 100;
    const intensityConfidence = Math.min(1, this.operationIntensity / 50);
    const anomalyConfidence = Math.min(1, this.primaryDealerAnomalies / 10);
    
    this.detectionConfidence = (scoreConfidence + intensityConfidence + anomalyConfidence) / 3 * 100;
  }

  private simulateRealtimeFlows(): void {
    // Simulate real-time CUSIP-level flow detection
    const timeOfDay = new Date().getHours();
    const marketSession = timeOfDay >= 9 && timeOfDay <= 16 ? 'ACTIVE' : 'QUIET';
    
    this.segments.forEach(segment => {
      segment.cusips.forEach(cusip => {
        // Add some realistic flow simulation based on market conditions
        const baseFlow = cusip.technicalFlows;
        const sessionMultiplier = marketSession === 'ACTIVE' ? 1.5 : 0.3;
        const randomVariation = (Math.random() - 0.5) * 20; // ±10 variation
        
        cusip.technicalFlows = baseFlow * sessionMultiplier + randomVariation;
      });
    });
  }

  async execute(): Promise<EngineReport> {
    try {
      console.log('CUSIP-Level Stealth QE Detection Engine V6 executing...');
      
      // Check cache first
      const cacheKey = 'cusip-stealth-data';
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        this.segments = cached.segments;
        this.overallStealthScore = cached.overallStealthScore;
        this.detectionConfidence = cached.detectionConfidence;
        this.operationIntensity = cached.operationIntensity;
        return this.generateReport();
      }

      // Simulate real-time data acquisition
      this.simulateRealtimeFlows();
      
      // Try to fetch some real Treasury data for enhanced realism
      try {
        const treasuryData = await this.fetchWithTimeout(
          () => dataService.fetchFREDData('DGS10'), 
          3000
        );
        
        // Use treasury data to adjust stealth detection sensitivity
        if (treasuryData) {
          const yieldLevel = treasuryData;
          const sensitivityAdjustment = yieldLevel > 4.5 ? 1.2 : yieldLevel < 3.5 ? 0.8 : 1.0;
          
          this.segments.forEach(segment => {
            segment.cusips.forEach(cusip => {
              cusip.technicalFlows *= sensitivityAdjustment;
            });
          });
        }
      } catch (error) {
        console.warn('Could not fetch Treasury data, using simulated flows:', error);
      }

      // Calculate stealth scores
      this.calculateStealthScores();
      
      // Cache the computed data
      const computedData = {
        segments: this.segments,
        overallStealthScore: this.overallStealthScore,
        detectionConfidence: this.detectionConfidence,
        operationIntensity: this.operationIntensity,
        timestamp: Date.now()
      };
      this.setCachedData(cacheKey, computedData);

      return this.generateReport();
    } catch (error) {
      console.error('CUSIP Stealth QE Engine error:', error);
      return {
        success: false,
        confidence: 0,
        signal: 'neutral',
        data: null,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        lastUpdated: new Date()
      };
    }
  }

  private generateReport(): EngineReport {
    const signal = this.getMarketSignal();
    console.log(`Stealth QE Score: ${this.overallStealthScore.toFixed(1)} | Detection: ${this.detectionConfidence.toFixed(1)}% | Signal: ${signal}`);
    
    return {
      success: true,
      confidence: this.detectionConfidence / 100,
      signal,
      data: {
        overallStealthScore: this.overallStealthScore,
        detectionConfidence: this.detectionConfidence,
        operationIntensity: this.operationIntensity,
        hiddenFlowsDetected: this.hiddenFlowsDetected,
        primaryDealerAnomalies: this.primaryDealerAnomalies,
        segments: this.segments
      },
      lastUpdated: new Date()
    };
  }

  private getMarketSignal(): 'bullish' | 'bearish' | 'neutral' {
    const buyingSegments = this.segments.filter(s => s.flowDirection === 'STEALTH_BUY').length;
    const sellingSegments = this.segments.filter(s => s.flowDirection === 'STEALTH_SELL').length;
    
    if (buyingSegments >= 2 && this.overallStealthScore > 60) return 'bullish';
    if (sellingSegments >= 2 && this.overallStealthScore > 60) return 'bearish';
    return 'neutral';
  }

  getSingleActionableInsight(): ActionableInsight {
    const signal = this.getMarketSignal();
    const activeSegments = this.segments.filter(s => s.flowDirection !== 'NEUTRAL');
    
    // Calculate signal strength
    const scoreComponent = this.overallStealthScore;
    const confidenceComponent = this.detectionConfidence;
    const intensityComponent = this.operationIntensity * 2;
    const signalStrength = Math.min(100, (scoreComponent + confidenceComponent + intensityComponent) / 3);

    // Determine market action
    let marketAction: 'BUY' | 'SELL' | 'HOLD' | 'WAIT';
    if (this.hiddenFlowsDetected >= 3 && signal === 'bullish') {
      marketAction = 'BUY';
    } else if (this.hiddenFlowsDetected >= 3 && signal === 'bearish') {
      marketAction = 'SELL';
    } else if (this.overallStealthScore > 40) {
      marketAction = 'WAIT';
    } else {
      marketAction = 'HOLD';
    }

    // Determine confidence
    const confidence: 'HIGH' | 'MED' | 'LOW' = 
      this.detectionConfidence > 80 && this.primaryDealerAnomalies > 5 ? 'HIGH' :
      this.detectionConfidence > 60 && this.primaryDealerAnomalies > 2 ? 'MED' : 'LOW';

    // Generate actionable text
    let actionText: string;
    if (this.hiddenFlowsDetected > 0) {
      const dominantDirection = activeSegments.length > 0 ? activeSegments[0].flowDirection : 'NEUTRAL';
      if (dominantDirection === 'STEALTH_BUY') {
        actionText = `STEALTH QE DETECTED: ${this.hiddenFlowsDetected} segments show hidden buying flows`;
      } else if (dominantDirection === 'STEALTH_SELL') {
        actionText = `STEALTH QT DETECTED: ${this.hiddenFlowsDetected} segments show hidden selling flows`;
      } else {
        actionText = `MIXED SIGNALS: ${this.primaryDealerAnomalies} dealer anomalies across segments`;
      }
    } else {
      actionText = `NO STEALTH OPERATIONS: Market flows appear normal across all CUSIP segments`;
    }

    return {
      actionText,
      signalStrength: Math.round(signalStrength),
      marketAction,
      confidence,
      timeframe: this.hiddenFlowsDetected > 2 ? 'IMMEDIATE' : 'SHORT_TERM'
    };
  }

  getDashboardData(): DashboardTileData {
    const getColor = (): 'teal' | 'orange' | 'gold' | 'lime' | 'fuchsia' => {
      if (this.hiddenFlowsDetected >= 3) return 'fuchsia'; // High stealth activity
      if (this.overallStealthScore > 70) return 'orange'; // Moderate stealth
      if (this.overallStealthScore > 40) return 'gold'; // Some stealth
      return 'teal'; // Normal
    };

    const getStatus = (): 'normal' | 'warning' | 'critical' => {
      if (this.primaryDealerAnomalies > 8) return 'critical';
      if (this.hiddenFlowsDetected > 2) return 'warning';
      return 'normal';
    };

    const getTrend = (): 'up' | 'down' | 'neutral' => {
      const signal = this.getMarketSignal();
      if (signal === 'bullish') return 'up';
      if (signal === 'bearish') return 'down';
      return 'neutral';
    };

    return {
      title: 'CUSIP STEALTH QE ENGINE',
      primaryMetric: `${this.overallStealthScore.toFixed(1)}`,
      secondaryMetric: `${this.hiddenFlowsDetected} Hidden Flows | ${this.primaryDealerAnomalies} Anomalies`,
      status: getStatus(),
      trend: getTrend(),
      color: getColor(),
      actionText: this.hiddenFlowsDetected > 0 ? 'STEALTH OPERATIONS DETECTED' : 'NORMAL FLOWS'
    };
  }

  getDetailedView(): DetailedEngineView {
    const activeSegments = this.segments.filter(s => s.flowDirection !== 'NEUTRAL');
    
    return {
      title: 'CUSIP-Level Stealth QE Detection Engine V6',
      primarySection: {
        title: 'Stealth Operation Detection',
        metrics: {
          'Overall Stealth Score': `${this.overallStealthScore.toFixed(1)}/100`,
          'Detection Confidence': `${this.detectionConfidence.toFixed(1)}%`,
          'Operation Intensity': `${this.operationIntensity.toFixed(1)}`,
          'Hidden Flows Detected': this.hiddenFlowsDetected.toString()
        }
      },
      sections: [
        {
          title: 'Segment Analysis',
          metrics: {
            '2-5Y Bills Stealth': `${this.segments[0]?.avgStealthScore.toFixed(1) || '0'} (${this.segments[0]?.flowDirection || 'NEUTRAL'})`,
            '5-10Y Notes Stealth': `${this.segments[1]?.avgStealthScore.toFixed(1) || '0'} (${this.segments[1]?.flowDirection || 'NEUTRAL'})`,
            '10-30Y Bonds Stealth': `${this.segments[2]?.avgStealthScore.toFixed(1) || '0'} (${this.segments[2]?.flowDirection || 'NEUTRAL'})`,
            'TIPS Complex Stealth': `${this.segments[3]?.avgStealthScore.toFixed(1) || '0'} (${this.segments[3]?.flowDirection || 'NEUTRAL'})`
          }
        },
        {
          title: 'Flow Intelligence',
          metrics: {
            'Primary Dealer Anomalies': this.primaryDealerAnomalies.toString(),
            'Active Segments': activeSegments.length.toString(),
            'Market Signal': this.getMarketSignal().toUpperCase(),
            'Stealth Classification': this.overallStealthScore > 70 ? 'HIGH STEALTH' : this.overallStealthScore > 40 ? 'MODERATE STEALTH' : 'NORMAL'
          }
        }
      ],
      alerts: this.hiddenFlowsDetected > 2 ? [
        {
          severity: 'warning' as const,
          message: `ALERT: ${this.hiddenFlowsDetected} segments showing stealth operations with ${this.primaryDealerAnomalies} dealer anomalies`
        }
      ] : undefined
    };
  }
}