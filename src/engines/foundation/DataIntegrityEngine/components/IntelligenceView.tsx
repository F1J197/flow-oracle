import React from 'react';
import { EngineOutput } from '@/engines/BaseEngine';

interface Props {
  data: EngineOutput | null;
  historicalData?: any[];
  loading?: boolean;
  error?: string | null;
}

export const DataIntegrityIntelligenceView: React.FC<Props> = ({ data, historicalData, loading, error }) => {
  // Handle loading state
  if (loading) {
    return (
      <div style={{
        backgroundColor: 'hsl(0, 0%, 5%)',
        border: '1px solid hsl(0, 0%, 25%)',
        padding: '2rem',
        fontFamily: '"JetBrains Mono", monospace',
        textAlign: 'center',
        color: 'hsl(0, 0%, 60%)'
      }}>
        <div>Loading data integrity metrics...</div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div style={{
        backgroundColor: 'hsl(0, 0%, 5%)',
        border: '1px solid hsl(14, 100%, 55%)',
        padding: '2rem',
        fontFamily: '"JetBrains Mono", monospace',
        textAlign: 'center'
      }}>
        <div style={{ color: 'hsl(14, 100%, 55%)', marginBottom: '0.5rem' }}>
          [ERROR]
        </div>
        <div style={{ color: 'hsl(0, 0%, 60%)' }}>
          Failed to load data integrity metrics: {error}
        </div>
      </div>
    );
  }

  // Handle null data state
  if (!data) {
    return (
      <div style={{
        backgroundColor: 'hsl(0, 0%, 5%)',
        border: '1px solid hsl(50, 100%, 50%)',
        padding: '2rem',
        fontFamily: '"JetBrains Mono", monospace',
        textAlign: 'center'
      }}>
        <div style={{ color: 'hsl(50, 100%, 50%)', marginBottom: '0.5rem' }}>
          [WARNING]
        </div>
        <div style={{ color: 'hsl(0, 0%, 60%)' }}>
          Data integrity metrics unavailable. Initializing engine...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'hsl(0, 0%, 5%)',
      border: '1px solid hsl(0, 0%, 25%)',
      padding: '1rem',
      fontFamily: '"JetBrains Mono", monospace'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.5rem',
        padding: '1.5rem'
      }}>
        {/* Column 1: Overview */}
        <div>
          <h3 style={{ 
            color: 'hsl(300, 100%, 50%)',
            marginBottom: '1rem' 
          }}>
            SYSTEM OVERVIEW
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: 'hsl(0, 0%, 60%)' }}>
              Overall Score
            </div>
            <div style={{ 
              fontSize: '1.5rem',
              color: (data.primaryMetric?.value ?? 0) >= 80 
                ? 'hsl(180, 100%, 50%)'
                : 'hsl(14, 100%, 55%)'
            }}>
              {(data.primaryMetric?.value ?? 0).toFixed(2)}%
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: 'hsl(0, 0%, 60%)' }}>
              24h Change
            </div>
            <div style={{ 
              color: (data.primaryMetric?.change24h ?? 0) >= 0
                ? 'hsl(180, 100%, 50%)'
                : 'hsl(14, 100%, 55%)'
            }}>
              {(data.primaryMetric?.change24h ?? 0) >= 0 ? '+' : ''}
              {(data.primaryMetric?.changePercent ?? 0).toFixed(2)}%
            </div>
          </div>
          
          <div>
            <div style={{ color: 'hsl(0, 0%, 60%)' }}>
              Confidence Level
            </div>
            <div>{(data.confidence ?? 0).toFixed(1)}%</div>
          </div>
        </div>
        
        {/* Column 2: Health Metrics */}
        <div>
          <h3 style={{ 
            color: 'hsl(300, 100%, 50%)',
            marginBottom: '1rem' 
          }}>
            HEALTH METRICS
          </h3>
          
          <div style={{
            border: '1px solid hsl(0, 0%, 25%)',
            padding: '0.5rem'
          }}>
            <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span>Total Indicators: </span>
              <span style={{ color: 'hsl(180, 100%, 50%)' }}>{data.subMetrics?.totalIndicators || 0}</span>
            </div>
            <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span>Healthy: </span>
              <span style={{ color: 'hsl(90, 100%, 50%)' }}>{data.subMetrics?.healthyIndicators || 0}</span>
            </div>
            <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span>Warnings: </span>
              <span style={{ color: 'hsl(50, 100%, 50%)' }}>{data.subMetrics?.warningIssues || 0}</span>
            </div>
            <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span>Critical: </span>
              <span style={{ color: 'hsl(14, 100%, 55%)' }}>{data.subMetrics?.criticalIssues || 0}</span>
            </div>
            <div style={{ fontSize: '0.875rem' }}>
              <span>Healing Attempts: </span>
              <span style={{ color: 'hsl(240, 100%, 60%)' }}>{data.subMetrics?.healingAttempts || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Column 3: Alerts & Issues */}
        <div>
          <h3 style={{ 
            color: 'hsl(300, 100%, 50%)',
            marginBottom: '1rem' 
          }}>
            ACTIVE ALERTS
          </h3>
          
          {data.alerts && data.alerts.length > 0 ? (
            <div>
              {data.alerts.map((alert, idx) => (
                <div 
                  key={idx}
                  style={{
                    marginBottom: '0.5rem',
                    padding: '0.5rem',
                    border: `1px solid ${
                      alert.level === 'critical' 
                        ? 'hsl(14, 100%, 55%)'
                        : 'hsl(50, 100%, 50%)'
                    }`,
                    fontSize: '0.875rem'
                  }}
                >
                  <div style={{ 
                    color: alert.level === 'critical'
                      ? 'hsl(14, 100%, 55%)'
                      : 'hsl(50, 100%, 50%)'
                  }}>
                    [{alert.level.toUpperCase()}]
                  </div>
                  <div>{alert.message}</div>
                  <div style={{ 
                    color: 'hsl(0, 0%, 50%)',
                    fontSize: '0.75rem'
                  }}>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'hsl(0, 0%, 60%)' }}>
              No active alerts
            </div>
          )}
        </div>
      </div>
      
      {/* Analysis Section */}
      <div style={{
        borderTop: '1px solid hsl(0, 0%, 25%)',
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem'
      }}>
        <h3 style={{ 
          color: 'hsl(300, 100%, 50%)',
          marginBottom: '1rem' 
        }}>
          SYSTEM ANALYSIS
        </h3>
        <div style={{ 
          fontFamily: '"JetBrains Mono", monospace',
          lineHeight: '1.5'
        }}>
          {data.analysis || 'Analysis not available'}
        </div>
      </div>
    </div>
  );
};