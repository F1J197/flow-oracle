/**
 * Engine Adapter - V6 Implementation
 * Provides compatibility layer for existing engines with new resilient patterns
 */

export class EngineAdapter {
  static adaptLegacyEngine(engine: any) {
    // Add resilient methods if they don't exist
    if (!engine.isHealthy) {
      engine.isHealthy = () => true;
    }
    
    if (!engine.getAge) {
      engine.getAge = () => 0;
    }
    
    if (!engine.getState) {
      engine.getState = () => ({
        status: 'idle',
        retryCount: 0,
        lastSuccess: new Date()
      });
    }
    
    return engine;
  }

  static wrapExecution(originalEngine: any) {
    const originalExecute = originalEngine.execute.bind(originalEngine);
    
    originalEngine.execute = async () => {
      try {
        const result = await originalExecute();
        return result;
      } catch (error) {
        console.warn(`Engine ${originalEngine.id || 'unknown'} failed, providing fallback`, error);
        
        // Return a degraded but successful result
        return {
          success: true,
          confidence: 0.5,
          signal: 'neutral',
          data: {
            degraded: true,
            reason: error instanceof Error ? error.message : 'Unknown error',
            fallbackMode: true
          },
          lastUpdated: new Date()
        };
      }
    };
    
    return originalEngine;
  }
}