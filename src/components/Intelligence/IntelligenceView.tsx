import { useState } from 'react';
import { TERMINAL_THEME } from '@/config/theme';
import { TestEngine } from '@/engines/TestEngine';
import { EnhancedMomentumEngine } from '@/engines/foundation/EnhancedMomentumEngine';
import { EnhancedMomentumIntelligenceView } from '@/engines/foundation/EnhancedMomentumEngine/components/IntelligenceView';

export function IntelligenceView() {
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null);
  
  const engines = [
    { id: 'test-engine', name: 'TEST ENGINE', description: 'System validation engine' },
    { id: 'enhanced-momentum', name: 'ENHANCED MOMENTUM ENGINE', description: 'Critical foundation engine - velocity & acceleration analysis' }
  ];

  const getEngineDetailedView = (engineId: string) => {
    if (engineId === 'test-engine') {
      const testEngine = new TestEngine();
      const mockData = new Map();
      mockData.set('VIX', 18.5);
      const output = testEngine.calculate(mockData);
      
      return {
        title: 'TEST ENGINE INTELLIGENCE',
        status: 'active' as const,
        primaryMetrics: {
          vixLevel: {
            value: output.primaryMetric.value,
            label: 'VIX Level',
            status: output.signal === 'RISK_ON' ? 'normal' : 'warning' as const,
            trend: output.primaryMetric.change24h > 0 ? 'up' : 'down' as const
          },
          signal: {
            value: output.signal,
            label: 'Market Signal',
            status: output.signal === 'RISK_ON' ? 'normal' : 'warning' as const
          }
        },
        sections: [
          {
            title: 'Risk Assessment',
            data: {
              confidence: {
                value: `${output.confidence}%`,
                label: 'Confidence Level',
                status: output.confidence > 70 ? 'normal' : 'warning' as const
              },
              threshold: {
                value: output.subMetrics.threshold,
                label: 'Alert Threshold',
                unit: 'VIX'
              },
              status: {
                value: output.subMetrics.status,
                label: 'Current Status'
              }
            }
          },
          {
            title: 'Analysis',
            data: {
              summary: {
                value: output.analysis,
                label: 'Market Analysis'
              }
            }
          }
        ],
        confidence: output.confidence,
        lastUpdate: new Date()
      };
    }
    return null;
  };

  if (selectedEngine) {
    if (selectedEngine === 'enhanced-momentum') {
      const momentumEngine = new EnhancedMomentumEngine();
      const mockData = new Map([
        ['VIX', [18.5, 19.2, 17.8, 18.5, 19.1]],
        ['WALCL', [8500000, 8520000, 8510000, 8530000, 8540000]],
        ['BTCUSD', [45000, 46200, 44800, 45500, 46000]]
      ]);
      
      // Add more mock historical data for proper calculation
      for (let i = 0; i < 130; i++) {
        mockData.set(`MOCK_${i}`, Array.from({length: 150}, (_, j) => 100 + Math.sin(j * 0.1) * 10 + Math.random() * 5));
      }
      
      const output = momentumEngine.calculate(mockData);
      return <EnhancedMomentumIntelligenceView data={output} />;
    }
    
    const engineData = getEngineDetailedView(selectedEngine);
    if (!engineData) return null;

    return (
      <div style={{
        backgroundColor: TERMINAL_THEME.colors.background.secondary,
        border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
        padding: TERMINAL_THEME.spacing.lg
      }}>
        {/* Back button */}
        <button
          onClick={() => setSelectedEngine(null)}
          style={{
            background: 'none',
            border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
            color: TERMINAL_THEME.colors.text.secondary,
            fontSize: TERMINAL_THEME.typography.sizes.small,
            fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
            padding: `${TERMINAL_THEME.spacing.sm} ${TERMINAL_THEME.spacing.md}`,
            cursor: 'pointer',
            marginBottom: TERMINAL_THEME.spacing.lg
          }}
        >
          ← BACK TO ENGINES
        </button>

        {/* Engine header */}
        <div style={{
          color: TERMINAL_THEME.colors.headers.primary,
          fontSize: TERMINAL_THEME.typography.sizes.xlarge,
          fontWeight: TERMINAL_THEME.typography.weights.bold,
          fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
          marginBottom: TERMINAL_THEME.spacing.lg,
          letterSpacing: '1px'
        }}>
          {engineData.title}
        </div>

        {/* Primary metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: TERMINAL_THEME.spacing.lg,
          marginBottom: TERMINAL_THEME.spacing.xl
        }}>
          {Object.entries(engineData.primaryMetrics).map(([key, metric]) => (
            <div key={key} style={{
              backgroundColor: TERMINAL_THEME.colors.background.primary,
              border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
              padding: TERMINAL_THEME.spacing.md
            }}>
              <div style={{
                color: TERMINAL_THEME.colors.text.secondary,
                fontSize: TERMINAL_THEME.typography.sizes.small,
                marginBottom: TERMINAL_THEME.spacing.xs
              }}>
                {metric.label}
              </div>
              <div style={{
                color: metric.status === 'warning' ? TERMINAL_THEME.colors.semantic.warning : TERMINAL_THEME.colors.text.primary,
                fontSize: TERMINAL_THEME.typography.sizes.large,
                fontWeight: TERMINAL_THEME.typography.weights.bold
              }}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        {/* Sections */}
        {engineData.sections.map((section, index) => (
          <div key={index} style={{
            marginBottom: TERMINAL_THEME.spacing.xl
          }}>
            <div style={{
              color: TERMINAL_THEME.colors.headers.primary,
              fontSize: TERMINAL_THEME.typography.sizes.medium,
              fontWeight: TERMINAL_THEME.typography.weights.semibold,
              marginBottom: TERMINAL_THEME.spacing.md,
              letterSpacing: '1px'
            }}>
              {section.title}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: TERMINAL_THEME.spacing.md
            }}>
              {Object.entries(section.data).map(([key, item]) => (
                <div key={key} style={{
                  backgroundColor: TERMINAL_THEME.colors.background.primary,
                  border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
                  padding: TERMINAL_THEME.spacing.sm
                }}>
                  <div style={{
                    color: TERMINAL_THEME.colors.text.secondary,
                    fontSize: TERMINAL_THEME.typography.sizes.tiny,
                    marginBottom: '2px'
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    color: TERMINAL_THEME.colors.text.primary,
                    fontSize: TERMINAL_THEME.typography.sizes.small
                  }}>
                    {item.value} {'unit' in item && item.unit ? ` ${item.unit}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Engine list view
  return (
    <div style={{
      backgroundColor: TERMINAL_THEME.colors.background.secondary,
      border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
      padding: TERMINAL_THEME.spacing.lg
    }}>
      <div style={{
        color: TERMINAL_THEME.colors.headers.primary,
        fontSize: TERMINAL_THEME.typography.sizes.xlarge,
        fontWeight: TERMINAL_THEME.typography.weights.bold,
        fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
        marginBottom: TERMINAL_THEME.spacing.lg,
        letterSpacing: '2px'
      }}>
        AVAILABLE ENGINES
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: TERMINAL_THEME.spacing.md
      }}>
        {engines.map((engine) => (
          <button
            key={engine.id}
            onClick={() => setSelectedEngine(engine.id)}
            style={{
              backgroundColor: TERMINAL_THEME.colors.background.primary,
              border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
              color: TERMINAL_THEME.colors.text.primary,
              padding: TERMINAL_THEME.spacing.md,
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
              fontSize: TERMINAL_THEME.typography.sizes.medium,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = TERMINAL_THEME.colors.headers.primary;
              e.currentTarget.style.color = TERMINAL_THEME.colors.headers.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = TERMINAL_THEME.colors.border.default;
              e.currentTarget.style.color = TERMINAL_THEME.colors.text.primary;
            }}
          >
            <div style={{
              fontSize: TERMINAL_THEME.typography.sizes.medium,
              fontWeight: TERMINAL_THEME.typography.weights.semibold,
              marginBottom: TERMINAL_THEME.spacing.xs
            }}>
              {engine.name}
            </div>
            <div style={{
              fontSize: TERMINAL_THEME.typography.sizes.small,
              color: TERMINAL_THEME.colors.text.secondary
            }}>
              {engine.description}
            </div>
          </button>
        ))}
        
        <div style={{
          color: TERMINAL_THEME.colors.text.secondary,
          fontSize: TERMINAL_THEME.typography.sizes.small,
          fontStyle: 'italic',
          textAlign: 'center',
          marginTop: TERMINAL_THEME.spacing.md
        }}>
          More engines will be added as the system expands
        </div>
      </div>
    </div>
  );
}