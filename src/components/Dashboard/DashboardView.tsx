import { TERMINAL_THEME } from '@/config/theme';

export function DashboardView() {
  const engineTiles = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'repeat(3, 200px)',
      gap: TERMINAL_THEME.spacing.md,
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {engineTiles.map(engineNum => (
        <div
          key={engineNum}
          style={{
            height: '200px',
            padding: TERMINAL_THEME.spacing.md,
            border: `1px solid ${TERMINAL_THEME.colors.headers.primary}`,
            backgroundColor: TERMINAL_THEME.colors.background.secondary,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{
            color: TERMINAL_THEME.colors.headers.primary,
            fontSize: TERMINAL_THEME.typography.sizes.large,
            fontWeight: TERMINAL_THEME.typography.weights.bold,
            fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
            textAlign: 'center'
          }}>
            ENGINE {engineNum}
          </div>
          <div style={{
            color: TERMINAL_THEME.colors.text.secondary,
            fontSize: TERMINAL_THEME.typography.sizes.small,
            fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
            marginTop: TERMINAL_THEME.spacing.sm
          }}>
            PLACEHOLDER
          </div>
        </div>
      ))}
    </div>
  );
}