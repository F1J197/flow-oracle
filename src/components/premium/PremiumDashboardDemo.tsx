import { DataTile, ChartTile, PremiumGrid } from '@/components/premium';
import { PremiumActionTile } from './PremiumActionTile';
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
      <DataTile
        title="Net Liquidity"
        size="lg"
        variant="primary"
        status="active"
        metric={{
          label: "Global Liquidity",
          value: 5.626,
          unit: "T",
          change: 2.3,
          trend: 'up',
          color: 'btc'
        }}
        subtitle="Liquidity expanding steadily with QE continuation"
        description="Treasury drawdown and Federal Reserve balance sheet operations"
      />

      {/* Credit Stress */}
      <DataTile
        title="Credit Stress"
        variant="warning"
        metric={{
          label: "Credit Spread",
          value: 342,
          unit: "bps",
          change: -15.2,
          trend: 'down',
          color: 'btc-light'
        }}
        description="Credit conditions improving across IG and HY segments"
      />

      {/* Momentum Chart */}
      <ChartTile
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
        metrics={[
          {
            label: "Signal Strength",
            value: 0.73,
            change: 12.5,
            color: 'btc'
          }
        ]}
      />

      {/* Primary Dealer Positions */}
      <DataTile
        title="Primary Dealer Positions"
        variant="critical"
        status="warning"
        metric={{
          label: "Treasury Holdings",
          value: -45.2,
          unit: "B",
          change: -8.7,
          trend: 'down',
          color: 'critical'
        }}
        description="Dealers reducing treasury exposure amid volatility"
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
      <DataTile
        title="Z-Score Engine"
        metric={{
          label: "Normalized Score",
          value: 1.84,
          change: 5.2,
          trend: 'up',
          color: 'success'
        }}
        description="Signal indicating oversold conditions in key markets"
      />

      {/* Data Integrity Status */}
      <DataTile
        title="Data Integrity"
        status="active"
        metric={{
          label: "System Health",
          value: "99.7%",
          color: 'success'
        }}
        subtitle="API Status: Online | Last Update: 15s"
        description="Real-time monitoring of data quality and API health"
      />

      {/* Large Chart Tile */}
      <ChartTile
        title="Market Correlation Matrix"
        size="lg"
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
        metrics={[
          {
            label: "Avg Correlation",
            value: "0.847",
            change: -2.1,
            color: 'btc'
          }
        ]}
        chartHeight="lg"
      />
    </PremiumGrid>
  );
};