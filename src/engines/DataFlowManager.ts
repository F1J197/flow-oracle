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

  private async initializeEngines() {
    // Dynamic engine loading will be implemented per engine
    console.log('DataFlowManager: Initializing engines...');
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
    // For now, return mock instances
    // Real implementation will use dynamic imports
    return null;
  }

  private getMockMarketData(): Map<string, any> {
    const data = new Map<string, any>();
    
    // Mock real-time market data
    data.set('VIX', 18.5 + Math.random() * 5);
    data.set('VIX9D', 17.2 + Math.random() * 4);
    data.set('VVIX', 90 + Math.random() * 20);
    data.set('SPX', 4500 + Math.random() * 200);
    data.set('NDX', 15000 + Math.random() * 1000);
    data.set('BTCUSD', 45000 + Math.random() * 10000);
    data.set('DXY', 104 + Math.random() * 3);
    data.set('DGS10', 4.5 + Math.random() * 0.5);
    data.set('MOVE', 100 + Math.random() * 30);
    data.set('CVIX', 85 + Math.random() * 15);
    
    // Fed data
    data.set('WALCL', 7.5 + Math.random() * 0.5); // Trillions
    data.set('WTREGEN', 0.5 + Math.random() * 0.2);
    data.set('RRPONTSYD', 2.0 + Math.random() * 0.5);
    data.set('SOFR', 5.3 + Math.random() * 0.2);
    data.set('EFFR', 5.35 + Math.random() * 0.1);
    
    // Credit spreads
    data.set('BAMLH0A0HYM2', 350 + Math.random() * 100);
    data.set('BAMLC0A0CM', 120 + Math.random() * 30);
    
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
}

// Singleton instance
export const dataFlowManager = new DataFlowManager();