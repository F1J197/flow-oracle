import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

interface MarketData {
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  timestamp: Date;
}

/**
 * Live Data Sidebar - Real-time market data stream
 * Clean typography and semantic color coding
 */
export const LiveDataSidebar: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Simulate real-time data updates
    const updateData = () => {
      const symbols = ['BTC', 'SPX', 'VIX', 'DXY', 'TNX', 'GOLD'];
      const newData = symbols.map(symbol => ({
        symbol,
        value: Math.random() * 100000 + 50000,
        change: (Math.random() - 0.5) * 1000,
        changePercent: (Math.random() - 0.5) * 5,
        timestamp: new Date()
      }));
      setMarketData(newData);
      setLastUpdate(new Date());
    };

    // Initial data
    updateData();
    
    // Update every 5 seconds
    const interval = setInterval(updateData, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatValue = (value: number, symbol: string) => {
    if (symbol === 'BTC') return `$${value.toFixed(0)}`;
    if (symbol === 'VIX') return value.toFixed(2);
    return value.toFixed(2);
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-positive' : 'text-negative';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown;
  };

  return (
    <div className="space-y-4">
      {/* Live indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-accent animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">
            LIVE FEED
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {lastUpdate.toLocaleTimeString()}
        </span>
      </div>

      {/* Market data stream */}
      <div className="space-y-3">
        {marketData.map((item, index) => {
          const ChangeIcon = getChangeIcon(item.change);
          return (
            <div
              key={item.symbol}
              className="flex items-center justify-between p-3 bg-muted/50 border border-border"
            >
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-xs font-mono">
                  {item.symbol}
                </Badge>
                <div>
                  <div className="font-mono font-bold text-foreground">
                    {formatValue(item.value, item.symbol)}
                  </div>
                  <div className={`text-xs font-mono ${getChangeColor(item.change)}`}>
                    {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
              
              <ChangeIcon 
                className={`w-4 h-4 ${getChangeColor(item.change)}`}
              />
            </div>
          );
        })}
      </div>

      {/* Live signals */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="w-4 h-4 text-warning" />
          <span className="text-xs font-bold text-foreground">LIVE SIGNALS</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">MOMENTUM</span>
            <Badge variant="outline" className="text-positive border-positive">
              BULLISH
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">VOLATILITY</span>
            <Badge variant="outline" className="text-warning border-warning">
              ELEVATED
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">LIQUIDITY</span>
            <Badge variant="outline" className="text-accent border-accent">
              NORMAL
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};