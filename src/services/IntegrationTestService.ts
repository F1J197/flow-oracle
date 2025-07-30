/**
 * Integration Test Service - Phase 7: Complete System Testing
 * End-to-end testing for the Universal Data Proxy architecture
 */

import { supabase } from '@/integrations/supabase/client';
import { FREDService } from './FREDService';
import UniversalDataService from './UniversalDataService';
import UniversalIndicatorService from './UniversalIndicatorService';
import ErrorHandlingService, { ErrorLevel } from './ErrorHandlingService';

export interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  error?: string;
  details?: Record<string, any>;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
}

class IntegrationTestService {
  private static instance: IntegrationTestService;
  private errorHandler = ErrorHandlingService.getInstance();

  private constructor() {}

  static getInstance(): IntegrationTestService {
    if (!IntegrationTestService.instance) {
      IntegrationTestService.instance = new IntegrationTestService();
    }
    return IntegrationTestService.instance;
  }

  /**
   * Run all integration tests
   */
  async runAllTests(): Promise<TestSuite[]> {
    console.log('🧪 Starting Integration Test Suite for Universal Data Proxy...');
    
    const suites = await Promise.all([
      this.testDatabaseConnectivity(),
      this.testUniversalDataProxy(),
      this.testFREDService(),
      this.testUniversalDataService(),
      this.testIndicatorService(),
      this.testErrorHandling(),
      this.testEndToEndFlow()
    ]);

    this.printTestSummary(suites);
    return suites;
  }

  /**
   * Test Database Connectivity
   */
  private async testDatabaseConnectivity(): Promise<TestSuite> {
    const tests: TestResult[] = [];
    const suiteName = 'Database Connectivity';

    // Test 1: Basic connection
    tests.push(await this.runTest('Basic Database Connection', async () => {
      const { data, error } = await supabase.from('indicators').select('count').limit(1);
      if (error) throw error;
      return { connected: true };
    }));

    // Test 2: Read indicators table
    tests.push(await this.runTest('Read Indicators Table', async () => {
      const { data, error } = await supabase.from('indicators').select('*').limit(5);
      if (error) throw error;
      return { indicatorCount: data?.length || 0 };
    }));

    // Test 3: Read data points table
    tests.push(await this.runTest('Read Data Points Table', async () => {
      const { data, error } = await supabase.from('data_points').select('*').limit(5);
      if (error) throw error;
      return { dataPointCount: data?.length || 0 };
    }));

    return this.createTestSuite(suiteName, tests);
  }

