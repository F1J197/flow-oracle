import { TERMINAL_THEME } from "@/config/theme";
import { TestEngine } from "@/engines/TestEngine";
import { useEffect, useState } from "react";

const Index = () => {
  const [engineOutput, setEngineOutput] = useState<any>(null);

  useEffect(() => {
    // Initialize test engine
    const testEngine = new TestEngine();
    
    // Create mock data
    const mockData = new Map();
    mockData.set('VIX', 18.5);
    
    // Calculate output
    const output = testEngine.calculate(mockData);
    setEngineOutput(output);
  }, []);

  return (
    <div style={{
      backgroundColor: TERMINAL_THEME.colors.background.primary,
      color: TERMINAL_THEME.colors.text.primary,
      fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
      minHeight: '100vh',
      padding: TERMINAL_THEME.spacing.lg
    }}>
      <h1 style={{
        color: TERMINAL_THEME.colors.headers.primary,
        fontSize: TERMINAL_THEME.typography.sizes.xxlarge,
        marginBottom: TERMINAL_THEME.spacing.xl,
        textAlign: 'center'
      }}>
        LIQUIDITY² TERMINAL
      </h1>
      
      {engineOutput && (
        <div style={{
          backgroundColor: TERMINAL_THEME.colors.background.secondary,
          border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
          padding: TERMINAL_THEME.spacing.lg,
          marginBottom: TERMINAL_THEME.spacing.xl,
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h2 style={{
            color: TERMINAL_THEME.colors.headers.primary,
            fontSize: TERMINAL_THEME.typography.sizes.large,
            marginBottom: TERMINAL_THEME.spacing.md
          }}>
            TEST ENGINE OUTPUT
          </h2>
          
          <div style={{
            marginBottom: TERMINAL_THEME.spacing.md
          }}>
            <div style={{
              color: TERMINAL_THEME.colors.text.secondary,
              fontSize: TERMINAL_THEME.typography.sizes.small
            }}>
              Primary Metric
            </div>
            <div style={{
              color: TERMINAL_THEME.colors.semantic.positive,
              fontSize: TERMINAL_THEME.typography.sizes.xlarge,
              fontWeight: TERMINAL_THEME.typography.weights.bold
            }}>
              {engineOutput.primaryMetric.value}
            </div>
          </div>
          
          <div style={{
            marginBottom: TERMINAL_THEME.spacing.md
          }}>
            <div style={{
              color: TERMINAL_THEME.colors.text.secondary,
              fontSize: TERMINAL_THEME.typography.sizes.small
            }}>
              Signal
            </div>
            <div style={{
              color: engineOutput.signal === 'RISK_ON' ? TERMINAL_THEME.colors.semantic.positive :
                    engineOutput.signal === 'RISK_OFF' ? TERMINAL_THEME.colors.semantic.negative :
                    TERMINAL_THEME.colors.semantic.warning,
              fontSize: TERMINAL_THEME.typography.sizes.medium,
              fontWeight: TERMINAL_THEME.typography.weights.semibold
            }}>
              {engineOutput.signal}
            </div>
          </div>
          
          <div style={{
            marginBottom: TERMINAL_THEME.spacing.md
          }}>
            <div style={{
              color: TERMINAL_THEME.colors.text.secondary,
              fontSize: TERMINAL_THEME.typography.sizes.small
            }}>
              Analysis
            </div>
            <div style={{
              color: TERMINAL_THEME.colors.text.primary,
              fontSize: TERMINAL_THEME.typography.sizes.medium
            }}>
              {engineOutput.analysis}
            </div>
          </div>
          
          <div>
            <div style={{
              color: TERMINAL_THEME.colors.text.secondary,
              fontSize: TERMINAL_THEME.typography.sizes.small
            }}>
              Confidence
            </div>
            <div style={{
              color: TERMINAL_THEME.colors.semantic.info,
              fontSize: TERMINAL_THEME.typography.sizes.medium
            }}>
              {engineOutput.confidence}%
            </div>
          </div>
        </div>
      )}
      
      <div style={{
        color: TERMINAL_THEME.colors.text.secondary,
        fontSize: TERMINAL_THEME.typography.sizes.medium,
        textAlign: 'center'
      }}>
        BaseEngine system verified - Test Engine running successfully
      </div>
    </div>
  );
};

export default Index;