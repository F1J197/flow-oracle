/**
 * LIQUIDITY² Terminal Theme - EXACT Bloomberg Terminal Specification
 * PIXEL-PERFECT COMPLIANCE - DO NOT MODIFY
 */
export const TERMINAL_THEME = {
  colors: {
    background: {
      primary: '#000000',      // Pure black
      secondary: '#0A0A0A',    // Slightly lighter for tiles
      tertiary: '#141414'      // For nested elements
    },
    text: {
      primary: '#FFFFFF',      // Pure white
      secondary: '#888888',    // Gray for labels
      muted: '#555555'         // Dark gray for disabled
    },
    headers: {
      primary: '#F7931A',      // Bitcoin orange - headers
      secondary: '#F7931A'     // Bitcoin orange - subheaders
    },
    semantic: {
      positive: '#00FF41',     // Bright green - gains
      negative: '#FF3737',     // Bright red - losses
      warning: '#FFB800',      // Amber - caution
      info: '#00D4FF',        // Cyan - neutral info
      accent: '#F7931A'        // Orange - emphasis
    },
    border: {
      default: '#333333',      // Dark gray
      important: '#F7931A',    // Orange for 60-85 importance
      critical: '#FF3737'      // Red for >85 importance
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
    height: '200px',           // Fixed height
    padding: '12px',
    borderWidth: '1px',
    borderRadius: '0px'        // Sharp corners
  }
} as const;

// SIGNAL THRESHOLDS - UNIVERSAL ACROSS ALL ENGINES
export const SIGNAL_THRESHOLDS = {
  ZSCORE: {
    RISK_ON: 1.0,
    RISK_OFF: -1.0,
    NEUTRAL: [-1.0, 1.0]
  },
  PERCENTILE: {
    RISK_ON: 80,
    RISK_OFF: 20,
    WARNING: [20, 30],
    NEUTRAL: [30, 70]
  },
  BINARY: {
    threshold: 0.5,
    buffer: 0.1
  }
} as const;