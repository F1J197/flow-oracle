import { ResilientBaseEngine } from '../../ResilientBaseEngine';
import { EngineReport, ActionableInsight, DashboardTileData, IntelligenceViewData, DetailedModalData, DetailedEngineView } from '@/types/engines';
import UniversalDataService from '@/services/UniversalDataService';

interface GlobalPlumbingMetrics {
  crossCurrencyBasisSwaps: {
    usdEur: number;
    usdJpy: number;
    usdGbp: number;
    status: 'normal' | 'stressed' | 'crisis';
  };
  fedSwapLines: {
    totalOutstanding: number;
    utilizationRate: number;
    activeCounterparties: number;
    status: 'normal' | 'elevated' | 'critical';
  };
  dollarFunding: {
    liborOisSpread: number;
    cd3mSpread: number;
    eurodollarFutures: number;
    stress: 'low' | 'moderate' | 'high' | 'extreme';
  };
  globalLiquidity: {
    aggregateStress: number;
    systemicRisk: 'low' | 'moderate' | 'high' | 'critical';
    plumbingEfficiency: number;
  };
}

export class GlobalFinancialPlumbingEngine extends ResilientBaseEngine {
  public readonly id = 'global-financial-plumbing';
  public readonly name = 'Global Financial Plumbing';
  public readonly priority = 85;
  public readonly pillar = 1 as const;
  public readonly category = 'core' as const;

  private dataService = UniversalDataService.getInstance();
  private lastMetrics: GlobalPlumbingMetrics | null = null;

