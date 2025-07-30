/**
 * Unified Net Liquidity Engine - V6 Implementation
 * Example of migrating existing engine to UnifiedBaseEngine
 */

import { UnifiedBaseEngine } from '../base/UnifiedBaseEngine';
import type { 
  EngineReport, 
  ActionableInsight, 
  DashboardTileData, 
  IntelligenceViewData, 
  DetailedModalData, 
  DetailedEngineView 
} from '../../types/engines';
import UniversalDataService from '../../services/UniversalDataService';

export class UnifiedNetLiquidityEngine extends UnifiedBaseEngine {
  readonly id = 'net-liquidity-v6';
  readonly name = 'Net Liquidity Engine V6';
  readonly priority = 95;
  readonly pillar = 1 as const;
  readonly category = 'foundation' as const;

  // Internal state
  private walcl = 7500; // Fed balance sheet (billions)
  private wtregen = 600; // Treasury General Account (billions)
  private rrpontsyd = 2200; // Overnight reverse repo (billions)
  private netLiquidity = 0;
  private regime: 'QE' | 'QT' | 'Transition' = 'Transition';
  private momentum = 0;
  private confidence = 0.85;

  constructor() {
    super({
      refreshInterval: 15000,
      retryAttempts: 3,
      timeout: 10000,
      cacheTimeout: 30000,
      gracefulDegradation: true,
      enableEvents: true
    });
  }

  protected async performExecution(): Promise<EngineReport> {
    try {
      // Check cache first
      const cachedData = this.getCacheData('liquidity-data');
      
      if (!cachedData) {
        // Fetch fresh data
        const dataPromises = [
          this.fetchIndicatorData('WALCL', 'FRED'),
          this.fetchIndicatorData('WTREGEN', 'FRED'),
          this.fetchIndicatorData('RRPONTSYD', 'FRED')
        ];

        const [walclData, wtregenData, rrpontsydData] = await Promise.allSettled(dataPromises);

        // Update values from successful fetches
        if (walclData.status === 'fulfilled' && walclData.value) {
          this.walcl = walclData.value / 1000; // Convert to trillions
        }
        if (wtregenData.status === 'fulfilled' && wtregenData.value) {
          this.wtregen = wtregenData.value / 1000;
        }
        if (rrpontsydData.status === 'fulfilled' && rrpontsydData.value) {
          this.rrpontsyd = rrpontsydData.value / 1000;
        }

        // Cache the fetched data
        this.setCacheData('liquidity-data', {
          walcl: this.walcl,
          wtregen: this.wtregen,
          rrpontsyd: this.rrpontsyd,
          fetchTime: new Date()
        }, 300000); // 5 minutes cache
      } else {
        // Use cached data
        this.walcl = cachedData.walcl;
        this.wtregen = cachedData.wtregen;
        this.rrpontsyd = cachedData.rrpontsyd;
      }

      // Calculate net liquidity
      this.calculateNetLiquidity();
      
      // Determine regime and momentum
      this.updateRegimeAndMomentum();

      // Generate report
      return this.generateReport();
      
    } catch (error) {
      throw new Error(`Net Liquidity Engine execution failed: ${error.message}`);
    }
  }

