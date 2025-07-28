export interface DashboardTileData {
  title: string;
  primaryMetric: string | number;
  secondaryMetric?: string;
  status: 'normal' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'neutral';
  actionText?: string;
  color?: 'teal' | 'orange' | 'lime' | 'gold' | 'fuchsia';
  loading?: boolean;
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
  
  execute(): Promise<EngineReport>;
  getDashboardData(): DashboardTileData;
  getDetailedView(): DetailedEngineView;
}

export type EngineStatus = 'running' | 'idle' | 'error' | 'loading';

export interface EngineState {
  status: EngineStatus;
  lastReport?: EngineReport;
  lastError?: string;
}