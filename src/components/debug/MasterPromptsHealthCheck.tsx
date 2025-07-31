import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { validateMasterPromptsCompliance, autoFixCompliance, type ComplianceReport } from '@/utils/masterPromptsCompliance';

interface HealthCheckProps {
  onFixApplied?: () => void;
}

export const MasterPromptsHealthCheck: React.FC<HealthCheckProps> = ({ onFixApplied }) => {
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const runHealthCheck = async () => {
    setIsRunning(true);
    try {
      const compliance = validateMasterPromptsCompliance();
      setReport(compliance);
    } catch (error) {
      console.error('Health check failed:', error);
      setReport({
        compliant: false,
        score: 0,
        issues: [{
          severity: 'critical',
          category: 'implementation',
          message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        recommendations: ['Fix health check implementation']
      });
    } finally {
      setIsRunning(false);
    }
  };

  const applyAutoFixes = async () => {
    setIsFixing(true);
    try {
      const fixes = autoFixCompliance();
      console.log('Applied fixes:', fixes);
      onFixApplied?.();
      // Re-run health check
      await runHealthCheck();
    } catch (error) {
      console.error('Auto-fix failed:', error);
    } finally {
      setIsFixing(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const getStatusIcon = (compliant: boolean, score: number) => {
    if (compliant) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score > 50) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = (compliant: boolean, score: number) => {
    if (compliant) return 'default';
    if (score > 50) return 'secondary';
    return 'destructive';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className={`h-5 w-5 ${isRunning ? 'animate-spin' : ''}`} />
            Master Prompts Health Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            {isRunning ? 'Running health check...' : 'Loading...'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(report.compliant, report.score)}
              Master Prompts Compliance Report
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor(report.compliant, report.score)}>
                Score: {report.score}/100
              </Badge>
              <Button 
                onClick={runHealthCheck} 
                disabled={isRunning}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {!report.compliant && (
                <Button 
                  onClick={applyAutoFixes} 
                  disabled={isFixing}
                  size="sm"
                >
                  {isFixing ? 'Fixing...' : 'Auto Fix'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Compliance Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Status</p>
                <p className="font-semibold">
                  {report.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="font-semibold">{report.score}/100</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issues Found</p>
                <p className="font-semibold">{report.issues.length}</p>
              </div>
            </div>

            {/* Issues */}
            {report.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Issues Detected:</h4>
                {report.issues.map((issue, index) => (
                  <Alert key={index} variant={issue.severity === 'critical' ? 'destructive' : 'default'}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getSeverityColor(issue.severity)}>
                              {issue.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {issue.category}
                            </Badge>
                          </div>
                          <p className="text-sm">{issue.message}</p>
                          {issue.solution && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Solution: {issue.solution}
                            </p>
                          )}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Recommendations:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {report.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};