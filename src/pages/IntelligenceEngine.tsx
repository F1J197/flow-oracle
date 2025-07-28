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
    { key: "enhancedZScore", name: "Enhanced Z-Score Engine" },
    { key: "enhancedMomentum", name: "Enhanced Momentum Engine" },
    { key: "primaryDealerPositions", name: "Primary Dealer Positions Engine V6" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold text-neon-teal">Intelligence Engine</h1>
        <p className="text-text-secondary font-mono">
          28 Processing Engines • Real-time Market Analysis
        </p>
      </div>

      {/* 3x3 Engine Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
            <div className="text-text-secondary text-xs uppercase tracking-wider mb-2">
              Intelligence Engine View Layout:
            </div>
            <div className="text-text-primary font-bold text-sm uppercase mb-1">
              REGIME DETECTION ENGINE
            </div>
            <div className="text-text-secondary">
              {"=".repeat("REGIME DETECTION ENGINE".length)}
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
            <div className="text-text-secondary text-xs uppercase tracking-wider mb-2">
              Intelligence Engine View Layout:
            </div>
            <div className="text-text-primary font-bold text-sm uppercase mb-1">
              CROSS-ASSET CORRELATION
            </div>
            <div className="text-text-secondary">
              {"=".repeat("CROSS-ASSET CORRELATION".length)}
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
            <div className="text-text-secondary text-xs uppercase tracking-wider mb-2">
              Intelligence Engine View Layout:
            </div>
            <div className="text-text-primary font-bold text-sm uppercase mb-1">
              TEMPORAL DYNAMICS ENGINE
            </div>
            <div className="text-text-secondary">
              {"=".repeat("TEMPORAL DYNAMICS ENGINE".length)}
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
            <span className="text-neon-lime">6 ACTIVE ENGINES</span>
            <span>•</span>
            <span>3 IN DEVELOPMENT</span>
            <span>•</span>
            <span>19 PLANNED</span>
            <span>•</span>
            <span className="text-neon-teal">REAL-TIME UPDATES</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceEngine;