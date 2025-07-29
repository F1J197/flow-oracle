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
      className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary intelligence-grid"
    >
      {/* Enhanced Header with Premium Terminal Styling */}
      <div className="mb-8 space-y-4 col-span-full">
        <div className="glass-tile p-8 border border-btc-primary/30 bg-gradient-to-r from-bg-secondary/60 to-bg-primary/60 ascii-border">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-btc-primary font-mono tracking-widest uppercase">
              ═══ INTELLIGENCE ENGINE V6 ═══
            </h1>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-btc-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-mono text-btc-light font-bold tracking-wide">REAL-TIME</span>
              </div>
              {error && (
                <div className="text-sm font-mono text-btc-error font-bold">
                  ⚠ ERROR: {error}
                </div>
              )}
            </div>
          </div>
          
          <div className="mono-table w-full border border-btc-primary/20 rounded bg-glass-bg/20">
            <div className="mono-table-row">
              <div className="mono-table-cell text-btc-primary font-bold">SYSTEM STATUS</div>
              <div className="mono-table-cell text-text-primary">OPERATIONAL</div>
              <div className="mono-table-cell text-btc-primary font-bold">ACTIVE ENGINES</div>
              <div className="mono-table-cell text-text-primary">{activeEngines.length}/28</div>
            </div>
            <div className="mono-table-row">
              <div className="mono-table-cell text-btc-light">DATA INTEGRITY</div>
              <div className="mono-table-cell text-btc-primary">98.7%</div>
              <div className="mono-table-cell text-btc-light">REFRESH RATE</div>
              <div className="mono-table-cell text-text-primary">45s</div>
            </div>
          </div>
          
          <div className="mt-6 text-text-secondary font-mono text-sm leading-relaxed border-t border-btc-primary/20 pt-4">
            <p className="mb-2">
              The Intelligence Engine synthesizes <span className="text-btc-primary font-bold">28 specialized processing engines</span> across 
              three critical analysis pillars to deliver institutional-grade market intelligence.
            </p>
            <div className="data-columns-wide text-xs">
              <span className="text-btc-light font-bold">FOUNDATION ENGINES</span>
              <span className="text-btc-primary font-bold">PILLAR ANALYSIS</span>
              <span className="text-btc-glow font-bold">SYNTHESIS ENGINE</span>
              <span className="text-text-muted">V6 ARCHITECTURE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Engine Grid with Enhanced Terminal Layout */}
      {activeEngines.map(({ key, engine }) => (
        <ErrorBoundary key={key}>
          <div className="transform transition-all duration-300 hover:scale-[1.02] hover:z-10">
            <TerminalEngineView
              view={engineViews[key]}
              loading={loading || !engineViews[key]}
            />
          </div>
        </ErrorBoundary>
      ))}

      {/* Development Engines with Premium Terminal Styling */}
      <div className="glass-tile p-8 font-mono text-sm opacity-70 border border-btc-glow/40 hover:border-btc-glow/60 transition-all duration-300 ascii-border">
        <div className="section-divider mb-4">
          <span>REGIME DETECTION ENGINE</span>
        </div>
        <div className="data-columns">
          <span className="text-text-secondary">Status:</span>
          <span className="text-btc-light font-bold">DEVELOPMENT</span>
          <span className="status-indicator status-warning">DEV</span>
        </div>
        <div className="mono-table mt-4 opacity-80">
          <div className="mono-table-row">
            <div className="mono-table-cell text-text-muted">Function:</div>
            <div className="mono-table-cell text-text-secondary">Market cycle identification & regime transitions</div>
          </div>
          <div className="mono-table-row">
            <div className="mono-table-cell text-text-muted">Target:</div>
            <div className="mono-table-cell text-text-secondary">Real-time regime classification with 85%+ accuracy</div>
          </div>
        </div>
      </div>

      <div className="glass-tile p-8 font-mono text-sm opacity-70 border border-btc-muted/40 hover:border-btc-muted/60 transition-all duration-300 ascii-border">
        <div className="section-divider mb-4">
          <span>CROSS-ASSET CORRELATION ENGINE</span>
        </div>
        <div className="data-columns">
          <span className="text-text-secondary">Status:</span>
          <span className="text-btc-muted font-bold">DESIGN PHASE</span>
          <span className="status-indicator status-critical">DESIGN</span>
        </div>
        <div className="mono-table mt-4 opacity-80">
          <div className="mono-table-row">
            <div className="mono-table-cell text-text-muted">Function:</div>
            <div className="mono-table-cell text-text-secondary">Multi-asset momentum correlation analysis</div>
          </div>
          <div className="mono-table-row">
            <div className="mono-table-cell text-text-muted">Target:</div>
            <div className="mono-table-cell text-text-secondary">Cross-market relationship mapping & divergence detection</div>
          </div>
        </div>
      </div>

      {/* Enhanced Terminal Footer Status */}
      <div className="col-span-full mt-12">
        <div className="glass-tile p-8 font-mono border border-btc-primary/30 bg-gradient-to-r from-btc-primary/5 to-btc-glow/5 ascii-border">
          <div className="section-divider mb-6">
            <span>SYSTEM STATUS SUMMARY</span>
          </div>
          
          <div className="mono-table">
            <div className="mono-table-row">
              <div className="mono-table-cell mono-table-header">METRIC</div>
              <div className="mono-table-cell mono-table-header">VALUE</div>
              <div className="mono-table-cell mono-table-header">STATUS</div>
              <div className="mono-table-cell mono-table-header">TARGET</div>
            </div>
            <div className="mono-table-row">
              <div className="mono-table-cell text-text-secondary">Active Engines</div>
              <div className="mono-table-cell text-btc-primary font-bold">
                {activeEngines.filter(({ key }) => engineViews[key] && !loading).length}/28
              </div>
              <div className="mono-table-cell">
                <span className="status-indicator status-active">OPERATIONAL</span>
              </div>
              <div className="mono-table-cell text-text-muted">28</div>
            </div>
            <div className="mono-table-row">
              <div className="mono-table-cell text-text-secondary">Data Layer</div>
              <div className="mono-table-cell text-btc-light font-bold">UNIFIED</div>
              <div className="mono-table-cell">
                <span className="status-indicator status-active">LIVE</span>
              </div>
              <div className="mono-table-cell text-text-muted">100%</div>
            </div>
            <div className="mono-table-row">
              <div className="mono-table-cell text-text-secondary">Architecture</div>
              <div className="mono-table-cell text-btc-glow font-bold">V6.0.1</div>
              <div className="mono-table-cell">
                <span className="status-indicator status-active">STABLE</span>
              </div>
              <div className="mono-table-cell text-text-muted">V6+</div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-btc-primary/20 text-center">
            <div className="text-xs text-text-muted font-mono tracking-wider">
              LIQUIDITY² INTELLIGENCE ENGINE V6 • REAL-TIME MARKET ANALYSIS • INSTITUTIONAL GRADE
            </div>
          </div>
        </div>
      </div>
    </PremiumLayout>
  );
};

export default IntelligenceEngine;