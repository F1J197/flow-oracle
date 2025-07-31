import { useState } from "react";
import { useUnifiedIndicators } from "@/hooks/useUnifiedIndicators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { useUnifiedIndicatorFixed } from "@/hooks/useUnifiedIndicatorFixed";
import { ALL_UNIFIED_INDICATORS, getIndicatorById } from "@/config/unifiedIndicators.config";

export const UnifiedChartsViewFixed = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const {
    categories,
    stats,
    refreshAll,
    loading: globalLoading,
    error: globalError
  } = useUnifiedIndicators({
    autoRefresh: true,
    refreshInterval: 30000,
    includeInactive: false
  });

  // Filter indicators by category
  const getIndicatorsByCategory = (category: string) => {
    if (category === 'all') {
      return ALL_UNIFIED_INDICATORS;
    }
    return ALL_UNIFIED_INDICATORS.filter(indicator => 
      indicator.category === category || 
      (typeof indicator.pillar === 'number' ? indicator.pillar.toString() : indicator.pillar) === category
    );
  };

  const indicatorsToShow = getIndicatorsByCategory(selectedCategory);

  // Individual indicator data component
  const IndicatorChart = ({ indicatorId }: { indicatorId: string }) => {
    const config = getIndicatorById(indicatorId);
    const { 
      data, 
      isLoading, 
      error, 
      lastUpdated, 
      confidence, 
      source, 
      refresh 
    } = useUnifiedIndicatorFixed(indicatorId, {
      autoRefresh: true,
      refreshInterval: 30000,
      enableHistorical: true,
      historicalPeriod: 30
    });

    if (!config) return null;

    // Format chart data - create simple trend data if no historical data
    const chartData = data ? [
      { name: 'Previous', value: data.previous, timestamp: new Date(Date.now() - 86400000) },
      { name: 'Current', value: data.current, timestamp: new Date() }
    ] : [];

    // Get status color
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active': return 'text-neon-lime';
        case 'loading': return 'text-neon-gold';
        case 'error': return 'text-neon-orange';
        case 'stale': return 'text-text-secondary';
        default: return 'text-text-secondary';
      }
    };

    // Get trend icon
    const getTrendIcon = (change?: number) => {
      if (!change || change === 0) return <Minus className="h-4 w-4 text-text-secondary" />;
      return change > 0 
        ? <TrendingUp className="h-4 w-4 text-neon-lime" />
        : <TrendingDown className="h-4 w-4 text-neon-orange" />;
    };

    // Format value
    const formatValue = (value: number, unit?: string) => {
      if (unit === 'Billions USD' || unit === 'Trillions USD') {
        return `$${(value / 1000).toFixed(2)}T`;
      }
      if (unit === '%' || unit === 'bps') {
        return `${value.toFixed(2)}${unit}`;
      }
      if (unit === 'USD') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      }
      return value.toFixed(config.precision || 2);
    };

    const status = isLoading ? 'loading' : error ? 'error' : data ? 'active' : 'stale';

    return (
      <Card className="bg-bg-secondary border-glass-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-mono text-text-primary">
                {config.name}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(status)} border-current`}
                >
                  {status.toUpperCase()}
                </Badge>
                <span className="text-xs text-text-secondary font-mono">
                  {config.symbol}
                </span>
                {source && (
                  <span className="text-xs text-text-secondary">
                    • {source.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refresh}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {error ? (
            <div className="flex items-center justify-center h-32 text-neon-orange">
              <div className="text-center space-y-2">
                <AlertCircle className="h-6 w-6 mx-auto" />
                <p className="text-xs">{error}</p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse text-text-secondary text-xs">Loading...</div>
            </div>
          ) : !data ? (
            <div className="flex items-center justify-center h-32 text-text-secondary">
              <p className="text-xs">No data available</p>
            </div>
          ) : (
            <>
              {/* Current Value & Change */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-xs">Current</span>
                  <span className="text-text-data font-mono text-sm">
                    {formatValue(data.current, config.unit)}
                  </span>
                </div>
                {data.change !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-xs">Change</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(data.change)}
                      <span className={`text-xs font-mono ${data.change > 0 ? 'text-neon-lime' : data.change < 0 ? 'text-neon-orange' : 'text-text-secondary'}`}>
                        {data.changePercent ? `${data.changePercent.toFixed(2)}%` : `${data.change.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                )}
                {confidence && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-xs">Confidence</span>
                    <span className="text-text-data text-xs font-mono">
                      {(confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Chart */}
              {chartData.length > 0 ? (
                <div style={{ height: '120px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#999' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#999' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1A1A1A',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={config.color || '#32CD32'}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-text-secondary">
                  <p className="text-xs">No historical data</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  // Handle error state
  if (globalError) {
    return (
      <div className="p-6">
        <Card className="bg-bg-secondary border-glass-border">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-neon-orange mx-auto mb-4" />
            <h3 className="text-lg font-mono text-text-primary mb-2">System Error</h3>
            <p className="text-text-secondary mb-4">{globalError}</p>
            <Button onClick={refreshAll} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-mono text-text-primary">Unified Charts View</h2>
          <p className="text-text-secondary text-sm mt-1">
            Real-time visualization of global liquidity indicators
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs text-text-secondary">
            <span>Active: {stats.active}</span>
            <span>•</span>
            <span>Errors: {stats.error}</span>
            <span>•</span>
            <span>Loading: {stats.loading}</span>
          </div>
          <Button 
            onClick={refreshAll} 
            variant="outline" 
            size="sm"
            disabled={globalLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${globalLoading ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" className="text-xs">All ({ALL_UNIFIED_INDICATORS.length})</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category} ({getIndicatorsByCategory(category).length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {indicatorsToShow.length === 0 ? (
            <Card className="bg-bg-secondary border-glass-border">
              <CardContent className="p-12 text-center">
                <div className="text-text-secondary space-y-4">
                  <div className="text-lg font-mono">No Indicators Found</div>
                  <p className="text-sm">
                    No indicators available for the selected category.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {indicatorsToShow.map(indicator => (
                <IndicatorChart key={indicator.id} indicatorId={indicator.id} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};