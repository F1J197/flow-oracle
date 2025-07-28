import { IEngine, DashboardTileData, DetailedEngineView, EngineReport } from "@/types/engines";
import { EnhancedCreditData } from "@/types/data";
import { creditDataService } from "@/services/creditDataService";

export class CreditStressEngine implements IEngine {
  id = 'credit-stress';
  name = 'Credit Stress Engine V6';
  priority = 2;
  pillar = 1 as const;

  private creditData: EnhancedCreditData | null = null;
  private alerts: Array<{ severity: 'info' | 'warning' | 'critical'; message: string }> = [];

  async execute(): Promise<EngineReport> {
    try {
      // Fetch comprehensive credit data
      this.creditData = await creditDataService.aggregateCreditData();
      
      // Generate alerts based on conditions
      this.generateAlerts();
      
      // Determine overall signal
      const signal = this.determineOverallSignal();
      const confidence = this.calculateConfidence();

      return {
        success: true,
        confidence,
        signal,
        data: this.creditData,
        lastUpdated: new Date()
      };
    } catch (error) {
      return {
        success: false,
        confidence: 0,
        signal: 'neutral',
        data: null,
        errors: [error instanceof Error ? error.message : 'Credit data aggregation failed'],
        lastUpdated: new Date()
      };
    }
  }

  private generateAlerts(): void {
    if (!this.creditData) return;
    
    this.alerts = [];
    
    // Critical alerts
    if (this.creditData.stressLevel === 'EXTREME') {
      this.alerts.push({
        severity: 'critical',
        message: `EXTREME credit stress detected: HY spread at ${this.creditData.highYieldSpread}bps`
      });
    }
    
    if (this.creditData.systemicRisk > 80) {
      this.alerts.push({
        severity: 'critical',
        message: `High systemic risk: ${this.creditData.systemicRisk.toFixed(1)}% - Contagion likely`
      });
    }
    
    // Warning alerts
    if (this.creditData.liquidityScore < 30) {
      this.alerts.push({
        severity: 'warning',
        message: `Low liquidity conditions: Score ${this.creditData.liquidityScore.toFixed(1)}`
      });
    }
    
    if (Math.abs(this.creditData.spreadVelocity) > 5) {
      this.alerts.push({
        severity: 'warning',
        message: `Rapid spread movement: ${this.creditData.spreadVelocity.toFixed(1)}% velocity`
      });
    }
    
    // Info alerts
    if (this.creditData.correlationBreakdown > 20) {
      this.alerts.push({
        severity: 'info',
        message: `Credit-equity correlation breakdown detected`
      });
    }
  }

  private determineOverallSignal(): 'bullish' | 'bearish' | 'neutral' {
    if (!this.creditData) return 'neutral';
    
    const factors = {
      regime: this.creditData.regime === 'QE_SUPPORTIVE' ? 2 : 
              this.creditData.regime === 'CRISIS_MODE' ? -3 : 
              this.creditData.regime === 'QT_STRESS' ? -1 : 0,
      stress: this.creditData.stressLevel === 'MINIMAL' ? 1 :
              this.creditData.stressLevel === 'EXTREME' ? -2 : 0,
      liquidity: this.creditData.liquidityScore > 70 ? 1 : 
                 this.creditData.liquidityScore < 30 ? -1 : 0,
      momentum: this.creditData.spreadVelocity < -2 ? 1 : 
                this.creditData.spreadVelocity > 3 ? -1 : 0
    };
    
    const totalScore = Object.values(factors).reduce((sum, score) => sum + score, 0);
    
    if (totalScore >= 2) return 'bullish';
    if (totalScore <= -2) return 'bearish';
    return 'neutral';
  }

  private calculateConfidence(): number {
    if (!this.creditData) return 0;
    
    const qualityFactor = this.creditData.dataQuality;
    const sourceFactor = Math.min(1, this.creditData.sourceCount / 5);
    const regimeFactor = this.creditData.regimeConfidence;
    
    return (qualityFactor + sourceFactor + regimeFactor) / 3;
  }

