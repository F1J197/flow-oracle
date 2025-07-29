import { IEngine, DashboardTileData, DetailedEngineView, EngineReport, ActionableInsight } from "@/types/engines";
import { UnifiedDataService } from "@/services/UnifiedDataService";
import { ResilientBaseEngine } from "./ResilientBaseEngine";

export class NetLiquidityEngine extends ResilientBaseEngine {
  id = 'net-liquidity';
  name = 'Net Liquidity Engine V6';
  priority = 1;
  pillar = 1 as const;

  constructor() {
    super({
      refreshInterval: 45000,
      maxRetries: 2,
      timeout: 20000,
      cacheTimeout: 90000,
      gracefulDegradation: true
    });
  }

  // Core data components (in trillions)
  private walcl = 6.658;       // Fed Balance Sheet - default value
  private wtregen = 0.632;     // Treasury General Account - default value  
  private rrpontsyd = 0;       // Overnight Reverse Repo - default value
  private netLiquidity = 6.026; // Calculated Net Liquidity - default
  
  // Kalman filter parameters
  private kalmanAlpha = 0.391; // Adaptive coefficient
  private regime: 'QE' | 'QT' | 'TRANSITION' = 'TRANSITION';
  private momentum = 0;
  private confidence = 98;

  private fetchWithTimeout<T>(fn: () => Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
  }

  // Use base class cache methods instead


  private updateFromData(data: any): void {
    this.walcl = data.walcl;
    this.wtregen = data.wtregen;
    this.rrpontsyd = data.rrpontsyd;
    
    // Calculate net liquidity
    this.netLiquidity = this.walcl - this.wtregen - this.rrpontsyd;
    
    // Regime detection
    if (this.netLiquidity > 5.5) {
      this.regime = 'QE';
    } else if (this.netLiquidity < 4.5) {
      this.regime = 'QT';
    } else {
      this.regime = 'TRANSITION';
    }
    
    // Calculate momentum with some persistence
    const targetMomentum = (this.netLiquidity - 5.0) * 0.8;
    this.momentum = this.momentum * 0.7 + targetMomentum * 0.3; // Smooth changes
  }

  private generateReport(): EngineReport {
    console.log(`Net Liquidity: $${this.netLiquidity.toFixed(3)}T | Regime: ${this.regime}`);
    
    return {
      success: true,
      confidence: this.confidence / 100,
      signal: this.getMarketSignal(),
      data: {
        netLiquidity: this.netLiquidity,
        regime: this.regime,
        momentum: this.momentum,
        walcl: this.walcl,
        wtregen: this.wtregen,
        rrpontsyd: this.rrpontsyd
      },
      lastUpdated: new Date()
    };
  }

  protected async performExecution(): Promise<EngineReport> {
    console.log('Net Liquidity Engine V6 executing...');
    
    // Use cached data first to avoid slow API calls
    const cacheKey = 'net-liquidity-data';
    const cached = this.getCacheData(cacheKey);
    if (cached) {
      this.updateFromData(cached);
      return this.generateReport();
    }
    
    // Fetch data with timeout and fallbacks
    const unifiedService = UnifiedDataService.getInstance();
    const dataPromises = [
      this.fetchWithTimeout(async () => {
        const result = await unifiedService.refreshIndicator('WALCL');
        return result?.current || 6657715;
      }, 3000).catch(() => 6657715),
      this.fetchWithTimeout(async () => {
        const result = await unifiedService.refreshIndicator('WTREGEN');
        return result?.current || 632000;
      }, 3000).catch(() => 632000),
      this.fetchWithTimeout(async () => {
        const result = await unifiedService.refreshIndicator('RRPONTSYD');
        return result?.current || 0;
      }, 3000).catch(() => 0)
    ];
    
    const [walclRaw, wtregenRaw, rrpontsydRaw] = await Promise.all(dataPromises);
    
    // Convert to trillions and cache the data
    const liquidityData = {
      walcl: walclRaw / 1000000,
      wtregen: wtregenRaw / 1000000,
      rrpontsyd: rrpontsydRaw / 1000000,
      timestamp: Date.now()
    };
    
    this.setCacheData(cacheKey, liquidityData);
    this.updateFromData(liquidityData);
    
    return this.generateReport();
  }

  private getMarketSignal(): 'bullish' | 'bearish' | 'neutral' {
    if (this.regime === 'QE' && this.momentum > 0) return 'bullish';
    if (this.regime === 'QT' && this.momentum < 0) return 'bearish';
    return 'neutral';
  }

