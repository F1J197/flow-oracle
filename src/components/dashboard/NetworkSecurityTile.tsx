import { GlassTile } from "@/components/shared/GlassTile";
import { StableDataDisplay } from "@/components/shared/StableDataDisplay";
import { useStableData } from "@/hooks/useStableData";
import { memo } from "react";

interface NetworkSecurityTileProps {
  loading?: boolean; // Ignored for static tile
}

export const NetworkSecurityTile = memo(({ loading = false }: NetworkSecurityTileProps) => {
  // Static data - no external dependencies
  const { value: stableRatio } = useStableData(146.5, {
    changeThreshold: 1.0, // Never change unless manually updated
    debounceMs: 60000, // 1 minute minimum
    smoothingFactor: 1.0 // No smoothing
  });

  return (
    <GlassTile title="NETWORK SECURITY">
      <StableDataDisplay
        value="$693M"
        label="Fair Value"
        size="lg"
        color="teal"
        loading={false} // Always false - static tile
        stabilityConfig={{
          changeThreshold: 1.0, // Never change
          debounceMs: 300000, // 5 minutes
          smoothingFactor: 1.0
        }}
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-text-secondary">Current/Fair:</span>
        <span className="text-sm neon-lime">
          {stableRatio.toFixed(1)}%
        </span>
      </div>
    </GlassTile>
  );
});