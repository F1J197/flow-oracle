import { memo } from "react";
import { cn } from "@/lib/utils";
import { DetailedEngineView } from "@/types/engines";
import { BaseTile } from "@/components/tiles/BaseTile";
import { IntelligenceMetricTile } from "./IntelligenceMetricTile";
import { EngineStatusTile } from "./EngineStatusTile";
import { EngineAlertsTile } from "./EngineAlertsTile";
import { Activity, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface PremiumEngineViewProps {
  view: DetailedEngineView;
  loading?: boolean;
  isHealthy?: boolean;
  usingFallback?: boolean;
  retryCount?: number;
}

export const PremiumEngineView = memo(({ 
  view, 
  loading = false, 
  isHealthy = true, 
  usingFallback = false, 
  retryCount = 0 
}: PremiumEngineViewProps) => {
  if (loading) {
    return (
      <BaseTile 
        size="lg" 
        variant="default" 
        status="loading"
        className="animate-pulse"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-6 bg-glass-surface rounded-md w-3/4 animate-shimmer"></div>
            <div className="h-4 bg-glass-surface rounded-md w-1/2"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-glass-surface rounded-md w-2/3"></div>
                <div className="h-8 bg-glass-surface rounded-md w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </BaseTile>
    );
  }

  const getEngineStatus = (): "normal" | "warning" | "critical" => {
    if (!isHealthy && !usingFallback) return "critical";
    if (usingFallback || retryCount > 0) return "warning";
    return "normal";
  };

  const getStatusIcon = () => {
    const status = getEngineStatus();
    switch (status) {
      case "critical": return <XCircle className="w-4 h-4 text-critical" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-warning" />;
      default: return <CheckCircle className="w-4 h-4 text-btc-primary" />;
    }
  };

  const getStatusText = () => {
    if (retryCount > 0) return `Retry ${retryCount}`;
    if (usingFallback) return "Fallback Mode";
    return "Operational";
  };

  // Convert metrics to a format suitable for tiles
  const primaryMetrics = Object.entries(view.primarySection.metrics).slice(0, 4);
  const additionalSections = view.sections || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Engine Header Tile */}
      <BaseTile 
        size="lg" 
        variant={getEngineStatus() === "critical" ? "critical" : getEngineStatus() === "warning" ? "warning" : "primary"}
        status={getEngineStatus() === "normal" ? "active" : getEngineStatus()}
        className="col-span-full"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-2">
            <h2 className="text-xl font-mono font-bold text-text-primary tracking-wide">
              {view.title}
            </h2>
            <div className="text-sm text-text-secondary font-mono">
              {view.primarySection.title}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div className="text-right">
              <div className="text-sm font-mono font-medium text-text-primary">
                {getStatusText()}
              </div>
              <div className="text-xs text-text-secondary font-mono">
                {new Date().toLocaleTimeString('en-US', { 
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })} UTC
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {primaryMetrics.map(([label, value]) => (
            <div key={label} className="space-y-2">
              <div className="text-xs text-text-secondary font-mono uppercase tracking-wide">
                {label}
              </div>
              <div className="text-lg font-mono font-bold text-btc-primary">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
            </div>
          ))}
        </div>
      </BaseTile>

      {/* Detailed Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {additionalSections.map((section, index) => (
          <IntelligenceMetricTile
            key={`${section.title}-${index}`}
            title={section.title}
            metrics={section.metrics}
            variant="default"
            size="md"
          />
        ))}
      </div>

      {/* Status and Alerts */}
      {(view.alerts && view.alerts.length > 0) && (
        <EngineAlertsTile
          alerts={view.alerts}
          engineName={view.title}
        />
      )}
    </div>
  );
});

PremiumEngineView.displayName = "PremiumEngineView";