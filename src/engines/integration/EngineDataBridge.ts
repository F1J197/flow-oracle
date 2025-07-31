/**
 * EngineDataBridge - Phase 6 Implementation
 * Bridges data between engines, charts, and tiles for seamless integration
 */

import { BrowserEventEmitter } from '@/utils/BrowserEventEmitter';
import { UnifiedEngineRegistry } from '@/engines/base/UnifiedEngineRegistry';
import { IndicatorValue } from '@/types/indicators';
import { DashboardTileData, EngineReport } from '@/types/engines';

export interface DataBridgeConfig {
  enableRealtime: boolean;
  cacheTimeout: number;
  maxCacheSize: number;
  enableTransformations: boolean;
}

export interface DataTransformation {
  id: string;
  name: string;
  sourceEngineId: string;
  targetFormat: 'tile' | 'chart' | 'indicator';
  transform: (data: any) => any;
}

export interface BridgedData {
  engineId: string;
  format: 'tile' | 'chart' | 'indicator';
  data: DashboardTileData | IndicatorValue | any;
  timestamp: Date;
  ttl: number;
}

export class EngineDataBridge extends BrowserEventEmitter {
  private static instance: EngineDataBridge;
  private config: DataBridgeConfig;
  private registry: UnifiedEngineRegistry;
  private dataCache = new Map<string, BridgedData>();
  private transformations = new Map<string, DataTransformation>();
  private subscriptions = new Map<string, Set<(data: BridgedData) => void>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor(config: Partial<DataBridgeConfig> = {}) {
    super();
    
    this.config = {
      enableRealtime: true,
      cacheTimeout: 30000, // 30 seconds
      maxCacheSize: 1000,
      enableTransformations: true,
      ...config
    };

    this.registry = UnifiedEngineRegistry.getInstance();
    this.setupEngineSubscriptions();
    this.startCacheCleanup();
  }

  static getInstance(config?: Partial<DataBridgeConfig>): EngineDataBridge {
    if (!EngineDataBridge.instance) {
      EngineDataBridge.instance = new EngineDataBridge(config);
    }
    return EngineDataBridge.instance;
  }

  /**
   * Set up subscriptions to engine registry events
   */
  private setupEngineSubscriptions(): void {
    this.registry.on('execution:success', ({ engineId, result }) => {
      this.handleEngineResult(engineId, result);
    });

    this.registry.on('execution:error', ({ engineId, error }) => {
      this.handleEngineError(engineId, error);
    });
  }

  /**
   * Handle successful engine execution
   */
  private handleEngineResult(engineId: string, result: EngineReport): void {
    if (!this.config.enableRealtime) return;

    // Create bridged data for different formats
    const bridgedDataPoints: BridgedData[] = [];

    // Tile format
    try {
      const engine = this.registry.getEngine(engineId);
      if (engine) {
        const tileData = engine.getDashboardTile();
        bridgedDataPoints.push({
          engineId,
          format: 'tile',
          data: tileData,
          timestamp: new Date(),
          ttl: Date.now() + this.config.cacheTimeout
        });
      }
    } catch (error) {
      console.warn(`Failed to get tile data for engine ${engineId}:`, error);
    }

    // Chart/Indicator format
    if (result.data && typeof result.data === 'object') {
      const indicatorData: IndicatorValue = {
        current: this.extractNumericValue(result.data),
        timestamp: new Date(),
        confidence: result.confidence,
        change: result.data.change || 0,
        changePercent: result.data.changePercent || 0,
      };

      bridgedDataPoints.push({
        engineId,
        format: 'indicator',
        data: indicatorData,
        timestamp: new Date(),
        ttl: Date.now() + this.config.cacheTimeout
      });
    }

    // Store in cache and notify subscribers
    bridgedDataPoints.forEach(bridgedData => {
      const cacheKey = `${engineId}:${bridgedData.format}`;
      this.dataCache.set(cacheKey, bridgedData);
      this.notifySubscribers(cacheKey, bridgedData);
    });

    // Apply transformations if enabled
    if (this.config.enableTransformations) {
      this.applyTransformations(engineId, result);
    }

    this.emit('data:bridged', { engineId, dataPoints: bridgedDataPoints });
  }

  /**
   * Handle engine execution error
   */
  private handleEngineError(engineId: string, error: any): void {
    const errorData: BridgedData = {
      engineId,
      format: 'tile',
      data: {
        title: 'Engine Error',
        primaryMetric: 'Error',
        status: 'critical' as const,
        actionText: error.message || 'Unknown error'
      },
      timestamp: new Date(),
      ttl: Date.now() + this.config.cacheTimeout
    };

    const cacheKey = `${engineId}:error`;
    this.dataCache.set(cacheKey, errorData);
    this.notifySubscribers(cacheKey, errorData);

    this.emit('data:error', { engineId, error, errorData });
  }

