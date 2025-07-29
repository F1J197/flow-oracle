import { IntelligenceViewData, DetailedModalData, DashboardTileData } from '@/types/engines';

/**
 * Helper functions to create default implementations for engines
 */

export function createDefaultIntelligenceView(
  title: string,
  dashboardData: DashboardTileData,
  additionalMetrics?: Record<string, any>
): IntelligenceViewData {
  return {
    title,
    status: dashboardData.status === 'critical' ? 'critical' : 
           dashboardData.status === 'warning' ? 'warning' : 'active',
    primaryMetrics: {
      primary: {
        value: dashboardData.primaryMetric,
        label: 'Primary Metric',
        status: dashboardData.status === 'critical' ? 'critical' : 
               dashboardData.status === 'warning' ? 'warning' : 'normal',
        trend: dashboardData.trend
      },
      ...(dashboardData.secondaryMetric ? {
        secondary: {
          value: dashboardData.secondaryMetric,
          label: 'Secondary Metric',
          status: 'normal'
        }
      } : {})
    },
    sections: [
      {
        title: 'Core Metrics',
        data: {
          status: {
            value: dashboardData.status,
            label: 'Current Status'
          },
          ...(additionalMetrics || {})
        }
      }
    ],
    confidence: 0.85,
    lastUpdate: new Date()
  };
}

export function createDefaultDetailedModal(
  title: string,
  description: string,
  dashboardData: DashboardTileData,
  additionalInsights?: string[]
): DetailedModalData {
  return {
    title,
    description,
    keyInsights: [
      `Current status: ${dashboardData.status}`,
      `Primary metric: ${dashboardData.primaryMetric}`,
      ...(dashboardData.actionText ? [`Action: ${dashboardData.actionText}`] : []),
      ...(additionalInsights || [])
    ],
    detailedMetrics: [
      {
        category: 'Current State',
        metrics: {
          'Primary Value': {
            value: dashboardData.primaryMetric,
            description: 'The main metric for this engine',
            significance: 'high'
          },
          'Status': {
            value: dashboardData.status,
            description: 'Current operational status',
            significance: 'high'
          },
          ...(dashboardData.secondaryMetric ? {
            'Secondary Value': {
              value: dashboardData.secondaryMetric,
              description: 'Additional supporting metric',
              significance: 'medium'
            }
          } : {})
        }
      }
    ],
    historicalContext: {
      period: 'Last 24 hours',
      comparison: 'Compared to previous period',
      significance: 'Current levels are within normal ranges'
    },
    actionItems: dashboardData.actionText ? [
      {
        priority: 'medium' as const,
        action: dashboardData.actionText,
        timeframe: 'Next 1-4 hours'
      }
    ] : []
  };
}