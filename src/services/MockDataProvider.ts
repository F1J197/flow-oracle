import { IndicatorState, IndicatorMetadata, IndicatorValue, DataPoint } from '@/types/indicators';

export class MockDataProvider {
  private static instance: MockDataProvider;
  
  static getInstance(): MockDataProvider {
    if (!MockDataProvider.instance) {
      MockDataProvider.instance = new MockDataProvider();
    }
    return MockDataProvider.instance;
  }

  /**
   * Generate mock indicator states for dashboard testing
   */
  generateMockIndicatorStates(): Map<string, IndicatorState> {
    const states = new Map<string, IndicatorState>();
    
    // Net Liquidity
    states.set('NET_LIQUIDITY', this.createMockState({
      id: 'net-liquidity',
      symbol: 'NET_LIQUIDITY',
      name: 'Net Liquidity',
      description: 'Federal Reserve net liquidity injection',
      source: 'FRED',
      category: 'Liquidity',
      pillar: 1,
      priority: 1,
      updateFrequency: '1d',
      unit: 'USD',
      precision: 2
    }, {
      current: 5.626e12, // $5.626T
      change: 234e9, // +$234B
      changePercent: 4.34,
      timestamp: new Date(),
      confidence: 0.95
    }));

    // Credit Stress
    states.set('CREDIT_STRESS', this.createMockState({
      id: 'credit-stress',
      symbol: 'CREDIT_STRESS',
      name: 'Credit Stress Index',
      description: 'Market credit stress indicator',
      source: 'MARKET',
      category: 'Credit',
      pillar: 2,
      priority: 2,
      updateFrequency: '1h',
      unit: 'percentage',
      precision: 2
    }, {
      current: 23.45,
      change: -2.1,
      changePercent: -8.21,
      timestamp: new Date(),
      confidence: 0.88
    }));

    // Market Momentum
    states.set('MOMENTUM_SCORE', this.createMockState({
      id: 'momentum-score',
      symbol: 'MOMENTUM_SCORE',
      name: 'Market Momentum Score',
      description: 'Composite momentum indicator',
      source: 'ENGINE',
      category: 'Momentum',
      pillar: 1,
      priority: 3,
      updateFrequency: '5m',
      unit: 'index',
      precision: 2
    }, {
      current: 67.8,
      change: 5.2,
      changePercent: 8.31,
      timestamp: new Date(),
      confidence: 0.92
    }));

    // Z-Score Analysis
    states.set('ZSCORE_COMPOSITE', this.createMockState({
      id: 'zscore-composite',
      symbol: 'ZSCORE_COMPOSITE',
      name: 'Z-Score Composite',
      description: 'Statistical deviation analysis',
      source: 'ENGINE',
      category: 'Statistics',
      pillar: 3,
      priority: 4,
      updateFrequency: '15m',
      unit: 'standard_deviation',
      precision: 3
    }, {
      current: 1.847,
      change: 0.123,
      changePercent: 7.14,
      timestamp: new Date(),
      confidence: 0.91
    }));

    // Primary Dealer Positions
    states.set('DEALER_POSITIONS', this.createMockState({
      id: 'dealer-positions',
      symbol: 'DEALER_POSITIONS',
      name: 'Primary Dealer Positions',
      description: 'Primary dealer treasury positions',
      source: 'FRED',
      category: 'Positions',
      pillar: 2,
      priority: 5,
      updateFrequency: '1d',
      unit: 'USD',
      precision: 1
    }, {
      current: -87.3e9, // -$87.3B
      change: -12.1e9,
      changePercent: -16.1,
      timestamp: new Date(),
      confidence: 0.94
    }));

    // Data Integrity
    states.set('DATA_INTEGRITY', this.createMockState({
      id: 'data-integrity',
      symbol: 'DATA_INTEGRITY',
      name: 'Data Integrity',
      description: 'Foundation Data Integrity Engine - Monitors data source health and system integrity',
      source: 'ENGINE',
      category: 'foundation',
      pillar: 0,
      priority: 0,
      updateFrequency: '15m',
      unit: 'Score',
      precision: 1
    }, {
      current: 99.87,
      change: 0.03,
      changePercent: 0.03,
      timestamp: new Date(),
      confidence: 1.0
    }));

    // CUSIP Stealth QE
    states.set('STEALTH_QE', this.createMockState({
      id: 'stealth-qe',
      symbol: 'STEALTH_QE',
      name: 'Stealth QE Detection',
      description: 'CUSIP-level stealth operations',
      source: 'ENGINE',
      category: 'Detection',
      pillar: 3,
      priority: 7,
      updateFrequency: '1h',
      unit: 'USD',
      precision: 1
    }, {
      current: 23.4e9, // $23.4B
      change: 8.7e9,
      changePercent: 59.2,
      timestamp: new Date(),
      confidence: 0.82
    }));

    return states;
  }

  private createMockState(metadata: IndicatorMetadata, value: IndicatorValue): IndicatorState {
    return {
      metadata,
      value,
      status: 'active',
      lastUpdate: new Date(),
      isSubscribed: false,
      retryCount: 0,
      historicalData: this.generateMockHistoricalData()
    };
  }

  private generateMockHistoricalData(): DataPoint[] {
    const points: DataPoint[] = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      points.push({
        timestamp,
        value: Math.random() * 100 + 50, // Random values between 50-150
        volume: Math.random() * 1000000
      });
    }
    
    return points;
  }

  /**
   * Simulate real-time updates for testing
   */
  simulateRealTimeUpdate(indicatorId: string): IndicatorState | null {
    const states = this.generateMockIndicatorStates();
    const state = states.get(indicatorId);
    
    if (!state || !state.value) return null;

    // Add some random variation
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const newValue = state.value.current * (1 + variation);
    const change = newValue - state.value.current;
    
    return {
      ...state,
      value: {
        ...state.value,
        current: newValue,
        change,
        changePercent: (change / state.value.current) * 100,
        timestamp: new Date()
      },
      lastUpdate: new Date()
    };
  }
}