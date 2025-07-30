/**
 * LIQUIDITY² V6 - Bloomberg Terminal Theme System
 * 
 * Pure Bloomberg terminal aesthetic with:
 * - ASCII-only design elements
 * - Strict monospace typography (JetBrains Mono)
 * - Neon on black color scheme
 * - Zero rounded corners
 * - High contrast, maximum readability
 */

export const TERMINAL_THEME = {
  // Typography - Strict Monospace Only
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

  // Terminal Color Palette - Pure Bloomberg
  colors: {
    // Background Hierarchy - Pure Black Foundation
    background: {
      primary: 'hsl(0 0% 0%)',      // #000000 Pure terminal black
      secondary: 'hsl(0 0% 2%)',    // #050505 Slightly elevated
      tile: 'hsl(0 0% 4%)',         // #0A0A0A Panel backgrounds
      elevated: 'hsl(0 0% 6%)',     // #0F0F0F Modal/overlay backgrounds
      console: 'hsl(0 0% 1%)',      // #030303 Deep console black
    },

    // Neon Terminal Palette
    neon: {
      teal: 'hsl(180 100% 50%)',      // #00FFFF Cyan/Teal
      orange: 'hsl(14 100% 55%)',     // #FF4500 OrangeRed
      lime: 'hsl(90 100% 50%)',       // #80FF00 Lime Green
      gold: 'hsl(50 100% 50%)',       // #FFD700 Gold
      fuchsia: 'hsl(300 100% 50%)',   // #FF00FF Magenta
      blue: 'hsl(240 100% 60%)',      // #3366FF Blue
      amber: 'hsl(45 100% 55%)',      // #FFAA00 Amber
    },

    // BTC Orange Professional System
    btc: {
      primary: 'hsl(28 100% 54%)',   // #F7931A Bitcoin Orange
      bright: 'hsl(31 100% 64%)',    // #FF9F33 Bright accent
      light: 'hsl(34 100% 74%)',     // #FFAA55 Light variant
      dark: 'hsl(25 100% 44%)',      // #E67E00 Dark variant
      muted: 'hsl(28 70% 34%)',      // #B87416 Muted state
      glow: 'hsl(31 100% 64%)',      // #FF9F33 Glow effect
    },

    // Typography - High Contrast White on Black
    text: {
      primary: 'hsl(0 0% 100%)',     // #FFFFFF Pure white
      secondary: 'hsl(0 0% 80%)',    // #CCCCCC Secondary text
      muted: 'hsl(0 0% 60%)',        // #999999 Muted/disabled
      accent: 'hsl(28 100% 54%)',    // BTC orange for accents
      data: 'hsl(0 0% 98%)',         // #FAFAFA Data display
    },

    // Semantic States
    semantic: {
      positive: 'hsl(90 100% 50%)',   // Lime for gains
      negative: 'hsl(14 100% 55%)',   // Orange for losses
      warning: 'hsl(50 100% 50%)',    // Gold for warnings
      critical: 'hsl(300 100% 50%)',  // Magenta for critical
      success: 'hsl(180 100% 50%)',   // Teal for success
      info: 'hsl(240 100% 60%)',      // Blue for information
    },

    // Glass/Border Effects
    border: {
      default: 'hsl(180 100% 50% / 0.3)',  // Cyan with opacity
      active: 'hsl(180 100% 50% / 0.5)',   // Brighter when active
      muted: 'hsl(180 100% 50% / 0.1)',    // Very subtle
    }
  },

  // Layout Constraints - Bloomberg Terminal Standards
  layout: {
    // Zero rounded corners - strict terminal aesthetic
    borderRadius: '0px',
    
    // Precise spacing system
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      xxl: '32px',
    },

    // Terminal content density
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
    }
  },

  // Typography Scales - Terminal Optimized
  typography: {
    // Data display scales
    scale: {
      xs: '0.75rem',    // 12px - Labels, metadata
      sm: '0.875rem',   // 14px - Secondary text
      base: '1rem',     // 16px - Body text
      lg: '1.125rem',   // 18px - Small headers
      xl: '1.5rem',     // 24px - Main metrics
      '2xl': '2rem',    // 32px - Hero numbers
      '3xl': '2.5rem',  // 40px - Dashboard displays
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

  // Animation System - Subtle Terminal Effects
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
    }
  },

  // Z-Index System
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070,
  }
} as const;

// Global Terminal Styles - Direct CSS injection
export const globalStyles = `
  /* Bloomberg Terminal Global Styles */
  * {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    line-height: 1.5;
  }

  body {
    margin: 0;
    padding: 0;
    background: ${TERMINAL_THEME.colors.background.primary};
    color: ${TERMINAL_THEME.colors.text.primary};
    font-family: ${TERMINAL_THEME.fonts.primary};
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.025em;
    overflow-x: hidden;
  }

  /* Terminal Typography Base */
  .terminal-text {
    font-family: ${TERMINAL_THEME.fonts.primary};
    font-variant-numeric: tabular-nums;
  }

  .terminal-data {
    font-family: ${TERMINAL_THEME.fonts.primary};
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    letter-spacing: -0.025em;
  }

  .terminal-label {
    font-family: ${TERMINAL_THEME.fonts.primary};
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.75rem;
    font-weight: 600;
  }

  /* Terminal Panel Base */
  .terminal-panel {
    background: ${TERMINAL_THEME.colors.background.tile};
    border: 1px solid ${TERMINAL_THEME.colors.border.default};
    border-radius: ${TERMINAL_THEME.layout.borderRadius};
  }

  /* No rounded corners anywhere */
  * {
    border-radius: ${TERMINAL_THEME.layout.borderRadius} !important;
  }

  /* Terminal scrollbars */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${TERMINAL_THEME.colors.background.secondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${TERMINAL_THEME.colors.border.default};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${TERMINAL_THEME.colors.border.active};
  }

  /* Focus styles */
  :focus-visible {
    outline: 2px solid ${TERMINAL_THEME.colors.btc.primary};
    outline-offset: 2px;
  }

  /* Selection */
  ::selection {
    background: ${TERMINAL_THEME.colors.btc.primary};
    color: ${TERMINAL_THEME.colors.background.primary};
  }
`;

// Type exports for TypeScript support
export type TerminalTheme = typeof TERMINAL_THEME;
export type TerminalColors = typeof TERMINAL_THEME.colors;
export type TerminalTypography = typeof TERMINAL_THEME.typography;