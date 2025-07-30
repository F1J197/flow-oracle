import { useState, useEffect } from "react";
import { TerminalGrid, TerminalContainer, TerminalHeader } from "@/components/Terminal";
import { TerminalTile } from "@/components/Terminal";
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
      case 'momentum': return 'text-neon-lime';
      case 'liquidity': return 'text-neon-teal';
      case 'volatility': return 'text-neon-orange';
      case 'sentiment': return 'text-neon-gold';
      case 'macro': return 'text-neon-fuchsia';
      default: return 'text-text-secondary';
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'bullish': return 'text-neon-lime';
      case 'bearish': return 'text-neon-orange';
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
    <TerminalContainer className="min-h-screen">
      <TerminalHeader 
        title="LIVE MARKET INDICATORS"
        subtitle={`Real-time tracking of ${indicators.length}+ financial indicators`}
        status="active"
      />

      {/* Category Filter */}
      <div className="terminal-section mb-6">
        <div className="terminal-section-header mb-3">CATEGORY FILTER</div>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-xs font-mono transition-all border ${
                selectedCategory === category
                  ? 'bg-neon-teal text-bg-primary border-neon-teal'
                  : 'bg-transparent text-text-secondary border-glass-border hover:text-neon-teal hover:border-neon-teal'
              }`}
            >
              {category.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Indicators Grid */}
      <TerminalGrid columns={4} gap="md">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <TerminalTile key={index} title="LOADING..." status="warning" size="md">
              <div className="space-y-3">
                <div className="h-6 bg-glass-surface animate-pulse"></div>
                <div className="h-4 bg-glass-surface animate-pulse w-2/3"></div>
              </div>
            </TerminalTile>
          ))
        ) : (
          filteredIndicators.map(indicator => (
            <TerminalTile 
              key={indicator.id} 
              title={indicator.name.toUpperCase()}
              status={indicator.status === 'bullish' ? 'active' : indicator.status === 'bearish' ? 'critical' : 'normal'}
              size="md"
              interactive="clickable"
            >
              <div className="space-y-3">
                {/* Value and Change */}
                <div className="flex items-center justify-between">
                  <div className="terminal-data text-2xl text-text-data">
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
                    <span className="terminal-text text-xs">
                      {indicator.change > 0 ? '+' : ''}{indicator.change.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Category and Status */}
                <div className="flex items-center justify-between">
                  <div className={`flex items-center space-x-1 ${getCategoryColorClass(indicator.category)}`}>
                    {getCategoryIcon(indicator.category)}
                    <span className="terminal-label text-xs">
                      {indicator.category}
                    </span>
                  </div>
                  <div className={`terminal-text text-xs ${getStatusColorClass(indicator.status)}`}>
                    {indicator.status.toUpperCase()}
                  </div>
                </div>

                {/* Update Info */}
                <div className="terminal-divider"></div>
                <div className="terminal-text text-xs text-text-muted space-y-1">
                  <div className="flex justify-between">
                    <span>FREQ:</span>
                    <span>{indicator.updateFreq}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LAST:</span>
                    <span>{indicator.lastUpdate.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </TerminalTile>
          ))
        )}
      </TerminalGrid>

      {/* Footer Status */}
      <div className="terminal-section mt-6">
        <div className="terminal-divider"></div>
        <div className="flex items-center justify-between terminal-text text-xs text-text-secondary mt-4">
          <div className="flex items-center space-x-4">
            <span>
              SHOWING {filteredIndicators.length} OF {indicators.length} INDICATORS
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-neon-lime animate-pulse"></div>
              <span>REAL-TIME ACTIVE</span>
            </div>
          </div>
          <div>
            REFRESH: EVERY 15S
          </div>
        </div>
      </div>
    </TerminalContainer>
  );
};

export default ChartsView;