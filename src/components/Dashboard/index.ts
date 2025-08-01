/**
 * LIQUIDITY² Terminal - Configuration Index
 * Single source of truth for all configurations
 */

// Core theme
export { TERMINAL_THEME } from '@/config/terminal.theme';

// Base configuration
export const CONFIG = {
  APP: {
    NAME: 'LIQUIDITY²',
    VERSION: '2.0.0',
    TAGLINE: 'LIQUIDO MOVET MUNDUM',
    REFRESH_INTERVAL: 30000, // 30 seconds
  },
  ENGINES: {
    UPDATE_INTERVAL: 30000,
    MAX_RETRIES: 3,
  },
  UI: {
    DASHBOARD_COLUMNS: 3,
    DASHBOARD_ROWS: 3,
    TILE_HEIGHT: 250,
  }
} as const;