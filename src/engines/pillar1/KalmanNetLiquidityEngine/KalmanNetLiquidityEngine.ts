import { BaseEngine, EngineConfig, EngineOutput, Alert } from '@/engines/BaseEngine';
import { KalmanFilter } from '@/utils/KalmanFilter';
import type { 
  EngineReport, 
  ActionableInsight, 
  DashboardTileData, 
  IntelligenceViewData,
  DetailedEngineView,
  DetailedModalData 
} from '@/types/engines';

const config: EngineConfig = {
  id: 'kalman-net-liquidity',
  name: 'Kalman-Adaptive Net Liquidity Engine',
  pillar: 'liquidity',
  updateInterval: 60000, // 1 minute - critical metric
  requiredIndicators: ['fed-balance-sheet', 'treasury-general-account', 'reverse-repo-operations'],
  dependencies: ['data-integrity']
};

interface LiquidityRegime {
  regime: 'QE_ACTIVE' | 'QT_ACTIVE' | 'TRANSITION' | 'STEALTH_QE';
  confidence: number;
  thresholds: {
    qe: number;
    qt: number;
  };
}

export class KalmanNetLiquidityEngine extends BaseEngine {
  public readonly id = 'kalman-net-liquidity';
  public readonly name = 'Kalman-Adaptive Net Liquidity Engine';
  public readonly category = 'core' as const;
  public readonly pillar = 1 as const;
  public readonly priority = 1;

  private kalmanFilter: KalmanFilter;
  private alpha: number = 1.0; // TGA coefficient
  private liquidityHistory: number[] = [];
  private regimeHistory: string[] = [];
  private readonly THRESHOLDS = {
    QE: 6500000000000,      // $6.5T
    QT: 4000000000000,      // $4.0T
    STEALTH_QE: 100000000000 // $100B increase/week
  };
  private lastTGA: number = 0;
  private engineOutputs: Map<string, any> = new Map();
  private lastReport: EngineReport | null = null;
  
  constructor() {
    super({
      refreshInterval: 60000,
      timeout: 5000, // Reduced timeout to prevent hanging
      retryAttempts: 2,
      cacheTimeout: 60000
    });
    
    // Initialize Kalman filter with empirically derived parameters
    this.kalmanFilter = new KalmanFilter({
      R: 0.01,    // Measurement noise
      Q: 0.0001,  // Process noise
      A: 1,       // State transition
      B: 0,       // Control input
      C: 1,       // Measurement
      x: 1.0,     // Initial state (alpha)
      P: 1,       // Initial covariance
      processNoise: 0.0001,
      measurementNoise: 0.01,
      initialEstimate: 1.0,
      initialCovariance: 1
    });
  }
  
  calculate(data: Map<string, any>): EngineOutput {
    // Extract required data with validation
    const walcl = this.extractLatestValue(data.get('WALCL'));
    const wtregen = this.extractLatestValue(data.get('WTREGEN'));
    const rrp = this.extractLatestValue(data.get('RRPONTSYD'));
    
    if (walcl === null || wtregen === null || rrp === null) {
      throw new Error('Missing required liquidity data');
    }
    
    // Update Kalman filter to get optimal alpha
    this.updateKalmanFilter(walcl, wtregen, rrp);
    
    // Calculate standard and enhanced net liquidity
    const standardNetLiquidity = this.calculateStandardNetLiquidity(walcl, wtregen, rrp);
    const enhancedNetLiquidity = this.calculateEnhancedNetLiquidity(walcl, wtregen, rrp);
    
    // Detect regime and special patterns
    const regime = this.detectRegime(enhancedNetLiquidity);
    const december2022Pattern = this.detectDecember2022Pattern(data, enhancedNetLiquidity);
    const stealthQE = this.detectStealthQE(enhancedNetLiquidity);
    
    // Calculate week-over-week and month-over-month changes
    const weeklyChange = this.calculateWeeklyChange(enhancedNetLiquidity);
    const monthlyChange = this.calculateMonthlyChange(enhancedNetLiquidity);
    
    // Update history
    this.updateHistory(enhancedNetLiquidity, regime.regime);
    
    // Generate alerts
    const alerts = this.generateAlerts(regime, weeklyChange, stealthQE);
    
    return {
      primaryMetric: {
        value: enhancedNetLiquidity / 1000000000000, // Convert to trillions
        change24h: this.getHistoricalChange(1),
        changePercent: this.getHistoricalChangePercent(1)
      },
      signal: this.determineSignal(regime, weeklyChange, stealthQE),
      confidence: regime.confidence,
      analysis: this.generateAnalysis(
        enhancedNetLiquidity, 
        regime, 
        weeklyChange, 
        monthlyChange, 
        december2022Pattern,
        stealthQE
      ),
      subMetrics: {
        standardNetLiquidity: standardNetLiquidity / 1000000000000,
        enhancedNetLiquidity: enhancedNetLiquidity / 1000000000000,
        kalmanAlpha: this.alpha,
        fedBalance: walcl / 1000000, // Convert to millions
        treasuryAccount: wtregen / 1000000,
        reverseRepo: rrp / 1000000000, // Already in billions
        weeklyChange: weeklyChange / 1000000000, // Billions
        monthlyChange: monthlyChange / 1000000000,
        regime: regime.regime,
        december2022Pattern,
        stealthQE,
        liquidityVelocity: this.calculateVelocity(),
        expansionRate: this.calculateExpansionRate()
      },
      alerts: alerts.length > 0 ? alerts : undefined
    };
  }
  
