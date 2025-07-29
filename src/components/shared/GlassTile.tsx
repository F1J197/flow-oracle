import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassTileProps {
  title: string;
  children: ReactNode;
  size?: 'normal' | 'large' | 'xl';
  status?: 'normal' | 'warning' | 'critical';
  className?: string;
}

export const GlassTile = ({ 
  title, 
  children, 
  size = 'normal', 
  status = 'normal',
  className 
}: GlassTileProps) => {
  return (
    <div
      className={cn(
        "glass-tile p-6 relative overflow-hidden",
        size === 'large' && "col-span-2",
        size === 'xl' && "col-span-2 row-span-2",
        status === 'critical' && "critical-pulse border-btc-primary",
        status === 'warning' && "border-btc-light",
        className
      )}
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-secondary tracking-wider uppercase">
          {title}
        </h3>
        {status === 'critical' && (
          <div className="w-2 h-2 bg-btc-primary rounded-full animate-pulse"></div>
        )}
        {status === 'warning' && (
          <div className="w-2 h-2 bg-btc-light rounded-full animate-pulse"></div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {children}
      </div>

      {/* Subtle BTC glow effect on hover */}
      <div className="absolute inset-0 opacity-0 hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br from-btc-primary to-btc-glow pointer-events-none"></div>
    </div>
  );
};