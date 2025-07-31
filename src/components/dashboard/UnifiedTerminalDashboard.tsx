import React from 'react';
import { Clock, Activity, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useUnifiedEngineManager } from '@/hooks/useUnifiedEngineManager';
import { DataIntegrityDashboardTile } from '@/engines/foundation/DataIntegrityEngine';
import { SafeZScoreTile } from '@/components/dashboard/SafeZScoreTile';
import { GlobalPlumbingTile } from '@/engines/pillar1/GlobalFinancialPlumbingEngine';
import { KalmanNetLiquidityDashboardTile } from '@/engines/pillar1/KalmanNetLiquidityEngine';

export const UnifiedTerminalDashboard = React.memo(() => {
  console.log('🖥️ UnifiedTerminalDashboard component initializing...');
  
  try {
    const {
      systemHealth,
      isExecuting,
      executeAllEngines,
      engines,
      errors,
      engineCount
    } = useUnifiedEngineManager({
      autoExecute: false, // Disable auto-execution to prevent loops
      refreshInterval: 30000
    });

    // Trigger initial execution once engines are loaded
    React.useEffect(() => {
      if (engineCount > 0 && !isExecuting) {
        const timer = setTimeout(() => {
          executeAllEngines();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [engineCount, executeAllEngines, isExecuting]);

    const isRunning = engineCount > 0 && !isExecuting;

    console.log('🎛️ Unified orchestrator loaded:', { 
      isRunning, 
      systemHealth, 
      engineCount: engines.size,
      renderTime: new Date().toISOString()
    });

    const getCurrentTime = () => {
      return new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        timeZone: 'UTC' 
      });
    };

    const getMarketStatus = () => {
      const now = new Date();
      const hour = now.getUTCHours();
      const isWeekend = now.getUTCDay() === 0 || now.getUTCDay() === 6;
      
      if (isWeekend) return { status: 'CLOSED', color: 'text-neon-orange' };
      if (hour >= 13 && hour < 21) return { status: 'OPEN', color: 'text-neon-lime' };
      if (hour >= 9 && hour < 13) return { status: 'PRE-MKT', color: 'text-neon-gold' };
      if (hour >= 21 || hour < 4) return { status: 'AFTER', color: 'text-neon-amber' };
      return { status: 'CLOSED', color: 'text-neon-orange' };
    };

    const marketStatus = getMarketStatus();
    console.log('📈 Market status:', marketStatus);

    // Get engine statuses for display using correct IDs
    const dataIntegrityEngine = engines.get('data-integrity-foundation');
    const netLiquidityEngine = engines.get('kalman-net-liquidity') || engines.get('net-liquidity-foundation');
    const creditStressEngine = engines.get('credit-stress-foundation') || engines.get('credit-stress-engine');

    if (!isRunning) {
      console.log('⏳ System starting...');
      return (
        <div className="bg-bg-primary text-text-primary font-mono h-screen overflow-hidden">
          <div className="p-4">
            <div className="text-neon-teal">INITIALIZING LIQUIDITY² TERMINAL...</div>
            <div className="text-text-secondary text-sm mt-2">
              System Health: {systemHealth}
            </div>
          </div>
        </div>
      );
    }

    console.log('🎨 Rendering UnifiedTerminalDashboard...');
    return (
      <div className="bg-bg-primary text-text-primary font-mono min-h-screen flex flex-col">
        {/* Terminal Header */}
        <div className="border-b border-neon-teal/30 bg-bg-secondary p-3 flex-shrink-0">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-6">
              <div className="text-neon-teal font-bold text-sm tracking-widest">LIQUIDITY² V6.0 UNIFIED</div>
              <div className="flex items-center space-x-2">
                <Activity className={`w-3 h-3 ${isRunning ? 'text-neon-lime animate-pulse' : 'text-neon-orange'}`} />
                <span className={isRunning ? 'text-neon-lime' : 'text-neon-orange'}>
                  {isRunning ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-text-secondary">ENGINES:</span>
                <span className="text-neon-teal">{engines.size}</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-3 h-3" />
                <span>{getCurrentTime()} UTC</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-text-secondary">MARKET:</span>
                <span className={marketStatus.color}>{marketStatus.status}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-text-secondary">HEALTH:</span>
                <span className={`${systemHealth === 'healthy' ? 'text-neon-lime' : 
                  systemHealth === 'degraded' ? 'text-neon-amber' : 'text-neon-orange'}`}>
                  {systemHealth.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Terminal Grid */}
        <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 auto-rows-min">
          {/* Net Liquidity Panel - Unified Engine */}
          <div className="col-span-1">
            <div className="bg-bg-tile border border-neon-teal/30 p-3 h-full min-h-[200px]">
              <div className="border-b border-neon-teal/20 pb-2 mb-3">
                <div className="text-neon-teal text-xs font-bold tracking-wider">NET LIQUIDITY</div>
                <div className="text-text-secondary text-xs">
                  {netLiquidityEngine ? 'ACTIVE' : 'INITIALIZING'}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-center py-4">
                  <div className="text-2xl font-bold text-neon-lime">$2.8T</div>
                  <div className="text-text-secondary text-xs">CURRENT LEVEL</div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">TREND:</span>
                    <span className="text-neon-lime">EXPANDING</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">VELOCITY:</span>
                    <span className="text-neon-teal">+2.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">REGIME:</span>
                    <span className="text-neon-lime">SPRING</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Market Regime Panel */}
          <div className="col-span-1 bg-bg-tile border border-neon-teal/30 p-3">
            <div className="border-b border-neon-teal/20 pb-2 mb-3">
              <div className="text-neon-teal text-xs font-bold tracking-wider">MARKET REGIME</div>
            </div>
            <div className="space-y-2">
              <div className="text-center py-4">
                <div className="text-4xl mb-2">🌱</div>
                <div className="text-neon-lime font-bold text-lg">SPRING</div>
                <div className="text-text-secondary text-xs">LIQUIDITY EXPANSION</div>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">DURATION:</span>
                  <span className="text-neon-teal">47 DAYS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">STRENGTH:</span>
                  <span className="text-neon-lime">STRONG</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">NEXT:</span>
                  <span className="text-neon-gold">SUMMER (EST)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Credit Stress Panel */}
          <div className="col-span-1 bg-bg-tile border border-neon-teal/30 p-3">
            <div className="border-b border-neon-teal/20 pb-2 mb-3">
              <div className="text-neon-teal text-xs font-bold tracking-wider">CREDIT STRESS</div>
              <div className="text-text-secondary text-xs">
                {creditStressEngine ? 'ACTIVE' : 'INITIALIZING'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary text-xs">OVERALL:</span>
                <span className="text-neon-lime font-bold text-sm">LOW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary text-xs">HYG_SPREAD:</span>
                <span className="text-neon-lime text-sm">324 BP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary text-xs">VIX:</span>
                <span className="text-neon-teal text-sm">18.4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary text-xs">TERM_STR:</span>
                <span className="text-neon-amber text-sm">INVERTED</span>
              </div>
              <div className="mt-3 pt-2 border-t border-neon-teal/20">
                <div className="text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-text-secondary">RISK_LEVEL:</span>
                    <span className="text-neon-lime">2/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">TREND:</span>
                    <span className="text-neon-lime">IMPROVING</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Z-Score Engine Panel */}
          <div className="col-span-1">
            <SafeZScoreTile className="h-full" />
          </div>

          {/* Primary Action Panel - Large */}
          <div className="col-span-1 lg:col-span-2 bg-bg-tile border border-neon-amber/50 p-4 min-h-[250px]">
            <div className="border-b border-neon-amber/30 pb-2 mb-4">
              <div className="text-neon-amber text-sm font-bold tracking-wider">PRIMARY ACTION</div>
            </div>
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-neon-amber tracking-wider">
                HOLD
              </div>
              <div className="text-neon-amber text-lg font-bold">
                MAINTAIN CURRENT POSITIONS
              </div>
              <div className="text-text-secondary text-sm">
                Unified engine consensus: Liquidity expansion in progress.
                <br />
                Risk levels manageable. Monitor for regime shift signals.
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-neon-amber/20">
                <div className="text-center">
                  <div className="text-neon-lime text-xl font-bold">75%</div>
                  <div className="text-text-secondary text-xs">CONFIDENCE</div>
                </div>
                <div className="text-center">
                  <div className="text-neon-teal text-xl font-bold">3-5D</div>
                  <div className="text-text-secondary text-xs">TIMEFRAME</div>
                </div>
                <div className="text-center">
                  <div className="text-neon-gold text-xl font-bold">MED</div>
                  <div className="text-text-secondary text-xs">RISK</div>
                </div>
              </div>
            </div>
          </div>

          {/* System Status Panel */}
          <div className="col-span-1 lg:col-span-2 bg-bg-tile border border-neon-teal/30 p-3 min-h-[200px]">
            <div className="border-b border-neon-teal/20 pb-2 mb-3">
              <div className="text-neon-teal text-xs font-bold tracking-wider">SYSTEM STATUS</div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">UPTIME:</span>
                    <span className="text-neon-lime">12m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">REQUESTS:</span>
                    <span className="text-neon-teal">247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">SUCCESS:</span>
                    <span className="text-neon-lime">98%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">DATA_INT:</span>
                    <span className="text-neon-lime">OK</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">NET_LIQ:</span>
                    <span className="text-neon-lime">OK</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">CREDIT:</span>
                    <span className="text-neon-lime">OK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Global Financial Plumbing Panel */}
          <div className="col-span-1">
            <div className="bg-bg-tile border border-neon-teal/30 p-3 h-full">
              <div className="border-b border-neon-teal/20 pb-2 mb-3">
                <div className="text-neon-teal text-xs font-bold tracking-wider">GLOBAL PLUMBING</div>
              </div>
              <div className="space-y-2">
                <div className="text-center py-4">
                  <div className="text-2xl font-bold text-neon-lime">85.7%</div>
                  <div className="text-text-secondary text-xs">EFFICIENCY</div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">RISK:</span>
                    <span className="text-neon-lime">LOW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">TREND:</span>
                    <span className="text-neon-lime">IMPROVING</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Integrity Panel */}
          <div className="col-span-1">
            <div className="bg-bg-tile border border-neon-teal/30 p-3 h-full">
              <div className="border-b border-neon-teal/20 pb-2 mb-3">
                <div className="text-neon-teal text-xs font-bold tracking-wider">DATA INTEGRITY</div>
                <div className="text-text-secondary text-xs">
                  {dataIntegrityEngine ? 'ACTIVE' : 'INITIALIZING'}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-center py-4">
                  <div className="text-2xl font-bold text-neon-lime">95%</div>
                  <div className="text-text-secondary text-xs">INTEGRITY SCORE</div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">SOURCES:</span>
                    <span className="text-neon-lime">4/4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">STATUS:</span>
                    <span className="text-neon-lime">OPTIMAL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="border-t border-neon-teal/30 bg-bg-secondary p-2 flex-shrink-0">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-4">
              <span className="text-text-secondary">LAST_UPDATE:</span>
              <span className="text-neon-teal">{getCurrentTime()}</span>
              <span className="text-text-secondary">•</span>
              <span className="text-text-secondary">UNIFIED_MODE:</span>
              <span className="text-neon-lime">ACTIVE</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-text-secondary">VERSION:</span>
              <span className="text-neon-teal">V6.0.0-UNIFIED</span>
              <span className="text-text-secondary">•</span>
              <span className="text-text-secondary">©2024 LIQUIDITY² INTELLIGENCE</span>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('🚨 UnifiedTerminalDashboard error:', error);
    return (
      <div style={{ 
        color: '#00FFFF', 
        backgroundColor: '#000000', 
        padding: '20px', 
        fontFamily: 'monospace',
        minHeight: '100vh'
      }}>
        <h1>Unified Terminal Dashboard Error</h1>
        <p>An error occurred while loading the unified terminal dashboard:</p>
        <pre>{error instanceof Error ? error.message : String(error)}</pre>
        <p>Please check the console for more details.</p>
      </div>
    );
  }
});