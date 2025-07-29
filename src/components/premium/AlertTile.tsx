import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { BaseTile, BaseTileProps } from "./BaseTile";
import { AlertTriangle, AlertCircle, Info, CheckCircle, X } from "lucide-react";

export interface AlertTileProps extends Omit<BaseTileProps, 'children' | 'variant'> {
  title: string;
  message: string;
  alertType: 'info' | 'warning' | 'critical' | 'success';
  details?: string;
  timestamp?: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  isDismissible?: boolean;
  isLoading?: boolean;
}

const getAlertConfig = (type: 'info' | 'warning' | 'critical' | 'success') => {
  switch (type) {
    case 'info':
      return {
        icon: Info,
        variant: 'default' as const,
        colorClass: 'text-btc-primary',
        bgClass: 'bg-btc-primary/10',
        borderClass: 'border-btc-primary/30'
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        variant: 'warning' as const,
        colorClass: 'text-btc-light',
        bgClass: 'bg-btc-light/10',
        borderClass: 'border-btc-light/30'
      };
    case 'critical':
      return {
        icon: AlertCircle,
        variant: 'critical' as const,
        colorClass: 'text-critical',
        bgClass: 'bg-critical/10',
        borderClass: 'border-critical/30'
      };
    case 'success':
      return {
        icon: CheckCircle,
        variant: 'success' as const,
        colorClass: 'text-success',
        bgClass: 'bg-success/10',
        borderClass: 'border-success/30'
      };
  }
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
  ...tileProps
}: AlertTileProps) => {
  const config = getAlertConfig(alertType);
  const IconComponent = config.icon;

  if (isLoading) {
    return (
      <BaseTile {...tileProps} status="loading">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-glass-bg rounded animate-pulse" />
            <div className="h-4 bg-glass-bg rounded w-1/2 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-glass-bg rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-glass-bg rounded w-full animate-pulse" />
          </div>
        </div>
      </BaseTile>
    );
  }

  return (
    <BaseTile 
      {...tileProps} 
      variant={config.variant}
      status={alertType === 'critical' ? 'critical' : alertType === 'warning' ? 'warning' : 'normal'}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-1 rounded", config.bgClass)}>
            <IconComponent className={cn("w-5 h-5", config.colorClass)} />
          </div>
          <h3 className="text-sm font-medium text-text-secondary tracking-wide uppercase">
            {title}
          </h3>
        </div>
        
        {isDismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-glass-bg rounded transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        )}
      </div>

      {/* Alert Content */}
      <div className="space-y-3">
        <div className={cn(
          "p-3 rounded border",
          config.bgClass,
          config.borderClass
        )}>
          <div className={cn("font-medium text-sm mb-1", config.colorClass)}>
            {message}
          </div>
          
          {details && (
            <div className="text-xs text-text-secondary leading-relaxed">
              {details}
            </div>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div className="text-xs text-text-secondary/60">
            {timestamp.toLocaleString()}
          </div>
        )}

        {/* Action Button */}
        {action && (
          <button
            onClick={action.onClick}
            className={cn(
              "w-full px-4 py-2 rounded text-sm font-medium transition-colors",
              "border border-transparent",
              config.colorClass,
              config.borderClass,
              "hover:bg-glass-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-tile",
              alertType === 'critical' && "focus:ring-critical",
              alertType === 'warning' && "focus:ring-warning",
              alertType === 'info' && "focus:ring-btc-primary",
              alertType === 'success' && "focus:ring-success"
            )}
          >
            {action.label}
          </button>
        )}
      </div>
    </BaseTile>
  );
};