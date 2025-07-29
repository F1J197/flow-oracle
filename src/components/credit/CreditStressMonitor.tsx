import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { EnhancedCreditData } from '@/types/data';
import { creditDataService } from '@/services/creditDataService';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const CreditStressMonitor = () => {
  const [creditData, setCreditData] = useState<EnhancedCreditData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await creditDataService.aggregateCreditData();
        setCreditData(data);
      } catch (error) {
        console.error('Failed to fetch credit data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading || !creditData) {
    return (
      <div className="glass-tile p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-glass-bg rounded w-1/3"></div>
          <div className="h-8 bg-glass-bg rounded w-1/2"></div>
          <div className="h-32 bg-glass-bg rounded"></div>
        </div>
      </div>
    );
  }

  const getStressColor = (level: EnhancedCreditData['stressLevel']) => {
    switch (level) {
      case 'MINIMAL': return 'text-btc-light';
      case 'MODERATE': return 'text-btc-glow';
      case 'ELEVATED': return 'text-btc-muted';
      case 'EXTREME': return 'text-btc-primary';
    }
  };

  const getRegimeIcon = (regime: EnhancedCreditData['regime']) => {
    switch (regime) {
      case 'QE_SUPPORTIVE': return <TrendingUp className="w-4 h-4 text-btc-light" />;
      case 'QT_STRESS': return <TrendingDown className="w-4 h-4 text-btc-primary" />;
      case 'CRISIS_MODE': return <AlertTriangle className="w-4 h-4 text-btc-primary" />;
      default: return <Activity className="w-4 h-4 text-btc-glow" />;
    }
  };

  return (
    <div className="glass-tile p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Credit Stress Monitor</h3>
        <div className="flex items-center gap-2">
          {getRegimeIcon(creditData.regime)}
          <span className="text-sm text-text-secondary">
            {creditData.regime.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm text-text-secondary">High Yield Spread</div>
          <div className="text-2xl font-bold text-text-data">
            {creditData.highYieldSpread.toFixed(0)}
            <span className="text-sm text-text-secondary ml-1">bps</span>
          </div>
          <div className={`text-sm ${creditData.spreadVelocity > 0 ? 'text-btc-primary' : 'text-btc-light'}`}>
            {creditData.spreadVelocity > 0 ? '+' : ''}{creditData.spreadVelocity.toFixed(1)}%
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-text-secondary">Stress Level</div>
          <div className={`text-xl font-semibold ${getStressColor(creditData.stressLevel)}`}>
            {creditData.stressLevel}
          </div>
          <div className="text-sm text-text-secondary">
            {(creditData.regimeConfidence * 100).toFixed(0)}% confidence
          </div>
        </div>
      </div>

      {/* Risk Gauges */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-secondary">Systemic Risk</span>
            <span className="text-text-data">{creditData.systemicRisk.toFixed(1)}%</span>
          </div>
          <Progress value={creditData.systemicRisk} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-secondary">Liquidity Score</span>
            <span className="text-text-data">{creditData.liquidityScore.toFixed(1)}</span>
          </div>
          <Progress value={creditData.liquidityScore} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-secondary">Contagion Risk</span>
            <span className="text-text-data">{creditData.contagionRisk.toFixed(1)}%</span>
          </div>
          <Progress value={creditData.contagionRisk} className="h-2" />
        </div>
      </div>

      {/* Alerts */}
      {creditData.stressLevel === 'EXTREME' && (
        <Alert className="border-btc-primary bg-btc-primary/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-btc-primary">
            EXTREME credit stress detected. Monitor for contagion effects.
          </AlertDescription>
        </Alert>
      )}

      {creditData.liquidityScore < 30 && (
        <Alert className="border-btc-glow bg-btc-glow/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-btc-glow">
            Low liquidity conditions may amplify volatility.
          </AlertDescription>
        </Alert>
      )}

      {/* Footer */}
      <div className="text-xs text-text-secondary flex justify-between">
        <span>Sources: {creditData.sourceCount}</span>
        <span>Updated: {creditData.lastUpdated.toLocaleTimeString()}</span>
      </div>
    </div>
  );
};