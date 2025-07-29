import { IEngine, EngineReport, DashboardTileData, DetailedEngineView, ActionableInsight } from '@/types/engines';
import { BaseEngine } from './BaseEngine';
import { UnifiedDataService } from '@/services/UnifiedDataService';

// ============= INTERFACES =============

interface CreditDataSources {
  primary: {
    id: string;
    name: string;
    weight: number;
  };
  secondary: {
    id: string;
    name: string;
    weight: number;
  };
  tertiary: {
    id: string;
    name: string;
    weight: number;
  };
}

interface SpreadComponent {
  source: string;
  value: number;
  weight: number;
  timestamp: string;
  valid: boolean;
}

interface SpreadVelocity {
  daily: number;
  weekly: number;
  monthly: number;
}

interface CreditSpreadResult {
  composite: number;
  components: SpreadComponent[];
  velocity: SpreadVelocity;
  stressLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRISIS';
  regime: 'QE_SUPPORTIVE' | 'NEUTRAL' | 'QT_STRESS';
  timestamp: number;
  confidence: number;
}

interface TermStructure {
  hySpread: number;
  igSpread: number;
  ratio: number;
  shape: 'FLAT' | 'NORMAL' | 'INVERTED' | 'STEEPENING' | 'FLATTENING';
  zScore: number;
}

interface DivergenceResult {
  aligned: boolean;
  divergenceMagnitude: number;
  significance: 'MINOR' | 'MODERATE' | 'MAJOR';
  creditDirection: number;
  metricDirection: number;
  message: string;
}

interface DivergenceAnalysis {
  creditVsEquity: DivergenceResult;
  creditVsRates: DivergenceResult;
  creditVsCommodities: DivergenceResult;
  overallAlignment: number;
}

interface LeadingIndicators {
  cdsIndex: {
    spread: number;
    basis: number;
    percentile: number;
    trend: 'RISK_AVERSION' | 'RISK_SEEKING';
  };
  fallenAngels: {
    value: number;
    count: number;
    trend: string;
  };
  risingStars: {
    value: number;
    count: number;
    trend: string;
  };
  netMigration: number;
  distressRatio: number;
}

interface CreditStressTileData {
  title: string;
  primaryMetric: {
    value: number;
    format: string;
    trend: 'IMPROVING' | 'DETERIORATING' | 'STABLE';
  };
  visual: {
    type: string;
    current: number;
    zones: {
      low: [number, number];
      moderate: [number, number];
      high: [number, number];
      crisis: [number, number];
    };
    gradient: string[];
  };
  regime: string;
  stressLevel: string;
  insight: string;
}

// ============= CALCULATORS =============

class CreditSpreadCalculator {
  private readonly sources: CreditDataSources = {
    primary: {
      id: 'BAMLH0A0HYM2',
      name: 'ICE BofA US High Yield OAS',
      weight: 0.6
    },
    secondary: {
      id: 'BAMLC0A0CM',
      name: 'ICE BofA US Corporate OAS',
      weight: 0.2
    },
    tertiary: {
      id: 'VIXCLS',
      name: 'VIX (volatility proxy)',
      weight: 0.2
    }
  };

  async calculateCompositeSpread(): Promise<CreditSpreadResult> {
    console.log('🔍 Credit Spread Calculator: Starting composite calculation...');
    
    // Fetch all spreads in parallel with fallbacks
    const unifiedService = UnifiedDataService.getInstance();
    const spreadPromises = Object.values(this.sources).map(async (source) => {
      try {
        const result = await unifiedService.refreshIndicator(source.id);
        if (result) {
          let value = result.current;
          
          // Convert VIX to spread-like value (proxy conversion)
          if (source.id === 'VIXCLS') {
            value = value * 20; // Convert VIX to basis points equivalent
          }
          
          return {
            source: source.name,
            value,
            weight: source.weight,
            timestamp: new Date().toISOString(),
            valid: true
          };
        }
        throw new Error('No data available');
      } catch (error) {
        console.warn(`Failed to fetch ${source.name}, using fallback`);
        return this.getFallbackSpread(source);
      }
    });

    const spreads = await Promise.all(spreadPromises);
    console.log('📊 Fetched spreads:', spreads);

    // Calculate weighted composite (only from valid sources)
    const validSpreads = spreads.filter(s => s.valid);
    const totalWeight = validSpreads.reduce((sum, s) => sum + s.weight, 0);
    
    const composite = validSpreads.reduce((sum, spread) => 
      sum + (spread.value * (spread.weight / totalWeight)), 0
    );

    // Calculate confidence based on data availability
    const confidence = (validSpreads.length / spreads.length) * 100;

    // Calculate spread velocity
    const velocity = await this.calculateSpreadVelocity(composite);

    // Determine stress level and regime
    const stressLevel = this.categorizeStressLevel(composite);
    const regime = this.determineRegime(composite, velocity);

    const result: CreditSpreadResult = {
      composite: Math.round(composite * 10) / 10,
      components: spreads,
      velocity,
      stressLevel,
      regime,
      timestamp: Date.now(),
      confidence: Math.round(confidence)
    };

    console.log('✅ Credit spread calculation complete:', result);
    return result;
  }

