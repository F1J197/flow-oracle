export interface ActionableInsight {
  actionText: string;
  signalStrength: number; // 0-100
  marketAction: 'BUY' | 'SELL' | 'HOLD' | 'WAIT';
  confidence: 'HIGH' | 'MED' | 'LOW';
  timeframe: 'IMMEDIATE' | 'SHORT_TERM' | 'MEDIUM_TERM';
}

export interface DashboardTileData {
  title: string;
  primaryMetric: string | number;
  secondaryMetric?: string;
  status: 'normal' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'neutral';
  actionText?: string;
  color?: 'success' | 'critical' | 'warning' | 'info' | 'neutral';
  loading?: boolean;
}

export interface IntelligenceViewData {
  title: string;
  status: 'active' | 'warning' | 'critical' | 'offline';
  primaryMetrics: Record<string, {
    value: string | number;
    label: string;
    status?: 'normal' | 'warning' | 'critical';
    trend?: 'up' | 'down' | 'neutral';
  }>;
  sections: Array<{
    title: string;
    data: Record<string, {
      value: string | number;
      label: string;
      unit?: string;
      status?: 'normal' | 'warning' | 'critical';
    }>;
  }>;
  alerts?: Array<{
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp?: Date;
  }>;
  confidence: number;
  lastUpdate: Date;
}

export interface DetailedModalData {
  title: string;
  description: string;
  keyInsights: string[];
  detailedMetrics: Array<{
    category: string;
    metrics: Record<string, {
      value: string | number;
      description: string;
      calculation?: string;
      significance?: 'high' | 'medium' | 'low';
    }>;
  }>;
  historicalContext?: {
    period: string;
    comparison: string;
    significance: string;
  };
  actionItems?: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    timeframe: string;
  }>;
}

export interface DetailedEngineView {
  title: string;
  primarySection: {
    title: string;
    metrics: Record<string, string | number>;
  };
  sections: Array<{
    title: string;
    metrics: Record<string, string | number>;
  }>;
  alerts?: Array<{
    severity: 'info' | 'warning' | 'critical';
    message: string;
  }>;
}

export interface EngineReport {
  success: boolean;
  confidence: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  data: any;
  errors?: string[];
  lastUpdated: Date;
}

export interface IEngine {
  id: string;
  name: string;
  priority: number;
  pillar: 1 | 2 | 3;
  category: 'foundation' | 'core' | 'synthesis' | 'execution';
  
  execute(): Promise<EngineReport>;
  getSingleActionableInsight(): ActionableInsight;
  getDashboardData(): DashboardTileData;
  getDashboardTile(): DashboardTileData;
  getIntelligenceView(): IntelligenceViewData;
  getDetailedModal(): DetailedModalData;
  getDetailedView(): DetailedEngineView; // Keep for backward compatibility
}

export type EngineStatus = 'running' | 'idle' | 'error' | 'loading';

export interface EngineState {
  status: EngineStatus;
  lastReport?: EngineReport;
  lastError?: string;
}