import { cn } from "@/lib/utils";
import { ReactNode, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const baseTileVariants = cva(
  [
    // Enhanced base styling with new design system
    "relative overflow-hidden transition-all duration-300",
    "bg-bg-tile backdrop-blur-premium border border-glass-border",
    "rounded-xl shadow-md hover:shadow-lg",
    "group cursor-default",
    // Tile-specific animations
    "animate-tileEntry"
  ],
  {
    variants: {
      size: {
        sm: "p-4 min-h-[140px]",
        md: "p-6 min-h-[200px]",
        lg: "p-6 min-h-[280px] col-span-2",
        xl: "p-8 min-h-[360px] col-span-2 row-span-2"
      },
      variant: {
        default: "",
        primary: "border-btc-primary/30 bg-gradient-to-br from-btc-primary/5 to-transparent",
        warning: "border-warning/30 bg-gradient-to-br from-warning/5 to-transparent", 
        critical: "border-critical/30 bg-gradient-to-br from-critical/5 to-transparent",
        success: "border-success/30 bg-gradient-to-br from-success/5 to-transparent",
        positive: "border-positive/30 bg-gradient-to-br from-positive/5 to-transparent",
        negative: "border-negative/30 bg-gradient-to-br from-negative/5 to-transparent"
      },
      status: {
        normal: "",
        active: "ring-1 ring-btc-primary/30 shadow-btc-glow",
        warning: "ring-1 ring-warning/30 animate-statusPulse",
        critical: "ring-1 ring-critical/30 animate-statusPulse",
        loading: "animate-pulse opacity-75"
      },
      interactive: {
        none: "",
        hover: "hover:scale-[1.02] hover:border-btc-primary/20 hover:shadow-btc-glow",
        clickable: "hover:scale-[1.02] hover:border-btc-primary/30 hover:shadow-btc-glow cursor-pointer active:scale-[0.98] transition-transform"
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default", 
      status: "normal",
      interactive: "hover"
    }
  }
);

export interface BaseTileProps extends VariantProps<typeof baseTileVariants> {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  'data-testid'?: string;
}

export const BaseTile = forwardRef<HTMLDivElement, BaseTileProps>(
  ({ children, size, variant, status, interactive, className, onClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(baseTileVariants({ size, variant, status, interactive }), className)}
        onClick={onClick}
        {...props}
      >
        {/* Enhanced premium glow effect */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none",
          "bg-gradient-to-br from-btc-primary/10 via-transparent to-btc-glow/5"
        )} />
        
        {/* Animated border gradient */}
        <div className={cn(
          "absolute inset-0 rounded-xl border border-transparent opacity-0 group-hover:opacity-100 transition-all duration-500",
          "bg-gradient-to-r from-btc-primary/30 via-btc-bright/20 to-btc-light/30 p-[1px]"
        )} />
        
        {/* Inner content container */}
        <div className="absolute inset-[1px] rounded-xl bg-bg-tile group-hover:bg-glass-surface/50 transition-colors duration-500" />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

BaseTile.displayName = "BaseTile";