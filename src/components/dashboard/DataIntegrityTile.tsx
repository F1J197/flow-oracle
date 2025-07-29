import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Shield, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DashboardTileData } from '../../types/engines';

interface DataIntegrityTileProps {
  data: DashboardTileData;
  onClick?: () => void;
}

export const DataIntegrityTile: React.FC<DataIntegrityTileProps> = ({ data, onClick }) => {
  const getStatusIcon = () => {
    switch (data.status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-neon-teal" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-neon-gold" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-neon-orange" />;
      default:
        return <Shield className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-neon-teal" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-neon-orange" />;
      default:
        return <Minus className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getTrendText = () => {
    switch (data.trend) {
      case 'up':
        return 'IMPROVING';
      case 'down':
        return 'DEGRADING';
      default:
        return 'STABLE';
    }
  };

  const getMetricColor = () => {
    switch (data.color) {
      case 'success':
        return 'text-neon-teal';
      case 'warning':
        return 'text-neon-gold';
      case 'critical':
        return 'text-neon-orange';
      case 'info':
        return 'text-neon-lime';
      default:
        return 'text-text-primary';
    }
  };

  const getBorderColor = () => {
    switch (data.status) {
      case 'critical':
        return 'border-neon-orange/50 hover:border-neon-orange';
      case 'warning':
        return 'border-neon-gold/50 hover:border-neon-gold';
      default:
        return 'border-glass-border hover:border-neon-teal/50';
    }
  };

  const getPulseAnimation = () => {
    return data.status === 'critical' ? 'animate-pulse' : '';
  };

  return (
    <Card 
      className={`glass-tile p-6 cursor-pointer transition-all duration-300 ${getBorderColor()} ${getPulseAnimation()}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-neon-teal" />
          <h3 className="text-sm font-medium text-text-secondary">{data.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div className="w-2 h-2 rounded-full bg-neon-teal animate-pulse" />
        </div>
      </div>

      {/* Primary Metric */}
      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${getMetricColor()}`}>
            {data.primaryMetric}
          </span>
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className="text-xs text-text-secondary">{getTrendText()}</span>
          </div>
        </div>
        {data.secondaryMetric && (
          <p className="text-sm text-text-secondary mt-1">
            {data.secondaryMetric}
          </p>
        )}
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <Badge 
          variant={data.status === 'critical' ? 'destructive' : data.status === 'warning' ? 'secondary' : 'default'}
          className="text-xs"
        >
          DATA INTEGRITY
        </Badge>
      </div>

      {/* Mini Chart/Visual (Integrity Score Bar) */}
      <div className="mb-4">
        <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${
              data.status === 'critical' ? 'bg-neon-orange' :
              data.status === 'warning' ? 'bg-neon-gold' : 'bg-neon-teal'
            }`}
            style={{ 
              width: `${typeof data.primaryMetric === 'string' ? 
                parseInt(data.primaryMetric.replace('%', '')) : 
                data.primaryMetric}%` 
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-secondary mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Action Text */}
      {data.actionText && (
        <div className="mt-4 p-3 rounded bg-glass-bg border border-glass-border">
          <p className="text-xs text-text-primary leading-relaxed">
            {data.actionText}
          </p>
        </div>
      )}

      {/* Bottom Status Indicators */}
      <div className="mt-4 flex justify-between items-center text-xs">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${
            data.status === 'normal' ? 'bg-neon-teal' :
            data.status === 'warning' ? 'bg-neon-gold' : 'bg-neon-orange'
          }`} />
          <span className="text-text-secondary">
            {data.status === 'normal' ? 'OPTIMAL' : 
             data.status === 'warning' ? 'DEGRADED' : 'CRITICAL'}
          </span>
        </div>
        <span className="text-text-secondary">
          LIVE
        </span>
      </div>
    </Card>
  );
};