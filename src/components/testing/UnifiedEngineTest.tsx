/**
 * Unified Engine System Test Component - V6 Implementation
 * Demonstrates the new UnifiedBaseEngine architecture
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useUnifiedNetLiquidity } from '../../hooks/useUnifiedNetLiquidity';
import { AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const UnifiedEngineTest: React.FC = () => {
  const {
    report,
    dashboardData,
    intelligenceData,
    isLoading,
    error,
    lastUpdated,
    executeEngine,
    refresh
  } = useUnifiedNetLiquidity();

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'normal':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Unified Engine System Test</h1>
          <p className="text-muted-foreground">Testing UnifiedNetLiquidityEngine V6</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refresh} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button variant="outline" onClick={executeEngine} disabled={isLoading}>
            Execute Engine
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Dashboard Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Dashboard Tile Data
              {dashboardData && getStatusIcon(dashboardData.status)}
            </CardTitle>
            <CardDescription>
              Data formatted for dashboard consumption
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Primary Metric:</span>
                  <span className="text-2xl font-bold">{dashboardData.primaryMetric}</span>
                </div>
                
                {dashboardData.secondaryMetric && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Change:</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(dashboardData.trend)}
                      <span>{dashboardData.secondaryMetric}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={
                    dashboardData.status === 'normal' ? 'default' :
                    dashboardData.status === 'warning' ? 'secondary' : 'destructive'
                  }>
                    {dashboardData.status}
                  </Badge>
                </div>

                {dashboardData.actionText && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm">{dashboardData.actionText}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No dashboard data available</p>
            )}
          </CardContent>
        </Card>

        {/* Intelligence View Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Intelligence View Data
              {intelligenceData && getStatusIcon(intelligenceData.status)}
            </CardTitle>
            <CardDescription>
              Detailed analysis for intelligence dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {intelligenceData ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Primary Metrics</h4>
                  {Object.entries(intelligenceData.primaryMetrics).map(([key, metric]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm">{metric.label}:</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(metric.trend)}
                        <span className="font-mono">{metric.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Sections</h4>
                  {intelligenceData.sections.map((section, idx) => (
                    <div key={idx} className="p-2 bg-muted rounded">
                      <h5 className="text-sm font-medium mb-1">{section.title}</h5>
                      <div className="text-xs space-y-1">
                        {Object.entries(section.data).map(([key, data]) => (
                          <div key={key} className="flex justify-between">
                            <span>{data.label}:</span>
                            <span className="font-mono">{data.value} {data.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {intelligenceData.alerts && intelligenceData.alerts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Alerts</h4>
                    {intelligenceData.alerts.map((alert, idx) => (
                      <div key={idx} className={`p-2 rounded text-sm ${
                        alert.severity === 'critical' ? 'bg-red-50 text-red-700' :
                        alert.severity === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {alert.message}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Confidence: {(intelligenceData.confidence * 100).toFixed(0)}% | 
                  Last Updated: {intelligenceData.lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No intelligence data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engine Report */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle>Engine Execution Report</CardTitle>
            <CardDescription>Raw engine output and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium">Success:</span>
                <Badge variant={report.success ? 'default' : 'destructive'} className="ml-2">
                  {report.success ? 'Yes' : 'No'}
                </Badge>
              </div>
              
              <div>
                <span className="text-sm font-medium">Confidence:</span>
                <span className="ml-2 font-mono">{(report.confidence * 100).toFixed(1)}%</span>
              </div>
              
              <div>
                <span className="text-sm font-medium">Signal:</span>
                <Badge 
                  variant={
                    report.signal === 'bullish' ? 'default' :
                    report.signal === 'bearish' ? 'destructive' : 'secondary'
                  }
                  className="ml-2"
                >
                  {report.signal}
                </Badge>
              </div>
            </div>

            {report.data && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Engine Data</h4>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(report.data, null, 2)}
                </pre>
              </div>
            )}

            {report.errors && report.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-700 mb-2">Errors</h4>
                <ul className="text-sm text-red-600 space-y-1">
                  {report.errors.map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {lastUpdated && (
        <div className="text-center text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default UnifiedEngineTest;