import { useEngineManager } from "@/hooks/useEngineManager";
import { TerminalEngineView } from "@/components/intelligence/TerminalEngineView";
import { useState, useEffect } from "react";
import { DetailedEngineView } from "@/types/engines";

export const IntelligenceEngine = () => {
  const { engines } = useEngineManager();
  const [engineViews, setEngineViews] = useState<Record<string, DetailedEngineView>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEngineViews = async () => {
      setLoading(true);
      try {
        // Get detailed views from existing engines (no execution needed)
        const views = {
          dataIntegrity: engines.dataIntegrity.getDetailedView(),
          netLiquidity: engines.netLiquidity.getDetailedView(),
          creditStressV6: engines.creditStressV6.getDetailedView(),
          enhancedZScore: engines.enhancedZScore.getDetailedView(),
          enhancedMomentum: engines.enhancedMomentum.getDetailedView(),
          primaryDealerPositions: engines.primaryDealerPositions.getDetailedView(),
          cusipStealthQE: engines.cusipStealthQE.getDetailedView(),
        };

        setEngineViews(views);
      } catch (error) {
        console.error("Error fetching engine views:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEngineViews();
  }, [engines]);

  const activeEngines = [
    { key: "dataIntegrity", name: "Data Integrity & Self-Healing Engine" },
    { key: "netLiquidity", name: "Net Liquidity Engine V6" },
    { key: "creditStressV6", name: "Credit Stress Engine V6" },
    { key: "cusipStealthQE", name: "CUSIP-Level Stealth QE Detection V6" },
    { key: "enhancedZScore", name: "Enhanced Z-Score Engine" },
    { key: "enhancedMomentum", name: "Enhanced Momentum Engine" },
    { key: "primaryDealerPositions", name: "Primary Dealer Positions Engine V6" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 space-y-3">
        <div className="text-text-secondary font-mono text-sm">
          The Intelligence Engine synthesizes 28 specialized processing engines to deliver 
          real-time market intelligence. Each engine processes specific data streams and 
          contributes to our comprehensive liquidity assessment framework.
        </div>
        <div className="text-text-muted font-mono text-xs">
          Foundation Engines • Pillar Analysis • Synthesis & Execution
        </div>
      </div>

      {/* 3x3 Engine Grid - Fixed Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Engines */}
        {/* Active Engines */}
        {activeEngines.map((engine) => (
          <TerminalEngineView
            key={engine.key}
            view={engineViews[engine.key]}
            loading={loading || !engineViews[engine.key]}
          />
        ))}

        {/* Placeholder Development Engines */}
        <div className="glass-tile p-6 font-mono text-sm opacity-60">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-neon-teal font-bold text-base uppercase tracking-wide">
                REGIME DETECTION ENGINE
              </h2>
              <div className="text-xs text-neon-gold border border-neon-gold px-2 py-1 rounded">
                DEV
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-neon-gold font-semibold uppercase text-sm mb-3">
              DEVELOPMENT STATUS
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-text-secondary">Priority:</span>
                <span className="text-neon-gold">HIGH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Pillar:</span>
                <span className="text-text-primary">Foundation</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Status:</span>
                <span className="text-neon-gold">IN PROGRESS</span>
              </div>
            </div>
          </div>

          <div className="text-text-muted text-xs italic">
            Market cycle identification & regime transitions
          </div>
        </div>

        <div className="glass-tile p-6 font-mono text-sm opacity-60">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-neon-teal font-bold text-base uppercase tracking-wide">
                CROSS-ASSET CORRELATION
              </h2>
              <div className="text-xs text-neon-orange border border-neon-orange px-2 py-1 rounded">
                DESIGN
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-neon-orange font-semibold uppercase text-sm mb-3">
              DEVELOPMENT STATUS
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-text-secondary">Priority:</span>
                <span className="text-neon-orange">MEDIUM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Pillar:</span>
                <span className="text-text-primary">Pillar 2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Status:</span>
                <span className="text-neon-orange">DESIGN</span>
              </div>
            </div>
          </div>

          <div className="text-text-muted text-xs italic">
            Multi-asset momentum correlation analysis
          </div>
        </div>

        <div className="glass-tile p-6 font-mono text-sm opacity-60">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-neon-teal font-bold text-base uppercase tracking-wide">
                TEMPORAL DYNAMICS ENGINE
              </h2>
              <div className="text-xs text-neon-fuchsia border border-neon-fuchsia px-2 py-1 rounded">
                PLAN
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-neon-fuchsia font-semibold uppercase text-sm mb-3">
              DEVELOPMENT STATUS
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-text-secondary">Priority:</span>
                <span className="text-neon-fuchsia">HIGH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Pillar:</span>
                <span className="text-text-primary">Pillar 3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Status:</span>
                <span className="text-neon-fuchsia">PLANNING</span>
              </div>
            </div>
          </div>

          <div className="text-text-muted text-xs italic">
            Time-series momentum decomposition
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="mt-8 text-center">
        <div className="glass-tile p-4 font-mono text-sm">
          <div className="flex items-center justify-center space-x-8 text-text-secondary">
            <span className="text-neon-lime">7 ACTIVE ENGINES</span>
            <span>•</span>
            <span>3 IN DEVELOPMENT</span>
            <span>•</span>
            <span>18 PLANNED</span>
            <span>•</span>
            <span className="text-neon-teal">REAL-TIME UPDATES</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceEngine;