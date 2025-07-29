import { cn } from "@/lib/utils";
import { ReactNode, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const baseTileVariants = cva(
  [
    // Base styling with design system tokens
    "relative overflow-hidden transition-all duration-300",
    "bg-bg-tile backdrop-blur-sm border border-glass-border",
    "rounded-lg shadow-lg hover:shadow-xl",
    "group cursor-default"
  ],
  {
    variants: {
      size: {
        sm: "p-4 min-h-[120px]",
        md: "p-6 min-h-[180px]",
        lg: "p-6 min-h-[240px] col-span-2",
        xl: "p-8 min-h-[320px] col-span-2 row-span-2"
      },
      variant: {
        default: "",
        primary: "border-btc-primary/30 bg-gradient-to-br from-btc-primary/5 to-transparent",
        warning: "border-btc-light/30 bg-gradient-to-br from-btc-light/5 to-transparent", 
        critical: "border-neon-orange/30 bg-gradient-to-br from-neon-orange/5 to-transparent",
        success: "border-neon-teal/30 bg-gradient-to-br from-neon-teal/5 to-transparent"
      },
      status: {
        normal: "",
        active: "ring-1 ring-btc-primary/20",
        warning: "ring-1 ring-btc-light/20 animate-pulse",
        critical: "ring-1 ring-neon-orange/20 animate-pulse",
        loading: "animate-pulse"
      },
      interactive: {
        none: "",
        hover: "hover:scale-[1.02] hover:border-glass-border",
        clickable: "hover:scale-[1.02] hover:border-glass-border cursor-pointer active:scale-[0.98]"
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
        {/* Premium glow effect */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none",
          "bg-gradient-to-br from-btc-primary via-transparent to-btc-glow"
        )} />
        
        {/* Subtle border animation */}
        <div className={cn(
          "absolute inset-0 rounded-lg border border-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          "bg-gradient-to-r from-btc-primary/20 via-transparent to-btc-light/20"
        )} />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

BaseTile.displayName = "BaseTile";