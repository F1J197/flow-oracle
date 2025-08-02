import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { DailyReportView } from '@/components/reports/DailyReportView';
import { LiveDataSidebar } from './LiveDataSidebar';
import { IntelligenceAlerts } from './IntelligenceAlerts';
import { DataFlowManager } from '@/engines/DataFlowManager';

/**
 * LIQUIDITY² Terminal Layout - Bloomberg-Style Single Dashboard
 * Clean, elegant design focused on real-time market insights
 */
export const TerminalLayout: React.FC = () => {
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
      case 'open': return 'neon-lime';
      case 'pre': case 'after': return 'neon-gold';
      case 'close': return 'neon-orange';
      default: return 'text-secondary';
    }
  };

  const getSystemStatusColor = () => {
    switch (systemStatus) {
      case 'operational': return 'neon-lime';
      case 'degraded': return 'neon-gold';
      case 'offline': return 'neon-orange';
      default: return 'text-secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Terminal Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-primary tracking-wider">
              LIQUIDITY² TERMINAL
            </h1>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-none bg-${getSessionColor()}`} />
              <span className="text-sm font-mono text-muted-foreground">
                {marketSession.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4 text-primary" />
              <span className="font-mono text-sm text-foreground">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Activity className={`w-4 h-4 text-${getSystemStatusColor()}`} />
              <span className={`text-sm font-mono text-${getSystemStatusColor()}`}>
                {systemStatus.toUpperCase()}
              </span>
            </div>

            <Badge variant="outline" className="border-primary text-primary">
              LIVE
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <main className="p-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          {/* Hero Dashboard - Daily Reports */}
          <section className="col-span-8">
            <Card className="h-full bg-card border-border">
              <div className="p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-primary">
                    DAILY INTELLIGENCE
                  </h2>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="text-sm text-muted-foreground">
                      Real-time analysis
                    </span>
                  </div>
                </div>
                <div className="h-[calc(100%-80px)] overflow-auto">
                  <DailyReportView />
                </div>
              </div>
            </Card>
          </section>

          {/* Real-time Data Sidebar */}
          <section className="col-span-4 flex flex-col gap-6">
            {/* Intelligence Alerts */}
            <Card className="bg-card border-border">
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <h3 className="font-bold text-foreground">ALERTS</h3>
                </div>
                <IntelligenceAlerts />
              </div>
            </Card>

            {/* Live Data Stream */}
            <Card className="flex-1 bg-card border-border">
              <div className="p-4 h-full">
                <div className="flex items-center space-x-2 mb-4">
                  <Activity className="w-4 h-4 text-accent" />
                  <h3 className="font-bold text-foreground">LIVE DATA</h3>
                </div>
                <div className="h-[calc(100%-60px)]">
                  <LiveDataSidebar />
                </div>
              </div>
            </Card>
          </section>
        </div>
      </main>

      {/* Status Bar */}
      <footer className="border-t border-border bg-card/50">
        <div className="flex items-center justify-between px-6 py-2">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent animate-pulse" />
              <span className="text-xs text-muted-foreground">SYSTEMS OPERATIONAL</span>
            </div>
            <div className="text-xs text-muted-foreground">
              LAST UPDATE: {currentTime.toLocaleTimeString()}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            © 2024 LIQUIDITY² TERMINAL
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TerminalLayout;