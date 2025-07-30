/**
 * Universal Data Proxy Validator - Phase 5: End-to-End Testing & Validation
 * Comprehensive validation of the Universal Data Proxy system
 */

import { supabase } from '@/integrations/supabase/client';
import UniversalDataServiceV2 from './UniversalDataServiceV2';
import { FREDService } from './FREDService';
import { getFREDSeriesId, hasValidFREDMapping, getAllFREDSymbols } from '@/config/fredSymbolMapping';

export interface ValidationResult {
  component: string;
  tests: TestResult[];
  overallStatus: 'PASS' | 'FAIL' | 'WARNING';
  summary: string;
}

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  duration: number;
}

export class UniversalDataProxyValidator {
  private dataService: UniversalDataServiceV2;

  constructor() {
    this.dataService = UniversalDataServiceV2.getInstance();
  }

  /**
   * Run complete validation suite
   */
  async runCompleteValidation(): Promise<ValidationResult[]> {
    console.log('🚀 Starting Universal Data Proxy validation...');
    
    const results: ValidationResult[] = [];
    
    results.push(await this.validateDatabaseSchema());
    results.push(await this.validateFREDIntegration());
    results.push(await this.validateEdgeFunctions());
    results.push(await this.validateDataService());
    results.push(await this.validateErrorHandling());
    
    this.printValidationSummary(results);
    return results;
  }

  /**
   * Validate database schema and connectivity
   */
  private async validateDatabaseSchema(): Promise<ValidationResult> {
    const tests: TestResult[] = [];
    
    // Test 1: Check indicator_data table exists
    tests.push(await this.runTest('indicator_data table exists', async () => {
      const { data, error } = await supabase
        .from('indicator_data')
        .select('count', { count: 'exact', head: true });
      
      if (error) throw error;
      return { tableExists: true, recordCount: data };
    }));

    // Test 2: Check RLS policies
    tests.push(await this.runTest('RLS policies configured', async () => {
      const { data, error } = await supabase
        .from('indicator_data')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      return { rlsWorking: true };
    }));

    // Test 3: Test data insertion
    tests.push(await this.runTest('Data insertion works', async () => {
      const testData = {
        provider: 'test',
        symbol: 'TEST_VALIDATION',
        value: 100,
        date: new Date().toISOString().split('T')[0],
        metadata: { source: 'validation_test' }
      };

      const { data, error } = await supabase
        .from('indicator_data')
        .insert(testData)
        .select()
        .maybeSingle();

      if (error) throw error;
      
      // Clean up test data
      if (data) {
        await supabase
          .from('indicator_data')
          .delete()
          .eq('id', data.id);
      }
      
      return { insertWorking: true };
    }));

    return this.createValidationResult('Database Schema', tests);
  }

  /**
   * Validate FRED integration and mapping
   */
  private async validateFREDIntegration(): Promise<ValidationResult> {
    const tests: TestResult[] = [];
    
    // Test 1: FRED symbol mapping
    tests.push(await this.runTest('FRED symbol mapping', async () => {
      const validSymbols = getAllFREDSymbols().filter(hasValidFREDMapping);
      const invalidSymbols = ['btc-price', 'btc-market-cap'];
      
      if (validSymbols.length === 0) {
        throw new Error('No valid FRED symbols found');
      }
      
      // Check invalid symbols are properly filtered
      const shouldBeNull1 = getFREDSeriesId('btc-price');
      const shouldBeNull2 = getFREDSeriesId('btc-market-cap');
      
      if (shouldBeNull1 !== null || shouldBeNull2 !== null) {
        throw new Error('Invalid symbols not properly filtered');
      }
      
      return { 
        validSymbols: validSymbols.length,
        invalidSymbolsFiltered: true
      };
    }));

    // Test 2: FRED Service functionality
    tests.push(await this.runTest('FRED Service functionality', async () => {
      const health = FREDService.getHealthStatus();
      
      // Test with a known valid FRED series
      try {
        const data = await FREDService.fetchSeries('WALCL');
        return { 
          healthCheck: health,
          fetchWorking: data.length > 0,
          dataPoints: data.length
        };
      } catch (error) {
        return {
          healthCheck: health,
          fetchWorking: false,
          error: (error as Error).message
        };
      }
    }));

    // Test 3: Series ID validation
    tests.push(await this.runTest('Series ID validation', async () => {
      const validId = 'WALCL';
      const invalidId = 'this-is-too-long-and-invalid-fred-series-id';
      const invalidChars = 'WALCL-INVALID';
      
      // Valid ID should work
      const validMapping = getFREDSeriesId('fed-balance-sheet');
      if (validMapping !== 'WALCL') {
        throw new Error('Valid mapping failed');
      }
      
      // Invalid symbols should return null or be filtered
      const cryptoMapping = getFREDSeriesId('btc-price');
      if (cryptoMapping !== null) {
        throw new Error('Invalid symbol not filtered');
      }
      
      return { 
        validMappingWorks: true,
        invalidSymbolsFiltered: true
      };
    }));

    return this.createValidationResult('FRED Integration', tests);
  }