  private getFallbackSpread(source: any): SpreadComponent {
    // Provide reasonable fallback values based on current market conditions
    const fallbackValues: Record<string, number> = {
      'BAMLH0A0HYM2': 350, // High yield spread
      'BAMLC0A0CM': 120,   // IG spread
      'VIXCLS': 400        // VIX proxy as spread
    };

    return {
      source: `${source.name} (fallback)`,
      value: fallbackValues[source.id] || 300,
      weight: source.weight,
      timestamp: new Date().toISOString(),
      valid: false
    };
  }

  private async calculateSpreadVelocity(currentSpread: number): Promise<SpreadVelocity> {
    try {
      // For demo purposes, generate realistic velocity based on current level
      const volatility = Math.random() * 10 - 5; // -5 to +5 bps daily
      
      return {
        daily: Math.round(volatility * 10) / 10,
        weekly: Math.round((volatility * 7) * 10) / 10,
        monthly: Math.round((volatility * 30) * 10) / 10
      };
    } catch (error) {
      console.warn('Failed to calculate velocity, using default');
      return { daily: 0, weekly: 0, monthly: 0 };
    }
  }

  private categorizeStressLevel(spread: number): 'LOW' | 'MODERATE' | 'HIGH' | 'CRISIS' {
    if (spread < 300) return 'LOW';
    if (spread < 500) return 'MODERATE';
    if (spread < 800) return 'HIGH';
    return 'CRISIS';
  }

  private determineRegime(
    spread: number,
    velocity: SpreadVelocity
  ): 'QE_SUPPORTIVE' | 'NEUTRAL' | 'QT_STRESS' {
    // QE supportive: low spreads with improving trend
    if (spread < 400 && velocity.weekly <= 0) {
      return 'QE_SUPPORTIVE';
    }
    
    // QT stress: high spreads with deteriorating trend
    if (spread > 500 && velocity.weekly > 0) {
      return 'QT_STRESS';
    }
    
    return 'NEUTRAL';
  }
}

class TermStructureAnalyzer {
  private readonly NORMAL_HY_IG_RATIO = 3.0;
  private readonly RATIO_STD_DEV = 0.5;

  async analyzeTermStructure(hySpread: number, igSpread: number): Promise<TermStructure> {
    const ratio = hySpread / Math.max(igSpread, 50); // Prevent division by very small numbers
    const zScore = (ratio - this.NORMAL_HY_IG_RATIO) / this.RATIO_STD_DEV;
    
    // Determine curve shape based on ratio and historical context
    let shape: 'FLAT' | 'NORMAL' | 'INVERTED' | 'STEEPENING' | 'FLATTENING' = 'NORMAL';
    
    if (ratio < 1.5) {
      shape = 'INVERTED';
    } else if (ratio > 4.0) {
      shape = 'STEEPENING';
    } else if (Math.abs(zScore) < 0.5) {
      shape = 'FLAT';
    } else if (ratio < this.NORMAL_HY_IG_RATIO) {
      shape = 'FLATTENING';
    }

    return {
      hySpread,
      igSpread,
      ratio: Math.round(ratio * 100) / 100,
      shape,
      zScore: Math.round(zScore * 100) / 100
    };
  }
}

