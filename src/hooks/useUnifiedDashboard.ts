import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUnifiedIndicators } from './useUnifiedIndicators';
import { DashboardTileData } from '@/types/engines';

interface UnifiedDashboardData {
  netLiquidity: DashboardTileData;
  creditStress: DashboardTileData;
  momentum: DashboardTileData;
  zScore: DashboardTileData;
  primaryDealer: DashboardTileData;
  dataIntegrity: DashboardTileData;
  cusipStealth: DashboardTileData;
}

interface UseUnifiedDashboardOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useUnifiedDashboard = (options: UseUnifiedDashboardOptions = {}) => {
  const { autoRefresh = true, refreshInterval = 15000 } = options;
  
  const {
    indicators,
    loading: indicatorsLoading,
    error: indicatorsError,
    refreshAll,
    stats
  } = useUnifiedIndicators({
    autoRefresh,
    refreshInterval,
    includeInactive: false
  });

  const [dashboardData, setDashboardData] = useState<UnifiedDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map indicators to dashboard tiles
  const transformToDashboardData = useCallback((): UnifiedDashboardData => {
    const getIndicatorBySymbol = (symbol: string) => 
      indicators.find(ind => ind.metadata.symbol === symbol);

    const createTileData = (
      title: string, 
      symbol: string, 
      fallbackMetric: string = 'N/A',
      status: 'normal' | 'warning' | 'critical' = 'normal'
    ): DashboardTileData => {
      const indicator = getIndicatorBySymbol(symbol);
      
      if (!indicator || !indicator.value) {
        return {
          title,
          primaryMetric: fallbackMetric,
          secondaryMetric: 'No Data',
          status: 'critical',
          loading: indicatorsLoading,
          trend: 'neutral',
          actionText: 'Data unavailable'
        };
      }

      const { value, metadata } = indicator;
      const change = value.change || 0;
      const changePercent = value.changePercent || 0;
      
      return {
        title,
        primaryMetric: formatMetric(value.current, metadata.unit),
        secondaryMetric: `${change >= 0 ? '+' : ''}${formatMetric(change, metadata.unit)} (${changePercent.toFixed(2)}%)`,
        status: determineStatus(indicator),
        loading: false,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
        actionText: generateInsight(indicator)
      };
    };

    return {
      netLiquidity: createTileData('Net Liquidity', 'NET_LIQUIDITY', '$0.00T'),
      creditStress: createTileData('Credit Stress', 'CREDIT_STRESS', '0%'),
      momentum: createTileData('Market Momentum', 'MOMENTUM_SCORE', '0'),
      zScore: createTileData('Z-Score Analysis', 'ZSCORE_COMPOSITE', '0.0'),
      primaryDealer: createTileData('Primary Dealer', 'DEALER_POSITIONS', '$0B'),
      dataIntegrity: createTileData('Data Integrity', 'DATA_QUALITY', '0%'),
      cusipStealth: createTileData('CUSIP Stealth QE', 'STEALTH_QE', '$0B')
    };
  }, [indicators, indicatorsLoading]);

  // Helper functions
  const formatMetric = (value: number, unit?: string): string => {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A';
    
    if (unit === 'USD' || unit === 'dollars') {
      if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
      if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
      if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
      return `$${value.toFixed(2)}`;
    }
    
    if (unit === 'percentage' || unit === '%') {
      return `${value.toFixed(2)}%`;
    }
    
    return value.toFixed(2);
  };

  const determineStatus = (indicator: any): 'normal' | 'warning' | 'critical' => {
    if (indicator.status === 'error' || indicator.status === 'offline') return 'critical';
    if (indicator.status === 'stale') return 'warning';
    
    // Add value-based status logic here if needed
    return 'normal';
  };

  const generateInsight = (indicator: any): string => {
    const { value, metadata } = indicator;
    if (!value) return 'No data available';
    
    const trend = value.change > 0 ? 'increasing' : value.change < 0 ? 'decreasing' : 'stable';
    return `${metadata.name} is ${trend}`;
  };

  // Update dashboard data when indicators change
  useEffect(() => {
    if (!indicatorsLoading && indicators.length > 0) {
      try {
        const newData = transformToDashboardData();
        setDashboardData(newData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to transform dashboard data');
      } finally {
        setLoading(false);
      }
    }
  }, [indicators, indicatorsLoading, transformToDashboardData]);

  // Handle errors
  useEffect(() => {
    if (indicatorsError) {
      setError(indicatorsError);
      setLoading(false);
    }
  }, [indicatorsError]);

  // Computed values
  const overallStatus = useMemo(() => {
    if (stats.error > 0) return 'critical';
    if (stats.stale > 0) return 'warning';
    return 'normal';
  }, [stats]);

  const systemHealth = useMemo(() => {
    const total = stats.total;
    if (total === 0) return 0;
    return ((stats.active / total) * 100);
  }, [stats]);

  return {
    dashboardData,
    loading,
    error,
    stats,
    overallStatus,
    systemHealth,
    refreshData: refreshAll,
    indicatorsCount: indicators.length
  };
};