import { GlassTile } from "@/components/shared/GlassTile";
import { DataDisplay } from "@/components/shared/DataDisplay";
import { Badge } from "@/components/ui/badge";

interface BusinessCycleTileProps {
  loading?: boolean;
}

export const BusinessCycleTile = ({ loading = false }: BusinessCycleTileProps) => {
  return (
    <GlassTile title="BUSINESS CYCLE">
      <DataDisplay
        value="48.7"
        label="ISM PMI"
        size="lg"
        color="orange"
        trend="down"
        loading={loading}
      />
      <Badge variant="outline" className="border-neon-orange text-neon-orange mt-2">
        CONTRACTION
      </Badge>
    </GlassTile>
  );
};