class DivergenceDetector {
  async detectDivergences(
    creditSpread: number,
    creditVelocity: SpreadVelocity
  ): Promise<DivergenceAnalysis> {
    // Simulate market metrics for analysis
    const creditDirection = Math.sign(creditVelocity.weekly);
    
    // Credit vs Equity (inverse relationship expected)
    const equityDirection = Math.random() > 0.5 ? 1 : -1;
    const creditVsEquity = this.analyzeDivergence(
      creditDirection, -equityDirection, 'Equity', 'INVERSE'
    );

    // Credit vs Rates (direct relationship expected)
    const ratesDirection = Math.random() > 0.5 ? 1 : -1;
    const creditVsRates = this.analyzeDivergence(
      creditDirection, ratesDirection, 'Rates', 'DIRECT'
    );

    // Credit vs Commodities (inverse relationship expected)
    const commoditiesDirection = Math.random() > 0.5 ? 1 : -1;
    const creditVsCommodities = this.analyzeDivergence(
      creditDirection, -commoditiesDirection, 'Commodities', 'INVERSE'
    );

    const alignmentScores = [
      creditVsEquity.aligned ? 1 : 0,
      creditVsRates.aligned ? 1 : 0,
      creditVsCommodities.aligned ? 1 : 0
    ];

    const overallAlignment = (alignmentScores.reduce((a, b) => a + b, 0) / 3) * 100;

    return {
      creditVsEquity,
      creditVsRates,
      creditVsCommodities,
      overallAlignment: Math.round(overallAlignment)
    };
  }

  private analyzeDivergence(
    creditDirection: number,
    expectedDirection: number,
    metricName: string,
    relationship: 'DIRECT' | 'INVERSE'
  ): DivergenceResult {
    const aligned = creditDirection === expectedDirection;
    const divergenceMagnitude = aligned ? 0.1 : 0.3;
    
    let significance: 'MINOR' | 'MODERATE' | 'MAJOR' = 'MINOR';
    if (divergenceMagnitude > 0.25) {
      significance = 'MODERATE';
    }
    if (divergenceMagnitude > 0.4) {
      significance = 'MAJOR';
    }

    return {
      aligned,
      divergenceMagnitude,
      significance,
      creditDirection,
      metricDirection: expectedDirection,
      message: aligned 
        ? `ALIGNED ✓` 
        : `${significance} DIVERGENCE ⚠`
    };
  }
}

class LeadingIndicatorAnalyzer {
  async analyzeLeadingIndicators(currentSpread: number): Promise<LeadingIndicators> {
    // Simulate CDS data
    const cdsSpread = currentSpread + (Math.random() * 20 - 10); // +/- 10bps from cash
    const basis = cdsSpread - currentSpread;

    // Simulate rating migration data
    const fallenAngelsValue = Math.random() * 20; // $0-20B
    const risingStarsValue = Math.random() * 15;  // $0-15B

    return {
      cdsIndex: {
        spread: Math.round(cdsSpread * 10) / 10,
        basis: Math.round(basis * 10) / 10,
        percentile: Math.round(Math.random() * 100),
        trend: basis > 0 ? 'RISK_AVERSION' : 'RISK_SEEKING'
      },
      fallenAngels: {
        value: Math.round(fallenAngelsValue * 10) / 10,
        count: Math.floor(Math.random() * 10) + 1,
        trend: 'STABLE'
      },
      risingStars: {
        value: Math.round(risingStarsValue * 10) / 10,
        count: Math.floor(Math.random() * 8) + 1,
        trend: 'INCREASING'
      },
      netMigration: Math.round((fallenAngelsValue - risingStarsValue) * 10) / 10,
      distressRatio: Math.round(Math.random() * 5 * 10) / 10 // 0-5%
    };
  }
}

// ============= MAIN ENGINE =============

export class CreditStressEngineV6 extends BaseEngine {
  readonly id = 'credit-stress-v6';
  readonly name = 'Credit Stress Engine V6';
  readonly priority = 1;
  readonly pillar = 2 as const;

  private calculator = new CreditSpreadCalculator();
  private termAnalyzer = new TermStructureAnalyzer();
  private divergenceDetector = new DivergenceDetector();
  private leadingAnalyzer = new LeadingIndicatorAnalyzer();

  private currentData: CreditSpreadResult | null = null;
  private termStructure: TermStructure | null = null;
  private divergences: DivergenceAnalysis | null = null;
  private leadingIndicators: LeadingIndicators | null = null;

  constructor() {
    super({
      refreshInterval: 30000,
      retryAttempts: 3,
      timeout: 15000,
      cacheTimeout: 60000
    });
    console.log('🚀 Credit Stress Engine V6 initialized');
  }

