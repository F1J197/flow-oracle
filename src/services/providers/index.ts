/**
 * Data Providers Index - Export all data provider services
 */

export { CoinGeckoService, coinGeckoService } from './CoinGeckoService';
export { TwelveDataService, twelveDataService } from './TwelveDataService';
export { FinnhubService, finnhubService } from './FinnhubService';

// Registry of all data providers for easy access
export const dataProviderRegistry = {
  coingecko: () => import('./CoinGeckoService').then(m => m.coinGeckoService),
  twelvedata: () => import('./TwelveDataService').then(m => m.twelveDataService),
  finnhub: () => import('./FinnhubService').then(m => m.finnhubService)
} as const;

export type DataProviderName = keyof typeof dataProviderRegistry;