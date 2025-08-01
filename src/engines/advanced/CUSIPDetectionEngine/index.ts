import { BaseEngine, EngineConfig, EngineOutput } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'cusip-detection',
  name: 'CUSIP Stealth QE Detection',
  pillar: 4,
  priority: 88,
  updateInterval: 3600000, // 1 hour
  requiredIndicators: ['SOMA_HOLDINGS', 'TREASURY_ISSUANCE']
};

export interface CUSIPAnomaly {
  cusip: string;
  securityType: string;
  anomalyScore: number;
  purchasePattern: 'STEALTH_QE' | 'NORMAL' | 'SUSPICIOUS';
  confidence: number;
  evidence: string[];
}

export interface OperationDetection {
  detected: boolean;
  probability: number;
  timeToAnnouncement: number; // Hours
  operationType: 'QE' | 'QT' | 'TWIST' | 'UNKNOWN';
  evidence: CUSIPAnomaly[];
}

export class CUSIPDetectionEngine extends BaseEngine {
  private readonly ANOMALY_THRESHOLDS = {
    STEALTH_QE: 0.75,
    SUSPICIOUS: 0.60,
    NORMAL: 0.40
  };

  private readonly DBSCAN_PARAMS = {
    epsilon: 0.3,
    minPoints: 3
  };

  private historicalPatterns: Map<string, any[]> = new Map();
  private detectionHistory: OperationDetection[] = [];

  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    // Extract CUSIP-level data
    const somaHoldings = this.extractLatestValue(data.get('SOMA_HOLDINGS'));
    const treasuryIssuance = this.extractLatestValue(data.get('TREASURY_ISSUANCE'));

    if (!somaHoldings) {
      return this.getDefaultOutput();
    }

    // Perform CUSIP-level analysis
    const cusipAnomalies = this.detectCUSIPAnomalies(somaHoldings);
    const clusters = this.performDBSCANClustering(cusipAnomalies);
    const operationDetection = this.analyzeOperationProbability(clusters);
    
    // Calculate stealth QE probability
    const stealthQEProb = this.calculateStealthQEProbability(operationDetection, cusipAnomalies);
    const confidence = this.calculateDetectionConfidence(operationDetection, cusipAnomalies);
    
    // Determine signal
    const signal = this.determineSignal(operationDetection, stealthQEProb);
    
    // Store in history
    this.detectionHistory.push(operationDetection);
    if (this.detectionHistory.length > 100) {
      this.detectionHistory = this.detectionHistory.slice(-100);
    }

