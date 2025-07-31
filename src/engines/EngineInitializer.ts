/**
 * Engine Initializer - V6 Unified System
 * Responsible for registering all engines with consistent IDs
 */

import { UnifiedEngineRegistry } from '@/engines/base/UnifiedEngineRegistry';
import { DataIntegrityEngine } from '@/engines/foundation/DataIntegrityEngine/DataIntegrityEngine';
import { EnhancedZScoreEngine } from '@/engines/foundation/EnhancedZScoreEngine/EnhancedZScoreEngine';

export class EngineInitializer {
  private static instance: EngineInitializer;
  private registry: UnifiedEngineRegistry;
  private initialized = false;

  private constructor() {
    this.registry = UnifiedEngineRegistry.getInstance();
  }

  static getInstance(): EngineInitializer {
    if (!EngineInitializer.instance) {
      EngineInitializer.instance = new EngineInitializer();
    }
    return EngineInitializer.instance;
  }

  async initializeAllEngines(): Promise<void> {
    if (this.initialized) {
      console.log('🔄 Engines already initialized, skipping...');
      return;
    }

    console.log('🚀 EngineInitializer: Starting engine registration...');

    try {
      // Initialize Foundation Engines
      await this.initializeFoundationEngines();
      
      // TODO: Initialize Pillar 1 Engines
      // await this.initializePillar1Engines();
      
      // TODO: Initialize Pillar 2 Engines  
      // await this.initializePillar2Engines();
      
      // TODO: Initialize Pillar 3 Engines
      // await this.initializePillar3Engines();
      
      // TODO: Initialize Synthesis Engines
      // await this.initializeSynthesisEngines();

      this.initialized = true;
      console.log('✅ EngineInitializer: All engines registered successfully');
      
      // Emit initialization complete event
      this.registry.emit('system:engines_initialized', {
        timestamp: new Date(),
        engineCount: this.registry.getAllMetadata().length
      });

    } catch (error) {
      console.error('❌ EngineInitializer: Failed to initialize engines:', error);
      throw error;
    }
  }

  private async initializeFoundationEngines(): Promise<void> {
    console.log('🏗️ Initializing Foundation Engines...');

    // Data Integrity Engine
    try {
      const dataIntegrityEngine = new DataIntegrityEngine();
      this.registry.register(dataIntegrityEngine, {
        description: 'Foundation-tier data integrity monitoring with automated validation',
        version: '6.0.0',
        estimatedDuration: 2000,
        tags: ['foundation', 'data-quality', 'validation']
      });
      console.log('✅ Registered: Data Integrity Engine');
    } catch (error) {
      console.error('❌ Failed to register Data Integrity Engine:', error);
    }

    // Enhanced Z-Score Engine
    try {
      const zscoreEngine = new EnhancedZScoreEngine();
      this.registry.register(zscoreEngine, {
        description: 'Advanced multi-timeframe Z-Score analysis with regime detection',
        version: '6.0.0',
        estimatedDuration: 3000,
        tags: ['foundation', 'zscore', 'momentum', 'regime-detection']
      });
      console.log('✅ Registered: Enhanced Z-Score Engine');
    } catch (error) {
      console.error('❌ Failed to register Enhanced Z-Score Engine:', error);
    }

    console.log('✅ Foundation engines initialized');
  }

  // Get engine registry for external access
  getRegistry(): UnifiedEngineRegistry {
    return this.registry;
  }

  // Check if engines are initialized
  isInitialized(): boolean {
    return this.initialized;
  }

  // Force re-initialization
  async reinitialize(): Promise<void> {
    console.log('🔄 EngineInitializer: Force reinitializing...');
    this.initialized = false;
    await this.initializeAllEngines();
  }

  // Get initialization status
  getStatus() {
    const metadata = this.registry.getAllMetadata();
    return {
      initialized: this.initialized,
      engineCount: metadata.length,
      foundationEngines: metadata.filter(e => e.category === 'foundation').length,
      coreEngines: metadata.filter(e => e.category === 'core').length,
      synthesisEngines: metadata.filter(e => e.category === 'synthesis').length,
      executionEngines: metadata.filter(e => e.category === 'execution').length
    };
  }
}

// Export singleton instance for easy access
export const engineInitializer = EngineInitializer.getInstance();