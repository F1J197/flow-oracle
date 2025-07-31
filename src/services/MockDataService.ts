/**
 * Mock Data Service - V6 Implementation
 * Provides consistent mock data for development and testing
 * Single source of truth for all financial data during development
 */

export interface MockIndicatorData {
  id: string;
  value: number;
  timestamp: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  metadata?: {
    source: string;
    lastUpdate: string;
    quality: 'high' | 'medium' | 'low';
  };
}

export interface MockEngineResult {
  success: boolean;
  confidence: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  data: any;
  lastUpdated: Date;
  executionTime?: number;
}

export class MockDataService {
  private static instance: MockDataService;
  private cache: Map<string, MockIndicatorData> = new Map();
  private engineResults: Map<string, MockEngineResult> = new Map();
  private volatilityLevel: 'low' | 'medium' | 'high' = 'medium';

  private constructor() {
    this.initializeMockData();
  }

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  /**
   * Initialize baseline mock data for all standard indicators
   */
  private initializeMockData(): void {
    // Foundation Indicators
    this.cache.set('data-integrity-score', {
      id: 'data-integrity-score',
      value: 92.5,
      timestamp: Date.now(),
      trend: 'bullish',
      confidence: 0.95,
      metadata: {
        source: 'MOCK',
        lastUpdate: new Date().toISOString(),
        quality: 'high'
      }
    });

    this.cache.set('zscore-composite', {
      id: 'zscore-composite',
      value: 1.34,
      timestamp: Date.now(),
      trend: 'bullish',
      confidence: 0.88,
      metadata: {
        source: 'MOCK',
        lastUpdate: new Date().toISOString(),
        quality: 'high'
      }
    });

    // Pillar 1: Central Bank & Government Liquidity
    this.cache.set('fed-balance-sheet', {
      id: 'fed-balance-sheet',
      value: 7.234,
      timestamp: Date.now(),
      trend: 'neutral',
      confidence: 0.98,
      metadata: {
        source: 'FRED_MOCK',
        lastUpdate: new Date().toISOString(),
        quality: 'high'
      }
    });

    this.cache.set('treasury-general-account', {
      id: 'treasury-general-account',
      value: 0.423,
      timestamp: Date.now(),
      trend: 'bearish',
      confidence: 0.92,
      metadata: {
        source: 'FRED_MOCK',
        lastUpdate: new Date().toISOString(),
        quality: 'high'
      }
    });

    this.cache.set('reverse-repo-operations', {
      id: 'reverse-repo-operations',
      value: 2.134,
      timestamp: Date.now(),
      trend: 'bearish',
      confidence: 0.94,
      metadata: {
        source: 'FRED_MOCK',
        lastUpdate: new Date().toISOString(),
        quality: 'high'
      }
    });

    this.cache.set('net-liquidity', {
      id: 'net-liquidity',
      value: 4.677,
      timestamp: Date.now(),
      trend: 'bullish',
      confidence: 0.96,
      metadata: {
        source: 'ENGINE_MOCK',
        lastUpdate: new Date().toISOString(),
        quality: 'high'
      }
    });

    // Pillar 2: Market Indicators
    this.cache.set('sp500', {
      id: 'sp500',
      value: 4567.89,
      timestamp: Date.now(),
      trend: 'bullish',
      confidence: 0.87,
      metadata: {
        source: 'MARKET_MOCK',
        lastUpdate: new Date().toISOString(),
        quality: 'high'
      }
    });

    this.cache.set('vix', {
      id: 'vix',
      value: 16.23,
      timestamp: Date.now(),
      trend: 'bearish',
      confidence: 0.91,
      metadata: {
        source: 'MARKET_MOCK',
        lastUpdate: new Date().toISOString(),
        quality: 'high'
      }
    });

    // Pillar 3: Cryptocurrency
    this.cache.set('btc-price', {
      id: 'btc-price',
      value: 42350.00,
      timestamp: Date.now(),
      trend: 'bullish',
      confidence: 0.83,
      metadata: {
        source: 'COINBASE_MOCK',
        lastUpdate: new Date().toISOString(),
        quality: 'high'
      }
    });

    // Credit Indicators
    this.cache.set('high-yield-spread', {
      id: 'high-yield-spread',
      value: 425.67,
      timestamp: Date.now(),
      trend: 'bearish',
      confidence: 0.89,
      metadata: {
        source: 'FRED_MOCK',
        lastUpdate: new Date().toISOString(),
        quality: 'high'
      }
    });

    // Initialize Engine Results
    this.initializeEngineResults();
  }

  /**
   * Initialize mock results for all engines
   */
  private initializeEngineResults(): void {
    this.engineResults.set('DATA_INTEGRITY', {
      success: true,
      confidence: 0.95,
      signal: 'bullish',
      data: {
        score: 92.5,
        issues: 2,
        coverage: 98.7,
        lastValidation: new Date().toISOString()
      },
      lastUpdated: new Date(),
      executionTime: 234
    });

    this.engineResults.set('NET_LIQ', {
      success: true,
      confidence: 0.88,
      signal: 'bullish',
      data: {
        netLiquidity: 4.677,
        trend: 'increasing',
        weeklyChange: 0.234,
        regime: 'expansionary'
      },
      lastUpdated: new Date(),
      executionTime: 156
    });

    this.engineResults.set('CREDIT_STRESS', {
      success: true,
      confidence: 0.79,
      signal: 'neutral',
      data: {
        stressLevel: 0.34,
        highYieldSpread: 425.67,
        investmentGradeSpread: 123.45,
        trend: 'stable'
      },
      lastUpdated: new Date(),
      executionTime: 189
    });

    this.engineResults.set('ENHANCED_MOMENTUM', {
      success: true,
      confidence: 0.91,
      signal: 'bullish',
      data: {
        composite: 1.34,
        equityMomentum: 0.89,
        cryptoMomentum: 1.67,
        trend: 'strengthening'
      },
      lastUpdated: new Date(),
      executionTime: 278
    });

    this.engineResults.set('ZS_COMP', {
      success: true,
      confidence: 0.86,
      signal: 'bullish',
      data: {
        composite: 1.34,
        shortTerm: 1.12,
        mediumTerm: 1.45,
        longTerm: 1.23,
        regime: 'elevated'
      },
      lastUpdated: new Date(),
      executionTime: 145
    });

    this.engineResults.set('DEALER_POSITIONS', {
      success: true,
      confidence: 0.82,
      signal: 'neutral',
      data: {
        netPositions: 2.456,
        leverage: 14.2,
        trend: 'stable',
        riskLevel: 'moderate'
      },
      lastUpdated: new Date(),
      executionTime: 267
    });
  }

