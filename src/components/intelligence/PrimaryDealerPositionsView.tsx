import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useDealerPositions } from "@/hooks/useDealerPositions";
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrimaryDealerPositionsViewProps {
  engine?: {
    getDashboardData: () => any;
    getDetailedView: () => any;
  };
  loading?: boolean;
}

export const PrimaryDealerPositionsView = ({ engine, loading: engineLoading }: PrimaryDealerPositionsViewProps = {}) => {
  const { data, alerts, insights, loading: hookLoading, error, healthStatus } = useDealerPositions();
  const loading = engineLoading || hookLoading;

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-neon-teal">Primary Dealer Positions V6</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-glass-bg rounded w-3/4"></div>
            <div className="h-4 bg-glass-bg rounded w-1/2"></div>
            <div className="h-4 bg-glass-bg rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="glass-card border-neon-orange">
        <CardHeader>
          <CardTitle className="text-neon-orange flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Primary Dealer Positions V6 - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              {error || 'Unable to load dealer positions data'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const totalPositions = data.treasuryPositions.total + data.agencyPositions.total + 
                        data.corporatePositions.total + data.internationalPositions.total;

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'EXPANSION': return 'text-neon-teal border-neon-teal';
      case 'CONTRACTION': return 'text-neon-orange border-neon-orange';
      case 'CRISIS': return 'text-neon-fuchsia border-neon-fuchsia';
      case 'TRANSITION': return 'text-neon-lime border-neon-lime';
      default: return 'text-neon-gold border-neon-gold';
    }
  };

  const getFlowIcon = (direction: string) => {
    switch (direction) {
      case 'ACCUMULATING': return <TrendingUp className="w-4 h-4 text-neon-teal" />;
      case 'DISTRIBUTING': return <TrendingDown className="w-4 h-4 text-neon-orange" />;
      default: return <Activity className="w-4 h-4 text-neon-gold" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-neon-teal">Primary Dealer Positions V6</CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={getRegimeColor(data.analytics.regime)}>
                {data.analytics.regime}
              </Badge>
              <div className="flex items-center gap-1">
                {getFlowIcon(data.analytics.flowDirection)}
                <span className="text-sm text-text-secondary">{data.analytics.flowDirection}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-teal">
                ${(totalPositions / 1000000).toFixed(3)}T
              </div>
              <div className="text-sm text-text-secondary">Total Positions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-lime">
                {data.riskMetrics.riskCapacity.toFixed(1)}%
              </div>
              <div className="text-sm text-text-secondary">Risk Capacity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-gold">
                {data.riskMetrics.leverageRatio.toFixed(2)}x
              </div>
              <div className="text-sm text-text-secondary">Leverage Ratio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-fuchsia">
                {(data.analytics.systemicRisk * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-text-secondary">Systemic Risk</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card className="glass-card border-neon-orange">
          <CardHeader>
            <CardTitle className="text-neon-orange flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} className={cn(
                  "border",
                  alert.severity === 'CRITICAL' && "border-neon-fuchsia bg-neon-fuchsia/5",
                  alert.severity === 'WARNING' && "border-neon-orange bg-neon-orange/5",
                  alert.severity === 'INFO' && "border-neon-teal bg-neon-teal/5"
                )}>
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>{alert.message}</span>
                      <Badge variant="outline" className={cn(
                        alert.severity === 'CRITICAL' && "border-neon-fuchsia text-neon-fuchsia",
                        alert.severity === 'WARNING' && "border-neon-orange text-neon-orange",
                        alert.severity === 'INFO' && "border-neon-teal text-neon-teal"
                      )}>
                        {alert.currentValue.toFixed(2)} / {alert.threshold}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Position Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-text-primary">Position Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Treasury Securities</span>
                <span className="text-neon-teal">${(data.treasuryPositions.total / 1000000).toFixed(3)}T</span>
              </div>
              <Progress 
                value={(data.treasuryPositions.total / totalPositions) * 100} 
                className="h-2" 
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>Bills: ${(data.treasuryPositions.bills / 1000000).toFixed(2)}T</span>
                <span>Notes: ${(data.treasuryPositions.notes / 1000000).toFixed(2)}T</span>
                <span>Bonds: ${(data.treasuryPositions.bonds / 1000000).toFixed(2)}T</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Agency Securities</span>
                <span className="text-neon-lime">${(data.agencyPositions.total / 1000000).toFixed(3)}T</span>
              </div>
              <Progress 
                value={(data.agencyPositions.total / totalPositions) * 100} 
                className="h-2" 
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Corporate Bonds</span>
                <span className="text-neon-gold">${(data.corporatePositions.total / 1000000).toFixed(3)}T</span>
              </div>
              <Progress 
                value={(data.corporatePositions.total / totalPositions) * 100} 
                className="h-2" 
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>International</span>
                <span className="text-neon-fuchsia">${(data.internationalPositions.total / 1000000).toFixed(3)}T</span>
              </div>
              <Progress 
                value={(data.internationalPositions.total / totalPositions) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-text-primary">Risk Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-text-secondary">Liquidity Stress</div>
                <div className="text-xl font-bold text-neon-orange">
                  {data.riskMetrics.liquidityStress.toFixed(1)}%
                </div>
                <Progress 
                  value={data.riskMetrics.liquidityStress} 
                  className="h-2 mt-1" 
                />
              </div>
              
              <div>
                <div className="text-sm text-text-secondary">Position Velocity</div>
                <div className="text-xl font-bold text-neon-lime">
                  {data.riskMetrics.positionVelocity.toFixed(1)}%
                </div>
              </div>
              
              <div>
                <div className="text-sm text-text-secondary">Concentration Risk</div>
                <div className="text-xl font-bold text-neon-gold">
                  {data.riskMetrics.concentrationRisk.toFixed(1)}%
                </div>
              </div>
              
              <div>
                <div className="text-sm text-text-secondary">Duration Risk</div>
                <div className="text-xl font-bold text-neon-fuchsia">
                  {data.riskMetrics.durationRisk.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Intelligence */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-text-primary flex items-center gap-2">
            <Target className="w-5 h-5" />
            Market Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-neon-teal font-semibold mb-3">Historical Context</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Z-Score:</span>
                  <span className={cn(
                    "font-mono",
                    Math.abs(data.context.zScore) > 2 ? "text-neon-fuchsia" : "text-text-primary"
                  )}>
                    {data.context.zScore.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Percentile Rank:</span>
                  <span className="font-mono text-neon-teal">{data.context.percentileRank.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>SPX Correlation:</span>
                  <span className="font-mono text-neon-lime">{(data.context.correlationToSPX * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-neon-gold font-semibold mb-3">Regime Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span className="font-mono text-neon-gold">{(data.analytics.regimeConfidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Market Impact:</span>
                  <span className={cn(
                    "font-mono",
                    data.analytics.marketImpact === 'HIGH' ? "text-neon-fuchsia" :
                    data.analytics.marketImpact === 'MODERATE' ? "text-neon-orange" : "text-neon-lime"
                  )}>
                    {data.analytics.marketImpact}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-neon-fuchsia font-semibold mb-3">Data Quality</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Data Quality:</span>
                  <span className="font-mono text-neon-lime">{(data.metadata.dataQuality * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Source Reliability:</span>
                  <span className="font-mono text-neon-teal">{(data.metadata.sourceReliability * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="font-mono text-text-secondary">{data.metadata.lastUpdated.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Section */}
      {insights.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-neon-lime">Market Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className="border border-glass-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-neon-lime border-neon-lime">
                      {insight.type.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-semibold",
                        insight.impact === 'BULLISH' ? "text-neon-teal" :
                        insight.impact === 'BEARISH' ? "text-neon-orange" : "text-neon-gold"
                      )}>
                        {insight.impact}
                      </span>
                      <span className="text-sm text-text-secondary">
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-text-primary">{insight.description}</p>
                  <p className="text-xs text-text-secondary mt-1">Timeframe: {insight.timeframe}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};