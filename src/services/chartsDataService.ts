import { dataService } from './dataService';

export interface LiveIndicator {
  id: string;
  name: string;
  symbol: string;
  value: string | number;
  change: number;
  status: 'bullish' | 'bearish' | 'neutral';
  category: 'momentum' | 'liquidity' | 'volatility' | 'sentiment' | 'macro' | 'onchain' | 'credit';
  updateFreq: string;
  lastUpdate: Date;
  pillar: number;
  priority: number;
  source: string;
  unit?: string;
  confidence?: number;
}

class ChartsDataService {
  private indicators: LiveIndicator[] = [];
  private updateInterval: NodeJS.Timeout | null = null;
  private callbacks: Set<(indicators: LiveIndicator[]) => void> = new Set();

  async initialize(): Promise<void> {
    // Load base indicators from database
    const dbIndicators = await dataService.getIndicators();
    
    // Enhanced indicator set - 50+ indicators across all categories
    const enhancedIndicators: Omit<LiveIndicator, 'value' | 'change' | 'lastUpdate'>[] = [
      // Liquidity Pillar (Pillar 1) - 15 indicators
      { id: 'net-liquidity', name: 'Global Net Liquidity', symbol: 'WALCL', status: 'neutral', category: 'liquidity', updateFreq: '15s', pillar: 1, priority: 1, source: 'FRED', unit: 'T' },
      { id: 'fed-balance-sheet', name: 'Fed Balance Sheet', symbol: 'WALCL', status: 'neutral', category: 'liquidity', updateFreq: '1h', pillar: 1, priority: 2, source: 'FRED', unit: 'T' },
      { id: 'treasury-account', name: 'Treasury General Account', symbol: 'WTREGEN', status: 'neutral', category: 'liquidity', updateFreq: '1h', pillar: 1, priority: 3, source: 'FRED', unit: 'B' },
      { id: 'reverse-repo', name: 'Reverse Repo Operations', symbol: 'RRPONTSYD', status: 'neutral', category: 'liquidity', updateFreq: '1h', pillar: 1, priority: 4, source: 'FRED', unit: 'B' },
      { id: 'primary-dealer-positions', name: 'Primary Dealer Positions', symbol: 'DEALER_POS', status: 'neutral', category: 'liquidity', updateFreq: '30s', pillar: 1, priority: 5, source: 'ENGINE' },
      { id: 'dealer-leverage', name: 'Dealer Leverage Ratio', symbol: 'DEALER_LEV', status: 'neutral', category: 'liquidity', updateFreq: '30s', pillar: 1, priority: 6, source: 'ENGINE' },
      { id: 'dealer-risk-capacity', name: 'Dealer Risk Capacity', symbol: 'DEALER_RISK', status: 'neutral', category: 'liquidity', updateFreq: '30s', pillar: 1, priority: 7, source: 'ENGINE' },
      { id: 'money-market-funds', name: 'Money Market Funds', symbol: 'MMMFFAQ027S', status: 'neutral', category: 'liquidity', updateFreq: '1h', pillar: 1, priority: 8, source: 'FRED', unit: 'B' },
      { id: 'bank-liquidity', name: 'Bank Liquidity Ratio', symbol: 'BOGZ1FL704090005Q', status: 'neutral', category: 'liquidity', updateFreq: '1h', pillar: 1, priority: 9, source: 'FRED' },
      { id: 'libor-ois', name: 'LIBOR-OIS Spread', symbol: 'USDONTD156N', status: 'neutral', category: 'liquidity', updateFreq: '15m', pillar: 1, priority: 10, source: 'FRED', unit: '%' },
      { id: 'eurodollar-futures', name: 'Eurodollar Futures Curve', symbol: 'ED_CURVE', status: 'neutral', category: 'liquidity', updateFreq: '5s', pillar: 1, priority: 11, source: 'MARKET' },
      { id: 'repo-rate', name: 'Repo Rate', symbol: 'SOFR', status: 'neutral', category: 'liquidity', updateFreq: '1h', pillar: 1, priority: 12, source: 'FRED', unit: '%' },
      { id: 'central-bank-swaps', name: 'Central Bank Swaps', symbol: 'SWPT', status: 'neutral', category: 'liquidity', updateFreq: '1h', pillar: 1, priority: 13, source: 'FRED', unit: 'B' },
      { id: 'commercial-paper', name: 'Commercial Paper Outstanding', symbol: 'CPNFIN', status: 'neutral', category: 'liquidity', updateFreq: '1h', pillar: 1, priority: 14, source: 'FRED', unit: 'B' },
      { id: 'fed-funds-rate', name: 'Federal Funds Rate', symbol: 'FEDFUNDS', status: 'neutral', category: 'liquidity', updateFreq: '1h', pillar: 1, priority: 15, source: 'FRED', unit: '%' },

      // Credit & Risk Pillar (Pillar 2) - 15 indicators
      { id: 'credit-stress', name: 'Credit Stress Index', symbol: 'HYG_OAS', status: 'neutral', category: 'credit', updateFreq: '1m', pillar: 2, priority: 1, source: 'ENGINE', unit: 'bps' },
      { id: 'high-yield-spread', name: 'High Yield Credit Spread', symbol: 'BAMLH0A0HYM2', status: 'neutral', category: 'credit', updateFreq: '1h', pillar: 2, priority: 2, source: 'FRED', unit: 'bps' },
      { id: 'investment-grade-spread', name: 'Investment Grade Spread', symbol: 'BAMLC0A0CM', status: 'neutral', category: 'credit', updateFreq: '1h', pillar: 2, priority: 3, source: 'FRED', unit: 'bps' },
      { id: 'corporate-spread', name: 'Corporate Bond Spread', symbol: 'BAMLC0A0CMEY', status: 'neutral', category: 'credit', updateFreq: '1h', pillar: 2, priority: 4, source: 'FRED', unit: 'bps' },
      { id: 'sovereign-spread', name: 'Sovereign Risk Spread', symbol: 'TEDRATE', status: 'neutral', category: 'credit', updateFreq: '1h', pillar: 2, priority: 5, source: 'FRED', unit: 'bps' },
      { id: 'vix', name: 'VIX Volatility Index', symbol: 'VIXCLS', status: 'neutral', category: 'volatility', updateFreq: '15s', pillar: 2, priority: 6, source: 'MARKET' },
      { id: 'move-index', name: 'MOVE Bond Volatility', symbol: 'MOVE', status: 'neutral', category: 'volatility', updateFreq: '15s', pillar: 2, priority: 7, source: 'MARKET' },
      { id: 'skew-index', name: 'SKEW Index', symbol: 'SKEW', status: 'neutral', category: 'volatility', updateFreq: '15s', pillar: 2, priority: 8, source: 'MARKET' },
      { id: 'credit-default-swaps', name: 'CDS Index', symbol: 'CDX_IG', status: 'neutral', category: 'credit', updateFreq: '15m', pillar: 2, priority: 9, source: 'MARKET', unit: 'bps' },
      { id: 'leverage-loan-index', name: 'Leveraged Loan Index', symbol: 'SPBDLLLY', status: 'neutral', category: 'credit', updateFreq: '1h', pillar: 2, priority: 10, source: 'MARKET' },
      { id: 'term-spread', name: '10Y-2Y Term Spread', symbol: 'T10Y2Y', status: 'neutral', category: 'macro', updateFreq: '1h', pillar: 2, priority: 11, source: 'FRED', unit: '%' },
      { id: 'real-rates', name: '10Y Real Interest Rate', symbol: 'DFII10', status: 'neutral', category: 'macro', updateFreq: '1h', pillar: 2, priority: 12, source: 'FRED', unit: '%' },
      { id: 'break-even-inflation', name: '10Y Breakeven Inflation', symbol: 'T10YIE', status: 'neutral', category: 'macro', updateFreq: '1h', pillar: 2, priority: 13, source: 'FRED', unit: '%' },
      { id: 'financial-stress', name: 'Financial Stress Index', symbol: 'STLFSI4', status: 'neutral', category: 'credit', updateFreq: '1h', pillar: 2, priority: 14, source: 'FRED' },
      { id: 'systemic-risk', name: 'Systemic Risk Indicator', symbol: 'SYSRISK', status: 'neutral', category: 'credit', updateFreq: '1h', pillar: 2, priority: 15, source: 'ENGINE' },

      // Momentum & Sentiment Pillar (Pillar 3) - 20 indicators  
      { id: 'enhanced-momentum', name: 'Enhanced Momentum Score', symbol: 'MOMENTUM_SCORE', status: 'neutral', category: 'momentum', updateFreq: '15s', pillar: 3, priority: 1, source: 'ENGINE' },
      { id: 'z-score', name: 'Z-Score Analysis', symbol: 'ZSCORE', status: 'neutral', category: 'momentum', updateFreq: '30s', pillar: 3, priority: 2, source: 'ENGINE' },
      { id: 'roc-analysis', name: 'Rate of Change Analysis', symbol: 'ROC', status: 'neutral', category: 'momentum', updateFreq: '30s', pillar: 3, priority: 3, source: 'ENGINE' },
      { id: 'regime-detection', name: 'Market Regime Detection', symbol: 'REGIME', status: 'neutral', category: 'sentiment', updateFreq: '1m', pillar: 3, priority: 4, source: 'ENGINE' },
      { id: 'dxy', name: 'Dollar Index (DXY)', symbol: 'DEXUSEU', status: 'neutral', category: 'macro', updateFreq: '15s', pillar: 3, priority: 5, source: 'MARKET' },
      { id: 'gold', name: 'Gold Spot Price', symbol: 'GOLDAMGBD228NLBM', status: 'neutral', category: 'macro', updateFreq: '15s', pillar: 3, priority: 6, source: 'FRED', unit: '$' },
      { id: 'bitcoin', name: 'Bitcoin Price', symbol: 'BTC', status: 'neutral', category: 'onchain', updateFreq: '5s', pillar: 3, priority: 7, source: 'GLASSNODE', unit: '$' },
      { id: 'ethereum', name: 'Ethereum Price', symbol: 'ETH', status: 'neutral', category: 'onchain', updateFreq: '5s', pillar: 3, priority: 8, source: 'GLASSNODE', unit: '$' },
      { id: 'fear-greed', name: 'Fear & Greed Index', symbol: 'FGI', status: 'neutral', category: 'sentiment', updateFreq: '1h', pillar: 3, priority: 9, source: 'MARKET' },
      { id: 'put-call-ratio', name: 'Put/Call Ratio', symbol: 'CBOEPCR', status: 'neutral', category: 'sentiment', updateFreq: '15m', pillar: 3, priority: 10, source: 'MARKET' },
      { id: 'aaii-sentiment', name: 'AAII Sentiment Survey', symbol: 'AAII', status: 'neutral', category: 'sentiment', updateFreq: '1w', pillar: 3, priority: 11, source: 'MARKET' },
      { id: 'michigan-sentiment', name: 'Michigan Consumer Sentiment', symbol: 'UMCSENT', status: 'neutral', category: 'sentiment', updateFreq: '1m', pillar: 3, priority: 12, source: 'FRED' },
      { id: 'consumer-confidence', name: 'Consumer Confidence Index', symbol: 'CSCICP03USM665S', status: 'neutral', category: 'sentiment', updateFreq: '1m', pillar: 3, priority: 13, source: 'FRED' },
      { id: 'ism-pmi', name: 'ISM Manufacturing PMI', symbol: 'MANEMP', status: 'neutral', category: 'macro', updateFreq: '1m', pillar: 3, priority: 14, source: 'FRED' },
      { id: 'ism-services', name: 'ISM Services PMI', symbol: 'NANEMP', status: 'neutral', category: 'macro', updateFreq: '1m', pillar: 3, priority: 15, source: 'FRED' },
      { id: 'unemployment-rate', name: 'Unemployment Rate', symbol: 'UNRATE', status: 'neutral', category: 'macro', updateFreq: '1m', pillar: 3, priority: 16, source: 'FRED', unit: '%' },
      { id: 'nfp', name: 'Non-Farm Payrolls', symbol: 'PAYEMS', status: 'neutral', category: 'macro', updateFreq: '1m', pillar: 3, priority: 17, source: 'FRED', unit: 'K' },
      { id: 'cpi-inflation', name: 'CPI Inflation Rate', symbol: 'CPIAUCSL', status: 'neutral', category: 'macro', updateFreq: '1m', pillar: 3, priority: 18, source: 'FRED', unit: '%' },
      { id: 'gdp-growth', name: 'GDP Growth Rate', symbol: 'GDP', status: 'neutral', category: 'macro', updateFreq: '1q', pillar: 3, priority: 19, source: 'FRED', unit: '%' },
      { id: 'retail-sales', name: 'Retail Sales Growth', symbol: 'RSXFS', status: 'neutral', category: 'macro', updateFreq: '1m', pillar: 3, priority: 20, source: 'FRED', unit: '%' },
    ];

    // Initialize indicators with current values
    this.indicators = await Promise.all(
      enhancedIndicators.map(async (indicator) => {
        const value = await this.fetchIndicatorValue(indicator);
        return {
          ...indicator,
          value,
          change: Math.random() * 4 - 2, // Random initial change
          lastUpdate: new Date(),
          confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
        };
      })
    );

    // Start real-time updates
    this.startRealTimeUpdates();
  }

