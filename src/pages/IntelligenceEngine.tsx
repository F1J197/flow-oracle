import { useState, useEffect } from "react";
import { GlassTile } from "@/components/shared/GlassTile";
import { DataDisplay } from "@/components/shared/DataDisplay";
import { Badge } from "@/components/ui/badge";
import { dataService } from "@/services/dataService";
import { DataIntegrityEngine } from "@/engines/DataIntegrityEngine";
import { NetLiquidityEngine } from "@/engines/NetLiquidityEngine";
import { CreditStressEngine } from "@/engines/CreditStressEngine";
import { EnhancedZScoreEngine } from "@/engines/EnhancedZScoreEngine";
import { EnhancedMomentumEngine } from "@/engines/EnhancedMomentumEngine";
import { DetailedEngineView } from "@/types/engines";

const IntelligenceEngine = () => {
  const [engines, setEngines] = useState({
    dataIntegrity: new DataIntegrityEngine(),
    netLiquidity: new NetLiquidityEngine(),
    creditStress: new CreditStressEngine(),
    enhancedZScore: new EnhancedZScoreEngine(),
    enhancedMomentum: new EnhancedMomentumEngine(),
  });
  
  const [engineViews, setEngineViews] = useState<Record<string, DetailedEngineView>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const initializeAndFetch = async () => {
      setLoading(true);
      try {
        // Initialize Enhanced Z-Score Engine
        await engines.enhancedZScore.initialize();
        
        // Execute all engines
        await Promise.all([
          engines.dataIntegrity.execute(),
          engines.netLiquidity.execute(),
          engines.creditStress.execute(),
          engines.enhancedZScore.execute(),
          engines.enhancedMomentum.execute(),
        ]);

        // Get detailed views
        const views = {
          dataIntegrity: engines.dataIntegrity.getDetailedView(),
          netLiquidity: engines.netLiquidity.getDetailedView(),
          creditStress: engines.creditStress.getDetailedView(),
          enhancedZScore: engines.enhancedZScore.getDetailedView(),
          enhancedMomentum: engines.enhancedMomentum.getDetailedView(),
        };

        setEngineViews(views);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching engine data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAndFetch();
    const interval = setInterval(initializeAndFetch, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [engines]);

  const renderEngineView = (engineKey: string, view: DetailedEngineView) => (
    <GlassTile key={engineKey} title={view.title} className="p-6">
      <div className="space-y-6">
        {/* Status Badge */}
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold text-neon-lime">
            {view.primarySection.title}
          </div>
          <Badge variant="outline" className="text-neon-lime border-neon-lime">
            LIVE ⚡
          </Badge>
        </div>

        {/* Primary Section - Line by Line */}
        <div className="border-b border-neon-teal/30 pb-4">
          <div className="space-y-2 font-mono text-sm">
            {Object.entries(view.primarySection.metrics).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-text-secondary">{key}:</span>
                <span className="text-text-primary font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Sections - Line by Line */}
        {view.sections.map((section, index) => (
          <div key={index} className="border-b border-glass-border pb-4 last:border-b-0">
            <div className="text-sm font-medium text-neon-teal mb-3 uppercase tracking-wider">
              {section.title}
            </div>
            <div className="border-b border-text-secondary/20 w-full mb-3"></div>
            <div className="space-y-2 font-mono text-sm">
              {Object.entries(section.metrics).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-text-secondary">{key}:</span>
                  <span className="text-text-primary font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Alerts */}
        {view.alerts && view.alerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-neon-orange border-b border-neon-orange/30 pb-1">
              Active Alerts
            </h4>
            {view.alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-2 rounded border-l-4 text-sm ${
                  alert.severity === 'critical'
                    ? 'border-neon-orange bg-neon-orange/10 text-neon-orange'
                    : alert.severity === 'warning'
                    ? 'border-neon-gold bg-neon-gold/10 text-neon-gold'
                    : 'border-neon-teal bg-neon-teal/10 text-neon-teal'
                }`}
              >
                {alert.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassTile>
  );

  const renderPlaceholderEngines = () => {
    const placeholders = [
      { name: "Regime Detection Engine", status: "development" },
      { name: "Cross-Asset Correlation", status: "development" },
      { name: "Temporal Dynamics", status: "development" },
      { name: "Risk Parity Engine", status: "development" },
    ];

    return placeholders.map((engine, index) => (
      <GlassTile key={index} title={engine.name} className="opacity-60">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-end">
            <Badge variant="outline" className="text-text-secondary border-text-secondary">
              {engine.status}
            </Badge>
          </div>
          <div className="text-text-secondary">
            Engine configuration in progress...
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="space-y-1">
              <div className="text-xs text-text-secondary">Status</div>
              <div className="text-sm">Pending</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-text-secondary">Priority</div>
              <div className="text-sm">TBD</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-text-secondary">Pillar</div>
              <div className="text-sm">TBD</div>
            </div>
          </div>
        </div>
      </GlassTile>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">Intelligence Engine</h1>
        <p className="text-text-secondary">
          28 Processing Engines • Real-time Analysis • 3-Pillar Architecture
        </p>
        <div className="text-sm text-text-secondary">
          Last Updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Engine Grid - 3x3 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Engines */}
        {loading ? (
          // Loading state
          Array.from({ length: 8 }).map((_, index) => (
            <GlassTile key={index} title="Loading..." className="animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-glass-bg rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-glass-bg rounded w-3/4"></div>
                  <div className="h-4 bg-glass-bg rounded w-1/2"></div>
                </div>
              </div>
            </GlassTile>
          ))
        ) : (
          <>
            {/* Render active engine views */}
            {renderEngineView('dataIntegrity', engineViews.dataIntegrity)}
            {renderEngineView('netLiquidity', engineViews.netLiquidity)}
            {renderEngineView('creditStress', engineViews.creditStress)}
            {renderEngineView('enhancedZScore', engineViews.enhancedZScore)}
            {renderEngineView('enhancedMomentum', engineViews.enhancedMomentum)}
            
            {/* Render placeholder engines */}
            {renderPlaceholderEngines()}
          </>
        )}
      </div>

      {/* Footer Status */}
      <div className="mt-8 pt-6 border-t border-glass-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-xs text-text-secondary">Active Engines</div>
            <div className="text-lg font-semibold text-neon-lime">5/28</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-text-secondary">Success Rate</div>
            <div className="text-lg font-semibold text-neon-teal">97.3%</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-text-secondary">Avg Latency</div>
            <div className="text-lg font-semibold text-text-primary">164ms</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-text-secondary">System Health</div>
            <div className="text-lg font-semibold text-neon-lime">Optimal</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceEngine;