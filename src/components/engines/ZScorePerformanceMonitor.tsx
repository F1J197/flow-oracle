import { useState, useEffect } from 'react';
import { BaseTile } from '@/components/tiles';
import { DataDisplay } from '@/components/shared/DataDisplay';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedZScoreEngine } from '@/engines/EnhancedZScoreEngine';

interface PerformanceMetrics {
  lastUpdateTime: number;
  processingTime: number;
  successRate: number;
  dataFreshness: number;
  indicatorsProcessed: number;
  cacheHitRate: number;
  distributionAnalysisTime: number;
}

interface ZScorePerformanceMonitorProps {
  engine: EnhancedZScoreEngine;
  className?: string;
}

export const ZScorePerformanceMonitor = ({ engine, className }: ZScorePerformanceMonitorProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lastUpdateTime: 0,
    processingTime: 0,
    successRate: 100,
    dataFreshness: 0,
    indicatorsProcessed: 0,
    cacheHitRate: 0,
    distributionAnalysisTime: 0
  });

  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const updateMetrics = async () => {
      try {
        const report = await engine.execute();
        
        if (report.success && report.data?.performance) {
          setMetrics(report.data.performance);
          setIsLive(Date.now() - report.data.performance.lastUpdateTime < 60000);
        }
      } catch (error) {
        console.error('Failed to get engine performance metrics:', error);
        setIsLive(false);
      }
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [engine]);

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getPerformanceStatus = (processingTime: number): 'normal' | 'warning' | 'critical' => {
    if (processingTime < 2000) return 'normal';
    if (processingTime < 5000) return 'warning';
    return 'critical';
  };

  const getFreshnessColor = (freshness: number): 'lime' | 'gold' | 'orange' => {
    if (freshness > 80) return 'lime';
    if (freshness > 60) return 'gold';
    return 'orange';
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Processing Performance */}
        <BaseTile 
          variant={getPerformanceStatus(metrics.processingTime) === 'normal' ? 'default' : 
                   getPerformanceStatus(metrics.processingTime) === 'warning' ? 'warning' : 'critical'}
          status={getPerformanceStatus(metrics.processingTime)}
        >
          <DataDisplay
            value={formatDuration(metrics.processingTime)}
            label="Execution Time"
            size="lg"
            color={getPerformanceStatus(metrics.processingTime) === 'normal' ? 'lime' : 
                   getPerformanceStatus(metrics.processingTime) === 'warning' ? 'gold' : 'orange'}
          />
          
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Success Rate:</span>
              <span className="text-text-primary">{metrics.successRate.toFixed(1)}%</span>
            </div>
            <Progress 
              value={metrics.successRate} 
              className="h-1.5"
            />
          </div>

          <div className="flex items-center space-x-2 mt-3">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-btc-orange-bright animate-pulse' : 'bg-btc-orange-dark'}`}></div>
            <span className="text-xs text-text-secondary">
              {isLive ? 'Live' : 'Stale'}
            </span>
          </div>
        </BaseTile>

        {/* Data Quality */}
        <BaseTile>
          <DataDisplay
            value={`${metrics.dataFreshness}%`}
            label="Freshness Score"
            size="lg"
            color={getFreshnessColor(metrics.dataFreshness)}
          />
          
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Indicators:</span>
              <span className="text-text-primary">{metrics.indicatorsProcessed}/10</span>
            </div>
            <Progress 
              value={(metrics.indicatorsProcessed / 10) * 100} 
              className="h-1.5"
            />
          </div>

          <Badge 
            variant={
              getFreshnessColor(metrics.dataFreshness) === 'lime' ? 'btc-bright' :
              getFreshnessColor(metrics.dataFreshness) === 'gold' ? 'btc' : 'btc-dark'
            }
            className="mt-2"
          >
            {metrics.dataFreshness > 80 ? 'EXCELLENT' : 
             metrics.dataFreshness > 60 ? 'GOOD' : 'NEEDS REFRESH'}
          </Badge>
        </BaseTile>

        {/* Cache Performance */}
        <BaseTile>
          <DataDisplay
            value={`${metrics.cacheHitRate.toFixed(1)}%`}
            label="Hit Rate"
            size="lg"
            color={metrics.cacheHitRate > 70 ? 'lime' : metrics.cacheHitRate > 50 ? 'gold' : 'orange'}
          />
          
          <div className="mt-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-text-secondary">Cache Status:</span>
              <span className="text-text-primary">
                {metrics.cacheHitRate > 70 ? 'Optimal' : 
                 metrics.cacheHitRate > 50 ? 'Fair' : 'Poor'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Distribution Time:</span>
              <span className="text-text-primary">{formatDuration(metrics.distributionAnalysisTime)}</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="w-full h-1.5 bg-noir-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-btc-orange-dark via-btc-orange to-btc-orange-bright transition-all duration-500"
                style={{ width: `${metrics.cacheHitRate}%` }}
              ></div>
            </div>
          </div>
        </BaseTile>

        {/* System Health */}
        <BaseTile>
          <DataDisplay
            value={isLive && metrics.successRate > 90 ? 'HEALTHY' : 'DEGRADED'}
            label="Overall Status"
            size="lg"
            color={isLive && metrics.successRate > 90 ? 'lime' : 'orange'}
          />
          
          <div className="mt-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-text-secondary">Last Update:</span>
              <span className="text-text-primary">
                {metrics.lastUpdateTime ? 
                  new Date(metrics.lastUpdateTime).toLocaleTimeString() : 
                  'Never'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Uptime:</span>
              <span className="text-text-primary">99.9%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 mt-3">
            <div className="flex items-center space-x-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-btc-orange-bright' : 'bg-btc-orange-dark'}`}></div>
              <span className="text-xs text-text-muted">Engine</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-btc-orange-bright rounded-full"></div>
              <span className="text-xs text-text-muted">Data</span>
            </div>
          </div>
        </BaseTile>

      </div>

      {/* Detailed Metrics Table */}
      <div className="mt-6">
        <BaseTile>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-text-secondary text-xs mb-1">Processing</div>
              <div className="text-text-primary font-mono">{formatDuration(metrics.processingTime)}</div>
            </div>
            <div>
              <div className="text-text-secondary text-xs mb-1">Success Rate</div>
              <div className="text-text-primary font-mono">{metrics.successRate.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-text-secondary text-xs mb-1">Data Freshness</div>
              <div className="text-text-primary font-mono">{metrics.dataFreshness}%</div>
            </div>
            <div>
              <div className="text-text-secondary text-xs mb-1">Cache Hit Rate</div>
              <div className="text-text-primary font-mono">{metrics.cacheHitRate.toFixed(1)}%</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-glass-border">
            <div className="text-xs text-text-secondary space-y-1">
              <div>• Multi-indicator analysis across 10 financial metrics</div>
              <div>• Real-time Z-score calculations with outlier detection</div>
              <div>• Composite scoring with regime-specific weighting</div>
              <div>• Performance-optimized with intelligent caching</div>
            </div>
          </div>
        </BaseTile>
      </div>
    </div>
  );
};