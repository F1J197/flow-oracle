import { useState, useEffect } from "react";
import { GlassTile } from "@/components/shared/GlassTile";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, DollarSign, Zap } from "lucide-react";

interface Indicator {
  id: string;
  name: string;
  value: string | number;
  change: number;
  status: 'bullish' | 'bearish' | 'neutral';
  category: 'momentum' | 'liquidity' | 'volatility' | 'sentiment' | 'macro';
  updateFreq: string;
  lastUpdate: Date;
}

const ChartsView = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate live indicator data
    const mockIndicators: Indicator[] = [
      {
        id: 'net-liquidity',
        name: 'Global Net Liquidity',
        value: '$6.657T',
        change: 2.3,
        status: 'bullish',
        category: 'liquidity',
        updateFreq: '15s',
        lastUpdate: new Date()
      },
      {
        id: 'enhanced-momentum',
        name: 'Enhanced Momentum Score',
        value: -0.8,
        change: -0.2,
        status: 'bearish',
        category: 'momentum',
        updateFreq: '15s',
        lastUpdate: new Date()
      },
      {
        id: 'z-score',
        name: 'Z-Score Analysis',
        value: '+3.0',
        change: 0.5,
        status: 'bullish',
        category: 'momentum',
        updateFreq: '30s',
        lastUpdate: new Date()
      },
      {
        id: 'credit-stress',
        name: 'Credit Stress Index',
        value: '2.82bps',
        change: -0.1,
        status: 'bullish',
        category: 'sentiment',
        updateFreq: '1m',
        lastUpdate: new Date()
      },
      {
        id: 'vix',
        name: 'VIX Volatility',
        value: 18.4,
        change: -1.2,
        status: 'bullish',
        category: 'volatility',
        updateFreq: '15s',
        lastUpdate: new Date()
      },
      {
        id: 'dxy',
        name: 'Dollar Index (DXY)',
        value: 106.8,
        change: 0.3,
        status: 'bullish',
        category: 'macro',
        updateFreq: '15s',
        lastUpdate: new Date()
      },
      {
        id: 'gold',
        name: 'Gold Spot Price',
        value: '$2,045',
        change: -0.8,
        status: 'bearish',
        category: 'macro',
        updateFreq: '15s',
        lastUpdate: new Date()
      },
      {
        id: 'bitcoin',
        name: 'Bitcoin Price',
        value: '$43,250',
        change: 2.1,
        status: 'bullish',
        category: 'sentiment',
        updateFreq: '5s',
        lastUpdate: new Date()
      },
      {
        id: 'ism-pmi',
        name: 'ISM Manufacturing PMI',
        value: 48.7,
        change: -0.3,
        status: 'bearish',
        category: 'macro',
        updateFreq: '1d',
        lastUpdate: new Date()
      },
      {
        id: 'term-spread',
        name: '10Y-2Y Term Spread',
        value: '0.24%',
        change: 0.02,
        status: 'neutral',
        category: 'macro',
        updateFreq: '1h',
        lastUpdate: new Date()
      },
      {
        id: 'primary-dealer-positions',
        name: 'Primary Dealer Positions',
        value: '$5.66T',
        change: 1.8,
        status: 'bullish',
        category: 'liquidity',
        updateFreq: '30s',
        lastUpdate: new Date()
      },
      {
        id: 'dealer-leverage',
        name: 'Dealer Leverage Ratio',
        value: '3.2x',
        change: -0.1,
        status: 'bullish',
        category: 'sentiment',
        updateFreq: '30s',
        lastUpdate: new Date()
      },
      {
        id: 'dealer-risk-capacity',
        name: 'Dealer Risk Capacity',
        value: '85.6%',
        change: 2.3,
        status: 'bullish',
        category: 'sentiment',
        updateFreq: '30s',
        lastUpdate: new Date()
      }
    ];

    setIndicators(mockIndicators);
    setLoading(false);

    // Update indicators every 15 seconds
    const interval = setInterval(() => {
      setIndicators(prev => prev.map(indicator => ({
        ...indicator,
        lastUpdate: new Date(),
        // Simulate small random changes
        change: indicator.change + (Math.random() - 0.5) * 0.1
      })));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'momentum': return <TrendingUp className="w-4 h-4" />;
      case 'liquidity': return <DollarSign className="w-4 h-4" />;
      case 'volatility': return <Activity className="w-4 h-4" />;
      case 'sentiment': return <Zap className="w-4 h-4" />;
      case 'macro': return <TrendingDown className="w-4 h-4" />;
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

  const categories = ['all', 'momentum', 'liquidity', 'volatility', 'sentiment', 'macro'];
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredIndicators = selectedCategory === 'all' 
    ? indicators 
    : indicators.filter(ind => ind.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Live Market Indicators</h1>
          <p className="text-text-secondary mt-1">
            Real-time tracking of {indicators.length}+ financial indicators
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-btc-orange-bright rounded-full animate-pulse"></div>
          <span className="text-sm text-text-secondary">LIVE</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-glass-bg text-text-secondary hover:text-primary'
            }`}
          >
            {category.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <GlassTile key={index} title="Loading..." className="animate-pulse">
              <div className="space-y-3">
                <div className="h-6 bg-glass-bg rounded"></div>
                <div className="h-4 bg-glass-bg rounded w-2/3"></div>
              </div>
            </GlassTile>
          ))
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
                    {indicator.change > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : indicator.change < 0 ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : (
                      <Activity className="w-3 h-3" />
                    )}
                    <span className="text-xs font-medium">
                      {indicator.change > 0 ? '+' : ''}{indicator.change.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Category and Status */}
                <div className="flex items-center justify-between">
                  <div className={`flex items-center space-x-1 ${getCategoryColorClass(indicator.category)}`}>
                    {getCategoryIcon(indicator.category)}
                    <span className="text-xs font-medium uppercase">
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

                {/* Update Info */}
                <div className="text-xs text-text-muted space-y-1">
                  <div className="flex justify-between">
                    <span>Update Freq:</span>
                    <span>{indicator.updateFreq}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Update:</span>
                    <span>{indicator.lastUpdate.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </GlassTile>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="glass-tile p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-text-secondary">
              Showing {filteredIndicators.length} of {indicators.length} indicators
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-btc-orange-bright rounded-full animate-pulse"></div>
              <span className="text-text-secondary">Real-time updates active</span>
            </div>
          </div>
          <div className="text-text-muted">
            Data refresh: Every 15s
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsView;