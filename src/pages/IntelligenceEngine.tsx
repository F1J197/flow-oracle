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
import { PrimaryDealerPositionsEngineV6 } from "@/engines/PrimaryDealerPositionsEngineV6";
import { DetailedEngineView } from "@/types/engines";

const IntelligenceEngine = () => {
  const [engines, setEngines] = useState({
    dataIntegrity: new DataIntegrityEngine(),
    netLiquidity: new NetLiquidityEngine(),
    creditStress: new CreditStressEngine(),
    enhancedZScore: new EnhancedZScoreEngine(),
    enhancedMomentum: new EnhancedMomentumEngine(),
    primaryDealerPositions: new PrimaryDealerPositionsEngineV6(),
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
          engines.primaryDealerPositions.execute(),
        ]);

        // Get detailed views
        const views = {
          dataIntegrity: engines.dataIntegrity.getDetailedView(),
          netLiquidity: engines.netLiquidity.getDetailedView(),
          creditStress: engines.creditStress.getDetailedView(),
          enhancedZScore: engines.enhancedZScore.getDetailedView(),
          enhancedMomentum: engines.enhancedMomentum.getDetailedView(),
          primaryDealerPositions: engines.primaryDealerPositions.getDetailedView(),
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

        {/* Additional Sections - Enhanced Layout */}
        {view.sections.map((section, index) => (
          <div key={index} className="border-b border-glass-border pb-4 last:border-b-0">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-neon-teal uppercase tracking-wider">
                {section.title}
              </div>
              {/* Add mini status indicator for each section */}
              <div className="w-2 h-2 bg-neon-lime rounded-full animate-pulse opacity-60"></div>
            </div>
            <div className="border-b border-text-secondary/20 w-full mb-3"></div>
            <div className="space-y-2 font-mono text-sm">
              {Object.entries(section.metrics).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center group hover:bg-noir-surface/30 px-2 py-1 rounded transition-colors">
                  <span className="text-text-secondary group-hover:text-text-primary transition-colors">{key}:</span>
                  <span className="text-text-primary font-medium group-hover:text-neon-teal transition-colors">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Special Enhanced Momentum Section */}
        {engineKey === 'enhancedMomentum' && (
          <div className="border-t border-neon-teal/30 pt-4 mt-4">
            <div className="text-sm font-medium text-neon-lime mb-3 uppercase tracking-wider">
              DYNAMIC INSIGHTS
            </div>
            <div className="bg-noir-surface/60 border border-glass-border rounded-lg p-3 mb-4">
              <p className="text-sm text-text-primary font-mono leading-relaxed">
                {engines.enhancedMomentum.getCurrentInsight()}
              </p>
            </div>
            
            {/* Pattern Recognition Results */}
            {engines.enhancedMomentum.patternsData && engines.enhancedMomentum.patternsData.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-text-secondary uppercase tracking-wider">
                  DETECTED PATTERNS
                </div>
                {engines.enhancedMomentum.patternsData.map((pattern, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-neon-teal/10 border border-neon-teal/30 rounded px-2 py-1">
                    <span className="text-xs text-neon-teal">{pattern.pattern}</span>
                    <span className="text-xs text-text-primary">{(pattern.confidence * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Special Primary Dealer Positions Section */}
        {engineKey === 'primaryDealerPositions' && (
          <div className="border-t border-neon-teal/30 pt-4 mt-4">
            <div className="text-sm font-medium text-neon-lime mb-3 uppercase tracking-wider">
              MARKET MAKING INTELLIGENCE
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-noir-surface/60 border border-glass-border rounded-lg p-3">
                <div className="text-xs text-text-secondary mb-1">REGIME STATUS</div>
                <div className="text-lg font-bold text-neon-teal">
                  {engines.primaryDealerPositions.getCurrentData()?.analytics.regime || 'UNKNOWN'}
                </div>
              </div>
              <div className="bg-noir-surface/60 border border-glass-border rounded-lg p-3">
                <div className="text-xs text-text-secondary mb-1">FLOW DIRECTION</div>
                <div className="text-lg font-bold text-neon-lime">
                  {engines.primaryDealerPositions.getCurrentData()?.analytics.flowDirection || 'NEUTRAL'}
                </div>
              </div>
            </div>
            
            {/* Active Alerts */}
            {engines.primaryDealerPositions.getAlerts().filter(alert => !alert.acknowledged).length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-text-secondary uppercase tracking-wider">
                  ACTIVE ALERTS
                </div>
                {engines.primaryDealerPositions.getAlerts().filter(alert => !alert.acknowledged).slice(0, 3).map((alert, idx) => (
                  <div key={idx} className={`flex items-center justify-between rounded px-2 py-1 ${
                    alert.severity === 'CRITICAL' ? 'bg-neon-fuchsia/10 border border-neon-fuchsia/30' :
                    alert.severity === 'WARNING' ? 'bg-neon-gold/10 border border-neon-gold/30' :
                    'bg-neon-teal/10 border border-neon-teal/30'
                  }`}>
                    <span className={`text-xs ${
                      alert.severity === 'CRITICAL' ? 'text-neon-fuchsia' :
                      alert.severity === 'WARNING' ? 'text-neon-gold' : 'text-neon-teal'
                    }`}>{alert.message}</span>
                    <span className="text-xs text-text-primary">{alert.severity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
      { 
        name: "Regime Detection Engine", 
        status: "development",
        pillar: "Foundation",
        priority: "High",
        description: "Market cycle identification & regime transitions"
      },
      { 
        name: "Cross-Asset Correlation Engine", 
        status: "development",
        pillar: "Pillar 2",
        priority: "Medium",
        description: "Multi-asset momentum correlation analysis"
      },
      { 
        name: "Temporal Dynamics Engine", 
        status: "development",
        pillar: "Pillar 3",
        priority: "High",
        description: "Time-series momentum decomposition"
      },
      { 
        name: "Risk Parity Engine", 
        status: "design",
        pillar: "Synthesis",
        priority: "Medium",
        description: "Risk-adjusted momentum allocation"
      },
      { 
        name: "Options Flow Engine", 
        status: "design",
        pillar: "Pillar 2",
        priority: "Medium",
        description: "Derivatives positioning momentum"
      },
      { 
        name: "Macro Sentiment Engine", 
        status: "development",
        pillar: "Foundation",
        priority: "High",
        description: "Policy momentum & central bank signals"
      },
      { 
        name: "Crypto Liquidity Engine", 
        status: "development",
        pillar: "Pillar 1",
        priority: "Medium",
        description: "Digital asset momentum dynamics"
      },
      { 
        name: "Global Flow Engine", 
        status: "design",
        pillar: "Pillar 3",
        priority: "Low",
        description: "International capital flow momentum"
      },
      { 
        name: "Volatility Surface Engine", 
        status: "design",
        pillar: "Synthesis",
        priority: "Low",
        description: "Implied volatility momentum patterns"
      },
      { 
        name: "Positioning Engine", 
        status: "development",
        pillar: "Execution",
        priority: "High",
        description: "Institutional positioning momentum"
      },
      { 
        name: "Earnings Momentum Engine", 
        status: "design",
        pillar: "Pillar 2",
        priority: "Low",
        description: "Fundamental earnings momentum"
      },
      { 
        name: "Yield Curve Engine", 
        status: "development",
        pillar: "Foundation",
        priority: "Medium",
        description: "Interest rate momentum dynamics"
      },
      { 
        name: "Economic Surprise Engine", 
        status: "design",
        pillar: "Foundation",
        priority: "Medium",
        description: "Data surprise momentum tracking"
      },
      { 
        name: "Technical Pattern Engine", 
        status: "development",
        pillar: "Pillar 1",
        priority: "Low",
        description: "Chart pattern momentum validation"
      },
      { 
        name: "Seasonality Engine", 
        status: "design",
        pillar: "Pillar 3",
        priority: "Low",
        description: "Calendar-based momentum effects"
      },
      { 
        name: "News Sentiment Engine", 
        status: "design",
        pillar: "Synthesis",
        priority: "Low",
        description: "News flow momentum impact"
      },
      { 
        name: "Execution Engine", 
        status: "development",
        pillar: "Execution",
        priority: "Critical",
        description: "Order flow momentum optimization"
      },
      { 
        name: "Performance Attribution", 
        status: "development",
        pillar: "Execution",
        priority: "High",
        description: "Momentum strategy performance tracking"
      },
      { 
        name: "Risk Management Engine", 
        status: "development",
        pillar: "Execution",
        priority: "Critical",
        description: "Momentum-based risk controls"
      },
      { 
        name: "Alpha Generation Engine", 
        status: "design",
        pillar: "Synthesis",
        priority: "High",
        description: "Pure alpha momentum extraction"
      },
      { 
        name: "Multi-Timeframe Engine", 
        status: "development",
        pillar: "Foundation",
        priority: "Medium",
        description: "Cross-timeframe momentum synthesis"
      },
      { 
        name: "Machine Learning Engine", 
        status: "design",
        pillar: "Synthesis",
        priority: "Medium",
        description: "AI-powered momentum prediction"
      },
      { 
        name: "Stress Testing Engine", 
        status: "design",
        pillar: "Execution",
        priority: "High",
        description: "Momentum strategy stress scenarios"
      }
    ];

    return placeholders.map((engine, index) => (
      <GlassTile key={index} title={engine.name} className="opacity-60 hover:opacity-80 transition-opacity">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={`text-xs ${
                engine.status === 'development' ? 'text-neon-gold border-neon-gold' :
                engine.status === 'design' ? 'text-text-secondary border-text-secondary' :
                'text-neon-teal border-neon-teal'
              }`}
            >
              {engine.status.toUpperCase()}
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                engine.priority === 'Critical' ? 'text-neon-orange border-neon-orange' :
                engine.priority === 'High' ? 'text-neon-gold border-neon-gold' :
                engine.priority === 'Medium' ? 'text-neon-teal border-neon-teal' :
                'text-text-secondary border-text-secondary'
              }`}
            >
              {engine.priority}
            </Badge>
          </div>
          
          <div className="text-sm text-text-secondary leading-relaxed">
            {engine.description}
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-glass-border">
            <div className="space-y-1">
              <div className="text-xs text-text-secondary">Status</div>
              <div className="text-sm text-text-primary capitalize">{engine.status}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-text-secondary">Priority</div>
              <div className="text-sm text-text-primary">{engine.priority}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-text-secondary">Pillar</div>
              <div className="text-sm text-text-primary">{engine.pillar}</div>
            </div>
          </div>
        </div>
      </GlassTile>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

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
            {renderEngineView('primaryDealerPositions', engineViews.primaryDealerPositions)}
            
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
            <div className="text-lg font-semibold text-neon-lime">6/28</div>
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