  /**
   * Get mock data for a specific indicator
   */
  async getIndicatorData(indicatorId: string): Promise<MockIndicatorData | null> {
    // Simulate network delay
    await this.simulateDelay();

    const data = this.cache.get(indicatorId);
    if (!data) return null;

    // Add some realistic variance
    const variance = this.generateVariance();
    const adjustedValue = data.value * (1 + variance);

    return {
      ...data,
      value: adjustedValue,
      timestamp: Date.now(),
      confidence: Math.max(0.5, Math.min(1.0, data.confidence + (Math.random() - 0.5) * 0.1))
    };
  }

  /**
   * Get mock result for an engine
   */
  async getEngineResult(engineId: string): Promise<MockEngineResult | null> {
    await this.simulateDelay();

    const result = this.engineResults.get(engineId);
    if (!result) return null;

    return {
      ...result,
      lastUpdated: new Date(),
      executionTime: 100 + Math.random() * 300
    };
  }

  /**
   * Get multiple indicators at once
   */
  async getBatchIndicators(indicatorIds: string[]): Promise<Map<string, MockIndicatorData>> {
    await this.simulateDelay();

    const results = new Map<string, MockIndicatorData>();

    for (const id of indicatorIds) {
      const data = await this.getIndicatorData(id);
      if (data) {
        results.set(id, data);
      }
    }

    return results;
  }

  /**
   * Get all available indicators
   */
  async getAllIndicators(): Promise<MockIndicatorData[]> {
    await this.simulateDelay();

    const results: MockIndicatorData[] = [];
    for (const [id, data] of this.cache.entries()) {
      const updated = await this.getIndicatorData(id);
      if (updated) {
        results.push(updated);
      }
    }

    return results;
  }

  /**
   * Set volatility level to simulate different market conditions
   */
  setVolatilityLevel(level: 'low' | 'medium' | 'high'): void {
    this.volatilityLevel = level;
  }

  /**
   * Refresh all mock data with new values
   */
  async refreshAllData(): Promise<void> {
    await this.simulateDelay();

    for (const [id, data] of this.cache.entries()) {
      const variance = this.generateVariance();
      this.cache.set(id, {
        ...data,
        value: data.value * (1 + variance),
        timestamp: Date.now(),
        confidence: Math.max(0.5, Math.min(1.0, data.confidence + (Math.random() - 0.5) * 0.05))
      });
    }

    // Refresh engine results
    for (const [id, result] of this.engineResults.entries()) {
      this.engineResults.set(id, {
        ...result,
        lastUpdated: new Date(),
        executionTime: 100 + Math.random() * 300
      });
    }
  }

  /**
   * Check if an indicator exists in mock data
   */
  hasIndicator(indicatorId: string): boolean {
    return this.cache.has(indicatorId);
  }

  /**
   * Get list of all available mock indicators
   */
  getAvailableIndicators(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get list of all available mock engines
   */
  getAvailableEngines(): string[] {
    return Array.from(this.engineResults.keys());
  }

  /**
   * Generate realistic variance based on volatility level
   */
  private generateVariance(): number {
    const base = Math.random() - 0.5; // -0.5 to 0.5

    switch (this.volatilityLevel) {
      case 'low':
        return base * 0.005; // ±0.25%
      case 'medium':
        return base * 0.015; // ±0.75%
      case 'high':
        return base * 0.035; // ±1.75%
      default:
        return base * 0.015;
    }
  }

  /**
   * Simulate network delay for realistic behavior
   */
  private async simulateDelay(): Promise<void> {
    const delay = 50 + Math.random() * 200; // 50-250ms
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Add or update mock data for an indicator
   */
  setMockData(indicatorId: string, data: Partial<MockIndicatorData>): void {
    const existing = this.cache.get(indicatorId);
    
    this.cache.set(indicatorId, {
      id: indicatorId,
      value: 0,
      timestamp: Date.now(),
      trend: 'neutral',
      confidence: 0.5,
      ...existing,
      ...data
    });
  }

  /**
   * Add or update mock engine result
   */
  setMockEngineResult(engineId: string, result: Partial<MockEngineResult>): void {
    const existing = this.engineResults.get(engineId);

    this.engineResults.set(engineId, {
      success: true,
      confidence: 0.5,
      signal: 'neutral',
      data: {},
      lastUpdated: new Date(),
      ...existing,
      ...result
    });
  }

  /**
   * Clear all mock data
   */
  clearCache(): void {
    this.cache.clear();
    this.engineResults.clear();
    this.initializeMockData();
  }
}

export default MockDataService;