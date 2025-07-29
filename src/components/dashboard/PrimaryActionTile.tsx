import { cn } from "@/lib/utils";
import { StableDataDisplay } from "@/components/shared/StableDataDisplay";
import { useStableData } from "@/hooks/useStableData";
import { memo } from "react";
import { Shield, TrendingUp } from "lucide-react";

interface PrimaryActionTileProps {
  loading?: boolean; // Ignored for static tile
}

export const PrimaryActionTile = memo(({ loading = false }: PrimaryActionTileProps) => {
  // Completely static data - no dependency on external loading states
  const { value: stableConfidence } = useStableData(89, {
    changeThreshold: 1.0, // Never change unless manually updated
    debounceMs: 60000, // 1 minute minimum between changes
    smoothingFactor: 1.0 // No smoothing - discrete changes only
  });

  return (
    <div className={cn(
      "glass-tile p-6 col-span-2 min-h-[280px] flex flex-col border border-glass-border hover:border-glass-border/60 transition-all duration-300"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-text-secondary tracking-wider uppercase">
          PRIMARY ACTION
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-btc-primary rounded-full animate-pulse"></div>
          <Shield className="w-4 h-4 text-btc-primary" />
        </div>
      </div>

      {/* Main Action Display */}
      <div className="flex-1 flex flex-col justify-center space-y-4">
        <StableDataDisplay
          value="HOLD POSITIONS"
          size="lg"
          color="btc"
          loading={false}
          stabilityConfig={{
            changeThreshold: 1.0,
            debounceMs: 300000,
            smoothingFactor: 1.0
          }}
        />
        
        {/* Action Insights */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary font-mono">Confidence:</span>
            <span className="text-btc-primary font-bold font-mono">
              {Math.round(stableConfidence)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary font-mono">Risk Level:</span>
            <span className="text-btc-light font-bold font-mono">MODERATE</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary font-mono">Time Horizon:</span>
            <span className="text-btc-bright font-bold font-mono">24-48H</span>
          </div>
        </div>
      </div>

      {/* Footer Indicator */}
      <div className="mt-4 pt-4 border-t border-glass-border/30">
        <div className="flex items-center justify-center space-x-3 text-xs text-text-muted">
          <TrendingUp className="w-3 h-3" />
          <span className="font-mono">POSITION MANAGEMENT SYSTEM</span>
        </div>
      </div>
    </div>
  );
});