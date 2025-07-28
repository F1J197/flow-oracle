import { GlassTile } from "@/components/shared/GlassTile";
import { StableDataDisplay } from "@/components/shared/StableDataDisplay";
import { useStableData } from "@/hooks/useStableData";
import { memo } from "react";

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
    <GlassTile title="PRIMARY ACTION" size="large">
      <StableDataDisplay
        value="HOLD POSITIONS"
        size="lg"
        color="lime"
        loading={false} // Always false - static tile
        stabilityConfig={{
          changeThreshold: 1.0, // Never change
          debounceMs: 300000, // 5 minutes
          smoothingFactor: 1.0
        }}
      />
      <div className="flex items-center space-x-2 mt-3">
        <div className="w-2 h-2 bg-neon-lime rounded-full opacity-60" style={{ animation: 'pulse 4s ease-in-out infinite' }}></div>
        <span className="text-xs text-text-secondary">
          Confidence: {Math.round(stableConfidence)}%
        </span>
      </div>
      <p className="text-xs text-text-muted mt-2">
        Risk Level: MODERATE
      </p>
    </GlassTile>
  );
});