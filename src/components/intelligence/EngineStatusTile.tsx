import { memo } from "react";
import { cn } from "@/lib/utils";
import { BaseTile } from "@/components/tiles/BaseTile";
import { Activity, AlertTriangle, CheckCircle, XCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface EngineStatusTileProps {
  engineName: string;
  isHealthy: boolean;
  usingFallback: boolean;
  retryCount: number;
  lastUpdated?: Date;
  dataIntegrity?: number;
  connectionStatus?: 'connected' | 'degraded' | 'offline';
}

export const EngineStatusTile = memo(({ 
  engineName,
  isHealthy,
  usingFallback,
  retryCount,
  lastUpdated = new Date(),
  dataIntegrity = 100,
  connectionStatus = 'connected'
}: EngineStatusTileProps) => {
  const getOverallStatus = (): "normal" | "warning" | "critical" => {
    if (!isHealthy && !usingFallback) return "critical";
    if (usingFallback || retryCount > 0 || connectionStatus === 'degraded') return "warning";
    return "normal";
  };

  const getStatusIcon = () => {
    const status = getOverallStatus();
    switch (status) {
      case "critical": return <XCircle className="w-5 h-5 text-critical" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-warning" />;
      default: return <CheckCircle className="w-5 h-5 text-btc-primary" />;
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'offline': return <WifiOff className="w-4 h-4 text-critical" />;
      case 'degraded': return <Wifi className="w-4 h-4 text-warning" />;
      default: return <Wifi className="w-4 h-4 text-btc-primary" />;
    }
  };

  const getStatusText = () => {
    if (!isHealthy && !usingFallback) return "Offline";
    if (retryCount > 0) return `Retry ${retryCount}`;
    if (usingFallback) return "Fallback Mode";
    return "Operational";
  };

  const variant = getOverallStatus() === "critical" ? "critical" : 
                  getOverallStatus() === "warning" ? "warning" : "primary";

  return (
    <BaseTile 
      size="md" 
      variant={variant}
      status={getOverallStatus() === "normal" ? "active" : getOverallStatus()}
      interactive="hover"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-mono font-medium text-text-primary uppercase tracking-wide">
          Engine Status
        </h3>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          {retryCount > 0 && (
            <RefreshCw className="w-4 h-4 text-warning animate-spin" />
          )}
        </div>
      </div>

      {/* Status Details */}
      <div className="space-y-4">
        {/* Primary Status */}
        <div className="flex items-center justify-between py-2 border-b border-glass-border/30">
          <span className="text-xs text-text-secondary font-mono uppercase">Status</span>
          <div className="flex items-center space-x-2">
            <span className={cn(
              "text-sm font-mono font-bold",
              getOverallStatus() === "critical" ? "text-critical" :
              getOverallStatus() === "warning" ? "text-warning" : "text-btc-primary"
            )}>
              {getStatusText()}
            </span>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between py-2 border-b border-glass-border/30">
          <span className="text-xs text-text-secondary font-mono uppercase">Connection</span>
          <div className="flex items-center space-x-2">
            {getConnectionIcon()}
            <span className="text-sm font-mono text-text-primary capitalize">
              {connectionStatus}
            </span>
          </div>
        </div>

        {/* Data Integrity */}
        <div className="flex items-center justify-between py-2 border-b border-glass-border/30">
          <span className="text-xs text-text-secondary font-mono uppercase">Data Integrity</span>
          <div className="text-right">
            <div className={cn(
              "text-sm font-mono font-bold",
              dataIntegrity >= 95 ? "text-btc-primary" :
              dataIntegrity >= 85 ? "text-warning" : "text-critical"
            )}>
              {dataIntegrity.toFixed(1)}%
            </div>
            <div className="w-16 h-1 bg-glass-surface mt-1 terminal-panel">
              <div 
                className={cn(
                  "h-full transition-all duration-300 terminal-panel",
                  dataIntegrity >= 95 ? "bg-btc-primary" :
                  dataIntegrity >= 85 ? "bg-warning" : "bg-critical"
                )}
                style={{ width: `${dataIntegrity}%` }}
              />
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-text-secondary font-mono uppercase">Last Updated</span>
          <div className="text-right">
            <div className="text-sm font-mono text-text-primary">
              {lastUpdated.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
            <div className="text-xs text-text-secondary font-mono">
              UTC
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicator Pulse */}
      {getOverallStatus() === "normal" && (
        <div className="absolute top-4 right-4 w-2 h-2 bg-btc-primary animate-pulse terminal-panel" />
      )}
    </BaseTile>
  );
});

EngineStatusTile.displayName = "EngineStatusTile";