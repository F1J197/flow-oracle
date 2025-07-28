import { GlassTile } from "@/components/shared/GlassTile";
import { DataDisplay } from "@/components/shared/DataDisplay";

interface OnChainDynamicsTileProps {
  loading?: boolean;
}

export const OnChainDynamicsTile = ({ loading = false }: OnChainDynamicsTileProps) => {
  return (
    <GlassTile title="ON-CHAIN DYNAMICS">
      <DataDisplay
        value="78"
        suffix="/100"
        label="Composite Score"
        size="lg"
        color="teal"
        loading={loading}
      />
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-neon-gold rounded-full"></div>
          <span className="text-text-muted">MVRV-Z</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-neon-lime rounded-full"></div>
          <span className="text-text-muted">Puell</span>
        </div>
      </div>
    </GlassTile>
  );
};