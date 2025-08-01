import { BaseEngine, EngineConfig, EngineOutput } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'market-microstructure',
  name: 'Market Microstructure & Manipulation Detection',
  pillar: 4,
  priority: 80,
  updateInterval: 60000, // 1 minute for real-time detection
  requiredIndicators: ['ORDERBOOK_BTC', 'VOLUME_PROFILE', 'TRADE_FLOW', 'SPREAD_DATA']
};

export interface MicrostructureMetrics {
  spreadSignalRatio: number; // SSR
  spoofingScore: number; // 0-100
  manipulationProbability: number; // 0-100
  orderBookHealth: 'HEALTHY' | 'STRESSED' | 'MANIPULATED' | 'ILLIQUID';
  volumeProfileAnomaly: number; // Z-score
  washTradingDetected: boolean;
  frontRunningRisk: number; // 0-100
  toxicFlow: number; // % of toxic order flow
}

export interface OrderBookAnalysis {
  bidAskSpread: number;
  depth: number; // Total liquidity
  imbalance: number; // Bid/ask imbalance
  layering: boolean; // Layering pattern detected
  icebergOrders: number; // Count of iceberg orders
  largeOrderActivity: number; // Institutional activity proxy
}

export interface ManipulationEvidence {
  type: 'SPOOFING' | 'LAYERING' | 'WASH_TRADING' | 'FRONT_RUNNING' | 'PUMP_DUMP';
  confidence: number;
  description: string;
  evidence: string[];
  timeDetected: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class MarketMicrostructureEngine extends BaseEngine {
  private readonly SSR_THRESHOLDS = {
    HEALTHY: 2.0,
    STRESSED: 1.0,
    MANIPULATED: 0.5
  };

  private readonly SPOOFING_INDICATORS = {
    RAPID_CANCEL_RATIO: 0.8, // 80% of orders cancelled quickly
    SIZE_THRESHOLD: 0.05, // 5% of average volume
    TIME_THRESHOLD: 5000 // 5 seconds
  };

  private manipulationHistory: ManipulationEvidence[] = [];
  private orderBookSnapshots: any[] = [];
  private volumeProfile: Map<number, number> = new Map();

  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    // Extract microstructure data
    const orderBookData = data.get('ORDERBOOK_BTC');
    const volumeProfileData = data.get('VOLUME_PROFILE');
    const tradeFlowData = data.get('TRADE_FLOW');
    const spreadData = data.get('SPREAD_DATA');

    // Analyze order book
    const orderBookAnalysis = this.analyzeOrderBook(orderBookData);
    
    // Calculate microstructure metrics
    const microstructureMetrics = this.calculateMicrostructureMetrics(
      orderBookAnalysis, 
      volumeProfileData, 
      tradeFlowData, 
      spreadData
    );

    // Detect manipulation patterns
    const manipulationEvidence = this.detectManipulation(microstructureMetrics, orderBookAnalysis);
    
    // Calculate health score
    const healthScore = this.calculateMarketHealthScore(microstructureMetrics);
    
    // Determine signal
    const signal = this.determineSignal(microstructureMetrics, manipulationEvidence);
    const confidence = this.calculateConfidence(microstructureMetrics, manipulationEvidence);

    // Store evidence
    if (manipulationEvidence.length > 0) {
      this.manipulationHistory.push(...manipulationEvidence);
      this.manipulationHistory = this.manipulationHistory.slice(-100); // Keep last 100
    }

    return {
      primaryMetric: {
        value: healthScore,
        change24h: this.calculateHealthChange(),
        changePercent: this.calculateHealthChangePercent()
      },
      signal,
      confidence,
      analysis: this.generateMicrostructureAnalysis(microstructureMetrics, manipulationEvidence),
      subMetrics: {
        microstructureMetrics,
        orderBookAnalysis,
        manipulationEvidence,
        healthScore,
        marketQuality: this.assessMarketQuality(microstructureMetrics),
        institutionalFlow: this.analyzeInstitutionalFlow(orderBookAnalysis),
        retailFlow: this.analyzeRetailFlow(tradeFlowData),
        liquidityProfile: this.analyzeLiquidityProfile(orderBookData),
        recentManipulation: this.manipulationHistory.slice(-5)
      }
    };
  }

