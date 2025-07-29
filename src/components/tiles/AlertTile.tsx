import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Info, AlertTriangle, AlertCircle, CheckCircle, X } from "lucide-react";
import { BaseTile, BaseTileProps } from "./BaseTile";
import { Button } from "@/components/ui/button";

export interface AlertTileProps extends Omit<BaseTileProps, 'children' | 'variant'> {
  title: string;
  message: string;
  alertType: 'info' | 'warning' | 'critical' | 'success';
  details?: string;
  timestamp?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive';
  };
  onDismiss?: () => void;
  isDismissible?: boolean;
  isLoading?: boolean;
}

// Get alert configuration based on type
const getAlertConfig = (type: AlertTileProps['alertType']) => {
  const configs = {
    info: {
      icon: Info,
      variant: 'primary' as const,
      colorClass: 'text-btc-primary',
      bgClass: 'bg-btc-primary/5',
      borderClass: 'border-btc-primary/20'
    },
    warning: {
      icon: AlertTriangle,
      variant: 'warning' as const,
      colorClass: 'text-warning',
      bgClass: 'bg-warning/5',
      borderClass: 'border-warning/20'
    },
    critical: {
      icon: AlertCircle,
      variant: 'critical' as const,
      colorClass: 'text-critical',
      bgClass: 'bg-critical/5',
      borderClass: 'border-critical/20'
    },
    success: {
      icon: CheckCircle,
      variant: 'success' as const,
      colorClass: 'text-success',
      bgClass: 'bg-success/5',
      borderClass: 'border-success/20'
    }
  };
  return configs[type];
};

export const AlertTile = ({
  title,
  message,
  alertType,
  details,
  timestamp,
  action,
  onDismiss,
  isDismissible = false,
  isLoading = false,
  className,
  ...props
}: AlertTileProps) => {
  const config = getAlertConfig(alertType);
  const IconComponent = config.icon;

  if (isLoading) {
    return (
      <BaseTile className={cn("space-y-4", className)} status="loading" {...props}>
        <div className="flex items-start gap-3">
          <div className="h-5 w-5 bg-glass-surface animate-pulse rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-glass-surface animate-pulse rounded w-32" />
            <div className="h-3 bg-glass-surface animate-pulse rounded w-full" />
            <div className="h-3 bg-glass-surface animate-pulse rounded w-3/4" />
          </div>
        </div>
      </BaseTile>
    );
  }

  return (
    <BaseTile 
      className={cn(
        "space-y-4",
        config.bgClass,
        config.borderClass,
        className
      )} 
      variant={config.variant}
      status={alertType === 'critical' ? 'critical' : alertType === 'warning' ? 'warning' : 'normal'}
      {...props}
    >
      {/* Header with icon and dismiss */}
      <div className="flex items-start gap-3">
        <div className={cn("flex-shrink-0 mt-0.5", config.colorClass)}>
          <IconComponent className="h-5 w-5" />
        </div>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn("text-sm font-medium", config.colorClass)}>
              {title}
            </h3>
            {isDismissible && onDismiss && (
              <button
                onClick={onDismiss}
                className="flex-shrink-0 text-text-secondary hover:text-text-primary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="text-sm text-text-primary">
            {message}
          </div>
        </div>
      </div>

      {/* Details */}
      {details && (
        <div className="text-xs text-text-secondary bg-glass-surface/50 p-3 rounded-lg border border-glass-border/30">
          {details}
        </div>
      )}

      {/* Footer with timestamp and action */}
      {(timestamp || action) && (
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-glass-border/30">
          {timestamp && (
            <span className="text-xs text-text-secondary">
              {timestamp}
            </span>
          )}
          
          {action && (
            <Button
              size="sm"
              variant={action.variant || "default"}
              onClick={action.onClick}
              className="text-xs"
            >
              {action.label}
            </Button>
          )}
        </div>
      )}
    </BaseTile>
  );
};