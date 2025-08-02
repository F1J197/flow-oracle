import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Activity, Clock } from 'lucide-react';

interface Alert {
  id: string;
  level: 'critical' | 'warning' | 'info';
  message: string;
  engine: string;
  timestamp: Date;
  acknowledged: boolean;
}

/**
 * Intelligence Alerts - Critical market intelligence notifications
 * Prominent display of actionable alerts
 */
export const IntelligenceAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Simulate real-time alerts
    const generateAlert = (): Alert => {
      const engines = ['Momentum', 'Volatility', 'Liquidity', 'Credit', 'Options'];
      const levels: Alert['level'][] = ['critical', 'warning', 'info'];
      const messages = [
        'Unusual options flow detected',
        'Volatility regime shift imminent',
        'Credit stress indicators elevated',
        'Momentum divergence in progress',
        'Liquidity conditions tightening'
      ];

      return {
        id: Math.random().toString(36).substring(7),
        level: levels[Math.floor(Math.random() * levels.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        engine: engines[Math.floor(Math.random() * engines.length)],
        timestamp: new Date(),
        acknowledged: false
      };
    };

    // Initial alerts
    setAlerts([
      generateAlert(),
      generateAlert(),
      generateAlert()
    ]);

    // Add new alert every 30 seconds
    const interval = setInterval(() => {
      setAlerts(prev => [generateAlert(), ...prev].slice(0, 5));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const getLevelColor = (level: Alert['level']) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'warning': return 'warning';
      case 'info': return 'accent';
      default: return 'secondary';
    }
  };

  const getLevelIcon = (level: Alert['level']) => {
    switch (level) {
      case 'critical': return AlertTriangle;
      case 'warning': return TrendingUp;
      case 'info': return Activity;
      default: return Clock;
    }
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <div className="space-y-3">
      {unacknowledgedAlerts.length === 0 ? (
        <div className="text-center py-4">
          <Activity className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">All alerts acknowledged</p>
        </div>
      ) : (
        unacknowledgedAlerts.map((alert) => {
          const LevelIcon = getLevelIcon(alert.level);
          const levelColor = getLevelColor(alert.level);
          
          return (
            <div
              key={alert.id}
              className={`p-3 border border-border bg-card cursor-pointer hover:bg-muted/50 transition-colors`}
              onClick={() => acknowledgeAlert(alert.id)}
            >
              <div className="flex items-start space-x-3">
                <LevelIcon className={`w-4 h-4 mt-0.5 text-${levelColor}`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs text-${levelColor} border-${levelColor}`}
                    >
                      {alert.level.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-foreground font-medium mb-1">
                    {alert.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {alert.engine} Engine
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Click to acknowledge
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};