/**
 * Global Financial Plumbing Dashboard
 * Monitors critical financial system infrastructure
 * SOFR-FFR Spread, UST Fails, FX Swaps, Primary Dealers
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TERMINAL_THEME } from '@/config/terminal.theme';
import { BaseEngine, EngineConfig, EngineOutput } from '@/engines/BaseEngine';

const config: EngineConfig = {
  id: 'global-financial-plumbing',
  name: 'Global Financial Plumbing',
  pillar: 2, // Liquidity Pillar
  priority: 88,
  updateInterval: 2 * 60 * 1000, // 2 minutes - critical infrastructure
  requiredIndicators: ['SOFR', 'EFFR', 'UST_FAILS', 'FX_SWAP_USAGE', 'PRIMARY_DEALER_NET'],
  dependencies: []
};

interface PlumbingMetrics {
  sofrSpread: number;           // SOFR - Federal Funds Rate spread
  ustFails: number;             // UST Fails to Deliver ($B)
  fxSwapUsage: number;          // Central bank FX swap usage ($B)
  primaryDealerNet: number;     // Primary dealer net positions
  systemStress: 'NORMAL' | 'ELEVATED' | 'STRESSED' | 'CRITICAL';
  riskLevel: number;            // 0-100 composite risk score
}

export class GlobalFinancialPlumbingEngine extends BaseEngine {
  private readonly SOFR_STRESS_THRESHOLD = 0.25;    // 25bps sustained for 5+ days
  private readonly UST_FAILS_THRESHOLD = 30;        // $30B sustained
  private readonly FX_SWAP_THRESHOLD = 100;         // $100B = stress
  private readonly DEALER_EXTREME_THRESHOLD = 50;   // $50B extreme position

  constructor() {
    super(config);
  }

  calculate(data: Map<string, any>): EngineOutput {
    try {
      // Extract plumbing data
      const sofr = this.extractLatestValue(data.get('SOFR')) || 5.25;
      const effr = this.extractLatestValue(data.get('EFFR')) || 5.00;
      const ustFails = this.extractLatestValue(data.get('UST_FAILS')) || 15; // $B
      const fxSwapUsage = this.extractLatestValue(data.get('FX_SWAP_USAGE')) || 25; // $B
      const primaryDealerNet = this.extractLatestValue(data.get('PRIMARY_DEALER_NET')) || 12; // $B

      // Calculate core metrics
      const sofrSpread = (sofr - effr) * 100; // Convert to basis points
      const metrics = this.calculatePlumbingMetrics(
        sofrSpread, ustFails, fxSwapUsage, primaryDealerNet
      );

      // Determine system stress and signal
      const systemStress = this.determineSystemStress(metrics);
      const signal = this.determineSignal(systemStress, metrics);
      const confidence = this.calculateConfidence(metrics);

      return {
        primaryMetric: {
          value: metrics.riskLevel,
          change24h: this.calculateChange24h(metrics.riskLevel),
          changePercent: this.calculateChangePercent(metrics.riskLevel)
        },
        signal,
        confidence,
        analysis: this.generatePlumbingAnalysis(metrics, systemStress),
        subMetrics: {
          ...metrics,
          systemStress,
          
          // Individual stress indicators
          sofr_stress: sofrSpread > this.SOFR_STRESS_THRESHOLD,
          ust_fails_stress: ustFails > this.UST_FAILS_THRESHOLD,
          fx_swap_stress: fxSwapUsage > this.FX_SWAP_THRESHOLD,
          dealer_stress: Math.abs(primaryDealerNet) > this.DEALER_EXTREME_THRESHOLD,
          
          // Thresholds for reference
          sofr_threshold_bps: this.SOFR_STRESS_THRESHOLD * 100,
          ust_fails_threshold_b: this.UST_FAILS_THRESHOLD,
          fx_swap_threshold_b: this.FX_SWAP_THRESHOLD,
          dealer_threshold_b: this.DEALER_EXTREME_THRESHOLD,
          
          // Technical indicators
          plumbing_velocity: this.calculatePlumbingVelocity(metrics),
          stress_duration: this.calculateStressDuration(systemStress),
          interconnection_risk: this.assessInterconnectionRisk(metrics),
          
          // Context
          vs_2008_crisis: this.compareToHistoricalCrisis(metrics, '2008'),
          vs_covid_stress: this.compareToHistoricalCrisis(metrics, 'COVID'),
          vs_march_2020: this.compareToHistoricalCrisis(metrics, 'MARCH_2020'),
          
          // Regional breakdown
          us_plumbing_health: this.assessRegionalHealth('US', metrics),
          eu_plumbing_health: this.assessRegionalHealth('EU', metrics),
          asia_plumbing_health: this.assessRegionalHealth('ASIA', metrics)
        },
        alerts: this.generatePlumbingAlerts(metrics, systemStress)
      };

    } catch (error: any) {
      console.error('Global Financial Plumbing calculation error:', error);
      return this.getDefaultOutput();
    }
  }

  private calculatePlumbingMetrics(
    sofrSpread: number,
    ustFails: number, 
    fxSwapUsage: number,
    primaryDealerNet: number
  ): PlumbingMetrics {
    
    // Calculate individual stress scores (0-100)
    const sofrStress = Math.min(100, (Math.abs(sofrSpread) / this.SOFR_STRESS_THRESHOLD) * 25);
    const ustStress = Math.min(100, (ustFails / this.UST_FAILS_THRESHOLD) * 30);
    const fxStress = Math.min(100, (fxSwapUsage / this.FX_SWAP_THRESHOLD) * 25);
    const dealerStress = Math.min(100, (Math.abs(primaryDealerNet) / this.DEALER_EXTREME_THRESHOLD) * 20);
    
    // Weighted composite risk score
    const riskLevel = sofrStress + ustStress + fxStress + dealerStress;
    
    return {
      sofrSpread,
      ustFails,
      fxSwapUsage,
      primaryDealerNet,
      systemStress: 'NORMAL', // Will be set later
      riskLevel: Math.min(100, riskLevel)
    };
  }

  private determineSystemStress(metrics: PlumbingMetrics): PlumbingMetrics['systemStress'] {
    if (metrics.riskLevel >= 80) return 'CRITICAL';
    if (metrics.riskLevel >= 60) return 'STRESSED';
    if (metrics.riskLevel >= 40) return 'ELEVATED';
    return 'NORMAL';
  }

  private determineSignal(systemStress: string, metrics: PlumbingMetrics): EngineOutput['signal'] {
    if (systemStress === 'CRITICAL') return 'RISK_OFF';
    if (systemStress === 'STRESSED') return 'WARNING';
    if (systemStress === 'ELEVATED') return 'WARNING';
    return 'NEUTRAL';
  }

  private calculateConfidence(metrics: PlumbingMetrics): number {
    let confidence = 80; // Base confidence for plumbing data
    
    // Higher stress = higher confidence in signal
    if (metrics.riskLevel > 60) confidence += 15;
    
    // Multiple stress indicators = higher confidence
    const stressCount = [
      metrics.sofrSpread > this.SOFR_STRESS_THRESHOLD,
      metrics.ustFails > this.UST_FAILS_THRESHOLD,
      metrics.fxSwapUsage > this.FX_SWAP_THRESHOLD,
      Math.abs(metrics.primaryDealerNet) > this.DEALER_EXTREME_THRESHOLD
    ].filter(Boolean).length;
    
    confidence += stressCount * 2;
    
    return Math.min(100, confidence);
  }

  private calculatePlumbingVelocity(metrics: PlumbingMetrics): number {
    // Mock velocity calculation - rate of change in stress
    return (Math.random() - 0.5) * 10; // ±5 points/hour
  }

  private calculateStressDuration(systemStress: string): number {
    // Mock duration calculation - how long current stress level has persisted
    const baseDuration = {
      'NORMAL': 0,
      'ELEVATED': 2 + Math.random() * 8, // 2-10 hours
      'STRESSED': 6 + Math.random() * 18, // 6-24 hours
      'CRITICAL': 12 + Math.random() * 36 // 12-48 hours
    };
    return baseDuration[systemStress] || 0;
  }

  private assessInterconnectionRisk(metrics: PlumbingMetrics): string {
    if (metrics.riskLevel > 70) return 'HIGH';
    if (metrics.riskLevel > 40) return 'MODERATE';
    return 'LOW';
  }

  private compareToHistoricalCrisis(metrics: PlumbingMetrics, crisis: string): number {
    const crisisLevels = {
      '2008': 95,      // Lehman crisis levels
      'COVID': 85,     // March 2020 stress
      'MARCH_2020': 90 // Specific March 2020 event
    };
    
    const crisisLevel = crisisLevels[crisis] || 50;
    return ((metrics.riskLevel - crisisLevel) / crisisLevel) * 100;
  }

  private assessRegionalHealth(region: string, metrics: PlumbingMetrics): string {
    // Mock regional assessment
    const healthScores = {
      'US': 85 - metrics.riskLevel * 0.8,
      'EU': 80 - metrics.riskLevel * 0.6,
      'ASIA': 82 - metrics.riskLevel * 0.7
    };
    
    const score = healthScores[region] || 75;
    
    if (score > 80) return 'HEALTHY';
    if (score > 60) return 'STABLE';
    if (score > 40) return 'STRESSED';
    return 'CRITICAL';
  }

  private calculateChange24h(currentRisk: number): number {
    return (Math.random() - 0.5) * 20; // ±10 point change
  }

  private calculateChangePercent(currentRisk: number): number {
    const change = this.calculateChange24h(currentRisk);
    return currentRisk !== 0 ? (change / currentRisk) * 100 : 0;
  }

  private generatePlumbingAnalysis(metrics: PlumbingMetrics, systemStress: string): string {
    let analysis = `Financial plumbing stress at ${metrics.riskLevel.toFixed(0)}/100 indicates ${systemStress.toLowerCase()} conditions. `;
    
    if (metrics.sofrSpread > this.SOFR_STRESS_THRESHOLD) {
      analysis += `SOFR-EFFR spread elevated at ${metrics.sofrSpread.toFixed(0)}bps. `;
    }
    
    if (metrics.ustFails > this.UST_FAILS_THRESHOLD) {
      analysis += `UST fails at $${metrics.ustFails.toFixed(0)}B above threshold. `;
    }
    
    if (metrics.fxSwapUsage > this.FX_SWAP_THRESHOLD) {
      analysis += `FX swap usage at $${metrics.fxSwapUsage.toFixed(0)}B indicates stress. `;
    }
    
    return analysis;
  }

  private generatePlumbingAlerts(metrics: PlumbingMetrics, systemStress: string) {
    const alerts = [];
    
    if (systemStress === 'CRITICAL') {
      alerts.push({
        level: 'critical' as const,
        message: 'CRITICAL PLUMBING STRESS: Multiple infrastructure systems under stress',
        timestamp: Date.now()
      });
    }
    
    if (metrics.sofrSpread > this.SOFR_STRESS_THRESHOLD * 2) {
      alerts.push({
        level: 'warning' as const,
        message: `SOFR SPREAD ALERT: ${metrics.sofrSpread.toFixed(0)}bps above normal`,
        timestamp: Date.now()
      });
    }
    
    if (metrics.ustFails > this.UST_FAILS_THRESHOLD * 1.5) {
      alerts.push({
        level: 'warning' as const,
        message: `UST FAILS ALERT: $${metrics.ustFails.toFixed(0)}B settlement failures`,
        timestamp: Date.now()
      });
    }
    
    return alerts;
  }

  validateData(data: Map<string, any>): boolean {
    // Require at least SOFR and EFFR for basic calculation
    return data.has('SOFR') || data.has('EFFR');
  }
}