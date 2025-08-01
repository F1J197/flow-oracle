import React from 'react';
import { TerminalBox } from '@/components/Terminal/TerminalBox';
import { TerminalTable } from '@/components/Terminal/TerminalTable';
import { EngineOutput } from '@/engines/base/BaseEngine';
import { TERMINAL_THEME } from '@/config/theme';

interface Props {
  data: EngineOutput;
  historicalData?: any[];
}

export const DataIntegrityIntelligenceView: React.FC<Props> = ({ data, historicalData }) => {
  return (
    <TerminalBox 
      title="DATA INTEGRITY ENGINE" 
      status={data.signal === 'RISK_OFF' ? 'error' : 'active'}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: TERMINAL_THEME.spacing.lg,
        padding: TERMINAL_THEME.spacing.lg
      }}>
        {/* Column 1: Overview */}
        <div>
          <h3 style={{ 
            color: TERMINAL_THEME.colors.semantic.accent,
            marginBottom: TERMINAL_THEME.spacing.md 
          }}>
            SYSTEM OVERVIEW
          </h3>
          
          <div style={{ marginBottom: TERMINAL_THEME.spacing.md }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>
              Overall Score
            </div>
            <div style={{ 
              fontSize: TERMINAL_THEME.typography.sizes.xlarge,
              color: data.primaryMetric.value >= 80 
                ? TERMINAL_THEME.colors.semantic.positive
                : TERMINAL_THEME.colors.semantic.negative
            }}>
              {data.primaryMetric.value.toFixed(2)}%
            </div>
          </div>
          
          <div style={{ marginBottom: TERMINAL_THEME.spacing.md }}>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>
              24h Change
            </div>
            <div style={{ 
              color: data.primaryMetric.change24h >= 0
                ? TERMINAL_THEME.colors.semantic.positive
                : TERMINAL_THEME.colors.semantic.negative
            }}>
              {data.primaryMetric.change24h >= 0 ? '+' : ''}
              {data.primaryMetric.changePercent.toFixed(2)}%
            </div>
          </div>
          
          <div>
            <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>
              Confidence Level
            </div>
            <div>{data.confidence}%</div>
          </div>
        </div>
        
        {/* Column 2: Health Metrics */}
        <div>
          <h3 style={{ 
            color: TERMINAL_THEME.colors.semantic.accent,
            marginBottom: TERMINAL_THEME.spacing.md 
          }}>
            HEALTH METRICS
          </h3>
          
          <TerminalTable
            headers={['Metric', 'Value', 'Status']}
            rows={[
              ['Total Indicators', data.subMetrics?.totalIndicators || 0, 'MONITORING'],
              ['Healthy', data.subMetrics?.healthyIndicators || 0, 'GOOD'],
              ['Warnings', data.subMetrics?.warningIssues || 0, 'WATCH'],
              ['Critical', data.subMetrics?.criticalIssues || 0, 'ALERT'],
              ['Healing Attempts', data.subMetrics?.healingAttempts || 0, 'ACTIVE']
            ]}
          />
        </div>
        
        {/* Column 3: Alerts & Issues */}
        <div>
          <h3 style={{ 
            color: TERMINAL_THEME.colors.semantic.accent,
            marginBottom: TERMINAL_THEME.spacing.md 
          }}>
            ACTIVE ALERTS
          </h3>
          
          {data.alerts && data.alerts.length > 0 ? (
            <div>
              {data.alerts.map((alert, idx) => (
                <div 
                  key={idx}
                  style={{
                    marginBottom: TERMINAL_THEME.spacing.sm,
                    padding: TERMINAL_THEME.spacing.sm,
                    border: `1px solid ${
                      alert.level === 'critical' 
                        ? TERMINAL_THEME.colors.semantic.negative
                        : TERMINAL_THEME.colors.semantic.warning
                    }`,
                    fontSize: TERMINAL_THEME.typography.sizes.small
                  }}
                >
                  <div style={{ 
                    color: alert.level === 'critical'
                      ? TERMINAL_THEME.colors.semantic.negative
                      : TERMINAL_THEME.colors.semantic.warning
                  }}>
                    [{alert.level.toUpperCase()}]
                  </div>
                  <div>{alert.message}</div>
                  <div style={{ 
                    color: TERMINAL_THEME.colors.text.muted,
                    fontSize: TERMINAL_THEME.typography.sizes.micro
                  }}>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: TERMINAL_THEME.colors.text.secondary }}>
              No active alerts
            </div>
          )}
        </div>
      </div>
      
      {/* Analysis Section */}
      <div style={{
        borderTop: `1px solid ${TERMINAL_THEME.colors.border.default}`,
        marginTop: TERMINAL_THEME.spacing.lg,
        paddingTop: TERMINAL_THEME.spacing.lg,
        paddingLeft: TERMINAL_THEME.spacing.lg,
        paddingRight: TERMINAL_THEME.spacing.lg
      }}>
        <h3 style={{ 
          color: TERMINAL_THEME.colors.semantic.accent,
          marginBottom: TERMINAL_THEME.spacing.md 
        }}>
          SYSTEM ANALYSIS
        </h3>
        <div style={{ 
          fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
          lineHeight: TERMINAL_THEME.typography.lineHeight.relaxed
        }}>
          {data.analysis}
        </div>
      </div>
    </TerminalBox>
  );
};