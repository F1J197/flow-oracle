import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface LiquidityGaugeProps {
  value: number; // 0-100 scale
  trend: 'up' | 'down' | 'neutral';
  status: 'expanding' | 'contracting' | 'neutral';
}

export const LiquidityGauge: React.FC<LiquidityGaugeProps> = ({ 
  value, 
  trend, 
  status 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'expanding': return 'text-green-400';
      case 'contracting': return 'text-red-400';
      case 'neutral': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'neutral': return <Activity className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getProgressColor = () => {
    if (value > 70) return 'bg-green-400';
    if (value > 30) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <Card className="bg-gray-900/50 border-orange-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-orange-500 font-mono flex items-center justify-between">
          NET LIQUIDITY
          {getTrendIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              {value.toFixed(1)}%
            </div>
            <div className={`text-sm font-mono ${getStatusColor()}`}>
              {status.toUpperCase()}
            </div>
          </div>
          
          <div className="relative">
            <Progress 
              value={value} 
              className="h-3 bg-gray-700"
            />
            <div 
              className={`absolute top-0 left-0 h-3 rounded transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${value}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-400 font-mono">
            <span>CONTRACTING</span>
            <span>NEUTRAL</span>
            <span>EXPANDING</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};