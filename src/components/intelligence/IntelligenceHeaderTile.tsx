import { memo } from "react";
import { cn } from "@/lib/utils";
import { BaseTile } from "@/components/tiles/BaseTile";
import { Activity, Database, Cpu, RefreshCw } from "lucide-react";

interface SystemMetric {
  label: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical';
  unit?: string;
}

interface IntelligenceHeaderTileProps {
  systemHealth: 'healthy' | 'degraded' | 'critical' | 'offline';
  activeEngines: number;
  totalEngines: number;
  dataIntegrity: number;
  refreshRate: number;
  lastRefresh?: Date;
  error?: string;
  onRefresh?: () => void;
}

export const IntelligenceHeaderTile = memo(({ 
  systemHealth,
  activeEngines,
  totalEngines,
  dataIntegrity,
  refreshRate,
  lastRefresh = new Date(),
  error,
  onRefresh
}: IntelligenceHeaderTileProps) => {
  const getHealthStatus = () => {
    switch (systemHealth) {
      case 'critical': return 'critical';
      case 'degraded': return 'warning';
      case 'offline': return 'critical';
      default: return 'normal';
    }
  };

  const getHealthColor = () => {
    switch (systemHealth) {
      case 'healthy': return 'text-btc-primary';
      case 'degraded': return 'text-warning';
      case 'critical': return 'text-critical';
      case 'offline': return 'text-critical';
      default: return 'text-text-secondary';
    }
  };

  const getHealthIcon = () => {
    switch (systemHealth) {
      case 'healthy': return <Activity className="w-5 h-5 text-btc-primary" />;
      case 'degraded': return <Activity className="w-5 h-5 text-warning" />;
      case 'critical': return <Activity className="w-5 h-5 text-critical" />;
      case 'offline': return <Activity className="w-5 h-5 text-critical" />;
      default: return <Activity className="w-5 h-5 text-text-secondary" />;
    }
  };

  const systemMetrics: SystemMetric[] = [
    {
      label: "Active Engines",
      value: `${activeEngines}/${totalEngines}`,
      status: activeEngines === totalEngines ? 'good' : activeEngines > totalEngines * 0.7 ? 'warning' : 'critical'
    },
    {
      label: "Data Integrity",
      value: dataIntegrity,
      unit: "%",
      status: dataIntegrity >= 95 ? 'good' : dataIntegrity >= 85 ? 'warning' : 'critical'
    },
    {
      label: "Refresh Rate",
      value: refreshRate,
      unit: "s",
      status: 'good'
    },
    {
      label: "System Status",
      value: systemHealth.toUpperCase(),
      status: systemHealth === 'healthy' ? 'good' : systemHealth === 'degraded' ? 'warning' : 'critical'
    }
  ];

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-btc-primary';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-critical';
      default: return 'text-text-secondary';
    }
  };

  return (
    <BaseTile 
      size="lg" 
      variant={getHealthStatus() === "critical" ? "critical" : getHealthStatus() === "warning" ? "warning" : "primary"}
      status={getHealthStatus() === "normal" ? "active" : getHealthStatus()}
      interactive="none"
      className="col-span-full"
    >
      {/* Compact Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-mono font-medium text-btc-primary tracking-wide uppercase">
              INTELLIGENCE ENGINE V6
            </h1>
            <div className="text-xs text-text-secondary font-mono">
              Real-Time Market Intelligence
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getHealthIcon()}
              <div className="text-right">
                <div className={cn("text-sm font-mono font-medium", getHealthColor())}>
                  {systemHealth.toUpperCase()}
                </div>
              </div>
            </div>
            
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 rounded-lg bg-glass-surface hover:bg-btc-primary/20 transition-colors duration-200"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-btc-primary" />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-critical/30 bg-critical/5 mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-critical text-xs font-mono font-medium">⚠ ERROR:</span>
              <span className="text-critical text-xs font-mono">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Compact System Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric, index) => (
          <div key={metric.label} className="space-y-1">
            <div className="text-xs text-text-secondary font-mono uppercase tracking-wide">
              {metric.label}
            </div>
            <div className={cn(
              "text-sm font-mono font-medium",
              getMetricColor(metric.status)
            )}>
              {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
              {metric.unit && (
                <span className="text-xs text-text-secondary ml-1">
                  {metric.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Live indicator */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <div className="w-2 h-2 bg-btc-primary rounded-full animate-pulse" />
        <span className="text-xs text-btc-primary font-mono font-medium">LIVE</span>
      </div>
    </BaseTile>
  );
});

IntelligenceHeaderTile.displayName = "IntelligenceHeaderTile";