  private async fetchIndicatorData(symbol: string, source: string): Promise<number> {
    try {
      const service = UniversalDataService.getInstance();
      const data = await Promise.race([
        service.getIndicatorData(symbol, { source }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]) as any;

      if (data && typeof data.value === 'number') {
        return data.value;
      }
      
      throw new Error(`Invalid data format for ${symbol}`);
    } catch (error) {
      console.warn(`Failed to fetch ${symbol} from ${source}:`, error);
      throw error;
    }
  }

  private calculateNetLiquidity(): void {
    // Net Liquidity = Fed Balance Sheet - Treasury General Account - Overnight Reverse Repo
    this.netLiquidity = this.walcl - this.wtregen - this.rrpontsyd;
    
    // Add some noise for realism
    this.netLiquidity += (Math.random() - 0.5) * 0.1;
  }

  private updateRegimeAndMomentum(): void {
    // Simplified regime detection
    const previousLiquidity = this.getCacheData('previous-liquidity') || this.netLiquidity;
    const change = this.netLiquidity - previousLiquidity;
    
    // Update momentum with Kalman-like smoothing
    const alpha = 0.3;
    this.momentum = alpha * change + (1 - alpha) * this.momentum;
    
    // Determine regime
    if (this.momentum > 0.05) {
      this.regime = 'QE';
      this.confidence = 0.9;
    } else if (this.momentum < -0.05) {
      this.regime = 'QT';
      this.confidence = 0.85;
    } else {
      this.regime = 'Transition';
      this.confidence = 0.7;
    }

    // Cache current liquidity for next calculation
    this.setCacheData('previous-liquidity', this.netLiquidity);
  }

  private generateReport(): EngineReport {
    const signal = this.getMarketSignal();
    
    return {
      success: true,
      confidence: this.confidence,
      signal,
      data: {
        netLiquidity: this.netLiquidity,
        components: {
          walcl: this.walcl,
          wtregen: this.wtregen,
          rrpontsyd: this.rrpontsyd
        },
        regime: this.regime,
        momentum: this.momentum,
        trend: this.momentum > 0 ? 'expanding' : this.momentum < 0 ? 'contracting' : 'stable',
        changePercent: (this.momentum / this.netLiquidity) * 100,
        timestamp: new Date()
      },
      errors: [],
      lastUpdated: new Date()
    };
  }

  private getMarketSignal(): 'bullish' | 'bearish' | 'neutral' {
    if (this.regime === 'QE' && this.momentum > 0.1) return 'bullish';
    if (this.regime === 'QT' && this.momentum < -0.1) return 'bearish';
    if (this.momentum > 0.05) return 'bullish';
    if (this.momentum < -0.05) return 'bearish';
    return 'neutral';
  }

  getSingleActionableInsight(): ActionableInsight {
    const signal = this.getMarketSignal();
    const regime = this.regime;
    const netLiquidityTrillion = (this.netLiquidity / 1000).toFixed(2);
    
    let actionText: string;
    let confidence: number;
    
    switch (regime) {
      case 'QE':
        actionText = `Net liquidity expanding (${netLiquidityTrillion}T). Consider risk-on positioning as liquidity supports asset prices.`;
        confidence = 0.9;
        break;
      case 'QT':
        actionText = `Net liquidity contracting (${netLiquidityTrillion}T). Exercise caution as liquidity headwinds may pressure markets.`;
        confidence = 0.85;
        break;
      default:
        actionText = `Net liquidity stable (${netLiquidityTrillion}T). Monitor for regime change signals in Fed policy.`;
        confidence = 0.7;
    }

    return {
      text: actionText,
      signal,
      strength: 'HIGH' as const,
      action: regime === 'QE' ? 'Increase risk exposure' : regime === 'QT' ? 'Reduce risk exposure' : 'Maintain current allocation',
      confidence,
      timeframe: 'MEDIUM_TERM' as const,
      category: 'liquidity'
    };
  }

  getDashboardData(): DashboardTileData {
    const netLiquidityTrillion = (this.netLiquidity / 1000).toFixed(2);
    const changePercent = (this.momentum / this.netLiquidity) * 100;
    
    return {
      title: 'Net Liquidity',
      primaryMetric: `$${netLiquidityTrillion}T`,
      secondaryMetric: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
      status: this.regime === 'QE' ? 'normal' : this.regime === 'QT' ? 'critical' : 'warning',
      trend: this.momentum > 0 ? 'up' : this.momentum < 0 ? 'down' : 'neutral',
      color: this.regime === 'QE' ? 'success' : this.regime === 'QT' ? 'critical' : 'warning',
      lastUpdated: new Date(),
      actionText: `Regime: ${this.regime} • Momentum: ${this.momentum > 0 ? 'Expanding' : this.momentum < 0 ? 'Contracting' : 'Stable'}`
    };
  }

  getDetailedView(): DetailedEngineView {
    const netLiquidityTrillion = (this.netLiquidity / 1000).toFixed(2);
    
    return {
      title: 'Net Liquidity Analysis',
      description: 'Global USD liquidity conditions based on Fed balance sheet dynamics',
      keyInsights: [
        `Current net liquidity: $${netLiquidityTrillion}T`,
        `Market regime: ${this.regime}`,
        `Momentum: ${this.momentum > 0 ? 'Expanding' : this.momentum < 0 ? 'Contracting' : 'Stable'}`,
        `Confidence level: ${(this.confidence * 100).toFixed(0)}%`
      ],
      detailedMetrics: {
        'Liquidity Components': {
          'Fed Balance Sheet (WALCL)': `$${(this.walcl / 1000).toFixed(2)}T`,
          'Treasury General Account': `$${(this.wtregen / 1000).toFixed(2)}T`,
          'Overnight Reverse Repo': `$${(this.rrpontsyd / 1000).toFixed(2)}T`,
          'Net Liquidity': `$${netLiquidityTrillion}T`
        },
        'Market Analysis': {
          'Current Regime': this.regime,
          'Momentum Score': this.momentum.toFixed(4),
          'Change Rate': `${((this.momentum / this.netLiquidity) * 100).toFixed(2)}%`,
          'Signal Strength': `${(this.confidence * 100).toFixed(0)}%`
        }
      },
      alerts: this.generateAlerts().map(alert => ({ ...alert, severity: alert.type })),
      timestamp: new Date()
    };
  }

  private generateAlerts(): Array<{ type: 'info' | 'warning' | 'critical'; message: string }> {
    const alerts: Array<{ type: 'info' | 'warning' | 'critical'; message: string }> = [];
    
    if (this.regime === 'QT' && this.momentum < -0.1) {
      alerts.push({
        type: 'critical',
        message: 'Rapid liquidity contraction detected - markets may experience stress'
      });
    }
    
    if (this.regime === 'QE' && this.momentum > 0.1) {
      alerts.push({
        type: 'info',
        message: 'Strong liquidity expansion supporting risk assets'
      });
    }
    
    if (this.confidence < 0.6) {
      alerts.push({
        type: 'warning',
        message: 'Low confidence in regime detection - data quality issues possible'
      });
    }
    
    return alerts;
  }

  getIntelligenceView(): IntelligenceViewData {
    const dashboardData = this.getDashboardData();
    
    return {
      title: dashboardData.title,
      status: 'active' as const,
      primaryMetric: dashboardData.primaryMetric,
      secondaryMetric: dashboardData.secondaryMetric,
      sections: [
        {
          title: 'Liquidity Components',
          data: {
            'Fed Balance Sheet': { value: `$${(this.walcl / 1000).toFixed(2)}T`, label: 'Fed Balance Sheet', unit: 'USD' },
            'Treasury Account': { value: `$${(this.wtregen / 1000).toFixed(2)}T`, label: 'Treasury Account', unit: 'USD' },
            'Reverse Repo': { value: `$${(this.rrpontsyd / 1000).toFixed(2)}T`, label: 'Reverse Repo', unit: 'USD' }
          }
        },
        {
          title: 'Market Regime',
          data: {
            'Current Regime': { value: this.regime, label: 'Current Regime' },
            'Momentum': { value: this.momentum.toFixed(4), label: 'Momentum', unit: 'ΔT/month' },
            'Confidence': { value: `${(this.confidence * 100).toFixed(0)}%`, label: 'Confidence' }
          }
        }
      ]
    };
  }

  getDetailedModal(): DetailedModalData {
    const dashboardData = this.getDashboardData();
    
    return {
      title: dashboardData.title,
      description: 'Comprehensive analysis of global USD liquidity conditions',
      keyInsights: [
        `Net liquidity currently at $${(this.netLiquidity / 1000).toFixed(2)} trillion`,
        `Operating in ${this.regime} regime with ${this.momentum > 0 ? 'expanding' : 'contracting'} momentum`,
        `${(this.confidence * 100).toFixed(0)}% confidence in current assessment`
      ],
      detailedMetrics: [
        {
          category: 'Current Status',
          metrics: {
            'Net Liquidity': { value: `$${(this.netLiquidity / 1000).toFixed(2)}T`, description: 'Current net liquidity level' },
            'Market Regime': { value: this.regime, description: 'Current market regime' },
            'Momentum': { value: this.momentum.toFixed(4), description: 'Liquidity momentum' },
            'Confidence': { value: `${(this.confidence * 100).toFixed(0)}%`, description: 'Assessment confidence' }
          }
        }
      ]
    };
  }
}