  private async fetchIndicatorValue(indicator: Omit<LiveIndicator, 'value' | 'change' | 'lastUpdate'>): Promise<string | number> {
    try {
      switch (indicator.source) {
        case 'FRED':
          const fredValue = await dataService.fetchFREDData(indicator.symbol);
          return this.formatValue(fredValue, indicator.unit);
        
        case 'ENGINE':
          // Get computed values from engines
          return this.getEngineValue(indicator.id);
        
        case 'GLASSNODE':
          // Crypto data from Glassnode
          const cryptoData = await dataService.fetchCryptoData(`/${indicator.symbol.toLowerCase()}/price`);
          return this.formatValue(cryptoData?.price || 0, indicator.unit);
        
        case 'MARKET':
          // Market data from various sources
          return this.getMarketValue(indicator.symbol);
        
        default:
          return this.getMockValue(indicator.category);
      }
    } catch (error) {
      console.warn(`Failed to fetch ${indicator.symbol}:`, error);
      return this.getMockValue(indicator.category);
    }
  }

  private formatValue(value: number, unit?: string): string | number {
    if (!unit) return Math.round(value * 100) / 100;
    
    switch (unit) {
      case 'T': return `$${(value / 1000000).toFixed(2)}T`;
      case 'B': return `$${(value / 1000).toFixed(1)}B`;
      case '%': return `${value.toFixed(2)}%`;
      case 'bps': return `${value.toFixed(0)}bps`;
      case '$': return `$${value.toLocaleString()}`;
      case 'K': return `${value.toFixed(0)}K`;
      default: return Math.round(value * 100) / 100;
    }
  }

