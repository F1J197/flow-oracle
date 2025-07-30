import React from 'react';
import { useGlobalPlumbingEngine } from '@/hooks/useGlobalPlumbingEngine';
import { TerminalLayout } from '@/components/intelligence/TerminalLayout';
import { TerminalDataSection } from '@/components/intelligence/TerminalDataSection';
import { TerminalDataRow } from '@/components/intelligence/TerminalDataRow';
import { TerminalMetricGrid } from '@/components/intelligence/TerminalMetricGrid';

interface GlobalPlumbingIntelligenceProps {
  loading?: boolean;
  className?: string;
}

export const GlobalPlumbingIntelligence: React.FC<GlobalPlumbingIntelligenceProps> = ({
  loading = false,
  className
}) => {
  const { intelligenceData, loading: hookLoading } = useGlobalPlumbingEngine();
  
  if (loading || hookLoading || !intelligenceData) {
    return (
      <TerminalLayout 
        title="GLOBAL FINANCIAL PLUMBING" 
        status="offline" 
        className={className}
      >
        <div className="terminal-content">
          <div className="text-text-secondary">Loading Global Plumbing Intelligence...</div>
        </div>
      </TerminalLayout>
    );
  }

  // Extract data from intelligenceData
  const efficiency = parseFloat(String(intelligenceData.primaryMetrics?.efficiency?.value || '85').replace('%', ''));
  const systemicRisk = String(intelligenceData.primaryMetrics?.systemicRisk?.value || 'low').toLowerCase();
  const confidence = intelligenceData.confidence || 85;
  const lastUpdate = intelligenceData.lastUpdate || new Date();
  
  // Mock additional data for now - would come from sections in real implementation
  const crossCurrencyBasisSwaps = {
    usdEur: -12.5,
    usdJpy: -8.3,
    usdGbp: -15.2,
    status: 'normal' as const
  };
  
  const fedSwapLines = {
    totalOutstanding: 125,
    utilizationRate: 15.2,
    activeCounterparties: 8,
    status: 'normal' as const
  };
  
  const dollarFunding = {
    liborOisSpread: 45.2,
    cd3mSpread: 35.8,
    eurodollarFutures: 125.4,
    stress: 'low' as const
  };

  // Determine engine status based on systemic risk
  const engineStatus = systemicRisk === 'critical' ? 'critical' : 
                      systemicRisk === 'high' ? 'warning' : 'active';

  // Prepare metrics for TerminalMetricGrid
  const primaryMetrics = [
    {
      label: 'Plumbing Efficiency',
      value: `${efficiency.toFixed(1)}%`,
      status: (efficiency > 80 ? 'positive' : efficiency > 60 ? 'warning' : 'negative') as 'positive' | 'negative' | 'neutral' | 'warning' | 'critical'
    },
    {
      label: 'Systemic Risk',
      value: systemicRisk.toUpperCase(),
      status: (systemicRisk === 'low' ? 'positive' : 
              systemicRisk === 'moderate' ? 'warning' : 'critical') as 'positive' | 'negative' | 'neutral' | 'warning' | 'critical'
    },
    {
      label: 'Confidence',
      value: `${confidence}%`,
      status: 'neutral' as 'positive' | 'negative' | 'neutral' | 'warning' | 'critical'
    },
    {
      label: 'Last Update',
      value: lastUpdate.toLocaleTimeString(),
      status: 'neutral' as 'positive' | 'negative' | 'neutral' | 'warning' | 'critical'
    }
  ];

  return (
    <TerminalLayout 
      title="GLOBAL FINANCIAL PLUMBING" 
      status={engineStatus} 
      className={className}
    >
      <TerminalMetricGrid metrics={primaryMetrics} columns={2} />
      
      <TerminalDataSection title="CROSS-CURRENCY BASIS SWAPS">
        <TerminalDataRow 
          label="USD/EUR" 
          value={`${crossCurrencyBasisSwaps.usdEur > 0 ? '+' : ''}${crossCurrencyBasisSwaps.usdEur.toFixed(1)} bps`}
          status={crossCurrencyBasisSwaps.usdEur < -10 ? 'negative' : 'neutral'}
        />
        <TerminalDataRow 
          label="USD/JPY" 
          value={`${crossCurrencyBasisSwaps.usdJpy > 0 ? '+' : ''}${crossCurrencyBasisSwaps.usdJpy.toFixed(1)} bps`}
          status={crossCurrencyBasisSwaps.usdJpy < -10 ? 'negative' : 'neutral'}
        />
        <TerminalDataRow 
          label="USD/GBP" 
          value={`${crossCurrencyBasisSwaps.usdGbp > 0 ? '+' : ''}${crossCurrencyBasisSwaps.usdGbp.toFixed(1)} bps`}
          status={crossCurrencyBasisSwaps.usdGbp < -10 ? 'negative' : 'neutral'}
        />
      </TerminalDataSection>

      <TerminalDataSection title="FED SWAP LINES">
        <TerminalDataRow 
          label="Outstanding" 
          value={`$${fedSwapLines.totalOutstanding.toFixed(0)}B`}
          status="neutral"
        />
        <TerminalDataRow 
          label="Utilization" 
          value={`${fedSwapLines.utilizationRate.toFixed(1)}%`}
          status={fedSwapLines.utilizationRate > 25 ? 'warning' : 'neutral'}
        />
        <TerminalDataRow 
          label="Counterparties" 
          value={fedSwapLines.activeCounterparties}
          status="neutral"
        />
      </TerminalDataSection>

      <TerminalDataSection title="DOLLAR FUNDING MARKETS">
        <TerminalDataRow 
          label="LIBOR-OIS" 
          value={`${dollarFunding.liborOisSpread.toFixed(1)} bps`}
          status={dollarFunding.liborOisSpread > 50 ? 'warning' : 'neutral'}
        />
        <TerminalDataRow 
          label="CD 3M Spread" 
          value={`${dollarFunding.cd3mSpread.toFixed(1)} bps`}
          status={dollarFunding.cd3mSpread > 40 ? 'warning' : 'neutral'}
        />
        <TerminalDataRow 
          label="Eurodollar" 
          value={`${dollarFunding.eurodollarFutures.toFixed(1)} bps`}
          status="neutral"
        />
      </TerminalDataSection>

      <TerminalDataSection title="ANALYSIS">
        <div className="terminal-content text-xs leading-relaxed">
          {systemicRisk === 'critical' ? 
            "CRITICAL: Severe stress in global dollar funding infrastructure. Cross-currency basis swaps showing extreme dislocation. Monitor Fed intervention." :
           systemicRisk === 'high' ?
            "HIGH RISK: Elevated tensions in global plumbing. Increased demand for dollar funding via swap lines. Watch for further deterioration." :
           systemicRisk === 'moderate' ?
            "MODERATE: Some pressure in cross-border funding markets. Normal operational stress but monitor for escalation." :
            "HEALTHY: Global financial plumbing operating efficiently. Cross-currency funding markets stable with normal spreads."
          }
        </div>
      </TerminalDataSection>
    </TerminalLayout>
  );
};