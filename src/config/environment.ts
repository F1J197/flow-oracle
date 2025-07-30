/**
 * LIQUIDITY² Terminal - Environment Configuration
 * Direct configuration without environment variables (Lovable doesn't support VITE_*)
 */

// Direct configuration for Lovable deployment
const config = {
  app: {
    env: 'development' as 'development' | 'staging' | 'production',
    version: 'v6.0.0',
    logLevel: 'info' as 'error' | 'warn' | 'info' | 'debug',
  },
  supabase: {
    url: 'https://gotlitraitdvltnjdnni.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdGxpdHJhaXRkdmx0bmpkbm5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2ODc2NDksImV4cCI6MjA2OTI2MzY0OX0._6eCm4Vj0oRUThRPDekpHmd5Dq9DlqNvRlPkQ-czWlQ',
  },
  apis: {
    // API keys will be managed through Supabase Edge Functions
    fred: undefined,
    finnhub: undefined,
    twelvedata: undefined,
    fmp: undefined,
    marketstack: undefined,
    polygon: undefined,
    alphaVantage: undefined,
    coingecko: undefined,
    glassnode: undefined,
  },
  websocket: {
    reconnectAttempts: 5,
    reconnectDelay: 3000,
  },
  cache: {
    ttl: 300000, // 5 minutes
    maxSize: 1000,
  },
  engines: {
    timeout: 30000, // 30 seconds
    maxRetries: 3,
    refreshInterval: 15000, // 15 seconds
  },
} as const;

// Environment helpers
export const isDevelopment = config.app.env === 'development';
export const isProduction = config.app.env === 'production';
export const isStaging = config.app.env === 'staging';

// API availability checks (will be false until configured via Supabase)
export const hasApiKey = {
  fred: false, // Will be available via Supabase Edge Functions
  finnhub: false,
  twelvedata: false,
  fmp: false,
  marketstack: false,
  polygon: false,
  alphaVantage: false,
  coingecko: false,
  glassnode: false,
};

// Export configuration
export { config };

// Type for environment variables
export type Environment = typeof config;