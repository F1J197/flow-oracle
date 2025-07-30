/**
 * Chart Selector - Interface for choosing and managing charts
 */

import React, { useState, useMemo } from 'react';
import { ChartConfig, CHART_CONFIGS, CHART_CATEGORIES, getAllCategories } from '@/config/charts.config';
import { useTerminalTheme } from '@/hooks/useTerminalTheme';
import { Search, Plus, X, Filter, Star, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ChartSelectorProps {
  selectedCharts: string[];
  onChartsChange: (chartIds: string[]) => void;
  maxCharts?: number;
  className?: string;
}

interface ChartSearchFilters {
  category: string;
  pillar: string;
  realtime: boolean;
  search: string;
}

export const ChartSelector: React.FC<ChartSelectorProps> = ({
  selectedCharts,
  onChartsChange,
  maxCharts = 12,
  className = ''
}) => {
  const { theme } = useTerminalTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<ChartSearchFilters>({
    category: 'all',
    pillar: 'all',
    realtime: false,
    search: ''
  });

  // Available charts filtered by current criteria
  const filteredCharts = useMemo(() => {
    return Object.values(CHART_CONFIGS).filter(chart => {
      // Category filter
      if (filters.category !== 'all' && chart.category !== filters.category) {
        return false;
      }

      // Pillar filter
      if (filters.pillar !== 'all' && chart.pillar.toString() !== filters.pillar) {
        return false;
      }

      // Realtime filter
      if (filters.realtime && !chart.realtime) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          chart.name.toLowerCase().includes(searchLower) ||
          chart.description.toLowerCase().includes(searchLower) ||
          chart.indicatorId.toLowerCase().includes(searchLower)
        );
      }

      return true;
    }).sort((a, b) => a.priority - b.priority);
  }, [filters]);

  // Categories and pillars for filter options
  const categories = useMemo(() => getAllCategories(), []);
  const pillars = useMemo(() => {
    const pillarSet = new Set(Object.values(CHART_CONFIGS).map(c => c.pillar.toString()));
    return Array.from(pillarSet).sort();
  }, []);

  // Handle chart selection
  const handleChartToggle = (chartId: string) => {
    if (selectedCharts.includes(chartId)) {
      // Remove chart
      onChartsChange(selectedCharts.filter(id => id !== chartId));
    } else if (selectedCharts.length < maxCharts) {
      // Add chart
      onChartsChange([...selectedCharts, chartId]);
    }
  };

  // Quick presets
  const handlePreset = (presetName: string) => {
    let chartIds: string[] = [];
    
    switch (presetName) {
      case 'essentials':
        chartIds = ['net-liquidity', 'z-score', 'primary-dealer-positions', 'credit-stress'];
        break;
      case 'liquidity-focus':
        chartIds = Object.values(CHART_CONFIGS)
          .filter(c => c.category === 'liquidity')
          .slice(0, 6)
          .map(c => c.id);
        break;
      case 'crypto-dashboard':
        chartIds = ['bitcoin', 'ethereum', 'net-liquidity', 'dxy'];
        break;
      case 'macro-overview':
        chartIds = ['dxy', 'gold', 'vix', 'term-spread', 'ism-pmi', 'fed-balance-sheet'];
        break;
      default:
        break;
    }
    
    onChartsChange(chartIds);
  };

  // Chart card component
  const ChartCard: React.FC<{ config: ChartConfig }> = ({ config }) => {
    const isSelected = selectedCharts.includes(config.id);
    const canSelect = !isSelected && selectedCharts.length < maxCharts;
    const categoryConfig = CHART_CATEGORIES[config.category as keyof typeof CHART_CATEGORIES];

    return (
      <Card
        className={`p-3 cursor-pointer transition-all border ${
          isSelected
            ? 'border-neon-teal bg-glass-surface'
            : canSelect
            ? 'border-glass-border hover:border-glass-border-active bg-bg-secondary'
            : 'border-glass-border bg-bg-secondary opacity-50 cursor-not-allowed'
        }`}
        onClick={() => canSelect || isSelected ? handleChartToggle(config.id) : undefined}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="text-text-primary font-mono text-sm font-medium truncate">
              {config.name}
            </h4>
            <p className="text-text-secondary text-xs mt-1 line-clamp-2">
              {config.description}
            </p>
          </div>
          <div className="ml-2 flex-shrink-0">
            {isSelected ? (
              <X className="h-4 w-4 text-neon-teal" />
            ) : canSelect ? (
              <Plus className="h-4 w-4 text-text-secondary" />
            ) : (
              <div className="h-4 w-4" />
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge
              variant="secondary"
              style={{ backgroundColor: `${categoryConfig?.color}20`, color: categoryConfig?.color }}
              className="text-xs"
            >
              {config.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              P{config.pillar}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-1 text-text-secondary">
            {config.realtime && <Clock className="h-3 w-3" />}
            {config.priority <= 5 && <Star className="h-3 w-3" />}
            <span className="text-xs">{config.chartType}</span>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selector Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-text-primary font-mono text-sm font-medium">
            CHART SELECTOR
          </h3>
          <p className="text-text-secondary text-xs">
            {selectedCharts.length}/{maxCharts} charts selected
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-text-secondary hover:text-text-primary"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
          <Filter className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePreset('essentials')}
          className="text-xs"
        >
          Essentials
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePreset('liquidity-focus')}
          className="text-xs"
        >
          Liquidity Focus
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePreset('crypto-dashboard')}
          className="text-xs"
        >
          Crypto Dashboard
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePreset('macro-overview')}
          className="text-xs"
        >
          Macro Overview
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChartsChange([])}
          className="text-xs text-red-400"
        >
          Clear All
        </Button>
      </div>

      {/* Filters (when expanded) */}
      {isExpanded && (
        <Card className="bg-bg-secondary border-glass-border p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="text-text-secondary text-xs mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-text-secondary" />
                <Input
                  placeholder="Search charts..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-7 h-8 text-xs"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-text-secondary text-xs mb-1 block">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full h-8 bg-bg-primary border border-glass-border rounded text-xs text-text-primary px-2"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Pillar */}
            <div>
              <label className="text-text-secondary text-xs mb-1 block">Pillar</label>
              <select
                value={filters.pillar}
                onChange={(e) => setFilters(prev => ({ ...prev, pillar: e.target.value }))}
                className="w-full h-8 bg-bg-primary border border-glass-border rounded text-xs text-text-primary px-2"
              >
                <option value="all">All Pillars</option>
                {pillars.map(pillar => (
                  <option key={pillar} value={pillar}>Pillar {pillar}</option>
                ))}
              </select>
            </div>

            {/* Realtime Toggle */}
            <div>
              <label className="text-text-secondary text-xs mb-1 block">Type</label>
              <label className="flex items-center space-x-2 h-8">
                <input
                  type="checkbox"
                  checked={filters.realtime}
                  onChange={(e) => setFilters(prev => ({ ...prev, realtime: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-xs text-text-secondary">Real-time only</span>
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {filteredCharts.map(config => (
          <ChartCard key={config.id} config={config} />
        ))}
      </div>

      {filteredCharts.length === 0 && (
        <Card className="bg-bg-secondary border-glass-border p-6 text-center">
          <TrendingUp className="h-8 w-8 text-text-secondary mx-auto mb-2 opacity-50" />
          <p className="text-text-secondary text-sm">No charts match current filters</p>
        </Card>
      )}
    </div>
  );
};