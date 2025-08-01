/**
 * LIQUIDITY² Terminal - Noir & Neon Design System
 * Phase 1: Foundation & Infrastructure - Prompt 1
 * 
 * Bloomberg Terminal-inspired aesthetic with modern glassmorphism elements
 * Complete "Noir & Neon" design system and global theme configuration
 */

export const NOIR_NEON_THEME = {
  colors: {
    // Core Background Hierarchy
    background: {
      primary: '#121212',      // Deep charcoal
      secondary: '#1E1E1E',    // Cards/panels
      tile: '#232323',         // Tile backgrounds
      elevated: '#2A2A2A',     // Modal/popup backgrounds
      console: '#0F0F0F'       // Deep console black
    },
    
    // Neon Color Palette - Core System
    neon: {
      teal: '#00BFFF',         // Risk-On/Positive signals
      orange: '#FF4500',       // Risk-Off/Negative signals  
      lime: '#32CD32',         // Success states
      fuchsia: '#FF00FF',      // User customization
      gold: '#FFD700',         // Warning states
      blue: '#3366FF',         // Information
      amber: '#FFAA00'         // Alert states
    },
    
    // Text Hierarchy - High Contrast
    text: {
      primary: '#EAEAEA',      // Off-white primary text
      secondary: '#B3B3B3',    // Gray secondary text
      muted: '#808080',        // Muted/disabled text
      accent: '#00BFFF',       // Accent text (neon teal)
      data: '#FFFFFF'          // Pure white for data display
    },
    
    // Semantic Color Mapping
    semantic: {
      positive: '#32CD32',     // Laser Lime - gains/success
      negative: '#FF4500',     // Blaze Orange - losses/danger
      warning: '#FFD700',      // Gold - caution
      critical: '#FF00FF',     // Fuchsia - critical alerts
      info: '#00BFFF',        // Neon Teal - information
      neutral: '#B3B3B3'       // Gray - neutral states
    },
    
    // Glass/Border System
    glass: {
      background: 'rgba(30, 30, 30, 0.8)',
      border: 'rgba(0, 191, 255, 0.3)',      // Teal border
      borderActive: 'rgba(0, 191, 255, 0.6)', // Active teal
      borderMuted: 'rgba(0, 191, 255, 0.1)',  // Subtle teal
      surface: 'rgba(35, 35, 35, 0.9)'
    },
    
    // Status Indicators
    status: {
      online: '#32CD32',       // Lime
      warning: '#FFD700',      // Gold  
      critical: '#FF4500',     // Orange
      offline: '#808080'       // Muted gray
    }
  },
  
  // Typography System - Roboto Mono
  typography: {
    fontFamily: {
      mono: "'Roboto Mono', 'Courier New', monospace",
      terminal: "'Roboto Mono', monospace"
    },
    sizes: {
      micro: '10px',           // Small labels
      tiny: '11px',            // Status text
      small: '12px',           // Secondary text
      medium: '14px',          // Body text
      large: '16px',           // Headers
      xlarge: '20px',          // Large metrics
      xxlarge: '24px',         // Primary metrics
      hero: '32px'             // Hero text
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.1,
      normal: 1.4,
      relaxed: 1.6
    }
  },
  
  // Spacing System
  spacing: {
    xs: '4px',
    sm: '8px', 
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
    xxxl: '48px'
  },
  
  // Layout System
  layout: {
    borderRadius: '0px',       // Sharp corners - Bloomberg style
    borderWidth: '1px',
    tile: {
      height: '200px',         // Fixed tile height
      padding: '12px',
      margin: '8px'
    },
    grid: {
      gap: '12px',
      columns: {
        mobile: 1,
        tablet: 2, 
        desktop: 3,
        wide: 4
      }
    }
  },
  
  // Animation System - Subtle & Purposeful
  animations: {
    duration: {
      fast: '150ms',
      normal: '250ms', 
      slow: '400ms'
    },
    easing: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
      accelerate: 'cubic-bezier(0.4, 0, 1, 1)'
    },
    transitions: {
      fade: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      slide: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      glow: 'box-shadow 400ms cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  
  // Effects System
  effects: {
    glow: {
      teal: '0 0 20px rgba(0, 191, 255, 0.4)',
      orange: '0 0 20px rgba(255, 69, 0, 0.4)',
      lime: '0 0 20px rgba(50, 205, 50, 0.4)',
      fuchsia: '0 0 20px rgba(255, 0, 255, 0.4)'
    },
    shadow: {
      subtle: '0 2px 4px rgba(0, 0, 0, 0.3)',
      medium: '0 4px 8px rgba(0, 0, 0, 0.4)',
      heavy: '0 8px 16px rgba(0, 0, 0, 0.5)'
    },
    blur: {
      glass: 'blur(8px)',
      heavy: 'blur(16px)'
    }
  },
  
  // Z-Index System
  zIndex: {
    base: 0,
    tile: 10,
    overlay: 50,
    modal: 100,
    tooltip: 200,
    notification: 300
  }
} as const;

// Utility Functions
export const getNoirNeonColor = (semantic: keyof typeof NOIR_NEON_THEME.colors.semantic) => {
  return NOIR_NEON_THEME.colors.semantic[semantic];
};

export const getNeonColor = (variant: keyof typeof NOIR_NEON_THEME.colors.neon) => {
  return NOIR_NEON_THEME.colors.neon[variant];
};

export const getMetricColor = (value: number, inverted = false) => {
  if (value > 0) return inverted ? NOIR_NEON_THEME.colors.semantic.negative : NOIR_NEON_THEME.colors.semantic.positive;
  if (value < 0) return inverted ? NOIR_NEON_THEME.colors.semantic.positive : NOIR_NEON_THEME.colors.semantic.negative;
  return NOIR_NEON_THEME.colors.text.primary;
};

export const getSignalColor = (signal: string) => {
  switch (signal) {
    case 'RISK_ON': return NOIR_NEON_THEME.colors.semantic.positive;
    case 'RISK_OFF': return NOIR_NEON_THEME.colors.semantic.negative;
    case 'WARNING': return NOIR_NEON_THEME.colors.semantic.warning;
    case 'CRITICAL': return NOIR_NEON_THEME.colors.semantic.critical;
    default: return NOIR_NEON_THEME.colors.semantic.neutral;
  }
};

// Export type for TypeScript
export type NoirNeonTheme = typeof NOIR_NEON_THEME;