  private updateKalmanFilter(walcl: number, wtregen: number, rrp: number): void {
    // Calculate the observed impact of TGA on liquidity
    const observedImpact = this.calculateObservedImpact(walcl, wtregen, rrp);
    
    // Update Kalman filter with new measurement
    this.kalmanFilter.update(observedImpact);
    
    // Get filtered alpha value
    this.alpha = Math.max(0.5, Math.min(1.5, this.kalmanFilter.getState()));
  }
  
  private calculateObservedImpact(walcl: number, wtregen: number, rrp: number): number {
    // This is the core innovation - dynamically measure TGA's actual impact
    if (this.liquidityHistory.length < 2) return 1.0;
    
    const prevLiquidity = this.liquidityHistory[this.liquidityHistory.length - 1];
    const deltaLiquidity = (walcl - rrp) - prevLiquidity;
    const deltaTGA = wtregen - this.lastTGA;
    
    if (Math.abs(deltaTGA) < 1000000) return this.alpha; // No significant TGA change
    
    // Observed impact = actual liquidity change / TGA change
    return Math.abs(deltaLiquidity / deltaTGA);
  }
  
  private calculateStandardNetLiquidity(walcl: number, wtregen: number, rrp: number): number {
    // Standard formula: WALCL - WTREGEN - RRP
    // Convert WALCL and WTREGEN from millions to match RRP in actual dollars
    return (walcl * 1000000) - (wtregen * 1000000) - (rrp * 1000000000);
  }
  
  private calculateEnhancedNetLiquidity(walcl: number, wtregen: number, rrp: number): number {
    // Enhanced formula with Kalman-adjusted alpha
    // Net Liquidity = WALCL - (α * WTREGEN) - RRP
    return (walcl * 1000000) - (this.alpha * wtregen * 1000000) - (rrp * 1000000000);
  }
  
  private detectRegime(netLiquidity: number): LiquidityRegime {
    let regime: LiquidityRegime['regime'];
    let confidence = 100;
    
    if (netLiquidity > this.THRESHOLDS.QE) {
      regime = 'QE_ACTIVE';
      // Reduce confidence if close to threshold
      const distance = netLiquidity - this.THRESHOLDS.QE;
      if (distance < 500000000000) { // Within $500B of threshold
        confidence = 70 + (distance / 500000000000) * 30;
      }
    } else if (netLiquidity < this.THRESHOLDS.QT) {
      regime = 'QT_ACTIVE';
      const distance = this.THRESHOLDS.QT - netLiquidity;
      if (distance < 500000000000) {
        confidence = 70 + (distance / 500000000000) * 30;
      }
    } else {
      regime = 'TRANSITION';
      // Lower confidence in transition zone
      confidence = 60;
    }
    
    // Check for regime consistency
    if (this.regimeHistory.length >= 3) {
      const recentRegimes = this.regimeHistory.slice(-3);
      if (!recentRegimes.every(r => r === regime)) {
        confidence *= 0.8; // Reduce confidence during regime changes
      }
    }
    
    return {
      regime,
      confidence: Math.round(confidence),
      thresholds: {
        qe: this.THRESHOLDS.QE,
        qt: this.THRESHOLDS.QT
      }
    };
  }
  
