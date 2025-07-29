export interface IntelligenceViewData {
  title: string;
  status: 'active' | 'warning' | 'critical' | 'offline';
  primaryMetric: {
    label: string;
    value: string | number;
    unit?: string;
    color: 'teal' | 'orange' | 'lime' | 'gold' | 'fuchsia' | 'btc' | 'btc-light' | 'btc-glow' | 'btc-muted' | 'default';
  };
  keyMetrics: Array<{
    label: string;
    value: string | number;
    status?: 'good' | 'warning' | 'critical';
  }>;
  insights: string[];
  lastUpdated: Date;
}