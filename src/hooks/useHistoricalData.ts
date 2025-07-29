import { useState, useEffect, useCallback, useMemo } from 'react';
import { UnifiedDataService } from '@/services/UnifiedDataService';
import { DataPoint, HistoricalDataRequest, TimeFrame } from '@/types/indicators';
import { useCircuitBreaker } from '@/components/ui/circuit-breaker';

interface UseHistoricalDataOptions {
  indicatorId: string;
  timeFrame: TimeFrame;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  aggregation?: 'raw' | 'hourly' | 'daily' | 'weekly' | 'monthly';
}

interface UseHistoricalDataReturn {
  data: DataPoint[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalPoints: number;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  aggregatedData: DataPoint[];
  downloadCSV: () => void;
  downloadJSON: () => void;
}

export function useHistoricalData({
  indicatorId,
  timeFrame,
  startDate,
  endDate,
  limit = 100,
  autoRefresh = false,
  refreshInterval = 60000,
  aggregation = 'raw'
}: UseHistoricalDataOptions): UseHistoricalDataReturn {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [offset, setOffset] = useState(0);

  const dataService = UnifiedDataService.getInstance();
  const circuitBreaker = useCircuitBreaker({ maxFailures: 3, resetTimeout: 30000 });

  const aggregatedData = useMemo(() => {
    if (aggregation === 'raw') return data;
    
    return aggregateDataPoints(data, aggregation);
  }, [data, aggregation]);

  const fetchData = useCallback(async (reset = true) => {
    if (!circuitBreaker.canExecute()) {
      setError('Service temporarily unavailable');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const request: HistoricalDataRequest = {
        indicatorId,
        timeFrame,
        startDate,
        endDate,
        limit
      };

      const newData = await dataService.getHistoricalData(request);
      
      if (reset) {
        setData(newData);
        setOffset(newData.length);
      } else {
        setData(prev => [...prev, ...newData]);
        setOffset(prev => prev + newData.length);
      }

      setHasMore(newData.length === limit);
      setTotalPoints(prev => reset ? newData.length : prev + newData.length);
      
      circuitBreaker.recordSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch historical data';
      setError(errorMessage);
      circuitBreaker.recordFailure(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [indicatorId, timeFrame, startDate, endDate, limit, dataService, circuitBreaker]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return Promise.resolve();
    return fetchData(false);
  }, [hasMore, loading, fetchData]);

  const downloadCSV = useCallback(() => {
    const csv = convertToCSV(aggregatedData, indicatorId);
    downloadFile(csv, `${indicatorId}_${timeFrame}_data.csv`, 'text/csv');
  }, [aggregatedData, indicatorId, timeFrame]);

  const downloadJSON = useCallback(() => {
    const json = JSON.stringify(aggregatedData, null, 2);
    downloadFile(json, `${indicatorId}_${timeFrame}_data.json`, 'application/json');
  }, [aggregatedData, indicatorId, timeFrame]);

  // Initial data fetch
  useEffect(() => {
    fetchData(true);
  }, [indicatorId, timeFrame, startDate, endDate]);

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (!loading && circuitBreaker.canExecute()) {
        refresh();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh, loading, circuitBreaker]);

  return {
    data,
    loading,
    error,
    hasMore,
    totalPoints,
    refresh,
    loadMore,
    aggregatedData,
    downloadCSV,
    downloadJSON
  };
}

// Helper functions
function aggregateDataPoints(data: DataPoint[], aggregation: string): DataPoint[] {
  if (aggregation === 'raw') return data;

  const grouped = new Map<string, DataPoint[]>();
  
  data.forEach(point => {
    const key = getAggregationKey(point.timestamp, aggregation);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(point);
  });

  return Array.from(grouped.entries()).map(([key, points]) => {
    const timestamp = new Date(key);
    const value = points.reduce((sum, p) => sum + p.value, 0) / points.length;
    const volume = points.reduce((sum, p) => sum + (p.volume || 0), 0);
    
    return {
      timestamp,
      value,
      volume,
      metadata: {
        aggregated: true,
        aggregationType: aggregation,
        pointCount: points.length,
        min: Math.min(...points.map(p => p.value)),
        max: Math.max(...points.map(p => p.value))
      }
    };
  }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

function getAggregationKey(timestamp: Date, aggregation: string): string {
  const date = new Date(timestamp);
  
  switch (aggregation) {
    case 'hourly':
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).toISOString();
    case 'daily':
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
    case 'weekly':
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()).toISOString();
    case 'monthly':
      return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    default:
      return timestamp.toISOString();
  }
}

function convertToCSV(data: DataPoint[], indicatorId: string): string {
  const headers = ['timestamp', 'value', 'volume', 'metadata'];
  const rows = data.map(point => [
    point.timestamp.toISOString(),
    point.value,
    point.volume || '',
    JSON.stringify(point.metadata || {})
  ]);
  
  return [
    `# Historical data for ${indicatorId}`,
    `# Generated at ${new Date().toISOString()}`,
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}