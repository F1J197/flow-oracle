/**
 * Terminal Layout - 3-Tab Bloomberg-Style Interface
 * Dashboard | Intelligence | Charts architecture
 */

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardView } from './DashboardView';
import { IntelligenceView } from './IntelligenceView';
import { ChartsView } from './ChartsView';
import { BitcoinDashboard } from '@/components/bitcoin/BitcoinDashboard';
import { DataFlowManager } from '@/engines/DataFlowManager';

export const TerminalLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Initialize and start the DataFlowManager
    const dataFlowManager = DataFlowManager.getInstance();
    dataFlowManager.start();

    return () => {
      dataFlowManager.stop();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background font-mono">
      {/* Terminal Header */}
      <div className="border-b border-border bg-secondary p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold tracking-wider" style={{ color: 'hsl(var(--btc-primary))' }}>
              LIQUIDITY² TERMINAL
            </h1>
            <div className="text-sm text-secondary font-mono">
              {new Date().toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-neon-lime"></div>
              <span className="text-xs text-secondary font-mono">DATA FEED ACTIVE</span>
            </div>
            <div className="text-xs text-secondary font-mono">
              28 ENGINES OPERATIONAL
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="border-b border-border bg-card">
          <TabsList className="grid w-full grid-cols-4 bg-transparent h-12">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-mono text-sm tracking-wider"
            >
              DASHBOARD
            </TabsTrigger>
            <TabsTrigger 
              value="intelligence" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-mono text-sm tracking-wider"
            >
              INTELLIGENCE
            </TabsTrigger>
            <TabsTrigger 
              value="charts" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-mono text-sm tracking-wider"
            >
              CHARTS
            </TabsTrigger>
            <TabsTrigger 
              value="bitcoin" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-mono text-sm tracking-wider"
            >
              BITCOIN
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          <TabsContent value="dashboard" className="mt-0 h-full">
            <DashboardView />
          </TabsContent>
          
          <TabsContent value="intelligence" className="mt-0 h-full">
            <IntelligenceView />
          </TabsContent>
          
          <TabsContent value="charts" className="mt-0 h-full">
            <ChartsView />
          </TabsContent>
          
          <TabsContent value="bitcoin" className="mt-0 h-full">
            <BitcoinDashboard />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default TerminalLayout;