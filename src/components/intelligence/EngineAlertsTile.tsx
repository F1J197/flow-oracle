import { memo } from "react";
import { cn } from "@/lib/utils";
import { BaseTile } from "@/components/tiles/BaseTile";
import { AlertTriangle, Info, XCircle, Bell } from "lucide-react";

interface Alert {
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp?: Date;
}

interface EngineAlertsTileProps {
  alerts: Alert[];
  engineName: string;
  maxVisible?: number;
}

export const EngineAlertsTile = memo(({ 
  alerts, 
  engineName,
  maxVisible = 5 
}: EngineAlertsTileProps) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const visibleAlerts = alerts.slice(0, maxVisible);
  const hasMoreAlerts = alerts.length > maxVisible;

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-critical" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      default: return <Info className="w-4 h-4 text-btc-primary" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-critical/30 bg-critical/5';
      case 'warning': return 'border-warning/30 bg-warning/5';
      default: return 'border-btc-primary/30 bg-btc-primary/5';
    }
  };

  const getAlertTextColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-critical';
      case 'warning': return 'text-warning';
      default: return 'text-btc-primary';
    }
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  const getTileVariant = () => {
    if (criticalCount > 0) return 'critical';
    if (warningCount > 0) return 'warning';
    return 'default';
  };

  return (
    <BaseTile 
      size="lg" 
      variant={getTileVariant()}
      status={criticalCount > 0 ? "critical" : warningCount > 0 ? "warning" : "normal"}
      interactive="hover"
      className="col-span-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Bell className="w-5 h-5 text-text-primary" />
          <h3 className="text-sm font-mono font-medium text-text-primary uppercase tracking-wide">
            Active Alerts
          </h3>
        </div>
        
        <div className="flex items-center space-x-4">
          {criticalCount > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-critical animate-pulse terminal-panel" />
              <span className="text-xs font-mono text-critical font-bold">
                {criticalCount} Critical
              </span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-warning animate-pulse terminal-panel" />
              <span className="text-xs font-mono text-warning font-bold">
                {warningCount} Warning
              </span>
            </div>
          )}
          <span className="text-xs text-text-secondary font-mono">
            {alerts.length} Total
          </span>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {visibleAlerts.map((alert, index) => (
          <div
            key={index}
            className={cn(
              "p-4 rounded-lg border-l-4 transition-all duration-200 hover:bg-glass-surface/30",
              getAlertColor(alert.severity)
            )}
          >
            <div className="flex items-start space-x-3">
              {getAlertIcon(alert.severity)}
              
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-mono text-sm leading-relaxed",
                  getAlertTextColor(alert.severity)
                )}>
                  {alert.message}
                </div>
                
                {alert.timestamp && (
                  <div className="text-xs text-text-secondary font-mono mt-2">
                    {alert.timestamp.toLocaleTimeString('en-US', { 
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })} UTC
                  </div>
                )}
              </div>

              <div className={cn(
                "px-2 py-1 rounded text-xs font-mono font-bold uppercase",
                alert.severity === 'critical' && "bg-critical/20 text-critical",
                alert.severity === 'warning' && "bg-warning/20 text-warning",
                alert.severity === 'info' && "bg-btc-primary/20 text-btc-primary"
              )}>
                {alert.severity}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* More Alerts Indicator */}
      {hasMoreAlerts && (
        <div className="mt-4 pt-4 border-t border-glass-border/30 text-center">
          <span className="text-xs text-text-secondary font-mono">
            +{alerts.length - maxVisible} more alerts
          </span>
        </div>
      )}

      {/* Pulsing border effect for critical alerts */}
      {criticalCount > 0 && (
        <div className="absolute inset-0 rounded-xl border-2 border-critical/50 animate-pulse pointer-events-none" />
      )}
    </BaseTile>
  );
});

EngineAlertsTile.displayName = "EngineAlertsTile";