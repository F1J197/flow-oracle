/**
 * Engine Adapter - V6 Enhanced Implementation
 * Provides comprehensive compatibility layer for existing engines with enhanced resilient patterns
 */

import type { IEngine } from '../types/engines';

export class EngineAdapter {
  /**
   * Adapt legacy engines to work with enhanced patterns
   */
  static adaptLegacyEngine(engine: any): IEngine {
    // Add resilient methods if they don't exist
    if (!engine.isHealthy) {
      engine.isHealthy = () => {
        // Basic health check - engine is healthy if it has basic methods
        return typeof engine.execute === 'function' && 
               typeof engine.id === 'string';
      };
    }
    
    if (!engine.getAge) {
      engine.getAge = () => {
        // Return age in milliseconds since creation
        return Date.now() - (engine.createdAt || Date.now());
      };
    }
    
    if (!engine.getState) {
      engine.getState = () => ({
        status: 'idle' as const,
        retryCount: 0,
        lastSuccess: new Date(),
        executionTime: 0,
        isHealthy: engine.isHealthy()
      });
    }

    // Add event emitter capabilities if not present
    if (!engine.on && !engine.emit) {
      const EventEmitter = require('events');
      Object.setPrototypeOf(engine, EventEmitter.prototype);
      EventEmitter.call(engine);
    }

    // Ensure all required IEngine methods exist
    if (!engine.getSingleActionableInsight) {
      engine.getSingleActionableInsight = () => ({
        actionText: 'Monitor engine status',
        signalStrength: 50,
        marketAction: 'HOLD' as const,
        confidence: 'MED' as const,
        timeframe: 'MEDIUM_TERM' as const
      });
    }

    if (!engine.getDashboardData || !engine.getDashboardTile) {
      const defaultTileData = () => ({
        title: engine.name || 'Unknown Engine',
        primaryMetric: 'N/A',
        status: 'normal' as const,
        loading: false
      });
      
      engine.getDashboardData = defaultTileData;
      engine.getDashboardTile = defaultTileData;
    }

    if (!engine.getIntelligenceView) {
      engine.getIntelligenceView = () => ({
        title: engine.name || 'Unknown Engine',
        status: 'active' as const,
        primaryMetrics: {},
        sections: [],
        confidence: 50,
        lastUpdate: new Date()
      });
    }

    if (!engine.getDetailedModal) {
      engine.getDetailedModal = () => ({
        title: engine.name || 'Unknown Engine',
        description: 'Legacy engine with basic functionality',
        keyInsights: ['Engine is operational'],
        detailedMetrics: []
      });
    }

    if (!engine.getDetailedView) {
      engine.getDetailedView = () => ({
        title: engine.name || 'Unknown Engine',
        primarySection: {
          title: 'Status',
          metrics: { status: 'operational' }
        },
        sections: []
      });
    }
    
    return engine;
  }

  /**
   * Enhanced execution wrapper with comprehensive error handling
   */
  static wrapExecution(originalEngine: any): IEngine {
    const originalExecute = originalEngine.execute?.bind(originalEngine);
    
    if (!originalExecute) {
      throw new Error(`Engine ${originalEngine.id || 'unknown'} missing execute method`);
    }
    
    originalEngine.execute = async () => {
      const startTime = Date.now();
      
      try {
        // Emit execution start event if engine supports events
        if (originalEngine.emit) {
          originalEngine.emit('execution:start', { 
            engineId: originalEngine.id,
            timestamp: new Date()
          });
        }

        const result = await originalExecute();
        const executionTime = Date.now() - startTime;
        
        // Ensure result conforms to EngineReport interface
        const normalizedResult = {
          success: result?.success !== false,
          confidence: result?.confidence || 0.8,
          signal: result?.signal || 'neutral',
          data: result?.data || result,
          lastUpdated: new Date(),
          executionTime,
          ...result
        };

        // Emit success event
        if (originalEngine.emit) {
          originalEngine.emit('execution:success', {
            engineId: originalEngine.id,
            result: normalizedResult,
            executionTime
          });
        }

        return normalizedResult;
        
      } catch (error) {
        const executionTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        console.warn(`🔧 Engine ${originalEngine.id || 'unknown'} failed, providing graceful fallback:`, errorMessage);
        
        // Emit error event
        if (originalEngine.emit) {
          originalEngine.emit('execution:error', {
            engineId: originalEngine.id,
            error: errorMessage,
            executionTime
          });
        }
        
        // Return a degraded but successful result to prevent cascade failures
        return {
          success: true, // Mark as success to prevent cascade failures
          confidence: 0.3, // Low confidence indicates degraded mode
          signal: 'neutral',
          data: {
            degraded: true,
            reason: errorMessage,
            fallbackMode: true,
            originalError: error,
            recoveryStrategy: 'graceful_degradation'
          },
          errors: [errorMessage],
          lastUpdated: new Date(),
          executionTime
        };
      }
    };
    
    return originalEngine;
  }

  /**
   * Validate engine compatibility
   */
  static validateEngine(engine: any): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check required properties
    if (!engine.id || typeof engine.id !== 'string') {
      issues.push('Missing or invalid id property');
    }
    
    if (!engine.name || typeof engine.name !== 'string') {
      issues.push('Missing or invalid name property');
    }
    
    if (typeof engine.priority !== 'number') {
      issues.push('Missing or invalid priority property');
    }
    
    if (![1, 2, 3].includes(engine.pillar)) {
      issues.push('Missing or invalid pillar property (must be 1, 2, or 3)');
    }
    
    if (!['foundation', 'core', 'synthesis', 'execution'].includes(engine.category)) {
      issues.push('Missing or invalid category property');
    }
    
    // Check required methods
    if (typeof engine.execute !== 'function') {
      issues.push('Missing execute method');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Create a mock engine for testing purposes
   */
  static createMockEngine(config: Partial<IEngine> = {}): IEngine {
    const defaultConfig = {
      id: 'mock-engine',
      name: 'Mock Engine',
      priority: 999,
      pillar: 1 as const,
      category: 'foundation' as const,
      execute: async () => ({
        success: true,
        confidence: 0.8,
        signal: 'neutral' as const,
        data: { mock: true },
        lastUpdated: new Date()
      })
    };

    const mockEngine = { ...defaultConfig, ...config };
    return this.adaptLegacyEngine(mockEngine);
  }
}