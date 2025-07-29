import { useState, useRef, useCallback, useEffect, useMemo } from "react";

interface StableDataConfig {
  changeThreshold?: number; // Minimum percentage change to update
  debounceMs?: number; // Debounce time for updates
  smoothingFactor?: number; // Exponential smoothing factor (0-1)
}

// Deep comparison utility
const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => deepEqual(a[key], b[key]));
  }
  
  return false;
};

/**
 * Hook to stabilize rapidly changing numeric data and prevent jittery updates
 */
export const useStableData = <T>(
  newValue: T,
  config: StableDataConfig = {}
) => {
  // Memoize config to prevent recreating dependencies
  const stableConfig = useMemo(() => ({
    changeThreshold: config.changeThreshold ?? 0.05,
    debounceMs: config.debounceMs ?? 1000,
    smoothingFactor: config.smoothingFactor ?? 0.7
  }), [config.changeThreshold, config.debounceMs, config.smoothingFactor]);

  const [stableValue, setStableValue] = useState<T>(newValue);
  const [isChanging, setIsChanging] = useState(false);
  const lastUpdateRef = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousRawRef = useRef<T>(newValue);
  const updatePendingRef = useRef<boolean>(false);

  // Stable update function with memoized dependencies
  const updateStableValue = useCallback((value: T) => {
    if (updatePendingRef.current) return; // Prevent concurrent updates
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    // For numeric values, check if change is significant
    if (typeof value === 'number' && typeof stableValue === 'number') {
      const percentChange = Math.abs((value - stableValue) / stableValue);
      
      // If change is too small and recent, ignore it
      if (percentChange < stableConfig.changeThreshold && timeSinceLastUpdate < stableConfig.debounceMs) {
        return;
      }

      // Apply exponential smoothing for gradual transitions
      const smoothedValue = (stableConfig.smoothingFactor * value + (1 - stableConfig.smoothingFactor) * stableValue) as T;
      
      updatePendingRef.current = true;
      setIsChanging(true);
      setStableValue(smoothedValue);
    } else {
      // For non-numeric values, use deep comparison and debouncing
      if (timeSinceLastUpdate < stableConfig.debounceMs && deepEqual(value, previousRawRef.current)) {
        return;
      }
      
      updatePendingRef.current = true;
      setIsChanging(true);
      setStableValue(value);
    }

    lastUpdateRef.current = now;
    previousRawRef.current = value;

    // Clear changing state after animation time
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsChanging(false);
      updatePendingRef.current = false;
    }, 300);
  }, [stableValue, stableConfig]);

  // Move value comparison to useEffect to avoid render-time updates
  useEffect(() => {
    if (!deepEqual(newValue, previousRawRef.current)) {
      updateStableValue(newValue);
    }
  }, [newValue, updateStableValue]);

  // Force update function
  const forceUpdate = useCallback(() => {
    updateStableValue(newValue);
  }, [newValue, updateStableValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    value: stableValue,
    isChanging,
    forceUpdate
  };
};