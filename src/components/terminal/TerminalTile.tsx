import { ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { terminalCn, getTerminalStatusColor } from "@/utils/terminalCompliance";

const terminalTileVariants = cva(
  [
    // Pure Bloomberg Terminal Styling
    "relative overflow-hidden transition-all duration-200",
    "bg-bg-tile border border-glass-border font-mono",
    "shadow-md hover:shadow-lg terminal-panel",
    "group cursor-default"
  ],
  {
    variants: {
      size: {
        sm: "p-3 min-h-[120px]",
        md: "p-4 min-h-[160px]",
        lg: "p-6 min-h-[240px] col-span-2",
        xl: "p-8 min-h-[320px] col-span-2 row-span-2"
      },
      variant: {
        default: "",
        primary: "border-neon-teal/40 bg-neon-teal/5",
        warning: "border-neon-gold/40 bg-neon-gold/5",
        critical: "border-neon-fuchsia/40 bg-neon-fuchsia/5",
        success: "border-neon-lime/40 bg-neon-lime/5",
        btc: "border-btc-primary/40 bg-btc-primary/5"
      },
      status: {
        normal: "",
        active: "ring-1 ring-neon-teal/30 shadow-glow",
        warning: "ring-1 ring-neon-gold/30 animate-pulse",
        critical: "ring-1 ring-neon-fuchsia/30 animate-pulse",
        offline: "opacity-50 border-text-muted/30",
        loading: "animate-pulse opacity-75"
      },
      interactive: {
        none: "",
        hover: "hover:border-neon-teal/60 hover:bg-bg-tile/80",
        clickable: "hover:border-neon-teal/60 hover:bg-bg-tile/80 cursor-pointer active:border-neon-teal/80"
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

export interface TerminalTileProps extends Omit<VariantProps<typeof terminalTileVariants>, 'status'> {
  title?: string;
  status?: 'active' | 'warning' | 'critical' | 'offline' | 'normal' | 'loading';
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  'data-testid'?: string;
}

export const TerminalTile = forwardRef<HTMLDivElement, TerminalTileProps>(
  ({ 
    title, 
    status = 'normal',
    children, 
    size, 
    variant, 
    interactive, 
    className, 
    onClick, 
    ...props 
  }, ref) => {
    const statusColor = getTerminalStatusColor(status);
    
    return (
      <div
        ref={ref}
        className={terminalCn(
          terminalTileVariants({ size, variant, status, interactive }), 
          className
        )}
        onClick={onClick}
        {...props}
      >
        {/* Terminal Header */}
        {title && (
          <div className="flex items-center justify-between mb-3 border-b border-glass-border pb-2">
            <span className="terminal-label text-text-secondary">
              {title}
            </span>
            {status !== 'normal' && (
              <span className={cn("text-xs font-mono", statusColor)}>
                {status === 'active' && '█'}
                {status === 'warning' && '▲'}
                {status === 'critical' && '✕'}
                {status === 'offline' && '○'}
              </span>
            )}
          </div>
        )}

        {/* Terminal Glow Effect */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none",
          "bg-neon-teal/5"
        )} />
        
        {/* Terminal Border Enhancement */}
        <div className={cn(
          "absolute inset-0 border border-transparent opacity-0 group-hover:opacity-100 transition-all duration-300",
          "border-neon-teal/50"
        )} />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

TerminalTile.displayName = "TerminalTile";