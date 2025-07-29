import { IEngine, EngineReport, ActionableInsight, DashboardTileData, DetailedEngineView } from '@/types/engines';
import { BaseEngine } from '@/engines/BaseEngine';
import { supabase } from '@/integrations/supabase/client';

interface CUSIPData {
  cusip: string;
  parAmount: number;
  marketValue: number;
  changeFromPrevious: number;
  stealthScore: number;
  maturityBucket: string;
  anomalyScore?: number;
  detectionMethod?: string;
  technicalFlows: {
    netFlow: number;
    averageSize: number;
    frequency: number;
    timeConcentration: number;
  };
}

interface AnomalyData {
  cusip_id: string;
  anomaly_type: string;
  severity_score: number;
  confidence_level: number;
  detection_method: string;
  anomaly_details: any;
  detected_at: string;
}

interface SOMAHolding {
  cusip_id: string;
  par_amount: number;
  market_value: number;
  change_from_previous: number;
  holdings_date: string;
  cusip_metadata?: {
    maturity_bucket: string;
    duration: number;
    liquidity_tier: number;
  };
}

interface TreasurySegment {
  name: string;
  cusips: CUSIPData[];
  avgStealthScore: number;
  flowDirection: 'STEALTH_BUY' | 'STEALTH_SELL' | 'NEUTRAL';
  intensity: number;
  anomalyCount: number;
  totalHoldings: number;
}

interface StealthPattern {
  pattern_name: string;
  pattern_type: string;
  detection_algorithm: string;
  parameters: any;
  success_rate: number;
  false_positive_rate: number;
}

export class CUSIPStealthQEEngine extends BaseEngine {
  readonly id = 'cusip-stealth-qe-v6';
  readonly name = 'CUSIP-Level Stealth QE Detection V6';
  readonly priority = 1;
  readonly pillar = 2 as const;
  readonly category = 'core' as const;

  // Enhanced V6 metrics
  private segments: TreasurySegment[] = [];
  private overallStealthScore = 0;
  private detectionConfidence = 0;
  private operationIntensity = 0;
  private hiddenFlowsDetected = 0;
  private primaryDealerAnomalies = 0;
  private confidence = 92;
  private readonly CACHE_TTL = 30000; // 30 seconds cache for real-time data
  
  // V6 Advanced features
  private anomalies: AnomalyData[] = [];
  private stealthPatterns: StealthPattern[] = [];
  private h41ValidationStatus = 'pending';
  private somaDataTimestamp: string | null = null;
  
  constructor() {
    super({
      refreshInterval: 30000,
      retryAttempts: 3,
      timeout: 20000,
      cacheTimeout: 60000
    });
    this.initializeAdvancedEngine();
  }

  private async initializeAdvancedEngine(): Promise<void> {
    try {
      // Load stealth detection patterns from database
      await this.loadStealthPatterns();
      
      // Initialize default segments with real data structure
      this.segments = [
        {
          name: '0-1Y BILLS',
          cusips: [],
          avgStealthScore: 0,
          flowDirection: 'NEUTRAL',
          intensity: 0,
          anomalyCount: 0,
          totalHoldings: 0
        },
        {
          name: '1-3Y NOTES',
          cusips: [],
          avgStealthScore: 0,
          flowDirection: 'NEUTRAL',
          intensity: 0,
          anomalyCount: 0,
          totalHoldings: 0
        },
        {
          name: '3-5Y NOTES', 
          cusips: [],
          avgStealthScore: 0,
          flowDirection: 'NEUTRAL',
          intensity: 0,
          anomalyCount: 0,
          totalHoldings: 0
        },
        {
          name: '5-10Y NOTES',
          cusips: [],
          avgStealthScore: 0,
          flowDirection: 'NEUTRAL',
          intensity: 0,
          anomalyCount: 0,
          totalHoldings: 0
        },
        {
          name: '10Y+ BONDS',
          cusips: [],
          avgStealthScore: 0,
          flowDirection: 'NEUTRAL',
          intensity: 0,
          anomalyCount: 0,
          totalHoldings: 0
        }
      ];
    } catch (error) {
      console.error('Failed to initialize advanced engine:', error);
    }
  }