  getDashboardData(): DashboardTileData {
    if (!this.creditData) {
      return {
        title: 'CREDIT STRESS ENGINE V6',
        primaryMetric: '---',
        status: 'warning',
        actionText: 'INITIALIZING',
        color: 'gold',
        loading: true
      };
    }

    const getColor = () => {
      switch (this.creditData!.stressLevel) {
        case 'MINIMAL': return 'lime';
        case 'MODERATE': return 'teal';
        case 'ELEVATED': return 'gold';
        case 'EXTREME': return 'orange';
      }
    };

    const getStatus = () => {
      switch (this.creditData!.stressLevel) {
        case 'EXTREME': return 'critical';
        case 'ELEVATED': return 'warning';
        default: return 'normal';
      }
    };

    const getActionText = () => {
      return `${this.creditData!.regime.replace('_', ' ')} • ${this.creditData!.stressLevel}`;
    };

    return {
      title: 'CREDIT STRESS ENGINE V6',
      primaryMetric: `${this.creditData.highYieldSpread.toFixed(0)}bps`,
      secondaryMetric: `${this.creditData.spreadVelocity > 0 ? '+' : ''}${this.creditData.spreadVelocity.toFixed(1)}%`,
      status: getStatus(),
      trend: this.creditData.spreadVelocity > 1 ? 'up' : this.creditData.spreadVelocity < -1 ? 'down' : 'neutral',
      actionText: getActionText(),
      color: getColor()
    };
  }

  getDetailedView(): DetailedEngineView {
    if (!this.creditData) {
      return {
        title: 'CREDIT STRESS ENGINE V6',
        primarySection: {
          title: 'INITIALIZING',
          metrics: {
            'Status': 'Loading credit data...'
          }
        },
        sections: []
      };
    }

    return {
      title: 'CREDIT STRESS ENGINE V6',
      primarySection: {
        title: 'MARKET REGIME & STRESS ASSESSMENT',
        metrics: {
          'Current Regime': this.creditData.regime.replace('_', ' '),
          'Stress Level': this.creditData.stressLevel,
          'Regime Confidence': `${(this.creditData.regimeConfidence * 100).toFixed(1)}%`,
          'Transition Risk': `${(this.creditData.transitionProbability * 100).toFixed(1)}%`
        }
      },
      sections: [
        {
          title: 'SPREAD DYNAMICS',
          metrics: {
            'High Yield OAS': `${this.creditData.highYieldSpread.toFixed(0)}bps`,
            'Investment Grade': `${this.creditData.investmentGradeSpread.toFixed(0)}bps`,
            'Spread Velocity': `${this.creditData.spreadVelocity.toFixed(1)}%`,
            'Acceleration': `${this.creditData.accelerationRate.toFixed(2)}%/period`
          }
        },
        {
          title: 'RISK METRICS',
          metrics: {
            'Systemic Risk': `${this.creditData.systemicRisk.toFixed(1)}%`,
            'Contagion Risk': `${this.creditData.contagionRisk.toFixed(1)}%`,
            'Liquidity Score': `${this.creditData.liquidityScore.toFixed(1)}`,
            'Volatility Index': `${this.creditData.volatilityIndex.toFixed(1)}`
          }
        },
        {
          title: 'TECHNICAL ANALYSIS',
          metrics: {
            'Z-Score': `${this.creditData.zScore.toFixed(2)}σ`,
            'Percentile Rank': `${this.creditData.percentileRank.toFixed(0)}th`,
            'Momentum Strength': `${this.creditData.momentumStrength.toFixed(1)}%`,
            'Correlation Break': `${this.creditData.correlationBreakdown.toFixed(1)}%`
          }
        },
        {
          title: 'DATA QUALITY',
          metrics: {
            'Data Sources': `${this.creditData.sourceCount}`,
            'Quality Score': `${(this.creditData.dataQuality * 100).toFixed(1)}%`,
            'Last Updated': this.creditData.lastUpdated.toLocaleTimeString(),
            'Coverage': 'Multi-asset'
          }
        }
      ],
      alerts: this.alerts
    };
  }
}