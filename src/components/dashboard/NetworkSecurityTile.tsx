import { GlassTile } from "@/components/shared/GlassTile";
import { DataDisplay } from "@/components/shared/DataDisplay";

interface NetworkSecurityTileProps {
  loading?: boolean;
}

export const NetworkSecurityTile = ({ loading = false }: NetworkSecurityTileProps) => {
  return (
    <GlassTile title="NETWORK SECURITY">
      <DataDisplay
        value="$693M"
        label="Fair Value"
        size="lg"
        color="teal"
        loading={loading}
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-text-secondary">Current/Fair:</span>
        <span className="text-sm neon-lime">146.5%</span>
      </div>
    </GlassTile>
  );
};