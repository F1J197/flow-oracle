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
      size="xl" 
      variant={getHealthStatus() === "critical" ? "critical" : getHealthStatus() === "warning" ? "warning" : "primary"}
      status={getHealthStatus() === "normal" ? "active" : getHealthStatus()}
      interactive="none"
      className="col-span-full"
    >
      {/* Main Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-mono font-bold text-btc-primary tracking-wider uppercase">
              ═══ INTELLIGENCE ENGINE V6 ═══
            </h1>
            <div className="text-sm text-text-secondary font-mono">
              Institutional-Grade Market Intelligence • Real-Time Processing
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              {getHealthIcon()}
              <div className="text-right">
                <div className={cn("text-lg font-mono font-bold", getHealthColor())}>
                  {systemHealth.toUpperCase()}
                </div>
                <div className="text-xs text-text-secondary font-mono">
                  System Status
                </div>
              </div>
            </div>
            
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 rounded-lg bg-glass-surface hover:bg-btc-primary/20 transition-colors duration-200"
                title="Force Refresh"
              >
                <RefreshCw className="w-5 h-5 text-btc-primary" />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg border border-critical/30 bg-critical/5 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-critical text-sm font-mono font-bold">⚠ ERROR:</span>
              <span className="text-critical text-sm font-mono">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {systemMetrics.map((metric, index) => (
          <div key={metric.label} className="space-y-2">
            <div className="text-xs text-text-secondary font-mono uppercase tracking-wide">
              {metric.label}
            </div>
            <div className={cn(
              "text-xl font-mono font-bold",
              getMetricColor(metric.status)
            )}>
              {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
              {metric.unit && (
                <span className="text-sm text-text-secondary ml-1">
                  {metric.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Architecture Info */}
      <div className="pt-6 border-t border-glass-border/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm font-mono">
          <div className="flex items-center space-x-3">
            <Database className="w-4 h-4 text-btc-primary" />
            <div>
              <div className="text-btc-primary font-bold">FOUNDATION ENGINES</div>
              <div className="text-text-secondary">Data integrity & Z-Score analysis</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Cpu className="w-4 h-4 text-btc-light" />
            <div>
              <div className="text-btc-light font-bold">PILLAR ANALYSIS</div>
              <div className="text-text-secondary">Credit, liquidity & momentum</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Activity className="w-4 h-4 text-btc-glow" />
            <div>
              <div className="text-btc-glow font-bold">SYNTHESIS ENGINE</div>
              <div className="text-text-secondary">V6 unified processing</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="absolute top-6 right-6 flex items-center space-x-2">
        <div className="w-2 h-2 bg-btc-primary rounded-full animate-pulse" />
        <span className="text-xs text-btc-primary font-mono font-bold">LIVE</span>
      </div>
    </BaseTile>
  );
});

IntelligenceHeaderTile.displayName = "IntelligenceHeaderTile";