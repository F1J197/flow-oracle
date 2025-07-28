import { IEngine, EngineReport, DashboardTileData, DetailedEngineView } from '@/types/engines';
import { DealerPositionsService } from '@/services/dealerPositionsService';
import { DealerPositionData, DealerRegime, DealerAlert, DealerInsight } from '@/types/dealerPositions';

export class PrimaryDealerPositionsEngineV6 implements IEngine {
  id = 'primary-dealer-positions-v6';
  name = 'Primary Dealer Positions V6';
  priority = 20;
  pillar = 2 as const;

  private service: DealerPositionsService;
  private currentData: DealerPositionData | null = null;
  private lastSuccessfulUpdate = new Date();
  private errorCount = 0;
  private maxRetries = 3;

  constructor() {
    this.service = new DealerPositionsService();
  }

  async execute(): Promise<EngineReport> {
    try {
      console.log('Primary Dealer Positions Engine V6 executing...');
      
      this.currentData = await this.service.fetchRealTimeData();
      this.lastSuccessfulUpdate = new Date();
      this.errorCount = 0;

      return {
        success: true,
        confidence: this.currentData.metadata.calculationConfidence,
        signal: this.getMarketSignal(),
        data: {
          ...this.currentData,
          alerts: this.service.getAlerts(),
          insights: this.service.getInsights()
        },
        lastUpdated: this.currentData.metadata.lastUpdated
      };

    } catch (error) {
      this.errorCount++;
      console.error('Primary Dealer Positions Engine V6 error:', error);
      
      return {
        success: false,
        confidence: 0,
        signal: 'neutral',
        data: this.getFallbackData(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        lastUpdated: new Date()
      };
    }
  }

  private getMarketSignal(): 'bullish' | 'bearish' | 'neutral' {
    if (!this.currentData) return 'neutral';

    const { analytics, riskMetrics } = this.currentData;
    
    // Multi-factor signal generation
    let signalScore = 0;
    
    // Regime influence
    switch (analytics.regime) {
      case 'EXPANSION':
        signalScore += 3;
        break;
      case 'CONTRACTION':
        signalScore -= 3;
        break;
      case 'CRISIS':
        signalScore -= 5;
        break;
      case 'TRANSITION':
        signalScore += analytics.flowDirection === 'ACCUMULATING' ? 2 : -2;
        break;
    }
    
    // Risk metrics influence
    if (riskMetrics.riskCapacity > 80) signalScore += 2;
    if (riskMetrics.riskCapacity < 60) signalScore -= 2;
    if (riskMetrics.liquidityStress > 70) signalScore -= 3;
    if (riskMetrics.leverageRatio > 4.5) signalScore -= 2;
    
    // Flow direction influence
    if (analytics.flowDirection === 'ACCUMULATING') signalScore += 1;
    if (analytics.flowDirection === 'DISTRIBUTING') signalScore -= 1;
    
    // Market impact consideration
    const impactMultiplier = analytics.marketImpact === 'HIGH' ? 1.5 : 
                            analytics.marketImpact === 'MODERATE' ? 1.2 : 1.0;
    
    signalScore *= impactMultiplier;
    
    if (signalScore >= 3) return 'bullish';
    if (signalScore <= -3) return 'bearish';
    return 'neutral';
  }

  getDashboardData(): DashboardTileData {
    if (!this.currentData) {
      return this.getFallbackDashboardData();
    }

    const { riskMetrics, analytics } = this.currentData;
    const totalPositions = this.getTotalPositions();
    
    const getColor = (): 'teal' | 'orange' | 'gold' | 'lime' | 'fuchsia' => {
      switch (analytics.regime) {
        case 'EXPANSION': return 'teal';
        case 'CONTRACTION': return 'orange';
        case 'CRISIS': return 'fuchsia';
        case 'TRANSITION': return 'lime';
        default: return 'gold';
      }
    };

    const getStatus = (): 'normal' | 'warning' | 'critical' => {
      if (analytics.regime === 'CRISIS' || riskMetrics.liquidityStress > 80) return 'critical';
      if (riskMetrics.riskCapacity < 60 || riskMetrics.leverageRatio > 4.2) return 'warning';
      return 'normal';
    };

    const getTrend = (): 'up' | 'down' | 'neutral' => {
      if (analytics.flowDirection === 'ACCUMULATING') return 'up';
      if (analytics.flowDirection === 'DISTRIBUTING') return 'down';
      return 'neutral';
    };

    return {
      title: 'PRIMARY DEALER POSITIONS V6',
      primaryMetric: `$${(totalPositions / 1000000).toFixed(3)}T`,
      secondaryMetric: `${analytics.regime} | ${riskMetrics.riskCapacity.toFixed(1)}% CAPACITY`,
      status: getStatus(),
      trend: getTrend(),
      color: getColor(),
      actionText: this.getActionText(analytics.regime, analytics.flowDirection)
    };
  }

  getDetailedView(): DetailedEngineView {
    if (!this.currentData) {
      return this.getFallbackDetailedView();
    }

    const { 
      treasuryPositions, 
      agencyPositions, 
      corporatePositions, 
      internationalPositions,
      riskMetrics, 
      analytics, 
      context,
      metadata 
    } = this.currentData;

    const alerts = this.service.getAlerts().filter(alert => !alert.acknowledged);
    const insights = this.service.getInsights();

    return {
      title: 'Primary Dealer Positions Engine V6 - Advanced Market Making Analysis',
      primarySection: {
        title: 'Executive Summary',
        metrics: {
          'Total Positions': `$${(this.getTotalPositions() / 1000000).toFixed(3)}T`,
          'Market Regime': analytics.regime,
          'Flow Direction': analytics.flowDirection,
          'Risk Capacity': `${riskMetrics.riskCapacity.toFixed(1)}%`,
          'System Risk': `${(analytics.systemicRisk * 100).toFixed(1)}%`,
          'Confidence': `${(analytics.regimeConfidence * 100).toFixed(1)}%`
        }
      },
      sections: [
        {
          title: 'Position Breakdown',
          metrics: {
            'Treasury Securities': `$${(treasuryPositions.total / 1000000).toFixed(3)}T`,
            'Agency Securities': `$${(agencyPositions.total / 1000000).toFixed(3)}T`,
            'Corporate Bonds': `$${(corporatePositions.total / 1000000).toFixed(3)}T`,
            'International': `$${(internationalPositions.total / 1000000).toFixed(3)}T`,
            'Bills/Notes/Bonds': `${(treasuryPositions.bills / 1000000).toFixed(2)}T / ${(treasuryPositions.notes / 1000000).toFixed(2)}T / ${(treasuryPositions.bonds / 1000000).toFixed(2)}T`
          }
        },
        {
          title: 'Risk Metrics',
          metrics: {
            'Leverage Ratio': `${riskMetrics.leverageRatio.toFixed(2)}x`,
            'Liquidity Stress': `${riskMetrics.liquidityStress.toFixed(1)}%`,
            'Position Velocity': `${riskMetrics.positionVelocity.toFixed(1)}%`,
            'Concentration Risk': `${riskMetrics.concentrationRisk.toFixed(1)}%`,
            'Duration Risk': `${riskMetrics.durationRisk.toFixed(1)}%`,
            'Credit Risk': `${riskMetrics.creditRisk.toFixed(1)}%`
          }
        },
        {
          title: 'Market Intelligence',
          metrics: {
            'Market Impact': analytics.marketImpact,
            'Z-Score': context.zScore.toFixed(2),
            'Percentile Rank': `${context.percentileRank.toFixed(1)}%`,
            'SPX Correlation': `${(context.correlationToSPX * 100).toFixed(1)}%`,
            'VIX Correlation': `${(context.correlationToVIX * 100).toFixed(1)}%`,
            'Data Quality': `${(metadata.dataQuality * 100).toFixed(1)}%`
          }
        }
      ],
      alerts: alerts.map(alert => ({
        severity: alert.severity.toLowerCase() as 'info' | 'warning' | 'critical',
        message: `${alert.message} (${alert.currentValue.toFixed(2)} vs ${alert.threshold})`
      }))
    };
  }

  // Helper methods
  private getTotalPositions(): number {
    if (!this.currentData) return 5660000;
    
    const { treasuryPositions, agencyPositions, corporatePositions, internationalPositions } = this.currentData;
    return treasuryPositions.total + agencyPositions.total + corporatePositions.total + internationalPositions.total;
  }

  private getActionText(regime: DealerRegime, flowDirection: string): string {
    switch (regime) {
      case 'EXPANSION':
        return 'DEALERS EXPANDING RISK APPETITE';
      case 'CONTRACTION':
        return 'DEALERS REDUCING EXPOSURE';
      case 'CRISIS':
        return 'CRISIS MODE - EMERGENCY POSITIONING';
      case 'TRANSITION':
        return `REGIME TRANSITION - ${flowDirection}`;
      default:
        return 'NEUTRAL POSITIONING';
    }
  }

  private getFallbackData() {
    return {
      totalPositions: 5660000,
      regime: 'NEUTRAL' as DealerRegime,
      leverageRatio: 3.2,
      riskCapacity: 85.6,
      liquidityStress: 25.8,
      errorState: true
    };
  }

  private getFallbackDashboardData(): DashboardTileData {
    return {
      title: 'PRIMARY DEALER POSITIONS V6',
      primaryMetric: '$5.660T',
      secondaryMetric: 'NEUTRAL | 85.6% CAPACITY',
      status: 'warning',
      trend: 'neutral',
      color: 'gold',
      actionText: 'DATA UNAVAILABLE',
      loading: false
    };
  }

  private getFallbackDetailedView(): DetailedEngineView {
    return {
      title: 'Primary Dealer Positions Engine V6 - Data Unavailable',
      primarySection: {
        title: 'System Status',
        metrics: {
          'Status': 'DATA UNAVAILABLE',
          'Last Update': this.lastSuccessfulUpdate.toLocaleTimeString(),
          'Error Count': this.errorCount.toString(),
          'Fallback Active': 'TRUE'
        }
      },
      sections: [
        {
          title: 'Fallback Data',
          metrics: {
            'Total Positions': '$5.660T (STALE)',
            'Regime': 'NEUTRAL (ESTIMATED)',
            'Risk Capacity': '85.6% (ESTIMATED)',
            'Data Age': `${Math.floor((Date.now() - this.lastSuccessfulUpdate.getTime()) / 60000)} minutes`
          }
        }
      ],
      alerts: [
        {
          severity: 'warning',
          message: 'Engine is operating on fallback data due to data source issues'
        }
      ]
    };
  }

  // Public methods for external access
  getAlerts(): DealerAlert[] {
    return this.service.getAlerts();
  }

  getInsights(): DealerInsight[] {
    return this.service.getInsights();
  }

  acknowledgeAlert(alertId: string): void {
    this.service.acknowledgeAlert(alertId);
  }

  getCurrentData(): DealerPositionData | null {
    return this.currentData;
  }

  getHealthStatus(): { 
    healthy: boolean; 
    errorCount: number; 
    lastUpdate: Date; 
    dataAge: number;
  } {
    return {
      healthy: this.errorCount < this.maxRetries && this.currentData !== null,
      errorCount: this.errorCount,
      lastUpdate: this.lastSuccessfulUpdate,
      dataAge: Date.now() - this.lastSuccessfulUpdate.getTime()
    };
  }
}