/**
 * LIQUIDITY² Real-time Indicator Panel
 * Displays live market data with connection status
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRealtimeData, useRealtimeIndicators } from '@/hooks/useRealtimeData';
import { formatNumber, formatPercentage } from '@/utils/formatting';
import { Activity, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface RealtimeIndicatorPanelProps {
  className?: string;
}

export function RealtimeIndicatorPanel({ className }: RealtimeIndicatorPanelProps) {
  const { 
    data: btcData, 
    isConnected: btcConnected, 
    connectionStatus, 
    error,
    reconnect 
  } = useRealtimeData('BTC_PRICE', { source: 'coinbase' });

  const {
    data: indicators,
    subscribedIndicators,
    subscribe: subscribeToIndicator,
    connectionStatus: multiConnectionStatus
  } = useRealtimeIndicators();

  const handleReconnect = async () => {
    await reconnect();
  };

  const getConnectionIcon = (isConnected: boolean) => {
    return isConnected ? (
      <Wifi className="h-4 w-4 text-terminal-success" />
    ) : (
      <WifiOff className="h-4 w-4 text-terminal-danger" />
    );
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      connected: 'bg-terminal-success/20 text-terminal-success border-terminal-success/30',
      connecting: 'bg-terminal-warning/20 text-terminal-warning border-terminal-warning/30',
      disconnected: 'bg-terminal-danger/20 text-terminal-danger border-terminal-danger/30',
      error: 'bg-terminal-danger/20 text-terminal-danger border-terminal-danger/30',
      reconnecting: 'bg-terminal-warning/20 text-terminal-warning border-terminal-warning/30'
    };

    return (
      <Badge 
        variant="outline" 
        className={`${statusColors[status as keyof typeof statusColors] || statusColors.disconnected} font-mono text-xs`}
      >
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className={`terminal-card ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-terminal-primary font-mono text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-terminal-accent" />
          REAL-TIME DATA FEEDS
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleReconnect}
          className="font-mono"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          RECONNECT
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Connection Status Overview */}
        <div className="space-y-2">
          <h3 className="text-terminal-secondary font-mono text-sm font-medium">
            CONNECTION STATUS
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(connectionStatus).map(([source, status]) => (
              <div 
                key={source}
                className="flex items-center justify-between p-3 bg-terminal-surface/30 border border-terminal-border/20 rounded"
              >
                <div className="flex items-center gap-2">
                  {getConnectionIcon(status === 'connected')}
                  <span className="font-mono text-xs text-terminal-secondary uppercase">
                    {source}
                  </span>
                </div>
                {getStatusBadge(status)}
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-terminal-border/20" />

        {/* Live Bitcoin Price */}
        {btcData && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-terminal-secondary font-mono text-sm font-medium">
                BTC/USD LIVE
              </h3>
              <div className="flex items-center gap-1">
                {getConnectionIcon(btcConnected)}
                <span className="font-mono text-xs text-terminal-muted">
                  {btcData.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-terminal-surface/20 border border-terminal-border/20 rounded">
              <div className="flex items-baseline gap-4">
                <span className="text-2xl font-mono font-bold text-terminal-primary">
                  ${formatNumber(btcData.current, { decimals: 0 })}
                </span>
                {btcData.changePercent && (
                  <span className={`text-sm font-mono ${
                    btcData.changePercent >= 0 
                      ? 'text-terminal-success' 
                      : 'text-terminal-danger'
                  }`}>
                    {btcData.changePercent >= 0 ? '+' : ''}{formatPercentage(btcData.changePercent)}
                  </span>
                )}
              </div>
              {btcData.volume && (
                <div className="text-xs font-mono text-terminal-muted mt-2">
                  Volume: {formatNumber(btcData.volume, { decimals: 0, compact: true })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Multiple Indicators */}
        {Object.keys(indicators).length > 0 && (
          <>
            <Separator className="bg-terminal-border/20" />
            <div className="space-y-2">
              <h3 className="text-terminal-secondary font-mono text-sm font-medium">
                SUBSCRIBED INDICATORS ({Object.keys(indicators).length})
              </h3>
              <div className="space-y-2">
                {Object.entries(indicators).map(([indicatorId, data]) => (
                  <div 
                    key={indicatorId}
                    className="flex items-center justify-between p-3 bg-terminal-surface/20 border border-terminal-border/20 rounded"
                  >
                    <div className="flex flex-col">
                      <span className="font-mono text-sm text-terminal-primary">
                        {indicatorId}
                      </span>
                      <span className="font-mono text-xs text-terminal-muted">
                        {data.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-mono font-bold text-terminal-primary">
                        {formatNumber(data.current)}
                      </span>
                      {data.changePercent && (
                        <div className={`text-xs font-mono ${
                          data.changePercent >= 0 
                            ? 'text-terminal-success' 
                            : 'text-terminal-danger'
                        }`}>
                          {data.changePercent >= 0 ? '+' : ''}{formatPercentage(data.changePercent)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Error Display */}
        {error && (
          <>
            <Separator className="bg-terminal-border/20" />
            <div className="p-3 bg-terminal-danger/10 border border-terminal-danger/30 rounded">
              <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4 text-terminal-danger" />
                <span className="font-mono text-sm text-terminal-danger">
                  {error}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Quick Subscribe */}
        <div className="space-y-2">
          <h3 className="text-terminal-secondary font-mono text-sm font-medium">
            QUICK SUBSCRIBE
          </h3>
          <div className="flex gap-2 flex-wrap">
            {[
              'NET_LIQUIDITY',
              'DEALER_POSITIONS', 
              'CREDIT_STRESS',
              'MOMENTUM_SCORE'
            ].map(indicator => (
              <Button
                key={indicator}
                variant="outline"
                size="sm"
                onClick={() => subscribeToIndicator(indicator)}
                disabled={subscribedIndicators.includes(indicator)}
                className="font-mono text-xs"
              >
                {subscribedIndicators.includes(indicator) ? 'SUBSCRIBED' : `+${indicator}`}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}