import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface GlobalPlumbingIntelligenceProps {
  efficiency: number;
  systemicRisk: 'low' | 'moderate' | 'high' | 'critical';
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
  confidence: number;
  lastUpdate: Date;
  className?: string;
}

export const GlobalPlumbingIntelligence: React.FC<GlobalPlumbingIntelligenceProps> = ({
  efficiency,
  systemicRisk,
  crossCurrencyBasisSwaps,
  fedSwapLines,
  dollarFunding,
  confidence,
  lastUpdate,
  className
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
      case 'crisis':
      case 'extreme':
        return 'text-neon-orange';
      case 'high':
      case 'stressed':
      case 'elevated':
        return 'text-neon-gold';
      case 'moderate':
        return 'text-neon-teal';
      default:
        return 'text-neon-lime';
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'critical':
      case 'crisis':
      case 'extreme':
        return 'destructive';
      case 'high':
      case 'stressed':
      case 'elevated':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card className={cn(
      "glass-tile terminal-container p-6",
      "border-glass-border bg-bg-tile backdrop-blur-md",
      className
    )}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-glass-border pb-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-neon-teal" />
            <h2 className="text-lg font-mono font-bold text-text-data">
              GLOBAL FINANCIAL PLUMBING
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={getBadgeVariant(systemicRisk)}>
              {systemicRisk.toUpperCase()}
            </Badge>
            <div className="text-xs text-text-secondary font-mono">
              {confidence}% CONF
            </div>
          </div>
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="text-xs text-text-secondary font-mono uppercase tracking-wider">
              Plumbing Efficiency
            </div>
            <div className="text-2xl font-mono font-bold text-text-data">
              {efficiency.toFixed(1)}%
            </div>
            <div className="h-2 bg-glass-bg rounded-full overflow-hidden">
              <div 
                className="h-full bg-neon-lime transition-all duration-500"
                style={{ width: `${efficiency}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-text-secondary font-mono uppercase tracking-wider">
              Systemic Risk Level
            </div>
            <div className={cn("text-2xl font-mono font-bold uppercase", getStatusColor(systemicRisk))}>
              {systemicRisk}
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
              <AlertTriangle className="w-3 h-3" />
              <span>Updated {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Cross-Currency Basis Swaps */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-mono font-bold text-text-data uppercase tracking-wider">
              Cross-Currency Basis Swaps
            </h3>
            <Badge variant={getBadgeVariant(crossCurrencyBasisSwaps.status)}>
              {crossCurrencyBasisSwaps.status.toUpperCase()}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="terminal-data-row">
              <div className="terminal-label">USD/EUR</div>
              <div className="terminal-value">
                {crossCurrencyBasisSwaps.usdEur > 0 ? '+' : ''}{crossCurrencyBasisSwaps.usdEur.toFixed(1)} bps
              </div>
            </div>
            <div className="terminal-data-row">
              <div className="terminal-label">USD/JPY</div>
              <div className="terminal-value">
                {crossCurrencyBasisSwaps.usdJpy > 0 ? '+' : ''}{crossCurrencyBasisSwaps.usdJpy.toFixed(1)} bps
              </div>
            </div>
            <div className="terminal-data-row">
              <div className="terminal-label">USD/GBP</div>
              <div className="terminal-value">
                {crossCurrencyBasisSwaps.usdGbp > 0 ? '+' : ''}{crossCurrencyBasisSwaps.usdGbp.toFixed(1)} bps
              </div>
            </div>
          </div>
        </div>

        {/* Fed Swap Lines */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-mono font-bold text-text-data uppercase tracking-wider">
              Fed Swap Lines
            </h3>
            <Badge variant={getBadgeVariant(fedSwapLines.status)}>
              {fedSwapLines.status.toUpperCase()}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="terminal-data-row">
              <div className="terminal-label">Outstanding</div>
              <div className="terminal-value">${fedSwapLines.totalOutstanding.toFixed(0)}B</div>
            </div>
            <div className="terminal-data-row">
              <div className="terminal-label">Utilization</div>
              <div className="terminal-value">{fedSwapLines.utilizationRate.toFixed(1)}%</div>
            </div>
            <div className="terminal-data-row">
              <div className="terminal-label">Counterparties</div>
              <div className="terminal-value">{fedSwapLines.activeCounterparties}</div>
            </div>
          </div>
        </div>

        {/* Dollar Funding Stress */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-mono font-bold text-text-data uppercase tracking-wider">
              Dollar Funding Markets
            </h3>
            <Badge variant={getBadgeVariant(dollarFunding.stress)}>
              {dollarFunding.stress.toUpperCase()}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="terminal-data-row">
              <div className="terminal-label">LIBOR-OIS</div>
              <div className="terminal-value">{dollarFunding.liborOisSpread.toFixed(1)} bps</div>
            </div>
            <div className="terminal-data-row">
              <div className="terminal-label">CD 3M Spread</div>
              <div className="terminal-value">{dollarFunding.cd3mSpread.toFixed(1)} bps</div>
            </div>
            <div className="terminal-data-row">
              <div className="terminal-label">Eurodollar</div>
              <div className="terminal-value">{dollarFunding.eurodollarFutures.toFixed(1)} bps</div>
            </div>
          </div>
        </div>

        {/* Analysis Insight */}
        <div className="pt-4 border-t border-glass-border">
          <div className="text-xs text-text-secondary font-mono leading-relaxed">
            {systemicRisk === 'critical' ? 
              "🔴 CRITICAL: Severe stress in global dollar funding infrastructure. Cross-currency basis swaps showing extreme dislocation. Monitor Fed intervention." :
             systemicRisk === 'high' ?
              "🟡 HIGH RISK: Elevated tensions in global plumbing. Increased demand for dollar funding via swap lines. Watch for further deterioration." :
             systemicRisk === 'moderate' ?
              "🔵 MODERATE: Some pressure in cross-border funding markets. Normal operational stress but monitor for escalation." :
              "🟢 HEALTHY: Global financial plumbing operating efficiently. Cross-currency funding markets stable with normal spreads."
            }
          </div>
        </div>
      </div>
    </Card>
  );
};