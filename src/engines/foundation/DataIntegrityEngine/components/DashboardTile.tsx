import React from 'react';
import { EngineOutput } from '@/engines/BaseEngine';

interface Props {
  data: EngineOutput;
  importance: number;
}

export const DataIntegrityTile: React.FC<Props> = ({ data, importance }) => {
  const getStatusColor = () => {
    if (data.primaryMetric.value >= 95) return 'hsl(180, 100%, 50%)'; // positive
    if (data.primaryMetric.value >= 80) return 'hsl(0, 0%, 85%)'; // primary
    if (data.primaryMetric.value >= 60) return 'hsl(50, 100%, 50%)'; // warning
    return 'hsl(14, 100%, 55%)'; // negative
  };
  
  const getBorderColor = () => {
    if (importance > 85) return 'hsl(14, 100%, 55%)'; // negative
    if (importance > 60) return 'hsl(300, 100%, 50%)'; // critical
    return 'hsl(0, 0%, 25%)'; // default
  };
  
  return (
    <div style={{
      border: `1px solid ${getBorderColor()}`,
      padding: '1rem',
      height: '200px',
      backgroundColor: 'hsl(0, 0%, 10%)',
      fontFamily: '"JetBrains Mono", monospace'
    }}>
      {/* Header */}
      <div style={{
        color: 'hsl(300, 100%, 50%)',
        fontSize: '0.875rem',
        marginBottom: '0.5rem',
        textTransform: 'uppercase'
      }}>
        Data Integrity
      </div>
      
      {/* Primary Metric */}
      <div style={{
        fontSize: '1.5rem',
        color: getStatusColor(),
        fontWeight: 700,
        marginBottom: '0.5rem'
      }}>
        {data.primaryMetric.value.toFixed(1)}%
      </div>
      
      {/* Sub Metrics */}
      <div style={{
        fontSize: '0.875rem',
        color: 'hsl(0, 0%, 60%)',
        marginBottom: '0.25rem'
      }}>
        System Health: {data.subMetrics?.healthyIndicators || 0}/{data.subMetrics?.totalIndicators || 0}
      </div>
      
      {/* Critical Issues */}
      {data.subMetrics?.criticalIssues > 0 && (
        <div style={{
          fontSize: '0.875rem',
          color: 'hsl(14, 100%, 55%)'
        }}>
          ⚠ {data.subMetrics.criticalIssues} CRITICAL ISSUES
        </div>
      )}
      
      {/* Analysis */}
      <div style={{
        fontSize: '0.875rem',
        color: 'hsl(0, 0%, 85%)',
        marginTop: '0.5rem',
        borderTop: '1px solid hsl(0, 0%, 25%)',
        paddingTop: '0.5rem'
      }}>
        {data.analysis}
      </div>
    </div>
  );
};