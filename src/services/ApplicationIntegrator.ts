/**
 * Application Integrator - Central hub for connecting DataOrchestrator with the application
 * Manages initialization flow, dashboard integration, and system coordination
 */

import { BrowserEventEmitter } from '@/utils/BrowserEventEmitter';
import DataOrchestrator from './DataOrchestrator';
import WebSocketOrchestrator from './WebSocketOrchestrator';
import { EngineRegistry } from '@/engines/EngineRegistry';
import { UnifiedEngineRegistry } from '@/engines/base/UnifiedEngineRegistry';
import { IndicatorValue } from '@/types/indicators';

export interface ApplicationIntegratorConfig {
  enableDataOrchestrator: boolean;
  enableWebSocketOrchestrator: boolean;
  enableEngineIntegration: boolean;
  enableRealTimeUpdates: boolean;
  initializationTimeout: number;
  dashboardRefreshInterval: number;
}

export interface SystemStatus {
  dataOrchestrator: 'initializing' | 'ready' | 'error' | 'disabled';
  webSocketOrchestrator: 'initializing' | 'ready' | 'error' | 'disabled';
  engineRegistry: 'initializing' | 'ready' | 'error' | 'disabled';
  lastUpdate: Date | null;
  errorCount: number;
  uptime: number;
}

export interface DataUpdate {
  provider: string;
  symbol: string;
  value: IndicatorValue;
  timestamp: Date;
  source: 'websocket' | 'api' | 'cache';
}

export class ApplicationIntegrator extends BrowserEventEmitter {
  private static instance: ApplicationIntegrator | null = null;
  private config: ApplicationIntegratorConfig;
  
  // Core services
  private dataOrchestrator: DataOrchestrator | null = null;
  private webSocketOrchestrator: WebSocketOrchestrator | null = null;
  private engineRegistry: EngineRegistry;
  private unifiedEngineRegistry: UnifiedEngineRegistry;
  
  // State management
  private systemStatus: SystemStatus;
  private isInitialized = false;
  private startTime = Date.now();
  private dashboardRefreshInterval: NodeJS.Timeout | null = null;
  private dataBuffer = new Map<string, DataUpdate>();

  constructor(config: Partial<ApplicationIntegratorConfig> = {}) {
    super();
    
    this.config = {
      enableDataOrchestrator: true,
      enableWebSocketOrchestrator: true,
      enableEngineIntegration: true,
      enableRealTimeUpdates: true,
      initializationTimeout: 30000, // 30 seconds
      dashboardRefreshInterval: 1000, // 1 second
      ...config
    };

    this.systemStatus = {
      dataOrchestrator: this.config.enableDataOrchestrator ? 'initializing' : 'disabled',
      webSocketOrchestrator: this.config.enableWebSocketOrchestrator ? 'initializing' : 'disabled',
      engineRegistry: this.config.enableEngineIntegration ? 'initializing' : 'disabled',
      lastUpdate: null,
      errorCount: 0,
      uptime: 0
    };

    this.engineRegistry = EngineRegistry.getInstance();
    this.unifiedEngineRegistry = UnifiedEngineRegistry.getInstance();
  }

  static getInstance(config?: Partial<ApplicationIntegratorConfig>): ApplicationIntegrator {
    if (!ApplicationIntegrator.instance) {
      ApplicationIntegrator.instance = new ApplicationIntegrator(config);
    }
    return ApplicationIntegrator.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('ApplicationIntegrator already initialized');
      return;
    }

    console.log('🚀 Initializing Application Integrator...');
    this.emit('initialization:started', { timestamp: new Date() });

