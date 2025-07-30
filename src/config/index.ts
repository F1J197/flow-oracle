/**
 * LIQUIDITY² Terminal - Global Configuration
 * Centralized configuration management for all system components
 */

export const CONFIG = {
  // Application Metadata
  APP: {
    NAME: 'LIQUIDITY²',
    VERSION: 'V6.0.0',
    DESCRIPTION: 'Global Liquidity Intelligence Platform',
    REFRESH_INTERVAL: 15000, // 15 seconds
  },

  // Engine Configuration
  ENGINES: {
    MAX_CONCURRENT: 8,
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    CACHE_TTL: 60000,
    HEALTH_CHECK_INTERVAL: 10000,
  },

  // Data Sources - Using Universal Proxy
  DATA_SOURCES: {
    PROXY: {
      ENDPOINT: 'universal-data-proxy',
      TIMEOUT: 30000,
      RETRY_ATTEMPTS: 3,
    },
    FRED: {
      PROVIDER: 'fred',
      RATE_LIMIT: 120, // requests per minute
    },
    COINBASE: {
      PROVIDER: 'coinbase',
      WS_URL: 'wss://ws-feed.pro.coinbase.com',
      REST_URL: 'https://api.exchange.coinbase.com',
    },
    GLASSNODE: {
      PROVIDER: 'glassnode',
      TIMEOUT: 15000,
    },
    BINANCE: {
      PROVIDER: 'binance',
      RATE_LIMIT: 1200,
    },
    POLYGON: {
      PROVIDER: 'polygon',
      RATE_LIMIT: 5,
    },
    FINNHUB: {
      PROVIDER: 'finnhub',
      RATE_LIMIT: 60,
    },
  },

  // UI Configuration
  UI: {
    THEME: 'noir-neon',
    REFRESH_RATE: 15000,
    ANIMATION_DURATION: 300,
    GRID: {
      COLUMNS: 4,
      GAP: 20,
      TILE_MIN_HEIGHT: 200,
    },
  },

  // Market Regime Thresholds
  THRESHOLDS: {
    LIQUIDITY: {
      CRITICAL: 0.3,
      WARNING: 0.6,
      NORMAL: 0.8,
    },
    Z_SCORE: {
      EXTREME: 2.5,
      SIGNIFICANT: 1.5,
      NORMAL: 0.5,
    },
    CONFIDENCE: {
      HIGH: 0.8,
      MEDIUM: 0.6,
      LOW: 0.4,
    },
  },

  // Supabase Configuration
  SUPABASE: {
    URL: 'https://gotlitraitdvltnjdnni.supabase.co',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdGxpdHJhaXRkdmx0bmpkbm5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2ODc2NDksImV4cCI6MjA2OTI2MzY0OX0._6eCm4Vj0oRUThRPDekpHmd5Dq9DlqNvRlPkQ-czWlQ',
  },
} as const;

export type AppConfig = typeof CONFIG;