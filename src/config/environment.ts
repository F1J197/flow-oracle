/**
 * LIQUIDITY² Terminal - Environment Configuration
 * Type-safe environment variable handling with validation
 */

import { z } from 'zod';

// Environment schema for validation
const envSchema = z.object({
  // Supabase
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  
  // FRED API
  VITE_FRED_API_KEY: z.string().optional(),
  
  // Financial APIs
  VITE_FINNHUB_API_KEY: z.string().optional(),
  VITE_TWELVEDATA_API_KEY: z.string().optional(),
  VITE_FMP_API_KEY: z.string().optional(),
  VITE_MARKETSTACK_API_KEY: z.string().optional(),
  VITE_POLYGON_API_KEY: z.string().optional(),
  VITE_ALPHA_VANTAGE_API_KEY: z.string().optional(),
  
  // Crypto APIs
  VITE_COINGECKO_API_KEY: z.string().optional(),
  VITE_GLASSNODE_API_KEY: z.string().optional(),
  
  // App Configuration
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_APP_VERSION: z.string().default('v6.0.0'),
  VITE_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // WebSocket Configuration
  VITE_WS_RECONNECT_ATTEMPTS: z.string().transform(Number).pipe(z.number().int().positive()).default('5'),
  VITE_WS_RECONNECT_DELAY: z.string().transform(Number).pipe(z.number().int().positive()).default('3000'),
  
  // Cache Configuration
  VITE_CACHE_TTL: z.string().transform(Number).pipe(z.number().int().positive()).default('300000'),
  VITE_CACHE_MAX_SIZE: z.string().transform(Number).pipe(z.number().int().positive()).default('1000'),
  
  // Engine Configuration
  VITE_ENGINE_TIMEOUT: z.string().transform(Number).pipe(z.number().int().positive()).default('30000'),
  VITE_ENGINE_MAX_RETRIES: z.string().transform(Number).pipe(z.number().int().positive()).default('3'),
  VITE_ENGINE_REFRESH_INTERVAL: z.string().transform(Number).pipe(z.number().int().positive()).default('15000'),
});

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    throw new Error('Invalid environment configuration');
  }
}

// Export validated environment
export const env = validateEnv();

// Type for environment variables
export type Environment = z.infer<typeof envSchema>;

// Environment helpers
export const isDevelopment = env.VITE_APP_ENV === 'development';
export const isProduction = env.VITE_APP_ENV === 'production';
export const isStaging = env.VITE_APP_ENV === 'staging';

// API availability checks
export const hasApiKey = {
  fred: !!env.VITE_FRED_API_KEY,
  finnhub: !!env.VITE_FINNHUB_API_KEY,
  twelvedata: !!env.VITE_TWELVEDATA_API_KEY,
  fmp: !!env.VITE_FMP_API_KEY,
  marketstack: !!env.VITE_MARKETSTACK_API_KEY,
  polygon: !!env.VITE_POLYGON_API_KEY,
  alphaVantage: !!env.VITE_ALPHA_VANTAGE_API_KEY,
  coingecko: !!env.VITE_COINGECKO_API_KEY,
  glassnode: !!env.VITE_GLASSNODE_API_KEY,
};

// Configuration object for easier access
export const config = {
  app: {
    env: env.VITE_APP_ENV,
    version: env.VITE_APP_VERSION,
    logLevel: env.VITE_LOG_LEVEL,
  },
  supabase: {
    url: env.VITE_SUPABASE_URL,
    anonKey: env.VITE_SUPABASE_ANON_KEY,
  },
  apis: {
    fred: env.VITE_FRED_API_KEY,
    finnhub: env.VITE_FINNHUB_API_KEY,
    twelvedata: env.VITE_TWELVEDATA_API_KEY,
    fmp: env.VITE_FMP_API_KEY,
    marketstack: env.VITE_MARKETSTACK_API_KEY,
    polygon: env.VITE_POLYGON_API_KEY,
    alphaVantage: env.VITE_ALPHA_VANTAGE_API_KEY,
    coingecko: env.VITE_COINGECKO_API_KEY,
    glassnode: env.VITE_GLASSNODE_API_KEY,
  },
  websocket: {
    reconnectAttempts: env.VITE_WS_RECONNECT_ATTEMPTS,
    reconnectDelay: env.VITE_WS_RECONNECT_DELAY,
  },
  cache: {
    ttl: env.VITE_CACHE_TTL,
    maxSize: env.VITE_CACHE_MAX_SIZE,
  },
  engines: {
    timeout: env.VITE_ENGINE_TIMEOUT,
    maxRetries: env.VITE_ENGINE_MAX_RETRIES,
    refreshInterval: env.VITE_ENGINE_REFRESH_INTERVAL,
  },
} as const;