  private analyzeOrderBook(orderBookData: any): OrderBookAnalysis {
    // Mock order book analysis - would use real order book data
    const mockBids = this.generateMockOrderBook('bids');
    const mockAsks = this.generateMockOrderBook('asks');

    const bestBid = Math.max(...mockBids.map(order => order.price));
    const bestAsk = Math.min(...mockAsks.map(order => order.price));
    const bidAskSpread = bestAsk - bestBid;

    const totalBidSize = mockBids.reduce((sum, order) => sum + order.size, 0);
    const totalAskSize = mockAsks.reduce((sum, order) => sum + order.size, 0);
    const depth = totalBidSize + totalAskSize;
    const imbalance = (totalBidSize - totalAskSize) / (totalBidSize + totalAskSize);

    // Detect manipulation patterns
    const layering = this.detectLayering(mockBids, mockAsks);
    const icebergOrders = this.detectIcebergOrders(mockBids, mockAsks);
    const largeOrderActivity = this.analyzeLargeOrders(mockBids, mockAsks);

    return {
      bidAskSpread,
      depth,
      imbalance,
      layering,
      icebergOrders,
      largeOrderActivity
    };
  }

  private generateMockOrderBook(side: 'bids' | 'asks'): Array<{ price: number; size: number; timestamp: number }> {
    const basePrice = 50000; // Mock BTC price
    const orders = [];
    
    for (let i = 0; i < 20; i++) {
      const priceOffset = side === 'bids' ? -i * 10 : i * 10;
      orders.push({
        price: basePrice + priceOffset,
        size: Math.random() * 5 + 0.1,
        timestamp: Date.now() - Math.random() * 60000
      });
    }
    
    return orders;
  }

  private calculateMicrostructureMetrics(
    orderBook: OrderBookAnalysis,
    volumeProfile: any,
    tradeFlow: any,
    spreadData: any
  ): MicrostructureMetrics {
    
    // Calculate Spread-Signal Ratio (SSR)
    const spreadSignalRatio = this.calculateSSR(orderBook.bidAskSpread, tradeFlow);
    
    // Calculate spoofing score
    const spoofingScore = this.calculateSpoofingScore(orderBook);
    
    // Calculate manipulation probability
    const manipulationProbability = this.calculateManipulationProbability(spoofingScore, orderBook);
    
    // Assess order book health
    const orderBookHealth = this.assessOrderBookHealth(spreadSignalRatio, orderBook.depth);
    
    // Volume profile anomaly detection
    const volumeProfileAnomaly = this.detectVolumeProfileAnomaly(volumeProfile);
    
    // Wash trading detection
    const washTradingDetected = this.detectWashTrading(tradeFlow);
    
    // Front-running risk assessment
    const frontRunningRisk = this.assessFrontRunningRisk(orderBook, tradeFlow);
    
    // Toxic flow percentage
    const toxicFlow = this.calculateToxicFlow(tradeFlow);

    return {
      spreadSignalRatio,
      spoofingScore,
      manipulationProbability,
      orderBookHealth,
      volumeProfileAnomaly,
      washTradingDetected,
      frontRunningRisk,
      toxicFlow
    };
  }

  private calculateSSR(spread: number, tradeFlow: any): number {
    // Spread-Signal Ratio calculation
    const avgTradeSize = tradeFlow?.avgTradeSize || 1;
    const spreadBasisPoints = (spread / 50000) * 10000; // Convert to basis points
    
    return spreadBasisPoints / avgTradeSize;
  }

  private calculateSpoofingScore(orderBook: OrderBookAnalysis): number {
    let score = 0;
    
    // Large orders that get cancelled quickly
    if (orderBook.layering) score += 30;
    
    // Unusual order book imbalance
    if (Math.abs(orderBook.imbalance) > 0.7) score += 25;
    
    // Rapid order placement and cancellation patterns
    score += Math.min(45, orderBook.largeOrderActivity * 15);
    
    return Math.min(100, score);
  }

  private calculateManipulationProbability(spoofingScore: number, orderBook: OrderBookAnalysis): number {
    let probability = spoofingScore * 0.4; // Base from spoofing
    
    // Order book anomalies
    if (orderBook.depth < 100) probability += 20; // Low liquidity
    if (Math.abs(orderBook.imbalance) > 0.8) probability += 15; // Extreme imbalance
    if (orderBook.icebergOrders > 3) probability += 10; // Many hidden orders
    
    return Math.min(100, probability);
  }

  private assessOrderBookHealth(ssr: number, depth: number): MicrostructureMetrics['orderBookHealth'] {
    if (ssr < this.SSR_THRESHOLDS.MANIPULATED || depth < 50) return 'MANIPULATED';
    if (ssr < this.SSR_THRESHOLDS.STRESSED || depth < 100) return 'STRESSED';
    if (depth < 200) return 'ILLIQUID';
    return 'HEALTHY';
  }

