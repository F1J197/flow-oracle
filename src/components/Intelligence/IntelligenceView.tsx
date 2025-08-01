import { TERMINAL_THEME } from '@/config/theme';

export function IntelligenceView() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      backgroundColor: TERMINAL_THEME.colors.background.secondary,
      border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
      padding: TERMINAL_THEME.spacing.xl
    }}>
      <div style={{
        color: TERMINAL_THEME.colors.headers.primary,
        fontSize: TERMINAL_THEME.typography.sizes.xlarge,
        fontWeight: TERMINAL_THEME.typography.weights.bold,
        fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
        textAlign: 'center',
        letterSpacing: '2px'
      }}>
        INTELLIGENCE ANALYSIS - COMING SOON
      </div>
    </div>
  );
}