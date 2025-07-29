export type IndicatorSource = 'FRED' | 'GLASSNODE' | 'COINBASE' | 'MARKET' | 'ENGINE';
export type IndicatorStatus = 'active' | 'error' | 'stale' | 'loading' | 'offline';
export type TimeFrame = '1h' | '4h' | '1d' | '1w' | '1m' | '3m' | '1y';
export type UpdateFrequency = 'realtime' | '1m' | '5m' | '15m' | '1h' | '1d';

export interface IndicatorMetadata {
  id: string;
  symbol: string;
  name: string;
  description?: string;
  source: IndicatorSource;
  category: string;
  pillar?: number;
  priority: number;
  updateFrequency: UpdateFrequency;
  unit?: string;
  precision?: number;
  apiEndpoint?: string;
  transformFunction?: string;
  dependencies?: string[];
  tags?: string[];
}

export interface DataPoint {
  timestamp: Date;
  value: number;
  volume?: number;
  metadata?: Record<string, any>;
}

export interface IndicatorValue {
  current: number;
  previous?: number;
  change?: number;
  changePercent?: number;
  timestamp: Date;
  confidence?: number;
  quality?: number;
  volume?: number;
  synthetic?: boolean;
}

export interface IndicatorState {
  metadata: IndicatorMetadata;
  value: IndicatorValue | null;
  status: IndicatorStatus;
  lastUpdate: Date;
  lastError?: string;
  isSubscribed: boolean;
  retryCount: number;
  historicalData?: DataPoint[];
}

export interface IndicatorSubscription {
  indicatorId: string;
  callback: (state: IndicatorState) => void;
  timeFrame?: TimeFrame;
  options?: {
    includeHistorical?: boolean;
    historicalPeriod?: string;
    realtime?: boolean;
  };
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: Date;
  ttl: number;
  source: string;
}

export interface WebSocketMessage {
  type: 'update' | 'subscribe' | 'unsubscribe' | 'error' | 'heartbeat';
  indicatorId?: string;
  data?: any;
  timestamp?: string;
  error?: string;
}

export interface HistoricalDataRequest {
  indicatorId: string;
  timeFrame: TimeFrame;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface IndicatorFilter {
  source?: IndicatorSource;
  category?: string;
  pillar?: number;
  status?: IndicatorStatus;
  tags?: string[];
  search?: string;
}