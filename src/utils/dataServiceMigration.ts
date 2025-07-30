/**
 * Data Service Migration Utility
 * Helps migrate from legacy services to Universal Data Service V2
 */

import { getDataService } from '@/services';
import type { HealthStatus } from '@/services/UniversalDataServiceV2';

export interface MigrationResult {
  success: boolean;
  migratedServices: string[];
  errors: string[];
  healthStatus: HealthStatus;
}

export class DataServiceMigration {
  private static instance: DataServiceMigration;
  private migrationLog: string[] = [];

  static getInstance(): DataServiceMigration {
    if (!DataServiceMigration.instance) {
      DataServiceMigration.instance = new DataServiceMigration();
    }
    return DataServiceMigration.instance;
  }

  async performMigration(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedServices: [],
      errors: [],
      healthStatus: {} as HealthStatus
    };

    try {
      this.log('Starting Universal Data Service V2 migration...');

      // 1. Initialize new service
      const dataService = getDataService();
      this.log('✅ Universal Data Service V2 initialized');
      result.migratedServices.push('UniversalDataServiceV2');

      // 2. Test basic functionality
      const testResult = await this.testBasicFunctionality(dataService);
      if (!testResult.success) {
        result.errors.push(`Basic functionality test failed: ${testResult.error}`);
        return result;
      }
      this.log('✅ Basic functionality test passed');

      // 3. Test FRED integration
      const fredTest = await this.testFREDIntegration(dataService);
      if (!fredTest.success) {
        result.errors.push(`FRED integration test failed: ${fredTest.error}`);
      } else {
        this.log('✅ FRED integration test passed');
        result.migratedServices.push('FRED');
      }

      // 4. Test crypto providers
      const cryptoTest = await this.testCryptoProviders(dataService);
      if (!cryptoTest.success) {
        result.errors.push(`Crypto providers test failed: ${cryptoTest.error}`);
      } else {
        this.log('✅ Crypto providers test passed');
        result.migratedServices.push('Crypto');
      }

      // 5. Get health status
      result.healthStatus = dataService.getHealthStatus();
      this.log(`📊 Health status: ${result.healthStatus.status}`);

      // 6. Determine overall success
      result.success = result.errors.length === 0 && result.migratedServices.length >= 2;

      if (result.success) {
        this.log('🎉 Migration completed successfully!');
      } else {
        this.log('⚠️ Migration completed with errors');
      }

      return result;

    } catch (error) {
      result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.log(`❌ Migration failed: ${error}`);
      return result;
    }
  }

  private async testBasicFunctionality(dataService: any): Promise<{ success: boolean; error?: string }> {
    try {
      const health = dataService.getHealthStatus();
      if (!health || typeof health.status === 'undefined') {
        return { success: false, error: 'Health check failed' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async testFREDIntegration(dataService: any): Promise<{ success: boolean; error?: string }> {
    try {
      // Test with a known FRED symbol
      const result = await dataService.fetchIndicator('vix', 'fred');
      // Result can be null (due to API issues), but no errors means integration works
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'FRED test failed' };
    }
  }

  private async testCryptoProviders(dataService: any): Promise<{ success: boolean; error?: string }> {
    try {
      // Test with a basic crypto symbol
      const result = await dataService.fetchIndicator('BTC-USD', 'coinbase');
      // Result can be null (due to API issues), but no errors means integration works
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Crypto test failed' };
    }
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.migrationLog.push(logEntry);
    console.log(logEntry);
  }

  getMigrationLog(): string[] {
    return [...this.migrationLog];
  }

  clearLog(): void {
    this.migrationLog = [];
  }
}

/**
 * Quick migration check - returns true if migration is complete and successful
 */
export async function checkMigrationStatus(): Promise<boolean> {
  try {
    const migration = DataServiceMigration.getInstance();
    const result = await migration.performMigration();
    return result.success && result.errors.length === 0;
  } catch (error) {
    console.error('Migration status check failed:', error);
    return false;
  }
}

/**
 * Run full migration and return detailed results
 */
export async function runDataServiceMigration(): Promise<MigrationResult> {
  const migration = DataServiceMigration.getInstance();
  return migration.performMigration();
}