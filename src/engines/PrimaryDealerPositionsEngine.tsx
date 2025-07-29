import { IEngine, DashboardTileData, DetailedEngineView, EngineReport, ActionableInsight } from "@/types/engines";
import { dataService } from "@/services/dataService";

export class PrimaryDealerPositionsEngine implements IEngine {
  id = 'primary-dealer-positions';
  name = 'Primary Dealer Positions Engine V6';
  priority = 2;
  pillar = 2 as const;

  // Core position data (in billions)
  private treasuryPositions = 2.847;      // Treasury securities positions
  private agencyPositions = 0.156;        // Agency debt positions
  private mortgagePositions = 1.923;      // Mortgage-backed securities
  private corporatePositions = 0.734;     // Corporate bonds
  private totalPositions = 5.660;         // Total dealer positions
  
  // Risk metrics
  private leverageRatio = 3.2;            // Dealer leverage
  private riskCapacity = 85.6;             // Risk capacity utilization %
  private liquidityStress = 0.14;          // Liquidity stress coefficient
  private positionVelocity = 2.3;         // Position turnover rate
  private confidence = 94;
  private regime: 'EXPANSION' | 'CONTRACTION' | 'NEUTRAL' = 'NEUTRAL';
  private cache = new Map<string, any>();
  private readonly CACHE_TTL = 30000; // 30 seconds cache

