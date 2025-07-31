import React, { useState, useCallback } from "react";
import { Header } from '@/components/layout/Header';
import { TerminalContainer, TerminalHeader } from "@/components/Terminal";
import { ChartGrid } from '@/components/charts/ChartGrid';
import { ChartSelector } from '@/components/charts/ChartSelector';
import { UnifiedChartsViewFixed } from '@/components/charts/UnifiedChartsViewFixed';
import { getChartConfig } from '@/config/charts.config';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const ChartsView = () => {
  const [selectedCharts, setSelectedCharts] = useState<string[]>([
    'net-liquidity',
    'z-score', 
    'credit-stress',
    'bitcoin'
  ]);
  const [activeTab, setActiveTab] = useState('charts');

  // Get chart configurations for selected charts
  const chartConfigs = selectedCharts
    .map(chartId => getChartConfig(chartId))
    .filter(Boolean);

  const handleChartsChange = useCallback((chartIds: string[]) => {
    setSelectedCharts(chartIds);
  }, []);

  const handleChartExport = useCallback((chartId: string) => {
    // TODO: Implement chart export functionality
    console.log('Export chart:', chartId);
  }, []);

  const handleChartSettings = useCallback((chartId: string) => {
    // TODO: Implement chart settings modal
    console.log('Settings for chart:', chartId);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header currentPage="charts" />
      <main>
        <TerminalContainer className="min-h-screen">
        <TerminalHeader 
          title="CHART ANALYSIS SYSTEM"
          subtitle="Advanced visualization of global liquidity indicators"
          status="active"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger 
              value="charts" 
              className="text-xs font-mono bg-transparent data-[state=active]:bg-neon-teal data-[state=active]:text-bg-primary"
            >
              CHART ANALYSIS
            </TabsTrigger>
            <TabsTrigger 
              value="unified" 
              className="text-xs font-mono bg-transparent data-[state=active]:bg-neon-teal data-[state=active]:text-bg-primary"
            >
              UNIFIED CHARTS
            </TabsTrigger>
            <TabsTrigger 
              value="selector" 
              className="text-xs font-mono bg-transparent data-[state=active]:bg-neon-teal data-[state=active]:text-bg-primary"
            >
              CHART SELECTOR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-6">
            {chartConfigs.length > 0 ? (
              <ChartGrid
                charts={chartConfigs}
                columns={2}
                onChartExport={handleChartExport}
                onChartSettings={handleChartSettings}
              />
            ) : (
              <Card className="bg-bg-secondary border-glass-border p-12 text-center">
                <div className="text-text-secondary space-y-4">
                  <div className="text-lg font-mono">NO CHARTS SELECTED</div>
                  <p className="text-sm">
                    Switch to the Chart Selector tab to choose indicators to visualize
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="unified" className="space-y-6">
            <UnifiedChartsViewFixed />
          </TabsContent>

          <TabsContent value="selector" className="space-y-6">
            <ChartSelector
              selectedCharts={selectedCharts}
              onChartsChange={handleChartsChange}
              maxCharts={8}
            />
          </TabsContent>
        </Tabs>

        {/* Footer Status */}
        <div className="terminal-section mt-6">
          <div className="terminal-divider"></div>
          <div className="flex items-center justify-between terminal-text text-xs text-text-secondary mt-4">
            <div className="flex items-center space-x-4">
              <span>
                {selectedCharts.length} CHARTS ACTIVE
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-neon-lime animate-pulse"></div>
                <span>REAL-TIME UPDATES</span>
              </div>
            </div>
            <div>
              SYSTEM: OPERATIONAL
            </div>
          </div>
        </div>
      </TerminalContainer>
      </main>
    </div>
  );
};

export default ChartsView;