    return {
      primaryMetric: {
        value: stealthQEProb * 100,
        change24h: this.calculateProbabilityChange(24),
        changePercent: this.calculateProbabilityChangePercent(24)
      },
      signal,
      confidence,
      analysis: this.generateDetectionAnalysis(operationDetection, stealthQEProb, cusipAnomalies),
      subMetrics: {
        stealthQEProbability: stealthQEProb,
        operationDetection,
        cusipAnomalies: cusipAnomalies.slice(0, 10), // Top 10 anomalies
        clusters: clusters.length,
        timeToAnnouncement: operationDetection.timeToAnnouncement,
        operationType: operationDetection.operationType,
        totalAnomalies: cusipAnomalies.length,
        highConfidenceAnomalies: cusipAnomalies.filter(a => a.confidence > 0.8).length,
        recentDetections: this.detectionHistory.slice(-5)
      }
    };
  }

  private detectCUSIPAnomalies(somaData: any): CUSIPAnomaly[] {
    const anomalies: CUSIPAnomaly[] = [];
    
    // Mock CUSIP data processing - in reality would process actual SOMA holdings
    const mockCUSIPs = this.generateMockCUSIPData();
    
    for (const cusip of mockCUSIPs) {
      const anomaly = this.analyzeCUSIPPattern(cusip);
      if (anomaly.anomalyScore > this.ANOMALY_THRESHOLDS.NORMAL) {
        anomalies.push(anomaly);
      }
    }
    
    return anomalies.sort((a, b) => b.anomalyScore - a.anomalyScore);
  }

  private analyzeCUSIPPattern(cusipData: any): CUSIPAnomaly {
    // Analyze individual CUSIP for anomalous patterns
    const volumeAnomaly = this.detectVolumeAnomaly(cusipData);
    const timingAnomaly = this.detectTimingAnomaly(cusipData);
    const sizeAnomaly = this.detectSizeAnomaly(cusipData);
    
    const anomalyScore = (volumeAnomaly + timingAnomaly + sizeAnomaly) / 3;
    const evidence = this.generateEvidence(volumeAnomaly, timingAnomaly, sizeAnomaly);
    
    return {
      cusip: cusipData.cusip,
      securityType: cusipData.securityType,
      anomalyScore,
      purchasePattern: this.classifyPattern(anomalyScore),
      confidence: this.calculateCUSIPConfidence(anomalyScore, evidence),
      evidence
    };
  }

  private detectVolumeAnomaly(cusipData: any): number {
    // Detect abnormal volume patterns
    const recentVolume = cusipData.recentPurchases || 0;
    const historicalAvg = cusipData.historicalAverage || 1;
    
    const volumeRatio = recentVolume / historicalAvg;
    
    if (volumeRatio > 3) return 0.9; // Very high volume
    if (volumeRatio > 2) return 0.7; // High volume
    if (volumeRatio > 1.5) return 0.5; // Elevated volume
    return 0.2; // Normal volume
  }

  private detectTimingAnomaly(cusipData: any): number {
    // Detect unusual timing patterns
    const purchaseTiming = cusipData.purchaseTiming || 'normal';
    
    switch (purchaseTiming) {
      case 'off_hours': return 0.8;
      case 'friday_evening': return 0.9;
      case 'pre_announcement': return 0.95;
      default: return 0.1;
    }
  }

  private detectSizeAnomaly(cusipData: any): number {
    // Detect unusual purchase sizes
    const purchaseSize = cusipData.averagePurchaseSize || 0;
    const marketSize = cusipData.totalOutstanding || 1;
    
    const sizeRatio = purchaseSize / marketSize;
    
    if (sizeRatio > 0.05) return 0.9; // > 5% of outstanding
    if (sizeRatio > 0.02) return 0.7; // > 2% of outstanding
    if (sizeRatio > 0.01) return 0.5; // > 1% of outstanding
    return 0.2;
  }

  private performDBSCANClustering(anomalies: CUSIPAnomaly[]): any[] {
    // DBSCAN clustering to identify coordinated operations
    const clusters: any[] = [];
    const visited = new Set<number>();
    
    for (let i = 0; i < anomalies.length; i++) {
      if (visited.has(i)) continue;
      
      const neighbors = this.findNeighbors(anomalies, i);
      
      if (neighbors.length >= this.DBSCAN_PARAMS.minPoints) {
        const cluster = this.expandCluster(anomalies, i, neighbors, visited);
        clusters.push(cluster);
      }
    }
    
    return clusters;
  }

  private findNeighbors(anomalies: CUSIPAnomaly[], pointIndex: number): number[] {
    const neighbors: number[] = [];
    const point = anomalies[pointIndex];
    
    for (let i = 0; i < anomalies.length; i++) {
      if (i === pointIndex) continue;
      
      const distance = this.calculateAnomalyDistance(point, anomalies[i]);
      if (distance <= this.DBSCAN_PARAMS.epsilon) {
        neighbors.push(i);
      }
    }
    
    return neighbors;
  }

  private calculateAnomalyDistance(a1: CUSIPAnomaly, a2: CUSIPAnomaly): number {
    // Calculate distance between anomalies in feature space
    const scoreDiff = Math.abs(a1.anomalyScore - a2.anomalyScore);
    const confidenceDiff = Math.abs(a1.confidence - a2.confidence);
    
    return Math.sqrt(scoreDiff * scoreDiff + confidenceDiff * confidenceDiff);
  }

  private expandCluster(anomalies: CUSIPAnomaly[], pointIndex: number, neighbors: number[], visited: Set<number>): any {
    const cluster = {
      core: pointIndex,
      members: [pointIndex],
      anomalyLevel: 'HIGH',
      operationType: 'SUSPECTED_QE'
    };
    
    visited.add(pointIndex);
    
    for (const neighborIndex of neighbors) {
      if (!visited.has(neighborIndex)) {
        visited.add(neighborIndex);
        cluster.members.push(neighborIndex);
        
        const newNeighbors = this.findNeighbors(anomalies, neighborIndex);
        if (newNeighbors.length >= this.DBSCAN_PARAMS.minPoints) {
          neighbors.push(...newNeighbors);
        }
      }
    }
    
    return cluster;
  }

  private analyzeOperationProbability(clusters: any[]): OperationDetection {
    if (clusters.length === 0) {
      return {
        detected: false,
        probability: 0.1,
        timeToAnnouncement: -1,
        operationType: 'UNKNOWN',
        evidence: []
      };
    }
    
    const largestCluster = clusters.reduce((max, cluster) => 
      cluster.members.length > max.members.length ? cluster : max
    );
    
    const probability = Math.min(0.95, 0.3 + (largestCluster.members.length * 0.15));
    
    return {
      detected: probability > 0.6,
      probability,
      timeToAnnouncement: this.estimateAnnouncementTime(probability),
      operationType: this.classifyOperationType(clusters),
      evidence: []
    };
  }

  private estimateAnnouncementTime(probability: number): number {
    // Estimate hours until announcement based on detection probability
    if (probability > 0.9) return 24; // Very high confidence - 1 day
    if (probability > 0.8) return 48; // High confidence - 2 days
    if (probability > 0.7) return 72; // Medium confidence - 3 days
    return -1; // Unknown
  }

  private classifyOperationType(clusters: any[]): OperationDetection['operationType'] {
    if (clusters.length === 0) return 'UNKNOWN';
    
    // Simple classification based on cluster characteristics
    const totalAnomalies = clusters.reduce((sum, cluster) => sum + cluster.members.length, 0);
    
    if (totalAnomalies > 10) return 'QE';
    if (totalAnomalies > 5) return 'TWIST';
    return 'QT';
  }

  private calculateStealthQEProbability(detection: OperationDetection, anomalies: CUSIPAnomaly[]): number {
    let probability = detection.probability;
    
    // Boost probability based on anomaly characteristics
    const highConfidenceAnomalies = anomalies.filter(a => a.confidence > 0.8).length;
    const stealthPatterns = anomalies.filter(a => a.purchasePattern === 'STEALTH_QE').length;
    
    probability += (highConfidenceAnomalies * 0.05);
    probability += (stealthPatterns * 0.1);
    
    return Math.min(0.98, probability);
  }

  private generateMockCUSIPData(): any[] {
    // Generate mock CUSIP data for demonstration
    const cusips = [];
    for (let i = 0; i < 50; i++) {
      cusips.push({
        cusip: `91282${Math.random().toString().slice(2, 6)}`,
        securityType: Math.random() > 0.5 ? 'NOTE' : 'BOND',
        recentPurchases: Math.random() * 1000000000,
        historicalAverage: 200000000 + Math.random() * 300000000,
        purchaseTiming: Math.random() > 0.8 ? 'off_hours' : 'normal',
        averagePurchaseSize: Math.random() * 50000000,
        totalOutstanding: 1000000000 + Math.random() * 2000000000
      });
    }
    return cusips;
  }

  private generateEvidence(volume: number, timing: number, size: number): string[] {
    const evidence: string[] = [];
    
    if (volume > 0.7) evidence.push('Abnormal volume pattern detected');
    if (timing > 0.7) evidence.push('Suspicious timing of purchases');
    if (size > 0.7) evidence.push('Unusually large purchase sizes');
    
    return evidence;
  }

  private classifyPattern(score: number): CUSIPAnomaly['purchasePattern'] {
    if (score >= this.ANOMALY_THRESHOLDS.STEALTH_QE) return 'STEALTH_QE';
    if (score >= this.ANOMALY_THRESHOLDS.SUSPICIOUS) return 'SUSPICIOUS';
    return 'NORMAL';
  }

  private calculateCUSIPConfidence(score: number, evidence: string[]): number {
    return Math.min(100, score * 100 + evidence.length * 10);
  }

  private calculateDetectionConfidence(detection: OperationDetection, anomalies: CUSIPAnomaly[]): number {
    let confidence = detection.probability * 70;
    
    const avgAnomalyConfidence = anomalies.reduce((sum, a) => sum + a.confidence, 0) / anomalies.length;
    confidence += avgAnomalyConfidence * 0.3;
    
    return Math.min(100, confidence);
  }

  private determineSignal(detection: OperationDetection, probability: number): EngineOutput['signal'] {
    if (detection.detected && probability > 0.8) return 'WARNING';
    if (probability > 0.6) return 'NEUTRAL';
    return 'RISK_ON';
  }

  private generateDetectionAnalysis(detection: OperationDetection, probability: number, anomalies: CUSIPAnomaly[]): string {
    if (!detection.detected) {
      return 'No stealth QE patterns detected. SOMA operations appear normal.';
    }
    
    const highAnomalies = anomalies.filter(a => a.anomalyScore > 0.8).length;
    
    let analysis = `Stealth QE probability: ${(probability * 100).toFixed(1)}%. `;
    analysis += `Detected ${anomalies.length} CUSIP anomalies (${highAnomalies} high-confidence). `;
    
    if (detection.timeToAnnouncement > 0) {
      analysis += `Estimated announcement in ${detection.timeToAnnouncement} hours. `;
    }
    
    analysis += `Operation type: ${detection.operationType}.`;
    
    return analysis;
  }

  private calculateProbabilityChange(hours: number): number {
    if (this.detectionHistory.length < 2) return 0;
    
    const current = this.detectionHistory[this.detectionHistory.length - 1].probability;
    const previous = this.detectionHistory[this.detectionHistory.length - 2].probability;
    
    return current - previous;
  }

  private calculateProbabilityChangePercent(hours: number): number {
    const change = this.calculateProbabilityChange(hours);
    const previous = this.detectionHistory[this.detectionHistory.length - 2]?.probability || 0.5;
    
    if (previous === 0) return 0;
    return (change / previous) * 100;
  }

  validateData(data: Map<string, any>): boolean {
    return data.has('SOMA_HOLDINGS');
  }
}