  private fetchWithTimeout<T>(fn: () => Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
  }

  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { ...data, timestamp: Date.now() });
  }

  private updateFromCachedData(cached: any): void {
    this.updateFromData(cached);
  }

  private updateFromData(data: any): void {
    this.treasuryPositions = data.treasuryPositions || this.treasuryPositions;
    this.agencyPositions = data.agencyPositions || this.agencyPositions;
    this.mortgagePositions = data.mortgagePositions || this.mortgagePositions;
    this.corporatePositions = data.corporatePositions || this.corporatePositions;
    
    // Calculate total positions
    this.totalPositions = this.treasuryPositions + this.agencyPositions + 
                         this.mortgagePositions + this.corporatePositions;
    
    // Calculate leverage and risk metrics
    this.leverageRatio = data.leverageRatio || this.calculateLeverage();
    this.riskCapacity = data.riskCapacity || this.calculateRiskCapacity();
    this.liquidityStress = data.liquidityStress || this.calculateLiquidityStress();
    this.positionVelocity = data.positionVelocity || this.calculatePositionVelocity();
    
    // Regime detection based on dealer positioning
    this.regime = this.detectRegime();
  }

  private calculateLeverage(): number {
    // Simplified leverage calculation based on position size
    return Math.max(2.0, Math.min(5.0, this.totalPositions / 1.8));
  }

  private calculateRiskCapacity(): number {
    // Risk capacity based on leverage and position concentration
    const concentrationRisk = Math.max(this.treasuryPositions, this.mortgagePositions) / this.totalPositions;
    return Math.max(60, Math.min(95, 100 - (this.leverageRatio * 15) - (concentrationRisk * 30)));
  }

  private calculateLiquidityStress(): number {
    // Liquidity stress based on market conditions and position sizes
    return Math.max(0.05, Math.min(0.30, (this.leverageRatio - 2.5) * 0.08 + 0.12));
  }

  private calculatePositionVelocity(): number {
    // Position turnover rate - simplified calculation
    return Math.max(1.0, Math.min(4.0, 2.5 + (Math.random() - 0.5) * 0.6));
  }

  private detectRegime(): 'EXPANSION' | 'CONTRACTION' | 'NEUTRAL' {
    if (this.leverageRatio > 3.8 && this.riskCapacity > 80) return 'EXPANSION';
    if (this.leverageRatio < 2.8 || this.riskCapacity < 70) return 'CONTRACTION';
    return 'NEUTRAL';
  }

  private generateReport(): EngineReport {
    console.log(`Primary Dealer Positions: $${this.totalPositions.toFixed(3)}T | Regime: ${this.regime}`);
    
    return {
      success: true,
      confidence: this.confidence / 100,
      signal: this.getMarketSignal(),
      data: {
        totalPositions: this.totalPositions,
        treasuryPositions: this.treasuryPositions,
        agencyPositions: this.agencyPositions,
        mortgagePositions: this.mortgagePositions,
        corporatePositions: this.corporatePositions,
        leverageRatio: this.leverageRatio,
        riskCapacity: this.riskCapacity,
        liquidityStress: this.liquidityStress,
        positionVelocity: this.positionVelocity,
        regime: this.regime
      },
      lastUpdated: new Date()
    };
  }

  async execute(): Promise<EngineReport> {
    try {
      console.log('Primary Dealer Positions Engine V6 executing...');
      
      // Use cached data first to avoid slow API calls
      const cacheKey = 'dealer-positions-data';
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        this.updateFromCachedData(cached);
        return this.generateReport();
      }
      
      // In a real implementation, these would fetch from FRED or other data sources
      // For now, we'll simulate with realistic data variations
      const positionData = {
        treasuryPositions: this.treasuryPositions + (Math.random() - 0.5) * 0.1,
        agencyPositions: this.agencyPositions + (Math.random() - 0.5) * 0.02,
        mortgagePositions: this.mortgagePositions + (Math.random() - 0.5) * 0.08,
        corporatePositions: this.corporatePositions + (Math.random() - 0.5) * 0.05,
        leverageRatio: this.leverageRatio + (Math.random() - 0.5) * 0.2,
        riskCapacity: this.riskCapacity + (Math.random() - 0.5) * 3,
        liquidityStress: this.liquidityStress + (Math.random() - 0.5) * 0.02,
        positionVelocity: this.positionVelocity + (Math.random() - 0.5) * 0.3,
        timestamp: Date.now()
      };
      
      this.setCachedData(cacheKey, positionData);
      this.updateFromData(positionData);
      
      return this.generateReport();
    } catch (error) {
      console.error('Primary Dealer Positions Engine error:', error);
      return {
        success: false,
        confidence: 0,
        signal: 'neutral',
        data: null,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        lastUpdated: new Date()
      };
    }
  }

  private getMarketSignal(): 'bullish' | 'bearish' | 'neutral' {
    if (this.regime === 'EXPANSION' && this.riskCapacity > 85) return 'bullish';
    if (this.regime === 'CONTRACTION' || this.liquidityStress > 0.25) return 'bearish';
    return 'neutral';
  }

  getSingleActionableInsight(): ActionableInsight {
    const signal = this.getMarketSignal();
    
    // Calculate signal strength based on regime confidence and risk metrics
    let signalStrength: number;
    switch (this.regime) {
      case 'EXPANSION':
        signalStrength = 80 + (this.riskCapacity - 80) * 2;
        break;
      case 'CONTRACTION':
        signalStrength = 75 + (this.liquidityStress * 100);
        break;
      default:
        signalStrength = 45;
    }
    signalStrength = Math.min(100, signalStrength);
    
    // Determine market action
    let marketAction: 'BUY' | 'SELL' | 'HOLD' | 'WAIT';
    if (this.regime === 'EXPANSION' && this.riskCapacity > 85) {
      marketAction = 'BUY';
    } else if (this.regime === 'CONTRACTION' || this.liquidityStress > 0.25) {
      marketAction = 'SELL';
    } else if (this.leverageRatio > 4.0) {
      marketAction = 'HOLD';
    } else {
      marketAction = 'WAIT';
    }
    
    // Determine confidence
    const confidence: 'HIGH' | 'MED' | 'LOW' = 
      this.confidence > 90 && signalStrength > 75 ? 'HIGH' :
      this.confidence > 80 && signalStrength > 60 ? 'MED' : 'LOW';
    
    // Generate actionable text
    let actionText: string;
    if (this.regime === 'EXPANSION') {
      actionText = `DEALERS EXPANDING RISK - Increase allocation as dealers add $${this.totalPositions.toFixed(1)}T exposure`;
    } else if (this.regime === 'CONTRACTION') {
      actionText = `DEALERS REDUCING RISK - Defensive positioning as dealer capacity drops to ${this.riskCapacity.toFixed(1)}%`;
    } else {
      actionText = `DEALERS NEUTRAL - Monitor $${this.totalPositions.toFixed(1)}T positions for regime change signals`;
    }
    
    return {
      actionText,
      signalStrength: Math.round(signalStrength),
      marketAction,
      confidence,
      timeframe: this.regime === 'EXPANSION' || this.regime === 'CONTRACTION' ? 'MEDIUM_TERM' : 'SHORT_TERM'
    };
  }

  getDashboardData(): DashboardTileData {
    const getColor = (): 'teal' | 'orange' | 'gold' | 'lime' | 'fuchsia' => {
      switch (this.regime) {
        case 'EXPANSION': return 'teal';
        case 'CONTRACTION': return 'orange';
        case 'NEUTRAL': return 'gold';
        default: return 'gold';
      }
    };

    const getStatus = (): 'normal' | 'warning' | 'critical' => {
      if (this.liquidityStress > 0.25 || this.riskCapacity < 65) return 'critical';
      if (this.leverageRatio > 4.0 || this.riskCapacity < 75) return 'warning';
      return 'normal';
    };

    const getTrend = (): 'up' | 'down' | 'neutral' => {
      if (this.regime === 'EXPANSION') return 'up';
      if (this.regime === 'CONTRACTION') return 'down';
      return 'neutral';
    };

    return {
      title: 'PRIMARY DEALER POSITIONS',
      primaryMetric: `$${this.totalPositions.toFixed(3)}T`,
      secondaryMetric: `${this.regime} | ${this.riskCapacity.toFixed(1)}% CAPACITY`,
      status: getStatus(),
      trend: getTrend(),
      color: getColor(),
      actionText: this.regime === 'EXPANSION' ? 'DEALERS EXPANDING RISK' : 
                  this.regime === 'CONTRACTION' ? 'DEALERS REDUCING EXPOSURE' : 'NEUTRAL POSITIONING'
    };
  }

  getDetailedView(): DetailedEngineView {
    return {
      title: 'Primary Dealer Positions Engine V6 - Market Making Analysis',
      primarySection: {
        title: 'Current Position Status',
        metrics: {
          'Total Positions': `$${this.totalPositions.toFixed(3)}T`,
          'Regime': this.regime,
          'Risk Capacity': `${this.riskCapacity.toFixed(1)}%`,
          'Confidence': `${this.confidence}%`
        }
      },
      sections: [
        {
          title: 'Position Breakdown',
          metrics: {
            'Treasury Securities': `$${this.treasuryPositions.toFixed(3)}T`,
            'Agency Debt': `$${this.agencyPositions.toFixed(3)}T`,
            'Mortgage Securities': `$${this.mortgagePositions.toFixed(3)}T`,
            'Corporate Bonds': `$${this.corporatePositions.toFixed(3)}T`
          }
        },
        {
          title: 'Risk Metrics',
          metrics: {
            'Leverage Ratio': this.leverageRatio.toFixed(2),
            'Liquidity Stress': `${(this.liquidityStress * 100).toFixed(1)}%`,
            'Position Velocity': `${this.positionVelocity.toFixed(1)}x`,
            'Market Signal': this.getMarketSignal().toUpperCase()
          }
        }
      ]
    };
  }
}