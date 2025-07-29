import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useEngineRegistry } from '@/hooks/useEngineRegistry';
import { cn } from '@/lib/utils';

interface EngineMonitorProps {
  pillar?: 1 | 2 | 3;
  category?: 'foundation' | 'core' | 'synthesis' | 'execution';
  autoRefresh?: boolean;
  refreshInterval?: number;
  showControls?: boolean;
  compact?: boolean;
}

export const EngineMonitor: React.FC<EngineMonitorProps> = ({
  pillar,
  category,
  autoRefresh = true,
  refreshInterval = 15000,
  showControls = true,
  compact = false
}) => {
  const {
    engines,
    status,
    loading,
    error,
    executeEngines,
    executeEngine,
    getEngineResult
  } = useEngineRegistry({
    autoExecute: autoRefresh,
    refreshInterval,
    pillar,
    category
  });

  const getStatusIcon = (engineId: string) => {
    const result = getEngineResult(engineId);
    if (loading && !result) return <Clock className="w-4 h-4 text-warning animate-spin" />;
    if (!result) return <AlertCircle className="w-4 h-4 text-muted" />;
    if (result.success) return <CheckCircle className="w-4 h-4 text-success" />;
    return <AlertCircle className="w-4 h-4 text-destructive" />;
  };

  const getStatusBadge = (engineId: string) => {
    const result = getEngineResult(engineId);
    if (loading && !result) return <Badge variant="outline">Running</Badge>;
    if (!result) return <Badge variant="secondary">Pending</Badge>;
    if (result.success) return <Badge variant="default">Success</Badge>;
    return <Badge variant="destructive">Failed</Badge>;
  };

  const successRate = status.total > 0 ? ((status.completed - status.failed) / status.total) * 100 : 0;

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Engine Status</div>
              <Badge variant={successRate > 80 ? "default" : successRate > 60 ? "secondary" : "destructive"}>
                {successRate.toFixed(0)}%
              </Badge>
            </div>
            {showControls && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => executeEngines()}
                disabled={loading}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              </Button>
            )}
          </div>
          
          <Progress value={successRate} className="mb-2" />
          
          <div className="text-xs text-muted-foreground">
            {status.completed}/{status.total} engines completed
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Engine Monitor</CardTitle>
          {showControls && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => executeEngines()}
                disabled={loading}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {loading ? 'Running' : 'Execute All'}
              </Button>
            </div>
          )}
        </div>
        
        {/* Status Overview */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{status.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{status.running}</div>
            <div className="text-xs text-muted-foreground">Running</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{status.completed - status.failed}</div>
            <div className="text-xs text-muted-foreground">Success</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{status.failed}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
        </div>
        
        <Progress value={successRate} className="mt-4" />
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {engines.map((engine) => {
            const result = getEngineResult(engine.id);
            
            return (
              <div
                key={engine.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  "bg-card hover:bg-accent/50 transition-colors"
                )}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(engine.id)}
                  <div>
                    <div className="font-medium text-sm">{engine.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Pillar {engine.pillar} • Priority {engine.priority}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {result && result.executionTime && (
                    <div className="text-xs text-muted-foreground">
                      {result.executionTime}ms
                    </div>
                  )}
                  {getStatusBadge(engine.id)}
                  {showControls && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => executeEngine(engine.id)}
                      disabled={loading}
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {engines.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-sm">No engines registered</div>
            {(pillar || category) && (
              <div className="text-xs mt-1">
                for {pillar ? `Pillar ${pillar}` : `${category} category`}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};