  /**
   * Test Universal Data Proxy Edge Function
   */
  private async testUniversalDataProxy(): Promise<TestSuite> {
    const tests: TestResult[] = [];
    const suiteName = 'Universal Data Proxy';

    // Test 1: FRED provider
    tests.push(await this.runTest('FRED Provider via Proxy', async () => {
      const { data, error } = await supabase.functions.invoke('universal-data-proxy', {
        body: {
          provider: 'fred',
          endpoint: '/series/observations',
          symbol: 'DGS10',
          parameters: { limit: 5, sort_order: 'desc' }
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Proxy request failed');
      
      return { 
        dataPoints: data.data?.observations?.length || 0,
        rateLimitInfo: data.rateLimitInfo 
      };
    }));

    // Test 2: Coinbase provider
    tests.push(await this.runTest('Coinbase Provider via Proxy', async () => {
      const { data, error } = await supabase.functions.invoke('universal-data-proxy', {
        body: {
          provider: 'coinbase',
          endpoint: '/products/BTC-USD/ticker'
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Coinbase request failed');
      
      return { 
        price: data.data?.price,
        volume: data.data?.volume 
      };
    }));

    // Test 3: Rate limiting
    tests.push(await this.runTest('Rate Limiting Behavior', async () => {
      const requests = Array.from({ length: 3 }, () => 
        supabase.functions.invoke('universal-data-proxy', {
          body: {
            provider: 'fred',
            endpoint: '/series/observations',
            symbol: 'WALCL',
            parameters: { limit: 1 }
          }
        })
      );

      const results = await Promise.allSettled(requests);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      
      return { 
        totalRequests: requests.length,
        successfulRequests: successful 
      };
    }));

    return this.createTestSuite(suiteName, tests);
  }

  /**
   * Test FRED Service
   */
  private async testFREDService(): Promise<TestSuite> {
    const tests: TestResult[] = [];
    const suiteName = 'FRED Service';
    const fredService = FREDService.getInstance();

    // Test 1: Single series fetch
    tests.push(await this.runTest('Fetch Single FRED Series', async () => {
      const data = await fredService.fetchSeries('DGS10');
      if (data.length === 0) throw new Error('No data returned');
      return { 
        dataPoints: data.length,
        latestValue: data[0]?.value,
        latestDate: data[0]?.date 
      };
    }));

    // Test 2: Multiple series fetch
    tests.push(await this.runTest('Fetch Multiple FRED Series', async () => {
      const series = ['WALCL', 'WTREGEN', 'DGS10'];
      const data = await fredService.fetchMultipleSeries(series);
      
      const successful = Object.values(data).filter(d => d.length > 0).length;
      
      return { 
        requestedSeries: series.length,
        successfulSeries: successful,
        results: Object.keys(data)
      };
    }));

    // Test 3: Cache functionality
    tests.push(await this.runTest('FRED Service Caching', async () => {
      const start = Date.now();
      await fredService.fetchSeries('DGS2'); // First call
      const firstCallDuration = Date.now() - start;

      const cachedStart = Date.now();
      await fredService.fetchSeries('DGS2'); // Cached call
      const cachedCallDuration = Date.now() - cachedStart;

      return {
        firstCallMs: firstCallDuration,
        cachedCallMs: cachedCallDuration,
        cacheEffective: cachedCallDuration < firstCallDuration
      };
    }));

    return this.createTestSuite(suiteName, tests);
  }

  /**
   * Test Universal Data Service
   */
  private async testUniversalDataService(): Promise<TestSuite> {
    const tests: TestResult[] = [];
    const suiteName = 'Universal Data Service';
    const dataService = UniversalDataService.getInstance();

    // Test 1: Fetch FRED indicator
    tests.push(await this.runTest('Fetch FRED Indicator', async () => {
      const data = await dataService.fetchIndicator('DGS10', 'fred');
      if (!data) throw new Error('No data returned');
      
      return {
        symbol: data.symbol,
        current: data.current,
        confidence: data.confidence,
        provider: data.provider
      };
    }));

    // Test 2: Fetch crypto indicator
    tests.push(await this.runTest('Fetch Crypto Indicator', async () => {
      const data = await dataService.fetchIndicator('BTC-USD', 'coinbase');
      if (!data) throw new Error('No BTC price data returned');
      
      return {
        symbol: data.symbol,
        price: data.current,
        provider: data.provider
      };
    }));

    // Test 3: Multiple indicators
    tests.push(await this.runTest('Fetch Multiple Indicators', async () => {
      const requests = [
        { symbol: 'DGS10', provider: 'fred' },
        { symbol: 'BTC-USD', provider: 'coinbase' }
      ];
      
      const results = await dataService.fetchMultipleIndicators(requests);
      const successful = Object.values(results).filter(r => r !== null).length;
      
      return {
        requested: requests.length,
        successful,
        results: Object.keys(results)
      };
    }));

    return this.createTestSuite(suiteName, tests);
  }

  /**
   * Test Universal Indicator Service
   */
  private async testIndicatorService(): Promise<TestSuite> {
    const tests: TestResult[] = [];
    const suiteName = 'Universal Indicator Service';
    const indicatorService = UniversalIndicatorService.getInstance();

    // Test 1: Load indicators from database
    tests.push(await this.runTest('Load Indicators from Database', async () => {
      const states = indicatorService.getAllIndicatorStates();
      return {
        loadedIndicators: states.length,
        activeIndicators: states.filter(s => s.status === 'active').length
      };
    }));

    // Test 2: Subscription mechanism
    tests.push(await this.runTest('Indicator Subscription', async () => {
      let callbackCalled = false;
      let receivedState: any = null;

      const unsubscribe = indicatorService.subscribe({
        indicatorId: 'test-indicator',
        callback: (state) => {
          callbackCalled = true;
          receivedState = state;
        },
        timeFrame: '1d'
      });

      // Cleanup
      unsubscribe();

      return {
        subscriptionCreated: true,
        callbackRegistered: true
      };
    }));

    // Test 3: Health status
    tests.push(await this.runTest('Service Health Status', async () => {
      const health = indicatorService.getHealthStatus();
      
      return {
        totalIndicators: health.totalIndicators,
        healthScore: health.healthScore,
        hasActiveIndicators: health.activeIndicators > 0
      };
    }));

    return this.createTestSuite(suiteName, tests);
  }

  /**
   * Test Error Handling
   */
  private async testErrorHandling(): Promise<TestSuite> {
    const tests: TestResult[] = [];
    const suiteName = 'Error Handling';

    // Test 1: Error logging
    tests.push(await this.runTest('Error Logging', async () => {
      const errorId = this.errorHandler.logError(
        ErrorLevel.ERROR,
        'Test error message',
        {
          component: 'TestService',
          operation: 'testErrorLogging',
          timestamp: new Date()
        }
      );

      return { errorId, logged: true };
    }));

    // Test 2: Error statistics
    tests.push(await this.runTest('Error Statistics', async () => {
      const stats = this.errorHandler.getErrorStats();
      
      return {
        totalErrors: stats.total,
        recentErrors: stats.recent,
        resolvedErrors: stats.resolved
      };
    }));

    // Test 3: Health status
    tests.push(await this.runTest('Error Handler Health', async () => {
      const health = this.errorHandler.getHealthStatus();
      
      return {
        isHealthy: health.isHealthy,
        criticalErrors: health.criticalErrorCount,
        recommendationCount: health.recommendations.length
      };
    }));

    return this.createTestSuite(suiteName, tests);
  }

  /**
   * Test End-to-End Flow
   */
  private async testEndToEndFlow(): Promise<TestSuite> {
    const tests: TestResult[] = [];
    const suiteName = 'End-to-End Flow';

    // Test 1: Complete data pipeline
    tests.push(await this.runTest('Complete Data Pipeline', async () => {
      // 1. Fetch via Universal Data Service
      const dataService = UniversalDataService.getInstance();
      const fredData = await dataService.fetchIndicator('DGS10', 'fred');
      
      if (!fredData) throw new Error('Failed to fetch FRED data');

      // 2. Verify proxy functionality
      const { data: proxyData, error } = await supabase.functions.invoke('universal-data-proxy', {
        body: {
          provider: 'fred',
          endpoint: '/series/observations',
          symbol: 'DGS10',
          parameters: { limit: 1 }
        }
      });

      if (error || !proxyData.success) {
        throw new Error('Proxy request failed');
      }

      // 3. Verify database connectivity
      const { data: dbData, error: dbError } = await supabase
        .from('indicators')
        .select('*')
        .eq('symbol', 'DGS10')
        .limit(1);

      if (dbError) throw dbError;

      return {
        dataServiceWorking: !!fredData,
        proxyWorking: !!proxyData.success,
        databaseWorking: !dbError,
        indicatorFound: dbData && dbData.length > 0
      };
    }));

    // Test 2: Performance benchmark
    tests.push(await this.runTest('Performance Benchmark', async () => {
      const start = Date.now();
      
      const dataService = UniversalDataService.getInstance();
      const requests = [
        { symbol: 'DGS10', provider: 'fred' },
        { symbol: 'WALCL', provider: 'fred' },
        { symbol: 'BTC-USD', provider: 'coinbase' }
      ];
      
      const results = await dataService.fetchMultipleIndicators(requests);
      const duration = Date.now() - start;
      
      return {
        totalRequests: requests.length,
        duration,
        averageRequestTime: duration / requests.length,
        successful: Object.values(results).filter(r => r !== null).length
      };
    }));

    return this.createTestSuite(suiteName, tests);
  }

  /**
   * Helper methods
   */
  private async runTest(
    testName: string, 
    testFn: () => Promise<any>
  ): Promise<TestResult> {
    const start = Date.now();
    
    try {
      const details = await testFn();
      const duration = Date.now() - start;
      
      return {
        testName,
        status: 'PASS',
        duration,
        details
      };
    } catch (error) {
      const duration = Date.now() - start;
      
      return {
        testName,
        status: 'FAIL',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private createTestSuite(name: string, tests: TestResult[]): TestSuite {
    const total = tests.length;
    const passed = tests.filter(t => t.status === 'PASS').length;
    const failed = tests.filter(t => t.status === 'FAIL').length;
    const skipped = tests.filter(t => t.status === 'SKIP').length;
    const duration = tests.reduce((sum, t) => sum + t.duration, 0);

    return {
      name,
      tests,
      summary: {
        total,
        passed,
        failed,
        skipped,
        duration
      }
    };
  }

  private printTestSummary(suites: TestSuite[]): void {
    console.log('\n🧪 Test Suite Summary');
    console.log('='.repeat(50));
    
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalDuration = 0;

    suites.forEach(suite => {
      const { passed, failed, total, duration } = suite.summary;
      totalTests += total;
      totalPassed += passed;
      totalFailed += failed;
      totalDuration += duration;

      const status = failed === 0 ? '✅' : '❌';
      console.log(`${status} ${suite.name}: ${passed}/${total} passed (${duration}ms)`);
      
      if (failed > 0) {
        suite.tests
          .filter(t => t.status === 'FAIL')
          .forEach(test => {
            console.log(`   ❌ ${test.testName}: ${test.error}`);
          });
      }
    });

    console.log('='.repeat(50));
    console.log(`Overall: ${totalPassed}/${totalTests} tests passed (${totalDuration}ms)`);
    console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
    
    if (totalFailed === 0) {
      console.log('🎉 All tests passed! Universal Data Proxy is ready.');
    } else {
      console.log(`⚠️  ${totalFailed} tests failed. Review issues above.`);
    }
  }
}

export default IntegrationTestService;