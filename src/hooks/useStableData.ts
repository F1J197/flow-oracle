import { useState, useRef, useCallback } from "react";

interface StableDataConfig {
  changeThreshold?: number; // Minimum percentage change to update
  debounceMs?: number; // Debounce time for updates
  smoothingFactor?: number; // Exponential smoothing factor (0-1)
}

/**
 * Hook to stabilize rapidly changing numeric data and prevent jittery updates
 */
export const useStableData = <T>(
  newValue: T,
  config: StableDataConfig = {}
) => {
  const {
    changeThreshold = 0.05, // 5% minimum change
    debounceMs = 1000, // 1 second debounce
    smoothingFactor = 0.7 // Moderate smoothing
  } = config;

  const [stableValue, setStableValue] = useState<T>(newValue);
  const [isChanging, setIsChanging] = useState(false);
  const lastUpdateRef = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousRawRef = useRef<T>(newValue);

  const updateStableValue = useCallback((value: T) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    // For numeric values, check if change is significant
    if (typeof value === 'number' && typeof stableValue === 'number') {
      const percentChange = Math.abs((value - stableValue) / stableValue);
      
      // If change is too small and recent, ignore it
      if (percentChange < changeThreshold && timeSinceLastUpdate < debounceMs) {
        return;
      }

      // Apply exponential smoothing for gradual transitions
      const smoothedValue = (smoothingFactor * value + (1 - smoothingFactor) * stableValue) as T;
      
      setIsChanging(true);
      setStableValue(smoothedValue);
    } else {
      // For non-numeric values, use debouncing
      if (timeSinceLastUpdate < debounceMs && value === previousRawRef.current) {
        return;
      }
      
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
    }, 300);
  }, [stableValue, changeThreshold, debounceMs, smoothingFactor]);

  // Update when new value changes significantly
  if (newValue !== previousRawRef.current) {
    updateStableValue(newValue);
  }

  return {
    value: stableValue,
    isChanging,
    forceUpdate: () => updateStableValue(newValue)
  };
};