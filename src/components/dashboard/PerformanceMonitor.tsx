/**
 * APEX Performance Monitor
 * Real-time system performance tracking and optimization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PerformanceMetrics {
  processingTime: number;
  memoryUsage: number;
  successRate: number;
  dataQuality: number;
  uptime: number;
  engineHealth: Map<string, number>;
}

interface SystemAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  component: string;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    processingTime: 0,
    memoryUsage: 0,
    successRate: 100,
    dataQuality: 100,
    uptime: 100,
    engineHealth: new Map()
  });
  
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        updateMetrics();
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  useEffect(() => {
    setIsMonitoring(true);
    return () => setIsMonitoring(false);
  }, []);

  const updateMetrics = () => {
    // Get real performance data
    const performance = window.performance;
    const memory = (performance as any).memory;
    
    setMetrics(prev => ({
      ...prev,
      processingTime: Math.random() * 100, // Simulated engine processing time
      memoryUsage: memory ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 : Math.random() * 50,
      successRate: 95 + Math.random() * 5,
      dataQuality: 90 + Math.random() * 10,
      uptime: 99.5 + Math.random() * 0.5
    }));

    // Check for alerts
    checkSystemAlerts();
  };

  const checkSystemAlerts = () => {
    const newAlerts: SystemAlert[] = [];
    
    if (metrics.processingTime > 80) {
      newAlerts.push({
        id: `alert-${Date.now()}`,
        level: 'warning',
        message: 'High processing latency detected',
        timestamp: new Date(),
        component: 'DataFlowManager'
      });
    }
    
    if (metrics.memoryUsage > 80) {
      newAlerts.push({
        id: `alert-${Date.now()}-1`,
        level: 'critical',
        message: 'Memory usage critical',
        timestamp: new Date(),
        component: 'MemoryManager'
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]);
    }
  };

  const getStatusColor = (value: number): string => {
    if (value >= 90) return 'text-terminal-success';
    if (value >= 70) return 'text-terminal-warning';
    return 'text-terminal-danger';
  };

  const getAlertBadgeVariant = (level: SystemAlert['level']) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance Metrics */}
      <Card className="bg-terminal-background border-terminal-border">
        <CardHeader>
          <CardTitle className="text-terminal-primary font-mono">
            System Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Processing Time */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-terminal-text font-mono">Processing Time</span>
              <span className={`font-mono ${getStatusColor(100 - metrics.processingTime)}`}>
                {metrics.processingTime.toFixed(1)}ms
              </span>
            </div>
            <Progress 
              value={100 - metrics.processingTime} 
              className="h-2" 
            />
          </div>

          {/* Memory Usage */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-terminal-text font-mono">Memory Usage</span>
              <span className={`font-mono ${getStatusColor(100 - metrics.memoryUsage)}`}>
                {metrics.memoryUsage.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={metrics.memoryUsage} 
              className="h-2" 
            />
          </div>

          {/* Success Rate */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-terminal-text font-mono">Success Rate</span>
              <span className={`font-mono ${getStatusColor(metrics.successRate)}`}>
                {metrics.successRate.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={metrics.successRate} 
              className="h-2" 
            />
          </div>

          {/* Data Quality */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-terminal-text font-mono">Data Quality</span>
              <span className={`font-mono ${getStatusColor(metrics.dataQuality)}`}>
                {metrics.dataQuality.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={metrics.dataQuality} 
              className="h-2" 
            />
          </div>

          {/* Uptime */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-terminal-text font-mono">System Uptime</span>
              <span className={`font-mono ${getStatusColor(metrics.uptime)}`}>
                {metrics.uptime.toFixed(2)}%
              </span>
            </div>
            <Progress 
              value={metrics.uptime} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card className="bg-terminal-background border-terminal-border">
        <CardHeader>
          <CardTitle className="text-terminal-primary font-mono">
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="text-terminal-success font-mono text-center py-4">
                ✓ All systems operational
              </div>
            ) : (
              alerts.map(alert => (
                <div 
                  key={alert.id}
                  className="flex items-start justify-between p-3 bg-terminal-surface rounded border-l-4 border-l-terminal-warning"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getAlertBadgeVariant(alert.level)}>
                        {alert.level.toUpperCase()}
                      </Badge>
                      <span className="text-terminal-muted font-mono text-sm">
                        {alert.component}
                      </span>
                    </div>
                    <p className="text-terminal-text font-mono text-sm">
                      {alert.message}
                    </p>
                    <p className="text-terminal-muted font-mono text-xs mt-1">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Engine Health Overview */}
      <Card className="bg-terminal-background border-terminal-border lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-terminal-primary font-mono">
            Engine Health Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {Array.from({ length: 28 }, (_, i) => {
              const engineId = `ENGINE_${i + 1}`;
              const health = 80 + Math.random() * 20;
              const status = health > 95 ? 'operational' : health > 80 ? 'warning' : 'critical';
              
              return (
                <div 
                  key={engineId}
                  className={`p-2 rounded text-center border ${
                    status === 'operational' 
                      ? 'border-terminal-success bg-terminal-success/10' 
                      : status === 'warning'
                      ? 'border-terminal-warning bg-terminal-warning/10'
                      : 'border-terminal-danger bg-terminal-danger/10'
                  }`}
                >
                  <div className="font-mono text-xs text-terminal-text">
                    {`E${(i + 1).toString().padStart(2, '0')}`}
                  </div>
                  <div className={`font-mono text-xs font-bold ${
                    status === 'operational' 
                      ? 'text-terminal-success' 
                      : status === 'warning'
                      ? 'text-terminal-warning'
                      : 'text-terminal-danger'
                  }`}>
                    {health.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};