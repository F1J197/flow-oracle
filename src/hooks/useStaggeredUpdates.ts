import { useState, useEffect, useCallback, useRef } from "react";

interface StaggeredUpdateConfig {
  baseInterval: number; // Base interval in ms
  staggerWindow: number; // Time window to spread updates across
  priority: 'high' | 'medium' | 'low'; // Update priority
}

/**
 * Hook to stagger dashboard updates and prevent simultaneous refreshes
 */
export const useStaggeredUpdates = (
  updateFn: () => void,
  config: StaggeredUpdateConfig
) => {
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [isScheduled, setIsScheduled] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const { baseInterval, staggerWindow, priority } = config;

  // Calculate staggered delay based on priority
  const getStaggerDelay = useCallback(() => {
    const priorityMultipliers = {
      high: 0, // No delay for high priority
      medium: 0.3, // 30% of stagger window
      low: 0.6 // 60% of stagger window
    };
    
    const priorityDelay = staggerWindow * priorityMultipliers[priority];
    const randomJitter = Math.random() * (staggerWindow * 0.2); // 20% random jitter
    
    return priorityDelay + randomJitter;
  }, [staggerWindow, priority]);

  const scheduleUpdate = useCallback(() => {
    if (isScheduled) return;

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdate;
    const minInterval = baseInterval + getStaggerDelay();

    if (timeSinceLastUpdate >= minInterval) {
      // Can update immediately
      updateFn();
      setLastUpdate(now);
    } else {
      // Schedule for later
      const delay = minInterval - timeSinceLastUpdate;
      setIsScheduled(true);
      
      timeoutRef.current = setTimeout(() => {
        updateFn();
        setLastUpdate(Date.now());
        setIsScheduled(false);
      }, delay);
    }
  }, [updateFn, baseInterval, lastUpdate, isScheduled, getStaggerDelay]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    scheduleUpdate,
    isScheduled,
    lastUpdate
  };
};