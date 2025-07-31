/**
 * ApplicationIntegrator - Phase 6 Implementation
 * Central integration component that coordinates all systems
 */

import React, { useEffect, useState, useMemo } from 'react';
import { EngineDataBridge } from '@/engines/integration/EngineDataBridge';
import { TileOrchestrator, TileConfiguration } from '@/components/tiles/TileOrchestrator';
import { ChartOrchestrator } from '@/components/charts/ChartOrchestrator';
import { WebSocketOrchestrator } from '@/services/WebSocketOrchestrator';
import { UnifiedEngineRegistry } from '@/engines/base/UnifiedEngineRegistry';
import { useUnifiedEngineRegistry } from '@/hooks/useUnifiedEngineRegistry';
import { useToast } from '@/hooks/use-toast';

export interface ApplicationIntegratorProps {
  mode?: 'dashboard' | 'charts' | 'intelligence';
  enableRealtime?: boolean;
  enableTiles?: boolean;
  enableCharts?: boolean;
  initialTiles?: TileConfiguration[];
  className?: string;
}

export interface SystemStatus {
  engines: {
    total: number;
    active: number;
    errors: number;
  };
  websockets: {
    connected: number;
    total: number;
    health: number;
  };
  dataBridge: {
    cacheSize: number;
    transformations: number;
    subscriptions: number;
  };
}

