/**
 * Production System Monitor - Phase 7 Completion
 * Comprehensive system monitoring, alerting, and production readiness
 */

import { BrowserEventEmitter } from '@/utils/BrowserEventEmitter';
import { UnifiedEngineRegistry } from '@/engines/base/UnifiedEngineRegistry';
import EngineIntegrationHub from '@/engines/integration/EngineIntegrationHub';
import DataManagementLayer from './DataManagementLayer';
import ApplicationIntegrator from './ApplicationIntegrator';

export interface ProductionConfig {
  enableHealthChecks: boolean;
  enablePerformanceMonitoring: boolean;
  enableAlerting: boolean;
  enableAutoRecovery: boolean;
  healthCheckInterval: number;
  performanceThreshold: number;
  alertThreshold: number;
  recoveryTimeout: number;
}

export interface SystemHealthStatus {
  overall: 'healthy' | 'degraded' | 'critical' | 'offline';
  components: {
    engines: 'healthy' | 'degraded' | 'critical';
    dataLayer: 'healthy' | 'degraded' | 'critical';
    integration: 'healthy' | 'degraded' | 'critical';
    application: 'healthy' | 'degraded' | 'critical';
  };
  metrics: {
    uptime: number;
    throughput: number;
    errorRate: number;
    responseTime: number;
  };
  alerts: SystemAlert[];
  lastCheck: Date;
}

export interface SystemAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export class ProductionSystemMonitor extends BrowserEventEmitter {
  private static instance: ProductionSystemMonitor;
  private config: ProductionConfig;
  
  // Component references
  private engineRegistry: UnifiedEngineRegistry;
  private integrationHub: EngineIntegrationHub;
  private dataLayer: DataManagementLayer;
  private appIntegrator: ApplicationIntegrator;
  
