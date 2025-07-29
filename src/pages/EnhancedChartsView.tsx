import { useState } from "react";
import { GlassTile } from "@/components/shared/GlassTile";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Activity, DollarSign, Zap, BarChart3, AlertTriangle, Target, Search } from "lucide-react";
import { useChartsData } from "@/hooks/useChartsData";

const EnhancedChartsView = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { indicators, loading } = useChartsData({ category: selectedCategory });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'momentum': return <TrendingUp className="w-4 h-4" />;
      case 'liquidity': return <DollarSign className="w-4 h-4" />;
      case 'volatility': return <Activity className="w-4 h-4" />;
      case 'sentiment': return <Zap className="w-4 h-4" />;
      case 'macro': return <BarChart3 className="w-4 h-4" />;
      case 'onchain': return <Target className="w-4 h-4" />;
      case 'credit': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getCategoryColorClass = (category: string) => {
    switch (category) {
      case 'momentum': return 'text-btc-orange-bright';
      case 'liquidity': return 'text-btc-orange-light';
      case 'volatility': return 'text-btc-orange';
      case 'sentiment': return 'text-btc-orange-bright';
      case 'macro': return 'text-btc-orange-light';
      case 'onchain': return 'text-btc-orange-bright';
      case 'credit': return 'text-btc-orange-dark';
      default: return 'text-text-secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'bullish': return 'btc-bright';
      case 'bearish': return 'btc-dark';
      case 'neutral': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'bullish': return 'text-btc-orange-bright';
      case 'bearish': return 'text-btc-orange-dark';
      case 'neutral': return 'text-text-secondary';
      default: return 'text-text-secondary';
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />;
    if (change < 0) return <TrendingDown className="w-3 h-3" />;
    return <Activity className="w-3 h-3" />;
  };

  const categories = ['all', 'momentum', 'liquidity', 'volatility', 'sentiment', 'macro', 'onchain', 'credit'];

  const filteredIndicators = indicators.filter(indicator => 
    indicator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    indicator.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryCounts = () => {
    const counts: Record<string, number> = { all: indicators.length };
    categories.slice(1).forEach(cat => {
      counts[cat] = indicators.filter(ind => ind.category === cat).length;
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Live Market Intelligence</h1>
          <p className="text-text-secondary mt-1">
            Real-time tracking of {indicators.length}+ financial indicators across all engines
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-btc-orange-bright rounded-full animate-pulse"></div>
          <span className="text-sm text-text-secondary">LIVE</span>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Search indicators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-glass-bg border-glass-border text-text-primary"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-glass-bg text-text-secondary hover:text-primary border border-glass-border hover:border-primary/50'
              }`}
            >
              {category !== 'all' && getCategoryIcon(category)}
              {category.toUpperCase()}
              <span className="ml-1 text-xs opacity-70">({categoryCounts[category] || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 16 }).map((_, index) => (
            <GlassTile key={index} title="Loading..." className="animate-pulse">
              <div className="space-y-3">
                <div className="h-8 bg-glass-bg rounded shimmer"></div>
                <div className="h-4 bg-glass-bg rounded w-2/3 shimmer"></div>
                <div className="h-3 bg-glass-bg rounded w-1/2 shimmer"></div>
              </div>
            </GlassTile>
          ))
        ) : filteredIndicators.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Activity className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">No indicators found matching your search.</p>
          </div>
        ) : (
          filteredIndicators.map(indicator => (
            <GlassTile 
              key={indicator.id} 
              title={indicator.name}
              className="hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="space-y-3">
                {/* Value and Change */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-text-data">
                    {indicator.value}
                  </div>
                  <div className={`flex items-center space-x-1 ${getStatusColorClass(indicator.status)}`}>
                    {getTrendIcon(indicator.change)}
                    <span className="text-xs font-medium">
                      {indicator.change > 0 ? '+' : ''}{indicator.change.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Category and Status */}
                <div className="flex items-center justify-between">
                  <div className={`flex items-center space-x-1 ${getCategoryColorClass(indicator.category)}`}>
                    {getCategoryIcon(indicator.category)}
                    <span className="text-xs font-medium uppercase tracking-wider">
                      {indicator.category}
                    </span>
                  </div>
                  <Badge 
                    variant={getStatusBadgeVariant(indicator.status) as any}
                    className="text-xs"
                  >
                    {indicator.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Metadata */}
                <div className="text-xs text-text-muted space-y-1 pt-2 border-t border-glass-border">
                  <div className="flex justify-between">
                    <span>Source:</span>
                    <span className="text-text-secondary">{indicator.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pillar:</span>
                    <span className="text-text-secondary">{indicator.pillar}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Update:</span>
                    <span className="text-text-secondary">{indicator.updateFreq}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last:</span>
                    <span className="text-text-secondary">{indicator.lastUpdate.toLocaleTimeString()}</span>
                  </div>
                  {indicator.confidence !== undefined && (
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span className={`${indicator.confidence > 0.8 ? 'text-btc-orange-bright' : indicator.confidence > 0.6 ? 'text-btc-orange' : 'text-btc-orange-dark'}`}>
                        {(indicator.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </GlassTile>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="glass-tile p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Showing:</span>
            <span className="text-text-primary font-mono">
              {filteredIndicators.length} of {indicators.length} indicators
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Live Updates:</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-btc-orange-bright rounded-full animate-pulse"></div>
              <span className="text-btc-orange-bright">Active</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Refresh Rate:</span>
            <span className="text-text-secondary">Every 15s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChartsView;