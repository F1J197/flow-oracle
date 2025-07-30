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
        return <CheckCircle className="w-4 h-4 text-btc-success" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-btc-warning" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-btc-error" />;
      default:
        return <Shield className="w-4 h-4 text-text-muted" />;
    }
  };

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-btc-success" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-btc-error" />;
      case 'neutral':
      default:
        return <Minus className="w-3 h-3 text-text-muted" />;
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
        return 'text-btc-success';
      case 'warning':
        return 'text-btc-warning';
      case 'critical':
        return 'text-btc-error';
      case 'info':
        return 'text-btc-accent';
      default:
        return 'text-text-primary';
    }
  };

  const getBorderColor = () => {
    switch (data.status) {
      case 'critical':
        return 'border-btc-error/20 hover:border-btc-error/40';
      case 'warning':
        return 'border-btc-warning/20 hover:border-btc-warning/40';
      default:
        return 'border-border-subtle hover:border-btc-primary/40';
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
          <Shield className="w-5 h-5 text-btc-primary" />
          <h3 className="text-sm font-medium text-text-muted">{data.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div className="w-2 h-2 bg-btc-success animate-pulse terminal-panel" />
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
            <span className="text-xs text-text-muted">{getTrendText()}</span>
          </div>
        </div>
        {data.secondaryMetric && (
          <p className="text-sm text-text-muted mt-1">
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
        <div className="h-2 bg-surface-accent overflow-hidden terminal-panel">
          <div 
            className={`h-full transition-all duration-1000 ${
              data.status === 'critical' ? 'bg-btc-error' :
              data.status === 'warning' ? 'bg-btc-warning' : 'bg-btc-success'
            }`}
            style={{ 
              width: `${typeof data.primaryMetric === 'string' ? 
                parseInt(data.primaryMetric.replace('%', '')) : 
                data.primaryMetric}%` 
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Action Text */}
      {data.actionText && (
        <div className="mt-4 p-3 bg-surface-accent/50 border border-border-subtle terminal-panel">
          <p className="text-xs text-text-primary leading-relaxed">
            {data.actionText}
          </p>
        </div>
      )}

      {/* Bottom Status Indicators */}
      <div className="mt-4 flex justify-between items-center text-xs">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 terminal-panel ${
            data.status === 'normal' ? 'bg-btc-success' :
            data.status === 'warning' ? 'bg-btc-warning' : 'bg-btc-error'
          }`} />
          <span className="text-text-muted">
            {data.status === 'normal' ? 'OPTIMAL' : 
             data.status === 'warning' ? 'DEGRADED' : 'CRITICAL'}
          </span>
        </div>
        <span className="text-text-muted">
          LIVE
        </span>
      </div>
    </Card>
  );
};