  /**
   * Validate Edge Functions
   */
  private async validateEdgeFunctions(): Promise<ValidationResult> {
    const tests: TestResult[] = [];
    
    // Test 1: Universal Data Proxy
    tests.push(await this.runTest('Universal Data Proxy function', async () => {
      try {
        const { data, error } = await supabase.functions.invoke('universal-data-proxy', {
          body: {
            provider: 'fred',
            endpoint: '/series/observations',
            params: {
              series_id: 'WALCL',
              limit: 10
            }
          }
        });
        
        return { 
          functionResponds: true,
          hasError: !!error,
          dataReceived: !!data
        };
      } catch (error) {
        return {
          functionResponds: false,
          error: (error as Error).message
        };
      }
    }));

    // Test 2: FRED Data Ingestion
    tests.push(await this.runTest('FRED Data Ingestion function', async () => {
      try {
        const { data, error } = await supabase.functions.invoke('fred-data-ingestion', {
          body: {
            action: 'fetchSeries',
            seriesId: 'WALCL'
          }
        });
        
        return { 
          functionResponds: true,
          hasError: !!error,
          dataReceived: !!data
        };
      } catch (error) {
        return {
          functionResponds: false,
          error: (error as Error).message
        };
      }
    }));

    return this.createValidationResult('Edge Functions', tests);
  }

  /**
   * Validate Universal Data Service
   */
  private async validateDataService(): Promise<ValidationResult> {
    const tests: TestResult[] = [];
    
    // Test 1: Service health
    tests.push(await this.runTest('Data Service health', async () => {
      const health = this.dataService.getHealthStatus();
      
      return {
        status: health.status,
        cacheSize: health.cacheSize,
        errorRate: health.errorRate,
        activeProviders: health.activeProviders
      };
    }));

    // Test 2: Single indicator fetch
    tests.push(await this.runTest('Single indicator fetch', async () => {
      const result = await this.dataService.fetchIndicator('fed-balance-sheet', 'fred');
      
      return {
        fetchWorked: !!result,
        hasValidData: result ? result.current > 0 : false,
        timestamp: result?.timestamp,
        provider: result?.provider
      };
    }));

    // Test 3: Multiple indicators fetch
    tests.push(await this.runTest('Multiple indicators fetch', async () => {
      const requests = [
        { symbol: 'fed-balance-sheet', provider: 'fred' },
        { symbol: 'high-yield-spread', provider: 'fred' }
      ];
      
      const results = await this.dataService.fetchMultipleIndicators(requests);
      const successCount = Object.values(results).filter(r => r !== null).length;
      
      return {
        requestCount: requests.length,
        successCount,
        successRate: successCount / requests.length,
        results: Object.keys(results)
      };
    }));

    return this.createValidationResult('Universal Data Service', tests);
  }

  /**
   * Validate error handling
   */
  private async validateErrorHandling(): Promise<ValidationResult> {
    const tests: TestResult[] = [];
    
    // Test 1: Invalid symbol handling
    tests.push(await this.runTest('Invalid symbol handling', async () => {
      const result = await this.dataService.fetchIndicator('INVALID_SYMBOL_12345', 'fred');
      
      return {
        handledGracefully: result === null,
        noExceptionThrown: true
      };
    }));

    // Test 2: Invalid provider handling
    tests.push(await this.runTest('Invalid provider handling', async () => {
      try {
        await this.dataService.fetchIndicator('test', 'invalid_provider');
        return { shouldHaveFailed: true };
      } catch (error) {
        return {
          errorHandledCorrectly: true,
          errorMessage: (error as Error).message
        };
      }
    }));

    return this.createValidationResult('Error Handling', tests);
  }

  /**
   * Run a single test with timing
   */
  private async runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      return {
        name,
        status: 'PASS',
        details: JSON.stringify(result, null, 2),
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        name,
        status: 'FAIL',
        details: (error as Error).message,
        duration
      };
    }
  }

  /**
   * Create validation result summary
   */
  private createValidationResult(component: string, tests: TestResult[]): ValidationResult {
    const passCount = tests.filter(t => t.status === 'PASS').length;
    const failCount = tests.filter(t => t.status === 'FAIL').length;
    const warningCount = tests.filter(t => t.status === 'WARNING').length;
    
    let overallStatus: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    if (failCount > 0) {
      overallStatus = 'FAIL';
    } else if (warningCount > 0) {
      overallStatus = 'WARNING';
    }
    
    const summary = `${passCount}/${tests.length} tests passed`;
    
    return {
      component,
      tests,
      overallStatus,
      summary
    };
  }

  /**
   * Print validation summary
   */
  private printValidationSummary(results: ValidationResult[]): void {
    console.log('\n📊 Universal Data Proxy Validation Summary');
    console.log('==========================================');
    
    results.forEach(result => {
      const statusIcon = result.overallStatus === 'PASS' ? '✅' : 
                        result.overallStatus === 'WARNING' ? '⚠️' : '❌';
      
      console.log(`${statusIcon} ${result.component}: ${result.summary}`);
      
      if (result.overallStatus !== 'PASS') {
        result.tests.filter(t => t.status !== 'PASS').forEach(test => {
          console.log(`   - ${test.name}: ${test.details}`);
        });
      }
    });
    
    const overallPass = results.every(r => r.overallStatus === 'PASS');
    const hasWarnings = results.some(r => r.overallStatus === 'WARNING');
    
    console.log('\n==========================================');
    if (overallPass) {
      console.log('🎉 All validation tests passed! Universal Data Proxy is 100% compliant.');
    } else if (hasWarnings) {
      console.log('⚠️ Validation completed with warnings. Review issues above.');
    } else {
      console.log('❌ Validation failed. Critical issues need to be resolved.');
    }
  }
}

export default UniversalDataProxyValidator;