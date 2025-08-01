import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Activity, Zap, TrendingUp } from 'lucide-react';
import { DashboardView } from '@/components/layout/DashboardView';
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
      case 'open': return 'bg-green-500';
      case 'pre': case 'after': return 'bg-yellow-500';
      case 'close': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSystemStatusColor = () => {
    switch (systemStatus) {
      case 'operational': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Enhanced Header */}
      <Card className="bg-gray-900/50 border-orange-500 rounded-none border-x-0 border-t-0">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-orange-500 font-mono tracking-wider">
              LIQUIDITY² TERMINAL
            </h1>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getSessionColor()}`} />
              <span className="text-sm text-gray-400 font-mono">
                {marketSession.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4 text-orange-500" />
              <span className="font-mono text-sm">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Activity className={`w-4 h-4 ${getSystemStatusColor()}`} />
              <span className={`text-sm font-mono ${getSystemStatusColor()}`}>
                {systemStatus.toUpperCase()}
              </span>
            </div>

            <Badge variant="outline" className="border-orange-500 text-orange-500">
              LIVE
            </Badge>
          </div>
        </div>
      </Card>

      {/* Enhanced Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full h-12 bg-gray-900/50 rounded-none border-b border-gray-700">
          <TabsTrigger 
            value="dashboard" 
            className="flex-1 h-full text-white data-[state=active]:bg-orange-500 data-[state=active]:text-black font-mono"
          >
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>DASHBOARD</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="intelligence" 
            className="flex-1 h-full text-white data-[state=active]:bg-orange-500 data-[state=active]:text-black font-mono"
          >
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>INTELLIGENCE</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="charts" 
            className="flex-1 h-full text-white data-[state=active]:bg-orange-500 data-[state=active]:text-black font-mono"
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>CHARTS</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="bitcoin" 
            className="flex-1 h-full text-white data-[state=active]:bg-orange-500 data-[state=active]:text-black font-mono"
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full" />
              <span>BITCOIN</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="p-6">
          <TabsContent value="dashboard" className="mt-0">
            <DashboardView />
          </TabsContent>

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