import { PremiumDataTile, PremiumChartTile, PremiumActionTile, PremiumGrid } from '@/components/premium';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Mock data for demonstration
const chartData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 700 },
];

export const PremiumDashboardDemo = () => {
  return (
    <PremiumGrid density="comfortable" maxWidth="2xl">
      {/* Net Liquidity - Large Primary Tile */}
      <PremiumDataTile
        title="Net Liquidity"
        size="large"
        variant="primary"
        status="active"
        primaryMetric={{
          label: "Global Liquidity",
          value: 5.626,
          unit: "T",
          change: 2.3,
          trend: 'up',
          color: 'btc'
        }}
        secondaryMetrics={[
          {
            label: "M2 Money Supply",
            value: "21.1T",
            trend: 'up',
            color: 'btc-light'
          },
          {
            label: "TGA Balance", 
            value: "758B",
            trend: 'down',
            color: 'neon-orange'
          }
        ]}
        insight="Liquidity expanding steadily with QE continuation and treasury drawdown"
      />

      {/* Credit Stress */}
      <PremiumDataTile
        title="Credit Stress"
        variant="warning"
        primaryMetric={{
          label: "Credit Spread",
          value: 342,
          unit: "bps",
          change: -15.2,
          trend: 'down',
          color: 'btc-light'
        }}
        insight="Credit conditions improving across IG and HY segments"
      />

      {/* Momentum Chart */}
      <PremiumChartTile
        title="Momentum Engine"
        chart={
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={chartData}>
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--btc-primary))"
                fill="hsl(var(--btc-primary))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        }
        summary={{
          value: 0.73,
          label: "Signal Strength",
          change: 12.5
        }}
      />

      {/* Primary Dealer Positions */}
      <PremiumDataTile
        title="Primary Dealer Positions"
        variant="critical"
        status="warning"
        primaryMetric={{
          label: "Treasury Holdings",
          value: -45.2,
          unit: "B",
          change: -8.7,
          trend: 'down',
          color: 'neon-orange'
        }}
        secondaryMetrics={[
          {
            label: "Duration Risk",
            value: "High",
            color: 'neon-orange'
          }
        ]}
        insight="Dealers reducing treasury exposure amid volatility"
      />

      {/* Action Tile Example */}
      <PremiumActionTile
        title="System Controls"
        description="Monitor and control liquidity intelligence engines"
        primaryAction={{
          label: "Refresh All Data",
          onClick: () => console.log('Refreshing...'),
          variant: 'btc'
        }}
        secondaryActions={[
          {
            label: "Export",
            onClick: () => console.log('Exporting...'),
            variant: 'secondary'
          },
          {
            label: "Settings",
            onClick: () => console.log('Settings...'),
            variant: 'secondary'
          }
        ]}
      />

      {/* Z-Score Performance */}
      <PremiumDataTile
        title="Z-Score Engine"
        primaryMetric={{
          label: "Normalized Score",
          value: 1.84,
          change: 5.2,
          trend: 'up',
          color: 'neon-teal'
        }}
        insight="Signal indicating oversold conditions in key markets"
      />

      {/* Data Integrity Status */}
      <PremiumDataTile
        title="Data Integrity"
        status="active"
        primaryMetric={{
          label: "System Health",
          value: "99.7%",
          color: 'neon-teal'
        }}
        secondaryMetrics={[
          {
            label: "API Status",
            value: "Online",
            color: 'neon-teal'
          },
          {
            label: "Last Update",
            value: "15s",
            color: 'btc-light'
          }
        ]}
      />

      {/* Large Chart Tile */}
      <PremiumChartTile
        title="Market Correlation Matrix"
        size="large"
        chart={
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--btc-primary))"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        }
        summary={{
          value: "0.847",
          label: "Avg Correlation",
          change: -2.1
        }}
      />
    </PremiumGrid>
  );
};