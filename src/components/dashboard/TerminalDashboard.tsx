import React from 'react';
import { Clock, Activity, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useFoundationDataIntegrity } from '@/hooks/useFoundationDataIntegrity';
import { DataIntegrityDashboardTile } from '@/engines/foundation/DataIntegrityEngine';
import { SafeZScoreTile } from '@/components/dashboard/SafeZScoreTile';

export const TerminalDashboard = () => {
  console.log('🖥️ TerminalDashboard component initializing...');
  
  try {
    const { dashboardData, loading, stats } = useUnifiedDashboard({ autoRefresh: true });
    console.log('📊 Dashboard data loaded:', { loading, hasData: !!dashboardData });
    
    const { metrics: dataIntegrityMetrics, loading: dataIntegrityLoading, error: dataIntegrityError } = useFoundationDataIntegrity();
    console.log('🔐 Data integrity loaded:', { loading: dataIntegrityLoading, hasMetrics: !!dataIntegrityMetrics, error: dataIntegrityError });
    
    console.log('🎨 TerminalDashboard rendering with data:', { 
      dashboardLoading: loading, 
      dataIntegrityLoading,
      hasStats: !!stats,
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

  if (loading) {
    console.log('⏳ Dashboard loading...');
    return (
      <div className="bg-bg-primary text-text-primary font-mono h-screen overflow-hidden">
        <div className="p-4">
          <div className="text-neon-teal">LOADING LIQUIDITY² TERMINAL...</div>
        </div>
      </div>
    );
  }

  console.log('🎨 Rendering TerminalDashboard...');
  return (
    <div className="bg-bg-primary text-text-primary font-mono h-screen overflow-hidden">
      {/* Terminal Header */}
      <div className="border-b border-neon-teal/30 bg-bg-secondary p-3">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center space-x-6">
            <div className="text-neon-teal font-bold text-sm tracking-widest">LIQUIDITY² V6.0</div>
            <div className="flex items-center space-x-2">
              <Activity className="w-3 h-3 text-neon-lime animate-pulse" />
              <span className="text-neon-lime">LIVE</span>
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
          </div>
        </div>
      </div>

      {/* Main Terminal Grid */}
      <div className="p-4 grid grid-cols-4 gap-4 h-full">
        {/* Net Liquidity Panel */}
        <div className="col-span-1 bg-bg-tile border border-neon-teal/30 p-3">
          <div className="border-b border-neon-teal/20 pb-2 mb-3">
            <div className="text-neon-teal text-xs font-bold tracking-wider">NET LIQUIDITY</div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary text-xs">CURRENT:</span>
              <span className="text-neon-lime font-bold text-sm">$5.626T</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary text-xs">24H CHG:</span>
              <span className="text-neon-lime text-sm">+2.3%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary text-xs">TREND:</span>
              <span className="text-neon-lime text-sm flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                EXPANDING
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-neon-teal/20">
              <div className="text-text-secondary text-xs mb-1">COMPOSITION:</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>FED_BSH:</span>
                  <span className="text-neon-amber">$8.2T</span>
                </div>
                <div className="flex justify-between">
                  <span>TGA:</span>
                  <span className="text-neon-orange">-$0.8T</span>
                </div>
                <div className="flex justify-between">
                  <span>RRP:</span>
                  <span className="text-neon-orange">-$1.8T</span>
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
        <div className="col-span-2 bg-bg-tile border border-neon-amber/50 p-4">
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
              Liquidity expansion in progress. Risk levels manageable.
              <br />
              Monitor for regime shift signals.
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

        {/* Alert Feed Panel */}
        <div className="col-span-2 bg-bg-tile border border-neon-teal/30 p-3">
          <div className="border-b border-neon-teal/20 pb-2 mb-3">
            <div className="text-neon-teal text-xs font-bold tracking-wider">ALERT FEED</div>
          </div>
          <div className="space-y-2 text-xs h-32 overflow-y-auto">
            <div className="flex justify-between">
              <span className="text-neon-lime">[15:42:12]</span>
              <span className="text-text-secondary">NET_LIQ: Expansion continues (+2.3%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neon-gold">[15:41:28]</span>
              <span className="text-text-secondary">CREDIT: HYG spread tightening</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neon-teal">[15:40:15]</span>
              <span className="text-text-secondary">MOMENTUM: Technical indicators positive</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neon-lime">[15:39:42]</span>
              <span className="text-text-secondary">REGIME: Spring phase strengthening</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neon-orange">[15:38:19]</span>
              <span className="text-text-secondary">DEALER: Positioning adjusted</span>
            </div>
          </div>
        </div>

        {/* Data Integrity Panel - Foundation Engine */}
        <div className="col-span-1">
          <DataIntegrityDashboardTile
            data={dataIntegrityMetrics}
            loading={dataIntegrityLoading}
            error={dataIntegrityError}
            className="h-full"
          />
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="border-t border-neon-teal/30 bg-bg-secondary p-2">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center space-x-4">
            <span className="text-text-secondary">LAST_UPDATE:</span>
            <span className="text-neon-teal">{getCurrentTime()}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-text-secondary">VERSION:</span>
            <span className="text-neon-teal">V6.0.0</span>
            <span className="text-text-secondary">•</span>
            <span className="text-text-secondary">©2024 LIQUIDITY² INTELLIGENCE</span>
          </div>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('🚨 TerminalDashboard error:', error);
    return (
      <div style={{ 
        color: '#00FFFF', 
        backgroundColor: '#000000', 
        padding: '20px', 
        fontFamily: 'monospace',
        minHeight: '100vh'
      }}>
        <h1>Terminal Dashboard Error</h1>
        <p>An error occurred while loading the terminal dashboard:</p>
        <pre>{error instanceof Error ? error.message : String(error)}</pre>
        <p>Please check the console for more details.</p>
      </div>
    );
  }
};