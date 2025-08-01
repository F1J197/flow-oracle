import { TERMINAL_THEME } from "@/config/theme";

const ChartsView = () => {
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
        fontSize: TERMINAL_THEME.typography.sizes.xlarge,
        marginBottom: TERMINAL_THEME.spacing.lg
      }}>
        CHARTS VIEW
      </h1>
      
      <div style={{
        color: TERMINAL_THEME.colors.text.secondary,
        fontSize: TERMINAL_THEME.typography.sizes.medium
      }}>
        Clean slate for new chart components using TERMINAL_THEME
      </div>
    </div>
  );
};

export default ChartsView;