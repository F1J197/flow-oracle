import { useMemo } from "react";
import { PremiumLayout } from "@/components/layout/PremiumLayout";
import { TerminalEngineView } from "@/components/intelligence/TerminalEngineView";
import { ErrorBoundary } from "@/components/intelligence/ErrorBoundary";
import { useStabilizedEngine } from "@/hooks/useStabilizedEngine";
import { NetLiquidityEngine } from "@/engines/NetLiquidityEngine";
import { CreditStressEngineV6 } from "@/engines/CreditStressEngineV6";
import { CUSIPStealthQEEngine } from "@/engines/CUSIPStealthQEEngine";
import { EnhancedZScoreEngine } from "@/engines/EnhancedZScoreEngine";
import { EnhancedMomentumEngine } from "@/engines/EnhancedMomentumEngine";
import { DataIntegrityEngine } from "@/engines/DataIntegrityEngine";
import { PrimaryDealerPositionsEngineV6 } from "@/engines/PrimaryDealerPositionsEngineV6";

export const IntelligenceEngine = () => {

  // Initialize engine instances
  const engines = useMemo(() => ({
    dataIntegrity: new DataIntegrityEngine(),
    netLiquidity: new NetLiquidityEngine(),
    creditStressV6: new CreditStressEngineV6(),
    cusipStealthQE: new CUSIPStealthQEEngine(),
    enhancedZScore: new EnhancedZScoreEngine(),
    enhancedMomentum: new EnhancedMomentumEngine(),
    primaryDealerPositions: new PrimaryDealerPositionsEngineV6(),
  }), []);

  const activeEngines = [
    { key: "dataIntegrity", name: "Data Integrity & Self-Healing Engine", engine: engines.dataIntegrity },
    { key: "netLiquidity", name: "Net Liquidity Engine V6", engine: engines.netLiquidity },
    { key: "creditStressV6", name: "Credit Stress Engine V6", engine: engines.creditStressV6 },
    { key: "cusipStealthQE", name: "CUSIP-Level Stealth QE Detection V6", engine: engines.cusipStealthQE },
    { key: "enhancedZScore", name: "Enhanced Z-Score Engine", engine: engines.enhancedZScore },
    { key: "enhancedMomentum", name: "Enhanced Momentum Engine", engine: engines.enhancedMomentum },
    { key: "primaryDealerPositions", name: "Primary Dealer Positions Engine V6", engine: engines.primaryDealerPositions },
  ];

  // Use stabilized engine hook
  const { engineViews, loading, error, forceRefresh } = useStabilizedEngine(activeEngines, {
    refreshInterval: 45000, // Increased from 30s to reduce load
    maxRetries: 3,
    cacheTimeout: 300000, // 5 minutes cache
    debounceMs: 2000 // 2 second debounce
  });

  return (
    <PremiumLayout 
      variant="intelligence" 
      density="comfortable" 
      maxWidth="2xl"
      className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary"
    >
      {/* Enhanced Header with Premium Styling */}
      <div className="mb-8 space-y-4 col-span-full">
        <div className="glass-tile p-6 border border-btc-primary/20 bg-gradient-to-r from-bg-secondary/50 to-bg-primary/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-btc-primary font-mono tracking-wider">
              INTELLIGENCE ENGINE
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-btc-primary rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-btc-light">REAL-TIME</span>
              </div>
              {error && (
                <div className="text-xs font-mono text-btc-error">
                  ERROR: {error}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-text-secondary font-mono text-sm leading-relaxed">
            The Intelligence Engine synthesizes <span className="text-btc-primary font-bold">28 specialized processing engines</span> to deliver 
            real-time market intelligence. Each engine processes specific data streams and 
            contributes to our comprehensive liquidity assessment framework.
          </div>
          
          <div className="mt-3 text-text-muted font-mono text-xs">
            <span className="text-btc-light">Foundation Engines</span> • 
            <span className="text-btc-primary"> Pillar Analysis</span> • 
            <span className="text-btc-glow"> Synthesis & Execution</span>
          </div>
        </div>
      </div>

      {/* Premium Engine Grid */}
      {activeEngines.map(({ key, engine }) => (
        <ErrorBoundary key={key}>
          <div className="transform transition-all duration-300 hover:scale-105">
            <TerminalEngineView
              view={engineViews[key]}
              loading={loading || !engineViews[key]}
            />
          </div>
        </ErrorBoundary>
      ))}

      {/* Development Engines with Premium Styling */}
      <div className="glass-tile p-6 font-mono text-sm opacity-60 border border-btc-glow/30 hover:border-btc-glow/50 transition-all duration-300">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-btc-glow font-bold text-base uppercase tracking-wide">
              REGIME DETECTION ENGINE
            </h2>
            <div className="text-xs text-btc-light border border-btc-light px-2 py-1 rounded bg-btc-light/10">
              DEV
            </div>
          </div>
        </div>
        <div className="text-text-muted text-xs italic">
          Market cycle identification & regime transitions
        </div>
      </div>

      <div className="glass-tile p-6 font-mono text-sm opacity-60 border border-btc-muted/30 hover:border-btc-muted/50 transition-all duration-300">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-btc-muted font-bold text-base uppercase tracking-wide">
              CROSS-ASSET CORRELATION
            </h2>
            <div className="text-xs text-btc-error border border-btc-error px-2 py-1 rounded bg-btc-error/10">
              DESIGN
            </div>
          </div>
        </div>
        <div className="text-text-muted text-xs italic">
          Multi-asset momentum correlation analysis
        </div>
      </div>

      {/* Enhanced Footer Status */}
      <div className="col-span-full mt-8">
        <div className="glass-tile p-6 font-mono text-sm border border-btc-primary/20 bg-gradient-to-r from-btc-primary/5 to-btc-glow/5">
          <div className="flex items-center justify-center space-x-8 text-text-secondary">
            <span className="text-btc-primary font-bold">
              {activeEngines.filter(({ key }) => engineViews[key] && !loading).length} ACTIVE ENGINES
            </span>
            <span className="text-btc-muted">•</span>
            <span className="text-btc-light">UNIFIED DATA LAYER</span>
            <span className="text-btc-muted">•</span>
            <span className="text-btc-glow">REAL-TIME UPDATES</span>
            <span className="text-btc-muted">•</span>
            <span className="text-btc-primary">
              V6 ARCHITECTURE
            </span>
          </div>
        </div>
      </div>
    </PremiumLayout>
  );
};

export default IntelligenceEngine;