  private detectVolumeProfileAnomaly(volumeProfile: any): number {
    // Mock volume profile anomaly detection
    return (Math.random() - 0.5) * 4; // Z-score between -2 and 2
  }

  private detectWashTrading(tradeFlow: any): boolean {
    // Mock wash trading detection
    return Math.random() > 0.9; // 10% chance of detection
  }

  private assessFrontRunningRisk(orderBook: OrderBookAnalysis, tradeFlow: any): number {
    let risk = 0;
    
    // High institutional activity increases front-running risk
    risk += orderBook.largeOrderActivity * 20;
    
    // Tight spreads with high volume
    if (orderBook.bidAskSpread < 10 && orderBook.depth > 500) risk += 30;
    
    // Order book imbalance patterns
    risk += Math.abs(orderBook.imbalance) * 25;
    
    return Math.min(100, risk);
  }

  private calculateToxicFlow(tradeFlow: any): number {
    // Mock toxic flow calculation
    return Math.random() * 20; // 0-20% toxic flow
  }

  private detectLayering(bids: any[], asks: any[]): boolean {
    // Detect layering patterns in order book
    const recentOrders = [...bids, ...asks].filter(order => 
      Date.now() - order.timestamp < 30000 // Last 30 seconds
    );
    
    // Look for multiple large orders at similar price levels
    const priceGroups = new Map();
    recentOrders.forEach(order => {
      const priceLevel = Math.round(order.price / 10) * 10; // Group by $10 levels
      if (!priceGroups.has(priceLevel)) priceGroups.set(priceLevel, []);
      priceGroups.get(priceLevel).push(order);
    });
    
    // Layering detected if multiple large orders at same level
    for (const [, orders] of priceGroups) {
      if (orders.length > 3 && orders.every(o => o.size > 1)) {
        return true;
      }
    }
    
    return false;
  }

  private detectIcebergOrders(bids: any[], asks: any[]): number {
    // Count potential iceberg orders (partially hidden large orders)
    let icebergCount = 0;
    
    [...bids, ...asks].forEach(order => {
      // Iceberg indicators: round sizes, specific price levels
      if (order.size % 1 === 0 && order.size >= 5) {
        icebergCount++;
      }
    });
    
    return icebergCount;
  }

  private analyzeLargeOrders(bids: any[], asks: any[]): number {
    const largeOrders = [...bids, ...asks].filter(order => order.size > 2);
    return largeOrders.length;
  }

  private detectManipulation(
    metrics: MicrostructureMetrics, 
    orderBook: OrderBookAnalysis
  ): ManipulationEvidence[] {
    const evidence: ManipulationEvidence[] = [];
    
    // Spoofing detection
    if (metrics.spoofingScore > 70) {
      evidence.push({
        type: 'SPOOFING',
        confidence: metrics.spoofingScore,
        description: 'High probability spoofing pattern detected',
        evidence: [
          `Spoofing score: ${metrics.spoofingScore.toFixed(1)}`,
          `Order book imbalance: ${(orderBook.imbalance * 100).toFixed(1)}%`,
          orderBook.layering ? 'Layering pattern detected' : ''
        ].filter(Boolean),
        timeDetected: Date.now(),
        severity: metrics.spoofingScore > 90 ? 'CRITICAL' : 'HIGH'
      });
    }
    
    // Wash trading detection
    if (metrics.washTradingDetected) {
      evidence.push({
        type: 'WASH_TRADING',
        confidence: 85,
        description: 'Potential wash trading activity identified',
        evidence: [
          'Circular trading patterns detected',
          'Volume anomalies present',
          'Price manipulation indicators'
        ],
        timeDetected: Date.now(),
        severity: 'MEDIUM'
      });
    }
    
    // Front-running detection
    if (metrics.frontRunningRisk > 80) {
      evidence.push({
        type: 'FRONT_RUNNING',
        confidence: metrics.frontRunningRisk,
        description: 'High front-running risk detected',
        evidence: [
          `Front-running risk: ${metrics.frontRunningRisk.toFixed(1)}%`,
          'Large institutional order activity',
          'Suspicious order timing patterns'
        ],
        timeDetected: Date.now(),
        severity: 'HIGH'
      });
    }
    
    return evidence;
  }

