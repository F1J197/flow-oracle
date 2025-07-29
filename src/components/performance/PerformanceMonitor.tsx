import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Zap, Database, Wifi, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceMetrics {
  apiLatency: number;
  cacheHitRate: number;
  errorRate: number;
  memoryUsage: number;
  activeConnections: number;
  dataFreshness: number;
  systemLoad: number;
  uptime: number;
}

interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical';
  apis: Record<string, 'online' | 'slow' | 'offline'>;
  engines: Record<string, 'active' | 'idle' | 'error'>;
  dataStreams: Record<string, 'connected' | 'reconnecting' | 'disconnected'>;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    apiLatency: 0,
    cacheHitRate: 0,
    errorRate: 0,
    memoryUsage: 0,
    activeConnections: 0,
    dataFreshness: 0,
    systemLoad: 0,
    uptime: 0
  });

  const [status, setStatus] = useState<SystemStatus>({
    overall: 'healthy',
    apis: {},
    engines: {},
    dataStreams: {}
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Simulate real-time metrics updates
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics({
        apiLatency: Math.random() * 200 + 50,
        cacheHitRate: Math.random() * 30 + 70,
        errorRate: Math.random() * 5,
        memoryUsage: Math.random() * 40 + 30,
        activeConnections: Math.floor(Math.random() * 50 + 10),
        dataFreshness: Math.random() * 20 + 80,
        systemLoad: Math.random() * 60 + 20,
        uptime: 99.8 + Math.random() * 0.2
      });

      setStatus({
        overall: Math.random() > 0.8 ? 'warning' : 'healthy',
        apis: {
          'FRED': Math.random() > 0.1 ? 'online' : 'slow',
          'Coinbase': Math.random() > 0.05 ? 'online' : 'slow',
          'Market Data': Math.random() > 0.15 ? 'online' : 'offline'
        },
        engines: {
          'Net Liquidity': Math.random() > 0.1 ? 'active' : 'idle',
          'Credit Stress': Math.random() > 0.05 ? 'active' : 'error',
          'Momentum': Math.random() > 0.15 ? 'active' : 'idle'
        },
        dataStreams: {
          'WebSocket': Math.random() > 0.1 ? 'connected' : 'reconnecting',
          'Real-time Feed': Math.random() > 0.05 ? 'connected' : 'disconnected'
        }
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'active':
      case 'connected':
        return 'text-green-400';
      case 'warning':
      case 'slow':
      case 'idle':
      case 'reconnecting':
        return 'text-yellow-400';
      case 'critical':
      case 'offline':
      case 'error':
      case 'disconnected':
        return 'text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (overall: string) => {
    switch (overall) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card 
          className="p-3 cursor-pointer glass-card border-glass-border hover:scale-105 transition-transform"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center gap-2">
            {getStatusIcon(status.overall)}
            <span className="text-sm font-medium">System Status</span>
            <Badge variant={status.overall === 'healthy' ? 'default' : 'destructive'} className="text-xs">
              {status.overall.toUpperCase()}
            </Badge>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="glass-card border-glass-border">
        <div className="p-4 border-b border-glass-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.overall)}
              <h3 className="font-semibold">Performance Monitor</h3>
            </div>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Key Metrics */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Key Metrics</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>API Latency</span>
                  <span>{metrics.apiLatency.toFixed(0)}ms</span>
                </div>
                <Progress 
                  value={Math.min(metrics.apiLatency / 2, 100)} 
                  className="h-1"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Cache Hit Rate</span>
                  <span>{metrics.cacheHitRate.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={metrics.cacheHitRate} 
                  className="h-1"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Error Rate</span>
                  <span>{metrics.errorRate.toFixed(2)}%</span>
                </div>
                <Progress 
                  value={metrics.errorRate * 20} 
                  className="h-1"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Memory Usage</span>
                  <span>{metrics.memoryUsage.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={metrics.memoryUsage} 
                  className="h-1"
                />
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">System Status</h4>
            
            <div className="space-y-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">APIs</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(status.apis).map(([name, state]) => (
                    <Badge key={name} variant="outline" className="text-xs">
                      <span className={cn("mr-1", getStatusColor(state))}>●</span>
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">Engines</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(status.engines).map(([name, state]) => (
                    <Badge key={name} variant="outline" className="text-xs">
                      <span className={cn("mr-1", getStatusColor(state))}>●</span>
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">Data Streams</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(status.dataStreams).map(([name, state]) => (
                    <Badge key={name} variant="outline" className="text-xs">
                      <span className={cn("mr-1", getStatusColor(state))}>●</span>
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="pt-3 border-t border-glass-border">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-semibold text-primary">
                  {metrics.uptime.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-primary">
                  {metrics.activeConnections}
                </div>
                <div className="text-xs text-muted-foreground">Connections</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-primary">
                  {metrics.dataFreshness.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">Data Fresh</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}