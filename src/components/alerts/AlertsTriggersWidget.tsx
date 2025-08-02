import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Bell, Zap, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Alert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  source: string;
  acknowledged: boolean;
}

interface Trigger {
  id: string;
  name: string;
  condition: string;
  currentValue: number;
  threshold: number;
  status: 'active' | 'triggered' | 'paused';
  lastTriggered?: Date;
}

export const AlertsTriggersWidget: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [activeTab, setActiveTab] = useState<'alerts' | 'triggers'>('alerts');

  useEffect(() => {
    loadAlertsAndTriggers();
    const interval = setInterval(loadAlertsAndTriggers, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAlertsAndTriggers = () => {
    // Sample alerts data
    const sampleAlerts: Alert[] = [
      {
        id: 'alert-1',
        level: 'warning',
        title: 'Credit Stress Elevated',
        message: 'HY OAS spreads widened to 310bps, approaching caution threshold',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        source: 'Credit Stress Engine',
        acknowledged: false
      },
      {
        id: 'alert-2',
        level: 'info',
        title: 'Liquidity Flow Positive',
        message: 'Net liquidity increased by $2.1B, supporting risk asset positioning',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        source: 'Net Liquidity Engine',
        acknowledged: false
      },
      {
        id: 'alert-3',
        level: 'critical',
        title: 'Dealer Leverage Alert',
        message: 'Primary dealer leverage ratio exceeded 95th percentile',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        source: 'Dealer Leverage Engine',
        acknowledged: true
      }
    ];

    // Sample triggers data
    const sampleTriggers: Trigger[] = [
      {
        id: 'trigger-1',
        name: 'VIX Spike Alert',
        condition: 'VIX > 25',
        currentValue: 18.1,
        threshold: 25,
        status: 'active'
      },
      {
        id: 'trigger-2',
        name: 'BTC Support Break',
        condition: 'BTC < $60,000',
        currentValue: 67332,
        threshold: 60000,
        status: 'active'
      },
      {
        id: 'trigger-3',
        name: 'Credit Stress Warning',
        condition: 'HY OAS > 400bps',
        currentValue: 310,
        threshold: 400,
        status: 'triggered',
        lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'trigger-4',
        name: 'CLIS Threshold',
        condition: 'CLIS < 3',
        currentValue: 6.8,
        threshold: 3,
        status: 'active'
      }
    ];

    setAlerts(sampleAlerts);
    setTriggers(sampleTriggers);
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Bell className="w-4 h-4 text-accent" />;
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical': return 'border-destructive bg-destructive/5';
      case 'warning': return 'border-yellow-500 bg-yellow-500/5';
      default: return 'border-accent bg-accent/5';
    }
  };

  const getTriggerStatusIcon = (status: string) => {
    switch (status) {
      case 'triggered': return <Zap className="w-4 h-4 text-destructive" />;
      case 'paused': return <Activity className="w-4 h-4 text-muted-foreground" />;
      default: return <TrendingUp className="w-4 h-4 text-accent" />;
    }
  };

  const getTriggerStatusColor = (status: string) => {
    switch (status) {
      case 'triggered': return 'text-destructive border-destructive';
      case 'paused': return 'text-muted-foreground border-muted-foreground';
      default: return 'text-accent border-accent';
    }
  };

  return (
    <Card className="terminal-panel h-full">
      <CardHeader>
        <CardTitle className="terminal-header flex items-center gap-3">
          <AlertTriangle className="w-6 h-6" />
          ALERTS & TRIGGERS
        </CardTitle>
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeTab === 'alerts' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('alerts')}
            className="text-xs"
          >
            Alerts ({alerts.filter(a => !a.acknowledged).length})
          </Button>
          <Button
            variant={activeTab === 'triggers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('triggers')}
            className="text-xs"
          >
            Triggers ({triggers.filter(t => t.status === 'active').length})
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {activeTab === 'alerts' ? (
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No active alerts
              </div>
            ) : (
              alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 border-l-4 rounded-r ${getAlertColor(alert.level)} ${
                    alert.acknowledged ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getAlertIcon(alert.level)}
                        <span className="font-medium text-sm">{alert.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {alert.level}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{alert.source}</span>
                        <span>{alert.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-xs ml-2"
                      >
                        Ack
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {triggers.map((trigger, index) => (
              <motion.div
                key={trigger.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 border border-border rounded hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getTriggerStatusIcon(trigger.status)}
                      <span className="font-medium text-sm">{trigger.name}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getTriggerStatusColor(trigger.status)}`}
                      >
                        {trigger.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {trigger.condition}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span>
                        Current: <span className="font-mono">{trigger.currentValue.toLocaleString()}</span>
                      </span>
                      <span>
                        Threshold: <span className="font-mono">{trigger.threshold.toLocaleString()}</span>
                      </span>
                    </div>
                    {trigger.lastTriggered && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Last triggered: {trigger.lastTriggered.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};