  private detectDecember2022Pattern(data: Map<string, any>, netLiquidity: number): boolean {
    // December 2022 pattern detection:
    // 1. RRP down >20% from cycle peak
    // 2. RRP weekly flow negative (draining)
    // 3. Credit spreads < 450bps
    
    const rrpHistory = data.get('RRPONTSYD');
    if (!Array.isArray(rrpHistory) || rrpHistory.length < 30) return false;
    
    // Find RRP peak
    const rrpValues = rrpHistory.map(d => d.value || d);
    const rrpPeak = Math.max(...rrpValues.slice(-180)); // Last 6 months
    const currentRRP = rrpValues[rrpValues.length - 1];
    
    // Check if down >20% from peak
    const rrpDecline = ((rrpPeak - currentRRP) / rrpPeak) * 100;
    if (rrpDecline < 20) return false;
    
    // Check weekly flow
    const weekAgoRRP = rrpValues[rrpValues.length - 7] || currentRRP;
    const weeklyFlow = currentRRP - weekAgoRRP;
    if (weeklyFlow >= 0) return false;
    
    // Check credit spreads (would need credit stress engine output)
    const creditStress = this.engineOutputs.get('credit-stress');
    if (creditStress && creditStress.subMetrics?.highYieldOAS > 450) return false;
    
    return true;
  }
  
  private detectStealthQE(netLiquidity: number): boolean {
    if (this.liquidityHistory.length < 7) return false;
    
    const weekAgoLiquidity = this.liquidityHistory[this.liquidityHistory.length - 7];
    const weeklyIncrease = netLiquidity - weekAgoLiquidity;
    
    // Stealth QE = >$100B increase/week without announcement
    return weeklyIncrease > this.THRESHOLDS.STEALTH_QE;
  }
  
  private calculateWeeklyChange(currentLiquidity: number): number {
    if (this.liquidityHistory.length < 7) return 0;
    return currentLiquidity - this.liquidityHistory[this.liquidityHistory.length - 7];
  }
  
  private calculateMonthlyChange(currentLiquidity: number): number {
    if (this.liquidityHistory.length < 30) return 0;
    return currentLiquidity - this.liquidityHistory[this.liquidityHistory.length - 30];
  }
  
  private calculateVelocity(): number {
    if (this.liquidityHistory.length < 2) return 0;
    const recent = this.liquidityHistory.slice(-5);
    const changes = [];
    for (let i = 1; i < recent.length; i++) {
      changes.push((recent[i] - recent[i-1]) / recent[i-1] * 100);
    }
    return changes.reduce((a, b) => a + b, 0) / changes.length;
  }
  
  private calculateExpansionRate(): number {
    if (this.liquidityHistory.length < 30) return 0;
    const monthAgo = this.liquidityHistory[this.liquidityHistory.length - 30];
    const current = this.liquidityHistory[this.liquidityHistory.length - 1];
    return ((current - monthAgo) / monthAgo) * 100 * 12; // Annualized
  }
  
  private determineSignal(
    regime: LiquidityRegime, 
    weeklyChange: number, 
    stealthQE: boolean
  ): EngineOutput['signal'] {
    if (regime.regime === 'QE_ACTIVE' || stealthQE) return 'RISK_ON';
    if (regime.regime === 'QT_ACTIVE') return 'RISK_OFF';
    if (Math.abs(weeklyChange) > 200000000000) return 'WARNING'; // >$200B weekly change
    return 'NEUTRAL';
  }
  
  private generateAlerts(
    regime: LiquidityRegime, 
    weeklyChange: number,
    stealthQE: boolean
  ): Alert[] {
    const alerts: Alert[] = [];
    
    if (regime.regime === 'QT_ACTIVE' && regime.confidence > 80) {
      alerts.push({
        level: 'critical',
        message: 'Liquidity contraction confirmed. QT regime active.',
        timestamp: Date.now()
      });
    }
    
    if (Math.abs(weeklyChange) > 300000000000) { // >$300B
      alerts.push({
        level: 'warning',
        message: `Extreme weekly liquidity ${weeklyChange > 0 ? 'injection' : 'drain'}: $${(Math.abs(weeklyChange) / 1000000000).toFixed(0)}B`,
        timestamp: Date.now()
      });
    }
    
    if (stealthQE) {
      alerts.push({
        level: 'info',
        message: 'Stealth QE detected: Unannounced liquidity injection in progress',
        timestamp: Date.now()
      });
    }
    
    return alerts;
  }
  
