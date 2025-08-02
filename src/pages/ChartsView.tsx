import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, DollarSign, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface MarketDataPoint {
  time: string;
  btc: number;
  spy: number;
  vix: number;
}

const ChartsView = () => {
  const [marketData, setMarketData] = useState<MarketDataPoint[]>([]);
  const [currentPrices, setCurrentPrices] = useState({
    btc: 67332,
    spy: 575,
    vix: 18.1
  });

  useEffect(() => {
    // Generate sample chart data
    const generateData = () => {
      const now = new Date();
      const data: MarketDataPoint[] = [];
      
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          btc: currentPrices.btc + (Math.random() - 0.5) * 2000,
          spy: currentPrices.spy + (Math.random() - 0.5) * 20,
          vix: currentPrices.vix + (Math.random() - 0.5) * 5
        });
      }
      
      setMarketData(data);
    };

    generateData();
    const interval = setInterval(generateData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [currentPrices]);

  return (
    <StandardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-terminal-primary mb-2">
            CHARTS & ANALYTICS
          </h1>
          <p className="text-terminal-secondary">
            Real-time market data visualization and technical analysis
          </p>
        </motion.div>

        {/* Price Overview Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="terminal-panel">
            <CardHeader className="pb-2">
              <CardTitle className="terminal-header flex items-center gap-3">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                BTC/USD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-mono font-bold text-accent">
                  ${currentPrices.btc.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="text-sm text-accent">+2.3%</span>
                  <span className="text-xs text-muted-foreground">24h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-panel">
            <CardHeader className="pb-2">
              <CardTitle className="terminal-header flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                SPY
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-mono font-bold text-blue-500">
                  ${currentPrices.spy.toFixed(2)}
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-500">+0.8%</span>
                  <span className="text-xs text-muted-foreground">24h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-panel">
            <CardHeader className="pb-2">
              <CardTitle className="terminal-header flex items-center gap-3">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                VIX
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-mono font-bold text-destructive">
                  {currentPrices.vix.toFixed(1)}
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">-3.2%</span>
                  <span className="text-xs text-muted-foreground">24h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chart */}
        <Card className="terminal-panel">
          <CardHeader>
            <CardTitle className="terminal-header flex items-center gap-3">
              <BarChart3 className="w-5 h-5" />
              BTC/USD - 24H PRICE ACTION
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    domain={['dataMin - 1000', 'dataMax + 1000']}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="btc"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent))"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Asset Chart */}
        <Card className="terminal-panel">
          <CardHeader>
            <CardTitle className="terminal-header flex items-center gap-3">
              <Activity className="w-5 h-5" />
              MULTI-ASSET CORRELATION
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="spy"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="SPY"
                  />
                  <Line
                    type="monotone"
                    dataKey="vix"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    name="VIX"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Technical Indicators */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="terminal-panel">
            <CardHeader>
              <CardTitle className="terminal-header flex items-center gap-3">
                <Zap className="w-5 h-5" />
                MOMENTUM INDICATORS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">RSI (14)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-accent">67.3</span>
                    <Badge variant="outline" className="text-xs">Neutral</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">MACD</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-accent">+142.7</span>
                    <Badge variant="outline" className="text-xs text-accent border-accent">Bullish</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">BB %B</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">0.73</span>
                    <Badge variant="outline" className="text-xs">Upper Range</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-panel">
            <CardHeader>
              <CardTitle className="terminal-header flex items-center gap-3">
                <DollarSign className="w-5 h-5" />
                VOLUME ANALYSIS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">24h Volume</span>
                  <span className="font-mono text-accent">$1.2B</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Volume (7d)</span>
                  <span className="font-mono">$980M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Volume Ratio</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-accent">1.22</span>
                    <Badge variant="outline" className="text-xs text-accent border-accent">Above Avg</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-sm font-mono">Live Data Feed</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-accent border-accent">
              Real-time
            </Badge>
          </div>
        </div>
      </div>
    </StandardLayout>
  );
};

export default ChartsView;