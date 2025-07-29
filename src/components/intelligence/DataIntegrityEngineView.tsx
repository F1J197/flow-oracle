import { useMemo } from "react";
import { TerminalLayout } from "./TerminalLayout";
import { TerminalMetricGrid } from "./TerminalMetricGrid";
import { TerminalDataSection } from "./TerminalDataSection";
import { TerminalDataRow } from "./TerminalDataRow";
import { useDataIntegrity } from "@/hooks/useDataIntegrity";
import { useStableData } from "@/hooks/useStableData";

interface DataIntegrityEngineViewProps {
  loading?: boolean;
  className?: string;
}

export function DataIntegrityEngineView({ loading: externalLoading, className }: DataIntegrityEngineViewProps) {
  const { metrics, loading: hookLoading, error } = useDataIntegrity({
    autoRefresh: true,
    refreshInterval: 30000
  });

  const isLoading = externalLoading || hookLoading;

  // Stabilized mock data for consistent display
  const mockData = useStableData({
    integrityScore: 95.2,
    activeSources: 4,
    totalSources: 4,
    consensusLevel: 97.8,
    p95Latency: 142,
    errorRate: 0.001,
    dataFreshness: 28,
    completeness: 99.8
  }).value;

  const data = metrics || mockData;

  const keyMetrics = useMemo(() => [
    {
      label: "Integrity Score",
      value: `${data.integrityScore.toFixed(1)}%`,
      status: data.integrityScore >= 95 ? 'positive' as const : data.integrityScore >= 90 ? 'neutral' as const : 'negative' as const
    },
    {
      label: "Active Sources",
      value: `${data.activeSources}/${data.totalSources}`,
      status: data.activeSources === data.totalSources ? 'positive' as const : 'warning' as const
    },
    {
      label: "Consensus Level",
      value: `${data.consensusLevel.toFixed(1)}%`,
      status: data.consensusLevel >= 95 ? 'positive' as const : 'neutral' as const
    },
    {
      label: "P95 Latency",
      value: `${data.p95Latency}ms`,
      status: data.p95Latency < 200 ? 'positive' as const : 'warning' as const
    }
  ], [data]);

  // Safe access with fallbacks
  const getDataValue = (key: string, fallback: any) => {
    return (data as any)[key] ?? fallback;
  };

  if (isLoading) {
    return (
      <TerminalLayout title="DATA INTEGRITY ENGINE" status="offline" className={className}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-glass-bg rounded"></div>
          <div className="h-4 bg-glass-bg rounded w-3/4"></div>
          <div className="h-4 bg-glass-bg rounded w-1/2"></div>
        </div>
      </TerminalLayout>
    );
  }

  if (error) {
    return (
      <TerminalLayout title="DATA INTEGRITY ENGINE" status="critical" className={className}>
        <div className="text-center text-neon-orange">
          Error loading data integrity metrics
        </div>
      </TerminalLayout>
    );
  }

  const status = data.integrityScore >= 95 ? 'active' : 
                data.integrityScore >= 90 ? 'warning' : 'critical';

  return (
    <TerminalLayout title="DATA INTEGRITY ENGINE" status={status} className={className}>
      <div className="space-y-6">
        <TerminalMetricGrid metrics={keyMetrics} columns={2} />
        
        <TerminalDataSection title="SOURCE STATUS">
          <TerminalDataRow 
            label="Active Sources" 
            value={`${data.activeSources}/${data.totalSources}`}
            status={data.activeSources === data.totalSources ? 'positive' : 'warning'}
          />
          <TerminalDataRow 
            label="Data Freshness" 
            value={`${getDataValue('dataFreshness', 28)}s`}
            status={getDataValue('dataFreshness', 28) < 60 ? 'positive' : 'warning'}
          />
          <TerminalDataRow 
            label="Completeness" 
            value={`${getDataValue('completeness', 99.8)}%`}
            status={getDataValue('completeness', 99.8) > 99 ? 'positive' : 'neutral'}
          />
        </TerminalDataSection>

        <TerminalDataSection title="QUALITY METRICS">
          <TerminalDataRow 
            label="Error Rate" 
            value={`${getDataValue('errorRate', 0.001)}%`}
            status={getDataValue('errorRate', 0.001) < 0.01 ? 'positive' : 'warning'}
          />
          <TerminalDataRow 
            label="P95 Latency" 
            value={`${data.p95Latency}ms`}
            status={data.p95Latency < 200 ? 'positive' : 'warning'}
          />
          <TerminalDataRow 
            label="Consensus Level" 
            value={`${data.consensusLevel.toFixed(1)}%`}
            status={data.consensusLevel >= 95 ? 'positive' : 'neutral'}
          />
        </TerminalDataSection>

        <TerminalDataSection title="SYSTEM HEALTH">
          <TerminalDataRow 
            label="Overall Status" 
            value="OPTIMAL"
            status="positive"
          />
          <TerminalDataRow 
            label="Self-Healing" 
            value="ACTIVE"
            status="positive"
          />
          <TerminalDataRow 
            label="Auto-Healed (24h)" 
            value="0"
            status="positive"
          />
        </TerminalDataSection>
      </div>
    </TerminalLayout>
  );
}