  private generateAnalysis(
    liquidity: number,
    regime: LiquidityRegime,
    weeklyChange: number,
    monthlyChange: number,
    december2022: boolean,
    stealthQE: boolean
  ): string {
    const liquidityT = liquidity / 1000000000000;
    const weeklyB = weeklyChange / 1000000000;
    const monthlyB = monthlyChange / 1000000000;
    
    const regimeStories = {
      'QE_ACTIVE': `FULL RISK-ON: Net liquidity at $${liquidityT.toFixed(2)}T confirms QE regime. Fed expanding balance sheet aggressively.`,
      'QT_ACTIVE': `RISK-OFF WARNING: Net liquidity at $${liquidityT.toFixed(2)}T confirms QT regime. Systematic liquidity withdrawal in progress.`,
      'TRANSITION': `NEUTRAL STANCE: Net liquidity at $${liquidityT.toFixed(2)}T in transition zone. Market awaiting Fed direction.`,
      'STEALTH_QE': `HIDDEN STIMULUS: Stealth QE detected with $${weeklyB.toFixed(0)}B weekly injection. Bullish divergence building.`
    };
    
    let analysis = regimeStories[stealthQE ? 'STEALTH_QE' : regime.regime];
    
    if (december2022) {
      analysis += ' DECEMBER 2022 PATTERN ACTIVE: RRP drain accelerating, similar to pre-rally setup.';
    }
    
    if (Math.abs(weeklyB) > 100) {
      analysis += ` Weekly change: ${weeklyB > 0 ? '+' : ''}$${weeklyB.toFixed(0)}B.`;
    }
    
    if (Math.abs(monthlyB) > 300) {
      analysis += ` Monthly trend: ${monthlyB > 0 ? 'expanding' : 'contracting'} at $${Math.abs(monthlyB).toFixed(0)}B/month.`;
    }
    
    return analysis;
  }
  
  private updateHistory(liquidity: number, regime: string): void {
    this.liquidityHistory.push(liquidity);
    if (this.liquidityHistory.length > 365) { // Keep 1 year of daily data
      this.liquidityHistory.shift();
    }
    
    this.regimeHistory.push(regime);
    if (this.regimeHistory.length > 30) {
      this.regimeHistory.shift();
    }
  }
  
  private extractLatestValue(data: any): number | null {
    if (!data) return null;
    if (typeof data === 'number') return data;
    if (Array.isArray(data) && data.length > 0) {
      const latest = data[data.length - 1];
      return latest.value || latest;
    }
    return null;
  }
  
  private getHistoricalChange(days: number): number {
    if (this.liquidityHistory.length < days + 1) return 0;
    const current = this.liquidityHistory[this.liquidityHistory.length - 1];
    const previous = this.liquidityHistory[this.liquidityHistory.length - 1 - days];
    return (current - previous) / 1000000000000; // Convert to trillions
  }
  
  private getHistoricalChangePercent(days: number): number {
    if (this.liquidityHistory.length < days + 1) return 0;
    const current = this.liquidityHistory[this.liquidityHistory.length - 1];
    const previous = this.liquidityHistory[this.liquidityHistory.length - 1 - days];
    return ((current - previous) / previous) * 100;
  }
  
  validateData(data: Map<string, any>): boolean {
    const required = ['WALCL', 'WTREGEN', 'RRPONTSYD'];
    return required.every(indicator => {
      const value = data.get(indicator);
      return value !== null && value !== undefined;
    });
  }

  // BaseEngine implementation - Fetch real data from UnifiedDataService
  protected async performExecution(): Promise<EngineReport> {
    try {
      // Import enhanced UnifiedDataService to fetch real data
      const { UnifiedDataService } = await import('@/services/UnifiedDataServiceV3');
      
      // Fetch real data for required indicators using correct IDs from registry
      const [walclData, wtregen, rrpData] = await Promise.all([
        UnifiedDataService.refreshIndicator('fed-balance-sheet'),    // WALCL
        UnifiedDataService.refreshIndicator('treasury-general-account'), // WTREGEN 
        UnifiedDataService.refreshIndicator('reverse-repo-operations')   // RRPONTSYD
      ]);
      
      // Validate we have the required data
      if (!walclData || !wtregen || !rrpData) {
        throw new Error('Missing required liquidity data: fed-balance-sheet, treasury-general-account, or reverse-repo-operations not available');
      }
      
      // Convert the data to the format expected by the engine
      const dataMap = new Map([
        ['WALCL', walclData.current], // Fed Balance Sheet (millions)
        ['WTREGEN', wtregen.current], // Treasury General Account (millions)
        ['RRPONTSYD', rrpData.current] // Reverse Repo (billions)
      ]);
      
      const output = this.calculate(dataMap);
      
      const report: EngineReport = {
        success: true,
        data: output,
        confidence: output.confidence,
        signal: output.signal === 'RISK_ON' ? 'bullish' : output.signal === 'RISK_OFF' ? 'bearish' : 'neutral',
        lastUpdated: new Date()
      };
      
      this.lastReport = report;
      return report;
    } catch (error) {
      console.error('KalmanNetLiquidityEngine execution failed:', error);
      const errorReport: EngineReport = {
        success: false,
        data: null,
        confidence: 0,
        signal: 'neutral',
        lastUpdated: new Date(),
        errors: [error.message]
      };
      
      this.lastReport = errorReport;
      return errorReport;
    }
  }

