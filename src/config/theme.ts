/**
 * LIQUIDITY² Terminal Theme - Single Source of Truth
 * Bloomberg Terminal Aesthetic
 */
export const TERMINAL_THEME = {
  colors: {
    background: {
      primary: '#000000',
      secondary: '#0A0A0A'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#888888'
    },
    headers: {
      primary: '#F7931A',  // Bitcoin Orange
      secondary: '#F7931A'
    },
    semantic: {
      positive: '#00FF41',  // Bright Green
      negative: '#FF3737',  // Bright Red
      warning: '#FFB800',   // Amber
      info: '#00D4FF',      // Cyan
      accent: '#F7931A'     // Orange
    },
    border: {
      default: '#333333',
      important: '#F7931A',
      critical: '#FF3737'
    }
  },
  typography: {
    fontFamily: {
      mono: "'Roboto Mono', 'Courier New', monospace"
    },
    sizes: {
      micro: '10px',
      tiny: '11px',
      small: '12px',
      medium: '14px',
      large: '16px',
      xlarge: '20px',
      xxlarge: '24px'
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
    xl: '24px'
  }
} as const;