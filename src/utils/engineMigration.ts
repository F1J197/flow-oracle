/**
 * Engine Migration Utilities - V6 Implementation
 * Provides seamless migration from existing to enhanced engine patterns
 */

import type { IEngine } from '../types/engines';
import { EnhancedBaseEngine } from '../engines/base/EnhancedBaseEngine';
import { UnifiedEngineRegistry } from '../engines/base/UnifiedEngineRegistry';
import { EngineRegistry } from '../engines/EngineRegistry';

export class EngineMigrationService {
  private static instance: EngineMigrationService;
  private migrationLog: Array<{ engineId: string; status: 'success' | 'failed'; timestamp: Date; error?: string }> = [];

  static getInstance(): EngineMigrationService {
    if (!EngineMigrationService.instance) {
      EngineMigrationService.instance = new EngineMigrationService();
    }
    return EngineMigrationService.instance;
  }

  /**
   * Migrate existing engines from old registry to unified registry
   */
  async migrateExistingEngines(): Promise<void> {
    console.log('🔄 Starting engine migration...');
    
    try {
      const oldRegistry = EngineRegistry.getInstance();
      const newRegistry = UnifiedEngineRegistry.getInstance();
      
      const existingMetadata = oldRegistry.getAllMetadata();
      
      for (const metadata of existingMetadata) {
        try {
          const engine = oldRegistry.getEngine(metadata.id);
          if (engine) {
            // Migrate to new registry with enhanced capabilities
            newRegistry.register(engine, {
              ...metadata,
              isLegacy: true,
              migrated: true,
              version: '6.0'
            });
            
            this.logMigration(metadata.id, 'success');
            console.log(`✅ Migrated engine: ${metadata.id}`);
          }
        } catch (error) {
          this.logMigration(metadata.id, 'failed', error instanceof Error ? error.message : 'Unknown error');
          console.warn(`⚠️  Failed to migrate engine: ${metadata.id}`, error);
        }
      }
      
      console.log('✅ Engine migration completed');
      this.printMigrationSummary();
      
    } catch (error) {
      console.error('❌ Engine migration failed:', error);
      throw error;
    }
  }

  /**
   * Create enhanced engine wrapper for legacy engines
   */
  createEnhancedWrapper(legacyEngine: IEngine): EnhancedBaseEngine {
    return new (class extends EnhancedBaseEngine {
      readonly id = legacyEngine.id;
      readonly name = legacyEngine.name;
      readonly priority = legacyEngine.priority;
      readonly pillar = legacyEngine.pillar;
      readonly category = legacyEngine.category;

      protected async performExecution() {
        return await legacyEngine.execute();
      }

      getSingleActionableInsight() {
        return legacyEngine.getSingleActionableInsight();
      }

      getDashboardData() {
        return legacyEngine.getDashboardData();
      }

      getDashboardTile() {
        return legacyEngine.getDashboardTile();
      }

      getIntelligenceView() {
        return legacyEngine.getIntelligenceView();
      }

      getDetailedModal() {
        return legacyEngine.getDetailedModal();
      }

      getDetailedView() {
        return legacyEngine.getDetailedView();
      }
    })();
  }

  /**
   * Validate that migration was successful
   */
  validateMigration(): boolean {
    const successfulMigrations = this.migrationLog.filter(log => log.status === 'success').length;
    const totalMigrations = this.migrationLog.length;
    
    const successRate = totalMigrations > 0 ? successfulMigrations / totalMigrations : 0;
    
    console.log(`📊 Migration validation: ${successfulMigrations}/${totalMigrations} engines migrated successfully (${(successRate * 100).toFixed(1)}%)`);
    
    return successRate >= 0.8; // 80% success rate threshold
  }

  /**
   * Get migration status for a specific engine
   */
  getEngineStatus(engineId: string): { migrated: boolean; status?: 'success' | 'failed'; error?: string } {
    const log = this.migrationLog.find(entry => entry.engineId === engineId);
    
    if (!log) {
      return { migrated: false };
    }
    
    return {
      migrated: true,
      status: log.status,
      error: log.error
    };
  }

  /**
   * Get full migration report
   */
  getMigrationReport(): {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    details: typeof this.migrationLog;
  } {
    const successful = this.migrationLog.filter(log => log.status === 'success').length;
    const failed = this.migrationLog.filter(log => log.status === 'failed').length;
    const total = this.migrationLog.length;
    
    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? successful / total : 0,
      details: [...this.migrationLog]
    };
  }

  private logMigration(engineId: string, status: 'success' | 'failed', error?: string): void {
    this.migrationLog.push({
      engineId,
      status,
      timestamp: new Date(),
      error
    });
  }

  private printMigrationSummary(): void {
    const report = this.getMigrationReport();
    
    console.log('\n📋 Migration Summary:');
    console.log(`   Total Engines: ${report.total}`);
    console.log(`   ✅ Successful: ${report.successful}`);
    console.log(`   ❌ Failed: ${report.failed}`);
    console.log(`   📈 Success Rate: ${(report.successRate * 100).toFixed(1)}%`);
    
    if (report.failed > 0) {
      console.log('\n⚠️  Failed Migrations:');
      report.details
        .filter(log => log.status === 'failed')
        .forEach(log => {
          console.log(`   - ${log.engineId}: ${log.error || 'Unknown error'}`);
        });
    }
  }
}

/**
 * Backward compatibility utilities
 */
export class BackwardCompatibilityLayer {
  /**
   * Ensure existing engine registry calls still work
   */
  static wrapLegacyRegistry(): void {
    const oldRegistry = EngineRegistry.getInstance();
    const newRegistry = UnifiedEngineRegistry.getInstance();
    
    // Proxy key methods to maintain compatibility
    const originalExecuteAll = oldRegistry.executeAll.bind(oldRegistry);
    oldRegistry.executeAll = async () => {
      console.log('🔄 Legacy executeAll() call detected, routing to unified registry...');
      return await newRegistry.executeAll();
    };
    
    const originalExecuteByPillar = oldRegistry.executeByPillar.bind(oldRegistry);
    oldRegistry.executeByPillar = async (pillar: 1 | 2 | 3) => {
      console.log(`🔄 Legacy executeByPillar(${pillar}) call detected, routing to unified registry...`);
      return await newRegistry.executeByPillar(pillar);
    };
  }

  /**
   * Provide legacy method aliases for new registry
   */
  static addLegacyAliases(registry: UnifiedEngineRegistry): void {
    // Add any legacy method names that components might still use
    (registry as any).getAllEngines = () => registry.getAllMetadata();
    (registry as any).getEngineCount = () => registry.getAllMetadata().length;
  }
}