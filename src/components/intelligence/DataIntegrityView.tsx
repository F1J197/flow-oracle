import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertTriangle, CheckCircle, Shield, Activity, Zap, Database } from 'lucide-react';
import { IntelligenceViewData } from '../../types/engines';

interface DataIntegrityViewProps {
  data: IntelligenceViewData;
}

export const DataIntegrityView: React.FC<DataIntegrityViewProps> = ({ data }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-neon-teal" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-neon-gold" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-neon-orange" />;
      default:
        return <Activity className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'normal':
        return 'text-neon-teal';
      case 'warning':
        return 'text-neon-gold';
      case 'critical':
        return 'text-neon-orange';
      default:
        return 'text-text-primary';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return '▲';
      case 'down':
        return '▼';
      default:
        return '━';
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up':
        return 'text-neon-teal';
      case 'down':
        return 'text-neon-orange';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-neon-teal" />
          <div>
            <h2 className="text-xl font-bold text-text-primary">{data.title}</h2>
            <p className="text-sm text-text-secondary">Real-time data integrity monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(data.status)}
          <Badge variant={data.status === 'critical' ? 'destructive' : data.status === 'warning' ? 'secondary' : 'default'}>
            {data.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(data.primaryMetrics).map(([key, metric]) => (
          <Card key={key} className="glass-tile p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">{metric.label}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value}
                  </span>
                  {metric.trend && (
                    <span className={`text-sm ${getTrendColor(metric.trend)}`}>
                      {getTrendIcon(metric.trend)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {getStatusIcon(metric.status || 'normal')}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <Card className="glass-tile p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-neon-orange" />
            <h3 className="text-lg font-semibold text-text-primary">Active Alerts</h3>
          </div>
          <div className="space-y-2">
            {data.alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded border-l-4 ${
                  alert.severity === 'critical'
                    ? 'border-neon-orange bg-neon-orange/10'
                    : alert.severity === 'warning'
                    ? 'border-neon-gold bg-neon-gold/10'
                    : 'border-neon-teal bg-neon-teal/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">{alert.message}</span>
                  <Badge
                    variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
                {alert.timestamp && (
                  <p className="text-xs text-text-secondary mt-1">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.sections.map((section, index) => (
          <Card key={index} className="glass-tile p-4">
            <div className="flex items-center gap-2 mb-4">
              {index === 0 && <Database className="w-5 h-5 text-neon-teal" />}
              {index === 1 && <Activity className="w-5 h-5 text-neon-lime" />}
              {index === 2 && <Zap className="w-5 h-5 text-neon-fuchsia" />}
              <h3 className="text-lg font-semibold text-text-primary">{section.title}</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(section.data).map(([key, item]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                      {item.value}
                    </span>
                    {item.unit && (
                      <span className="text-xs text-text-secondary">{item.unit}</span>
                    )}
                    {item.status && getStatusIcon(item.status)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Confidence and Last Update */}
      <div className="flex items-center justify-between text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          <span>Confidence:</span>
          <span className={`font-medium ${
            data.confidence >= 80 ? 'text-neon-teal' : 
            data.confidence >= 60 ? 'text-neon-gold' : 'text-neon-orange'
          }`}>
            {Math.round(data.confidence)}%
          </span>
        </div>
        <div>
          Last updated: {data.lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};