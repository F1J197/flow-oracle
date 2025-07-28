import { GlassTile } from "@/components/shared/GlassTile";
import { StableDataDisplay } from "@/components/shared/StableDataDisplay";
import { useStableData } from "@/hooks/useStableData";
import { memo } from "react";

interface OnChainDynamicsTileProps {
  loading?: boolean; // Ignored for static tile
}

export const OnChainDynamicsTile = memo(({ loading = false }: OnChainDynamicsTileProps) => {
  // Static data - no external dependencies
  const { value: stableScore } = useStableData(78, {
    changeThreshold: 1.0, // Never change unless manually updated
    debounceMs: 60000, // 1 minute minimum
    smoothingFactor: 1.0 // No smoothing
  });

  return (
    <GlassTile title="ON-CHAIN DYNAMICS">
      <StableDataDisplay
        value={Math.round(stableScore)}
        suffix="/100"
        label="Composite Score"
        size="lg"
        color="teal"
        loading={false} // Always false - static tile
        stabilityConfig={{
          changeThreshold: 1.0, // Never change
          debounceMs: 300000, // 5 minutes
          smoothingFactor: 1.0
        }}
      />
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-neon-gold rounded-full opacity-80"></div>
          <span className="text-text-muted">MVRV-Z</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-neon-lime rounded-full opacity-80"></div>
          <span className="text-text-muted">Puell</span>
        </div>
      </div>
    </GlassTile>
  );
});