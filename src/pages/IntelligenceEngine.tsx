import { useEngineManager } from "@/hooks/useEngineManager";
import { IntelligenceTile } from "@/components/intelligence/IntelligenceTile";
import { IntelligenceViewData } from "@/types/intelligenceView";
import { useMemo } from "react";

export const IntelligenceEngine = () => {
  const { engines } = useEngineManager();

  // Convert engine data to intelligence view format
  const intelligenceData = useMemo((): IntelligenceViewData[] => {
    const createIntelligenceView = (engine: any, engineId: string): IntelligenceViewData => {
      try {
        const dashboardData = engine.getDashboardData();
        const detailedView = engine.getDetailedView();
        
        // Extract key metrics from detailed view
        const keyMetrics = [];
        if (detailedView.primarySection?.metrics) {
          const entries = Object.entries(detailedView.primarySection.metrics).slice(0, 3);
          keyMetrics.push(...entries.map(([label, value]) => ({
            label,
            value,
            status: 'good' as const
          })));
        }
        
        // Add secondary metrics if available
        if (detailedView.sections?.[0]?.metrics) {
          const entries = Object.entries(detailedView.sections[0].metrics).slice(0, 2);
          keyMetrics.push(...entries.map(([label, value]) => ({
            label,
            value,
            status: 'good' as const
          })));
        }

        // Extract insights
        const insights: string[] = [];
        if (dashboardData.actionText) {
          insights.push(dashboardData.actionText);
        }
        if (detailedView.alerts?.length > 0) {
          insights.push(...detailedView.alerts.map(alert => alert.message));
        }

        return {
          title: dashboardData.title,
          status: dashboardData.status === 'critical' ? 'critical' : 
                 dashboardData.status === 'warning' ? 'warning' : 'active',
          primaryMetric: {
            label: "Primary Metric",
            value: dashboardData.primaryMetric,
            color: dashboardData.color || 'teal'
          },
          keyMetrics: keyMetrics.slice(0, 4), // Limit to 4 for space
          insights: insights.slice(0, 2), // Limit insights
          lastUpdated: new Date()
        };
      } catch (error) {
        console.warn(`Error creating intelligence view for ${engineId}:`, error);
        return {
          title: engine.name || `Engine ${engineId}`,
          status: 'offline' as const,
          primaryMetric: {
            label: "Status",
            value: "ERROR",
            color: 'orange'
          },
          keyMetrics: [],
          insights: ["Engine offline or data unavailable"],
          lastUpdated: new Date()
        };
      }
    };

    return [
      createIntelligenceView(engines.dataIntegrity, 'dataIntegrity'),
      createIntelligenceView(engines.netLiquidity, 'netLiquidity'),
      createIntelligenceView(engines.creditStressV6, 'creditStressV6'),
      createIntelligenceView(engines.enhancedZScore, 'enhancedZScore'),
      createIntelligenceView(engines.enhancedMomentum, 'enhancedMomentum'),
      createIntelligenceView(engines.primaryDealerPositions, 'primaryDealerPositions'),
    ];
  }, [engines]);

  // Create placeholder engines for the remaining 3x3 grid (6 active + 3 placeholders = 9 total)
  const placeholderEngines: IntelligenceViewData[] = [
    {
      title: "REGIME DETECTION ENGINE",
      status: 'offline',
      primaryMetric: { label: "Development Status", value: "IN PROGRESS", color: 'gold' },
      keyMetrics: [
        { label: "Priority", value: "High" },
        { label: "Pillar", value: "Foundation" },
        { label: "ETA", value: "Q2 2024" }
      ],
      insights: ["Market regime classification system"],
      lastUpdated: new Date()
    },
    {
      title: "CROSS-ASSET CORRELATION",
      status: 'offline',
      primaryMetric: { label: "Development Status", value: "DESIGN", color: 'orange' },
      keyMetrics: [
        { label: "Priority", value: "Medium" },
        { label: "Pillar", value: "Pillar 2" },
        { label: "Dependencies", value: "3" }
      ],
      insights: ["Multi-asset momentum analysis"],
      lastUpdated: new Date()
    },
    {
      title: "TEMPORAL DYNAMICS",
      status: 'offline',
      primaryMetric: { label: "Development Status", value: "PLANNING", color: 'fuchsia' },
      keyMetrics: [
        { label: "Priority", value: "High" },
        { label: "Pillar", value: "Pillar 3" },
        { label: "Complexity", value: "High" }
      ],
      insights: ["Time-series momentum decomposition"],
      lastUpdated: new Date()
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold text-neon-teal">Intelligence Engine</h1>
        <p className="text-text-secondary">28 Processing Engines • Real-time Market Analysis</p>
      </div>

      {/* 3x3 Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Active Engines (First 6) */}
        {intelligenceData.map((data, index) => (
          <IntelligenceTile key={index} data={data} />
        ))}
        
        {/* Placeholder Engines (Remaining 3) */}
        {placeholderEngines.map((data, index) => (
          <IntelligenceTile key={`placeholder-${index}`} data={data} />
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-text-muted">
        <p>6 engines active • 3 in development • Updates every 15 seconds</p>
      </div>
    </div>
  );
};

export default IntelligenceEngine;