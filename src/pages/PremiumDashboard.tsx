import { useUnifiedDashboard } from "@/hooks/useUnifiedDashboard";
import { PremiumLayout } from "@/components/layout/PremiumLayout";
import { DataTile, MultiMetricTile, AlertTile } from "@/components/premium";
import { PrimaryActionTile } from "@/components/dashboard/PrimaryActionTile";
import { PrimaryDealerIntelligenceTile } from "@/components/intelligence/PrimaryDealerIntelligenceTile";
import { SystemStatusFooter } from "@/components/dashboard/SystemStatusFooter";
import { StaticTileWrapper } from "@/components/dashboard/StaticTileWrapper";
import { Activity, TrendingUp, Shield, Database, Target, BarChart3 } from "lucide-react";
import { SafeZScoreTile } from "@/components/dashboard/SafeZScoreTile";

export const PremiumDashboard = () => {
  const {
    dashboardData,
    loading,
    error,
    stats,
    overallStatus,
    systemHealth,
    refreshData
  } = useUnifiedDashboard({
    autoRefresh: true,
    refreshInterval: 15000
  });

  // Enhanced insight creation with richer data mapping
  const createPremiumInsight = (tileData: any, engineName: string) => {
    if (!tileData) return null;

    const isPositive = tileData.trend === 'up' || tileData.status === 'success';
    const isCritical = tileData.status === 'critical';
    const isWarning = tileData.status === 'warning';

    return {
      primary: {
        label: tileData.label || engineName,
        value: tileData.primaryMetric || tileData.value || '---',
        unit: tileData.unit || '',
        change: tileData.change || 0,
        trend: tileData.trend as 'up' | 'down' | 'neutral',
        color: isCritical ? 'critical' : isWarning ? 'warning' : isPositive ? 'success' : 'primary'
      },
      secondary: tileData.secondaryMetrics || [],
      insight: tileData.actionText || tileData.insight || `${engineName} operational`,
      confidence: isCritical ? 'LOW' : isWarning ? 'MED' : 'HIGH',
      status: tileData.status || 'normal'
    };
  };

  // Error handling with premium styling
  if (error) {
    return (
      <PremiumLayout maxWidth="lg" density="comfortable">
        <AlertTile
          title="Dashboard Connection Error"
          message={error}
          alertType="critical"
          action={{
            label: "Retry Connection",
            onClick: refreshData
          }}
          timestamp={new Date().toLocaleString()}
          isDismissible={false}
        />
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout maxWidth="2xl" density="comfortable" variant="dashboard">
      {/* Primary Action Tile - Hero Position */}
      <div className="col-span-full sm:col-span-2 lg:col-span-2">
        <PrimaryActionTile />
      </div>

      {/* Net Liquidity Engine */}
      {dashboardData?.netLiquidity && (
        <StaticTileWrapper>
          <DataTile
            title="Net Liquidity"
            metric={{
              label: "Total Liquidity",
              value: dashboardData.netLiquidity.primaryMetric || "$5.626T",
              unit: "",
              change: 2.3,
              trend: dashboardData.netLiquidity.trend as 'up' | 'down' | 'neutral',
              color: 'primary'
            }}
            subtitle="Liquidity expanding steadily"
            description="Federal Reserve balance sheet expansion driving market liquidity"
            icon={<TrendingUp className="w-5 h-5" />}
            size="md"
            variant="primary"
            isLoading={loading}
          />
        </StaticTileWrapper>
      )}

      {/* Credit Stress Monitor */}
      {dashboardData?.creditStress && (
        <StaticTileWrapper>
          <DataTile
            title="Credit Stress"
            metric={{
              label: "Stress Level",
              value: dashboardData.creditStress.primaryMetric || "MODERATE",
              change: -1.2,
              trend: dashboardData.creditStress.trend as 'up' | 'down' | 'neutral',
              color: 'warning'
            }}
            subtitle="Credit conditions monitoring"
            description="Corporate bond spreads and treasury yield analysis"
            icon={<Shield className="w-5 h-5" />}
            size="md"
            variant="warning"
            isLoading={loading}
          />
        </StaticTileWrapper>
      )}

      {/* Enhanced Momentum Engine */}
      {dashboardData?.momentum && (
        <StaticTileWrapper>
          <MultiMetricTile
            title="Momentum Analysis"
            primaryMetric={{
              label: "Market Momentum",
              value: dashboardData.momentum.primaryMetric || "BULLISH",
              trend: dashboardData.momentum.trend as 'up' | 'down' | 'neutral',
              change: 5.7,
              color: 'success'
            }}
            secondaryMetrics={[
              { label: "Volume", value: "2.3M", color: 'primary' },
              { label: "Volatility", value: "12.4%", trend: 'down', color: 'warning' }
            ]}
            insight="Strong upward momentum with increasing volume participation"
            icon={<Activity className="w-5 h-5" />}
            size="md"
            layout="grid"
            isLoading={loading}
          />
        </StaticTileWrapper>
      )}

      {/* Enhanced Z-Score Engine */}
      <SafeZScoreTile />

      {/* Primary Dealer Intelligence */}
      <div className="col-span-full sm:col-span-2">
        <StaticTileWrapper>
          <PrimaryDealerIntelligenceTile loading={loading} />
        </StaticTileWrapper>
      </div>

      {/* CUSIP Stealth QE */}
      {dashboardData?.cusipStealth && (
        <StaticTileWrapper>
          <DataTile
            title="CUSIP Stealth QE"
            metric={{
              label: "QE Detection",
              value: dashboardData.cusipStealth.primaryMetric || "ACTIVE",
              change: 12.5,
              trend: dashboardData.cusipStealth.trend as 'up' | 'down' | 'neutral',
              color: 'critical'
            }}
            subtitle="Quantitative easing monitoring"
            description="Federal Reserve asset purchase detection"
            icon={<Target className="w-5 h-5" />}
            size="md"
            variant="critical"
            isLoading={loading}
          />
        </StaticTileWrapper>
      )}

      {/* Data Integrity Engine */}
      {dashboardData?.dataIntegrity && (
        <StaticTileWrapper>
          <DataTile
            title="Data Integrity"
            metric={{
              label: "System Health",
              value: dashboardData.dataIntegrity.primaryMetric || "99.7%",
              unit: "",
              change: 0.1,
              trend: 'up',
              color: 'success'
            }}
            subtitle="Data quality monitoring"
            description="Real-time data validation and quality metrics"
            icon={<Database className="w-5 h-5" />}
            size="md"
            variant="success"
            isLoading={loading}
          />
        </StaticTileWrapper>
      )}

      {/* System Status Footer */}
      <div className="col-span-full">
        <SystemStatusFooter />
      </div>
    </PremiumLayout>
  );
};