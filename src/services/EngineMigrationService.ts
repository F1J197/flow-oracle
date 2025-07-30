/**
 * Engine Migration Service - V6 Implementation
 * Handles migration from legacy engine patterns to unified system
 */

import { UnifiedEngineRegistry, UnifiedBaseEngine } from '../engines/base';
import type { IEngine } from '../types/engines';
import { BaseEngine } from '../engines/BaseEngine';
import { EngineAdapter } from '../utils/engineAdapter';

export interface MigrationReport {
  totalEngines: number;
  migrated: number;
  failed: number;
  warnings: string[];
  errors: string[];
}

export interface LegacyEnginePattern {
  id: string;
  type: 'BaseEngine' | 'ResilientBaseEngine' | 'EnhancedBaseEngine' | 'Custom';
  needsMigration: boolean;
  migrationPath: 'direct' | 'adapter' | 'rewrite';
}

export class EngineMigrationService {
  private static instance: EngineMigrationService;
  private registry: UnifiedEngineRegistry;
  private migrationLog: string[] = [];

  private constructor() {
    this.registry = UnifiedEngineRegistry.getInstance();
  }

  static getInstance(): EngineMigrationService {
    if (!EngineMigrationService.instance) {
      EngineMigrationService.instance = new EngineMigrationService();
    }
    return EngineMigrationService.instance;
  }

  /**
   * Analyze existing engines and create migration plan
   */
  analyzeEngines(engines: IEngine[]): LegacyEnginePattern[] {
    return engines.map(engine => {
      const pattern = this.identifyEnginePattern(engine);
      return {
        id: engine.id,
        type: pattern.type,
        needsMigration: pattern.needsMigration,
        migrationPath: this.determineMigrationPath(engine, pattern)
      };
    });
  }

  /**
   * Migrate a single engine to the unified system
   */
  async migrateEngine(engine: IEngine): Promise<boolean> {
    try {
      const pattern = this.identifyEnginePattern(engine);
      
      switch (pattern.migrationPath) {
        case 'direct':
          return this.migrateDirect(engine);
        case 'adapter':
          return this.migrateWithAdapter(engine);
        case 'rewrite':
          this.log(`Engine ${engine.id} requires manual rewrite - skipping automatic migration`);
          return false;
        default:
          this.log(`Unknown migration path for engine ${engine.id}`);
          return false;
      }
    } catch (error) {
      this.log(`Migration failed for engine ${engine.id}: ${error.message}`);
      return false;
    }
  }

  /**
   * Migrate all engines in a collection
   */
  async migrateAll(engines: IEngine[]): Promise<MigrationReport> {
    const report: MigrationReport = {
      totalEngines: engines.length,
      migrated: 0,
      failed: 0,
      warnings: [],
      errors: []
    };

    this.log(`Starting migration of ${engines.length} engines...`);

    for (const engine of engines) {
      try {
        const success = await this.migrateEngine(engine);
        if (success) {
          report.migrated++;
          this.log(`✓ Migrated engine ${engine.id}`);
        } else {
          report.failed++;
          report.warnings.push(`Failed to migrate engine ${engine.id}`);
        }
      } catch (error) {
        report.failed++;
        report.errors.push(`Error migrating engine ${engine.id}: ${error.message}`);
      }
    }

    this.log(`Migration complete: ${report.migrated}/${report.totalEngines} engines migrated`);
    return report;
  }

  /**
   * Register engines with backward compatibility
   */
  registerWithCompatibility(engines: IEngine[]): void {
    engines.forEach(engine => {
      // Check if engine is already unified
      if (engine instanceof UnifiedBaseEngine) {
        this.registry.register(engine, {
          estimatedDuration: 5000,
          tags: ['migrated', 'unified']
        });
      } else {
        // Use adapter for legacy engines
        const adapted = EngineAdapter.adaptLegacyEngine(engine);
        this.registry.register(adapted, {
          isLegacy: true,
          estimatedDuration: 10000,
          tags: ['legacy', 'adapted']
        });
      }
    });
  }

  private identifyEnginePattern(engine: IEngine): { type: LegacyEnginePattern['type']; needsMigration: boolean; migrationPath: LegacyEnginePattern['migrationPath'] } {
    // Check if already using UnifiedBaseEngine
    if (engine instanceof UnifiedBaseEngine) {
      return { 
        type: 'Custom', 
        needsMigration: false, 
        migrationPath: 'direct' 
      };
    }

    // Check if using BaseEngine
    if (engine instanceof BaseEngine) {
      return { 
        type: 'BaseEngine', 
        needsMigration: true, 
        migrationPath: 'adapter' 
      };
    }

    // Check for enhanced pattern methods
    if ('getState' in engine && 'getMetrics' in engine && 'isHealthy' in engine) {
      return { 
        type: 'EnhancedBaseEngine', 
        needsMigration: false, 
        migrationPath: 'direct' 
      };
    }

    // Check for resilient pattern methods
    if ('getDetailedView' in engine && 'getSingleActionableInsight' in engine) {
      return { 
        type: 'ResilientBaseEngine', 
        needsMigration: true, 
        migrationPath: 'adapter' 
      };
    }

    // Custom implementation
    return { 
      type: 'Custom', 
      needsMigration: true, 
      migrationPath: 'rewrite' 
    };
  }

  private determineMigrationPath(engine: IEngine, pattern: { type: LegacyEnginePattern['type']; needsMigration: boolean }): LegacyEnginePattern['migrationPath'] {
    if (!pattern.needsMigration) {
      return 'direct';
    }

    // Check if all required methods exist
    const requiredMethods = [
      'execute', 'getSingleActionableInsight', 'getDashboardData',
      'getDetailedView', 'getIntelligenceView', 'getDetailedModal'
    ];

    const hasAllMethods = requiredMethods.every(method => method in engine);
    
    if (hasAllMethods) {
      return 'adapter';
    } else {
      return 'rewrite';
    }
  }

  private async migrateDirect(engine: IEngine): Promise<boolean> {
    // Engine is already compatible, just register it
    this.registry.register(engine, {
      migrated: true,
      tags: ['direct-migration']
    });
    return true;
  }

  private async migrateWithAdapter(engine: IEngine): Promise<boolean> {
    try {
      // Use adapter to make engine compatible
      const adapted = EngineAdapter.adaptLegacyEngine(engine);
      const enhanced = EngineAdapter.wrapExecution(adapted);

      this.registry.register(enhanced, {
        isLegacy: true,
        migrated: true,
        tags: ['adapter-migration', 'legacy']
      });

      return true;
    } catch (error) {
      this.log(`Adapter migration failed for ${engine.id}: ${error.message}`);
      return false;
    }
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    this.migrationLog.push(logMessage);
    console.log(`[EngineMigration] ${message}`);
  }

  /**
   * Get migration logs
   */
  getMigrationLog(): string[] {
    return [...this.migrationLog];
  }

  /**
   * Clear migration logs
   */
  clearLog(): void {
    this.migrationLog = [];
  }

  /**
   * Validate that all engines in registry are working
   */
  async validateMigration(): Promise<{ success: boolean; issues: string[] }> {
    const issues: string[] = [];
    const engines = this.registry.getAllMetadata();

    for (const metadata of engines) {
      try {
        const engine = this.registry.getEngine(metadata.id);
        if (!engine) {
          issues.push(`Engine ${metadata.id} not found in registry`);
          continue;
        }

        // Test basic execution
        await engine.execute();
      } catch (error) {
        issues.push(`Engine ${metadata.id} failed validation: ${error.message}`);
      }
    }

    return {
      success: issues.length === 0,
      issues
    };
  }
}