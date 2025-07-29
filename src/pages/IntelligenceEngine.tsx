import { useUnifiedDashboard } from "@/hooks/useUnifiedDashboard";
import { TerminalEngineView } from "@/components/intelligence/TerminalEngineView";
import { CUSIPStealthQEView } from "@/components/intelligence/CUSIPStealthQEView";
import { PrimaryDealerPositionsView } from "@/components/intelligence/PrimaryDealerPositionsView";
import { useState, useEffect } from "react";
import { DetailedEngineView } from "@/types/engines";

export const IntelligenceEngine = () => {
  const { dashboardData, loading, error } = useUnifiedDashboard();
  const [engineViews, setEngineViews] = useState<Record<string, DetailedEngineView>>({});

  useEffect(() => {
    // Mock engine views based on dashboard data
    if (dashboardData) {
      setEngineViews({
        dataIntegrity: {
          title: 'Data Integrity & Self-Healing Engine',
          primarySection: {
            title: 'System Status',
            metrics: {
              'Score': '99.2%',
              'Sources': '4/4 Active',
              'Anomalies': '0 Detected',
              'Healing': '3 Actions/24h'
            }
          },
          sections: []
        },
        netLiquidity: {
          title: 'Net Liquidity Engine V6',
          primarySection: {
            title: 'Current Status',
            metrics: {
              'Net Liquidity': dashboardData.netLiquidity?.primaryMetric || '--',
              'Regime': 'QE',
              'Signal': 'BULLISH',
              'Confidence': '98%'
            }
          },
          sections: []
        }
      });
    }
  }, [dashboardData]);

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

      {/* 3x3 Engine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="text-text-muted text-xs italic">
            Multi-asset momentum correlation analysis
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="mt-8 text-center">
        <div className="glass-tile p-4 font-mono text-sm">
          <div className="flex items-center justify-center space-x-8 text-text-secondary">
            <span className="text-neon-lime">7 ACTIVE ENGINES</span>
            <span>•</span>
            <span>UNIFIED DATA LAYER</span>
            <span>•</span>
            <span className="text-neon-teal">REAL-TIME UPDATES</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceEngine;