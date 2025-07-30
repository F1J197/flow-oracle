import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlobalPlumbingTileProps {
  efficiency: number;
  systemicRisk: 'low' | 'moderate' | 'high' | 'critical';
  trend: 'up' | 'down' | 'neutral';
  loading?: boolean;
  className?: string;
}

export const GlobalPlumbingTile: React.FC<GlobalPlumbingTileProps> = ({
  efficiency,
  systemicRisk,
  trend,
  loading = false,
  className
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-neon-lime" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-neon-orange" />;
      default: return <Minus className="w-4 h-4 text-text-muted" />;
    }
  };

  const getRiskColor = () => {
    switch (systemicRisk) {
      case 'critical': return 'text-neon-orange';
      case 'high': return 'text-neon-gold';
      case 'moderate': return 'text-neon-teal';
      default: return 'text-neon-lime';
    }
  };

  const getStatusIndicator = () => {
    if (systemicRisk === 'critical') return '🔴';
    if (systemicRisk === 'high') return '🟡';
    if (systemicRisk === 'moderate') return '🔵';
    return '🟢';
  };

  if (loading) {
    return (
      <Card className={cn(
        "glass-tile terminal-container p-6",
        "border-glass-border bg-bg-tile backdrop-blur-md",
        className
      )}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono text-text-secondary uppercase tracking-wider">
              Global Financial Plumbing
            </h3>
            <div className="w-2 h-2 bg-text-muted rounded-full animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-glass-bg rounded animate-pulse" />
            <div className="h-4 bg-glass-bg rounded animate-pulse w-3/4" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "glass-tile terminal-container p-6 transition-all duration-300",
      "border-glass-border bg-bg-tile backdrop-blur-md",
      "hover:shadow-lg hover:border-white/20 hover:-translate-y-1",
      systemicRisk === 'critical' && "border-neon-orange/50 shadow-neon-orange/20",
      className
    )}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono text-text-secondary uppercase tracking-wider">
            Global Financial Plumbing
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs">{getStatusIndicator()}</span>
            <div className="w-2 h-2 bg-neon-lime rounded-full animate-pulse" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-mono font-bold text-text-data">
                {efficiency.toFixed(1)}%
              </div>
              <div className="text-xs text-text-secondary font-mono">
                PLUMBING EFFICIENCY
              </div>
            </div>
            {getTrendIcon()}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary font-mono">
              Systemic Risk:
            </div>
            <div className={cn("text-sm font-mono font-bold uppercase", getRiskColor())}>
              {systemicRisk}
            </div>
          </div>

          {/* Risk Level Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-text-muted font-mono">
              <span>Risk Level</span>
              <span>{systemicRisk.toUpperCase()}</span>
            </div>
            <div className="h-1 bg-glass-bg rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-500",
                  systemicRisk === 'critical' && "bg-neon-orange",
                  systemicRisk === 'high' && "bg-neon-gold", 
                  systemicRisk === 'moderate' && "bg-neon-teal",
                  systemicRisk === 'low' && "bg-neon-lime"
                )}
                style={{ 
                  width: `${systemicRisk === 'critical' ? 100 : 
                            systemicRisk === 'high' ? 75 : 
                            systemicRisk === 'moderate' ? 50 : 25}%` 
                }}
              />
            </div>
          </div>

          {/* Insight Text */}
          <div className="pt-2 border-t border-glass-border">
            <p className="text-xs text-text-secondary font-mono leading-relaxed">
              {systemicRisk === 'critical' ? 
                "Critical stress in global dollar funding markets" :
               systemicRisk === 'high' ?
                "Elevated stress in cross-currency funding" :
               systemicRisk === 'moderate' ?
                "Moderate tensions in global plumbing" :
                "Healthy global financial infrastructure"
              }
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};