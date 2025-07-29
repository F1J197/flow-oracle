import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardGridProps {
  children: ReactNode;
  density?: 'compact' | 'comfortable' | 'spacious';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

export const DashboardGrid = ({ 
  children, 
  density = 'comfortable',
  maxWidth = '2xl',
  className 
}: DashboardGridProps) => {
  return (
    <div className={cn(
      "mx-auto p-6 transition-all duration-300",
      // Max width variants
      maxWidth === 'sm' && "max-w-2xl",
      maxWidth === 'md' && "max-w-4xl", 
      maxWidth === 'lg' && "max-w-6xl",
      maxWidth === 'xl' && "max-w-7xl",
      maxWidth === '2xl' && "max-w-8xl",
      maxWidth === 'full' && "max-w-full",
      className
    )}>
      <div className={cn(
        // Enhanced responsive grid matching Prompt 3 specs
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        "auto-rows-min",
        
        // Density variants
        density === 'compact' && "gap-4",
        density === 'comfortable' && "gap-6", 
        density === 'spacious' && "gap-8"
      )}>
        {children}
      </div>
    </div>
  );
};