  protected async performExecution(): Promise<EngineReport> {
    try {
      const metrics = await this.calculateGlobalPlumbingMetrics();
      this.lastMetrics = metrics;

      const confidence = this.calculateConfidence(metrics);
      const signal = this.determineSignal(metrics);

      return {
        success: true,
        confidence,
        signal,
        data: metrics,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('[GlobalFinancialPlumbingEngine] Execution failed:', error);
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

  private async calculateGlobalPlumbingMetrics(): Promise<GlobalPlumbingMetrics> {
    // Cross-Currency Basis Swaps
    const basisSwaps = await this.calculateBasisSwaps();
    
    // Fed Swap Lines
    const swapLines = await this.calculateFedSwapLines();
    
    // Dollar Funding Stress
    const dollarFunding = await this.calculateDollarFundingStress();
    
    // Aggregate Global Liquidity Assessment
    const globalLiquidity = this.calculateGlobalLiquidityStress(basisSwaps, swapLines, dollarFunding);

    return {
      crossCurrencyBasisSwaps: basisSwaps,
      fedSwapLines: swapLines,
      dollarFunding,
      globalLiquidity
    };
  }

  private async calculateBasisSwaps() {
    // Mock implementation - in production, fetch from real data sources
    const usdEur = Math.random() * 40 - 20; // -20 to +20 bps
    const usdJpy = Math.random() * 30 - 15; // -15 to +15 bps
    const usdGbp = Math.random() * 35 - 17.5; // -17.5 to +17.5 bps

    const avgStress = Math.abs(usdEur) + Math.abs(usdJpy) + Math.abs(usdGbp);
    let status: 'normal' | 'stressed' | 'crisis';
    
    if (avgStress < 15) status = 'normal';
    else if (avgStress < 30) status = 'stressed';
    else status = 'crisis';

    return { usdEur, usdJpy, usdGbp, status };
  }

  private async calculateFedSwapLines() {
    // Mock implementation
    const totalOutstanding = Math.random() * 500; // $0-500B
    const utilizationRate = Math.random() * 100; // 0-100%
    const activeCounterparties = Math.floor(Math.random() * 15) + 1; // 1-15

    let status: 'normal' | 'elevated' | 'critical';
    if (utilizationRate < 20) status = 'normal';
    else if (utilizationRate < 50) status = 'elevated';
    else status = 'critical';

    return { totalOutstanding, utilizationRate, activeCounterparties, status };
  }

  private async calculateDollarFundingStress() {
    // Mock implementation
    const liborOisSpread = Math.random() * 100 + 10; // 10-110 bps
    const cd3mSpread = Math.random() * 80 + 5; // 5-85 bps
    const eurodollarFutures = Math.random() * 150 + 50; // 50-200 bps

    const avgStress = (liborOisSpread + cd3mSpread + eurodollarFutures) / 3;
    
    let stress: 'low' | 'moderate' | 'high' | 'extreme';
    if (avgStress < 40) stress = 'low';
    else if (avgStress < 70) stress = 'moderate';
    else if (avgStress < 100) stress = 'high';
    else stress = 'extreme';

    return { liborOisSpread, cd3mSpread, eurodollarFutures, stress };
  }

  private calculateGlobalLiquidityStress(basisSwaps: any, swapLines: any, dollarFunding: any) {
    // Aggregate stress calculation
    let stressScore = 0;
    
    // Basis swaps stress
    if (basisSwaps.status === 'stressed') stressScore += 30;
    else if (basisSwaps.status === 'crisis') stressScore += 60;
    
    // Swap lines stress
    if (swapLines.status === 'elevated') stressScore += 20;
    else if (swapLines.status === 'critical') stressScore += 40;
    
    // Dollar funding stress
    if (dollarFunding.stress === 'moderate') stressScore += 15;
    else if (dollarFunding.stress === 'high') stressScore += 30;
    else if (dollarFunding.stress === 'extreme') stressScore += 50;

    const aggregateStress = Math.min(stressScore, 100);
    
    let systemicRisk: 'low' | 'moderate' | 'high' | 'critical';
    if (aggregateStress < 25) systemicRisk = 'low';
    else if (aggregateStress < 50) systemicRisk = 'moderate';
    else if (aggregateStress < 75) systemicRisk = 'high';
    else systemicRisk = 'critical';

    const plumbingEfficiency = Math.max(0, 100 - aggregateStress);

    return { aggregateStress, systemicRisk, plumbingEfficiency };
  }

  private calculateConfidence(metrics: GlobalPlumbingMetrics): number {
    // Base confidence on data availability and consistency
    let confidence = 85;
    
    if (metrics.globalLiquidity.systemicRisk === 'critical') confidence -= 15;
    if (metrics.dollarFunding.stress === 'extreme') confidence -= 10;
    
    return Math.max(confidence, 60);
  }

  private determineSignal(metrics: GlobalPlumbingMetrics): 'bullish' | 'bearish' | 'neutral' {
    const { globalLiquidity, dollarFunding, crossCurrencyBasisSwaps } = metrics;
    
    if (globalLiquidity.systemicRisk === 'critical' || dollarFunding.stress === 'extreme') {
      return 'bearish';
    }
    
    if (globalLiquidity.systemicRisk === 'low' && crossCurrencyBasisSwaps.status === 'normal') {
      return 'bullish';
    }
    
    return 'neutral';
  }

  public getSingleActionableInsight(): ActionableInsight {
    if (!this.lastMetrics) {
      return {
        actionText: "Monitor global dollar funding conditions",
        signalStrength: 50,
        marketAction: 'HOLD',
        confidence: 'MED',
        timeframe: 'MEDIUM_TERM'
      };
    }

    const { globalLiquidity, dollarFunding } = this.lastMetrics;
    
    if (globalLiquidity.systemicRisk === 'critical') {
      return {
        actionText: "Critical plumbing stress detected - defensive positioning",
        signalStrength: 85,
        marketAction: 'SELL',
        confidence: 'HIGH',
        timeframe: 'IMMEDIATE'
      };
    }
    
    if (dollarFunding.stress === 'low' && globalLiquidity.plumbingEfficiency > 80) {
      return {
        actionText: "Healthy plumbing supports risk assets",
        signalStrength: 75,
        marketAction: 'BUY',
        confidence: 'HIGH',
        timeframe: 'SHORT_TERM'
      };
    }

    return {
      actionText: "Monitor cross-currency funding spreads",
      signalStrength: 60,
      marketAction: 'HOLD',
      confidence: 'MED',
      timeframe: 'MEDIUM_TERM'
    };
  }

  public getDashboardData(): DashboardTileData {
    if (!this.lastMetrics) {
      return {
        title: "Global Financial Plumbing",
        primaryMetric: "Loading...",
        status: 'normal',
        loading: true
      };
    }

    const { globalLiquidity } = this.lastMetrics;
    const efficiency = globalLiquidity.plumbingEfficiency;
    
    return {
      title: "Global Financial Plumbing",
      primaryMetric: `${efficiency.toFixed(1)}%`,
      secondaryMetric: `Risk: ${globalLiquidity.systemicRisk.toUpperCase()}`,
      status: globalLiquidity.systemicRisk === 'critical' ? 'critical' : 
              globalLiquidity.systemicRisk === 'high' ? 'warning' : 'normal',
      trend: efficiency > 75 ? 'up' : efficiency < 50 ? 'down' : 'neutral',
      actionText: `Plumbing efficiency at ${efficiency.toFixed(1)}%`,
      color: globalLiquidity.systemicRisk === 'critical' ? 'critical' : 
             globalLiquidity.systemicRisk === 'high' ? 'warning' : 'success'
    };
  }

  public getIntelligenceView(): IntelligenceViewData {
    if (!this.lastMetrics) {
      return {
        title: "Global Financial Plumbing",
        status: 'offline',
        primaryMetrics: {},
        sections: [],
        confidence: 0,
        lastUpdate: new Date()
      };
    }

    const { crossCurrencyBasisSwaps, fedSwapLines, dollarFunding, globalLiquidity } = this.lastMetrics;

    return {
      title: "Global Financial Plumbing",
      status: globalLiquidity.systemicRisk === 'critical' ? 'critical' : 
              globalLiquidity.systemicRisk === 'high' ? 'warning' : 'active',
      primaryMetrics: {
        efficiency: {
          value: `${globalLiquidity.plumbingEfficiency.toFixed(1)}%`,
          label: "Plumbing Efficiency",
          status: globalLiquidity.plumbingEfficiency > 75 ? 'normal' : 'warning'
        },
        systemicRisk: {
          value: globalLiquidity.systemicRisk.toUpperCase(),
          label: "Systemic Risk",
          status: globalLiquidity.systemicRisk === 'critical' ? 'critical' : 'normal'
        }
      },
      sections: [
        {
          title: "Cross-Currency Basis Swaps",
          data: {
            usdEur: { value: `${crossCurrencyBasisSwaps.usdEur.toFixed(1)} bps`, label: "USD/EUR", unit: "bps" },
            usdJpy: { value: `${crossCurrencyBasisSwaps.usdJpy.toFixed(1)} bps`, label: "USD/JPY", unit: "bps" },
            usdGbp: { value: `${crossCurrencyBasisSwaps.usdGbp.toFixed(1)} bps`, label: "USD/GBP", unit: "bps" },
            status: { value: crossCurrencyBasisSwaps.status.toUpperCase(), label: "Status" }
          }
        },
        {
          title: "Fed Swap Lines",
          data: {
            outstanding: { value: `$${fedSwapLines.totalOutstanding.toFixed(0)}B`, label: "Outstanding", unit: "USD" },
            utilization: { value: `${fedSwapLines.utilizationRate.toFixed(1)}%`, label: "Utilization Rate", unit: "%" },
            counterparties: { value: fedSwapLines.activeCounterparties, label: "Active Counterparties" }
          }
        },
        {
          title: "Dollar Funding Stress",
          data: {
            liborOis: { value: `${dollarFunding.liborOisSpread.toFixed(1)} bps`, label: "LIBOR-OIS", unit: "bps" },
            cd3m: { value: `${dollarFunding.cd3mSpread.toFixed(1)} bps`, label: "CD 3M Spread", unit: "bps" },
            stress: { value: dollarFunding.stress.toUpperCase(), label: "Stress Level" }
          }
        }
      ],
      confidence: this.calculateConfidence(this.lastMetrics),
      lastUpdate: new Date()
    };
  }

  public getDetailedModal(): DetailedModalData {
    return {
      title: "Global Financial Plumbing Engine",
      description: "Monitors the health of global financial infrastructure and cross-border dollar funding markets",
      keyInsights: [
        "Cross-currency basis swaps indicate dollar funding stress",
        "Fed swap lines usage reflects international dollar demand",
        "Dollar funding markets are critical for global liquidity",
        "Plumbing efficiency affects all risk asset classes"
      ],
      detailedMetrics: [
        {
          category: "Basis Swap Analysis",
          metrics: {
            methodology: {
              value: "Multi-currency basis swap monitoring",
              description: "Tracks USD basis vs EUR, JPY, GBP",
              significance: 'high'
            },
            interpretation: {
              value: "Negative basis = USD funding stress",
              description: "When basis < -10bps, indicates stress",
              significance: 'high'
            }
          }
        }
      ],
      actionItems: [
        {
          priority: 'high',
          action: "Monitor Fed swap line utilization",
          timeframe: "Daily"
        },
        {
          priority: 'medium', 
          action: "Track cross-currency basis spreads",
          timeframe: "Intraday"
        }
      ]
    };
  }

  public getDetailedView(): DetailedEngineView {
    if (!this.lastMetrics) {
      return {
        title: "Global Financial Plumbing",
        primarySection: { title: "Loading", metrics: {} },
        sections: []
      };
    }

    const { crossCurrencyBasisSwaps, fedSwapLines, dollarFunding, globalLiquidity } = this.lastMetrics;

    return {
      title: "Global Financial Plumbing Engine",
      primarySection: {
        title: "System Overview",
        metrics: {
          "Plumbing Efficiency": `${globalLiquidity.plumbingEfficiency.toFixed(1)}%`,
          "Systemic Risk": globalLiquidity.systemicRisk.toUpperCase(),
          "Aggregate Stress": `${globalLiquidity.aggregateStress.toFixed(0)}/100`
        }
      },
      sections: [
        {
          title: "Cross-Currency Basis Swaps",
          metrics: {
            "USD/EUR Basis": `${crossCurrencyBasisSwaps.usdEur.toFixed(1)} bps`,
            "USD/JPY Basis": `${crossCurrencyBasisSwaps.usdJpy.toFixed(1)} bps`,
            "USD/GBP Basis": `${crossCurrencyBasisSwaps.usdGbp.toFixed(1)} bps`,
            "Status": crossCurrencyBasisSwaps.status.toUpperCase()
          }
        },
        {
          title: "Fed Swap Lines",
          metrics: {
            "Total Outstanding": `$${fedSwapLines.totalOutstanding.toFixed(0)}B`,
            "Utilization Rate": `${fedSwapLines.utilizationRate.toFixed(1)}%`,
            "Active Counterparties": fedSwapLines.activeCounterparties.toString(),
            "Status": fedSwapLines.status.toUpperCase()
          }
        },
        {
          title: "Dollar Funding Markets", 
          metrics: {
            "LIBOR-OIS Spread": `${dollarFunding.liborOisSpread.toFixed(1)} bps`,
            "CD 3M Spread": `${dollarFunding.cd3mSpread.toFixed(1)} bps`,
            "Eurodollar Futures": `${dollarFunding.eurodollarFutures.toFixed(1)} bps`,
            "Stress Level": dollarFunding.stress.toUpperCase()
          }
        }
      ]
    };
  }
}