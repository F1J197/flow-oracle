import { useDataIntegrity } from "@/hooks/useDataIntegrity";
import { DataIntegrityView } from "./DataIntegrityView";

interface DataIntegrityEngineViewProps {
  loading?: boolean;
}

export function DataIntegrityEngineView({ loading: externalLoading }: DataIntegrityEngineViewProps) {
  const { intelligenceView, loading, error, refreshDataIntegrity } = useDataIntegrity({
    autoRefresh: true,
    refreshInterval: 30000
  });

  // Show loading state if external loading or internal loading
  const isLoading = externalLoading || loading;

  // Handle error state
  if (error && !isLoading) {
    return (
      <div className="glass-tile p-6 font-mono">
        <h3 className="text-lg font-bold text-btc-primary mb-4">Data Integrity Engine</h3>
        <p className="text-text-secondary mb-2">Error loading data integrity metrics</p>
        <button 
          onClick={refreshDataIntegrity}
          className="px-4 py-2 bg-btc-primary/20 border border-btc-primary/30 rounded text-btc-primary hover:bg-btc-primary/30 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show loading state
  if (isLoading || !intelligenceView) {
    return (
      <div className="glass-tile p-6 font-mono">
        <h3 className="text-lg font-bold text-btc-primary mb-4">Data Integrity Engine</h3>
        <div className="space-y-3">
          <div className="h-4 bg-btc-primary/20 rounded animate-pulse"></div>
          <div className="h-4 bg-btc-primary/20 rounded animate-pulse"></div>
          <div className="h-4 bg-btc-primary/20 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return <DataIntegrityView data={intelligenceView} />;
}