  /**
   * Get bridged data for a specific engine and format
   */
  getBridgedData(engineId: string, format: 'tile' | 'chart' | 'indicator'): BridgedData | null {
    const cacheKey = `${engineId}:${format}`;
    const cached = this.dataCache.get(cacheKey);
    
    if (cached && cached.ttl > Date.now()) {
      return cached;
    }
    
    return null;
  }

  /**
   * Subscribe to data updates for a specific engine and format
   */
  subscribe(
    engineId: string, 
    format: 'tile' | 'chart' | 'indicator',
    callback: (data: BridgedData) => void
  ): () => void {
    const cacheKey = `${engineId}:${format}`;
    
    if (!this.subscriptions.has(cacheKey)) {
      this.subscriptions.set(cacheKey, new Set());
    }
    
    this.subscriptions.get(cacheKey)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const subs = this.subscriptions.get(cacheKey);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscriptions.delete(cacheKey);
        }
      }
    };
  }

  /**
   * Register a data transformation
   */
  registerTransformation(transformation: DataTransformation): void {
    this.transformations.set(transformation.id, transformation);
    this.emit('transformation:registered', transformation);
  }

  /**
   * Unregister a data transformation
   */
  unregisterTransformation(transformationId: string): void {
    this.transformations.delete(transformationId);
    this.emit('transformation:unregistered', { id: transformationId });
  }

  /**
   * Apply registered transformations to engine data
   */
  private applyTransformations(engineId: string, result: EngineReport): void {
    for (const transformation of this.transformations.values()) {
      if (transformation.sourceEngineId === engineId) {
        try {
          const transformedData = transformation.transform(result.data);
          
          const bridgedData: BridgedData = {
            engineId: `${engineId}:${transformation.id}`,
            format: transformation.targetFormat,
            data: transformedData,
            timestamp: new Date(),
            ttl: Date.now() + this.config.cacheTimeout
          };

          const cacheKey = `${bridgedData.engineId}:${transformation.targetFormat}`;
          this.dataCache.set(cacheKey, bridgedData);
          this.notifySubscribers(cacheKey, bridgedData);

          this.emit('transformation:applied', {
            transformationId: transformation.id,
            engineId,
            result: bridgedData
          });
        } catch (error) {
          console.error(`Transformation ${transformation.id} failed:`, error);
          this.emit('transformation:error', {
            transformationId: transformation.id,
            engineId,
            error
          });
        }
      }
    }
  }

  /**
   * Notify subscribers of data updates
   */
  private notifySubscribers(cacheKey: string, data: BridgedData): void {
    const subscribers = this.subscriptions.get(cacheKey);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Subscriber callback error:', error);
        }
      });
    }
  }

  /**
   * Extract numeric value from complex data structures
   */
  private extractNumericValue(data: any): number {
    if (typeof data === 'number') return data;
    if (typeof data === 'string') {
      const parsed = parseFloat(data);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (data && typeof data === 'object') {
      // Try common property names
      const candidates = ['value', 'price', 'amount', 'current', 'result', 'score'];
      for (const prop of candidates) {
        if (prop in data && typeof data[prop] === 'number') {
          return data[prop];
        }
      }
    }
    return 0;
  }

  /**
   * Start cache cleanup interval
   */
  private startCacheCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const [key, data] of this.dataCache.entries()) {
        if (data.ttl <= now) {
          expiredKeys.push(key);
        }
      }

      expiredKeys.forEach(key => this.dataCache.delete(key));

      // Enforce max cache size
      if (this.dataCache.size > this.config.maxCacheSize) {
        const sortedEntries = Array.from(this.dataCache.entries())
          .sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());
        
        const toRemove = sortedEntries.slice(0, this.dataCache.size - this.config.maxCacheSize);
        toRemove.forEach(([key]) => this.dataCache.delete(key));
      }

      if (expiredKeys.length > 0) {
        this.emit('cache:cleanup', { expired: expiredKeys.length, remaining: this.dataCache.size });
      }
    }, 60000); // Run every minute
  }

  /**
   * Get bridge statistics
   */
  getStatistics() {
    return {
      cacheSize: this.dataCache.size,
      transformationCount: this.transformations.size,
      subscriptionCount: Array.from(this.subscriptions.values()).reduce((total, set) => total + set.size, 0),
      config: this.config
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.dataCache.clear();
    this.transformations.clear();
    this.subscriptions.clear();
    this.removeAllListeners();
  }
}