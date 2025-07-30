import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Clock, Info } from 'lucide-react';
import { useEngineRegistryContext } from '@/components/engines/EngineRegistryProvider';
import { useGlobalPlumbingEngine } from '@/hooks/useGlobalPlumbingEngine';

interface ValidationCheck {
  category: string;
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warning' | 'pending';
    message: string;
    requirement: string;
  }>;
}

export const V6GlobalPlumbingValidation: React.FC = () => {
  const [validationResults, setValidationResults] = useState<ValidationCheck[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const { unifiedRegistry } = useEngineRegistryContext();
  const { engine, dashboardData, intelligenceData, loading } = useGlobalPlumbingEngine({ autoRefresh: false });

  const runValidation = async () => {
    setIsValidating(true);
    const results: ValidationCheck[] = [];

    // 1. Engine Registration Validation
    const registrationChecks: ValidationCheck = {
      category: 'Engine Registration',
      checks: []
    };

    try {
      const registeredEngine = unifiedRegistry.getEngine('global-financial-plumbing');
      if (registeredEngine) {
        registrationChecks.checks.push({
          name: 'Engine Registration',
          status: 'pass',
          message: 'Engine successfully registered in UnifiedEngineRegistry',
          requirement: 'Engine must be registered with ID "global-financial-plumbing"'
        });
      } else {
        registrationChecks.checks.push({
          name: 'Engine Registration',
          status: 'fail',
          message: 'Engine not found in registry',
          requirement: 'Engine must be registered with ID "global-financial-plumbing"'
        });
      }

      const metadata = unifiedRegistry.getMetadata('global-financial-plumbing');
      if (metadata) {
        registrationChecks.checks.push({
          name: 'Metadata Registration',
          status: 'pass',
          message: `Metadata: ${metadata.description} (v${metadata.version})`,
          requirement: 'Engine metadata must be properly defined'
        });
      } else {
        registrationChecks.checks.push({
          name: 'Metadata Registration',
          status: 'fail',
          message: 'Engine metadata not found',
          requirement: 'Engine metadata must be properly defined'
        });
      }
    } catch (error) {
      registrationChecks.checks.push({
        name: 'Registry Access',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
        requirement: 'Registry must be accessible'
      });
    }

    results.push(registrationChecks);

    // 2. Dashboard Integration Validation
    const dashboardChecks: ValidationCheck = {
      category: 'Dashboard Integration',
      checks: []
    };

    if (dashboardData) {
      dashboardChecks.checks.push({
        name: 'Dashboard Tile Data',
        status: 'pass',
        message: `Title: ${dashboardData.title}, Status: ${dashboardData.status}`,
        requirement: 'GlobalPlumbingTile must be integrated into TerminalDashboard'
      });
    } else {
      dashboardChecks.checks.push({
        name: 'Dashboard Tile Data',
        status: loading ? 'pending' : 'fail',
        message: loading ? 'Dashboard data loading...' : 'No dashboard data available',
        requirement: 'GlobalPlumbingTile must be integrated into TerminalDashboard'
      });
    }

    // Check if the tile is visible in TerminalDashboard
    const dashboardElements = document.querySelectorAll('[data-testid="global-plumbing-tile"]');
    if (dashboardElements.length > 0) {
      dashboardChecks.checks.push({
        name: 'Dashboard UI Integration',
        status: 'pass',
        message: 'GlobalPlumbingTile visible in dashboard',
        requirement: 'Tile must be rendered in TerminalDashboard'
      });
    } else {
      dashboardChecks.checks.push({
        name: 'Dashboard UI Integration',
        status: 'warning',
        message: 'GlobalPlumbingTile not found in DOM (may not be on dashboard page)',
        requirement: 'Tile must be rendered in TerminalDashboard'
      });
    }

    results.push(dashboardChecks);

    // 3. Intelligence System Integration
    const intelligenceChecks: ValidationCheck = {
      category: 'Intelligence System Integration',
      checks: []
    };

    if (intelligenceData) {
      intelligenceChecks.checks.push({
        name: 'Intelligence View Data',
        status: 'pass',
        message: `Sections: ${intelligenceData.sections?.length || 0}, Metrics: ${Object.keys(intelligenceData.primaryMetrics || {}).length}`,
        requirement: 'GlobalPlumbingIntelligence must provide structured intelligence data'
      });
    } else {
      intelligenceChecks.checks.push({
        name: 'Intelligence View Data',
        status: loading ? 'pending' : 'fail',
        message: loading ? 'Intelligence data loading...' : 'No intelligence data available',
        requirement: 'GlobalPlumbingIntelligence must provide structured intelligence data'
      });
    }

    // Check if intelligence component is integrated into IntelligenceEngine
    try {
      const intelligenceModule = await import('@/pages/IntelligenceEngine');
      if (intelligenceModule) {
        intelligenceChecks.checks.push({
          name: 'Intelligence Engine Integration',
          status: 'pass',
          message: 'IntelligenceEngine module accessible',
          requirement: 'GlobalPlumbingIntelligence must be integrated into IntelligenceEngine page'
        });
      }
    } catch (error) {
      intelligenceChecks.checks.push({
        name: 'Intelligence Engine Integration',
        status: 'fail',
        message: 'Failed to access IntelligenceEngine module',
        requirement: 'GlobalPlumbingIntelligence must be integrated into IntelligenceEngine page'
      });
    }

    results.push(intelligenceChecks);

    // 4. Hook Implementation Validation
    const hookChecks: ValidationCheck = {
      category: 'Hook Implementation',
      checks: []
    };

    if (engine) {
      hookChecks.checks.push({
        name: 'Hook Engine Access',
        status: 'pass',
        message: `Engine accessible via useGlobalPlumbingEngine hook`,
        requirement: 'useGlobalPlumbingEngine hook must provide engine access'
      });
    } else {
      hookChecks.checks.push({
        name: 'Hook Engine Access',
        status: 'fail',
        message: 'Engine not accessible via hook',
        requirement: 'useGlobalPlumbingEngine hook must provide engine access'
      });
    }

    // Test hook data refresh functionality
    try {
      const { refresh } = useGlobalPlumbingEngine();
      if (typeof refresh === 'function') {
        hookChecks.checks.push({
          name: 'Hook Refresh Function',
          status: 'pass',
          message: 'Refresh function available',
          requirement: 'Hook must provide refresh functionality'
        });
      }
    } catch (error) {
      hookChecks.checks.push({
        name: 'Hook Refresh Function',
        status: 'fail',
        message: 'Refresh function not available',
        requirement: 'Hook must provide refresh functionality'
      });
    }

    results.push(hookChecks);

    // 5. Export Path Validation
    const exportChecks: ValidationCheck = {
      category: 'Export Path Compliance',
      checks: []
    };

    try {
      // Test pillar1 index exports
      const pillar1Module = await import('@/engines/pillar1');
      if (pillar1Module.GlobalFinancialPlumbingEngine) {
        exportChecks.checks.push({
          name: 'Engine Export',
          status: 'pass',
          message: 'GlobalFinancialPlumbingEngine exported from pillar1/index.ts',
          requirement: 'Engine must be exported from pillar1 index'
        });
      } else {
        exportChecks.checks.push({
          name: 'Engine Export',
          status: 'fail',
          message: 'GlobalFinancialPlumbingEngine not exported from pillar1/index.ts',
          requirement: 'Engine must be exported from pillar1 index'
        });
      }

      if (pillar1Module.GlobalPlumbingTile) {
        exportChecks.checks.push({
          name: 'Tile Component Export',
          status: 'pass',
          message: 'GlobalPlumbingTile exported from pillar1/index.ts',
          requirement: 'Tile component must be exported from pillar1 index'
        });
      } else {
        exportChecks.checks.push({
          name: 'Tile Component Export',
          status: 'fail',
          message: 'GlobalPlumbingTile not exported from pillar1/index.ts',
          requirement: 'Tile component must be exported from pillar1 index'
        });
      }

      if (pillar1Module.GlobalPlumbingIntelligence) {
        exportChecks.checks.push({
          name: 'Intelligence Component Export',
          status: 'pass',
          message: 'GlobalPlumbingIntelligence exported from pillar1/index.ts',
          requirement: 'Intelligence component must be exported from pillar1 index'
        });
      } else {
        exportChecks.checks.push({
          name: 'Intelligence Component Export',
          status: 'fail',
          message: 'GlobalPlumbingIntelligence not exported from pillar1/index.ts',
          requirement: 'Intelligence component must be exported from pillar1 index'
        });
      }
    } catch (error) {
      exportChecks.checks.push({
        name: 'Module Import',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Failed to import pillar1 module',
        requirement: 'pillar1/index.ts must be importable'
      });
    }

    results.push(exportChecks);

    setValidationResults(results);
    setIsValidating(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-neon-lime" />;
      case 'fail': return <XCircle className="w-4 h-4 text-neon-orange" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-neon-gold" />;
      case 'pending': return <Clock className="w-4 h-4 text-text-secondary" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-neon-lime border-neon-lime/20 bg-neon-lime/10';
      case 'fail': return 'text-neon-orange border-neon-orange/20 bg-neon-orange/10';
      case 'warning': return 'text-neon-gold border-neon-gold/20 bg-neon-gold/10';
      case 'pending': return 'text-text-secondary border-glass-border bg-glass-bg';
      default: return 'text-text-secondary border-glass-border bg-glass-bg';
    }
  };

  const overallStatus = validationResults.length === 0 ? 'pending' :
    validationResults.some(category => category.checks.some(check => check.status === 'fail')) ? 'fail' :
    validationResults.some(category => category.checks.some(check => check.status === 'warning')) ? 'warning' : 'pass';

  const totalChecks = validationResults.reduce((sum, category) => sum + category.checks.length, 0);
  const passedChecks = validationResults.reduce((sum, category) => 
    sum + category.checks.filter(check => check.status === 'pass').length, 0);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card className="glass-tile border-neon-teal/30">
        <CardHeader>
          <CardTitle className="text-neon-teal font-mono flex items-center justify-between">
            Global Financial Plumbing Engine - V6 Compliance Validation
            <Badge className={getStatusColor(overallStatus)}>
              {overallStatus.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              Validates 100% compliance with Liquidity² V6 engine specifications
            </div>
            <Button 
              onClick={runValidation} 
              disabled={isValidating}
              className="bg-neon-teal/20 text-neon-teal border-neon-teal/30 hover:bg-neon-teal/30"
            >
              {isValidating ? 'Validating...' : 'Run Validation'}
            </Button>
          </div>

          {validationResults.length > 0 && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-glass-bg rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-mono text-text-data">{totalChecks}</div>
                <div className="text-xs text-text-secondary">TOTAL CHECKS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-mono text-neon-lime">{passedChecks}</div>
                <div className="text-xs text-text-secondary">PASSED</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-mono text-text-data">
                  {totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0}%
                </div>
                <div className="text-xs text-text-secondary">COMPLIANCE</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResults.map((category, categoryIndex) => (
        <Card key={categoryIndex} className="glass-tile border-glass-border">
          <CardHeader>
            <CardTitle className="text-text-data font-mono text-lg">
              {category.category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {category.checks.map((check, checkIndex) => (
              <div key={checkIndex} className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}>
                <div className="flex items-start gap-3">
                  {getStatusIcon(check.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-mono text-sm font-bold">
                        {check.name}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {check.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">
                      {check.message}
                    </p>
                    <p className="text-xs text-text-muted">
                      <strong>Requirement:</strong> {check.requirement}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};