  private async loadStealthPatterns(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('stealth_patterns')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Failed to load stealth patterns:', error);
        return;
      }

      this.stealthPatterns = data || [];
      console.log(`Loaded ${this.stealthPatterns.length} stealth detection patterns`);
    } catch (error) {
      console.error('Error loading stealth patterns:', error);
    }
  }

  private async fetchSOMAHoldings(): Promise<SOMAHolding[]> {
    try {
      // Fetch last 30 days of SOMA holdings data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('soma_holdings')
        .select(`
          cusip_id,
          par_amount,
          market_value,
          change_from_previous,
          holdings_date
        `)
        .gte('holdings_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('holdings_date', { ascending: false });

      if (error) {
        console.error('Failed to fetch SOMA holdings:', error);
        return [];
      }

      // Fetch CUSIP metadata separately to avoid relation issues
      const cusipIds = data?.map(h => h.cusip_id) || [];
      const { data: metadataData } = await supabase
        .from('cusip_metadata')
        .select('cusip_id, maturity_bucket, duration, liquidity_tier')
        .in('cusip_id', cusipIds);

      // Merge the data
      const holdings: SOMAHolding[] = (data || []).map(holding => ({
        ...holding,
        cusip_metadata: metadataData?.find(m => m.cusip_id === holding.cusip_id) || {
          maturity_bucket: '5-10Y',
          duration: 5.0,
          liquidity_tier: 1
        }
      }));

      this.somaDataTimestamp = new Date().toISOString();
      return holdings;
    } catch (error) {
      console.error('Error fetching SOMA holdings:', error);
      return [];
    }
  }

  private async fetchAnomalies(): Promise<AnomalyData[]> {
    try {
      // Fetch recent anomalies (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('cusip_anomalies')
        .select('*')
        .gte('detected_at', sevenDaysAgo.toISOString())
        .order('severity_score', { ascending: false });

      if (error) {
        console.error('Failed to fetch anomalies:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      return [];
    }
  }

  private async triggerAnomalyDetection(): Promise<void> {
    try {
      // Call the anomaly detection edge function
      const { data, error } = await supabase.functions.invoke('cusip-anomaly-detection', {
        body: {
          algorithm: 'dbscan',
          lookbackDays: 30
        }
      });

      if (error) {
        console.error('Failed to trigger anomaly detection:', error);
        return;
      }

      console.log(`Anomaly detection completed: ${data.anomalies_detected} anomalies found`);
    } catch (error) {
      console.error('Error triggering anomaly detection:', error);
    }
  }

  private processSOMAData(holdings: SOMAHolding[]): void {
    // Clear existing CUSIP data
    this.segments.forEach(segment => {
      segment.cusips = [];
      segment.totalHoldings = 0;
    });

    // Group holdings by maturity bucket and process
    const cusipMap = new Map<string, SOMAHolding[]>();
    
    holdings.forEach(holding => {
      const maturityBucket = holding.cusip_metadata?.maturity_bucket || '5-10Y';
      if (!cusipMap.has(maturityBucket)) {
        cusipMap.set(maturityBucket, []);
      }
      cusipMap.get(maturityBucket)!.push(holding);
    });

    // Process each maturity segment
    cusipMap.forEach((holdingsInBucket, bucket) => {
      const segment = this.segments.find(s => s.name.includes(bucket)) || this.segments[2]; // Default to 3-5Y
      
      holdingsInBucket.forEach(holding => {
        const cusipData: CUSIPData = {
          cusip: holding.cusip_id,
          parAmount: holding.par_amount,
          marketValue: holding.market_value,
          changeFromPrevious: holding.change_from_previous,
          stealthScore: 0,
          maturityBucket: bucket,
          technicalFlows: {
            netFlow: holding.change_from_previous,
            averageSize: holding.par_amount / 1000000, // Convert to millions
            frequency: this.calculateTradingFrequency(holding),
            timeConcentration: this.calculateTimeConcentration(holding)
          }
        };

        segment.cusips.push(cusipData);
        segment.totalHoldings += holding.par_amount;
      });
    });
  }

  private calculateTradingFrequency(holding: SOMAHolding): number {
    // Estimate trading frequency based on change patterns
    const absoluteChange = Math.abs(holding.change_from_previous);
    const relativeMagnitude = absoluteChange / Math.max(holding.par_amount, 1);
    
    // Higher relative changes suggest more frequent operations
    return Math.min(10, relativeMagnitude * 100);
  }

  private calculateTimeConcentration(holding: SOMAHolding): number {
    // Analyze temporal patterns (simplified - in real implementation would use historical data)
    const hour = new Date().getHours();
    
    // Federal Reserve operations often occur during specific windows
    if (hour >= 10 && hour <= 11) return 0.8; // High concentration during 10-11 AM
    if (hour >= 14 && hour <= 15) return 0.6; // Moderate during 2-3 PM
    return 0.3; // Low concentration other times
  }

  private processAnomalies(anomalies: AnomalyData[]): void {
    this.anomalies = anomalies;
    
    // Update CUSIP data with anomaly information
    this.segments.forEach(segment => {
      segment.anomalyCount = 0;
      
      segment.cusips.forEach(cusip => {
        const cusipAnomalies = anomalies.filter(a => a.cusip_id === cusip.cusip);
        
        if (cusipAnomalies.length > 0) {
          const highestSeverity = Math.max(...cusipAnomalies.map(a => a.severity_score));
          cusip.anomalyScore = highestSeverity;
          cusip.detectionMethod = cusipAnomalies[0].detection_method;
          segment.anomalyCount++;
        }
      });
    });
  }

  private calculateAdvancedStealthScores(): void {
    let totalStealth = 0;
    let maxIntensity = 0;
    let totalAnomalies = 0;

    this.segments.forEach(segment => {
      let segmentStealth = 0;
      let segmentFlows = 0;
      let segmentAnomalies = 0;

      segment.cusips.forEach(cusip => {
        // Multi-factor stealth calculation
        const flowFactor = this.calculateFlowStealthFactor(cusip);
        const anomalyFactor = cusip.anomalyScore ? cusip.anomalyScore / 100 : 0;
        const temporalFactor = cusip.technicalFlows.timeConcentration;
        const sizeFactor = this.calculateSizeFactor(cusip);
        
        // Weighted composite stealth score
        cusip.stealthScore = (
          flowFactor * 0.4 +
          anomalyFactor * 0.3 +
          temporalFactor * 0.2 +
          sizeFactor * 0.1
        ) * 100;
        
        segmentStealth += cusip.stealthScore;
        segmentFlows += cusip.technicalFlows.netFlow;
        
        if (cusip.anomalyScore && cusip.anomalyScore > 70) {
          segmentAnomalies++;
        }
      });

      segment.avgStealthScore = segment.cusips.length > 0 ? segmentStealth / segment.cusips.length : 0;
      segment.intensity = Math.abs(segmentFlows) / Math.max(segment.totalHoldings / 1000000000, 1); // Normalize by holdings
      segment.anomalyCount = segmentAnomalies;
      
      // Enhanced flow direction detection
      const flowThreshold = segment.totalHoldings * 0.01; // 1% of total holdings
      if (segmentFlows > flowThreshold) {
        segment.flowDirection = 'STEALTH_BUY';
      } else if (segmentFlows < -flowThreshold) {
        segment.flowDirection = 'STEALTH_SELL';
      } else {
        segment.flowDirection = 'NEUTRAL';
      }

      totalStealth += segment.avgStealthScore;
      maxIntensity = Math.max(maxIntensity, segment.intensity);
      totalAnomalies += segmentAnomalies;
    });

    this.overallStealthScore = this.segments.length > 0 ? totalStealth / this.segments.length : 0;
    this.operationIntensity = maxIntensity;
    this.primaryDealerAnomalies = totalAnomalies;
    this.hiddenFlowsDetected = this.segments.filter(s => s.flowDirection !== 'NEUTRAL').length;
    
    // Advanced confidence calculation incorporating multiple factors
    const scoreConfidence = Math.min(1, this.overallStealthScore / 80);
    const intensityConfidence = Math.min(1, this.operationIntensity / 10);
    const anomalyConfidence = Math.min(1, totalAnomalies / 20);
    const patternConfidence = this.stealthPatterns.length > 0 ? 
      this.stealthPatterns.reduce((avg, p) => avg + p.success_rate, 0) / (this.stealthPatterns.length * 100) : 0.5;
    
    this.detectionConfidence = (scoreConfidence + intensityConfidence + anomalyConfidence + patternConfidence) / 4 * 100;
  }

  private calculateFlowStealthFactor(cusip: CUSIPData): number {
    const expectedFlow = cusip.parAmount * 0.005; // 0.5% baseline for typical operations
    const actualFlow = Math.abs(cusip.technicalFlows.netFlow);
    const deviation = actualFlow / Math.max(expectedFlow, 1);
    
    // Stealth operations often show unusual flow patterns
    return Math.min(1, Math.max(0, (deviation - 1) / 10));
  }

  private calculateSizeFactor(cusip: CUSIPData): number {
    // Large operations in small increments are characteristic of stealth
    const averageSize = cusip.technicalFlows.averageSize;
    const frequency = cusip.technicalFlows.frequency;
    
    // High frequency + moderate size = potential stealth
    const stealthProfile = (frequency / 10) * Math.min(1, averageSize / 100);
    return Math.min(1, stealthProfile);
  }

  private getCachedData(key: string): any {
    return super.getCacheData(key);
  }

  private setCachedData(key: string, data: any): void {
    super.setCacheData(key, data);
  }

  protected async performExecution(): Promise<EngineReport> {
    try {
      console.log('CUSIP-Level Stealth QE Detection Engine V6 executing...');
      
      // Check cache first
      const cacheKey = 'cusip-stealth-v6-data';
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        Object.assign(this, cached);
        return this.generateReport();
      }

      // Phase 1: Fetch real SOMA holdings data
      const somaHoldings = await this.fetchSOMAHoldings();
      console.log(`Fetched ${somaHoldings.length} SOMA holdings`);

      // Phase 2: Process SOMA data into segments
      this.processSOMAData(somaHoldings);

      // Phase 3: Trigger advanced anomaly detection if we have enough data
      if (somaHoldings.length > 50) {
        await this.triggerAnomalyDetection();
      }

      // Phase 4: Fetch and process anomalies
      const anomalies = await this.fetchAnomalies();
      this.processAnomalies(anomalies);
      console.log(`Processed ${anomalies.length} anomalies`);

      // Phase 5: Calculate advanced stealth scores
      this.calculateAdvancedStealthScores();
      
      // Cache the computed data
      const computedData = {
        segments: this.segments,
        overallStealthScore: this.overallStealthScore,
        detectionConfidence: this.detectionConfidence,
        operationIntensity: this.operationIntensity,
        hiddenFlowsDetected: this.hiddenFlowsDetected,
        primaryDealerAnomalies: this.primaryDealerAnomalies,
        anomalies: this.anomalies,
        somaDataTimestamp: this.somaDataTimestamp
      };
      this.setCachedData(cacheKey, computedData);

      return this.generateReport();
    } catch (error) {
      console.error('CUSIP Stealth QE Engine V6 error:', error);
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
    console.log(`Stealth QE V6 - Score: ${this.overallStealthScore.toFixed(1)} | Confidence: ${this.detectionConfidence.toFixed(1)}% | Signal: ${signal}`);
    
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
        segments: this.segments,
        anomalies: this.anomalies.slice(0, 10), // Top 10 anomalies
        stealthPatterns: this.stealthPatterns,
        somaDataTimestamp: this.somaDataTimestamp,
        h41ValidationStatus: this.h41ValidationStatus
      },
      lastUpdated: new Date()
    };
  }

  private getMarketSignal(): 'bullish' | 'bearish' | 'neutral' {
    const buyingSegments = this.segments.filter(s => s.flowDirection === 'STEALTH_BUY').length;
    const sellingSegments = this.segments.filter(s => s.flowDirection === 'STEALTH_SELL').length;
    const totalAnomalies = this.segments.reduce((sum, s) => sum + s.anomalyCount, 0);
    
    // Enhanced signal detection with anomaly weighting
    if (buyingSegments >= 2 && this.overallStealthScore > 60 && totalAnomalies > 5) return 'bullish';
    if (sellingSegments >= 2 && this.overallStealthScore > 60 && totalAnomalies > 5) return 'bearish';
    if (buyingSegments > sellingSegments && this.overallStealthScore > 40) return 'bullish';
    if (sellingSegments > buyingSegments && this.overallStealthScore > 40) return 'bearish';
    return 'neutral';
  }

  getSingleActionableInsight(): ActionableInsight {
    const signal = this.getMarketSignal();
    const activeSegments = this.segments.filter(s => s.flowDirection !== 'NEUTRAL');
    const totalAnomalies = this.segments.reduce((sum, s) => sum + s.anomalyCount, 0);
    
    // Calculate signal strength with V6 enhancements
    const scoreComponent = this.overallStealthScore;
    const confidenceComponent = this.detectionConfidence;
    const intensityComponent = this.operationIntensity * 5;
    const anomalyComponent = Math.min(50, totalAnomalies * 5);
    const signalStrength = Math.min(100, (scoreComponent + confidenceComponent + intensityComponent + anomalyComponent) / 4);

    // Enhanced market action determination
    let marketAction: 'BUY' | 'SELL' | 'HOLD' | 'WAIT';
    if (this.hiddenFlowsDetected >= 3 && signal === 'bullish' && totalAnomalies > 8) {
      marketAction = 'BUY';
    } else if (this.hiddenFlowsDetected >= 3 && signal === 'bearish' && totalAnomalies > 8) {
      marketAction = 'SELL';
    } else if (this.overallStealthScore > 50 || totalAnomalies > 5) {
      marketAction = 'WAIT';
    } else {
      marketAction = 'HOLD';
    }

    // Enhanced confidence calculation
    const confidence: 'HIGH' | 'MED' | 'LOW' = 
      this.detectionConfidence > 85 && totalAnomalies > 10 ? 'HIGH' :
      this.detectionConfidence > 70 && totalAnomalies > 5 ? 'MED' : 'LOW';

    // Generate V6 actionable text
    let actionText: string;
    if (this.hiddenFlowsDetected > 0 && totalAnomalies > 0) {
      const dominantDirection = activeSegments.length > 0 ? activeSegments[0].flowDirection : 'NEUTRAL';
      if (dominantDirection === 'STEALTH_BUY') {
        actionText = `STEALTH QE V6: ${this.hiddenFlowsDetected} segments show buying + ${totalAnomalies} ML-detected anomalies`;
      } else if (dominantDirection === 'STEALTH_SELL') {
        actionText = `STEALTH QT V6: ${this.hiddenFlowsDetected} segments show selling + ${totalAnomalies} ML-detected anomalies`;
      } else {
        actionText = `MIXED STEALTH V6: ${totalAnomalies} anomalies across ${this.hiddenFlowsDetected} active segments`;
      }
    } else if (totalAnomalies > 0) {
      actionText = `ANOMALY ALERT V6: ${totalAnomalies} ML-detected irregularities in CUSIP flows`;
    } else {
      actionText = `NORMAL OPERATIONS V6: No significant stealth patterns or anomalies detected`;
    }

    return {
      actionText,
      signalStrength: Math.round(signalStrength),
      marketAction,
      confidence,
      timeframe: totalAnomalies > 8 ? 'IMMEDIATE' : this.hiddenFlowsDetected > 2 ? 'SHORT_TERM' : 'MEDIUM_TERM'
    };
  }

  getDashboardData(): DashboardTileData {
    const totalAnomalies = this.segments.reduce((sum, s) => sum + s.anomalyCount, 0);
    
    const getColor = (): 'success' | 'critical' | 'warning' | 'success' | 'critical' => {
      if (totalAnomalies > 10) return 'critical'; // Critical anomaly count
      if (this.hiddenFlowsDetected >= 3) return 'critical'; // High stealth activity
      if (this.overallStealthScore > 50) return 'warning'; // Moderate stealth
      return 'success'; // Normal
    };

    const getStatus = (): 'normal' | 'warning' | 'critical' => {
      if (totalAnomalies > 15 || this.overallStealthScore > 80) return 'critical';
      if (this.hiddenFlowsDetected > 2 || totalAnomalies > 8) return 'warning';
      return 'normal';
    };

    const getTrend = (): 'up' | 'down' | 'neutral' => {
      const signal = this.getMarketSignal();
      if (signal === 'bullish') return 'up';
      if (signal === 'bearish') return 'down';
      return 'neutral';
    };

    return {
      title: 'CUSIP STEALTH QE V6',
      primaryMetric: `${this.overallStealthScore.toFixed(1)}`,
      secondaryMetric: `${this.hiddenFlowsDetected} Flows | ${totalAnomalies} ML Anomalies`,
      status: getStatus(),
      trend: getTrend(),
      color: getColor(),
      actionText: totalAnomalies > 0 ? `V6: ${totalAnomalies} ANOMALIES DETECTED` : 'V6: NORMAL OPERATIONS'
    };
  }

  getDetailedView(): DetailedEngineView {
    const activeSegments = this.segments.filter(s => s.flowDirection !== 'NEUTRAL');
    const totalAnomalies = this.segments.reduce((sum, s) => sum + s.anomalyCount, 0);
    const topAnomalies = this.anomalies.slice(0, 5);
    
    return {
      title: 'CUSIP-Level Stealth QE Detection Engine V6',
      primarySection: {
        title: 'V6 Enhanced Detection System',
        metrics: {
          'Overall Stealth Score': `${this.overallStealthScore.toFixed(1)}/100`,
          'ML Detection Confidence': `${this.detectionConfidence.toFixed(1)}%`,
          'Operation Intensity': `${this.operationIntensity.toFixed(2)}`,
          'Hidden Flows Detected': this.hiddenFlowsDetected.toString(),
          'ML Anomalies Found': totalAnomalies.toString()
        }
      },
      sections: [
        {
          title: 'Maturity Segment Analysis',
          metrics: {
            '0-1Y Bills': `${this.segments[0]?.avgStealthScore.toFixed(1) || '0'} (${this.segments[0]?.flowDirection || 'NEUTRAL'}) [${this.segments[0]?.anomalyCount || 0} anomalies]`,
            '1-3Y Notes': `${this.segments[1]?.avgStealthScore.toFixed(1) || '0'} (${this.segments[1]?.flowDirection || 'NEUTRAL'}) [${this.segments[1]?.anomalyCount || 0} anomalies]`,
            '3-5Y Notes': `${this.segments[2]?.avgStealthScore.toFixed(1) || '0'} (${this.segments[2]?.flowDirection || 'NEUTRAL'}) [${this.segments[2]?.anomalyCount || 0} anomalies]`,
            '5-10Y Notes': `${this.segments[3]?.avgStealthScore.toFixed(1) || '0'} (${this.segments[3]?.flowDirection || 'NEUTRAL'}) [${this.segments[3]?.anomalyCount || 0} anomalies]`,
            '10Y+ Bonds': `${this.segments[4]?.avgStealthScore.toFixed(1) || '0'} (${this.segments[4]?.flowDirection || 'NEUTRAL'}) [${this.segments[4]?.anomalyCount || 0} anomalies]`
          }
        },
        {
          title: 'V6 Intelligence Systems',
          metrics: {
            'SOMA Data Status': this.somaDataTimestamp ? 'LIVE' : 'SIMULATED',
            'H.4.1 Validation': this.h41ValidationStatus.toUpperCase(),
            'Active Patterns': this.stealthPatterns.length.toString(),
            'Pattern Success Rate': this.stealthPatterns.length > 0 ? 
              `${(this.stealthPatterns.reduce((avg, p) => avg + p.success_rate, 0) / this.stealthPatterns.length).toFixed(1)}%` : 'N/A',
            'Detection Algorithms': this.stealthPatterns.map(p => p.detection_algorithm).join(', ') || 'Statistical'
          }
        },
        {
          title: 'Anomaly Intelligence',
          metrics: topAnomalies.length > 0 ? {
            'Top Anomaly': `${topAnomalies[0].cusip_id} (${topAnomalies[0].severity_score.toFixed(1)}/100)`,
            'Detection Method': topAnomalies[0].detection_method.toUpperCase(),
            'Anomaly Type': topAnomalies[0].anomaly_type.toUpperCase(),
            'Total Critical': this.anomalies.filter(a => a.severity_score > 80).length.toString(),
            'Last Scan': new Date(Math.max(...this.anomalies.map(a => new Date(a.detected_at).getTime()))).toLocaleTimeString()
          } : {
            'Anomaly Status': 'No recent anomalies detected',
            'Scan Status': 'Continuous monitoring active'
          }
        }
      ],
      alerts: totalAnomalies > 5 ? [
        {
          severity: totalAnomalies > 15 ? 'critical' as const : 'warning' as const,
          message: `V6 ALERT: ${totalAnomalies} ML-detected anomalies across ${this.hiddenFlowsDetected} stealth flow segments. Top severity: ${Math.max(...this.anomalies.map(a => a.severity_score)).toFixed(1)}/100`
        }
      ] : undefined
    };
  }

  getIntelligenceView() {
    const dashboardData = this.getDashboardData();
    return {
      title: this.name,
      status: dashboardData.status === 'critical' ? 'critical' as const : 
              dashboardData.status === 'warning' ? 'warning' as const : 'active' as const,
      primaryMetrics: {
        'Stealth Score': {
          value: `${this.overallStealthScore.toFixed(1)}/100`,
          label: 'Overall stealth activity score',
          status: 'normal' as const
        }
      },
      sections: [
        {
          title: 'Detection Metrics',
          data: {
            'Detection Confidence': {
              value: `${this.detectionConfidence.toFixed(1)}%`,
              label: 'ML detection confidence',
              unit: '%'
            },
            'Hidden Flows': {
              value: this.hiddenFlowsDetected,
              label: 'Active stealth flow segments'
            },
            'ML Anomalies': {
              value: this.segments.reduce((sum, s) => sum + s.anomalyCount, 0),
              label: 'Total ML-detected anomalies'
            }
          }
        }
      ],
      confidence: this.detectionConfidence,
      lastUpdate: new Date()
    };
  }

  getDetailedModal() {
    const dashboardData = this.getDashboardData();
    return {
      title: this.name,
      description: 'Advanced CUSIP-level stealth QE detection using machine learning anomaly detection',
      keyInsights: [
        `Overall stealth score: ${this.overallStealthScore.toFixed(1)}/100`,
        `Detection confidence: ${this.detectionConfidence.toFixed(1)}%`,
        `Active anomalies: ${this.segments.reduce((sum, s) => sum + s.anomalyCount, 0)}`
      ],
      detailedMetrics: [
        {
          category: 'Detection Results',
          metrics: {
            'Stealth Score': { value: this.overallStealthScore, description: 'Composite stealth activity score' },
            'Confidence': { value: `${this.detectionConfidence}%`, description: 'ML detection confidence level' },
            'Anomalies': { value: this.segments.reduce((sum, s) => sum + s.anomalyCount, 0), description: 'Total ML-detected anomalies' }
          }
        }
      ]
    };
  }
}