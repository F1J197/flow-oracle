import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUnifiedIndicator } from '@/hooks/useUnifiedIndicator';
import { formatDistanceToNow } from 'date-fns';

interface UnifiedIndicatorExampleProps {
  indicatorId: string;
  showHistorical?: boolean;
}

/**
 * Example component demonstrating unified indicator usage
 * Shows real-time data, status, and optional historical data
 */
export const UnifiedIndicatorExample: React.FC<UnifiedIndicatorExampleProps> = ({
  indicatorId,
  showHistorical = false
}) => {
  const {
    state,
    historicalData,
    loading,
    error,
    refresh,
    getHistoricalData
  } = useUnifiedIndicator(indicatorId, {
    includeHistorical: showHistorical,
    historicalPeriod: '7d',
    autoRefresh: true,
    refreshInterval: 15000 // 15 seconds
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'loading': return 'bg-warning text-warning-foreground';
      case 'error': return 'bg-destructive text-destructive-foreground';
      case 'stale': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatValue = (value: number, unit?: string) => {
    if (typeof value !== 'number') return 'N/A';
    
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(value);
    
    return unit ? `${formatted} ${unit}` : formatted;
  };

  const formatChange = (change?: number, changePercent?: number) => {
    if (typeof change !== 'number' && typeof changePercent !== 'number') {
      return null;
    }

    const isPositive = (change || changePercent || 0) >= 0;
    const sign = isPositive ? '+' : '';
    const color = isPositive ? 'text-success' : 'text-destructive';

    if (typeof changePercent === 'number') {
      return (
        <span className={color}>
          {sign}{changePercent.toFixed(2)}%
        </span>
      );
    }

    if (typeof change === 'number') {
      return (
        <span className={color}>
          {sign}{formatValue(change)}
        </span>
      );
    }

    return null;
  };

  if (loading && !state) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-pulse text-muted-foreground">
            Loading indicator data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !state) {
    return (
      <Card className="glass-card border-destructive">
        <CardContent className="p-6">
          <div className="text-destructive text-sm">
            Error loading indicator: {error}
          </div>
          <button 
            onClick={refresh}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground underline"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-mono">
            {state?.metadata.name || indicatorId}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(state?.status || 'offline')}>
              {state?.status || 'offline'}
            </Badge>
            {state?.value?.confidence && (
              <Badge variant="outline" className="text-xs">
                {Math.round(state.value.confidence * 100)}% confidence
              </Badge>
            )}
          </div>
        </div>
        {state?.metadata.description && (
          <p className="text-sm text-muted-foreground">
            {state.metadata.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Value */}
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-mono font-bold">
              {state?.value ? formatValue(state.value.current, state.metadata.unit) : 'No data'}
            </div>
            {state?.value && (
              <div className="text-sm text-muted-foreground">
                {formatChange(state.value.change, state.value.changePercent)}
              </div>
            )}
          </div>
          
          {state?.lastUpdate && (
            <div className="text-right text-xs text-muted-foreground">
              <div>Updated</div>
              <div>{formatDistanceToNow(state.lastUpdate, { addSuffix: true })}</div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Source:</span>{' '}
            <span className="font-mono">{state?.metadata.source}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Category:</span>{' '}
            <span>{state?.metadata.category}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Symbol:</span>{' '}
            <span className="font-mono">{state?.metadata.symbol}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Update Freq:</span>{' '}
            <span>{state?.metadata.updateFrequency}</span>
          </div>
        </div>

        {/* Historical Data Summary */}
        {showHistorical && historicalData && historicalData.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Historical Data</h4>
              <button
                onClick={() => getHistoricalData({ timeFrame: '1d', limit: 100 })}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Fetch more
              </button>
            </div>
            <div className="text-sm text-muted-foreground">
              {historicalData.length} data points available
            </div>
            {historicalData.slice(0, 3).map((point, index) => (
              <div key={index} className="flex justify-between text-xs py-1">
                <span>{formatDistanceToNow(point.timestamp, { addSuffix: true })}</span>
                <span className="font-mono">{formatValue(point.value, state?.metadata.unit)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <button
            onClick={refresh}
            disabled={loading}
            className="text-xs text-muted-foreground hover:text-foreground underline disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          
          {state?.lastError && (
            <div className="text-xs text-destructive max-w-xs truncate" title={state.lastError}>
              {state.lastError}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};