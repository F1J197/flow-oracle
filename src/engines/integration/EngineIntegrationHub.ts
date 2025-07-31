/**
 * Engine Integration Hub - Phase 2 Completion
 * Central coordination point for all engine interactions, data flow, and system integration
 */

import { BrowserEventEmitter } from '@/utils/BrowserEventEmitter';
import { UnifiedEngineRegistry } from '../base/UnifiedEngineRegistry';
import { UnifiedEngineOrchestrator } from '../base/UnifiedEngineOrchestrator';
import { EngineDataBridge } from './EngineDataBridge';
import ApplicationIntegrator from '@/services/ApplicationIntegrator';
import type { IEngine, EngineReport } from '@/types/engines';
import type { IndicatorValue } from '@/types/indicators';

export interface IntegrationConfig {
  enableDataFlow: boolean;
  enableRealtime: boolean;
  enableCascading: boolean;
  enableValidation: boolean;
  dataFlowTimeout: number;
  validationThreshold: number;
  cascadeDepth: number;
}

export interface EngineDataFlow {
  sourceEngineId: string;
  targetEngineId: string;
  dataType: string;
  transformFunction?: (data: any) => any;
  condition?: (sourceData: any) => boolean;
  priority: number;
}

export interface SystemHealthMetrics {
  overallHealth: number;
  dataFlowHealth: number;
  engineHealth: number;
  integrationHealth: number;
  lastHealthCheck: Date;
  unhealthyComponents: string[];
}

export interface EnginePerformanceMetrics {
  engineId: string;
  executionTime: number;
  successRate: number;
  confidence: number;
  dataQuality: number;
  lastExecution: Date;
  errorCount: number;
  trend: 'improving' | 'stable' | 'degrading';
}

export class EngineIntegrationHub extends BrowserEventEmitter {
  private static instance: EngineIntegrationHub;
  private config: IntegrationConfig;
  
  // Core components
  private registry: UnifiedEngineRegistry;
  private orchestrator: UnifiedEngineOrchestrator;
  private dataBridge: EngineDataBridge;
  private appIntegrator: ApplicationIntegrator;
  
  // Integration state
  private dataFlows = new Map<string, EngineDataFlow[]>();
  private engineStates = new Map<string, any>();
  private performanceMetrics = new Map<string, EnginePerformanceMetrics>();
  private lastHealthCheck: Date | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  
  // Data validation
  private validationRules = new Map<string, (data: any) => boolean>();
  private dataQualityScores = new Map<string, number>();

  constructor(config: Partial<IntegrationConfig> = {}) {
    super();
    
    this.config = {
      enableDataFlow: true,
      enableRealtime: true,
      enableCascading: true,
      enableValidation: true,
      dataFlowTimeout: 10000,
      validationThreshold: 0.8,
      cascadeDepth: 3,
      ...config
    };

    // Initialize core components
    this.registry = UnifiedEngineRegistry.getInstance();
    this.orchestrator = new UnifiedEngineOrchestrator();
    this.dataBridge = EngineDataBridge.getInstance();
    this.appIntegrator = ApplicationIntegrator.getInstance();

    this.setupIntegrations();
  }

  static getInstance(config?: Partial<IntegrationConfig>): EngineIntegrationHub {
    if (!EngineIntegrationHub.instance) {
      EngineIntegrationHub.instance = new EngineIntegrationHub(config);
    }
    return EngineIntegrationHub.instance;
  }

  async initialize(): Promise<void> {
    console.log('🔗 Initializing Engine Integration Hub...');

    try {
      // Initialize core components
      await this.initializeComponents();
      
      // Setup data flows
      await this.setupDataFlows();
      
      // Setup validation rules
      this.setupValidationRules();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      // Setup event listeners
      this.setupEventListeners();

      this.emit('integration:initialized', { timestamp: new Date() });
      console.log('✅ Engine Integration Hub initialized successfully');

    } catch (error) {
      console.error('❌ Engine Integration Hub initialization failed:', error);
      this.emit('integration:error', { error, timestamp: new Date() });
      throw error;
    }
  }

  /**
   * Register an engine with full integration
   */
  async registerEngine(engine: IEngine, options: {
    enableDataFlow?: boolean;
    enableValidation?: boolean;
    dependencies?: string[];
    dataOutputs?: string[];
    validationRules?: Array<(data: any) => boolean>;
  } = {}): Promise<void> {
    console.log(`🔧 Registering engine: ${engine.id}`);

    // Register with registry
    this.registry.register(engine, {
      id: engine.id,
      name: engine.name,
      pillar: engine.pillar,
      priority: engine.priority,
      category: engine.category,
      dependencies: options.dependencies || [],
      tags: ['integrated', 'v6']
    });

    // Register with orchestrator
    this.orchestrator.registerEngine(engine, {
      id: engine.id,
      name: engine.name,
      pillar: engine.pillar,
      priority: engine.priority,
      category: engine.category,
      dependencies: options.dependencies || []
    });

    // Setup data flows if enabled
    if (this.config.enableDataFlow && options.enableDataFlow !== false) {
      await this.setupDataFlowsForEngine(engine, options.dataOutputs || []);
    }

    // Setup validation rules
    if (this.config.enableValidation && options.validationRules) {
      this.validationRules.set(engine.id, (data: any) => {
        return options.validationRules!.every(rule => rule(data));
      });
    }

    // Initialize performance tracking
    this.initializeEngineMetrics(engine.id);

    this.emit('engine:registered', { engineId: engine.id, options });
  }

