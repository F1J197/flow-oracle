/**
 * Data Flow Manager - Orchestrates engine execution
 * Handles dependency resolution and real-time updates
 */

import { BaseEngine, EngineOutput } from './BaseEngine';
import { ENGINE_EXECUTION_ORDER, ENGINE_REGISTRY } from '@/config/engine.registry';

export interface DataFlowState {
  engineOutputs: Map<string, EngineOutput>;
  engineInstances: Map<string, BaseEngine>;
  lastUpdate: Map<string, number>;
  isRunning: boolean;
}

export class DataFlowManager {
  private static instance: DataFlowManager | null = null;

  private state: DataFlowState = {
    engineOutputs: new Map(),
    engineInstances: new Map(),
    lastUpdate: new Map(),
    isRunning: false
  };

  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeEngines();
  }

  static getInstance(): DataFlowManager {
    if (!DataFlowManager.instance) {
      DataFlowManager.instance = new DataFlowManager();
    }
    return DataFlowManager.instance;
  }

  private async initializeEngines() {
    console.log('DataFlowManager: Initializing engines...');
    
    // Load all 28 engines as specified in the registry
    const availableEngines = Object.keys(ENGINE_REGISTRY);
    
    for (const engineId of availableEngines) {
      try {
        const engineModule = await this.loadEngine(engineId);
        if (engineModule) {
          this.state.engineInstances.set(engineId, engineModule);
          console.log(`✅ Loaded engine: ${engineId}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to load engine ${engineId}:`, error);
      }
    }
  }
  
  private async loadEngine(engineId: string): Promise<BaseEngine | null> {
    try {
      // Foundation Layer
      switch (engineId) {
        case 'enhanced-momentum': {
          const { EnhancedMomentumEngine } = await import('@/engines/foundation/EnhancedMomentumEngine');
          return new EnhancedMomentumEngine();
        }
        case 'volatility-regime': {
          const { VolatilityRegimeEngine } = await import('@/engines/foundation/VolatilityRegimeEngine');
          return new VolatilityRegimeEngine();
        }
        case 'enhanced-zscore': {
          const { ZScoreEngine } = await import('@/engines/foundation/ZScoreEngine');
          return new ZScoreEngine();
        }
        case 'data-integrity': {
          const { DataIntegrityEngine } = await import('@/engines/foundation/DataIntegrityEngine');
          return new DataIntegrityEngine();
        }

        // Liquidity Engines
        case 'net-liquidity': {
          const { NetLiquidityEngine } = await import('@/engines/liquidity/NetLiquidityEngine');
          return new NetLiquidityEngine();
        }
        case 'credit-stress': {
          const { CreditStressEngine } = await import('@/engines/liquidity/CreditStressEngine');
          return new CreditStressEngine();
        }
        case 'fed-balance-sheet': {
          const { FedBalanceSheetEngine } = await import('@/engines/liquidity/FedBalanceSheetEngine');
          return new FedBalanceSheetEngine();
        }
        case 'funding-stress': {
          const { FundingStressEngine } = await import('@/engines/liquidity/FundingStressEngine');
          return new FundingStressEngine();
        }
        case 'global-financial-plumbing': {
          const { GlobalFinancialPlumbingEngine } = await import('@/engines/liquidity/GlobalFinancialPlumbingEngine');
          return new GlobalFinancialPlumbingEngine();
        }

        // Systemic Risk Engines
        case 'tail-risk': {
          const { TailRiskEngine } = await import('@/engines/systemic/TailRiskEngine');
          return new TailRiskEngine();
        }
        case 'market-regime': {
          const { MarketRegimeEngine } = await import('@/engines/systemic/MarketRegimeEngine');
          return new MarketRegimeEngine();
        }

        // Economic Context Engines
        case 'business-cycle': {
          const { BusinessCycleEngine } = await import('@/engines/economic/BusinessCycleEngine');
          return new BusinessCycleEngine();
        }

        // Advanced Engines
        case 'cusip-detection': {
          const { CUSIPDetectionEngine } = await import('@/engines/advanced/CUSIPDetectionEngine');
          return new CUSIPDetectionEngine();
        }
        case 'market-microstructure': {
          const { MarketMicrostructureEngine } = await import('@/engines/advanced/MarketMicrostructureEngine');
          return new MarketMicrostructureEngine();
        }
        case 'multi-central-bank': {
          const { MultiCentralBankEngine } = await import('@/engines/advanced/MultiCentralBankEngine');
          return new MultiCentralBankEngine();
        }
        case 'on-chain-analytics': {
          const { OnChainAnalyticsEngine } = await import('@/engines/advanced/OnChainAnalyticsEngine');
          return new OnChainAnalyticsEngine();
        }

        // Synthesis Engines
        case 'signal-aggregator': {
          const { SignalAggregatorEngine } = await import('@/engines/synthesis/SignalAggregatorEngine');
          return new SignalAggregatorEngine();
        }
        case 'master-control': {
          const { MasterControlEngine } = await import('@/engines/synthesis/MasterControlEngine');
          return new MasterControlEngine();
        }
        case 'performance-attribution': {
          const { PerformanceAttributionEngine } = await import('@/engines/synthesis/PerformanceAttributionEngine');
          return new PerformanceAttributionEngine();
        }
        case 'regime-classifier': {
          const { RegimeClassifierEngine } = await import('@/engines/synthesis/RegimeClassifierEngine');
          return new RegimeClassifierEngine();
        }
        case 'alert-engine': {
          const { AlertEngine } = await import('@/engines/synthesis/AlertEngine');
          return new AlertEngine();
        }

        default:
          console.warn(`Engine ${engineId} not found in loadEngine switch`);
          return null;
      }
    } catch (error) {
      console.error(`Failed to load engine ${engineId}:`, error);
      return null;
    }
  }

  async start() {
    if (this.state.isRunning) return;
    
    this.state.isRunning = true;
    console.log('DataFlowManager: Starting engine execution cycle');
    
    // Start the update cycle
    this.updateInterval = setInterval(() => {
      this.executeEngines();
    }, 60000); // Base 1-minute cycle
    
    // Initial execution
    await this.executeEngines();
  }

  stop() {
    this.state.isRunning = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    console.log('DataFlowManager: Stopped');
  }

  private async executeEngines() {
    if (!this.state.isRunning) return;

    // Mock market data for now
    const marketData = this.getMockMarketData();
    
    try {
      // Execute engines in dependency order
      for (const tier of ENGINE_EXECUTION_ORDER) {
        await Promise.all(
          tier.map(engineId => this.executeEngine(engineId, marketData))
        );
      }
      
      console.log('DataFlowManager: Engine cycle completed');
    } catch (error) {
      console.error('DataFlowManager: Execution error:', error);
    }
  }

  private async executeEngine(engineId: string, marketData: Map<string, any>) {
    const config = ENGINE_REGISTRY[engineId];
    if (!config) return;

    // Check if engine needs update based on interval
    const lastUpdate = this.state.lastUpdate.get(engineId) || 0;
    const now = Date.now();
    
    if (now - lastUpdate < config.updateInterval) {
      return; // Skip this update
    }

    try {
      // Get engine instance (dynamic loading will be implemented)
      const engine = this.getEngineInstance(engineId);
      if (!engine) return;

      // Inject dependency outputs
      const enrichedData = new Map(marketData);
      if (config.dependencies) {
        config.dependencies.forEach(depId => {
          const depOutput = this.state.engineOutputs.get(depId);
          if (depOutput) {
            enrichedData.set(`ENGINE_${depId}`, depOutput);
          }
        });
      }

      // Validate data
      if (!engine.validateData(enrichedData)) {
        console.warn(`Engine ${engineId}: Data validation failed`);
        return;
      }

      // Execute calculation
      const output = engine.calculate(enrichedData);
      
      // Store result
      this.state.engineOutputs.set(engineId, output);
      this.state.lastUpdate.set(engineId, now);
      
      console.log(`Engine ${engineId}: Updated successfully`);
      
    } catch (error) {
      console.error(`Engine ${engineId}: Execution failed:`, error);
    }
  }

  private getEngineInstance(engineId: string): BaseEngine | null {
    return this.state.engineInstances.get(engineId) || null;
  }

  private getMockMarketData(): Map<string, any> {
    const data = new Map<string, any>();
    
    // Generate historical data arrays for momentum calculations
    const generateTimeSeries = (baseValue: number, volatility: number, length: number = 200) => {
      const series = [];
      let current = baseValue;
      for (let i = 0; i < length; i++) {
        current += (Math.random() - 0.5) * volatility;
        series.push({
          value: current,
          timestamp: Date.now() - (length - i) * 60000 // 1 minute intervals
        });
      }
      return series;
    };
    
    // Mock real-time market data with historical series
    data.set('VIX', generateTimeSeries(18.5, 1.5));
    data.set('VIX9D', generateTimeSeries(17.2, 1.2));
    data.set('VVIX', generateTimeSeries(90, 8));
    data.set('SPX', generateTimeSeries(4500, 50));
    data.set('NDX', generateTimeSeries(15000, 200));
    data.set('BTCUSD', generateTimeSeries(45000, 2000));
    data.set('DXY', generateTimeSeries(104, 0.8));
    data.set('DGS10', generateTimeSeries(4.5, 0.1));
    data.set('MOVE', generateTimeSeries(100, 8));
    data.set('CVIX', generateTimeSeries(85, 5));
    
    // Fed data
    data.set('WALCL', generateTimeSeries(7.5, 0.05));
    data.set('WTREGEN', generateTimeSeries(0.5, 0.02));
    data.set('RRPONTSYD', generateTimeSeries(2.0, 0.1));
    data.set('SOFR', generateTimeSeries(5.3, 0.05));
    data.set('EFFR', generateTimeSeries(5.35, 0.02));
    
    // Credit spreads
    data.set('BAMLH0A0HYM2', generateTimeSeries(350, 20));
    data.set('BAMLC0A0CM', generateTimeSeries(120, 8));
    
    // Additional indicators for momentum engine validation
    data.set('GOLD', generateTimeSeries(2000, 50));
    data.set('OIL_WTI', generateTimeSeries(80, 5));
    data.set('EURUSD', generateTimeSeries(1.08, 0.02));
    data.set('GBPUSD', generateTimeSeries(1.25, 0.03));
    data.set('USDJPY', generateTimeSeries(150, 3));
    data.set('USDCAD', generateTimeSeries(1.35, 0.02));
    data.set('AUDUSD', generateTimeSeries(0.67, 0.02));
    data.set('NZDUSD', generateTimeSeries(0.62, 0.02));
    data.set('EURGBP', generateTimeSeries(0.86, 0.01));
    data.set('EURCHF', generateTimeSeries(0.97, 0.01));
    data.set('USDCHF', generateTimeSeries(0.90, 0.02));
    data.set('TLT', generateTimeSeries(95, 3));
    data.set('HYG', generateTimeSeries(78, 2));
    data.set('LQD', generateTimeSeries(110, 1.5));
    data.set('GLD', generateTimeSeries(180, 5));
    data.set('QQQ', generateTimeSeries(380, 15));
    data.set('IWM', generateTimeSeries(190, 8));
    data.set('EEM', generateTimeSeries(40, 2));
    data.set('VTI', generateTimeSeries(240, 8));
    data.set('ARKK', generateTimeSeries(45, 5));
    data.set('TSLA', generateTimeSeries(240, 20));
    
    return data;
  }

  // Public getters
  getEngineOutput(engineId: string): EngineOutput | undefined {
    return this.state.engineOutputs.get(engineId);
  }

  getAllEngineOutputs(): Map<string, EngineOutput> {
    return new Map(this.state.engineOutputs);
  }

  getEngineLastUpdate(engineId: string): number | undefined {
    return this.state.lastUpdate.get(engineId);
  }

  isEngineRunning(): boolean {
    return this.state.isRunning;
  }

  getRegisteredEngines(): Array<{ id: string; name: string }> {
    const availableEngines = [
      'enhanced-momentum',
      'volatility-regime', 
      'net-liquidity',
      'credit-stress',
      'signal-aggregator',
      'tail-risk',
      'enhanced-zscore',
      'data-integrity'
    ];

    return availableEngines.map(id => ({
      id,
      name: this.getEngineDisplayName(id)
    }));
  }

  private getEngineDisplayName(engineId: string): string {
    const nameMapping: Record<string, string> = {
      'enhanced-momentum': 'Enhanced Momentum',
      'volatility-regime': 'Volatility Regime',
      'net-liquidity': 'Net Liquidity',
      'credit-stress': 'Credit Stress',
      'signal-aggregator': 'Signal Aggregator',
      'tail-risk': 'Tail Risk',
      'enhanced-zscore': 'Enhanced Z-Score',
      'data-integrity': 'Data Integrity'
    };
    return nameMapping[engineId] || engineId;
  }
}

// Singleton instance
export const dataFlowManager = new DataFlowManager();