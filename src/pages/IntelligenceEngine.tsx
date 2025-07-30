import { useMemo } from "react";
import { TerminalGrid, TerminalContainer, TerminalHeader } from "@/components/terminal";
import { ErrorBoundary } from "@/components/intelligence/ErrorBoundary";
import { useResilientEngine } from "@/hooks/useResilientEngine";
import { useFoundationDataIntegrity } from "@/hooks/useFoundationDataIntegrity";

// Engine implementations
import { DataIntegrityEngine } from "@/engines/foundation/DataIntegrityEngine";
import { NetLiquidityEngine } from "@/engines/NetLiquidityEngine";
import { EnhancedMomentumEngine } from "@/engines/EnhancedMomentumEngine";
import { EnhancedZScoreEngine } from "@/engines/foundation/EnhancedZScoreEngine";
import { CreditStressEngineV6 } from "@/engines/CreditStressEngineV6";
import { PrimaryDealerPositionsEngineV6 } from "@/engines/PrimaryDealerPositionsEngineV6";
import { CUSIPStealthQEEngine } from "@/engines/CUSIPStealthQEEngine";
import { GlobalFinancialPlumbingEngine } from "@/engines/pillar1/GlobalFinancialPlumbingEngine";

// Engine Views
import { 
  NetLiquidityView,
  CreditStressView,
  MomentumView
} from "@/components/intelligence";
import { DataIntegrityIntelligenceView } from "@/engines/foundation/DataIntegrityEngine";
import { ZScoreFoundationIntelligence } from "@/engines/foundation/EnhancedZScoreEngine";
import { PrimaryDealerPositionsView } from "@/components/intelligence/PrimaryDealerPositionsView";
import { GlobalPlumbingIntelligence } from "@/engines/pillar1/GlobalFinancialPlumbingEngine";
import { StableDataTest } from "@/components/testing/StableDataTest";

// Import intelligence styles
import "@/styles/intelligence.css";


function IntelligenceEngine() {
  // Engine instances
  const cusipEngine = useMemo(() => new CUSIPStealthQEEngine(), []);
  const dataIntegrityEngine = useMemo(() => new DataIntegrityEngine(), []);
  const globalPlumbingEngine = useMemo(() => new GlobalFinancialPlumbingEngine(), []);
  
  // Foundation Data Integrity hook
  const { metrics: dataIntegrityMetrics, sources: dataIntegritySources, loading: dataIntegrityLoading, error: dataIntegrityError } = useFoundationDataIntegrity();
  
  const loading = false;
  const systemHealth = 'healthy' as const;
  const activeEngineCount = 7;
  const refreshAll = () => {};
  const errors: string[] = [];

  const renderEngineView = (engineKey: string, title: string) => {
    switch (engineKey) {
      case 'dataIntegrity':
        return (
          <DataIntegrityIntelligenceView 
            data={dataIntegrityMetrics} 
            sources={dataIntegritySources}
            loading={dataIntegrityLoading}
            error={dataIntegrityError}
          />
        );
      case 'netLiquidity':
        return <NetLiquidityView loading={loading} />;
      case 'creditStress':
        return <CreditStressView loading={loading} />;
      case 'momentum':
        return <MomentumView loading={loading} />;
      case 'zScore':
        return <ZScoreFoundationIntelligence loading={loading} />;
      case 'primaryDealer':
        return <PrimaryDealerPositionsView loading={loading} />;
      case 'cusipStealth':
        return (
          <TerminalContainer variant="tile">
            <TerminalHeader title="CUSIP STEALTH QE ENGINE" status="offline" />
            <div className="terminal-text text-text-secondary">Engine coming soon...</div>
          </TerminalContainer>
        );
      case 'globalPlumbing':
        return <GlobalPlumbingIntelligence loading={loading} />;
      default:
        return (
          <TerminalContainer variant="tile">
            <TerminalHeader title={title.toUpperCase()} status="offline" />
            <div className="terminal-text text-text-secondary">View coming soon...</div>
          </TerminalContainer>
        );
    }
  };

  return (
    <TerminalContainer className="min-h-screen">
      <TerminalHeader 
        title="INTELLIGENCE ENGINE"
        subtitle="ENGINE EXECUTION MATRIX"
        status={systemHealth === 'healthy' ? 'active' : 'warning'}
      />

      <TerminalGrid columns={2} spacing="lg">
        <ErrorBoundary>
          {renderEngineView('dataIntegrity', 'Data Integrity Engine')}
        </ErrorBoundary>
        
        <ErrorBoundary>
          {renderEngineView('netLiquidity', 'Net Liquidity Engine')}
        </ErrorBoundary>
        
        <ErrorBoundary>
          {renderEngineView('creditStress', 'Credit Stress Engine')}
        </ErrorBoundary>
        
        <ErrorBoundary>
          {renderEngineView('momentum', 'Momentum Engine')}
        </ErrorBoundary>
        
        <ErrorBoundary>
          {renderEngineView('zScore', 'Z-Score Engine')}
        </ErrorBoundary>
        
        <ErrorBoundary>
          {renderEngineView('primaryDealer', 'Primary Dealer Engine')}
        </ErrorBoundary>
        
        <ErrorBoundary>
          {renderEngineView('cusipStealth', 'CUSIP Stealth QE Engine')}
        </ErrorBoundary>
        
        <ErrorBoundary>
          {renderEngineView('globalPlumbing', 'Global Financial Plumbing Engine')}
        </ErrorBoundary>
      </TerminalGrid>
    </TerminalContainer>
  );
}

export default IntelligenceEngine;