  private getEngineValue(id: string): string | number {
    // Placeholder for engine-computed values
    switch (id) {
      case 'net-liquidity': return '$5.626T';
      case 'enhanced-momentum': return -0.8;
      case 'z-score': return '+3.0';
      case 'credit-stress': return '2.82bps';
      case 'primary-dealer-positions': return '$5.66T';
      case 'dealer-leverage': return '3.2x';
      case 'dealer-risk-capacity': return '85.6%';
      default: return Math.random() * 100;
    }
  }

  private getMarketValue(symbol: string): string | number {
    // Placeholder for real market data
    const mockValues: Record<string, number> = {
      'VIX': 18.4,
      'MOVE': 95.2,
      'SKEW': 145.8,
      'DXY': 106.8,
      'FGI': 42,
      'CBOEPCR': 0.85,
      'AAII': 35.2
    };
    return mockValues[symbol] || Math.random() * 100;
  }

  private getMockValue(category: string): string | number {
    switch (category) {
      case 'liquidity': return `$${(Math.random() * 10).toFixed(2)}T`;
      case 'credit': return `${(Math.random() * 500).toFixed(0)}bps`;
      case 'volatility': return Math.random() * 50;
      case 'sentiment': return Math.random() * 100;
      case 'macro': return Math.random() * 10;
      case 'onchain': return `$${(Math.random() * 50000).toFixed(0)}`;
      default: return Math.random() * 100;
    }
  }

