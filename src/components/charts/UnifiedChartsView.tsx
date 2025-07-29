import { useState } from "react";
import { useUnifiedIndicators } from "@/hooks/useUnifiedIndicators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";

export const UnifiedChartsView = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const {
    indicators,
    loading,
    error,
    refreshAll,
    getByCategory,
    categories,
    stats
  } = useUnifiedIndicators({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds for charts
    includeInactive: false
  });

  // Format chart data for each indicator
  const formatChartData = (indicator: any) => {
    if (!indicator.historicalData) return [];
    
    return indicator.historicalData.map((point: any, index: number) => ({
      name: `Day ${index + 1}`,
      value: point.value,
      timestamp: point.timestamp
    }));
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'loading': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'stale': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  // Get trend icon
  const getTrendIcon = (change?: number) => {
    if (!change) return <Minus className="w-4 h-4 text-gray-400" />;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    return <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  // Format value with unit
  const formatValue = (value: number, unit?: string) => {
    if (unit === 'USD' || unit === 'dollars') {
      if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
      if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
      if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
      return `$${value.toFixed(2)}`;
    }
    if (unit === 'percentage' || unit === '%') return `${value.toFixed(2)}%`;
    return value.toFixed(2);
  };

  const filteredIndicators = selectedCategory === 'all' 
    ? indicators 
    : getByCategory(selectedCategory);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-red-400 mb-2">Charts Error</h2>
              <p className="text-red-300 mb-4">{error}</p>
              <Button onClick={refreshAll} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Unified Charts</h1>
          <p className="text-text-secondary">Real-time financial indicators visualization</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-400 border-green-400">
              Active: {stats.active}
            </Badge>
            <Badge variant="outline" className="text-red-400 border-red-400">
              Error: {stats.error}
            </Badge>
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              Loading: {stats.loading}
            </Badge>
          </div>
          
          <Button 
            onClick={refreshAll} 
            variant="outline" 
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh All</span>
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="all">All ({indicators.length})</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category} ({getByCategory(category).length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredIndicators.map((indicator) => (
              <Card key={indicator.metadata.id} className="glass-tile">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{indicator.metadata.name}</CardTitle>
                      <p className="text-sm text-text-secondary">{indicator.metadata.symbol}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(indicator.value?.change)}
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(indicator.status)}
                      >
                        {indicator.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Current Value */}
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-white">
                      {indicator.value ? 
                        formatValue(indicator.value.current, indicator.metadata.unit) : 
                        'N/A'
                      }
                    </div>
                    {indicator.value?.change && (
                      <div className={`text-sm ${indicator.value.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {indicator.value.change >= 0 ? '+' : ''}
                        {formatValue(indicator.value.change, indicator.metadata.unit)} 
                        ({indicator.value.changePercent?.toFixed(2)}%)
                      </div>
                    )}
                  </div>

                  {/* Chart */}
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatChartData(indicator)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="name" 
                          stroke="rgba(255,255,255,0.5)"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="rgba(255,255,255,0.5)"
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(26, 26, 26, 0.9)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#00BFFF" 
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6, fill: '#00BFFF' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-text-secondary mt-2">
                    <span>Source: {indicator.metadata.source}</span>
                    <span>Last: {indicator.lastUpdate.toLocaleTimeString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredIndicators.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-text-secondary">No indicators found for this category.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};