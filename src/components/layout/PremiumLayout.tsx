import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PremiumLayoutProps {
  children: ReactNode;
  density?: 'compact' | 'comfortable' | 'spacious';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  variant?: 'standard' | 'intelligence' | 'dashboard';
}

export const PremiumLayout = ({ 
  children, 
  density = 'comfortable',
  maxWidth = '2xl',
  className,
  variant = 'dashboard'
}: PremiumLayoutProps) => {
  return (
    <div className={cn(
      "mx-auto transition-all duration-300",
      // Max width variants optimized for LIQUIDITY²
      maxWidth === 'sm' && "max-w-4xl",
      maxWidth === 'md' && "max-w-6xl", 
      maxWidth === 'lg' && "max-w-7xl",
      maxWidth === 'xl' && "max-w-8xl",
      maxWidth === '2xl' && "max-w-9xl",
      maxWidth === 'full' && "max-w-full",
      
      // Density variants
      density === 'compact' && "p-4",
      density === 'comfortable' && "p-6", 
      density === 'spacious' && "p-8",
      
      className
    )}>
      <div className={cn(
        // Base responsive grid optimized for financial tiles
        "grid auto-rows-min transition-all duration-300",
        
        // Variant-specific layouts
        variant === 'dashboard' && [
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          "gap-6 lg:gap-8"
        ],
        variant === 'intelligence' && [
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
          "gap-8"
        ],
        variant === 'standard' && [
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
          "gap-6"
        ],
        
        // Density adjustments for gaps
        density === 'compact' && "gap-4",
        density === 'spacious' && "gap-8 lg:gap-10"
      )}>
        {children}
      </div>
    </div>
  );
};