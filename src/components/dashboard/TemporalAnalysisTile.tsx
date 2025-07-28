import { GlassTile } from "@/components/shared/GlassTile";
import { DataDisplay } from "@/components/shared/DataDisplay";

interface TemporalAnalysisTileProps {
  loading?: boolean;
}

export const TemporalAnalysisTile = ({ loading = false }: TemporalAnalysisTileProps) => {
  return (
    <GlassTile title="TEMPORAL ANALYSIS">
      <DataDisplay
        value="MONTH 15"
        label="of 48"
        size="lg"
        color="lime"
        loading={loading}
      />
      <div className="mt-3 mb-2">
        <div className="w-full h-2 bg-noir-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-neon-teal to-neon-lime transition-all duration-500"
            style={{ width: '31.25%' }}
          ></div>
        </div>
      </div>
      <p className="text-xs text-text-muted">EARLY BULL / BANANA ZONE</p>
    </GlassTile>
  );
};