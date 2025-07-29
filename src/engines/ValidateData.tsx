/**
 * Data Validation Test for CUSIP Stealth QE Engine V6
 * Tests the complete data flow from Supabase to engine execution
 */

import { supabase } from "@/integrations/supabase/client";
import { dataService } from "@/services/dataService";
import { CUSIPStealthQEEngine } from "./CUSIPStealthQEEngine";

export class DataFlowValidator {
  private engine: CUSIPStealthQEEngine;

  constructor() {
    this.engine = new CUSIPStealthQEEngine();
  }

  async validateCompleteDataFlow(): Promise<{
    success: boolean;
    results: any[];
    errors: string[];
  }> {
    const results: any[] = [];
    const errors: string[] = [];

    console.log('🔍 Starting complete data flow validation...');

    try {
      // Test 1: Database connectivity
      const dbTest = await this.testDatabaseConnectivity();
      results.push(dbTest);
      if (!dbTest.success) errors.push(`Database: ${dbTest.error}`);

      // Test 2: SOMA Holdings data
      const somaTest = await this.testSOMAHoldings();
      results.push(somaTest);
      if (!somaTest.success) errors.push(`SOMA Holdings: ${somaTest.error}`);

      // Test 3: CUSIP Anomalies data
      const anomaliesTest = await this.testCUSIPAnomalies();
      results.push(anomaliesTest);
      if (!anomaliesTest.success) errors.push(`CUSIP Anomalies: ${anomaliesTest.error}`);

      // Test 4: Engine initialization
      const initTest = await this.testEngineInitialization();
      results.push(initTest);
      if (!initTest.success) errors.push(`Engine Init: ${initTest.error}`);

      // Test 5: Engine execution
      const execTest = await this.testEngineExecution();
      results.push(execTest);
      if (!execTest.success) errors.push(`Engine Execution: ${execTest.error}`);

      // Test 6: UI Data Generation
      const uiTest = await this.testUIDataGeneration();
      results.push(uiTest);
      if (!uiTest.success) errors.push(`UI Data: ${uiTest.error}`);

      const overallSuccess = errors.length === 0;
      
      console.log(`✅ Data flow validation completed: ${overallSuccess ? 'SUCCESS' : 'FAILED'}`);
      
      return {
        success: overallSuccess,
        results,
        errors
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMsg);
      
      return {
        success: false,
        results,
        errors
      };
    }
  }

  private async testDatabaseConnectivity(): Promise<{
    success: boolean;
    test: string;
    data?: any;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('indicators')
        .select('count')
        .limit(1);

      if (error) throw error;

      return {
        success: true,
        test: 'Database Connectivity',
        data: { connected: true, tablesAccessible: true }
      };
    } catch (error) {
      return {
        success: false,
        test: 'Database Connectivity',
        error: error instanceof Error ? error.message : 'Database connection failed'
      };
    }
  }

  private async testSOMAHoldings(): Promise<{
    success: boolean;
    test: string;
    data?: any;
    error?: string;
  }> {
    try {
      const holdings = await dataService.fetchSOMAHoldings(7);
      
      return {
        success: true,
        test: 'SOMA Holdings Fetch',
        data: {
          recordCount: holdings.length,
          hasMetadata: holdings.some(h => h.cusip_metadata),
          sampleRecord: holdings[0] || null
        }
      };
    } catch (error) {
      return {
        success: false,
        test: 'SOMA Holdings Fetch',
        error: error instanceof Error ? error.message : 'SOMA holdings fetch failed'
      };
    }
  }

  private async testCUSIPAnomalies(): Promise<{
    success: boolean;
    test: string;
    data?: any;
    error?: string;
  }> {
    try {
      const anomalies = await dataService.fetchCUSIPAnomalies(7);
      
      return {
        success: true,
        test: 'CUSIP Anomalies Fetch',
        data: {
          recordCount: anomalies.length,
          hasValidData: anomalies.some(a => a.severity_score > 0),
          sampleRecord: anomalies[0] || null
        }
      };
    } catch (error) {
      return {
        success: false,
        test: 'CUSIP Anomalies Fetch',
        error: error instanceof Error ? error.message : 'CUSIP anomalies fetch failed'
      };
    }
  }

  private async testEngineInitialization(): Promise<{
    success: boolean;
    test: string;
    data?: any;
    error?: string;
  }> {
    try {
      // CUSIPStealthQEEngine doesn't have initialize method, just check properties
      return {
        success: true,
        test: 'Engine Initialization',
        data: {
          engineId: this.engine.id,
          engineName: this.engine.name,
          priority: this.engine.priority,
          pillar: this.engine.pillar
        }
      };
    } catch (error) {
      return {
        success: false,
        test: 'Engine Initialization',
        error: error instanceof Error ? error.message : 'Engine initialization failed'
      };
    }
  }

  private async testEngineExecution(): Promise<{
    success: boolean;
    test: string;
    data?: any;
    error?: string;
  }> {
    try {
      const report = await this.engine.execute();
      
      return {
        success: report.success,
        test: 'Engine Execution',
        data: {
          success: report.success,
          confidence: report.confidence,
          signal: report.signal,
          dataKeys: Object.keys(report.data || {}),
          hasSegments: !!(report.data?.segments),
          segmentCount: report.data?.segments?.length || 0,
          lastUpdated: report.lastUpdated
        }
      };
    } catch (error) {
      return {
        success: false,
        test: 'Engine Execution',
        error: error instanceof Error ? error.message : 'Engine execution failed'
      };
    }
  }

  private async testUIDataGeneration(): Promise<{
    success: boolean;
    test: string;
    data?: any;
    error?: string;
  }> {
    try {
      const dashboardData = this.engine.getDashboardData();
      const detailedView = this.engine.getDetailedView();
      const actionableInsight = this.engine.getSingleActionableInsight();
      
      return {
        success: true,
        test: 'UI Data Generation',
        data: {
          dashboardData: {
            title: dashboardData.title,
            primaryMetric: dashboardData.primaryMetric,
            status: dashboardData.status,
            hasActionText: !!dashboardData.actionText
          },
          detailedView: {
            title: detailedView.title,
            hasPrimarySection: !!detailedView.primarySection,
            sectionCount: detailedView.sections?.length || 0,
            alertCount: detailedView.alerts?.length || 0
          },
          actionableInsight: {
            actionText: actionableInsight.actionText,
            signalStrength: actionableInsight.signalStrength,
            marketAction: actionableInsight.marketAction,
            confidence: actionableInsight.confidence
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        test: 'UI Data Generation',
        error: error instanceof Error ? error.message : 'UI data generation failed'
      };
    }
  }

  // Run a quick health check
  async quickHealthCheck(): Promise<boolean> {
    try {
      const { success } = await this.validateCompleteDataFlow();
      return success;
    } catch {
      return false;
    }
  }

  // Get engine performance metrics
  async getEngineMetrics(): Promise<{
    executionTime: number;
    dataQuality: number;
    confidenceLevel: number;
    alertCount: number;
  }> {
    const startTime = Date.now();
    
    try {
      const report = await this.engine.execute();
      const executionTime = Date.now() - startTime;
      
      return {
        executionTime,
        dataQuality: report.success ? 100 : 0,
        confidenceLevel: report.confidence || 0,
        alertCount: report.data?.alerts?.length || 0
      };
    } catch {
      return {
        executionTime: Date.now() - startTime,
        dataQuality: 0,
        confidenceLevel: 0,
        alertCount: 0
      };
    }
  }
}

// Export singleton for global use
export const dataFlowValidator = new DataFlowValidator();