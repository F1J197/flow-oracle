/**
 * LIQUIDITY² V6 - Unified Terminal Tokens
 * Design System Foundation - Single Source of Truth
 * 
 * This file consolidates all design tokens used across the platform
 * Ensures strict Bloomberg terminal compliance throughout the system
 */

export const TERMINAL_TOKENS = {
  // === TYPOGRAPHY SYSTEM ===
  fonts: {
    primary: '"JetBrains Mono", "IBM Plex Mono", "Roboto Mono", monospace',
    fallback: 'monospace',
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    }
  },

  // === COLOR SYSTEM ===
  colors: {
    // Background Hierarchy - Pure Black Foundation
    background: {
      primary: '0 0% 0%',        // #000000 Pure terminal black
      secondary: '0 0% 2%',      // #050505 Slightly elevated
      tile: '0 0% 4%',           // #0A0A0A Panel backgrounds
      elevated: '0 0% 6%',       // #0F0F0F Modal/overlay backgrounds
      console: '0 0% 1%',        // #030303 Deep console black
      surface: '0 0% 3%',        // #080808 Interactive surfaces
    },

    // Neon Terminal Palette
    neon: {
      teal: '180 100% 50%',      // #00FFFF Cyan/Teal
      orange: '14 100% 55%',     // #FF4500 OrangeRed
      lime: '90 100% 50%',       // #80FF00 Lime Green
      gold: '50 100% 50%',       // #FFD700 Gold
      fuchsia: '300 100% 50%',   // #FF00FF Magenta
      blue: '240 100% 60%',      // #3366FF Blue
      amber: '45 100% 55%',      // #FFAA00 Amber
      purple: '270 100% 60%',    // #9966FF Purple
      green: '120 100% 50%',     // #00FF00 Green
      red: '0 100% 50%',         // #FF0000 Red
    },

    // BTC Orange Professional System
    btc: {
      primary: '28 100% 54%',    // #F7931A Bitcoin Orange
      bright: '31 100% 64%',     // #FF9F33 Bright accent
      light: '34 100% 74%',      // #FFAA55 Light variant
      dark: '25 100% 44%',       // #E67E00 Dark variant
      muted: '28 70% 34%',       // #B87416 Muted state
      glow: '31 100% 64%',       // #FF9F33 Glow effect
    },

    // Typography - High Contrast White on Black
    text: {
      primary: '0 0% 100%',      // #FFFFFF Pure white
      secondary: '0 0% 80%',     // #CCCCCC Secondary text
      muted: '0 0% 60%',         // #999999 Muted/disabled
      accent: '28 100% 54%',     // BTC orange for accents
      data: '0 0% 98%',          // #FAFAFA Data display
      inverse: '0 0% 0%',        // #000000 Black text
    },

    // Semantic States
    semantic: {
      positive: '90 100% 50%',   // Lime for gains
      negative: '14 100% 55%',   // Orange for losses
      warning: '50 100% 50%',    // Gold for warnings
      critical: '300 100% 50%',  // Magenta for critical
      success: '180 100% 50%',   // Teal for success
      info: '240 100% 60%',      // Blue for information
      neutral: '0 0% 60%',       // Gray for neutral
    },

    // Glass/Border Effects
    border: {
      default: '180 100% 50% / 0.3',  // Cyan with opacity
      active: '180 100% 50% / 0.5',   // Brighter when active
      muted: '180 100% 50% / 0.1',    // Very subtle
      focus: '28 100% 54% / 0.6',     // BTC orange focus
      hover: '180 100% 50% / 0.4',    // Hover state
    }
  },

  // === SPACING SYSTEM ===
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
    xxxl: '48px',
  },

  // === TYPOGRAPHY SCALES ===
  typography: {
    scale: {
      xs: '0.625rem',    // 10px - Micro labels
      sm: '0.75rem',     // 12px - Labels, metadata
      base: '0.875rem',  // 14px - Body text
      md: '1rem',        // 16px - Default
      lg: '1.125rem',    // 18px - Small headers
      xl: '1.25rem',     // 20px - Headers
      '2xl': '1.5rem',   // 24px - Main metrics
      '3xl': '2rem',     // 32px - Hero numbers
      '4xl': '2.5rem',   // 40px - Dashboard displays
    },

    // Terminal-specific styles
    terminal: {
      mono: {
        fontFamily: '"JetBrains Mono", monospace',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.025em',
      },
      data: {
        fontFamily: '"JetBrains Mono", monospace',
        fontVariantNumeric: 'tabular-nums',
        fontWeight: 600,
        letterSpacing: '-0.025em',
      },
      label: {
        fontFamily: '"JetBrains Mono", monospace',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
        fontSize: '0.75rem',
        fontWeight: 600,
      }
    }
  },

  // === LAYOUT SYSTEM ===
  layout: {
    borderRadius: '0px',  // Strict terminal aesthetic
    
    density: {
      compact: {
        padding: '8px',
        gap: '4px',
        lineHeight: 1.2,
      },
      normal: {
        padding: '12px',
        gap: '8px',
        lineHeight: 1.4,
      },
      comfortable: {
        padding: '16px',
        gap: '12px',
        lineHeight: 1.6,
      }
    },

    // Grid systems
    grid: {
      dashboard: {
        columns: 'repeat(4, 1fr)',
        gap: '20px',
      },
      intelligence: {
        columns: 'repeat(3, 1fr)',
        gap: '16px',
      },
      charts: {
        columns: 'repeat(2, 1fr)',
        gap: '24px',
      }
    }
  },

  // === ANIMATION SYSTEM ===
  animations: {
    // Data updates
    dataUpdate: {
      duration: '150ms',
      easing: 'ease-out',
    },
    
    // Panel transitions
    panel: {
      duration: '200ms',
      easing: 'ease-in-out',
    },

    // Status indicators
    status: {
      pulse: {
        duration: '2s',
        iteration: 'infinite',
      },
      glow: {
        duration: '1.5s',
        iteration: 'infinite',
        direction: 'alternate',
      }
    },

    // Hover effects
    hover: {
      duration: '150ms',
      easing: 'ease-out',
    }
  },

  // === Z-INDEX SYSTEM ===
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070,
  },

  // === SHADOWS SYSTEM ===
  shadows: {
    terminal: {
      default: '0 0 10px hsl(180 100% 50% / 0.2)',
      glow: '0 0 20px hsl(180 100% 50% / 0.4)',
      focus: '0 0 15px hsl(28 100% 54% / 0.6)',
      critical: '0 0 25px hsl(300 100% 50% / 0.5)',
    }
  },

  // === STATES SYSTEM ===
  states: {
    opacity: {
      disabled: 0.4,
      muted: 0.6,
      secondary: 0.8,
      primary: 1,
    }
  }
} as const;

