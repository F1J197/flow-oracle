// DataIngestion Service Index
export { BinanceService, binanceService, type DataIngestionSource } from './BinanceService';
export { FREDServiceWrapper, fredServiceWrapper } from './FREDServiceWrapper';

// Registry of all data ingestion sources
import { binanceService } from './BinanceService';
import { fredServiceWrapper } from './FREDServiceWrapper';

export const dataIngestionRegistry = {
  binance: binanceService,
  fred: fredServiceWrapper
} as const;

export type DataIngestionProvider = keyof typeof dataIngestionRegistry;