  // Monitoring state
  private systemHealth: SystemHealthStatus;
  private alerts = new Map<string, SystemAlert>();
  private metrics = new Map<string, number[]>();
  private startTime = Date.now();
  private healthCheckTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<ProductionConfig> = {}) {
    super();
    
    this.config = {
      enableHealthChecks: true,
      enablePerformanceMonitoring: true,
      enableAlerting: true,
      enableAutoRecovery: false,
      healthCheckInterval: 30000,
      performanceThreshold: 5000,
      alertThreshold: 0.8,
      recoveryTimeout: 60000,
      ...config
    };

    // Initialize components
    this.engineRegistry = UnifiedEngineRegistry.getInstance();
    this.integrationHub = EngineIntegrationHub.getInstance();
    this.dataLayer = DataManagementLayer.getInstance();
    this.appIntegrator = ApplicationIntegrator.getInstance();

    this.systemHealth = {
      overall: 'healthy',
      components: {
        engines: 'healthy',
        dataLayer: 'healthy',
        integration: 'healthy',
        application: 'healthy'
      },
      metrics: {
        uptime: 0,
        throughput: 0,
        errorRate: 0,
        responseTime: 0
      },
      alerts: [],
      lastCheck: new Date()
    };
  }

  static getInstance(config?: Partial<ProductionConfig>): ProductionSystemMonitor {
    if (!ProductionSystemMonitor.instance) {
      ProductionSystemMonitor.instance = new ProductionSystemMonitor(config);
    }
    return ProductionSystemMonitor.instance;
  }

  async initialize(): Promise<void> {
    console.log('🔍 Initializing Production System Monitor...');

    if (this.config.enableHealthChecks) {
      this.startHealthChecking();
    }

    if (this.config.enablePerformanceMonitoring) {
      this.setupPerformanceMonitoring();
    }

    if (this.config.enableAlerting) {
      this.setupAlerting();
    }

    this.emit('monitor:initialized', { timestamp: new Date() });
    console.log('✅ Production System Monitor initialized');
  }

  async getSystemHealth(): Promise<SystemHealthStatus> {
    // Update metrics
    this.systemHealth.metrics.uptime = Date.now() - this.startTime;
    this.systemHealth.lastCheck = new Date();
    
    // Check component health
    await this.checkComponentHealth();
    
    // Update overall status
    this.updateOverallHealth();
    
    return { ...this.systemHealth };
  }

  createAlert(component: string, severity: SystemAlert['severity'], message: string): void {
    const alert: SystemAlert = {
      id: `${component}-${Date.now()}`,
      severity,
      component,
      message,
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.set(alert.id, alert);
    this.systemHealth.alerts.push(alert);
    
    this.emit('alert:created', alert);
    
    if (severity === 'critical') {
      this.emit('alert:critical', alert);
    }
  }

  private async checkComponentHealth(): Promise<void> {
    try {
      // Check engines
      const engineStatus = this.engineRegistry.getExecutionStatus();
      this.systemHealth.components.engines = 
        engineStatus.failed > engineStatus.total * 0.3 ? 'critical' :
        engineStatus.failed > engineStatus.total * 0.1 ? 'degraded' : 'healthy';

      // Check integration hub
      const integrationHealth = await this.integrationHub.getSystemHealth();
      this.systemHealth.components.integration = 
        integrationHealth.overallHealth < 0.6 ? 'critical' :
        integrationHealth.overallHealth < 0.8 ? 'degraded' : 'healthy';

      // Check data layer
      const dataQuality = this.dataLayer.getAllQualityMetrics();
      const avgQuality = Array.from(dataQuality.values())
        .reduce((sum, metrics) => sum + metrics.overallScore, 0) / dataQuality.size;
      this.systemHealth.components.dataLayer = 
        avgQuality < 0.6 ? 'critical' :
        avgQuality < 0.8 ? 'degraded' : 'healthy';

      // Check application integrator
      const appStatus = this.appIntegrator.getSystemStatus();
      this.systemHealth.components.application = 
        appStatus.errorCount > 10 ? 'critical' :
        appStatus.errorCount > 5 ? 'degraded' : 'healthy';

    } catch (error) {
      console.error('Health check failed:', error);
      this.createAlert('monitor', 'critical', 'Health check system failure');
    }
  }

  private updateOverallHealth(): void {
    const components = Object.values(this.systemHealth.components);
    
    if (components.includes('critical')) {
      this.systemHealth.overall = 'critical';
    } else if (components.includes('degraded')) {
      this.systemHealth.overall = 'degraded';
    } else {
      this.systemHealth.overall = 'healthy';
    }
  }

  private startHealthChecking(): void {
    this.healthCheckTimer = setInterval(async () => {
      await this.getSystemHealth();
    }, this.config.healthCheckInterval);
  }

  private setupPerformanceMonitoring(): void {
    // Monitor engine execution times
    this.engineRegistry.on('execution:success', (event) => {
      this.recordMetric('engine.execution.time', event.duration || 0);
    });

    // Monitor data processing
    this.dataLayer.on('data:ingested', (event) => {
      this.recordMetric('data.processing.time', event.processingTime);
    });
  }

  private setupAlerting(): void {
    // Critical system alerts
    this.integrationHub.on('health:critical', (health) => {
      this.createAlert('integration', 'critical', `System health critical: ${health.overallHealth}`);
    });

    this.dataLayer.on('data:ingestion-error', (event) => {
      this.createAlert('data', 'high', `Data ingestion failed: ${event.error}`);
    });
  }

  private recordMetric(name: string, value: number): void {
    const values = this.metrics.get(name) || [];
    values.push(value);
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }
    
    this.metrics.set(name, values);
  }

  isProductionReady(): boolean {
    return this.systemHealth.overall === 'healthy' || this.systemHealth.overall === 'degraded';
  }

  shutdown(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    this.removeAllListeners();
    console.log('✅ Production System Monitor shutdown complete');
  }
}

export default ProductionSystemMonitor;
