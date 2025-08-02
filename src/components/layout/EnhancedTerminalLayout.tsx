import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Activity, Zap, TrendingUp } from 'lucide-react';
import { DailyIntelligenceCenter } from '@/components/command-center/DailyIntelligenceCenter';
import { IntelligenceView } from '@/components/layout/IntelligenceView';
import { ChartsView } from '@/components/layout/ChartsView';
import { BitcoinDashboard } from '@/components/bitcoin/BitcoinDashboard';
import { DataFlowManager } from '@/engines/DataFlowManager';

export const EnhancedTerminalLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState<'operational' | 'degraded' | 'offline'>('operational');
  const [marketSession, setMarketSession] = useState<'pre' | 'open' | 'close' | 'after'>('open');

  useEffect(() => {
    // Initialize DataFlowManager
    const dataManager = DataFlowManager.getInstance();
    dataManager.start();

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Market session detection
    const sessionInterval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour >= 4 && hour < 9.5) {
        setMarketSession('pre');
      } else if (hour >= 9.5 && hour < 16) {
        setMarketSession('open');
      } else if (hour >= 16 && hour < 20) {
        setMarketSession('after');
      } else {
        setMarketSession('close');
      }
    }, 60000);

    return () => {
      dataManager.stop();
      clearInterval(timeInterval);
      clearInterval(sessionInterval);
    };
  }, []);

  const getSessionColor = () => {
    switch (marketSession) {
      case 'open': return 'hsl(var(--neon-lime))';
      case 'pre': case 'after': return 'hsl(var(--neon-gold))';
      case 'close': return 'hsl(var(--neon-orange))';
      default: return 'hsl(var(--text-secondary))';
    }
  };

  const getSystemStatusColor = () => {
    switch (systemStatus) {
      case 'operational': return 'hsl(var(--neon-lime))';
      case 'degraded': return 'hsl(var(--neon-gold))';
      case 'offline': return 'hsl(var(--neon-orange))';
      default: return 'hsl(var(--text-secondary))';
    }
  };

  // For dashboard tab, show the command center without navigation
  if (activeTab === 'dashboard') {
    return <DailyIntelligenceCenter onNavigate={setActiveTab} />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--bg-primary))', color: 'hsl(var(--text-primary))' }}>
      {/* Enhanced Header */}
      <Card className="terminal-panel border-0 rounded-none">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold font-mono tracking-wider" style={{ color: 'hsl(var(--btc-primary))' }}>
              LIQUIDITY² TERMINAL
            </h1>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2" style={{ backgroundColor: getSessionColor() }} />
              <span className="text-sm font-mono" style={{ color: 'hsl(var(--text-secondary))' }}>
                {marketSession.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4" style={{ color: 'hsl(var(--btc-primary))' }} />
              <span className="font-mono text-sm" style={{ color: 'hsl(var(--text-primary))' }}>
                {currentTime.toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4" style={{ color: getSystemStatusColor() }} />
              <span className="text-sm font-mono" style={{ color: getSystemStatusColor() }}>
                {systemStatus.toUpperCase()}
              </span>
            </div>

            <Badge variant="outline" className="rounded-none border-0" style={{ 
              borderColor: 'hsl(var(--btc-primary))', 
              color: 'hsl(var(--btc-primary))',
              border: '1px solid hsl(var(--btc-primary))'
            }}>
              LIVE
            </Badge>
          </div>
        </div>
      </Card>

      {/* Enhanced Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full h-12 terminal-panel rounded-none border-0" style={{ 
          background: 'hsl(var(--bg-secondary))',
          borderBottom: '1px solid hsl(var(--glass-border))'
        }}>
          <TabsTrigger 
            value="dashboard" 
            className="flex-1 h-full font-mono rounded-none border-0 data-[state=active]:text-black"
            style={{
              color: 'hsl(var(--text-primary))',
              background: 'transparent'
            }}
          >
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>COMMAND CENTER</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="intelligence" 
            className="flex-1 h-full font-mono rounded-none border-0 data-[state=active]:text-black"
            style={{
              color: 'hsl(var(--text-primary))',
              background: 'transparent'
            }}
          >
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>INTELLIGENCE</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="charts" 
            className="flex-1 h-full font-mono rounded-none border-0 data-[state=active]:text-black"
            style={{
              color: 'hsl(var(--text-primary))',
              background: 'transparent'
            }}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>CHARTS</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="bitcoin" 
            className="flex-1 h-full font-mono rounded-none border-0 data-[state=active]:text-black"
            style={{
              color: 'hsl(var(--text-primary))',
              background: 'transparent'
            }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4" style={{ backgroundColor: 'hsl(var(--btc-primary))' }} />
              <span>BITCOIN</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="p-6">
          <TabsContent value="intelligence" className="mt-0">
            <IntelligenceView />
          </TabsContent>

          <TabsContent value="charts" className="mt-0">
            <ChartsView />
          </TabsContent>

          <TabsContent value="bitcoin" className="mt-0">
            <BitcoinDashboard />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};