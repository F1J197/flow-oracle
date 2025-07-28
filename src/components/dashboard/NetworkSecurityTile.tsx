import { GlassTile } from "@/components/shared/GlassTile";
import { StableDataDisplay } from "@/components/shared/StableDataDisplay";
import { useStableData } from "@/hooks/useStableData";
import { useStaticTileLoading } from "@/hooks/useStaticTileLoading";
import { memo } from "react";

interface NetworkSecurityTileProps {
  loading?: boolean;
}

export const NetworkSecurityTile = memo(({ loading = false }: NetworkSecurityTileProps) => {
  const stableLoading = useStaticTileLoading(loading, {
    debounceMs: 3000,
    minLoadingDuration: 800
  });

  const { value: stableRatio, isChanging: ratioChanging } = useStableData(146.5, {
    changeThreshold: 0.02, // 2% threshold for ratio changes
    debounceMs: 4000, // Slow updates for ratio
    smoothingFactor: 0.85 // Strong smoothing
  });

  return (
    <GlassTile title="NETWORK SECURITY">
      <StableDataDisplay
        value="$693M"
        label="Fair Value"
        size="lg"
        color="teal"
        loading={stableLoading}
        stabilityConfig={{
          changeThreshold: 0.05, // 5% threshold for value changes
          debounceMs: 4000,
          smoothingFactor: 0.9
        }}
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-text-secondary">Current/Fair:</span>
        <span className={`text-sm neon-lime transition-all duration-500 ${ratioChanging ? 'opacity-80 scale-95' : 'opacity-100 scale-100'}`}>
          {stableRatio.toFixed(1)}%
        </span>
      </div>
    </GlassTile>
  );
});