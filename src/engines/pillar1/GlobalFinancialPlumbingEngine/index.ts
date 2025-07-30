/**
 * Global Financial Plumbing Engine - Pillar 1
 * Monitors international dollar funding markets, cross-currency basis swaps, and Fed swap lines
 */

export { GlobalFinancialPlumbingEngine } from './GlobalFinancialPlumbingEngine';
export { GlobalPlumbingTile } from './DashboardTile';
export { GlobalPlumbingIntelligence } from './IntelligenceView';

// Types for Global Financial Plumbing Engine
export interface GlobalPlumbingMetrics {
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