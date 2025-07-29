import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PremiumTileProps {
  title: string;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'xl';
  variant?: 'default' | 'primary' | 'warning' | 'critical';
  status?: 'normal' | 'active' | 'warning' | 'critical';
  isLoading?: boolean;
  className?: string;
}

export const PremiumTile = ({ 
  title, 
  children, 
  size = 'medium', 
  variant = 'default',
  status = 'normal',
  isLoading = false,
  className 
}: PremiumTileProps) => {
  return (
    <div
      className={cn(
        // Base premium tile styling
        "premium-tile relative overflow-hidden transition-all duration-300",
        "bg-bg-tile backdrop-blur-sm border border-glass-border",
        "rounded-lg shadow-lg hover:shadow-xl",
        
        // Size variants
        size === 'small' && "p-4 min-h-[140px]",
        size === 'medium' && "p-6 min-h-[200px]",
        size === 'large' && "p-6 min-h-[280px] col-span-2",
        size === 'xl' && "p-8 min-h-[400px] col-span-2 row-span-2",
        
        // Variant styles
        variant === 'primary' && "border-btc-primary/30 bg-gradient-to-br from-btc-primary/5 to-transparent",
        variant === 'warning' && "border-btc-light/30 bg-gradient-to-br from-btc-light/5 to-transparent",
        variant === 'critical' && "border-critical/30 bg-gradient-to-br from-critical/5 to-transparent",
        
        // Status effects
        status === 'active' && "ring-1 ring-btc-primary/20",
        status === 'warning' && "ring-1 ring-warning/20 animate-pulse",
        status === 'critical' && "ring-1 ring-critical/20 animate-pulse",
        
        // Loading state
        isLoading && "animate-pulse",
        
        className
      )}
    >
      {/* Premium Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-secondary tracking-wide uppercase">
          {title}
        </h3>
        
        {/* Status Indicator */}
        {status !== 'normal' && (
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            status === 'active' && "bg-btc-primary",
            status === 'warning' && "bg-warning",
            status === 'critical' && "bg-critical"
          )} />
        )}
      </div>

      {/* Content Area */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Premium Glow Effect */}
      <div className={cn(
        "absolute inset-0 opacity-0 hover:opacity-10 transition-opacity duration-500 pointer-events-none",
        "bg-gradient-to-br from-btc-primary via-transparent to-btc-glow"
      )} />
      
      {/* Subtle Border Animation */}
      <div className="absolute inset-0 rounded-lg border border-transparent bg-gradient-to-r from-btc-primary/20 via-transparent to-btc-light/20 opacity-0 hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
};