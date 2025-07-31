import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { useMasterPromptsRegistry } from '@/hooks/useMasterPromptsRegistry';
import { MasterPromptZScoreEngine } from '@/engines/foundation/EnhancedZScoreEngine/MasterPromptZScoreEngine';
import { MasterPromptDataIntegrityEngine } from '@/engines/foundation/DataIntegrityEngine/MasterPromptDataIntegrityEngine';
import { TerminalDashboard } from './TerminalDashboard';
import { MasterPromptsHealthCheck } from '@/components/debug/MasterPromptsHealthCheck';

export const MasterPromptIntegratedDashboard: React.FC = () => {
  const {
    isExecuting,
    results,
    metrics,
    lastExecution,
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

  // Register engines on mount
  React.useEffect(() => {
    const registerEngines = async () => {
      try {
        await registerMasterPromptEngine(new MasterPromptZScoreEngine());
        await registerMasterPromptEngine(new MasterPromptDataIntegrityEngine());
        
        // Execute engines after registration
        await executeEngines();
      } catch (error) {
        console.error('Failed to register Master Prompt engines:', error);
      }
    };
    
    registerEngines();
  }, [registerMasterPromptEngine, executeEngines]);

  // Get specific engine results
  const zScoreResult = getEngineResult('enhanced-zscore-engine');
  const dataIntegrityResult = getEngineResult('data-integrity-engine');

  const formatLastExecution = (date?: Date) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };

  const getStatusIcon = (success?: boolean) => {
    if (success === undefined) return <Activity className="h-4 w-4 text-muted-foreground" />;
    return success ? 
      <CheckCircle className="h-4 w-4 text-green-400" /> : 
      <AlertCircle className="h-4 w-4 text-red-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-mono text-neon-teal">
            LIQUIDITY² MASTER PROMPTS
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Global Liquidity Intelligence Platform V6 - {formatLastExecution(lastExecution)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={systemHealth > 80 ? "default" : "destructive"} className="font-mono">
            Health: {systemHealth.toFixed(0)}%
          </Badge>
          <Button 
            onClick={executeEngines} 
            disabled={isExecuting}
            size="sm"
            className="font-mono"
          >
            {isExecuting ? 'Executing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-mono">
            System Error: {error.message || String(error)}
          </AlertDescription>
        </Alert>
      )}

      {/* Master Prompts vs Legacy Tabs */}
      <Tabs defaultValue="master-prompts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="master-prompts" className="font-mono">
            Master Prompts V6
          </TabsTrigger>
          <TabsTrigger value="health-check" className="font-mono">
            Health Check
          </TabsTrigger>
          <TabsTrigger value="legacy" className="font-mono">
            Legacy System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="master-prompts" className="space-y-6">
          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono">Total Engines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{results.size}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-green-400">
                  {results.size > 0 ? 
                    Math.round((Array.from(results.values()).filter(r => r.success).length / results.size) * 100) : 0
                  }%
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono">Avg Execution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {metrics.averageExecutionTime?.toFixed(0) || 0}ms
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-neon-teal">
                  {systemHealth.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engine Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Z-Score Engine */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 font-mono">
                    <TrendingUp className="h-5 w-5" />
                    Z-Score Engine
                  </CardTitle>
                  {getStatusIcon(zScoreResult?.success)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {zScoreResult ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground font-mono">Z-Score</p>
                        <p className="font-bold font-mono text-lg">
                          {zScoreResult.data?.compositeZScore?.toFixed(2) || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-mono">Regime</p>
                        <p className="font-bold font-mono text-lg">
                          {zScoreResult.data?.marketRegime || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-mono">Signal</p>
                        <Badge variant={
                          zScoreResult.data?.signal === 'bullish' ? 'default' : 
                          zScoreResult.data?.signal === 'bearish' ? 'destructive' : 'secondary'
                        }>
                          {zScoreResult.data?.signal || 'neutral'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-mono">Confidence</p>
                        <p className="font-bold font-mono text-lg">
                          {((zScoreResult.data?.confidence || 0) * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground font-mono">Loading...</div>
                )}
              </CardContent>
            </Card>

            {/* Data Integrity Engine */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 font-mono">
                    <Database className="h-5 w-5" />
                    Data Integrity Engine
                  </CardTitle>
                  {getStatusIcon(dataIntegrityResult?.success)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {dataIntegrityResult ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground font-mono">Integrity Score</p>
                        <p className="font-bold font-mono text-lg">
                          {((dataIntegrityResult.data?.integrityScore || 0) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-mono">Status</p>
                        <Badge variant={
                          dataIntegrityResult.data?.systemStatus === 'OPTIMAL' ? 'default' :
                          dataIntegrityResult.data?.systemStatus === 'GOOD' ? 'secondary' : 'destructive'
                        }>
                          {dataIntegrityResult.data?.systemStatus || 'Unknown'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-mono">Active Sources</p>
                        <p className="font-bold font-mono text-lg">
                          {dataIntegrityResult.data?.activeSources || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-mono">Auto Healed</p>
                        <p className="font-bold font-mono text-lg">
                          {dataIntegrityResult.data?.autoHealedCount || 0}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground font-mono">Loading...</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Master Prompts Registry Status */}
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Master Prompts Registry Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground font-mono">Execution Results</p>
                  <p className="font-bold font-mono text-xl">{results.size}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-mono">System Health</p>
                  <p className="font-bold font-mono text-xl">{systemHealth.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-mono">Last Execution</p>
                  <p className="font-bold font-mono text-xl">
                    {lastExecution ? 'Success' : 'Pending'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health-check">
          <MasterPromptsHealthCheck 
            onFixApplied={() => {
              console.log('Auto-fixes applied, refreshing engines...');
              executeEngines();
            }}
          />
        </TabsContent>

        <TabsContent value="legacy">
          <TerminalDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};