  // Required BaseEngine abstract methods
  public getSingleActionableInsight(): ActionableInsight {
    return {
      actionText: 'Monitor liquidity regime changes',
      signalStrength: 75,
      marketAction: 'HOLD',
      confidence: 'MED',
      timeframe: 'MEDIUM_TERM'
    };
  }

  public getDashboardData(): DashboardTileData {
    // Return real data if available from last execution
    if (this.lastReport?.success && this.lastReport.data) {
      return {
        title: 'Kalman Net Liquidity',
        primaryMetric: `$${this.lastReport.data.primaryMetric.value.toFixed(2)}T`,
        secondaryMetric: `${this.lastReport.data.subMetrics?.regime || 'TRANSITION'} • ${Math.round(this.lastReport.confidence)}%`,
        status: this.lastReport.signal === 'bullish' ? 'normal' : 
               this.lastReport.signal === 'bearish' ? 'critical' : 'warning',
        trend: this.lastReport.data.primaryMetric.changePercent > 0 ? 'up' : 
              this.lastReport.data.primaryMetric.changePercent < 0 ? 'down' : 'neutral',
        color: this.lastReport.signal === 'bullish' ? 'success' : 
              this.lastReport.signal === 'bearish' ? 'critical' : 'neutral',
        loading: false
      };
    }
    
    // Default loading state
    return {
      title: 'Kalman Net Liquidity',
      primaryMetric: 'Loading...',
      secondaryMetric: 'Fetching data...',
      status: 'warning',
      trend: 'neutral',
      color: 'neutral',
      loading: true
    };
  }

  public getIntelligenceView(): IntelligenceViewData {
    // Return real data if available from last execution
    if (this.lastReport?.success && this.lastReport.data) {
      return {
        title: 'Kalman-Adaptive Net Liquidity Intelligence',
        status: 'active',
        primaryMetrics: {
          'Net Liquidity': { 
            value: `$${this.lastReport.data.primaryMetric.value.toFixed(2)}T`,
            label: 'Net Liquidity'
          },
          'Regime': { 
            value: this.lastReport.data.subMetrics?.regime || 'TRANSITION',
            label: 'Regime'
          }
        },
        sections: [
          {
            title: 'Liquidity Components',
            data: {
              'Fed Balance': { 
                value: `$${(this.lastReport.data.subMetrics?.fedBalance || 0).toFixed(1)}M`,
                label: 'Fed Balance'
              },
              'Treasury Account': { 
                value: `$${(this.lastReport.data.subMetrics?.treasuryAccount || 0).toFixed(1)}M`,
                label: 'Treasury Account'
              },
              'Reverse Repo': { 
                value: `$${(this.lastReport.data.subMetrics?.reverseRepo || 0).toFixed(0)}B`,
                label: 'Reverse Repo'
              }
            }
          }
        ],
        confidence: this.lastReport.confidence / 100,
        lastUpdate: this.lastReport.lastUpdated
      };
    }
    
    // Default loading state
    return {
      title: 'Kalman-Adaptive Net Liquidity Intelligence',
      status: 'warning',
      primaryMetrics: { 'Net Liquidity': { value: 'Loading...', label: 'Net Liquidity' } },
      sections: [],
      confidence: 0,
      lastUpdate: new Date()
    };
  }

  public getDetailedView(): DetailedEngineView {
    return {
      title: 'Kalman-Adaptive Net Liquidity Engine',
      primarySection: {
        title: 'Overview',
        metrics: {}
      },
      sections: []
    };
  }

  public getDetailedModal(): DetailedModalData {
    return {
      title: 'Kalman-Adaptive Net Liquidity Engine',
      description: 'Advanced liquidity analysis with adaptive filtering',
      keyInsights: [],
      detailedMetrics: []
    };
  }
}