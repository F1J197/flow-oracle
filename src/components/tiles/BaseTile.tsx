import { cn } from "@/lib/utils";
import { ReactNode, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const baseTileVariants = cva(
  [
    // Bloomberg Terminal Strict Styling - Zero Rounded Corners
    "relative overflow-hidden transition-all duration-300",
    "bg-bg-tile border border-glass-border font-mono",
    "shadow-md hover:shadow-lg",
    "group cursor-default terminal-panel"
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
        primary: "border-btc-primary/30 bg-btc-primary/5",
        warning: "border-warning/30 bg-warning/5", 
        critical: "border-critical/30 bg-critical/5",
        success: "border-success/30 bg-success/5",
        positive: "border-positive/30 bg-positive/5",
        negative: "border-negative/30 bg-negative/5"
      },
      status: {
        normal: "",
        active: "ring-1 ring-btc-primary/30 shadow-glow",
        warning: "ring-1 ring-warning/30 animate-pulse",
        critical: "ring-1 ring-critical/30 animate-pulse",
        loading: "animate-pulse opacity-75"
      },
      interactive: {
        none: "",
        hover: "hover:border-neon-teal/50 hover:bg-glass-surface/20",
        clickable: "hover:border-neon-teal/50 hover:bg-glass-surface/20 cursor-pointer active:border-neon-teal/70"
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
        {/* Terminal Glow Effect - No Gradients, Pure Neon */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none",
          "bg-neon-teal/5"
        )} />
        
        {/* Terminal Border Enhancement - Active State */}
        <div className={cn(
          "absolute inset-0 border border-transparent opacity-0 group-hover:opacity-100 transition-all duration-300",
          "border-neon-teal/50"
        )} />
        
        {/* Terminal Content Background */}
        <div className="absolute inset-[1px] bg-bg-tile group-hover:bg-glass-surface/30 transition-colors duration-300" />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

BaseTile.displayName = "BaseTile";