export const ApplicationIntegrator: React.FC<ApplicationIntegratorProps> = ({
  mode = 'dashboard',
  enableRealtime = true,
  enableTiles = true,
  enableCharts = true,
  initialTiles = [],
  className,
}) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    engines: { total: 0, active: 0, errors: 0 },
    websockets: { connected: 0, total: 0, health: 0 },
    dataBridge: { cacheSize: 0, transformations: 0, subscriptions: 0 },
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  const { toast } = useToast();
  const { executeEngines, status, error } = useUnifiedEngineRegistry();

  // Initialize singletons
  const dataBridge = useMemo(() => EngineDataBridge.getInstance({
    enableRealtime,
    cacheTimeout: 30000,
    maxCacheSize: 1000,
  }), [enableRealtime]);

  const wsOrchestrator = useMemo(() => WebSocketOrchestrator.getInstance({
    enableCoinbase: enableRealtime,
    enableBinance: enableRealtime,
    healthCheckInterval: 30000,
  }), [enableRealtime]);

  // System initialization
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        console.log('🚀 Initializing Application Integration System...');

        // Initialize WebSocket connections if realtime is enabled
        if (enableRealtime) {
          console.log('📡 Initializing WebSocket connections...');
          await wsOrchestrator.initialize();
        }

        // Set up data bridge event handling
        console.log('🌉 Setting up Data Bridge...');
        setupDataBridgeEvents();

        // Set up WebSocket event handling
        if (enableRealtime) {
          console.log('🔌 Setting up WebSocket events...');
          setupWebSocketEvents();
        }

        // Execute initial engine run
        console.log('⚙️ Executing initial engine run...');
        await executeEngines();

        setIsInitialized(true);
        console.log('✅ Application Integration System initialized successfully');

        toast({
          title: "System Initialized",
          description: "All components are now running and integrated.",
        });

      } catch (error) {
        console.error('❌ System initialization failed:', error);
        setInitializationError(error instanceof Error ? error.message : 'Unknown error');
        
        toast({
          title: "Initialization Failed",
          description: "Some system components failed to start.",
          variant: "destructive",
        });
      }
    };

    initializeSystem();

    // Cleanup on unmount
    return () => {
      console.log('🛑 Shutting down Application Integration System...');
      if (enableRealtime) {
        wsOrchestrator.shutdown();
      }
      dataBridge.destroy();
    };
  }, [enableRealtime, executeEngines, toast, dataBridge, wsOrchestrator]);

  // Set up data bridge event handlers
  const setupDataBridgeEvents = () => {
    dataBridge.on('data:bridged', ({ engineId, dataPoints }) => {
      console.log(`📊 Data bridged from engine ${engineId}:`, dataPoints.length, 'data points');
    });

    dataBridge.on('data:error', ({ engineId, error }) => {
      console.warn(`⚠️ Data bridge error for engine ${engineId}:`, error);
    });

    dataBridge.on('transformation:applied', ({ transformationId, engineId, result }) => {
      console.log(`🔄 Transformation ${transformationId} applied to engine ${engineId}`);
    });

    dataBridge.on('cache:cleanup', ({ expired, remaining }) => {
      console.log(`🗑️ Cache cleanup: ${expired} expired, ${remaining} remaining`);
    });
  };

  // Set up WebSocket event handlers
  const setupWebSocketEvents = () => {
    wsOrchestrator.on('data:update', ({ provider, symbol, value }) => {
      console.log(`📈 Realtime data from ${provider} for ${symbol}:`, value.current);
    });

    wsOrchestrator.on('connection:status', ({ provider, status }) => {
      console.log(`🔗 WebSocket ${provider} status:`, status);
      updateSystemStatus();
    });

    wsOrchestrator.on('health:report', (healthReport) => {
      console.log('💓 WebSocket health report:', healthReport);
      updateSystemStatus();
    });
  };

  // Update system status
  const updateSystemStatus = () => {
    const engineRegistry = UnifiedEngineRegistry.getInstance();
    const engineStatus = engineRegistry.getExecutionStatus();
    const wsHealth = wsOrchestrator.getHealthStatus();
    const bridgeStats = dataBridge.getStatistics();

    setSystemStatus({
      engines: {
        total: engineStatus.total,
        active: engineStatus.running,
        errors: engineStatus.failed,
      },
      websockets: {
        connected: wsHealth.connections.filter(c => c.status === 'connected').length,
        total: wsHealth.connections.length,
        health: wsHealth.overall,
      },
      dataBridge: {
        cacheSize: bridgeStats.cacheSize,
        transformations: bridgeStats.transformationCount,
        subscriptions: bridgeStats.subscriptionCount,
      },
    });
  };

  // System status monitor
  useEffect(() => {
    const statusInterval = setInterval(updateSystemStatus, 5000);
    return () => clearInterval(statusInterval);
  }, []);

  // Default tile configurations
  const defaultTiles: TileConfiguration[] = [
    {
      id: 'net-liquidity',
      engineId: 'net-liquidity-engine',
      position: { x: 0, y: 0 },
      size: { width: 2, height: 1 },
      priority: 100,
      minSize: { width: 1, height: 1 },
      maxSize: { width: 4, height: 2 },
      locked: false,
      visible: true,
      theme: 'default',
    },
    {
      id: 'zscore-engine',
      engineId: 'enhanced-zscore',
      position: { x: 2, y: 0 },
      size: { width: 1, height: 1 },
      priority: 90,
      minSize: { width: 1, height: 1 },
      maxSize: { width: 2, height: 2 },
      locked: false,
      visible: true,
      theme: 'default',
    },
    {
      id: 'primary-dealer',
      engineId: 'primary-dealer-v6',
      position: { x: 3, y: 0 },
      size: { width: 1, height: 1 },
      priority: 80,
      minSize: { width: 1, height: 1 },
      maxSize: { width: 2, height: 2 },
      locked: false,
      visible: true,
      theme: 'default',
    },
  ];

  if (!isInitialized) {
    return (
      <div className={`integration-loader ${className || ''}`}>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Initializing system components...</p>
          {initializationError && (
            <p className="text-destructive text-sm">{initializationError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`application-integrator ${className || ''}`}>
      {/* System Status Bar */}
      <div className="status-bar flex items-center justify-between p-2 bg-muted/30 border-b border-border/20 text-xs">
        <div className="flex items-center space-x-4">
          <span className="font-medium">System Status:</span>
          <span className={`px-2 py-1 rounded-full ${
            systemStatus.engines.errors === 0 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
          }`}>
            Engines: {systemStatus.engines.active}/{systemStatus.engines.total}
          </span>
          {enableRealtime && (
            <span className={`px-2 py-1 rounded-full ${
              systemStatus.websockets.health > 0.8 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
            }`}>
              WebSockets: {systemStatus.websockets.connected}/{systemStatus.websockets.total}
            </span>
          )}
          <span className="text-muted-foreground">
            Cache: {systemStatus.dataBridge.cacheSize} items
          </span>
        </div>
        <div className="text-muted-foreground">
          Mode: {mode} | Realtime: {enableRealtime ? 'ON' : 'OFF'}
        </div>
      </div>

      {/* Main Content */}
      <div className="integration-content h-full">
        {mode === 'dashboard' && enableTiles && (
          <TileOrchestrator
            tiles={initialTiles.length > 0 ? initialTiles : defaultTiles}
            className="h-full"
          />
        )}

        {mode === 'charts' && enableCharts && (
          <ChartOrchestrator className="h-full" />
        )}

        {mode === 'intelligence' && (
          <div className="intelligence-view p-6">
            <h2 className="text-2xl font-bold mb-4">Intelligence View</h2>
            <p className="text-muted-foreground">Intelligence view integration coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationIntegrator;