/**
 * Master Prompt Compliant Dashboard Component
 * Integrates with MasterPromptsEngineRegistry
 */

import React, { useEffect } from 'react';
import { useMasterPromptsRegistry } from '@/hooks/useMasterPromptsRegistry';
import { MasterPromptZScoreEngine } from '@/engines/foundation/EnhancedZScoreEngine/MasterPromptZScoreEngine';
import { MasterPromptDataIntegrityEngine } from '@/engines/foundation/DataIntegrityEngine/MasterPromptDataIntegrityEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export function MasterPromptDashboard() {
  const {
    isExecuting,
    results,
    metrics,
    error,
    systemHealth,
    executeEngines,
    registerMasterPromptEngine,
    getEngineResult
  } = useMasterPromptsRegistry({
    autoExecute: true,
    refreshInterval: 15000,
    enableLegacySupport: true
  });

  // Register Master Prompt engines on mount
  useEffect(() => {
    const zscoreEngine = new MasterPromptZScoreEngine();
    const dataIntegrityEngine = new MasterPromptDataIntegrityEngine();
    
    registerMasterPromptEngine(zscoreEngine);
    registerMasterPromptEngine(dataIntegrityEngine);
    
    console.log('✅ Master Prompt engines registered successfully');
  }, [registerMasterPromptEngine]);

  // Get specific engine results
  const zscoreResult = getEngineResult('master-prompt-zscore-foundation');
  const dataIntegrityResult = getEngineResult('master-prompt-data-integrity-foundation');

  const getStatusIcon = (success?: boolean) => {
    if (success === undefined) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (success) return <CheckCircle className="h-4 w-4 text-success" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  const getStatusColor = (success?: boolean) => {
    if (success === undefined) return 'secondary';
    if (success) return 'default';
    return 'destructive';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-mono font-bold text-primary">
              LIQUIDITY² - Master Prompts V6
            </h1>
            <p className="text-muted-foreground mt-1">
              100% Master Prompts Compliant Engine System
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant={isExecuting ? "secondary" : "default"} className="font-mono">
              {isExecuting ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  EXECUTING
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  READY
                </>
              )}
            </Badge>
            
            <Badge variant="outline" className="font-mono">
              Health: {(systemHealth * 100).toFixed(0)}%
            </Badge>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-mono">
              {error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-tile">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground">Total Engines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold text-primary">
                {metrics.totalEngines}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-tile">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground">Active Engines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold text-accent">
                {metrics.activeEngines}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-tile">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold text-success">
                {metrics.totalEngines > 0 
                  ? Math.round((metrics.successfulExecutions / (metrics.successfulExecutions + metrics.failedExecutions)) * 100)
                  : 0}%
              </div>
            </CardContent>
          </Card>

          <Card className="glass-tile">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground">Avg Execution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold text-muted-foreground">
                {metrics.averageExecutionTime.toFixed(0)}ms
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Engine Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Z-Score Engine */}
          <Card className="glass-tile">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-mono text-lg">Master Prompt Z-Score Engine</CardTitle>
                <Badge variant={getStatusColor(zscoreResult?.success)} className="font-mono">
                  {getStatusIcon(zscoreResult?.success)}
                  {zscoreResult?.success ? 'ACTIVE' : zscoreResult === null ? 'PENDING' : 'ERROR'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {zscoreResult ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-mono text-muted-foreground">Composite Z-Score</div>
                      <div className="text-xl font-mono font-bold text-primary">
                        {zscoreResult.data?.composite?.value?.toFixed(2) || 'N/A'}σ
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-mono text-muted-foreground">Market Regime</div>
                      <div className="text-xl font-mono font-bold text-accent">
                        {zscoreResult.data?.composite?.regime || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-mono text-muted-foreground">Signal</div>
                      <Badge variant={
                        zscoreResult.signal === 'bullish' ? 'default' :
                        zscoreResult.signal === 'bearish' ? 'destructive' : 'secondary'
                      } className="font-mono">
                        {zscoreResult.signal?.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm font-mono text-muted-foreground">Confidence</div>
                      <div className="text-lg font-mono font-bold">
                        {(zscoreResult.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground font-mono">Initializing...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Integrity Engine */}
          <Card className="glass-tile">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-mono text-lg">Master Prompt Data Integrity Engine</CardTitle>
                <Badge variant={getStatusColor(dataIntegrityResult?.success)} className="font-mono">
                  {getStatusIcon(dataIntegrityResult?.success)}
                  {dataIntegrityResult?.success ? 'ACTIVE' : dataIntegrityResult === null ? 'PENDING' : 'ERROR'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {dataIntegrityResult ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-mono text-muted-foreground">Integrity Score</div>
                      <div className="text-xl font-mono font-bold text-primary">
                        {dataIntegrityResult.data?.integrityScore?.toFixed(1) || 'N/A'}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-mono text-muted-foreground">System Status</div>
                      <div className="text-xl font-mono font-bold text-accent">
                        {dataIntegrityResult.data?.systemStatus || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-mono text-muted-foreground">Active Sources</div>
                      <div className="text-lg font-mono font-bold">
                        {dataIntegrityResult.data?.activeSources || 0}/{dataIntegrityResult.data?.totalSources || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-mono text-muted-foreground">Auto-Healed (24h)</div>
                      <div className="text-lg font-mono font-bold text-success">
                        {dataIntegrityResult.data?.autoHealed24h || 0}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground font-mono">Initializing...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Registry Status */}
        <Card className="glass-tile">
          <CardHeader>
            <CardTitle className="font-mono text-lg">Master Prompts Registry Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-mono text-muted-foreground">Execution Results</div>
                <div className="text-2xl font-mono font-bold text-primary">
                  {results.size}
                </div>
                <div className="text-xs text-muted-foreground">
                  Active engine results
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-mono text-muted-foreground">System Health</div>
                <div className="text-2xl font-mono font-bold text-accent">
                  {(systemHealth * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Overall system reliability
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-mono text-muted-foreground">Last Execution</div>
                <div className="text-lg font-mono font-bold text-muted-foreground">
                  {isExecuting ? 'Running...' : 'Completed'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Master Prompts compliant
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}