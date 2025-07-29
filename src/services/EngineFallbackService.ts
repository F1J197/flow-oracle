import { EngineReport, ActionableInsight, DashboardTileData, DetailedEngineView } from '@/types/engines';

/**
 * Fallback service for when engines fail to execute
 * Provides synthetic data to maintain UI stability
 */
export class EngineFallbackService {
  private static instance: EngineFallbackService;

  static getInstance(): EngineFallbackService {
    if (!EngineFallbackService.instance) {
      EngineFallbackService.instance = new EngineFallbackService();
    }
    return EngineFallbackService.instance;
  }

  /**
   * Generate fallback report for failed engines
   */
  generateFallbackReport(engineId: string, engineName: string): EngineReport {
    const baseValue = this.getBaseValueForEngine(engineId);
    const variation = (Math.random() - 0.5) * 0.05; // ±2.5% variation
    
    return {
      success: true,
      confidence: 0.1, // Very low confidence for synthetic data
      signal: 'neutral',
      lastUpdated: new Date(),
      data: {
        primaryMetric: baseValue * (1 + variation),
        secondaryMetric: baseValue * 0.8 * (1 + variation),
        trend: 'stable',
        regime: 'neutral',
        synthetic: true,
        fallbackReason: 'Primary engine unavailable'
      },
      errors: ['Primary engine unavailable - using fallback data']
    };
  }

  /**
   * Generate fallback dashboard tile data
   */
  generateFallbackDashboardData(engineId: string, engineName: string): DashboardTileData {
    const baseValue = this.getBaseValueForEngine(engineId);
    
    return {
      title: `${engineName} (Offline)`,
      primaryMetric: baseValue.toFixed(2),
      secondaryMetric: 'Offline',
      status: 'warning',
      trend: 'neutral',
      color: 'warning',
      loading: false
    };
  }

  /**
   * Generate fallback actionable insight
   */
  generateFallbackInsight(engineId: string, engineName: string): ActionableInsight {
    return {
      actionText: `${engineName} temporarily unavailable - monitor for restoration`,
      signalStrength: 10,
      marketAction: 'WAIT',
      confidence: 'LOW',
      timeframe: 'IMMEDIATE'
    };
  }

  /**
   * Generate fallback detailed view
   */
  generateFallbackDetailedView(engineId: string, engineName: string): DetailedEngineView {
    return {
      title: `${engineName} - Offline Mode`,
      primarySection: {
        title: 'System Status',
        metrics: {
          'Engine Status': 'Offline',
          'Last Update': 'Unavailable',
          'Data Quality': 'Fallback Mode'
        }
      },
      sections: [
        {
          title: 'Fallback Information',
          metrics: {
            'Mode': 'Synthetic Data',
            'Confidence': '10%',
            'Recommendation': 'Wait for engine restoration'
          }
        }
      ],
      alerts: [
        {
          severity: 'warning',
          message: 'Engine is temporarily offline. Using fallback data.'
        }
      ]
    };
  }

  /**
   * Get appropriate base value for different engine types
   */
  private getBaseValueForEngine(engineId: string): number {
    const baseValues: Record<string, number> = {
      'net-liquidity': 5000, // $5T
      'credit-stress': 250,  // 250 bps
      'momentum': 0,         // Neutral
      'zscore': 0,          // Neutral
      'primary-dealer': 100, // $100B
      'cusip-stealth': 50,  // 50% stealth score
      'market-regime': 0,   // Neutral regime
      'default': 100
    };

    // Find matching base value or use default
    const matchingKey = Object.keys(baseValues).find(key => 
      engineId.toLowerCase().includes(key)
    );

    return baseValues[matchingKey || 'default'];
  }

  /**
   * Check if data should be treated as stale
   */
  isDataStale(lastUpdate: Date, maxAgeMinutes: number = 15): boolean {
    const ageMs = Date.now() - lastUpdate.getTime();
    return ageMs > (maxAgeMinutes * 60 * 1000);
  }

  /**
   * Generate appropriate confidence score based on data age
   */
  calculateConfidenceFromAge(lastUpdate: Date): number {
    const ageMinutes = (Date.now() - lastUpdate.getTime()) / (1000 * 60);
    
    if (ageMinutes < 5) return 1.0;      // Fresh data
    if (ageMinutes < 15) return 0.8;     // Recent data
    if (ageMinutes < 60) return 0.5;     // Somewhat stale
    if (ageMinutes < 240) return 0.2;    // Stale
    return 0.1;                          // Very stale
  }
}

export default EngineFallbackService.getInstance();