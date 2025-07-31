import { useMemo } from "react";
import { Header } from '@/components/layout/Header';
import { TerminalGrid, TerminalContainer, TerminalHeader } from "@/components/Terminal";
import { ErrorBoundary } from "@/components/intelligence/ErrorBoundary";
import { useResilientEngine } from "@/hooks/useResilientEngine";
import { useFoundationDataIntegrity } from "@/hooks/useFoundationDataIntegrity";
import { useKalmanNetLiquidity } from "@/hooks/useKalmanNetLiquidity";

// Engine implementations
import { DataIntegrityEngine } from "@/engines/foundation/DataIntegrityEngine";
import { NetLiquidityEngine } from "@/engines/NetLiquidityEngine";
import { EnhancedMomentumEngine } from "@/engines/foundation/EnhancedMomentumEngine";
import { EnhancedZScoreEngine } from "@/engines/foundation/EnhancedZScoreEngine";
import { CreditStressEngineV6 } from "@/engines/CreditStressEngineV6";
import { PrimaryDealerPositionsEngineV6 } from "@/engines/PrimaryDealerPositionsEngineV6";
import { CUSIPStealthQEEngine } from "@/engines/CUSIPStealthQEEngine";
import { GlobalFinancialPlumbingEngine } from "@/engines/pillar1/GlobalFinancialPlumbingEngine";

// Engine Views
import { 
  CreditStressView,
  MomentumView
} from "@/components/intelligence";
import { DataIntegrityIntelligenceView } from "@/engines/foundation/DataIntegrityEngine";
import { ZScoreFoundationIntelligence } from "@/engines/foundation/EnhancedZScoreEngine";
import { PrimaryDealerPositionsView } from "@/components/intelligence/PrimaryDealerPositionsView";
import { GlobalPlumbingIntelligence } from "@/engines/pillar1/GlobalFinancialPlumbingEngine";
import { KalmanNetLiquidityIntelligenceView } from "@/engines/pillar1/KalmanNetLiquidityEngine";
// Testing components removed

// Import intelligence styles
import "@/styles/intelligence.css";


function IntelligenceEngine() {
  // Engine instances
  const cusipEngine = useMemo(() => new CUSIPStealthQEEngine(), []);
  const dataIntegrityEngine = useMemo(() => new DataIntegrityEngine(), []);
  const globalPlumbingEngine = useMemo(() => new GlobalFinancialPlumbingEngine(), []);
  
  // Foundation Data Integrity hook
  const { metrics: dataIntegrityMetrics, sources: dataIntegritySources, loading: dataIntegrityLoading, error: dataIntegrityError } = useFoundationDataIntegrity();
  
  // Debug logging for data integrity
  console.log('IntelligenceEngine - Data Integrity State:', {
    metrics: dataIntegrityMetrics,
    loading: dataIntegrityLoading,
    error: dataIntegrityError,
    sources: dataIntegritySources
  });
  
  // Kalman Net Liquidity hook
  const { metrics: netLiquidityMetrics, intelligenceData: netLiquidityIntelligence, isLoading: netLiquidityLoading, error: netLiquidityError } = useKalmanNetLiquidity();
  
  const loading = false;
  const systemHealth = 'healthy' as const;
  const activeEngineCount = 7;
  const refreshAll = () => {};
  const errors: string[] = [];

  const renderEngineView = (engineKey: string, title: string) => {
    switch (engineKey) {
      case 'dataIntegrity':
        // Create compatible EngineOutput from DataIntegrityMetrics
        const engineOutput = dataIntegrityMetrics ? {
          primaryMetric: {
            value: dataIntegrityMetrics.integrityScore,
            change24h: 0,
            changePercent: 0
          },
          signal: dataIntegrityMetrics.systemStatus === 'OPTIMAL' ? 'RISK_ON' as const : 
                 dataIntegrityMetrics.systemStatus === 'GOOD' ? 'NEUTRAL' as const : 'RISK_OFF' as const,
          confidence: dataIntegrityMetrics.integrityScore,
          analysis: `System integrity at ${dataIntegrityMetrics.integrityScore.toFixed(1)}%. Status: ${dataIntegrityMetrics.systemStatus}`,
          subMetrics: {
            totalIndicators: dataIntegrityMetrics.totalSources,
            healthyIndicators: dataIntegrityMetrics.activeSources,
            criticalIssues: dataIntegrityMetrics.totalSources - dataIntegrityMetrics.activeSources,
            warningIssues: 0,
            healingAttempts: dataIntegrityMetrics.autoHealed24h
          }
        } : null;

        return (
          <DataIntegrityIntelligenceView 
            data={engineOutput} 
            historicalData={[]}
            loading={dataIntegrityLoading}
            error={dataIntegrityError}
          />
        );
      case 'netLiquidity':
        return (
          <KalmanNetLiquidityIntelligenceView 
            data={netLiquidityMetrics}
            loading={netLiquidityLoading}
            error={netLiquidityError}
          />
        );
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
    <div className="min-h-screen bg-bg-primary">
      <Header currentPage="intelligence" />
      <main>
        <TerminalContainer className="min-h-screen">
        <TerminalHeader 
          title="INTELLIGENCE ENGINE"
          subtitle="ENGINE EXECUTION MATRIX"
          status={systemHealth === 'healthy' ? 'active' : 'warning'}
        />

        <TerminalGrid columns={2} gap="lg">
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
      </main>
    </div>
  );
}

export default IntelligenceEngine;