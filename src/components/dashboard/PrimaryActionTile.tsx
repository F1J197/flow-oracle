import { GlassTile } from "@/components/shared/GlassTile";
import { StableDataDisplay } from "@/components/shared/StableDataDisplay";
import { useStableData } from "@/hooks/useStableData";
import { useStaticTileLoading } from "@/hooks/useStaticTileLoading";
import { memo } from "react";

interface PrimaryActionTileProps {
  loading?: boolean;
}

export const PrimaryActionTile = memo(({ loading = false }: PrimaryActionTileProps) => {
  const stableLoading = useStaticTileLoading(loading, {
    debounceMs: 3000, // Extra long debounce for static tiles
    minLoadingDuration: 800
  });

  const { value: stableConfidence, isChanging: confidenceChanging } = useStableData(89, {
    changeThreshold: 0.02, // 2% threshold for confidence changes
    debounceMs: 5000, // Very slow updates for confidence
    smoothingFactor: 0.9 // Heavy smoothing
  });

  return (
    <GlassTile title="PRIMARY ACTION" size="large">
      <StableDataDisplay
        value="HOLD POSITIONS"
        size="lg"
        color="lime"
        loading={stableLoading}
        stabilityConfig={{
          changeThreshold: 0.1, // Only change on major updates
          debounceMs: 4000, // Long debounce for static data
          smoothingFactor: 0.95 // Maximum smoothing
        }}
      />
      <div className="flex items-center space-x-2 mt-3">
        <div className="w-2 h-2 bg-neon-lime rounded-full opacity-60 animate-pulse" style={{ animationDuration: '3s' }}></div>
        <span className={`text-xs text-text-secondary transition-all duration-500 ${confidenceChanging ? 'opacity-80' : 'opacity-100'}`}>
          Confidence: {stableConfidence}%
        </span>
      </div>
      <p className="text-xs text-text-muted mt-2">
        Risk Level: MODERATE
      </p>
    </GlassTile>
  );
});