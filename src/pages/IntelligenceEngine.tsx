import { useMemo } from "react";
import { PremiumLayout } from "@/components/layout/PremiumLayout";
import { PremiumEngineView } from "@/components/intelligence/PremiumEngineView";
import { IntelligenceHeaderTile } from "@/components/intelligence/IntelligenceHeaderTile";
import { DevelopmentEngineCard } from "@/components/intelligence/DevelopmentEngineCard";
import { ErrorBoundary } from "@/components/intelligence/ErrorBoundary";
import { useResilientEngine } from "@/hooks/useResilientEngine";
import { NetLiquidityEngine } from "@/engines/NetLiquidityEngine";
import { CreditStressEngineV6 } from "@/engines/CreditStressEngineV6";
import { CUSIPStealthQEEngine } from "@/engines/CUSIPStealthQEEngine";
import { EnhancedZScoreEngine } from "@/engines/EnhancedZScoreEngine";
import { EnhancedMomentumEngine } from "@/engines/EnhancedMomentumEngine";
import { SimplifiedDataIntegrityEngine } from "@/engines/SimplifiedDataIntegrityEngine";
import { PrimaryDealerPositionsEngineV6 } from "@/engines/PrimaryDealerPositionsEngineV6";


export const IntelligenceEngine = () => {

  // Initialize engine instances with resilient pattern
  const engines = useMemo(() => ({
    dataIntegrity: new SimplifiedDataIntegrityEngine(),
    netLiquidity: new NetLiquidityEngine(),
    creditStressV6: new CreditStressEngineV6(),
    cusipStealthQE: new CUSIPStealthQEEngine(),
    enhancedZScore: new EnhancedZScoreEngine(),
    enhancedMomentum: new EnhancedMomentumEngine(),
    primaryDealerPositions: new PrimaryDealerPositionsEngineV6(),
  }), []);

  const activeEngines = [
    { key: "dataIntegrity", name: "Data Integrity & Self-Healing Engine V6", engine: engines.dataIntegrity },
    { key: "netLiquidity", name: "Net Liquidity Engine V6", engine: engines.netLiquidity },
    { key: "creditStressV6", name: "Credit Stress Engine V6", engine: engines.creditStressV6 },
    { key: "cusipStealthQE", name: "CUSIP-Level Stealth QE Detection V6", engine: engines.cusipStealthQE },
    { key: "enhancedZScore", name: "Enhanced Z-Score Engine", engine: engines.enhancedZScore },
    { key: "enhancedMomentum", name: "Enhanced Momentum Engine", engine: engines.enhancedMomentum },
    { key: "primaryDealerPositions", name: "Primary Dealer Positions Engine V6", engine: engines.primaryDealerPositions },
  ];

  // Use resilient engine hook with graceful degradation
  const { engineViews, engineStatuses, loading, error, systemHealth, forceRefresh } = useResilientEngine(activeEngines, {
    refreshInterval: 45000,
    maxRetries: 2,
    fallbackEnabled: true,
    staleDataThreshold: 300000
  });

  return (
    <PremiumLayout 
      variant="intelligence" 
      density="comfortable" 
      maxWidth="2xl"
      className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary"
    >
      {/* Premium Intelligence Header */}
      <IntelligenceHeaderTile
        systemHealth={systemHealth as 'healthy' | 'degraded' | 'critical' | 'offline'}
        activeEngines={activeEngines.filter(({ key }) => engineViews[key] && !loading).length}
        totalEngines={28}
        dataIntegrity={98.7}
        refreshRate={45}
        lastRefresh={new Date()}
        error={error}
        onRefresh={forceRefresh}
      />

      {/* Premium Engine Grid */}
      {activeEngines.map(({ key, engine }) => {
        const status = engineStatuses[key];
        return (
          <ErrorBoundary key={key}>
            <PremiumEngineView
              view={engineViews[key]}
              loading={loading && !engineViews[key]}
              isHealthy={status?.isHealthy}
              usingFallback={status?.usingFallback}
              retryCount={status?.retryCount || 0}
            />
          </ErrorBoundary>
        );
      })}

      {/* Development Engines */}
      <DevelopmentEngineCard
        title="Regime Detection Engine"
        status="development"
        description="Market cycle identification & regime transitions"
        targetMetrics="Real-time regime classification with 85%+ accuracy"
        progress={65}
        expectedCompletion="Q2 2024"
      />

      <DevelopmentEngineCard
        title="Cross-Asset Correlation Engine"
        status="design"
        description="Multi-asset momentum correlation analysis"
        targetMetrics="Cross-market relationship mapping & divergence detection"
        expectedCompletion="Q3 2024"
      />

      <DevelopmentEngineCard
        title="Options Flow Intelligence"
        status="planning"
        description="Real-time options flow analysis & unusual activity detection"
        targetMetrics="Institutional options flow tracking with 90%+ accuracy"
        expectedCompletion="Q4 2024"
      />

      <DevelopmentEngineCard
        title="Macro Sentiment Engine"
        status="planning"
        description="Central bank communications & policy sentiment analysis"
        targetMetrics="Policy shift prediction with 72-hour advance notice"
        expectedCompletion="Q1 2025"
      />

      {/* System Status Footer */}
      <div className="col-span-full mt-8">
        <div className="text-center py-6 border-t border-glass-border/30">
          <div className="text-xs text-text-secondary font-mono tracking-wider">
            LIQUIDITY² INTELLIGENCE ENGINE V6 • REAL-TIME MARKET ANALYSIS • INSTITUTIONAL GRADE
          </div>
        </div>
      </div>
    </PremiumLayout>
  );
};

export default IntelligenceEngine;