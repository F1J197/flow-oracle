import { PremiumLayout } from "@/components/layout/PremiumLayout";
import { DataTile, MultiMetricTile, AlertTile, ChartTile, BaseTile } from "@/components/premium";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Shield, 
  Database, 
  Target, 
  BarChart3,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const PremiumShowcase = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-9xl mx-auto p-8">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            LIQUIDITY² Premium Tile System
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            A comprehensive showcase of the enhanced tile system featuring glass morphism, 
            BTC orange theming, and Bloomberg-inspired financial intelligence displays.
          </p>
        </div>

        {/* Size Variants */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Size Variants</h2>
          <PremiumLayout variant="standard" density="comfortable">
            <DataTile
              title="Small Tile"
              metric={{
                label: "Market Cap",
                value: "$2.4T",
                change: 3.2,
                trend: 'up',
                color: 'primary'
              }}
              size="sm"
              icon={<BarChart3 className="w-4 h-4" />}
            />
            
            <DataTile
              title="Medium Tile"
              metric={{
                label: "Trading Volume",
                value: "$847B",
                change: -1.5,
                trend: 'down',
                color: 'warning'
              }}
              subtitle="24h volume"
              description="Decreased trading activity across major exchanges"
              size="md"
              icon={<Activity className="w-5 h-5" />}
            />
            
            <div className="col-span-2">
              <DataTile
                title="Large Tile"
                metric={{
                  label: "Net Liquidity",
                  value: "$5.626T",
                  unit: "USD",
                  change: 2.8,
                  trend: 'up',
                  color: 'success'
                }}
                subtitle="Federal Reserve Balance Sheet"
                description="Continued expansion of central bank liquidity providing market support. Monitor for policy shifts and taper signals."
                size="lg"
                icon={<TrendingUp className="w-6 h-6" />}
              />
            </div>
          </PremiumLayout>
        </section>

        {/* Color Variants */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Color Variants</h2>
          <PremiumLayout variant="standard" density="comfortable">
            <DataTile
              title="Primary"
              metric={{
                label: "BTC Price",
                value: "$65,420",
                change: 5.7,
                trend: 'up',
                color: 'primary'
              }}
              variant="primary"
              icon={<TrendingUp className="w-5 h-5" />}
            />
            
            <DataTile
              title="Success"
              metric={{
                label: "System Health",
                value: "99.8%",
                change: 0.2,
                trend: 'up',
                color: 'success'
              }}
              variant="success"
              icon={<CheckCircle className="w-5 h-5" />}
            />
            
            <DataTile
              title="Warning"
              metric={{
                label: "Credit Stress",
                value: "MODERATE",
                change: -2.1,
                trend: 'down',
                color: 'warning'
              }}
              variant="warning"
              icon={<AlertTriangle className="w-5 h-5" />}
            />
            
            <DataTile
              title="Critical"
              metric={{
                label: "Risk Level",
                value: "HIGH",
                change: 15.3,
                trend: 'up',
                color: 'critical'
              }}
              variant="critical"
              icon={<Shield className="w-5 h-5" />}
            />
          </PremiumLayout>
        </section>

        {/* Multi-Metric Tiles */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Multi-Metric Tiles</h2>
          <PremiumLayout variant="standard" density="comfortable">
            <MultiMetricTile
              title="Market Overview"
              primaryMetric={{
                label: "S&P 500",
                value: "4,567.23",
                change: 1.2,
                trend: 'up',
                color: 'primary'
              }}
              secondaryMetrics={[
                { label: "NASDAQ", value: "14,235", change: 0.8, trend: 'up', color: 'success' },
                { label: "DOW", value: "35,678", change: -0.3, trend: 'down', color: 'warning' },
                { label: "VIX", value: "18.4", change: -2.1, trend: 'down', color: 'success' }
              ]}
              layout="grid"
              icon={<Activity className="w-5 h-5" />}
            />
            
            <MultiMetricTile
              title="DeFi Metrics"
              primaryMetric={{
                label: "TVL",
                value: "$89.2B",
                change: 4.3,
                trend: 'up',
                color: 'success'
              }}
              secondaryMetrics={[
                { label: "DEX Volume", value: "$12.4B", color: 'primary' },
                { label: "Yield", value: "8.7%", color: 'success' }
              ]}
              insight="DeFi ecosystem showing strong growth across all major protocols"
              layout="list"
              icon={<Zap className="w-5 h-5" />}
            />
          </PremiumLayout>
        </section>

        {/* Alert Tiles */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Alert System</h2>
          <PremiumLayout variant="standard" density="comfortable">
            <AlertTile
              title="System Notification"
              message="Market data successfully synchronized"
              alertType="success"
              timestamp={new Date().toLocaleString()}
              isDismissible={true}
            />
            
            <AlertTile
              title="Warning Alert"
              message="High volatility detected in crypto markets"
              alertType="warning"
              details="BTC volatility increased 23% in the last 4 hours. Monitor position sizes."
              timestamp={new Date().toLocaleString()}
              action={{
                label: "View Details",
                onClick: () => console.log("Action clicked")
              }}
            />
            
            <AlertTile
              title="Critical Alert"
              message="Circuit breaker triggered"
              alertType="critical"
              details="S&P 500 futures down 3.2%. Trading halted for 15 minutes."
              timestamp={new Date().toLocaleString()}
              action={{
                label: "Emergency Protocol",
                onClick: () => console.log("Emergency action")
              }}
            />
            
            <AlertTile
              title="Information"
              message="Fed meeting scheduled for next week"
              alertType="info"
              details="FOMC meeting on interest rates expected to impact market liquidity conditions."
              timestamp={new Date().toLocaleString()}
            />
          </PremiumLayout>
        </section>

        {/* Interactive States */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Interactive States</h2>
          <PremiumLayout variant="standard" density="comfortable">
            <BaseTile 
              size="md" 
              status="normal" 
              interactive="hover"
              className="flex items-center justify-center"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-text-primary mb-2">Hover Effect</h3>
                <p className="text-sm text-text-secondary">Hover to see enhanced glow</p>
              </div>
            </BaseTile>
            
            <BaseTile 
              size="md" 
              status="active" 
              interactive="clickable"
              className="flex items-center justify-center cursor-pointer"
              onClick={() => alert('Tile clicked!')}
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-text-primary mb-2">Clickable</h3>
                <p className="text-sm text-text-secondary">Click for interaction</p>
              </div>
            </BaseTile>
            
            <BaseTile 
              size="md" 
              status="warning" 
              className="flex items-center justify-center"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-text-primary mb-2">Warning State</h3>
                <p className="text-sm text-text-secondary">Pulsing animation</p>
              </div>
            </BaseTile>
            
            <BaseTile 
              size="md" 
              status="loading" 
              className="flex items-center justify-center"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-text-primary mb-2">Loading State</h3>
                <p className="text-sm text-text-secondary">Pulse animation active</p>
              </div>
            </BaseTile>
          </PremiumLayout>
        </section>

        {/* Performance Features */}
        <section className="mb-16">
          <Card className="bg-bg-tile border-glass-border">
            <CardHeader>
              <CardTitle className="text-text-primary">Premium System Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-btc-primary">Glass Morphism</h4>
                  <p className="text-sm text-text-secondary">
                    Advanced backdrop blur effects with subtle transparency and glass-like appearance
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-btc-primary">BTC Orange Theme</h4>
                  <p className="text-sm text-text-secondary">
                    Professional Bitcoin orange color palette with semantic color mapping
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-btc-primary">Performance Optimized</h4>
                  <p className="text-sm text-text-secondary">
                    Hardware-accelerated animations with 60fps smooth transitions
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-btc-primary">Responsive Design</h4>
                  <p className="text-sm text-text-secondary">
                    Adaptive layouts that work perfectly across all device sizes
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-btc-primary">Type Safety</h4>
                  <p className="text-sm text-text-secondary">
                    Full TypeScript support with comprehensive prop validation
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-btc-primary">Accessibility</h4>
                  <p className="text-sm text-text-secondary">
                    WCAG compliant with keyboard navigation and screen reader support
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
};