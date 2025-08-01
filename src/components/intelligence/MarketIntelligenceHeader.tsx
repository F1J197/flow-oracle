import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Droplets,
  Shield,
  Target
} from 'lucide-react';
import { MarketIntelligenceSnapshot } from '@/types/intelligence';

interface MarketIntelligenceHeaderProps {
  snapshot: MarketIntelligenceSnapshot;
}

export const MarketIntelligenceHeader: React.FC<MarketIntelligenceHeaderProps> = ({
  snapshot
}) => {
  const getRiskLevelColor = () => {
    switch (snapshot.riskLevel) {
      case 'extreme': return 'hsl(var(--destructive))';
      case 'high': return 'hsl(var(--orange))';
      case 'medium': return 'hsl(var(--gold))';
      case 'low': return 'hsl(var(--teal))';
      default: return 'hsl(var(--muted))';
    }
  };

  const getLiquidityColor = () => {
    switch (snapshot.liquidityConditions) {
      case 'abundant': return 'hsl(var(--teal))';
      case 'adequate': return 'hsl(var(--lime))';
      case 'tightening': return 'hsl(var(--gold))';
      case 'stressed': return 'hsl(var(--orange))';
      default: return 'hsl(var(--muted))';
    }
  };

  const getRiskIcon = () => {
    switch (snapshot.riskLevel) {
      case 'extreme': 
      case 'high': 
        return <AlertTriangle className="h-5 w-5" />;
      case 'medium': 
        return <Activity className="h-5 w-5" />;
      case 'low': 
        return <Shield className="h-5 w-5" />;
      default: 
        return <Activity className="h-5 w-5" />;
    }
  };

  const getLiquidityIcon = () => {
    switch (snapshot.liquidityConditions) {
      case 'abundant':
      case 'adequate':
        return <Droplets className="h-5 w-5" />;
      case 'tightening':
        return <TrendingDown className="h-5 w-5" />;
      case 'stressed':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Droplets className="h-5 w-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Global Theme Banner */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold font-mono text-primary">
                {snapshot.globalTheme}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {snapshot.dominantNarrative}
              </p>
            </div>
            
            {/* Risk & Liquidity Status */}
            <div className="flex justify-center gap-8">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: getRiskLevelColor() + '20' }}
                >
                  <div style={{ color: getRiskLevelColor() }}>
                    {getRiskIcon()}
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-sm text-muted-foreground">Risk Level</div>
                  <div 
                    className="font-semibold capitalize"
                    style={{ color: getRiskLevelColor() }}
                  >
                    {snapshot.riskLevel}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: getLiquidityColor() + '20' }}
                >
                  <div style={{ color: getLiquidityColor() }}>
                    {getLiquidityIcon()}
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-sm text-muted-foreground">Liquidity</div>
                  <div 
                    className="font-semibold capitalize"
                    style={{ color: getLiquidityColor() }}
                  >
                    {snapshot.liquidityConditions}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Regime Status */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
                Current Regime
              </h3>
              <div className="space-y-1">
                <div className="text-lg font-bold">{snapshot.regimeStatus.current}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-medium">{snapshot.regimeStatus.confidence.toFixed(0)}%</span>
                </div>
                <Progress 
                  value={snapshot.regimeStatus.confidence} 
                  className="h-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
                Next Likely
              </h3>
              <div className="space-y-1">
                <div className="text-lg font-bold">{snapshot.regimeStatus.nextLikely}</div>
                <div className="text-xs text-muted-foreground">
                  Expected timeframe: {snapshot.regimeStatus.timeframe}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
                Critical Alerts
              </h3>
              <div className="space-y-1">
                {snapshot.criticalAlerts.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No critical alerts</div>
                ) : (
                  <div className="space-y-1">
                    {snapshot.criticalAlerts.slice(0, 2).map((alert, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Target className="h-3 w-3 text-orange mt-1 flex-shrink-0" />
                        <div className="text-xs">
                          <div className="font-medium">{alert.description}</div>
                          <div className="text-muted-foreground">{alert.timeframe}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Insights */}
      {snapshot.topInsights.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
              Key Market Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {snapshot.topInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-2 p-3 rounded-lg bg-primary-900/20 border border-primary-800/30"
                >
                  <div className="w-2 h-2 rounded-full bg-teal mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{insight}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};