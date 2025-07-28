import { GlassTile } from "@/components/shared/GlassTile";
import { DataDisplay } from "@/components/shared/DataDisplay";

interface PrimaryActionTileProps {
  loading?: boolean;
}

export const PrimaryActionTile = ({ loading = false }: PrimaryActionTileProps) => {
  return (
    <GlassTile title="PRIMARY ACTION" size="large">
      <DataDisplay
        value="HOLD POSITIONS"
        size="lg"
        color="lime"
        loading={loading}
      />
      <div className="flex items-center space-x-2 mt-3">
        <div className="w-2 h-2 bg-neon-lime rounded-full animate-pulse"></div>
        <span className="text-xs text-text-secondary">Confidence: 89%</span>
      </div>
      <p className="text-xs text-text-muted mt-2">
        Risk Level: MODERATE
      </p>
    </GlassTile>
  );
};