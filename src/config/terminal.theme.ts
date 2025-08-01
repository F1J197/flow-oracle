/**
 * LIQUIDITY² Terminal Theme Configuration
 * Bloomberg Terminal-inspired dark theme with Bitcoin orange accents
 * 
 * CRITICAL: All colors must be HSL format for proper theme compliance
 */

export const TERMINAL_THEME = {
  colors: {
    background: {
      primary: 'hsl(0 0% 0%)',      // Pure black (#000000)
      secondary: 'hsl(0 0% 4%)',    // Slightly lighter for tiles (#0A0A0A)
      tertiary: 'hsl(0 0% 8%)',     // For nested elements (#141414)
      card: 'hsl(0 0% 6%)',         // Card backgrounds
      border: 'hsl(0 0% 20%)',      // Default border color
    },
    text: {
      primary: 'hsl(0 0% 100%)',    // Pure white (#FFFFFF)
      secondary: 'hsl(0 0% 53%)',   // Gray for labels (#888888)
      muted: 'hsl(0 0% 33%)',       // Dark gray for disabled (#555555)
      accent: 'hsl(25 100% 55%)',   // Bitcoin orange for headers
    },
    headers: {
      primary: 'hsl(25 100% 55%)',  // Bitcoin orange (#F7931A)
      secondary: 'hsl(25 100% 55%)', // Bitcoin orange for subheaders
    },
    semantic: {
      positive: 'hsl(125 100% 50%)', // Bright green for gains (#00FF41)
      negative: 'hsl(0 100% 61%)',   // Bright red for losses (#FF3737)
      warning: 'hsl(45 100% 50%)',   // Amber for caution (#FFB800)
      info: 'hsl(195 100% 50%)',     // Cyan for neutral info (#00D4FF)
      accent: 'hsl(25 100% 55%)',    // Orange for emphasis
    },
    border: {
      default: 'hsl(0 0% 20%)',     // Dark gray (#333333)
      important: 'hsl(25 100% 55%)', // Orange for 60-85 importance
      critical: 'hsl(0 100% 61%)',  // Red for >85 importance
      muted: 'hsl(0 0% 15%)',       // Very dark gray
    },
    status: {
      success: 'hsl(125 100% 50%)',
      error: 'hsl(0 100% 61%)',
      warning: 'hsl(45 100% 50%)',
      info: 'hsl(195 100% 50%)',
    }
  },
  typography: {
    fontFamily: {
      mono: "'Roboto Mono', 'Courier New', monospace",
      sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    },
    sizes: {
      micro: '10px',
      tiny: '11px',
      small: '12px',
      medium: '14px',
      large: '16px',
      xlarge: '20px',
      xxlarge: '24px',
      hero: '32px'
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px'
  },
  tile: {
    height: '200px',           // Fixed height for Bloomberg style
    padding: '12px',
    borderWidth: '1px',
    borderRadius: '0px',       // Sharp corners for terminal aesthetic
    minWidth: '300px',
    maxWidth: '400px'
  },
  animations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      sharp: 'cubic-bezier(0.4, 0, 1, 1)'
    }
  },
  effects: {
    glow: {
      soft: '0 0 20px',
      medium: '0 0 40px',
      strong: '0 0 60px'
    },
    shadow: {
      subtle: '0 2px 4px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 8px rgba(0, 0, 0, 0.15)',
      strong: '0 8px 16px rgba(0, 0, 0, 0.2)'
    }
  }
} as const;

/**
 * Theme utility functions
 */
export const getTerminalColor = (semantic: keyof typeof TERMINAL_THEME.colors.semantic) => {
  return TERMINAL_THEME.colors.semantic[semantic];
};

export const getBorderStyle = (importance: number) => {
  if (importance > 85) return TERMINAL_THEME.colors.border.critical;
  if (importance > 60) return TERMINAL_THEME.colors.border.important;
  return TERMINAL_THEME.colors.border.default;
};

export const getMetricColor = (value: number, inverted = false) => {
  const positive = inverted ? 
    TERMINAL_THEME.colors.semantic.negative : 
    TERMINAL_THEME.colors.semantic.positive;
  const negative = inverted ? 
    TERMINAL_THEME.colors.semantic.positive : 
    TERMINAL_THEME.colors.semantic.negative;
  
  if (value > 0) return positive;
  if (value < 0) return negative;
  return TERMINAL_THEME.colors.text.primary;
};

export const getSignalColor = (signal: string) => {
  switch (signal) {
    case 'RISK_ON':
      return TERMINAL_THEME.colors.semantic.positive;
    case 'RISK_OFF':
      return TERMINAL_THEME.colors.semantic.negative;
    case 'WARNING':
      return TERMINAL_THEME.colors.semantic.warning;
    case 'NEUTRAL':
    default:
      return TERMINAL_THEME.colors.text.primary;
  }
};