import React from 'react';
import { Header } from '@/components/layout/Header';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { EngineMonitor } from '@/components/engines/EngineMonitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEngineRegistry } from '@/hooks/useEngineRegistry';

export const SystemDashboard: React.FC = () => {
  const { engines, status, loading } = useEngineRegistry({ autoExecute: true });

  const getSystemHealth = () => {
    if (status.total === 0) return { level: 'unknown', color: 'secondary' as const };
    const successRate = ((status.completed - status.failed) / status.total) * 100;
    
    if (successRate >= 90) return { level: 'excellent', color: 'default' as const };
    if (successRate >= 75) return { level: 'good', color: 'secondary' as const };
    if (successRate >= 50) return { level: 'degraded', color: 'destructive' as const };
    return { level: 'critical', color: 'destructive' as const };
  };

  const systemHealth = getSystemHealth();

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header currentPage="system" />
      
      <StandardLayout variant="intelligence" maxWidth="full" className="pt-8">
        {/* System Overview */}
        <div className="col-span-full mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>LIQUIDITY² Engine Infrastructure</CardTitle>
                <Badge variant={systemHealth.color}>
                  System {systemHealth.level.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">{engines.length}</div>
                  <div className="text-sm text-muted-foreground">Registered Engines</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning">{status.running}</div>
                  <div className="text-sm text-muted-foreground">Active Executions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success">{status.completed - status.failed}</div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-destructive">{status.failed}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Foundation Engines (Pillar 1) */}
        <div className="col-span-full mb-8">
          <h2 className="text-xl font-semibold mb-4">Foundation Engines (Pillar 1)</h2>
          <EngineMonitor pillar={1} />
        </div>

        {/* Core Engines (Pillar 2) */}
        <div className="col-span-full mb-8">
          <h2 className="text-xl font-semibold mb-4">Core Engines (Pillar 2)</h2>
          <EngineMonitor pillar={2} />
        </div>

        {/* Synthesis Engines (Pillar 3) */}
        <div className="col-span-full mb-8">
          <h2 className="text-xl font-semibold mb-4">Synthesis Engines (Pillar 3)</h2>
          <EngineMonitor pillar={3} />
        </div>

        {/* Category Views */}
        <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Foundation Category</h3>
            <EngineMonitor category="foundation" compact />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Core Category</h3>
            <EngineMonitor category="core" compact />
          </div>
        </div>
      </StandardLayout>
    </div>
  );
};