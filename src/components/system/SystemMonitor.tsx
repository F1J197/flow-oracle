/**
 * System Monitor Component - Real-time system status display
 * Shows DataOrchestrator, WebSocket, and Engine health in a compact terminal-style UI
 */

import React, { useState, useEffect } from 'react';
import { useApplicationIntegrator } from '@/hooks/useApplicationIntegrator';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Wifi, 
  Database, 
  Cpu, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings
} from 'lucide-react';

interface SystemMonitorProps {
  className?: string;
  compact?: boolean;
  showControls?: boolean;
}

export const SystemMonitor: React.FC<SystemMonitorProps> = ({
  className = '',
  compact = false,
  showControls = true
}) => {
  const {
    systemStatus,
    isInitialized,
    isLoading,
    error,
    realtimeData,
    refreshData,
    executeEngines,
    getDataOrchestratorStatus,
    getWebSocketStatus
  } = useApplicationIntegrator({
    enableRealtimeUpdates: true
  });

  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [dataOrchestratorDetails, setDataOrchestratorDetails] = useState<any>(null);
  const [webSocketDetails, setWebSocketDetails] = useState<any>(null);

  // Update detailed status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setDataOrchestratorDetails(getDataOrchestratorStatus());
      setWebSocketDetails(getWebSocketStatus());
    }, 2000);

    return () => clearInterval(interval);
  }, [getDataOrchestratorStatus, getWebSocketStatus]);

  // Track real-time updates
  useEffect(() => {
    if (realtimeData) {
      setLastUpdateTime(new Date());
    }
  }, [realtimeData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-accent-success" />;
      case 'initializing':
        return <RefreshCw className="w-4 h-4 animate-spin text-accent-warning" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-accent-danger" />;
      case 'disabled':
        return <XCircle className="w-4 h-4 text-text-muted" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-accent-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = {
      ready: 'success',
      initializing: 'warning',
      error: 'destructive',
      disabled: 'secondary'
    }[status] || 'secondary';

    return (
      <Badge variant={variant as any} className="text-xs font-mono">
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 font-mono text-sm ${className}`}>
        <Activity className="w-4 h-4 text-accent-primary" />
        <span className="text-text-secondary">System:</span>
        {systemStatus && (
          <>
            {getStatusIcon(systemStatus.dataOrchestrator)}
            {getStatusIcon(systemStatus.webSocketOrchestrator)}
            {getStatusIcon(systemStatus.engineRegistry)}
          </>
        )}
        {systemStatus?.errorCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            {systemStatus.errorCount} errors
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={`p-4 bg-bg-elevated border-border-muted ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-primary" />
            <h3 className="text-lg font-mono font-semibold text-text-primary">
              System Monitor
            </h3>
          </div>
          
          {showControls && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isLoading}
                className="font-mono"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={executeEngines}
                disabled={isLoading}
                className="font-mono"
              >
                <Cpu className="w-4 h-4 mr-1" />
                Execute
              </Button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-bg-danger-subtle border border-border-danger rounded-md">
            <div className="flex items-center gap-2 text-text-danger">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-mono text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* System Status Grid */}
        {systemStatus && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Data Orchestrator */}
            <div className="p-3 bg-bg-subtle border border-border-subtle rounded-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-accent-secondary" />
                  <span className="font-mono text-sm font-medium text-text-primary">
                    Data Orchestrator
                  </span>
                </div>
                {getStatusBadge(systemStatus.dataOrchestrator)}
              </div>
              
              {dataOrchestratorDetails && (
                <div className="space-y-1 text-xs font-mono text-text-secondary">
                  <div>Sources: {dataOrchestratorDetails.dataSources?.length || 0}</div>
                  <div>Engines: {dataOrchestratorDetails.engineCount || 0}</div>
                  <div>Cache: {dataOrchestratorDetails.cacheSize || 0} entries</div>
                </div>
              )}
            </div>

            {/* WebSocket Orchestrator */}
            <div className="p-3 bg-bg-subtle border border-border-subtle rounded-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-accent-tertiary" />
                  <span className="font-mono text-sm font-medium text-text-primary">
                    WebSocket
                  </span>
                </div>
                {getStatusBadge(systemStatus.webSocketOrchestrator)}
              </div>
              
              {webSocketDetails && (
                <div className="space-y-1 text-xs font-mono text-text-secondary">
                  <div>Health: {Math.round((webSocketDetails.overall || 0) * 100)}%</div>
                  <div>Connections: {webSocketDetails.connections?.length || 0}</div>
                  <div>
                    Last Data: {lastUpdateTime 
                      ? new Date(lastUpdateTime).toLocaleTimeString()
                      : 'Never'
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Engine Registry */}
            <div className="p-3 bg-bg-subtle border border-border-subtle rounded-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-accent-quaternary" />
                  <span className="font-mono text-sm font-medium text-text-primary">
                    Engines
                  </span>
                </div>
                {getStatusBadge(systemStatus.engineRegistry)}
              </div>
              
              <div className="space-y-1 text-xs font-mono text-text-secondary">
                <div>Uptime: {formatUptime(systemStatus.uptime)}</div>
                <div>Errors: {systemStatus.errorCount}</div>
                <div>
                  Updated: {systemStatus.lastUpdate 
                    ? new Date(systemStatus.lastUpdate).toLocaleTimeString()
                    : 'Never'
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Data Indicator */}
        {realtimeData && (
          <div className="p-2 bg-bg-success-subtle border border-border-success rounded-md">
            <div className="flex items-center gap-2 text-text-success">
              <div className="w-2 h-2 bg-accent-success rounded-full animate-pulse" />
              <span className="font-mono text-xs">
                Live: {realtimeData.provider}:{realtimeData.symbol} = {realtimeData.value.current}
              </span>
            </div>
          </div>
        )}

        {/* Initialization State */}
        {!isInitialized && !error && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-text-muted">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="font-mono text-sm">Initializing system components...</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SystemMonitor;