  /**
   * Execute engines with full integration and data flow
   */
  async executeIntegratedPipeline(): Promise<Map<string, EngineReport>> {
    console.log('🚀 Executing integrated engine pipeline...');

    const startTime = Date.now();
    this.emit('pipeline:started', { timestamp: new Date() });

    try {
      // Phase 1: Foundation engines
      const foundationResults = await this.executePhase('foundation');
      
      // Phase 2: Core engines (pillars 1-3)
      const coreResults = await this.executePhase('core');
      
      // Phase 3: Synthesis engines
      const synthesisResults = await this.executePhase('synthesis');
      
      // Phase 4: Execution engines
      const executionResults = await this.executePhase('execution');

      // Combine all results
      const allResults = new Map([
        ...foundationResults,
        ...coreResults,
        ...synthesisResults,
        ...executionResults
      ]);

      // Update performance metrics
      this.updatePipelineMetrics(allResults, Date.now() - startTime);

      // Validate overall system health
      const systemHealth = await this.calculateSystemHealth();
      
      this.emit('pipeline:completed', { 
        results: allResults,
        executionTime: Date.now() - startTime,
        systemHealth,
        timestamp: new Date()
      });

      console.log(`✅ Integrated pipeline completed: ${allResults.size} engines executed`);
      return allResults;

    } catch (error) {
      console.error('❌ Integrated pipeline execution failed:', error);
      this.emit('pipeline:error', { error, timestamp: new Date() });
      throw error;
    }
  }

  /**
   * Real-time data integration
   */
  async integrateRealtimeData(data: {
    source: string;
    indicatorId: string;
    value: IndicatorValue;
    timestamp: Date;
  }): Promise<void> {
    if (!this.config.enableRealtime) return;

    try {
      // Validate data quality
      const qualityScore = this.validateDataQuality(data);
      this.dataQualityScores.set(data.indicatorId, qualityScore);

      if (qualityScore < this.config.validationThreshold) {
        console.warn(`Low quality data for ${data.indicatorId}: ${qualityScore}`);
        this.emit('data:quality-warning', { ...data, qualityScore });
        return;
      }

      // Propagate to relevant engines
      const relevantEngines = this.findEnginesForData(data.indicatorId);
      
      for (const engineId of relevantEngines) {
        await this.propagateDataToEngine(engineId, data);
      }

      // Trigger cascading updates if enabled
      if (this.config.enableCascading) {
        await this.triggerCascadingUpdates(data);
      }

      this.emit('data:integrated', { ...data, qualityScore, affectedEngines: relevantEngines });

    } catch (error) {
      console.error(`Error integrating realtime data for ${data.indicatorId}:`, error);
      this.emit('data:integration-error', { ...data, error });
    }
  }

  /**
   * Get comprehensive system health metrics
   */
  async getSystemHealth(): Promise<SystemHealthMetrics> {
    const engineHealth = await this.calculateEngineHealth();
    const dataFlowHealth = await this.calculateDataFlowHealth();
    const integrationHealth = await this.calculateIntegrationHealth();
    
    const overallHealth = (engineHealth + dataFlowHealth + integrationHealth) / 3;
    
    const unhealthyComponents = [];
    if (engineHealth < 0.8) unhealthyComponents.push('engines');
    if (dataFlowHealth < 0.8) unhealthyComponents.push('data-flow');
    if (integrationHealth < 0.8) unhealthyComponents.push('integration');

    return {
      overallHealth,
      dataFlowHealth,
      engineHealth,
      integrationHealth,
      lastHealthCheck: this.lastHealthCheck || new Date(),
      unhealthyComponents
    };
  }

  /**
   * Get performance metrics for all engines
   */
  getEnginePerformanceMetrics(): Map<string, EnginePerformanceMetrics> {
    return new Map(this.performanceMetrics);
  }

  // === PRIVATE METHODS ===