  private calculateMarketHealthScore(metrics: MicrostructureMetrics): number {
    let score = 100;
    
    // Penalties for poor microstructure
    score -= metrics.spoofingScore * 0.3;
    score -= metrics.manipulationProbability * 0.2;
    score -= metrics.frontRunningRisk * 0.15;
    score -= metrics.toxicFlow * 2;
    
    // Bonuses for healthy microstructure
    if (metrics.orderBookHealth === 'HEALTHY') score += 10;
    if (!metrics.washTradingDetected) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private assessMarketQuality(metrics: MicrostructureMetrics): string {
    if (metrics.manipulationProbability > 70) return 'POOR';
    if (metrics.spoofingScore > 50 || metrics.washTradingDetected) return 'DEGRADED';
    if (metrics.orderBookHealth === 'HEALTHY' && metrics.toxicFlow < 10) return 'EXCELLENT';
    return 'FAIR';
  }

  private analyzeInstitutionalFlow(orderBook: OrderBookAnalysis): any {
    return {
      activity: orderBook.largeOrderActivity > 5 ? 'HIGH' : 'LOW',
      direction: orderBook.imbalance > 0.1 ? 'BUYING' : orderBook.imbalance < -0.1 ? 'SELLING' : 'NEUTRAL',
      aggression: orderBook.icebergOrders > 2 ? 'AGGRESSIVE' : 'PASSIVE'
    };
  }

  private analyzeRetailFlow(tradeFlow: any): any {
    // Mock retail flow analysis
    return {
      sentiment: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH',
      activity: 'MODERATE',
      size: 'SMALL_LOTS'
    };
  }

  private analyzeLiquidityProfile(orderBookData: any): any {
    // Mock liquidity profile
    return {
      surface: 'THIN',
      concentration: 'TOP_OF_BOOK',
      stability: 'VOLATILE'
    };
  }

  private calculateHealthChange(): number {
    // Mock health change calculation
    return (Math.random() - 0.5) * 10;
  }

  private calculateHealthChangePercent(): number {
    return (Math.random() - 0.5) * 5;
  }

  private determineSignal(
    metrics: MicrostructureMetrics, 
    evidence: ManipulationEvidence[]
  ): EngineOutput['signal'] {
    const criticalEvidence = evidence.filter(e => e.severity === 'CRITICAL');
    const highEvidence = evidence.filter(e => e.severity === 'HIGH');
    
    if (criticalEvidence.length > 0) return 'RISK_OFF';
    if (highEvidence.length > 0 || metrics.manipulationProbability > 80) return 'WARNING';
    if (metrics.orderBookHealth === 'HEALTHY' && metrics.toxicFlow < 10) return 'RISK_ON';
    return 'NEUTRAL';
  }

  private calculateConfidence(
    metrics: MicrostructureMetrics, 
    evidence: ManipulationEvidence[]
  ): number {
    let confidence = 70;
    
    // High confidence when clear manipulation detected
    if (evidence.length > 0) {
      const avgConfidence = evidence.reduce((sum, e) => sum + e.confidence, 0) / evidence.length;
      confidence = Math.max(confidence, avgConfidence);
    }
    
    // High confidence for healthy markets
    if (metrics.orderBookHealth === 'HEALTHY' && metrics.manipulationProbability < 20) {
      confidence += 20;
    }
    
    // Lower confidence for uncertain conditions
    if (metrics.manipulationProbability > 40 && metrics.manipulationProbability < 60) {
      confidence -= 15;
    }
    
    return Math.min(100, confidence);
  }

  private generateMicrostructureAnalysis(
    metrics: MicrostructureMetrics, 
    evidence: ManipulationEvidence[]
  ): string {
    let analysis = `Market microstructure: ${metrics.orderBookHealth.toLowerCase()} with ${metrics.toxicFlow.toFixed(1)}% toxic flow. `;
    
    if (evidence.length > 0) {
      const types = evidence.map(e => e.type.toLowerCase().replace('_', ' ')).join(', ');
      analysis += `Manipulation detected: ${types}. `;
    }
    
    analysis += `Spread-signal ratio: ${metrics.spreadSignalRatio.toFixed(2)}, `;
    analysis += `spoofing score: ${metrics.spoofingScore.toFixed(1)}%. `;
    
    if (metrics.washTradingDetected) {
      analysis += 'Wash trading patterns identified. ';
    }
    
    if (metrics.frontRunningRisk > 60) {
      analysis += `Elevated front-running risk (${metrics.frontRunningRisk.toFixed(1)}%). `;
    }
    
    return analysis;
  }

  validateData(data: Map<string, any>): boolean {
    // Can operate with minimal data
    return true;
  }
}