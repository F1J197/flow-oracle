/**
 * Charts View - The Trading Floor
 * Draggable grid system with analytical overlays
 */

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ChartPanel {
  id: string;
  title: string;
  indicator: string;
  timeframe: string;
  overlays: string[];
}

export const ChartsView: React.FC = () => {
  const [panels, setPanels] = useState<ChartPanel[]>([
    { id: '1', title: 'Net Liquidity', indicator: 'NET_LIQ', timeframe: '1D', overlays: ['SMA20'] },
    { id: '2', title: 'VIX Term Structure', indicator: 'VIX', timeframe: '1D', overlays: ['ZSCORE'] },
    { id: '3', title: 'Credit Spreads', indicator: 'HY_SPREAD', timeframe: '1D', overlays: [] },
    { id: '4', title: 'Bitcoin Price', indicator: 'BTCUSD', timeframe: '1D', overlays: ['MOMENTUM'] }
  ]);

  const [masterTimeframe, setMasterTimeframe] = useState('1D');
  const [crosshairSync, setCrosshairSync] = useState(true);

  // Generate mock chart data
  const generateChartData = (indicator: string) => {
    const data = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      let value;
      
      switch (indicator) {
        case 'NET_LIQ':
          value = 5200 + Math.sin(i * 0.1) * 200 + Math.random() * 100;
          break;
        case 'VIX':
          value = 18 + Math.sin(i * 0.2) * 5 + Math.random() * 3;
          break;
        case 'HY_SPREAD':
          value = 350 + Math.sin(i * 0.15) * 50 + Math.random() * 20;
          break;
        case 'BTCUSD':
          value = 45000 + Math.sin(i * 0.1) * 5000 + Math.random() * 1000;
          break;
        default:
          value = 100 + Math.random() * 20;
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: value,
        sma20: value + Math.sin(i * 0.05) * 10,
        zscore: (Math.random() - 0.5) * 4,
        momentum: (Math.random() - 0.5) * 20
      });
    }
    
    return data;
  };

  const getIndicatorColor = (indicator: string) => {
    const colors: Record<string, string> = {
      'NET_LIQ': 'hsl(var(--neon-teal))',
      'VIX': 'hsl(var(--neon-orange))',
      'HY_SPREAD': 'hsl(var(--neon-gold))',
      'BTCUSD': 'hsl(var(--btc-primary))'
    };
    return colors[indicator] || 'hsl(var(--text-primary))';
  };

  const addOverlay = (panelId: string, overlay: string) => {
    setPanels(prev => prev.map(panel => 
      panel.id === panelId 
        ? { ...panel, overlays: [...panel.overlays, overlay] }
        : panel
    ));
  };

  const removeOverlay = (panelId: string, overlay: string) => {
    setPanels(prev => prev.map(panel => 
      panel.id === panelId 
        ? { ...panel, overlays: panel.overlays.filter(o => o !== overlay) }
        : panel
    ));
  };

  const renderChart = (panel: ChartPanel) => {
    const data = generateChartData(panel.indicator);
    const color = getIndicatorColor(panel.indicator);

    return (
      <div key={panel.id} className="bg-card border border-border h-80">
        {/* Chart Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="text-sm font-bold text-primary font-mono uppercase tracking-wider">
              {panel.title}
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {panel.indicator}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select defaultValue={panel.timeframe}>
              <SelectTrigger className="w-16 h-6 text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1H">1H</SelectItem>
                <SelectItem value="4H">4H</SelectItem>
                <SelectItem value="1D">1D</SelectItem>
                <SelectItem value="1W">1W</SelectItem>
              </SelectContent>
            </Select>
            
            <Select onValueChange={(value) => addOverlay(panel.id, value)}>
              <SelectTrigger className="w-20 h-6 text-xs font-mono">
                <SelectValue placeholder="Add" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SMA20">SMA20</SelectItem>
                <SelectItem value="ZSCORE">Z-Score</SelectItem>
                <SelectItem value="MOMENTUM">Momentum</SelectItem>
                <SelectItem value="REGIME">Regime</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overlays */}
        {panel.overlays.length > 0 && (
          <div className="flex items-center space-x-2 p-2 bg-secondary border-b border-border">
            {panel.overlays.map(overlay => (
              <Badge 
                key={overlay}
                variant="secondary" 
                className="text-xs font-mono cursor-pointer hover:bg-destructive"
                onClick={() => removeOverlay(panel.id, overlay)}
              >
                {overlay} ×
              </Badge>
            ))}
          </div>
        )}

        {/* Chart */}
        <div className="p-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--text-secondary))"
                fontSize={10}
                fontFamily="'Roboto Mono', monospace"
              />
              <YAxis 
                stroke="hsl(var(--text-secondary))"
                fontSize={10}
                fontFamily="'Roboto Mono', monospace"
              />
              
              {/* Main line */}
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
              
              {/* Overlays */}
              {panel.overlays.includes('SMA20') && (
                <Line 
                  type="monotone" 
                  dataKey="sma20" 
                  stroke="hsl(var(--text-secondary))"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
              
              {panel.overlays.includes('ZSCORE') && (
                <>
                  <ReferenceLine y={2} stroke="hsl(var(--neon-orange))" strokeDasharray="2 2" />
                  <ReferenceLine y={-2} stroke="hsl(var(--neon-orange))" strokeDasharray="2 2" />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 min-h-screen bg-background">
      {/* Charts Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-wider mb-2" style={{ color: 'hsl(var(--btc-primary))' }}>
            ANALYTICAL CHARTS
          </h2>
          <div className="text-sm text-secondary font-mono">
            4 panels active • Real-time data feed
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-xs text-secondary font-mono uppercase">Master Timeframe:</label>
            <Select value={masterTimeframe} onValueChange={setMasterTimeframe}>
              <SelectTrigger className="w-20 h-8 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1H">1H</SelectItem>
                <SelectItem value="4H">4H</SelectItem>
                <SelectItem value="1D">1D</SelectItem>
                <SelectItem value="1W">1W</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant={crosshairSync ? "default" : "outline"}
            size="sm"
            onClick={() => setCrosshairSync(!crosshairSync)}
            className="font-mono text-xs"
          >
            SYNC CROSSHAIRS
          </Button>
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {panels.map(panel => renderChart(panel))}
      </div>

      {/* Chart Controls */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4">
          <div className="text-xs text-secondary font-mono uppercase tracking-wider mb-2">
            Drawing Tools
          </div>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full font-mono text-xs">
              TREND LINE
            </Button>
            <Button variant="outline" size="sm" className="w-full font-mono text-xs">
              FIBONACCI
            </Button>
            <Button variant="outline" size="sm" className="w-full font-mono text-xs">
              SUPPORT/RESISTANCE
            </Button>
          </div>
        </div>
        
        <div className="bg-card border border-border p-4">
          <div className="text-xs text-secondary font-mono uppercase tracking-wider mb-2">
            Indicators
          </div>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full font-mono text-xs">
              RSI
            </Button>
            <Button variant="outline" size="sm" className="w-full font-mono text-xs">
              MACD
            </Button>
            <Button variant="outline" size="sm" className="w-full font-mono text-xs">
              BOLLINGER
            </Button>
          </div>
        </div>
        
        <div className="bg-card border border-border p-4">
          <div className="text-xs text-secondary font-mono uppercase tracking-wider mb-2">
            Regime Overlay
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-secondary">QE Periods:</span>
              <span className="text-neon-lime">ON</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-secondary">Crisis Events:</span>
              <span className="text-neon-orange">ON</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-secondary">Halving Cycles:</span>
              <span className="text-secondary">OFF</span>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border p-4">
          <div className="text-xs text-secondary font-mono uppercase tracking-wider mb-2">
            Export
          </div>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full font-mono text-xs">
              PNG
            </Button>
            <Button variant="outline" size="sm" className="w-full font-mono text-xs">
              CSV DATA
            </Button>
            <Button variant="outline" size="sm" className="w-full font-mono text-xs">
              SHARE LINK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsView;