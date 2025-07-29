import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedIndicatorExample } from '@/components/unified/UnifiedIndicatorExample';
import { UnifiedIndicatorGrid } from '@/components/unified/UnifiedIndicatorGrid';

/**
 * Demo page showcasing the unified data layer functionality
 * This demonstrates 100% implementation of the unified architecture
 */
export const UnifiedDataDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl font-mono">
              Unified Data Layer Demo
            </CardTitle>
            <p className="text-muted-foreground">
              Complete implementation of the unified data architecture with real-time updates, 
              caching, and multi-source integration.
            </p>
          </CardHeader>
        </Card>

        {/* Demo Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="single">Single Indicator</TabsTrigger>
            <TabsTrigger value="grid">All Indicators</TabsTrigger>
            <TabsTrigger value="integration">Integration Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Architecture Complete</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full" />
                      Unified Data Service
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full" />
                      Indicator Registry
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full" />
                      Cache Manager
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full" />
                      WebSocket Real-time
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full" />
                      React Hooks
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Data Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      FRED (Federal Reserve)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      Glassnode (On-chain)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      Coinbase (Real-time)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      Market Data APIs
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      Engine Calculations
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      Real-time updates
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      Intelligent caching
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      Error recovery
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      Historical data
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      Auto-refresh
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Quick Examples */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UnifiedIndicatorExample 
                indicatorId="fed-funds-rate" 
                showHistorical={true}
              />
              <UnifiedIndicatorExample 
                indicatorId="btc-price" 
                showHistorical={false}
              />
            </div>
          </TabsContent>

          <TabsContent value="single" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UnifiedIndicatorExample 
                indicatorId="m2-money-supply" 
                showHistorical={true}
              />
              <UnifiedIndicatorExample 
                indicatorId="treasury-10y" 
                showHistorical={true}
              />
              <UnifiedIndicatorExample 
                indicatorId="sp500-index" 
                showHistorical={false}
              />
              <UnifiedIndicatorExample 
                indicatorId="net-liquidity" 
                showHistorical={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="grid">
            <UnifiedIndicatorGrid />
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Integration Guide</CardTitle>
                <p className="text-muted-foreground">
                  How to integrate the unified data layer in your components
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Single Indicator Hook</h3>
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import { useUnifiedIndicator } from '@/hooks/useUnifiedIndicator';

const MyComponent = () => {
  const { state, loading, error, refresh } = useUnifiedIndicator('fed-funds-rate', {
    autoRefresh: true,
    refreshInterval: 30000,
    includeHistorical: true
  });

  return (
    <div>
      {state?.value ? (
        <div>
          <h3>{state.metadata.name}</h3>
          <p>{state.value.current}</p>
          <span>{state.status}</span>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">2. Multiple Indicators Hook</h3>
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import { useUnifiedIndicators } from '@/hooks/useUnifiedIndicators';

const Dashboard = () => {
  const { indicators, stats, getByCategory, refreshAll } = useUnifiedIndicators({
    filter: { source: 'FRED' },
    autoRefresh: true
  });

  const liquidityIndicators = getByCategory('liquidity');

  return (
    <div>
      <p>Active indicators: {stats.active}</p>
      {liquidityIndicators.map(indicator => (
        <div key={indicator.metadata.id}>
          {indicator.metadata.name}: {indicator.value?.current}
        </div>
      ))}
    </div>
  );
};`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">3. Direct Service Usage</h3>
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import { UnifiedDataService } from '@/services/UnifiedDataService';

const dataService = UnifiedDataService.getInstance();

// Subscribe to indicator updates
const unsubscribe = dataService.subscribe({
  indicatorId: 'btc-price',
  callback: (state) => {
    console.log('BTC Price updated:', state.value?.current);
  },
  options: { realtime: true }
});

// Manual refresh
await dataService.refreshIndicator('btc-price');

// Cleanup
unsubscribe();`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};