  private setupIntegrations(): void {
    // Setup data bridge integration
    this.dataBridge.on('data:bridged', (data) => {
      this.integrateRealtimeData(data);
    });

    // Setup application integrator events
    this.appIntegrator.on('data:realtime', (data) => {
      this.integrateRealtimeData(data);
    });

    // Setup registry events
    this.registry.on('execution:success', (event) => {
      this.updateEngineMetrics(event.engineId, event.result, true);
    });

    this.registry.on('execution:error', (event) => {
      this.updateEngineMetrics(event.engineId, null, false);
    });
  }

  private async initializeComponents(): Promise<void> {
    // Initialize application integrator if not already done
    if (!this.appIntegrator.getSystemStatus().dataOrchestrator) {
      await this.appIntegrator.initialize();
    }
  }

  private async setupDataFlows(): Promise<void> {
    // Define standard data flows between engines
    const standardFlows: EngineDataFlow[] = [
      // Foundation → Core flows
      {
        sourceEngineId: 'data-integrity',
        targetEngineId: 'zscore',
        dataType: 'validation-status',
        priority: 10
      },
      {
        sourceEngineId: 'zscore',
        targetEngineId: 'net-liquidity',
        dataType: 'zscore-metrics',
        priority: 9
      },
      // Core → Synthesis flows
      {
        sourceEngineId: 'net-liquidity',
        targetEngineId: 'market-regime',
        dataType: 'liquidity-state',
        priority: 8
      }
    ];

    for (const flow of standardFlows) {
      this.addDataFlow(flow);
    }
  }

  private setupValidationRules(): void {
    // Standard validation rules
    this.validationRules.set('default', (data: any) => {
      return data && 
             typeof data === 'object' && 
             data.timestamp && 
             data.value !== undefined &&
             data.value !== null;
    });

    this.validationRules.set('numeric', (data: any) => {
      return typeof data.value === 'number' && 
             !isNaN(data.value) && 
             isFinite(data.value);
    });
  }

