export interface DataIntegrityMetrics {
  integrityScore: number;
  activeSources: number;
  totalSources: number;
  lastValidation: Date;
  systemStatus: string;
  p95Latency: number;
  autoHealed24h: number;
  consensusLevel: number;
  errorRate?: number;
  dataFreshness?: number;
  completeness?: number;
}

export interface DataIntegrityConfig {
  refreshInterval?: number;
  maxRetries?: number;
  timeout?: number;
  cacheTimeout?: number;
  gracefulDegradation?: boolean;
}

export interface ValidationResult {
  source: string;
  passed: boolean;
  score: number;
  timestamp: Date;
  errors?: string[];
}

export interface SourceHealth {
  id: string;
  name: string;
  status: 'active' | 'degraded' | 'offline';
  lastCheck: Date;
  reliability: number;
}