import { IEngine, EngineReport, DashboardTileData, DetailedEngineView, ActionableInsight } from '@/types/engines';
import { BaseEngine } from './BaseEngine';
import UniversalDataService from '@/services/UniversalDataService';
import { DealerPositionData, DealerRegime, DealerAlert, DealerInsight } from '@/types/dealerPositions';
import { PrimaryDealerTileData } from '@/types/primaryDealerTile';

export class PrimaryDealerPositionsEngineV6 extends BaseEngine {
  readonly category = 'core' as const;
  readonly id = 'primary-dealer-positions-v6';
  readonly name = 'Primary Dealer Positions V6';
  readonly priority = 20;
  readonly pillar = 2 as const;

  private unifiedService = UniversalDataService.getInstance();
  private currentData: DealerPositionData | null = null;
  private lastSuccessfulUpdate = new Date();
  private errorCount = 0;
  private maxRetries = 3;

  constructor() {
    super({
      refreshInterval: 35000,
      retryAttempts: 3,
      timeout: 15000,
      cacheTimeout: 60000
    });
  }

  protected async performExecution(): Promise<EngineReport> {
    try {
      console.log('Primary Dealer Positions Engine V6 executing...');
      
      // Generate mock dealer position data
      this.currentData = await this.generateMockDealerData();
      this.lastSuccessfulUpdate = new Date();
      this.errorCount = 0;

      return {
        success: true,
        confidence: this.currentData.metadata.calculationConfidence,
        signal: this.getMarketSignal(),
        data: {
          ...this.currentData,
          alerts: this.getAlerts(),
          insights: this.getInsights()
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

  private async generateMockDealerData(): Promise<DealerPositionData> {
    // Generate realistic mock data for dealer positions
    const basePositions = {
      treasury: 3200000 + (Math.random() - 0.5) * 400000,
      agency: 850000 + (Math.random() - 0.5) * 100000,
      corporate: 1200000 + (Math.random() - 0.5) * 200000,
      international: 410000 + (Math.random() - 0.5) * 50000
    };

    const totalPositions = Object.values(basePositions).reduce((sum, pos) => sum + pos, 0);
    const leverageRatio = 2.8 + Math.random() * 1.5;
    const riskCapacity = 60 + Math.random() * 35;
    const liquidityStress = Math.random() * 50;

    // Determine regime based on position levels and stress
    let regime: DealerRegime;
    if (liquidityStress > 70 || riskCapacity < 40) {
      regime = 'CRISIS';
    } else if (totalPositions > 5800000 && riskCapacity > 80) {
      regime = 'EXPANSION';
    } else if (totalPositions < 5400000 || riskCapacity < 60) {
      regime = 'CONTRACTION';
    } else {
      regime = 'TRANSITION';
    }

    const flowDirection = Math.random() > 0.5 ? 'ACCUMULATING' : 'DISTRIBUTING';
    const marketImpact = liquidityStress > 60 ? 'HIGH' : liquidityStress > 30 ? 'MODERATE' : 'LOW';

    return {
      treasuryPositions: {
        total: basePositions.treasury,
        bills: basePositions.treasury * 0.4,
        notes: basePositions.treasury * 0.45,
        bonds: basePositions.treasury * 0.15,
        tips: basePositions.treasury * 0.05
      },
      agencyPositions: {
        total: basePositions.agency,
        mortgage: basePositions.agency * 0.7,
        debentures: basePositions.agency * 0.2,
        discount: basePositions.agency * 0.1
      },
      corporatePositions: {
        total: basePositions.corporate,
        investmentGrade: basePositions.corporate * 0.8,
        highYield: basePositions.corporate * 0.15,
        municipals: basePositions.corporate * 0.05
      },
      internationalPositions: {
        total: basePositions.international,
        foreign: basePositions.international * 0.7,
        emerging: basePositions.international * 0.3
      },
      riskMetrics: {
        leverageRatio,
        riskCapacity,
        liquidityStress,
        positionVelocity: Math.random() * 20 - 10,
        concentrationRisk: Math.random() * 40,
        durationRisk: Math.random() * 60,
        creditRisk: Math.random() * 30,
        counterpartyRisk: Math.random() * 25
      },
      analytics: {
        regime,
        regimeConfidence: 0.7 + Math.random() * 0.25,
        transitionProbability: {
          EXPANSION: regime === 'EXPANSION' ? 0.7 : Math.random() * 0.3,
          CONTRACTION: regime === 'CONTRACTION' ? 0.7 : Math.random() * 0.3,
          CRISIS: regime === 'CRISIS' ? 0.8 : Math.random() * 0.1,
          TRANSITION: regime === 'TRANSITION' ? 0.6 : Math.random() * 0.4,
          NEUTRAL: 0.1
        },
        flowDirection,
        marketImpact,
        systemicRisk: Math.random() * 0.3
      },
      context: {
        percentileRank: Math.random() * 100,
        zScore: (Math.random() - 0.5) * 4,
        historicalAverage: totalPositions * 0.95,
        volatility: Math.random() * 0.3,
        correlationToSPX: Math.random() * 0.8 - 0.4,
        correlationToVIX: Math.random() * 0.6 - 0.3
      },
      metadata: {
        lastUpdated: new Date(),
        dataQuality: 0.85 + Math.random() * 0.1,
        sourceReliability: 0.9 + Math.random() * 0.05,
        calculationConfidence: 0.8 + Math.random() * 0.15
      }
    };
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
    
    if (signalScore >= 3) return 'bullish';
    if (signalScore <= -3) return 'bearish';
    return 'neutral';
  }

  getSingleActionableInsight(): ActionableInsight {
    if (!this.currentData) {
      return {
        actionText: 'WAIT for dealer position data initialization',
        signalStrength: 0,
        marketAction: 'WAIT',
        confidence: 'LOW',
        timeframe: 'IMMEDIATE'
      };
    }

    const { analytics, riskMetrics } = this.currentData;
    
    // Calculate signal strength based on regime and risk metrics
    let signalStrength: number;
    switch (analytics.regime) {
      case 'EXPANSION':
        signalStrength = 85 + (riskMetrics.riskCapacity - 80) / 4;
        break;
      case 'CONTRACTION':
        signalStrength = 75 + riskMetrics.liquidityStress / 2;
        break;
      case 'CRISIS':
        signalStrength = 95;
        break;
      case 'TRANSITION':
        signalStrength = analytics.flowDirection === 'ACCUMULATING' ? 70 : 60;
        break;
      default:
        signalStrength = 40;
    }
    signalStrength = Math.min(100, signalStrength);
    
    // Determine market action
    let marketAction: 'BUY' | 'SELL' | 'HOLD' | 'WAIT';
    switch (analytics.regime) {
      case 'EXPANSION':
        marketAction = riskMetrics.riskCapacity > 85 ? 'BUY' : 'HOLD';
        break;
      case 'CONTRACTION':
        marketAction = 'SELL';
        break;
      case 'CRISIS':
        marketAction = 'SELL';
        break;
      case 'TRANSITION':
        marketAction = analytics.flowDirection === 'ACCUMULATING' ? 'HOLD' : 'WAIT';
        break;
      default:
        marketAction = 'WAIT';
    }
    
    // Determine confidence
    const confidence: 'HIGH' | 'MED' | 'LOW' = 
      analytics.regimeConfidence > 0.85 && riskMetrics.riskCapacity > 70 ? 'HIGH' :
      analytics.regimeConfidence > 0.70 ? 'MED' : 'LOW';
    
    // Generate actionable text
    let actionText: string;
    const totalPositions = this.getTotalPositions();
    switch (analytics.regime) {
      case 'EXPANSION':
        actionText = `AGGRESSIVE positioning - Dealers expanding to $${(totalPositions / 1000000).toFixed(1)}T, follow their lead`;
        break;
      case 'CONTRACTION':
        actionText = `DEFENSIVE required - Dealers reducing exposure, capacity at ${riskMetrics.riskCapacity.toFixed(1)}%`;
        break;
      case 'CRISIS':
        actionText = `EMERGENCY LIQUIDITY - Crisis mode detected, immediate risk reduction necessary`;
        break;
      case 'TRANSITION':
        actionText = `MONITOR regime shift - Dealers ${analytics.flowDirection.toLowerCase()}, await confirmation`;
        break;
      default:
        actionText = `NEUTRAL stance - No clear dealer signal, maintain current allocation`;
    }
    
    return {
      actionText,
      signalStrength: Math.round(signalStrength),
      marketAction,
      confidence,
      timeframe: analytics.regime === 'CRISIS' ? 'IMMEDIATE' : analytics.regime === 'TRANSITION' ? 'SHORT_TERM' : 'MEDIUM_TERM'
    };
  }

  getDashboardData(): DashboardTileData {
    if (!this.currentData) {
      return this.getFallbackDashboardData();
    }

    const { riskMetrics, analytics } = this.currentData;
    const totalPositions = this.getTotalPositions();
    
    const getColor = (): 'success' | 'critical' | 'warning' | 'success' | 'critical' => {
      switch (analytics.regime) {
        case 'EXPANSION': return 'success';
        case 'CONTRACTION': return 'critical';
        case 'CRISIS': return 'critical';
        case 'TRANSITION': return 'success';
        default: return 'warning';
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

  getPrimaryDealerTileData(): PrimaryDealerTileData {
    if (!this.currentData) {
      return this.getFallbackPrimaryDealerTileData();
    }

    const { riskMetrics, analytics, metadata } = this.currentData;
    
    // Calculate net position (simplified as total - baseline)
    const totalPositions = this.getTotalPositions();
    const historicalBaseline = 5200000; // $5.2T baseline
    const netPosition = totalPositions - historicalBaseline;
    
    // Calculate gross positions (simulated)
    const grossLong = totalPositions * 1.3; // Assume 30% gross exposure
    const grossShort = grossLong - netPosition;
    
    // Calculate percentages for visualization
    const maxPosition = Math.max(Math.abs(grossLong), Math.abs(grossShort), Math.abs(netPosition), historicalBaseline);
    const grossLongPct = (Math.abs(grossLong) / maxPosition) * 100;
    const grossShortPct = (Math.abs(grossShort) / maxPosition) * 100;
    const netPositionPct = (Math.abs(netPosition) / maxPosition) * 50; // Scale for center display
    const historicalAvgPct = (historicalBaseline / maxPosition) * 100;

    // Risk appetite mapping
    const getRiskAppetite = (): 'EXPANDING' | 'CONTRACTING' | 'STABLE' | 'CRISIS' => {
      switch (analytics.regime) {
        case 'EXPANSION': return 'EXPANDING';
        case 'CONTRACTION': return 'CONTRACTING';
        case 'CRISIS': return 'CRISIS';
        default: return 'STABLE';
      }
    };

    // Signal mapping
    const getSignal = (): 'BULLISH' | 'BEARISH' | 'NEUTRAL' => {
      const marketSignal = this.getMarketSignal();
      switch (marketSignal) {
        case 'bullish': return 'BULLISH';
        case 'bearish': return 'BEARISH';
        default: return 'NEUTRAL';
      }
    };

    const getColor = (): 'success' | 'critical' | 'warning' | 'success' | 'critical' => {
      switch (analytics.regime) {
        case 'EXPANSION': return 'success';
        case 'CONTRACTION': return 'critical';
        case 'CRISIS': return 'critical';
        case 'TRANSITION': return 'success';
        default: return 'warning';
      }
    };

    const getStatus = (): 'normal' | 'warning' | 'critical' => {
      if (analytics.regime === 'CRISIS' || riskMetrics.liquidityStress > 80) return 'critical';
      if (riskMetrics.riskCapacity < 60 || riskMetrics.leverageRatio > 4.2) return 'warning';
      return 'normal';
    };

    const getDirection = (): 'up' | 'down' | 'neutral' => {
      if (analytics.flowDirection === 'ACCUMULATING') return 'up';
      if (analytics.flowDirection === 'DISTRIBUTING') return 'down';
      return 'neutral';
    };

    return {
      title: 'PRIMARY DEALER POSITIONS',
      netPosition: `${netPosition >= 0 ? '+' : ''}$${(netPosition / 1000).toFixed(0)}B`,
      direction: getDirection(),
      riskAppetite: getRiskAppetite(),
      signal: getSignal(),
      status: getStatus(),
      color: getColor(),
      positionBars: {
        grossLong,
        grossShort,
        netPosition,
        historicalAverage: historicalBaseline,
        grossLongPct,
        grossShortPct,
        netPositionPct,
        historicalAvgPct
      },
      metadata: {
        lastUpdated: metadata.lastUpdated,
        confidence: metadata.calculationConfidence,
        dataQuality: metadata.dataQuality
      }
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
      metadata 
    } = this.currentData;

    const totalPositions = this.getTotalPositions();
    const netPosition = totalPositions * 0.95; // Mock net position calculation
    const alerts = this.getAlerts().filter(alert => !alert.acknowledged);

    return {
      title: 'PRIMARY DEALER POSITIONS V6',
      primarySection: {
        title: 'COMPOSITE DEALER ANALYSIS',
        metrics: {
          'Net Position::': `$${(netPosition / 1000000000).toFixed(0)}B`,
          'Confidence::': `${(analytics.regimeConfidence * 100).toFixed(0)}%`,
          'Regime::': analytics.regime,
          'Signal::': this.getMarketSignal().toUpperCase()
        }
      },
      sections: [
        {
          title: 'POSITION INSIGHTS',
          metrics: {
            'Gross Long::': `$${(totalPositions * 1.05 / 1000000000).toFixed(0)}B`,
            'Gross Short::': `$${(totalPositions * 0.98 / 1000000000).toFixed(0)}B`,
            'Risk Appetite::': this.getRiskAppetiteStatus(analytics.regime),
            'Flow Direction::': analytics.flowDirection,
            'Leverage::': `${riskMetrics.leverageRatio.toFixed(1)}x`
          }
        },
        {
          title: 'RISK ASSESSMENT',
          metrics: {
            'Risk Capacity::': `${riskMetrics.riskCapacity.toFixed(0)}%`,
            'Liquidity Stress::': `${riskMetrics.liquidityStress.toFixed(0)}%`,
            'Concentration::': `${riskMetrics.concentrationRisk.toFixed(0)}%`,
            'Duration Risk::': `${riskMetrics.durationRisk.toFixed(0)}%`,
            'Systemic Risk::': `${(analytics.systemicRisk * 100).toFixed(0)}%`
          }
        },
        {
          title: 'MARKET BREAKDOWN',
          metrics: {
            'Treasury::': `$${(treasuryPositions.total / 1000000000).toFixed(0)}B`,
            'Agency::': `$${(agencyPositions.total / 1000000000).toFixed(0)}B`,
            'Corporate::': `$${(corporatePositions.total / 1000000000).toFixed(0)}B`,
            'International::': `$${(internationalPositions.total / 1000000000).toFixed(0)}B`,
            'Bills/Notes/Bonds::': `${(treasuryPositions.bills / 1000000000).toFixed(0)}B/${(treasuryPositions.notes / 1000000000).toFixed(0)}B/${(treasuryPositions.bonds / 1000000000).toFixed(0)}B`
          }
        }
      ]
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

  private getRiskAppetiteStatus(regime: DealerRegime): string {
    switch (regime) {
      case 'EXPANSION': return 'EXPANDING';
      case 'CONTRACTION': return 'CONTRACTING';
      case 'CRISIS': return 'CRISIS';
      case 'TRANSITION': return 'TRANSITIONING';
      default: return 'STABLE';
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
      color: 'warning',
      actionText: 'DATA UNAVAILABLE',
      loading: false
    };
  }

  private getFallbackPrimaryDealerTileData(): PrimaryDealerTileData {
    return {
      title: 'PRIMARY DEALER POSITIONS',
      netPosition: '-$310B',
      direction: 'neutral',
      riskAppetite: 'STABLE',
      signal: 'NEUTRAL',
      status: 'warning',
      color: 'warning',
      positionBars: {
        grossLong: 5660000,
        grossShort: 5970000,
        netPosition: -310000,
        historicalAverage: 5200000,
        grossLongPct: 85,
        grossShortPct: 90,
        netPositionPct: 25,
        historicalAvgPct: 80
      },
      metadata: {
        lastUpdated: new Date(),
        confidence: 0.75,
        dataQuality: 0.80
      }
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
      ]
    };
  }

  // Public methods for external access (mock implementations)
  getAlerts(): DealerAlert[] {
    return []; // Return empty array for now
  }

  getInsights(): DealerInsight[] {
    return []; // Return empty array for now
  }

  acknowledgeAlert(alertId: string): void {
    // Mock implementation
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

  getIntelligenceView() {
    const dashboardData = this.getDashboardData();
    return {
      title: this.name,
      status: dashboardData.status === 'critical' ? 'critical' as const : 
              dashboardData.status === 'warning' ? 'warning' as const : 'active' as const,
      primaryMetrics: {
        'Total Positions': {
          value: this.currentData ? `$${(this.getTotalPositions() / 1000000).toFixed(3)}T` : '--',
          label: 'Total dealer positions',
          status: 'normal' as const
        }
      },
      sections: [
        {
          title: 'Position Analysis',
          data: {
            'Regime': {
              value: this.currentData?.analytics.regime || 'Unknown',
              label: 'Current dealer regime'
            },
            'Risk Capacity': {
              value: this.currentData ? `${this.currentData.riskMetrics.riskCapacity.toFixed(1)}%` : '--',
              label: 'Available risk capacity',
              unit: '%'
            },
            'Flow Direction': {
              value: this.currentData?.analytics.flowDirection || 'Unknown',
              label: 'Current flow direction'
            }
          }
        }
      ],
      confidence: this.currentData ? Math.round(this.currentData.analytics.regimeConfidence * 100) : 0,
      lastUpdate: new Date()
    };
  }

  getDetailedModal() {
    const dashboardData = this.getDashboardData();
    return {
      title: this.name,
      description: 'Comprehensive primary dealer position tracking with regime analysis and risk monitoring',
      keyInsights: [
        `Total positions: ${this.currentData ? `$${(this.getTotalPositions() / 1000000).toFixed(3)}T` : 'Unknown'}`,
        `Regime: ${this.currentData?.analytics.regime || 'Unknown'}`,
        `Risk capacity: ${this.currentData ? `${this.currentData.riskMetrics.riskCapacity.toFixed(1)}%` : 'Unknown'}`
      ],
      detailedMetrics: [
        {
          category: 'Position Analysis',
          metrics: {
            'Total Positions': { value: this.currentData ? `$${(this.getTotalPositions() / 1000000).toFixed(3)}T` : '--', description: 'Total dealer positions across all instruments' },
            'Regime': { value: this.currentData?.analytics.regime || 'Unknown', description: 'Current dealer positioning regime' },
            'Risk Capacity': { value: this.currentData ? `${this.currentData.riskMetrics.riskCapacity}%` : '--', description: 'Available risk capacity percentage' }
          }
        }
      ]
    };
  }
}