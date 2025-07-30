import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Activity,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { GlobalFinancialPlumbingEngine } from '@/engines/pillar1/GlobalFinancialPlumbingEngine';
import { GlobalPlumbingTile } from '@/engines/pillar1/GlobalFinancialPlumbingEngine';
import { GlobalPlumbingIntelligence } from '@/engines/pillar1/GlobalFinancialPlumbingEngine';
import { useGlobalPlumbingEngine } from '@/hooks/useGlobalPlumbingEngine';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  details?: string;
}

export const GlobalPlumbingEngineTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [engine] = useState(() => new GlobalFinancialPlumbingEngine());
  
  const {
    dashboardData,
    intelligenceData,
    actionableInsight,
    efficiency,
    systemicRisk,
    loading,
    error
  } = useGlobalPlumbingEngine({ autoRefresh: false });

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Engine Instantiation
    try {
      if (engine) {
        results.push({
          name: 'Engine Instantiation',
          status: 'pass',
          message: 'Engine created successfully',
          details: `ID: ${engine.id}, Name: ${engine.name}, Pillar: ${engine.pillar}`
        });
      }
    } catch (error) {
      results.push({
        name: 'Engine Instantiation',
        status: 'fail',
        message: 'Failed to create engine',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Engine Execution
    try {
      const report = await engine.execute();
      if (report.success) {
        results.push({
          name: 'Engine Execution',
          status: 'pass',
          message: 'Engine executed successfully',
          details: `Confidence: ${report.confidence}%, Signal: ${report.signal}`
        });
      } else {
        results.push({
          name: 'Engine Execution',
          status: 'fail',
          message: 'Engine execution failed',
          details: report.errors?.join(', ') || 'Unknown error'
        });
      }
    } catch (error) {
      results.push({
        name: 'Engine Execution',
        status: 'fail',
        message: 'Engine execution threw error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Dashboard Data Generation
    try {
      const dashData = engine.getDashboardData();
      if (dashData.title && dashData.primaryMetric) {
        results.push({
          name: 'Dashboard Data',
          status: 'pass',
          message: 'Dashboard data generated',
          details: `Title: ${dashData.title}, Metric: ${dashData.primaryMetric}`
        });
      } else {
        results.push({
          name: 'Dashboard Data',
          status: 'warning',
          message: 'Dashboard data incomplete',
          details: 'Missing title or primary metric'
        });
      }
    } catch (error) {
      results.push({
        name: 'Dashboard Data',
        status: 'fail',
        message: 'Failed to generate dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 4: Intelligence View Generation
    try {
      const intData = engine.getIntelligenceView();
      if (intData.title && intData.primaryMetrics && intData.sections) {
        results.push({
          name: 'Intelligence View',
          status: 'pass',
          message: 'Intelligence view generated',
          details: `Sections: ${intData.sections.length}, Metrics: ${Object.keys(intData.primaryMetrics).length}`
        });
      } else {
        results.push({
          name: 'Intelligence View',
          status: 'warning',
          message: 'Intelligence view incomplete',
          details: 'Missing required data sections'
        });
      }
    } catch (error) {
      results.push({
        name: 'Intelligence View',
        status: 'fail',
        message: 'Failed to generate intelligence view',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 5: Detailed Modal Generation
    try {
      const modalData = engine.getDetailedModal();
      if (modalData.title && modalData.description && modalData.keyInsights) {
        results.push({
          name: 'Detailed Modal',
          status: 'pass',
          message: 'Detailed modal data generated',
          details: `Insights: ${modalData.keyInsights.length}, Metrics: ${modalData.detailedMetrics.length}`
        });
      } else {
        results.push({
          name: 'Detailed Modal',
          status: 'warning',
          message: 'Detailed modal data incomplete',
          details: 'Missing key components'
        });
      }
    } catch (error) {
      results.push({
        name: 'Detailed Modal',
        status: 'fail',
        message: 'Failed to generate detailed modal',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 6: Actionable Insight Generation
    try {
      const insight = engine.getSingleActionableInsight();
      if (insight.actionText && insight.marketAction && insight.confidence) {
        results.push({
          name: 'Actionable Insight',
          status: 'pass',
          message: 'Actionable insight generated',
          details: `Action: ${insight.marketAction}, Confidence: ${insight.confidence}`
        });
      } else {
        results.push({
          name: 'Actionable Insight',
          status: 'warning',
          message: 'Actionable insight incomplete',
          details: 'Missing required fields'
        });
      }
    } catch (error) {
      results.push({
        name: 'Actionable Insight',
        status: 'fail',
        message: 'Failed to generate actionable insight',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 7: Hook Integration
    if (dashboardData && intelligenceData) {
      results.push({
        name: 'Hook Integration',
        status: 'pass',
        message: 'Hook provides data successfully',
        details: `Efficiency: ${efficiency}, Risk: ${systemicRisk}`
      });
    } else if (loading) {
      results.push({
        name: 'Hook Integration',
        status: 'pending',
        message: 'Hook data still loading',
        details: 'Test may be running too early'
      });
    } else if (error) {
      results.push({
        name: 'Hook Integration',
        status: 'fail',
        message: 'Hook failed to provide data',
        details: error
      });
    } else {
      results.push({
        name: 'Hook Integration',
        status: 'warning',
        message: 'Hook data not available',
        details: 'Check hook implementation'
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-neon-lime" />;
      case 'fail': return <XCircle className="w-4 h-4 text-neon-orange" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-neon-gold" />;
      case 'pending': return <Clock className="w-4 h-4 text-text-secondary" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return 'border-neon-lime/50 bg-neon-lime/10';
      case 'fail': return 'border-neon-orange/50 bg-neon-orange/10';
      case 'warning': return 'border-neon-gold/50 bg-neon-gold/10';
      case 'pending': return 'border-text-secondary/50 bg-glass-bg';
      default: return 'border-glass-border bg-glass-bg';
    }
  };

  const summary = {
    total: testResults.length,
    passed: testResults.filter(r => r.status === 'pass').length,
    failed: testResults.filter(r => r.status === 'fail').length,
    warnings: testResults.filter(r => r.status === 'warning').length,
    pending: testResults.filter(r => r.status === 'pending').length
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card className="glass-tile border-neon-teal/30">
        <CardHeader>
          <CardTitle className="text-neon-teal font-mono">
            Global Financial Plumbing Engine - Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              Validates engine functionality, data generation, and UI integration
            </div>
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="bg-neon-teal/20 text-neon-teal border-neon-teal/30 hover:bg-neon-teal/30"
            >
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </Button>
          </div>

          {/* Test Summary */}
          {testResults.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-mono text-text-data">{summary.total}</div>
                <div className="text-xs text-text-secondary">TOTAL</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-mono text-neon-lime">{summary.passed}</div>
                <div className="text-xs text-text-secondary">PASSED</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-mono text-neon-orange">{summary.failed}</div>
                <div className="text-xs text-text-secondary">FAILED</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-mono text-neon-gold">{summary.warnings}</div>
                <div className="text-xs text-text-secondary">WARNINGS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-mono text-text-secondary">{summary.pending}</div>
                <div className="text-xs text-text-secondary">PENDING</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="grid gap-4">
          {testResults.map((result, index) => (
            <Card key={index} className={`glass-tile ${getStatusColor(result.status)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-mono text-sm font-bold text-text-data">
                        {result.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {result.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm text-text-secondary mb-2">
                      {result.message}
                    </div>
                    {result.details && (
                      <div className="text-xs font-mono text-text-muted bg-glass-bg p-2 rounded">
                        {result.details}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Component Previews */}
      <Separator className="border-glass-border" />
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-tile border-neon-teal/30">
          <CardHeader>
            <CardTitle className="text-neon-teal font-mono text-sm">
              Dashboard Tile Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GlobalPlumbingTile
              efficiency={parseFloat(String(efficiency || '85').replace('%', ''))}
              systemicRisk={String(systemicRisk || 'low').toLowerCase() as 'low' | 'moderate' | 'high' | 'critical'}
              trend="up"
              loading={loading}
            />
          </CardContent>
        </Card>

        <Card className="glass-tile border-neon-teal/30">
          <CardHeader>
            <CardTitle className="text-neon-teal font-mono text-sm">
              Intelligence View Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GlobalPlumbingIntelligence loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};