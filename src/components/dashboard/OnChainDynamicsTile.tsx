import { GlassTile } from "@/components/shared/GlassTile";
import { StableDataDisplay } from "@/components/shared/StableDataDisplay";
import { useStableData } from "@/hooks/useStableData";
import { useStaticTileLoading } from "@/hooks/useStaticTileLoading";
import { memo } from "react";

interface OnChainDynamicsTileProps {
  loading?: boolean;
}

export const OnChainDynamicsTile = memo(({ loading = false }: OnChainDynamicsTileProps) => {
  const stableLoading = useStaticTileLoading(loading, {
    debounceMs: 3000,
    minLoadingDuration: 800
  });

  const { value: stableScore, isChanging: scoreChanging } = useStableData(78, {
    changeThreshold: 0.03, // 3% threshold for score changes
    debounceMs: 4000, // Slow updates for composite score
    smoothingFactor: 0.85 // Strong smoothing
  });

  return (
    <GlassTile title="ON-CHAIN DYNAMICS">
      <StableDataDisplay
        value={Math.round(stableScore)}
        suffix="/100"
        label="Composite Score"
        size="lg"
        color="teal"
        loading={stableLoading}
        stabilityConfig={{
          changeThreshold: 0.05, // 5% threshold for display changes
          debounceMs: 4000,
          smoothingFactor: 0.9
        }}
      />
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-neon-gold rounded-full opacity-80 transition-opacity duration-1000"></div>
          <span className="text-text-muted">MVRV-Z</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-neon-lime rounded-full opacity-80 transition-opacity duration-1000"></div>
          <span className="text-text-muted">Puell</span>
        </div>
      </div>
    </GlassTile>
  );
});