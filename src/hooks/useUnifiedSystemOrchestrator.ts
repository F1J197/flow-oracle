/**
 * Unified System Orchestrator Hook - V6 Implementation
 * Central coordination for all engines, data services, and state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { UnifiedEngineRegistry } from '@/engines/base/UnifiedEngineRegistry';
import { MockDataService } from '@/services/MockDataService';
import { UnifiedSymbolMapper } from '@/config/unifiedSymbolMapping';
import { ALL_UNIFIED_INDICATORS } from '@/config/unifiedIndicators.config';

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical' | 'offline';
  engines: {
    total: number;
    healthy: number;
    degraded: number;
    offline: number;
  };
  data: {
    availability: number;
    staleness: number;
    errors: number;
  };
  performance: {
    averageResponseTime: number;
    successRate: number;
    cacheHitRate: number;
  };
}

export interface SystemMetrics {
  uptime: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  dataQuality: number;
  successRate: number;
  enginePerformance: Map<string, number>;
}

export interface OrchestratorConfig {
  enableMockData: boolean;
  refreshInterval: number;
  healthCheckInterval: number;
  cacheStrategy: 'aggressive' | 'moderate' | 'conservative';
  errorRetryLimit: number;
  gracefulDegradation: boolean;
}

export interface UseUnifiedSystemOrchestratorOptions {
  config?: Partial<OrchestratorConfig>;
  autoStart?: boolean;
  enableRealtime?: boolean;
}

export interface UnifiedSystemState {
  isInitialized: boolean;
  isRunning: boolean;
  health: SystemHealth;
  metrics: SystemMetrics;
  lastUpdate: Date | null;
  errors: string[];
  warnings: string[];
}

export const useUnifiedSystemOrchestrator = (options: UseUnifiedSystemOrchestratorOptions = {}) => {
  const {
    config: userConfig = {},
    autoStart = true,
    enableRealtime = false
  } = options;

  // Default configuration
  const config: OrchestratorConfig = {
    enableMockData: true,
    refreshInterval: 30000,
    healthCheckInterval: 10000,
    cacheStrategy: 'moderate',
    errorRetryLimit: 3,
    gracefulDegradation: true,
    ...userConfig
  };

  // State management
  const [state, setState] = useState<UnifiedSystemState>({
    isInitialized: false,
    isRunning: false,
    health: {
      overall: 'offline',
      engines: { total: 0, healthy: 0, degraded: 0, offline: 0 },
      data: { availability: 0, staleness: 0, errors: 0 },
      performance: { averageResponseTime: 0, successRate: 0, cacheHitRate: 0 }
    },
    metrics: {
      uptime: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      dataQuality: 0,
      successRate: 0,
      enginePerformance: new Map()
    },
    lastUpdate: null,
    errors: [],
    warnings: []
  });

  // Service instances
  const engineRegistry = useRef<UnifiedEngineRegistry>();
  const mockDataService = useRef<MockDataService>();
  const startTime = useRef<Date>(new Date());
  const intervalRefs = useRef<{
    refresh?: NodeJS.Timeout;
    healthCheck?: NodeJS.Timeout;
  }>({});

  /**
   * Initialize the system orchestrator
   */
  const initialize = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isInitialized: false }));

      // Initialize engine registry
      engineRegistry.current = UnifiedEngineRegistry.getInstance({
        autoStart: false,
        refreshInterval: config.refreshInterval,
        enableEvents: true,
        gracefulDegradation: config.gracefulDegradation
      });

      // Initialize mock data service
      if (config.enableMockData) {
        mockDataService.current = MockDataService.getInstance();
        
        // Set volatility based on configuration
        const volatility = config.cacheStrategy === 'aggressive' ? 'high' : 
                          config.cacheStrategy === 'conservative' ? 'low' : 'medium';
        mockDataService.current.setVolatilityLevel(volatility);
      }

      // Initialize symbol mapping
      const symbolCount = UnifiedSymbolMapper.getAllStandardIds().length;
      console.log(`Unified Symbol Mapper initialized with ${symbolCount} symbols`);

      // Validate configuration
      const indicatorCount = ALL_UNIFIED_INDICATORS.length;
      console.log(`Unified Indicators configuration loaded with ${indicatorCount} indicators`);

      setState(prev => ({
        ...prev,
        isInitialized: true,
        lastUpdate: new Date(),
        warnings: [
          ...(config.enableMockData ? ['Mock data mode enabled'] : []),
          ...(symbolCount < 20 ? ['Symbol mapping appears incomplete'] : [])
        ]
      }));

      console.log('✅ Unified System Orchestrator initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize Unified System Orchestrator:', error);
      setState(prev => ({
        ...prev,
        isInitialized: false,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Initialization failed']
      }));
    }
  }, [config]);

  /**
   * Start the orchestrator
   */
  const start = useCallback(async () => {
    if (!state.isInitialized) {
      await initialize();
    }

    try {
      setState(prev => ({ ...prev, isRunning: true }));

      // Start refresh interval
      if (config.refreshInterval > 0) {
        intervalRefs.current.refresh = setInterval(async () => {
          await updateSystemMetrics();
        }, config.refreshInterval);
      }

      // Start health check interval
      if (config.healthCheckInterval > 0) {
        intervalRefs.current.healthCheck = setInterval(async () => {
          await performHealthCheck();
        }, config.healthCheckInterval);
      }

      // Initial health check
      await performHealthCheck();

      console.log('🚀 Unified System Orchestrator started');

    } catch (error) {
      console.error('❌ Failed to start Unified System Orchestrator:', error);
      setState(prev => ({
        ...prev,
        isRunning: false,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Start failed']
      }));
    }
  }, [state.isInitialized, config, initialize]);

  /**
   * Stop the orchestrator
   */
  const stop = useCallback(() => {
    try {
      // Clear intervals
      if (intervalRefs.current.refresh) {
        clearInterval(intervalRefs.current.refresh);
        intervalRefs.current.refresh = undefined;
      }

      if (intervalRefs.current.healthCheck) {
        clearInterval(intervalRefs.current.healthCheck);
        intervalRefs.current.healthCheck = undefined;
      }

      setState(prev => ({ ...prev, isRunning: false }));

      console.log('⏹️ Unified System Orchestrator stopped');

    } catch (error) {
      console.error('❌ Error stopping orchestrator:', error);
    }
  }, []);

  /**
   * Perform comprehensive health check
   */
  const performHealthCheck = useCallback(async () => {
    try {
      const health: SystemHealth = {
        overall: 'healthy',
        engines: { total: 0, healthy: 0, degraded: 0, offline: 0 },
        data: { availability: 100, staleness: 0, errors: 0 },
        performance: { averageResponseTime: 0, successRate: 100, cacheHitRate: 0 }
      };

      // Check engine registry
      if (engineRegistry.current) {
        const engines = engineRegistry.current.getAllMetadata();
        health.engines.total = engines.length;
        
        // Simulate engine health (would be real checks in production)
        health.engines.healthy = Math.floor(engines.length * 0.8);
        health.engines.degraded = Math.floor(engines.length * 0.15);
        health.engines.offline = engines.length - health.engines.healthy - health.engines.degraded;
      }

      // Check data service
      if (config.enableMockData && mockDataService.current) {
        const indicators = mockDataService.current.getAvailableIndicators();
        health.data.availability = (indicators.length / ALL_UNIFIED_INDICATORS.length) * 100;
        health.data.staleness = Math.random() * 10; // Mock staleness
        health.data.errors = Math.floor(Math.random() * 3); // Mock errors
      }

      // Calculate overall health
      const engineHealth = health.engines.total > 0 ? 
        (health.engines.healthy / health.engines.total) * 100 : 0;
      
      if (engineHealth >= 80 && health.data.availability >= 90) {
        health.overall = 'healthy';
      } else if (engineHealth >= 60 && health.data.availability >= 70) {
        health.overall = 'degraded';
      } else if (engineHealth >= 30 && health.data.availability >= 50) {
        health.overall = 'critical';
      } else {
        health.overall = 'offline';
      }

      setState(prev => ({
        ...prev,
        health,
        lastUpdate: new Date()
      }));

    } catch (error) {
      console.error('Health check failed:', error);
      setState(prev => ({
        ...prev,
        health: {
          ...prev.health,
          overall: 'critical'
        },
        errors: [...prev.errors, 'Health check failed']
      }));
    }
  }, [config.enableMockData]);

  /**
   * Update system metrics
   */
  const updateSystemMetrics = useCallback(async () => {
    try {
      const now = new Date();
      const uptime = now.getTime() - startTime.current.getTime();

      setState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          uptime,
          // Additional metrics would be calculated here
          dataQuality: 85 + Math.random() * 10 // Mock data quality
        },
        lastUpdate: now
      }));

    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  }, []);

  /**
   * Execute all engines
   */
  const executeAllEngines = useCallback(async () => {
    if (!engineRegistry.current) {
      throw new Error('Engine registry not initialized');
    }

    try {
      const results = await engineRegistry.current.executeAll({
        parallel: true
      });

      setState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          totalRequests: prev.metrics.totalRequests + results.size,
          successfulRequests: prev.metrics.successfulRequests + 
            Array.from(results.values()).filter(r => r.success).length
        }
      }));

      return results;

    } catch (error) {
      setState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          totalRequests: prev.metrics.totalRequests + 1,
          failedRequests: prev.metrics.failedRequests + 1
        },
        errors: [...prev.errors, error instanceof Error ? error.message : 'Engine execution failed']
      }));
      
      throw error;
    }
  }, []);

  /**
   * Get indicator data
   */
  const getIndicatorData = useCallback(async (indicatorId: string) => {
    if (!config.enableMockData || !mockDataService.current) {
      throw new Error('Data service not available');
    }

    try {
      const standardId = UnifiedSymbolMapper.getStandardId(indicatorId);
      if (!standardId) {
        throw new Error(`Unknown indicator: ${indicatorId}`);
      }

      return await mockDataService.current.getIndicatorData(standardId);

    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: [...prev.errors, `Failed to get indicator ${indicatorId}: ${error}`]
      }));
      throw error;
    }
  }, [config.enableMockData]);

  /**
   * Get system status summary
   */
  const getSystemStatus = useCallback(() => {
    return {
      status: state.health.overall,
      uptime: state.metrics.uptime,
      engineCount: state.health.engines.total,
      dataAvailability: state.health.data.availability,
      successRate: state.metrics.successRate,
      lastUpdate: state.lastUpdate,
      hasErrors: state.errors.length > 0,
      hasWarnings: state.warnings.length > 0
    };
  }, [state]);

  // Initialize on mount if autoStart is true
  useEffect(() => {
    if (autoStart) {
      initialize();
    }

    return () => {
      stop();
    };
  }, [autoStart, initialize, stop]);

  // Start after initialization if autoStart is true
  useEffect(() => {
    if (autoStart && state.isInitialized && !state.isRunning) {
      start();
    }
  }, [autoStart, state.isInitialized, state.isRunning, start]);

  return {
    // State
    ...state,
    config,

    // Actions
    initialize,
    start,
    stop,
    executeAllEngines,
    getIndicatorData,
    performHealthCheck,
    updateSystemMetrics,

    // Getters
    getSystemStatus,

    // Service instances (for advanced use)
    engineRegistry: engineRegistry.current,
    mockDataService: mockDataService.current
  };
};

export default useUnifiedSystemOrchestrator;