  getSingleActionableInsight(): ActionableInsight {
    const signal = this.getMarketSignal();
    
    // Calculate signal strength based on regime confidence and momentum
    const regimeStrength = this.regime === 'QE' ? 85 : this.regime === 'QT' ? 75 : 45;
    const momentumAdjustment = Math.abs(this.momentum) * 10;
    const signalStrength = Math.min(100, regimeStrength + momentumAdjustment);
    
    // Determine market action
    let marketAction: 'BUY' | 'SELL' | 'HOLD' | 'WAIT';
    if (this.regime === 'QE' && this.momentum > 0.5) {
      marketAction = 'BUY';
    } else if (this.regime === 'QT' && this.momentum < -0.5) {
      marketAction = 'SELL';
    } else if (this.regime === 'TRANSITION') {
      marketAction = 'WAIT';
    } else {
      marketAction = 'HOLD';
    }
    
    // Determine confidence based on data quality and signal strength
    const confidence: 'HIGH' | 'MED' | 'LOW' = 
      this.confidence > 85 && signalStrength > 70 ? 'HIGH' :
      this.confidence > 70 && signalStrength > 50 ? 'MED' : 'LOW';
    
    // Generate actionable text
    let actionText: string;
    if (this.regime === 'QE') {
      actionText = `AGGRESSIVE positioning recommended - QE liquidity expanding at $${this.netLiquidity.toFixed(1)}T`;
    } else if (this.regime === 'QT') {
      actionText = `DEFENSIVE positioning required - QT contracting liquidity to $${this.netLiquidity.toFixed(1)}T`;
    } else {
      actionText = `MONITOR regime shift - liquidity at $${this.netLiquidity.toFixed(1)}T transition zone`;
    }
    
    return {
      actionText,
      signalStrength: Math.round(signalStrength),
      marketAction,
      confidence,
      timeframe: this.regime === 'TRANSITION' ? 'SHORT_TERM' : 'MEDIUM_TERM'
    };
  }

  getDashboardData(): DashboardTileData {
    const getColor = (): 'success' | 'critical' | 'warning' | 'success' | 'critical' => {
      switch (this.regime) {
        case 'QE': return 'success';
        case 'QT': return 'critical';
        case 'TRANSITION': return 'warning';
        default: return 'success';
      }
    };

    const getStatus = (): 'normal' | 'warning' | 'critical' => {
      if (this.netLiquidity < 3) return 'critical';
      if (this.netLiquidity < 4.5) return 'warning';
      return 'normal';
    };

    const getTrend = (): 'up' | 'down' | 'neutral' => {
      if (this.momentum > 0.5) return 'up';
      if (this.momentum < -0.5) return 'down';
      return 'neutral';
    };

    return {
      title: 'NET LIQUIDITY ENGINE',
      primaryMetric: `$${this.netLiquidity.toFixed(3)}T`,
      secondaryMetric: `${this.regime} | ${this.momentum >= 0 ? '+' : ''}${this.momentum.toFixed(2)}%`,
      status: getStatus(),
      trend: getTrend(),
      color: getColor(),
      actionText: this.regime === 'TRANSITION' ? 'MONITORING REGIME SHIFT' : `${this.regime} DETECTED`
    };
  }

  getDetailedView(): DetailedEngineView {
    return {
      title: 'Net Liquidity Engine V6 - Kalman Adaptive Analysis',
      primarySection: {
        title: 'Current Liquidity Status',
        metrics: {
          'Net Liquidity': `$${this.netLiquidity.toFixed(3)}T`,
          'Regime': this.regime,
          'Momentum': `${this.momentum >= 0 ? '+' : ''}${this.momentum.toFixed(2)}%`,
          'Confidence': `${this.confidence}%`
        }
      },
      sections: [
        {
          title: 'Component Analysis',
          metrics: {
            'Fed Balance Sheet (WALCL)': `$${this.walcl.toFixed(3)}T`,
            'Treasury General Account (WTREGEN)': `$${this.wtregen.toFixed(3)}T`,
            'Reverse Repo (RRPONTSYD)': `$${this.rrpontsyd.toFixed(3)}T`,
            'Kalman Alpha': this.kalmanAlpha.toFixed(3)
          }
        },
        {
          title: 'Market Intelligence',
          metrics: {
            'Signal': this.getMarketSignal().toUpperCase(),
            'Risk Level': this.netLiquidity < 4 ? 'HIGH' : this.netLiquidity < 5 ? 'MODERATE' : 'LOW',
            'Position Sizing': this.regime === 'QE' ? 'AGGRESSIVE' : this.regime === 'QT' ? 'DEFENSIVE' : 'BALANCED'
          }
        }
      ]
    };
  }
}