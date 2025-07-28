import { IEngine, DashboardTileData, DetailedEngineView, EngineReport } from "@/types/engines";
import { dataService } from "@/services/dataService";

export class CreditStressEngine implements IEngine {
  id = 'credit-stress';
  name = 'Credit Stress Engine';
  priority = 2;
  pillar = 1 as const;

  private spread = 239; // basis points
  private velocity = -2.1; // bps/day
  private category: 'low' | 'moderate' | 'high' | 'crisis' = 'low';
  private regime: 'QE' | 'QT' | 'neutral' = 'QE';
  private highWeek = 567;
  private lowWeek = 198;
  private percentileRank = 15;

  async execute(): Promise<EngineReport> {
    try {
      // Fetch credit spread data
      this.spread = await dataService.fetchFREDData('BAMLH0A0HYM2');

      // Determine category
      if (this.spread < 300) {
        this.category = 'low';
      } else if (this.spread < 500) {
        this.category = 'moderate';
      } else if (this.spread < 800) {
        this.category = 'high';
      } else {
        this.category = 'crisis';
      }

      // Determine regime signal
      if (this.spread < 400) {
        this.regime = 'QE';
      } else if (this.spread > 500) {
        this.regime = 'QT';
      } else {
        this.regime = 'neutral';
      }

      return {
        success: true,
        confidence: 0.85,
        signal: this.regime === 'QE' ? 'bullish' : this.regime === 'QT' ? 'bearish' : 'neutral',
        data: {
          spread: this.spread,
          category: this.category,
          regime: this.regime
        },
        lastUpdated: new Date()
      };
    } catch (error) {
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

  getDashboardData(): DashboardTileData {
    const getColor = () => {
      switch (this.category) {
        case 'low': return 'lime';
        case 'moderate': return 'teal';
        case 'high': return 'gold';
        case 'crisis': return 'orange';
      }
    };

    const getActionText = () => {
      switch (this.category) {
        case 'low': return 'QE SUPPORTIVE';
        case 'moderate': return 'NEUTRAL CONDITIONS';
        case 'high': return 'STRESS BUILDING';
        case 'crisis': return 'CRISIS MODE';
      }
    };

    return {
      title: 'CREDIT STRESS',
      primaryMetric: `${this.spread}bps`,
      status: this.category === 'crisis' ? 'critical' : this.category === 'high' ? 'warning' : 'normal',
      actionText: getActionText(),
      color: getColor()
    };
  }

  getDetailedView(): DetailedEngineView {
    return {
      title: 'CREDIT STRESS ENGINE',
      primarySection: {
        title: 'CREDIT CONDITIONS',
        metrics: {
          'Current Spread': `${this.spread}bps`,
          '30-Day Average': '245bps',
          'Spread Velocity': `${this.velocity}bps/day`,
          'Regime Signal': `${this.regime.toUpperCase()} SUPPORTIVE`
        }
      },
      sections: [
        {
          title: 'HISTORICAL CONTEXT',
          metrics: {
            '52-Week High': `${this.highWeek}bps`,
            '52-Week Low': `${this.lowWeek}bps`,
            'Percentile Rank': `${this.percentileRank}th`
          }
        },
        {
          title: 'DIVERGENCE ANALYSIS',
          metrics: {
            'Credit vs Equity': 'ALIGNED',
            'Credit vs Rates': 'MINOR DIVERGENCE',
            'Signal Strength': '78%'
          }
        }
      ]
    };
  }
}