import { cn } from "@/lib/utils";
import { memo } from "react";

interface StabilizedSkeletonLoaderProps {
  variant?: 'tile' | 'engine' | 'data';
  className?: string;
}

export const StabilizedSkeletonLoader = memo(({ 
  variant = 'tile', 
  className 
}: StabilizedSkeletonLoaderProps) => {
  if (variant === 'engine') {
    return (
      <div className={cn(
        "premium-tile p-6 space-y-4 border border-btc-primary/10",
        "min-h-[280px] flex flex-col bg-gradient-to-br from-bg-secondary/95 to-bg-primary/85",
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-bg-elevated/60 rounded w-2/3 soft-shimmer"></div>
          <div className="w-2 h-2 bg-btc-primary/50 animate-pulse terminal-panel"></div>
        </div>
        
        <div className="space-y-4 flex-1">
          <div className="h-8 bg-bg-elevated/60 rounded w-1/2 soft-shimmer"></div>
          
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 bg-bg-elevated/40 rounded w-1/3 soft-shimmer"></div>
                <div className="h-3 bg-bg-elevated/40 rounded w-1/4 soft-shimmer"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-4 border-t border-glass-border/30">
          <div className="flex justify-center">
            <div className="h-2 bg-bg-elevated/40 rounded w-1/2 soft-shimmer"></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'data') {
    return (
      <div className={cn(
        "space-y-3",
        className
      )}>
        <div className="h-6 bg-bg-elevated/60 rounded w-3/4 soft-shimmer"></div>
        <div className="h-4 bg-bg-elevated/40 rounded w-1/2 soft-shimmer"></div>
      </div>
    );
  }

  // Default tile variant
  return (
    <div className={cn(
      "glass-tile p-6 space-y-4 min-h-[200px]",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="h-4 bg-bg-elevated/60 rounded w-1/2 soft-shimmer"></div>
        <div className="w-2 h-2 bg-btc-primary/50 animate-pulse terminal-panel"></div>
      </div>
      
      <div className="space-y-3">
        <div className="h-8 bg-bg-elevated/60 rounded w-2/3 soft-shimmer"></div>
        <div className="h-4 bg-bg-elevated/40 rounded w-1/3 soft-shimmer"></div>
      </div>
    </div>
  );
});

StabilizedSkeletonLoader.displayName = 'StabilizedSkeletonLoader';