  private setupEventListeners(): void {
    // Engine state changes
    this.on('engine:state-changed', (event) => {
      this.engineStates.set(event.engineId, event.state);
    });

    // System health warnings
    this.on('health:warning', (event) => {
      console.warn('System health warning:', event);
    });
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.getSystemHealth();
        this.lastHealthCheck = new Date();
        
        if (health.overallHealth < 0.7) {
          this.emit('health:critical', health);
        } else if (health.overallHealth < 0.8) {
          this.emit('health:warning', health);
        }
        
        this.emit('health:updated', health);
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 30000); // Every 30 seconds
  }

  private async executePhase(category: 'foundation' | 'core' | 'synthesis' | 'execution'): Promise<Map<string, EngineReport>> {
    console.log(`📊 Executing ${category} phase...`);
    
    try {
      const results = await this.orchestrator.executeAll({ category, parallel: true });
      
      // Process data flows for this phase
      if (this.config.enableDataFlow) {
        await this.processPhaseDataFlows(category, results);
      }
      
      return results;
    } catch (error) {
      console.error(`${category} phase execution failed:`, error);
      throw error;
    }
  }

  private async processPhaseDataFlows(phase: string, results: Map<string, EngineReport>): Promise<void> {
    for (const [engineId, result] of results) {
      const flows = this.dataFlows.get(engineId) || [];
      
      for (const flow of flows) {
        try {
          await this.executeDataFlow(flow, result);
        } catch (error) {
          console.error(`Data flow execution failed: ${flow.sourceEngineId} → ${flow.targetEngineId}`, error);
        }
      }
    }
  }

  private async executeDataFlow(flow: EngineDataFlow, sourceData: any): Promise<void> {
    if (flow.condition && !flow.condition(sourceData)) {
      return; // Condition not met
    }

    let transformedData = sourceData;
    if (flow.transformFunction) {
      transformedData = flow.transformFunction(sourceData);
    }

    // Propagate data to target engine
    await this.propagateDataToEngine(flow.targetEngineId, transformedData);
  }

  private async propagateDataToEngine(engineId: string, data: any): Promise<void> {
    const engine = this.registry.getEngine(engineId);
    if (!engine) {
      console.warn(`Engine ${engineId} not found for data propagation`);
      return;
    }

    // If engine supports data injection, use it
    if ('injectData' in engine && typeof engine.injectData === 'function') {
      await (engine as any).injectData(data);
    }

    this.emit('data:propagated', { engineId, data });
  }

  private findEnginesForData(indicatorId: string): string[] {
    // Logic to determine which engines need this data
    const relevantEngines: string[] = [];
    
    for (const metadata of this.registry.getAllMetadata()) {
      // Check if engine is interested in this data type
      if (this.isEngineInterestedInData(metadata.id, indicatorId)) {
        relevantEngines.push(metadata.id);
      }
    }
    
    return relevantEngines;
  }

  private isEngineInterestedInData(engineId: string, indicatorId: string): boolean {
    // Simple logic - could be enhanced with configuration
    if (indicatorId.includes('WALCL') && engineId.includes('liquidity')) return true;
    if (indicatorId.includes('BTC') && engineId.includes('crypto')) return true;
    if (indicatorId.includes('DGS') && engineId.includes('credit')) return true;
    
    return false;
  }

  private validateDataQuality(data: any): number {
    let score = 1.0;
    
    // Check data freshness
    const age = Date.now() - new Date(data.timestamp).getTime();
    if (age > 60000) score -= 0.2; // Older than 1 minute
    if (age > 300000) score -= 0.3; // Older than 5 minutes
    
    // Check data validity
    const validator = this.validationRules.get(data.source) || this.validationRules.get('default');
    if (validator && !validator(data)) {
      score -= 0.4;
    }
    
    // Check value range (basic)
    if (typeof data.value.current === 'number') {
      if (Math.abs(data.value.current) > 1e10) score -= 0.2; // Suspiciously large
      if (data.value.current === 0) score -= 0.1; // Zero values are suspicious
    }
    
    return Math.max(0, score);
  }

  private async triggerCascadingUpdates(data: any): Promise<void> {
    // Implement cascading update logic
    const dependentEngines = this.findDependentEngines(data.indicatorId);
    
    for (const engineId of dependentEngines) {
      try {
        await this.registry.executeEngine(engineId);
      } catch (error) {
        console.error(`Cascading update failed for engine ${engineId}:`, error);
      }
    }
  }

  private findDependentEngines(indicatorId: string): string[] {
    // Find engines that depend on this data
    return Array.from(this.dataFlows.entries())
      .filter(([_, flows]) => flows.some(flow => flow.dataType.includes(indicatorId)))
      .map(([engineId]) => engineId);
  }

  private addDataFlow(flow: EngineDataFlow): void {
    const flows = this.dataFlows.get(flow.sourceEngineId) || [];
    flows.push(flow);
    flows.sort((a, b) => b.priority - a.priority);
    this.dataFlows.set(flow.sourceEngineId, flows);
  }

  private initializeEngineMetrics(engineId: string): void {
    this.performanceMetrics.set(engineId, {
      engineId,
      executionTime: 0,
      successRate: 100,
      confidence: 0,
      dataQuality: 1,
      lastExecution: new Date(),
      errorCount: 0,
      trend: 'stable'
    });
  }

  private updateEngineMetrics(engineId: string, result: any, success: boolean): void {
    const metrics = this.performanceMetrics.get(engineId);
    if (!metrics) return;

    metrics.lastExecution = new Date();
    
    if (success && result) {
      metrics.confidence = result.confidence || 0;
      metrics.successRate = Math.min(100, metrics.successRate + 1);
      if (metrics.errorCount > 0) metrics.errorCount--;
    } else {
      metrics.errorCount++;
      metrics.successRate = Math.max(0, metrics.successRate - 5);
    }

    // Update trend
    if (metrics.successRate > 90) metrics.trend = 'improving';
    else if (metrics.successRate < 70) metrics.trend = 'degrading';
    else metrics.trend = 'stable';

    this.performanceMetrics.set(engineId, metrics);
  }

  private updatePipelineMetrics(results: Map<string, EngineReport>, executionTime: number): void {
    // Update overall pipeline metrics
    this.emit('metrics:pipeline-updated', {
      totalEngines: results.size,
      successfulEngines: Array.from(results.values()).filter(r => r.success).length,
      executionTime,
      timestamp: new Date()
    });
  }

  private async calculateEngineHealth(): Promise<number> {
    const metrics = Array.from(this.performanceMetrics.values());
    if (metrics.length === 0) return 1;
    
    const avgSuccessRate = metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length;
    return avgSuccessRate / 100;
  }

  private async calculateDataFlowHealth(): Promise<number> {
    // Calculate based on data flow success rates
    return 0.9; // Placeholder
  }

  private async calculateIntegrationHealth(): Promise<number> {
    // Calculate based on integration component health
    return 0.95; // Placeholder
  }

  private async setupDataFlowsForEngine(engine: IEngine, dataOutputs: string[]): Promise<void> {
    // Setup specific data flows for this engine
    for (const output of dataOutputs) {
      const flow: EngineDataFlow = {
        sourceEngineId: engine.id,
        targetEngineId: `target-for-${output}`,
        dataType: output,
        priority: engine.priority
      };
      this.addDataFlow(flow);
    }
  }

  private async calculateSystemHealth(): Promise<SystemHealthMetrics> {
    return await this.getSystemHealth();
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Engine Integration Hub...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.removeAllListeners();
    this.dataFlows.clear();
    this.engineStates.clear();
    this.performanceMetrics.clear();

    this.emit('integration:shutdown', { timestamp: new Date() });
    console.log('✅ Engine Integration Hub shutdown complete');
  }
}

export default EngineIntegrationHub;