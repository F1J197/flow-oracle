/**
 * API Configuration - Master Prompts Compliance
 * Centralized configuration for all external API integrations
 */

export interface APIEndpoint {
  baseUrl: string;
  timeout: number;
  retries: number;
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
}

export interface APIConfig {
  fred: APIEndpoint;
  coinbase: APIEndpoint;
  binance: APIEndpoint;
  glassnode: APIEndpoint;
  bloomberg?: APIEndpoint;
  cme: APIEndpoint;
}

export const API_CONFIG: APIConfig = {
  fred: {
    baseUrl: 'https://api.stlouisfed.org/fred',
    timeout: 30000,
    retries: 3,
    rateLimit: {
      requests: 120,
      windowMs: 60000 // 1 minute
    }
  },
  coinbase: {
    baseUrl: 'https://api.pro.coinbase.com',
    timeout: 10000,
    retries: 2,
    rateLimit: {
      requests: 10,
      windowMs: 1000 // 1 second
    }
  },
  binance: {
    baseUrl: 'https://api.binance.com',
    timeout: 10000,
    retries: 2,
    rateLimit: {
      requests: 1200,
      windowMs: 60000 // 1 minute
    }
  },
  glassnode: {
    baseUrl: 'https://api.glassnode.com',
    timeout: 30000,
    retries: 3,
    rateLimit: {
      requests: 100,
      windowMs: 60000 // 1 minute
    }
  },
  cme: {
    baseUrl: 'https://www.cmegroup.com',
    timeout: 30000,
    retries: 3
  }
};

export const WEBSOCKET_CONFIG = {
  coinbase: 'wss://ws-feed.pro.coinbase.com',
  binance: 'wss://stream.binance.com:9443/ws',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10
};

export const CACHE_CONFIG = {
  defaultTTL: 300000, // 5 minutes
  realTimeTTL: 15000, // 15 seconds
  historicalTTL: 3600000, // 1 hour
  staticTTL: 86400000 // 24 hours
};