    try {
      // Set initialization timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Initialization timeout')), this.config.initializationTimeout);
      });

      const initPromise = this.performInitialization();
      await Promise.race([initPromise, timeoutPromise]);

      this.isInitialized = true;
      this.startDashboardUpdates();
      
      this.emit('initialization:completed', { 
        status: this.systemStatus,
        timestamp: new Date() 
      });
      
      console.log('✅ Application Integrator initialized successfully');
    } catch (error) {
      console.error('❌ Application Integrator initialization failed:', error);
      this.systemStatus.errorCount++;
      
      this.emit('initialization:failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date() 
      });
      
      throw error;
    }
  }

  private async performInitialization(): Promise<void> {
    const initSteps: Array<() => Promise<void>> = [];

    // Initialize DataOrchestrator
    if (this.config.enableDataOrchestrator) {
      initSteps.push(async () => {
        try {
          this.dataOrchestrator = DataOrchestrator.getInstance();
          await this.dataOrchestrator.initialize();
          this.setupDataOrchestratorListeners();
          this.systemStatus.dataOrchestrator = 'ready';
          console.log('✅ DataOrchestrator ready');
        } catch (error) {
          this.systemStatus.dataOrchestrator = 'error';
          console.error('❌ DataOrchestrator initialization failed:', error);
          throw error;
        }
      });
    }

    // Initialize WebSocketOrchestrator
    if (this.config.enableWebSocketOrchestrator) {
      initSteps.push(async () => {
        try {
          this.webSocketOrchestrator = WebSocketOrchestrator.getInstance();
          await this.webSocketOrchestrator.initialize();
          this.setupWebSocketOrchestratorListeners();
          this.systemStatus.webSocketOrchestrator = 'ready';
          console.log('✅ WebSocketOrchestrator ready');
        } catch (error) {
          this.systemStatus.webSocketOrchestrator = 'error';
          console.error('❌ WebSocketOrchestrator initialization failed:', error);
          throw error;
        }
      });
    }

    // Initialize Engine Integration
    if (this.config.enableEngineIntegration) {
      initSteps.push(async () => {
        try {
          this.setupEngineIntegration();
          this.systemStatus.engineRegistry = 'ready';
          console.log('✅ Engine Integration ready');
        } catch (error) {
          this.systemStatus.engineRegistry = 'error';
          console.error('❌ Engine Integration failed:', error);
          throw error;
        }
      });
    }

    // Execute all initialization steps
    await Promise.all(initSteps.map(step => step()));
  }

  private setupDataOrchestratorListeners(): void {
    if (!this.dataOrchestrator) return;

    this.dataOrchestrator.on('data:update', (data: DataUpdate) => {
      this.handleDataUpdate({ ...data, source: 'api' });
    });

    this.dataOrchestrator.on('error', (error) => {
      this.systemStatus.errorCount++;
      this.emit('system:error', { component: 'DataOrchestrator', error, timestamp: new Date() });
    });

    this.dataOrchestrator.on('provider:error', (error) => {
      this.emit('provider:error', error);
    });
  }

  private setupWebSocketOrchestratorListeners(): void {
    if (!this.webSocketOrchestrator) return;

    this.webSocketOrchestrator.on('data:update', (data: DataUpdate) => {
      this.handleDataUpdate({ ...data, source: 'websocket' });
    });

    this.webSocketOrchestrator.on('connection:status', (status) => {
      this.emit('websocket:status', status);
    });

    this.webSocketOrchestrator.on('error', (error) => {
      this.systemStatus.errorCount++;
      this.emit('system:error', { component: 'WebSocketOrchestrator', error, timestamp: new Date() });
    });
  }

  private setupEngineIntegration(): void {
    // Bridge data updates to engines
    this.on('data:processed', (data: DataUpdate) => {
      // Notify engines of new data
      this.engineRegistry.getAllMetadata().forEach(engine => {
        this.emit('engine:data-available', {
          engineId: engine.id,
          data,
          timestamp: new Date()
        });
      });
    });

    // Listen for engine execution results
    this.engineRegistry.subscribe('*', (result) => {
      this.emit('engine:result', result);
    });
  }

  private handleDataUpdate(data: DataUpdate): void {
    // Buffer data for efficient processing
    const key = `${data.provider}:${data.symbol}`;
    this.dataBuffer.set(key, data);
    
    this.systemStatus.lastUpdate = new Date();

    // Emit immediate update for real-time components
    if (this.config.enableRealTimeUpdates) {
      this.emit('data:realtime', data);
    }
  }

  private startDashboardUpdates(): void {
    this.dashboardRefreshInterval = setInterval(() => {
      this.updateSystemStatus();
      this.processPendingData();
      this.emit('dashboard:refresh', {
        status: this.systemStatus,
        pendingUpdates: this.dataBuffer.size,
        timestamp: new Date()
      });
    }, this.config.dashboardRefreshInterval);
  }

  private updateSystemStatus(): void {
    this.systemStatus.uptime = Date.now() - this.startTime;
  }

  private processPendingData(): void {
    if (this.dataBuffer.size > 0) {
      const updates = Array.from(this.dataBuffer.values());
      this.dataBuffer.clear();

      // Batch process updates
      this.emit('data:batch', {
        updates,
        count: updates.length,
        timestamp: new Date()
      });

      // Process individual updates
      updates.forEach(update => {
        this.emit('data:processed', update);
      });
    }
  }

  // Public API methods
  getSystemStatus(): SystemStatus {
    this.updateSystemStatus();
    return { ...this.systemStatus };
  }

  getDataOrchestratorStatus() {
    return this.dataOrchestrator?.getStatus() || null;
  }

  getWebSocketStatus() {
    return this.webSocketOrchestrator?.getHealthStatus() || null;
  }

  async refreshData(): Promise<void> {
    if (this.dataOrchestrator) {
      await this.dataOrchestrator.refreshProvider('fred');
      await this.dataOrchestrator.refreshProvider('binance');
    }
  }

  async executeEngines(): Promise<void> {
    if (this.config.enableEngineIntegration) {
      await this.engineRegistry.executeAll();
    }
  }

  // Dashboard integration methods
  subscribeToRealtimeUpdates(callback: (data: DataUpdate) => void): () => void {
    this.on('data:realtime', callback);
    return () => this.off('data:realtime', callback);
  }

  subscribeToBatchUpdates(callback: (updates: { updates: DataUpdate[]; count: number; timestamp: Date }) => void): () => void {
    this.on('data:batch', callback);
    return () => this.off('data:batch', callback);
  }

  subscribeToSystemStatus(callback: (status: SystemStatus) => void): () => void {
    const handler = (data: { status: SystemStatus }) => {
      callback(data.status);
    };
    this.on('dashboard:refresh', handler);
    return () => this.off('dashboard:refresh', handler);
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Application Integrator...');
    
    if (this.dashboardRefreshInterval) {
      clearInterval(this.dashboardRefreshInterval);
    }

    if (this.dataOrchestrator) {
      await this.dataOrchestrator.shutdown();
    }

    if (this.webSocketOrchestrator) {
      await this.webSocketOrchestrator.shutdown();
    }

    this.dataBuffer.clear();
    this.isInitialized = false;

    this.emit('shutdown', { timestamp: new Date() });
    console.log('✅ Application Integrator shutdown complete');
  }
}

export default ApplicationIntegrator;