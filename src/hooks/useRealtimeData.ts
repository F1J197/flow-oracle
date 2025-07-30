/**
 * LIQUIDITY² Real-time Data Hook
 * React hook for subscribing to real-time indicator updates
 */

import { useState, useEffect, useCallback } from 'react';
import RealtimeDataService from '@/services/RealtimeDataService';
import type { IndicatorValue } from '@/types/indicators';
import type { WebSocketStatus } from '@/services/WebSocketManager';

interface UseRealtimeDataOptions {
  source?: 'coinbase' | 'binance' | 'supabase';
  autoConnect?: boolean;
  onError?: (error: Error) => void;
}

interface UseRealtimeDataReturn {
  data: IndicatorValue | null;
  isConnected: boolean;
  connectionStatus: Record<string, WebSocketStatus>;
  error: string | null;
  subscribe: (indicatorId: string) => void;
  unsubscribe: () => void;
  reconnect: () => Promise<void>;
}

export function useRealtimeData(
  initialIndicatorId?: string,
  options: UseRealtimeDataOptions = {}
): UseRealtimeDataReturn {
  const { source = 'supabase', autoConnect = true, onError } = options;
  
  const [data, setData] = useState<IndicatorValue | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, WebSocketStatus>>({});
  const [error, setError] = useState<string | null>(null);
  const [currentIndicator, setCurrentIndicator] = useState<string | null>(initialIndicatorId || null);
  const [unsubscribeFn, setUnsubscribeFn] = useState<(() => void) | null>(null);

  // Get connection status
  const updateConnectionStatus = useCallback(() => {
    try {
      const status = RealtimeDataService.getConnectionStatus();
      setConnectionStatus(status);
    } catch (err) {
      console.error('Failed to get connection status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      onError?.(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [onError]);

  // Subscribe to indicator updates
  const subscribe = useCallback((indicatorId: string) => {
    try {
      // Clean up existing subscription
      if (unsubscribeFn) {
        unsubscribeFn();
      }

      setError(null);
      setCurrentIndicator(indicatorId);

      const unsubscribe = RealtimeDataService.subscribe(
        indicatorId,
        (value: IndicatorValue) => {
          setData(value);
          setError(null);
        },
        source
      );

      setUnsubscribeFn(() => unsubscribe);
    } catch (err) {
      console.error('Failed to subscribe to indicator:', err);
      setError(err instanceof Error ? err.message : 'Subscription failed');
      onError?.(err instanceof Error ? err : new Error('Subscription failed'));
    }
  }, [source, unsubscribeFn, onError]);

  // Unsubscribe from current indicator
  const unsubscribe = useCallback(() => {
    if (unsubscribeFn) {
      unsubscribeFn();
      setUnsubscribeFn(null);
    }
    setCurrentIndicator(null);
    setData(null);
    setError(null);
  }, [unsubscribeFn]);

  // Reconnect all connections
  const reconnect = useCallback(async () => {
    try {
      setError(null);
      await RealtimeDataService.reconnectAll();
      updateConnectionStatus();
      
      // Resubscribe to current indicator if exists
      if (currentIndicator) {
        setTimeout(() => subscribe(currentIndicator), 2000);
      }
    } catch (err) {
      console.error('Failed to reconnect:', err);
      setError(err instanceof Error ? err.message : 'Reconnection failed');
      onError?.(err instanceof Error ? err : new Error('Reconnection failed'));
    }
  }, [currentIndicator, subscribe, updateConnectionStatus, onError]);

  // Initialize connection status polling
  useEffect(() => {
    if (autoConnect) {
      updateConnectionStatus();
      
      const interval = setInterval(updateConnectionStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [autoConnect, updateConnectionStatus]);

  // Auto-subscribe to initial indicator
  useEffect(() => {
    if (autoConnect && initialIndicatorId && !currentIndicator) {
      subscribe(initialIndicatorId);
    }
  }, [autoConnect, initialIndicatorId, currentIndicator, subscribe]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeFn) {
        unsubscribeFn();
      }
    };
  }, [unsubscribeFn]);

  // Determine if connected based on source
  const isConnected = connectionStatus[source] === 'connected';

  return {
    data,
    isConnected,
    connectionStatus,
    error,
    subscribe,
    unsubscribe,
    reconnect
  };
}

// Hook for multiple indicators
interface UseRealtimeIndicatorsReturn {
  data: Record<string, IndicatorValue>;
  connectionStatus: Record<string, WebSocketStatus>;
  subscribedIndicators: string[];
  subscribe: (indicatorId: string, source?: 'coinbase' | 'binance' | 'supabase') => void;
  unsubscribe: (indicatorId: string) => void;
  unsubscribeAll: () => void;
  reconnect: () => Promise<void>;
}

export function useRealtimeIndicators(): UseRealtimeIndicatorsReturn {
  const [data, setData] = useState<Record<string, IndicatorValue>>({});
  const [connectionStatus, setConnectionStatus] = useState<Record<string, WebSocketStatus>>({});
  const [subscriptions, setSubscriptions] = useState<Map<string, () => void>>(new Map());

  const updateConnectionStatus = useCallback(() => {
    try {
      const status = RealtimeDataService.getConnectionStatus();
      setConnectionStatus(status);
    } catch (err) {
      console.error('Failed to get connection status:', err);
    }
  }, []);

  const subscribe = useCallback((indicatorId: string, source: 'coinbase' | 'binance' | 'supabase' = 'supabase') => {
    // Don't re-subscribe if already subscribed
    if (subscriptions.has(indicatorId)) {
      return;
    }

    try {
      const unsubscribe = RealtimeDataService.subscribe(
        indicatorId,
        (value: IndicatorValue) => {
          setData(prev => ({
            ...prev,
            [indicatorId]: value
          }));
        },
        source
      );

      setSubscriptions(prev => new Map(prev).set(indicatorId, unsubscribe));
    } catch (err) {
      console.error(`Failed to subscribe to ${indicatorId}:`, err);
    }
  }, [subscriptions]);

  const unsubscribe = useCallback((indicatorId: string) => {
    const unsubscribeFn = subscriptions.get(indicatorId);
    if (unsubscribeFn) {
      unsubscribeFn();
      setSubscriptions(prev => {
        const newMap = new Map(prev);
        newMap.delete(indicatorId);
        return newMap;
      });
      
      setData(prev => {
        const newData = { ...prev };
        delete newData[indicatorId];
        return newData;
      });
    }
  }, [subscriptions]);

  const unsubscribeAll = useCallback(() => {
    subscriptions.forEach(unsubscribeFn => unsubscribeFn());
    setSubscriptions(new Map());
    setData({});
  }, [subscriptions]);

  const reconnect = useCallback(async () => {
    try {
      await RealtimeDataService.reconnectAll();
      updateConnectionStatus();
      
      // Resubscribe to all indicators
      const indicatorIds = Array.from(subscriptions.keys());
      setTimeout(() => {
        indicatorIds.forEach(id => subscribe(id));
      }, 2000);
    } catch (err) {
      console.error('Failed to reconnect:', err);
    }
  }, [subscriptions, subscribe, updateConnectionStatus]);

  // Update connection status periodically
  useEffect(() => {
    updateConnectionStatus();
    const interval = setInterval(updateConnectionStatus, 5000);
    return () => clearInterval(interval);
  }, [updateConnectionStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      subscriptions.forEach(unsubscribeFn => unsubscribeFn());
    };
  }, [subscriptions]);

  return {
    data,
    connectionStatus,
    subscribedIndicators: Array.from(subscriptions.keys()),
    subscribe,
    unsubscribe,
    unsubscribeAll,
    reconnect
  };
}