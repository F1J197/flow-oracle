import { useState, useEffect, useRef } from "react";

interface StaticTileLoadingConfig {
  debounceMs?: number; // How long to debounce loading changes
  minLoadingDuration?: number; // Minimum time to show loading
}

/**
 * Hook to stabilize loading states for static tiles that don't need frequent updates
 */
export const useStaticTileLoading = (
  externalLoading: boolean,
  config: StaticTileLoadingConfig = {}
) => {
  const {
    debounceMs = 2000, // 2 second debounce for static tiles
    minLoadingDuration = 500 // Minimum 500ms loading display
  } = config;

  const [stableLoading, setStableLoading] = useState(externalLoading);
  const [lastLoadingStart, setLastLoadingStart] = useState<number>(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const minDurationTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear existing timeouts
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (minDurationTimeoutRef.current) {
      clearTimeout(minDurationTimeoutRef.current);
    }

    if (externalLoading) {
      // Start loading immediately but track when it started
      if (!stableLoading) {
        setStableLoading(true);
        setLastLoadingStart(Date.now());
      }
    } else {
      // Debounce loading false to prevent flickering
      debounceTimeoutRef.current = setTimeout(() => {
        const now = Date.now();
        const loadingDuration = now - lastLoadingStart;
        
        if (loadingDuration >= minLoadingDuration) {
          // Can stop loading immediately
          setStableLoading(false);
        } else {
          // Wait for minimum duration
          const remainingTime = minLoadingDuration - loadingDuration;
          minDurationTimeoutRef.current = setTimeout(() => {
            setStableLoading(false);
          }, remainingTime);
        }
      }, debounceMs);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (minDurationTimeoutRef.current) {
        clearTimeout(minDurationTimeoutRef.current);
      }
    };
  }, [externalLoading, stableLoading, lastLoadingStart, debounceMs, minLoadingDuration]);

  return stableLoading;
};