// === TYPE EXPORTS ===
export type TerminalTokens = typeof TERMINAL_TOKENS;
export type TerminalColors = typeof TERMINAL_TOKENS.colors;
export type TerminalTypography = typeof TERMINAL_TOKENS.typography;
export type TerminalSpacing = typeof TERMINAL_TOKENS.spacing;
export type TerminalLayout = typeof TERMINAL_TOKENS.layout;

// === UTILITY FUNCTIONS ===
export const getTokenValue = (path: string): string => {
  const keys = path.split('.');
  let value: any = TERMINAL_TOKENS;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Token path "${path}" not found`);
      return '';
    }
  }
  
  return typeof value === 'string' ? value : '';
};

// === HSL HELPER FUNCTIONS ===
export const hsl = (token: string): string => `hsl(${token})`;
export const hsla = (token: string, alpha: number): string => `hsl(${token} / ${alpha})`;

// === SEMANTIC COLOR HELPERS ===
export const getSemanticColor = (state: 'positive' | 'negative' | 'warning' | 'critical' | 'success' | 'info' | 'neutral'): string => {
  return hsl(TERMINAL_TOKENS.colors.semantic[state]);
};

export const getNeonColor = (variant: keyof typeof TERMINAL_TOKENS.colors.neon): string => {
  return hsl(TERMINAL_TOKENS.colors.neon[variant]);
};

export const getBtcColor = (variant: keyof typeof TERMINAL_TOKENS.colors.btc): string => {
  return hsl(TERMINAL_TOKENS.colors.btc[variant]);
};