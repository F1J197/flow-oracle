import { useMemo } from "react";
import { IntelligenceHeaderTile } from "@/components/intelligence/IntelligenceHeaderTile";
import { DevelopmentEngineCard } from "@/components/intelligence/DevelopmentEngineCard";
import { ErrorBoundary } from "@/components/intelligence/ErrorBoundary";
import { useResilientEngine } from "@/hooks/useResilientEngine";

// Engine implementations
import { SimplifiedDataIntegrityEngine } from "@/engines/SimplifiedDataIntegrityEngine";
import { NetLiquidityEngine } from "@/engines/NetLiquidityEngine";
import { EnhancedMomentumEngine } from "@/engines/EnhancedMomentumEngine";
import { EnhancedZScoreEngineV6 } from "@/engines/EnhancedZScoreEngineV6";
import { CreditStressEngineV6 } from "@/engines/CreditStressEngineV6";
import { PrimaryDealerPositionsEngineV6 } from "@/engines/PrimaryDealerPositionsEngineV6";
import { CUSIPStealthQEEngine } from "@/engines/CUSIPStealthQEEngine";

// Engine Views
import { 
  NetLiquidityView,
  CreditStressView,
  MomentumView,
  DataIntegrityEngineView
} from "@/components/intelligence";
import { ZScoreIntelligenceView } from "@/components/intelligence/ZScoreIntelligenceView";
import { PrimaryDealerPositionsView } from "@/components/intelligence/PrimaryDealerPositionsView";

// Import intelligence styles
import "@/styles/intelligence.css";


function IntelligenceEngine() {
  // Engine instances
  const cusipEngine = useMemo(() => new CUSIPStealthQEEngine(), []);
  
  const loading = false;
  const systemHealth = 'healthy' as const;
  const activeEngineCount = 7;
  const refreshAll = () => {};
  const errors: string[] = [];

  const renderEngineView = (engineKey: string, title: string) => {
    switch (engineKey) {
      case 'dataIntegrity':
        return <DataIntegrityEngineView loading={loading} />;
      case 'netLiquidity':
        return <NetLiquidityView loading={loading} />;
      case 'creditStress':
        return <CreditStressView loading={loading} />;
      case 'momentum':
        return <MomentumView loading={loading} />;
      case 'zScore':
        return <ZScoreIntelligenceView loading={loading} />;
      case 'primaryDealer':
        return <PrimaryDealerPositionsView loading={loading} />;
      case 'cusipStealth':
        return (
          <div className="glass-tile p-6 font-mono">
            <h3 className="text-lg font-bold text-btc-primary mb-4">CUSIP Stealth QE Engine</h3>
            <p className="text-text-secondary">Engine coming soon...</p>
          </div>
        );
      default:
        return (
          <div className="glass-tile p-6 font-mono">
            <h3 className="text-lg font-bold text-btc-primary mb-4">{title}</h3>
            <p className="text-text-secondary">View coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="intelligence-container">
        {/* System Header */}
        <div className="intelligence-header">
          <IntelligenceHeaderTile
            systemHealth={systemHealth}
            activeEngines={activeEngineCount}
            totalEngines={7}
            dataIntegrity={98.7}
            refreshRate={30}
            lastRefresh={new Date()}
            error={errors.join(', ') || undefined}
            onRefresh={refreshAll}
          />
        </div>

        {/* Active Engine Views */}
        <div className="intelligence-grid">
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
        </div>

        {/* Development Engine Cards */}
        <div className="development-section">
          <h2 className="development-title">
            DEVELOPMENT PIPELINE
          </h2>
          <div className="development-grid">
            <DevelopmentEngineCard
              title="Regime Detection Engine"
              status="design"
              description="Advanced market regime classification using ML clustering"
              targetMetrics="Regime Classification, Transition Probabilities, Confidence Scores"
              expectedCompletion="Q2 2024"
            />
            
            <DevelopmentEngineCard
              title="Options Flow Engine"
              status="planning"
              description="Real-time analysis of institutional options positioning"
              targetMetrics="Put/Call Ratios, Unusual Activity, Gamma Exposure"
              expectedCompletion="Q3 2024"
            />
            
            <DevelopmentEngineCard
              title="Sentiment Synthesis Engine"
              status="development"
              description="Multi-source sentiment aggregation and analysis"
              targetMetrics="Composite Sentiment, Source Reliability, Divergence Alerts"
              expectedCompletion="Q1 2024"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default IntelligenceEngine;