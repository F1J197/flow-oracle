import { GlassTile } from "@/components/shared/GlassTile";
import { Badge } from "@/components/ui/badge";
import { DashboardTileData } from "@/types/engines";
import { memo } from "react";
import { TrendingUp, TrendingDown, Activity, DollarSign, Zap, BarChart3, AlertTriangle, Target } from "lucide-react";

interface EnhancedDashboardTileProps {
  data: DashboardTileData;
  size?: 'normal' | 'large' | 'xl';
  loading?: boolean;
  category?: 'momentum' | 'liquidity' | 'volatility' | 'sentiment' | 'macro' | 'onchain' | 'credit';
  updateFreq?: string;
  lastUpdate?: Date;
  confidence?: number;
  children?: React.ReactNode;
}

export const EnhancedDashboardTile = memo(({ 
  data, 
  size = 'normal', 
  loading = false,
  category,
  updateFreq,
  lastUpdate,
  confidence,
  children 
}: EnhancedDashboardTileProps) => {
  
  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case 'momentum': return <TrendingUp className="w-4 h-4" />;
      case 'liquidity': return <DollarSign className="w-4 h-4" />;
      case 'volatility': return <Activity className="w-4 h-4" />;
      case 'sentiment': return <Zap className="w-4 h-4" />;
      case 'macro': return <BarChart3 className="w-4 h-4" />;
      case 'onchain': return <Target className="w-4 h-4" />;
      case 'credit': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case 'momentum': return 'neon-teal';
      case 'liquidity': return 'neon-lime';
      case 'volatility': return 'neon-orange';
      case 'sentiment': return 'neon-fuchsia';
      case 'macro': return 'neon-gold';
      case 'onchain': return 'neon-teal';
      case 'credit': return 'neon-orange';
      default: return 'text-secondary';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'bullish': return 'neon-lime';
      case 'bearish': return 'neon-orange';
      case 'neutral': return 'text-secondary';
      default: return 'text-secondary';
    }
  };

  const getTrendIcon = () => {
    if (!data.trend) return null;
    
    switch (data.trend) {
      case 'up': return <TrendingUp className="w-3 h-3" />;
      case 'down': return <TrendingDown className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <GlassTile 
        title={data.title}
        size={size}
        status={data.status}
        className="animate-pulse"
      >
        <div className="space-y-3">
          <div className="h-8 bg-glass-bg rounded shimmer"></div>
          <div className="h-4 bg-glass-bg rounded w-2/3 shimmer"></div>
          <div className="h-4 bg-glass-bg rounded w-1/2 shimmer"></div>
        </div>
      </GlassTile>
    );
  }

  return (
    <GlassTile 
      title={data.title}
      size={size}
      status={data.status}
      className="hover:scale-[1.02] transition-transform cursor-pointer"
    >
      <div className="space-y-3">
        {/* Primary Value and Change */}
        <div className="flex items-center justify-between">
          <div className={`text-2xl font-bold text-${data.color ? `neon-${data.color}` : 'text-data'} transition-all duration-300`}>
            {data.primaryMetric}
          </div>
          {data.trend && (
            <div className={`flex items-center space-x-1 text-${getStatusColor(data.trend === 'up' ? 'bullish' : data.trend === 'down' ? 'bearish' : 'neutral')}`}>
              {getTrendIcon()}
              <span className="text-xs font-medium">
                {data.secondaryMetric || '—'}
              </span>
            </div>
          )}
        </div>

        {/* Category and Status Row */}
        {(category || data.status !== 'normal') && (
          <div className="flex items-center justify-between">
            {category && (
              <div className={`flex items-center space-x-1 text-${getCategoryColor(category)}`}>
                {getCategoryIcon(category)}
                <span className="text-xs font-medium uppercase tracking-wider">
                  {category}
                </span>
              </div>
            )}
            {data.status !== 'normal' && (
              <Badge 
                variant="outline" 
                className={`text-xs border-${data.status === 'critical' ? 'neon-fuchsia' : 'neon-gold'} text-${data.status === 'critical' ? 'neon-fuchsia' : 'neon-gold'}`}
              >
                {data.status.toUpperCase()}
              </Badge>
            )}
          </div>
        )}

        {/* Action Text */}
        {data.actionText && (
          <p className="text-sm text-text-primary font-mono transition-opacity duration-300">
            {data.actionText}
          </p>
        )}

        {/* Update Information */}
        {(updateFreq || lastUpdate || confidence !== undefined) && (
          <div className="text-xs text-text-muted space-y-1 pt-2 border-t border-glass-border">
            {updateFreq && (
              <div className="flex justify-between">
                <span>Update Freq:</span>
                <span className="text-text-secondary">{updateFreq}</span>
              </div>
            )}
            {lastUpdate && (
              <div className="flex justify-between">
                <span>Last Update:</span>
                <span className="text-text-secondary">{lastUpdate.toLocaleTimeString()}</span>
              </div>
            )}
            {confidence !== undefined && (
              <div className="flex justify-between">
                <span>Confidence:</span>
                <span className={`${confidence > 0.8 ? 'text-neon-lime' : confidence > 0.6 ? 'text-neon-gold' : 'text-neon-orange'}`}>
                  {(confidence * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        )}

        {children}
      </div>
    </GlassTile>
  );
});

EnhancedDashboardTile.displayName = 'EnhancedDashboardTile';