  protected async performExecution(): Promise<EngineReport> {
    console.log('⚡ Executing Credit Stress Engine V6...');
    
    try {
      // Calculate composite credit spread
      this.currentData = await this.calculator.calculateCompositeSpread();
      
      // Get component spreads for term structure analysis
      const hyComponent = this.currentData.components.find(c => 
        c.source.includes('High Yield') || c.source.includes('fallback')
      );
      const igComponent = this.currentData.components.find(c => 
        c.source.includes('Corporate') || c.source.includes('VIX')
      );

      if (hyComponent && igComponent) {
        this.termStructure = await this.termAnalyzer.analyzeTermStructure(
          hyComponent.value,
          igComponent.value
        );
      }

      // Analyze divergences
      this.divergences = await this.divergenceDetector.detectDivergences(
        this.currentData.composite,
        this.currentData.velocity
      );

      // Analyze leading indicators
      this.leadingIndicators = await this.leadingAnalyzer.analyzeLeadingIndicators(
        this.currentData.composite
      );

      return {
        success: true,
        confidence: this.currentData.confidence,
        signal: this.currentData.stressLevel === 'CRISIS' ? 'bearish' : 
               this.currentData.stressLevel === 'HIGH' ? 'bearish' : 'neutral',
        data: {
          creditSpread: this.currentData,
          termStructure: this.termStructure,
          divergences: this.divergences,
          leadingIndicators: this.leadingIndicators
        },
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('❌ Credit Stress Engine execution failed:', error);
      return {
        success: false,
        confidence: 0,
        signal: 'neutral',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        lastUpdated: new Date()
      };
    }
  }

  getDashboardData(): DashboardTileData {
    if (!this.currentData) {
      return {
        title: 'CREDIT STRESS V6',
        primaryMetric: '--',
        secondaryMetric: 'INITIALIZING',
        status: 'normal' as const,
        color: 'warning' as const,
        actionText: 'Loading credit stress data...'
      };
    }

    const trend = this.currentData.velocity.weekly > 2 ? 'DETERIORATING' :
                 this.currentData.velocity.weekly < -2 ? 'IMPROVING' : 'STABLE';

    const color = this.currentData.stressLevel === 'CRISIS' ? 'orange' :
                 this.currentData.stressLevel === 'HIGH' ? 'orange' :
                 this.currentData.stressLevel === 'MODERATE' ? 'gold' : 'lime';

    const status = this.currentData.stressLevel === 'CRISIS' ? 'critical' :
                  this.currentData.stressLevel === 'HIGH' ? 'warning' : 'normal';

    return {
      title: 'CREDIT STRESS V6',
      primaryMetric: `${Math.round(this.currentData.composite)}bps`,
      secondaryMetric: this.currentData.regime,
      status: status as any,
      color: color as any,
      trend: trend.toLowerCase() as any,
      actionText: this.generateInsight()
    };
  }

  getDetailedView(): DetailedEngineView {
    if (!this.currentData) {
      return {
        title: 'Credit Stress Engine V6',
        primarySection: {
          title: 'INITIALIZING',
          metrics: {
            'Status': 'Loading...'
          }
        },
        sections: []
      };
    }

    return {
      title: 'CREDIT STRESS ENGINE V6',
      primarySection: {
        title: 'CREDIT CONDITIONS',
        metrics: {
          'Current Spread': `${this.currentData.composite} bps`,
          'Stress Level': this.currentData.stressLevel,
          'Regime Signal': this.currentData.regime,
          'Confidence': `${this.currentData.confidence}%`
        }
      },
      sections: [
        {
          title: 'TERM STRUCTURE ANALYSIS',
          metrics: this.termStructure ? {
            'HY Spread': `${this.termStructure.hySpread} bps`,
            'IG Spread': `${this.termStructure.igSpread} bps`,
            'HY/IG Ratio': `${this.termStructure.ratio}x`,
            'Curve Shape': this.termStructure.shape
          } : {
            'Status': 'Calculating...'
          }
        },
        {
          title: 'DIVERGENCE ANALYSIS',
          metrics: this.divergences ? {
            'Credit vs Equity': this.divergences.creditVsEquity.message,
            'Credit vs Rates': this.divergences.creditVsRates.message,
            'Overall Alignment': `${this.divergences.overallAlignment}%`
          } : {
            'Status': 'Analyzing...'
          }
        },
        {
          title: 'LEADING INDICATORS',
          metrics: this.leadingIndicators ? {
            'CDS Index': `${this.leadingIndicators.cdsIndex.spread} bps`,
            'CDS Basis': `${this.leadingIndicators.cdsIndex.basis} bps`,
            'Fallen Angels': `$${this.leadingIndicators.fallenAngels.value}B`,
            'Rising Stars': `$${this.leadingIndicators.risingStars.value}B`,
            'Net Migration': `$${this.leadingIndicators.netMigration}B`
          } : {
            'Status': 'Loading...'
          }
        }
      ]
    };
  }

  getState() {
    return {
      currentData: this.currentData,
      termStructure: this.termStructure,
      divergences: this.divergences,
      leadingIndicators: this.leadingIndicators,
      lastUpdate: Date.now()
    };
  }

  subscribe(callback: (state: any) => void) {
    // Implement subscription logic if needed
    return () => {};
  }

  private generateInsight(): string {
    if (!this.currentData) {
      return 'Initializing credit stress monitoring...';
    }

    const { composite, stressLevel, regime, velocity } = this.currentData;
    
    if (stressLevel === 'CRISIS') {
      return `Credit crisis detected at ${Math.round(composite)}bps - immediate risk reduction required`;
    }
    
    if (stressLevel === 'HIGH') {
      return `Elevated credit stress at ${Math.round(composite)}bps - consider reducing exposure`;
    }
    
    if (regime === 'QE_SUPPORTIVE') {
      return `QE-supportive environment - spreads contained at ${Math.round(composite)}bps`;
    }
    
    if (velocity.weekly > 5) {
      return `Spreads widening rapidly +${velocity.weekly}bps/week - monitor closely`;
    }
    
    if (velocity.weekly < -5) {
      return `Credit conditions improving -${Math.abs(velocity.weekly)}bps/week`;
    }
    
    return `Credit spreads stable at ${Math.round(composite)}bps in ${regime.toLowerCase()} regime`;
  }

  getSingleActionableInsight(): ActionableInsight {
    if (!this.currentData) {
      return {
        actionText: 'WAIT for credit stress analysis initialization',
        signalStrength: 0,
        marketAction: 'WAIT',
        confidence: 'LOW',
        timeframe: 'IMMEDIATE'
      };
    }

    // Calculate signal strength based on stress level and divergences
    let signalStrength: number;
    switch (this.currentData.stressLevel) {
      case 'CRISIS':
        signalStrength = 95;
        break;
      case 'HIGH':
        signalStrength = 80;
        break;
      case 'MODERATE':
        signalStrength = 60;
        break;
      default:
        signalStrength = 30;
    }
    
    // Adjust for divergences and leading indicators
    if (this.divergences && this.divergences.overallAlignment < 50) {
      signalStrength += 15;
    }
    if (this.leadingIndicators && this.leadingIndicators.cdsIndex.trend === 'RISK_AVERSION') {
      signalStrength += 10;
    }
    
    signalStrength = Math.min(100, signalStrength);
    
    // Determine market action
    let marketAction: 'BUY' | 'SELL' | 'HOLD' | 'WAIT';
    if (this.currentData.stressLevel === 'CRISIS') {
      marketAction = 'SELL';
    } else if (this.currentData.stressLevel === 'HIGH') {
      marketAction = 'SELL';
    } else if (this.currentData.stressLevel === 'LOW' && this.currentData.regime === 'QE_SUPPORTIVE') {
      marketAction = 'BUY';
    } else {
      marketAction = 'HOLD';
    }
    
    // Determine confidence based on data quality and signal clarity
    const confidence: 'HIGH' | 'MED' | 'LOW' = 
      this.currentData.confidence > 85 && signalStrength > 70 ? 'HIGH' :
      this.currentData.confidence > 70 ? 'MED' : 'LOW';
    
    // Generate actionable text
    let actionText: string;
    const spread = this.currentData.composite;
    if (this.currentData.stressLevel === 'CRISIS') {
      actionText = `EMERGENCY RISK-OFF - Credit crisis at ${spread.toFixed(0)}bps, liquidate immediately`;
    } else if (this.currentData.stressLevel === 'HIGH') {
      actionText = `REDUCE CREDIT EXPOSURE - High stress at ${spread.toFixed(0)}bps, defensive positioning`;
    } else if (this.currentData.stressLevel === 'LOW') {
      actionText = `OPPORTUNISTIC CREDIT - Low stress at ${spread.toFixed(0)}bps, consider adding exposure`;
    } else {
      actionText = `MONITOR CREDIT CONDITIONS - Moderate stress at ${spread.toFixed(0)}bps, maintain allocation`;
    }
    
    return {
      actionText,
      signalStrength: Math.round(signalStrength),
      marketAction,
      confidence,
      timeframe: this.currentData.stressLevel === 'CRISIS' ? 'IMMEDIATE' : 'SHORT_TERM'
    };
  }
}