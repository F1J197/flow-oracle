import { TERMINAL_THEME } from "@/config/theme";

const Index = () => {
  return (
    <div style={{
      backgroundColor: TERMINAL_THEME.colors.background.primary,
      color: TERMINAL_THEME.colors.text.primary,
      fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
      minHeight: '100vh',
      padding: TERMINAL_THEME.spacing.lg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{
        color: TERMINAL_THEME.colors.headers.primary,
        fontSize: TERMINAL_THEME.typography.sizes.xxlarge,
        marginBottom: TERMINAL_THEME.spacing.xl,
        textAlign: 'center'
      }}>
        LIQUIDITY² TERMINAL
      </h1>
      
      <div style={{
        color: TERMINAL_THEME.colors.text.secondary,
        fontSize: TERMINAL_THEME.typography.sizes.medium,
        textAlign: 'center'
      }}>
        Single Source of Truth Established
        <br />
        Theme: {TERMINAL_THEME.colors.headers.primary}
        <br />
        Ready for new components using clean BaseEngine and TERMINAL_THEME
      </div>
    </div>
  );
};

export default Index;