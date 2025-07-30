import { memo } from "react";
import { cn } from "@/lib/utils";
import { BaseTile } from "@/components/tiles/BaseTile";
import { Beaker, Wrench, FileText } from "lucide-react";

interface DevelopmentEngineCardProps {
  title: string;
  status: 'development' | 'design' | 'planning';
  description: string;
  targetMetrics: string;
  progress?: number;
  expectedCompletion?: string;
}

export const DevelopmentEngineCard = memo(({ 
  title,
  status,
  description,
  targetMetrics,
  progress = 0,
  expectedCompletion
}: DevelopmentEngineCardProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'development':
        return {
          icon: <Beaker className="w-4 h-4 text-btc-light" />,
          color: 'btc-light',
          variant: 'warning' as const,
          bgColor: 'btc-light/10'
        };
      case 'design':
        return {
          icon: <Wrench className="w-4 h-4 text-btc-muted" />,
          color: 'btc-muted',
          variant: 'default' as const,
          bgColor: 'btc-muted/10'
        };
      case 'planning':
        return {
          icon: <FileText className="w-4 h-4 text-text-secondary" />,
          color: 'text-secondary',
          variant: 'default' as const,
          bgColor: 'text-secondary/10'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <BaseTile 
      size="md" 
      variant={config.variant}
      status="normal"
      interactive="hover"
      className="opacity-75 hover:opacity-100 transition-opacity duration-300"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm font-mono font-medium text-text-primary uppercase tracking-wide leading-tight">
            {title}
          </h3>
          <div className="flex items-center space-x-2">
            {config.icon}
            <span className={cn(
              "text-xs font-mono font-bold uppercase px-2 py-1 terminal-panel",
              `text-${config.color} bg-${config.bgColor}`
            )}>
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Description */}
        <div className="space-y-2">
          <div className="text-xs text-text-secondary font-mono uppercase tracking-wide">
            Function
          </div>
          <div className="text-sm text-text-primary font-mono leading-relaxed">
            {description}
          </div>
        </div>

        {/* Target Metrics */}
        <div className="space-y-2">
          <div className="text-xs text-text-secondary font-mono uppercase tracking-wide">
            Target
          </div>
          <div className="text-sm text-text-primary font-mono leading-relaxed">
            {targetMetrics}
          </div>
        </div>

        {/* Progress (if in development) */}
        {status === 'development' && progress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary font-mono uppercase tracking-wide">
                Progress
              </span>
              <span className="text-xs text-btc-light font-mono font-bold">
                {progress}%
              </span>
            </div>
            <div className="w-full h-1 bg-glass-surface terminal-panel">
              <div 
                className="h-full bg-btc-light transition-all duration-300 terminal-panel"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Expected Completion */}
        {expectedCompletion && (
          <div className="space-y-2">
            <div className="text-xs text-text-secondary font-mono uppercase tracking-wide">
              Expected
            </div>
            <div className="text-sm text-btc-primary font-mono font-bold">
              {expectedCompletion}
            </div>
          </div>
        )}
      </div>

      {/* Development indicator */}
      <div className="absolute top-3 left-3 w-1 h-1 bg-btc-light animate-pulse terminal-panel" />
    </BaseTile>
  );
});

DevelopmentEngineCard.displayName = "DevelopmentEngineCard";