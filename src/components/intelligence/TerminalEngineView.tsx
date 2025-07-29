import { cn } from "@/lib/utils";
import { DetailedEngineView } from "@/types/engines";
import { Badge } from "@/components/ui/badge";
import { memo } from "react";

interface TerminalEngineViewProps {
  view: DetailedEngineView;
  loading?: boolean;
}

export const TerminalEngineView = memo(({ view, loading = false }: TerminalEngineViewProps) => {
  if (loading) {
    return (
      <div className="glass-tile p-6 space-y-4 min-h-[600px]">
        <div className="space-y-2">
          <div className="h-4 bg-glass-surface rounded w-3/4 animate-pulse"></div>
          <div className="h-3 bg-glass-bg rounded w-full animate-pulse"></div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 bg-glass-surface rounded w-1/4 animate-pulse"></div>
            <div className="h-3 bg-glass-bg rounded w-1/3 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="glass-tile p-6 font-mono text-sm leading-relaxed">
      {/* Engine Title - Clean Format */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-btc-primary font-bold text-base uppercase tracking-wide">
            {view.title}
          </h2>
          <Badge variant="outline" className="text-xs border-btc-primary text-btc-primary bg-btc-primary/10">
            LIVE ⚡
          </Badge>
        </div>
      </div>

      {/* Primary Section */}
      <div className="mb-6">
        <div className="text-btc-primary font-semibold uppercase text-sm mb-3">
          {view.primarySection.title}
        </div>
        
        <div className="space-y-1">
          {Object.entries(view.primarySection.metrics).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-text-secondary">{key}:</span>
              <span className="text-text-primary font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Sections */}
      {view.sections.map((section, index) => (
        <div key={index} className="mb-6">
          <div className="text-btc-primary font-semibold uppercase text-sm mb-3">
            {section.title}
          </div>
          
          {/* Section separator line */}
          <div className="border-b border-text-secondary/30 mb-3"></div>
          
          <div className="space-y-1">
            {Object.entries(section.metrics).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center hover:bg-glass-bg/30 px-2 py-1 rounded transition-colors">
                <span className="text-text-secondary">{key}:</span>
                <span className="text-text-primary font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Alerts Section */}
      {view.alerts && view.alerts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-text-secondary/30">
          <div className="text-btc-primary font-semibold uppercase text-sm mb-3">
            Active Alerts
          </div>
          <div className="space-y-2">
            {view.alerts.map((alert, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded border-l-4 text-sm",
                  alert.severity === "critical"
                    ? "border-btc-error bg-btc-error/10 text-btc-error"
                    : alert.severity === "warning"
                    ? "border-btc-light bg-btc-light/10 text-btc-light"
                    : "border-btc-primary bg-btc-primary/10 text-btc-primary"
                )}
              >
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});