// Database types for engine outputs and related data

export interface DatabaseEngineOutput {
  id: string;
  engine_id: string;
  signal: string;
  confidence: number;
  primary_value: number;
  pillar: number;
  analysis?: string;
  sub_metrics?: Record<string, any>;
  alerts?: any[];
  calculated_at: string;
  created_at?: string;
  importance_score?: number;
}

export interface DatabaseMasterSignal {
  id: string;
  master_signal: string;
  signal_strength: number;
  consensus_score: number;
  conflict_level: string;
  market_regime: string;
  regime_confidence: number;
  engine_count: number;
  created_at: string;
}