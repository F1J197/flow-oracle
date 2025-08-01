/**
 * Dashboard View - Executive Command Center
 * Dynamic smart tiles with importance-based positioning
 */

import React, { useEffect, useState } from 'react';
import { EngineOutput } from '@/engines/BaseEngine';
import { dataFlowManager } from '@/engines/DataFlowManager';
import { ENGINE_REGISTRY } from '@/config/engine.registry';
import { SmartTile } from '@/components/dashboard/SmartTile';
import { NetLiquidityGauge } from '@/engines/liquidity/NetLiquidityEngine/components/GaugeVisualization';
import { LiquidityGauge } from '@/components/dashboard/LiquidityGauge';
import { CreditStressHeatmap } from '@/components/dashboard/CreditStressHeatmap';
import { MarketRegimeIndicator } from '@/components/dashboard/MarketRegimeIndicator';

interface TileData {
  engineId: string;
  data: EngineOutput;
  importance: number;
  size: 'small' | 'medium' | 'large';
}

export const DashboardView: React.FC = () => {
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Start data flow manager
    dataFlowManager.start();

    // Update tiles every 5 seconds
    const updateInterval = setInterval(() => {
      updateTiles();
    }, 5000);

    // Initial tile update
    updateTiles();

    return () => {
      clearInterval(updateInterval);
      dataFlowManager.stop();
    };
  }, []);

  const updateTiles = () => {
    const engineOutputs = dataFlowManager.getAllEngineOutputs();
    const newTiles: TileData[] = [];

    // Create tiles for all engines with data
    Object.keys(ENGINE_REGISTRY).forEach(engineId => {
      const config = ENGINE_REGISTRY[engineId];
      let data = engineOutputs.get(engineId);
      
      // Use mock data if no real data available
      if (!data) {
        data = generateMockData(engineId);
      }
      
      const importance = calculateImportance(data, config);
      const size = getTileSize(importance);
      
      newTiles.push({
        engineId,
        data,
        importance,
        size
      });
    });

    // Sort by importance (highest first)
    newTiles.sort((a, b) => b.importance - a.importance);
    
    setTiles(newTiles);
    setLastUpdate(new Date());
  };

  const calculateImportance = (data: EngineOutput, config: any): number => {
    let importance = config.priority || 50;
    
    // Boost importance based on signal strength
    if (data.signal === 'RISK_OFF' || data.signal === 'WARNING') {
      importance += 20;
    }
    
    // Boost based on confidence
    importance += (data.confidence - 50) * 0.4;
    
    // Cap at 100
    return Math.min(100, Math.max(0, importance));
  };

  const getGridLayout = () => {
    const large = tiles.filter(t => t.size === 'large');
    const medium = tiles.filter(t => t.size === 'medium');
    const small = tiles.filter(t => t.size === 'small');
    
    // Dynamic grid: Large tiles get more space
    const totalTiles = tiles.length;
    if (totalTiles <= 6) {
      return 'grid-cols-2 grid-rows-3';
    } else if (totalTiles <= 9) {
      return 'grid-cols-3 grid-rows-3';
    } else {
      return 'grid-cols-4 grid-rows-4';
    }
  };

  const getGridItemClass = (size: string) => {
    switch (size) {
      case 'large':
        return 'col-span-2 row-span-2';
      case 'medium':
        return 'col-span-1 row-span-1';
      case 'small':
        return 'col-span-1 row-span-1';
      default:
        return 'col-span-1 row-span-1';
    }
  };

  const getGlobalMarketCondition = () => {
    const highImportanceTiles = tiles.filter(t => t.importance > 80);
    const riskOffSignals = highImportanceTiles.filter(t => t.data.signal === 'RISK_OFF').length;
    const warningSignals = highImportanceTiles.filter(t => t.data.signal === 'WARNING').length;
    
    if (riskOffSignals >= 2) return { condition: 'RISK_OFF', color: 'hsl(var(--neon-orange))' };
    if (warningSignals >= 3) return { condition: 'WARNING', color: 'hsl(var(--neon-gold))' };
    return { condition: 'RISK_ON', color: 'hsl(var(--neon-lime))' };
  };

  const globalCondition = getGlobalMarketCondition();

  return (
    <div className="p-6 min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-6">
            <h2 className="text-2xl font-bold tracking-wider" style={{ color: 'hsl(var(--btc-primary))' }}>
              EXECUTIVE DASHBOARD
            </h2>
            <div 
              className="px-4 py-2 border font-mono text-sm font-bold tracking-wider"
              style={{ 
                borderColor: globalCondition.color,
                color: globalCondition.color
              }}
            >
              {globalCondition.condition}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-secondary font-mono">
              LAST UPDATE: {lastUpdate.toLocaleTimeString()}
            </div>
            <div className="text-xs text-muted font-mono">
              {tiles.length} ENGINES ACTIVE
            </div>
          </div>
        </div>

        {/* Key Metrics Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border p-3">
            <div className="text-xs text-secondary font-mono uppercase tracking-wider mb-1">
              Net Liquidity
            </div>
            <div className="text-lg font-bold text-data font-mono">
              $5.2T
            </div>
            <div className="text-xs text-neon-lime font-mono">
              +2.3% WoW
            </div>
          </div>
          
          <div className="bg-card border border-border p-3">
            <div className="text-xs text-secondary font-mono uppercase tracking-wider mb-1">
              Volatility Regime
            </div>
            <div className="text-lg font-bold text-data font-mono">
              NORMAL
            </div>
            <div className="text-xs text-secondary font-mono">
              VIX: 18.5
            </div>
          </div>
          
          <div className="bg-card border border-border p-3">
            <div className="text-xs text-secondary font-mono uppercase tracking-wider mb-1">
              Credit Stress
            </div>
            <div className="text-lg font-bold text-data font-mono">
              385bp
            </div>
            <div className="text-xs text-neon-orange font-mono">
              +15bp
            </div>
          </div>
          
          <div className="bg-card border border-border p-3">
            <div className="text-xs text-secondary font-mono uppercase tracking-wider mb-1">
              Composite Score
            </div>
            <div className="text-lg font-bold text-data font-mono">
              72/100
            </div>
            <div className="text-xs text-neon-lime font-mono">
              BULLISH
            </div>
          </div>
        </div>
      </div>

      {/* Featured Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <LiquidityGauge 
          value={75} 
          trend="up" 
          status="expanding" 
        />
        <MarketRegimeIndicator 
          regime="SUMMER" 
          confidence={85} 
          duration={45} 
        />
        <CreditStressHeatmap data={[]} />
      </div>

      {/* Dynamic Engine Grid */}
      <div className={`grid gap-4 ${getGridLayout()} auto-rows-fr`}>
        {tiles.slice(0, 16).map((tile, index) => {
          // Special treatment for Net Liquidity Engine
          if (tile.engineId === 'net-liquidity' && tile.size === 'large') {
            return (
              <div key={tile.engineId} className={getGridItemClass(tile.size)}>
                <div className="h-full bg-card border border-border p-4">
                  <div className="text-sm font-bold text-primary font-mono mb-4 uppercase tracking-wider">
                    {ENGINE_REGISTRY[tile.engineId]?.name}
                  </div>
                  <div className="flex items-center justify-center h-full">
                    <NetLiquidityGauge data={tile.data} size={180} />
                  </div>
                </div>
              </div>
            );
          }
          
          return (
            <div key={tile.engineId} className={getGridItemClass(tile.size)}>
              <SmartTile
                engineId={tile.engineId}
                data={tile.data}
                importance={tile.importance}
                size={tile.size}
              />
            </div>
          );
        })}
      </div>
      
      {/* Alert Ticker */}
      <div className="mt-6 bg-card border border-border p-3">
        <div className="flex items-center space-x-4">
          <div className="text-xs font-bold text-primary font-mono uppercase tracking-wider">
            ALERTS
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="animate-scroll whitespace-nowrap text-sm font-mono text-secondary">
              • CUSIP ANOMALY DETECTED: 915400BG3 unusual activity • 
              CREDIT SPREADS WIDENING: HY +15bp intraday • 
              NET LIQUIDITY EXPANDING: +$50B since Monday •
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock data generator for development
const generateMockData = (engineId: string): EngineOutput => {
  const signals: EngineOutput['signal'][] = ['RISK_ON', 'RISK_OFF', 'NEUTRAL', 'WARNING'];
  const randomSignal = signals[Math.floor(Math.random() * signals.length)];
  
  return {
    primaryMetric: {
      value: Math.random() * 100,
      change24h: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5
    },
    signal: randomSignal,
    confidence: 60 + Math.random() * 30,
    analysis: `${engineId} analysis with current market conditions showing ${randomSignal.toLowerCase()} signals.`,
    subMetrics: {
      regime: 'NORMAL',
      trend: Math.random() > 0.5 ? 'EXPANDING' : 'CONTRACTING',
      compositeScore: Math.random() * 100
    }
  };
};

const getTileSize = (importance: number): 'small' | 'medium' | 'large' => {
  if (importance > 85) return 'large';
  if (importance > 65) return 'medium';
  return 'small';
};

export default DashboardView;