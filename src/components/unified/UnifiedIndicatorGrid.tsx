import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUnifiedIndicators } from '@/hooks/useUnifiedIndicators';

/**
 * Grid component showing multiple indicators organized by categories
 * Demonstrates mass indicator management and filtering
 */
export const UnifiedIndicatorGrid: React.FC = () => {
  const {
    indicators,
    metadata,
    categories,
    pillars,
    sources,
    stats,
    loading,
    error,
    refreshAll,
    getByCategory,
    getByPillar,
    getBySource
  } = useUnifiedIndicators({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    includeInactive: false
  });

  const formatValue = (value: number, unit?: string) => {
    if (typeof value !== 'number') return 'N/A';
    
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(value);
    
    return unit ? `${formatted} ${unit}` : formatted;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'loading': return 'bg-warning';
      case 'error': return 'bg-destructive';
      case 'stale': return 'bg-muted';
      default: return 'bg-secondary';
    }
  };

  if (loading && indicators.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">
          Loading indicators...
        </div>
      </div>
    );
  }

  if (error && indicators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-destructive">Error loading indicators: {error}</div>
        <button 
          onClick={refreshAll}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Unified Data Layer Status</CardTitle>
            <button
              onClick={refreshAll}
              disabled={loading}
              className="text-sm text-muted-foreground hover:text-foreground underline disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh All'}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{stats.error}</div>
              <div className="text-sm text-muted-foreground">Error</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{stats.stale}</div>
              <div className="text-sm text-muted-foreground">Stale</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted">{stats.loading}</div>
              <div className="text-sm text-muted-foreground">Loading</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicator Grids by Category */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({indicators.length})</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="pillar">By Pillar</TabsTrigger>
          <TabsTrigger value="source">By Source</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {indicators.map(indicator => (
              <Card key={indicator.metadata.id} className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono truncate">
                      {indicator.metadata.name}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(indicator.status)}`} />
                      <Badge variant="outline" className="text-xs">
                        {indicator.metadata.source}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div className="text-lg font-mono font-bold">
                      {indicator.value ? formatValue(indicator.value.current, indicator.metadata.unit) : 'No data'}
                    </div>
                    {indicator.value?.confidence && (
                      <div className="text-xs text-muted-foreground">
                        {Math.round(indicator.value.confidence * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {indicator.metadata.symbol} • {indicator.metadata.category}
                  </div>
                  {indicator.lastError && (
                    <div className="text-xs text-destructive truncate" title={indicator.lastError}>
                      {indicator.lastError}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="category" className="space-y-6">
          {categories.map(category => {
            const categoryIndicators = getByCategory(category);
            return (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-4 capitalize">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryIndicators.map(indicator => (
                    <Card key={indicator.metadata.id} className="glass-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-mono text-sm truncate">{indicator.metadata.name}</div>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(indicator.status)}`} />
                        </div>
                        <div className="text-lg font-bold">
                          {indicator.value ? formatValue(indicator.value.current, indicator.metadata.unit) : 'No data'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="pillar" className="space-y-6">
          {pillars.map(pillar => {
            const pillarIndicators = getByPillar(pillar);
            return (
              <div key={pillar}>
                <h3 className="text-lg font-semibold mb-4">Pillar {pillar}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pillarIndicators.map(indicator => (
                    <Card key={indicator.metadata.id} className="glass-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-mono text-sm truncate">{indicator.metadata.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {indicator.metadata.source}
                          </Badge>
                        </div>
                        <div className="text-lg font-bold">
                          {indicator.value ? formatValue(indicator.value.current, indicator.metadata.unit) : 'No data'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="source" className="space-y-6">
          {sources.map(source => {
            const sourceIndicators = getBySource(source);
            return (
              <div key={source}>
                <h3 className="text-lg font-semibold mb-4">{source}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sourceIndicators.map(indicator => (
                    <Card key={indicator.metadata.id} className="glass-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-mono text-sm truncate">{indicator.metadata.name}</div>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(indicator.status)}`} />
                        </div>
                        <div className="text-lg font-bold">
                          {indicator.value ? formatValue(indicator.value.current, indicator.metadata.unit) : 'No data'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {indicator.metadata.category}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};