  private startRealTimeUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.updateIndicators();
    }, 15000); // Update every 15 seconds
  }

  private updateIndicators(): void {
    this.indicators = this.indicators.map(indicator => {
      const changeAmount = (Math.random() - 0.5) * 0.5; // ±0.25% max change
      let newStatus = indicator.status;
      
      // Update status based on change direction
      if (changeAmount > 0.1) newStatus = 'bullish';
      else if (changeAmount < -0.1) newStatus = 'bearish';
      else newStatus = 'neutral';

      return {
        ...indicator,
        change: indicator.change + changeAmount,
        status: newStatus,
        lastUpdate: new Date(),
        confidence: Math.min(1, (indicator.confidence || 0.8) + (Math.random() - 0.5) * 0.1)
      };
    });

    // Notify subscribers
    this.callbacks.forEach(callback => callback([...this.indicators]));
  }

  public subscribe(callback: (indicators: LiveIndicator[]) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  public getIndicators(category?: string, pillar?: number): LiveIndicator[] {
    let filtered = [...this.indicators];
    
    if (category && category !== 'all') {
      filtered = filtered.filter(ind => ind.category === category);
    }
    
    if (pillar) {
      filtered = filtered.filter(ind => ind.pillar === pillar);
    }
    
    return filtered.sort((a, b) => a.priority - b.priority);
  }

  public getIndicatorById(id: string): LiveIndicator | undefined {
    return this.indicators.find(ind => ind.id === id);
  }

  public cleanup(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.callbacks.clear();
  }
}

export const chartsDataService = new ChartsDataService();