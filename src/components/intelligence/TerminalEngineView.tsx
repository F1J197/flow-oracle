import { cn } from "@/lib/utils";
import { DetailedEngineView } from "@/types/engines";
import { Badge } from "@/components/ui/badge";
import { memo } from "react";
import { EngineLayout } from "./EngineLayout";
import { DataSection } from "./DataSection";
import { DataRow } from "./DataRow";
import { DataTable } from "./DataTable";
import { KeyMetrics } from "./KeyMetrics";

interface TerminalEngineViewProps {
  view: DetailedEngineView;
  loading?: boolean;
}

export const TerminalEngineView = memo(({ view, loading = false }: TerminalEngineViewProps) => {
  if (loading) {
    return (
      <EngineLayout title="Loading Engine..." status="offline">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 loading-skeleton w-3/4"></div>
            <div className="h-3 loading-skeleton w-full"></div>
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 loading-skeleton w-1/4"></div>
              <div className="h-3 loading-skeleton w-1/3"></div>
            </div>
          ))}
        </div>
      </EngineLayout>
    );
  }

  // Convert primary section metrics to key metrics format
  const keyMetrics = Object.entries(view.primarySection.metrics).map(([label, value]) => ({
    label,
    value,
    status: 'neutral' as const
  }));

  return (
    <EngineLayout 
      title={view.title} 
      status="active"
      className="min-h-[500px]"
    >
      {/* Key Metrics Overview */}
      <KeyMetrics metrics={keyMetrics} />

      {/* Primary Section with Enhanced Layout */}
      <DataSection title={view.primarySection.title}>
        <div className="space-y-2">
          {Object.entries(view.primarySection.metrics).map(([key, value]) => (
            <DataRow 
              key={key}
              label={key}
              value={value}
              status="neutral"
            />
          ))}
        </div>
      </DataSection>

      {/* Additional Sections with Column Layout */}
      {view.sections.map((section, index) => (
        <DataSection key={index} title={section.title}>
          <div className="space-y-2">
            {Object.entries(section.metrics).map(([key, value]) => (
              <DataRow 
                key={key}
                label={key}
                value={value}
                status="neutral"
              />
            ))}
          </div>
        </DataSection>
      ))}

      {/* Enhanced Alerts Section */}
      {view.alerts && view.alerts.length > 0 && (
        <DataSection title="Active Alerts">
          <div className="space-y-3">
            {view.alerts.map((alert, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-md border-l-4 font-mono text-sm",
                  "transition-all duration-200 hover:bg-glass-bg/50",
                  alert.severity === "critical"
                    ? "border-btc-error bg-btc-error/5 text-btc-error"
                    : alert.severity === "warning"
                    ? "border-btc-light bg-btc-light/5 text-btc-light"
                    : "border-btc-primary bg-btc-primary/5 text-btc-primary"
                )}
              >
                <div className="flex items-start justify-between">
                  <span>{alert.message}</span>
                  <span className={cn(
                    "text-xs font-bold uppercase px-2 py-1 rounded",
                    `status-${alert.severity}`
                  )}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DataSection>
      )}
    </EngineLayout>
  );
});