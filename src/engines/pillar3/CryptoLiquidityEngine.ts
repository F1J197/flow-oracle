/**
 * Crypto Liquidity Engine
 * Monitors liquidity conditions across cryptocurrency markets
 */

import { ResilientBaseEngine } from '../ResilientBaseEngine';
import { EngineReport, ActionableInsight, DashboardTileData, DetailedEngineView, IntelligenceViewData, DetailedModalData } from '@/types/engines';
import UniversalDataService from '@/services/UniversalDataService';

export class CryptoLiquidityEngine extends ResilientBaseEngine {
  readonly category = 'core' as const;
  readonly id = 'crypto-liquidity';
  readonly name = 'Crypto Liquidity Monitor';
  readonly priority = 300;
  readonly pillar = 3 as const;

  private liquidityScore: number = 0;
  private btcPrice: number = 0;
  private totalVolume: number = 0;
  private defiTvl: number = 0;
  private lastValidation: Date = new Date();

  constructor() {
    super({
      refreshInterval: 30000, // 30 seconds for crypto data
      maxRetries: 3,
      timeout: 15000,
      cacheTimeout: 45000,
      gracefulDegradation: true
    });
  }

  protected async performExecution(): Promise<EngineReport> {
    const cryptoService = UniversalDataService.getInstance();
    
    try {
      // Fetch crypto market data
      const [btcPrice, defiMetrics, onChainMetrics] = await Promise.all([
        cryptoService.getRealtimeBTCPrice(),
        cryptoService.getDeFiMetrics(),
        cryptoService.getOnChainMetrics()
      ]);

      // Update internal state
      this.btcPrice = btcPrice;
      this.totalVolume = onChainMetrics.transactionCount;
      this.defiTvl = defiMetrics.totalValueLocked;
      
      // Calculate liquidity score (0-100)
      this.liquidityScore = this.calculateLiquidityScore(btcPrice, defiMetrics, onChainMetrics);
      this.lastValidation = new Date();

      return {
        success: true,
        confidence: this.calculateConfidence(),
        signal: this.getSignal(),
        data: {
          liquidityScore: this.liquidityScore,
          btcPrice: this.btcPrice,
          totalVolume: this.totalVolume,
          defiTvl: this.defiTvl,
          marketCondition: this.getMarketCondition()
        },
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('CryptoLiquidityEngine execution failed:', error);
      throw error;
    }
  }

  private calculateLiquidityScore(btcPrice: number, defiMetrics: any, onChainMetrics: any): number {
    // Simple liquidity scoring based on price stability, TVL, and on-chain activity
    const priceScore = btcPrice > 40000 ? 80 : 60; // Basic price stability check
    const tvlScore = Math.min(this.defiTvl / 20000000000 * 100, 100); // Normalize TVL
    const activityScore = Math.min(onChainMetrics.activeAddresses / 800000 * 100, 100); // Normalize activity

    return (priceScore * 0.3 + tvlScore * 0.4 + activityScore * 0.3);
  }

  private calculateConfidence(): number {
    const dataAge = Date.now() - this.lastValidation.getTime();
    const maxAge = 60000; // 1 minute
    return Math.max(0, 1 - (dataAge / maxAge)) * 100;
  }

  private getSignal(): 'bullish' | 'bearish' | 'neutral' {
    if (this.liquidityScore > 75) return 'bullish';
    if (this.liquidityScore < 40) return 'bearish';
    return 'neutral';
  }

  private getMarketCondition(): string {
    if (this.liquidityScore > 80) return 'High Liquidity';
    if (this.liquidityScore > 60) return 'Normal Liquidity';
    if (this.liquidityScore > 40) return 'Reduced Liquidity';
    return 'Low Liquidity';
  }

  getSingleActionableInsight(): ActionableInsight {
    const condition = this.getMarketCondition();
    
    if (this.liquidityScore > 75) {
      return {
        actionText: 'Crypto markets showing high liquidity - favorable for large positions',
        signalStrength: Math.round(this.liquidityScore),
        marketAction: 'BUY',
        confidence: 'HIGH',
        timeframe: 'SHORT_TERM'
      };
    } else if (this.liquidityScore < 40) {
      return {
        actionText: 'Low crypto liquidity detected - exercise caution with position sizing',
        signalStrength: Math.round(100 - this.liquidityScore),
        marketAction: 'WAIT',
        confidence: 'HIGH',
        timeframe: 'IMMEDIATE'
      };
    }

    return {
      actionText: `${condition} - monitor for changes`,
      signalStrength: Math.round(this.liquidityScore),
      marketAction: 'HOLD',
      confidence: 'MED',
      timeframe: 'SHORT_TERM'
    };
  }

  getDashboardData(): DashboardTileData {
    return {
      title: 'Crypto Liquidity',
      primaryMetric: `${this.liquidityScore.toFixed(1)}%`,
      secondaryMetric: `$${(this.defiTvl / 1e9).toFixed(1)}B TVL`,
      status: this.liquidityScore > 60 ? 'normal' : this.liquidityScore > 40 ? 'warning' : 'critical',
      trend: this.getSignal() === 'bullish' ? 'up' : this.getSignal() === 'bearish' ? 'down' : 'neutral',
      actionText: this.getSingleActionableInsight().actionText,
      color: this.liquidityScore > 60 ? 'success' : this.liquidityScore > 40 ? 'warning' : 'critical',
      loading: false
    };
  }

  getDetailedView(): DetailedEngineView {
    return {
      title: this.name,
      primarySection: {
        title: 'Liquidity Overview',
        metrics: {
          'Liquidity Score': `${this.liquidityScore.toFixed(1)}%`,
          'Market Condition': this.getMarketCondition(),
          'BTC Price': `$${this.btcPrice.toLocaleString()}`,
          'Total DeFi TVL': `$${(this.defiTvl / 1e9).toFixed(1)}B`
        }
      },
      sections: [
        {
          title: 'Market Metrics',
          metrics: {
            'BTC Volume': `$${(this.totalVolume / 1e9).toFixed(1)}B`,
            'Liquidity Signal': this.getSignal().toUpperCase(),
            'Data Freshness': `${Math.round((Date.now() - this.lastValidation.getTime()) / 1000)}s ago`
          }
        }
      ],
      alerts: this.generateAlerts()
    };
  }

  private generateAlerts() {
    const alerts = [];
    
    if (this.liquidityScore < 30) {
      alerts.push({
        severity: 'critical' as const,
        message: 'Crypto liquidity extremely low - high slippage risk'
      });
    } else if (this.liquidityScore < 50) {
      alerts.push({
        severity: 'warning' as const,
        message: 'Reduced crypto liquidity - monitor position sizes'
      });
    }

    if (this.liquidityScore > 85) {
      alerts.push({
        severity: 'info' as const,
        message: 'Excellent liquidity conditions for crypto trading'
      });
    }

    return alerts;
  }

  getIntelligenceView(): IntelligenceViewData {
    return {
      title: this.name,
      status: this.liquidityScore > 60 ? 'active' : this.liquidityScore > 40 ? 'warning' : 'critical',
      primaryMetrics: {
        'Liquidity Score': {
          value: `${this.liquidityScore.toFixed(1)}%`,
          label: 'Overall Score',
          status: this.liquidityScore > 60 ? 'normal' : this.liquidityScore > 40 ? 'warning' : 'critical',
          trend: this.getSignal() === 'bullish' ? 'up' : this.getSignal() === 'bearish' ? 'down' : 'neutral'
        },
        'DeFi TVL': {
          value: `$${(this.defiTvl / 1e9).toFixed(1)}B`,
          label: 'Total Value Locked',
          status: 'normal'
        }
      },
      sections: [
        {
          title: 'Market Data',
          data: {
            'BTC Price': {
              value: `$${this.btcPrice.toLocaleString()}`,
              label: 'Bitcoin Price',
              unit: 'USD'
            },
            'Volume': {
              value: `$${(this.totalVolume / 1e9).toFixed(1)}B`,
              label: '24h Volume',
              unit: 'USD'
            },
            'Condition': {
              value: this.getMarketCondition(),
              label: 'Market State'
            }
          }
        }
      ],
      alerts: this.generateAlerts(),
      confidence: this.calculateConfidence(),
      lastUpdate: this.lastValidation
    };
  }

  getDetailedModal(): DetailedModalData {
    return {
      title: 'Crypto Liquidity Analysis',
      description: 'Comprehensive analysis of liquidity conditions across cryptocurrency markets, including DeFi protocols and on-chain metrics.',
      keyInsights: [
        `Liquidity score: ${this.liquidityScore.toFixed(1)}% indicating ${this.getMarketCondition().toLowerCase()}`,
        `DeFi ecosystem holds $${(this.defiTvl / 1e9).toFixed(1)}B in total value locked`,
        `Current market signal: ${this.getSignal().toUpperCase()}`
      ],
      detailedMetrics: [
        {
          category: 'Liquidity Assessment',
          metrics: {
            'Overall Score': {
              value: `${this.liquidityScore.toFixed(1)}%`,
              description: 'Composite liquidity score based on volume, TVL, and activity',
              significance: this.liquidityScore > 70 ? 'high' : this.liquidityScore > 40 ? 'medium' : 'low'
            },
            'Market Condition': {
              value: this.getMarketCondition(),
              description: 'Current liquidity state classification',
              significance: 'high'
            }
          }
        },
        {
          category: 'Market Data',
          metrics: {
            'BTC Price': {
              value: `$${this.btcPrice.toLocaleString()}`,
              description: 'Current Bitcoin price from Coinbase',
              significance: 'medium'
            },
            'DeFi TVL': {
              value: `$${(this.defiTvl / 1e9).toFixed(1)}B`,
              description: 'Total value locked across major DeFi protocols',
              significance: 'high'
            }
          }
        }
      ],
      actionItems: [
        {
          priority: this.liquidityScore < 40 ? 'high' : 'medium',
          action: this.liquidityScore < 40 ? 'Reduce position sizes due to low liquidity' : 'Monitor liquidity conditions',
          timeframe: 'Immediate'
        }
      ]
    };
  }
}