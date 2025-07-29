import { ReactNode } from "react";
import { PremiumTile } from "./PremiumTile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'btc' | 'secondary' | 'destructive';
  disabled?: boolean;
  icon?: ReactNode;
}

interface PremiumActionTileProps {
  title: string;
  description?: string;
  primaryAction?: ActionButton;
  secondaryActions?: ActionButton[];
  content?: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'xl';
  variant?: 'default' | 'primary' | 'warning' | 'critical';
  status?: 'normal' | 'active' | 'warning' | 'critical';
  isLoading?: boolean;
  className?: string;
}

export const PremiumActionTile = ({
  title,
  description,
  primaryAction,
  secondaryActions = [],
  content,
  size = 'medium',
  variant = 'default',
  status = 'normal',
  isLoading = false,
  className
}: PremiumActionTileProps) => {
  return (
    <PremiumTile
      title={title}
      size={size}
      variant={variant}
      status={status}
      isLoading={isLoading}
      className={className}
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-4 bg-glass-bg rounded w-3/4 animate-pulse" />
          <div className="h-10 bg-glass-bg rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-8 bg-glass-bg rounded animate-pulse" />
            <div className="h-8 bg-glass-bg rounded animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Description */}
          {description && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {description}
            </p>
          )}

          {/* Custom Content */}
          {content && (
            <div className="py-2">
              {content}
            </div>
          )}

          {/* Actions Section */}
          <div className="space-y-3 pt-2">
            {/* Primary Action */}
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled || isLoading}
                variant={primaryAction.variant || 'default'}
                className={cn(
                  "w-full transition-all duration-200",
                  "hover:shadow-lg hover:scale-[1.02]",
                  primaryAction.variant === 'btc' && "bg-btc-primary hover:bg-btc-primary/90 text-bg-primary"
                )}
              >
                {primaryAction.icon && (
                  <span className="mr-2">{primaryAction.icon}</span>
                )}
                {primaryAction.label}
              </Button>
            )}

            {/* Secondary Actions */}
            {secondaryActions.length > 0 && (
              <div className={cn(
                "grid gap-2",
                secondaryActions.length === 1 && "grid-cols-1",
                secondaryActions.length === 2 && "grid-cols-2",
                secondaryActions.length > 2 && "grid-cols-2"
              )}>
                {secondaryActions.map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    disabled={action.disabled || isLoading}
                    variant={action.variant || 'secondary'}
                    size="sm"
                    className={cn(
                      "transition-all duration-200",
                      "hover:shadow-md hover:scale-[1.01]"
                    )}
                  >
                    {action.icon && (
                      <span className="mr-1 text-xs">{action.icon}</span>
                    )}
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Action Hint */}
          {(primaryAction || secondaryActions.length > 0) && (
            <div className="text-xs text-text-secondary/70 italic">
              Click actions to interact with the data
            </div>
          )}
        </div>
      )}
    </PremiumTile>
  );
};