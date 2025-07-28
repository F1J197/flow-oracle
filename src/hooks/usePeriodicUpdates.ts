import { useEffect, useState, useCallback } from "react";
import { dataService } from "@/services/dataService";
import { useEngineStatus } from "./useEngineStatus";

interface UsePeriodicUpdatesProps {
  initializeEngines: () => Promise<void>;
  executeEngines: (statusCallbacks?: {
    setEngineLoading?: (id: string) => void;
    setEngineSuccess?: (id: string, report: any) => void;
    setEngineError?: (id: string, error: string) => void;
  }) => Promise<any>;
  updateDashboardData: () => void;
  cleanupEngines: () => void;
}

export const usePeriodicUpdates = ({
  initializeEngines,
  executeEngines,
  updateDashboardData,
  cleanupEngines,
}: UsePeriodicUpdatesProps) => {
  const [loading, setLoading] = useState(true);
  const { 
    setEngineLoading, 
    setEngineSuccess, 
    setEngineError, 
    setEngineTimeout,
    resetAllStatuses,
    getOverallStatus 
  } = useEngineStatus();

  const initializeAndUpdate = useCallback(async () => {
    setLoading(true);
    const INIT_TIMEOUT = 90000; // 90 seconds for full initialization
    
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Initialization timeout')), INIT_TIMEOUT);
      });

      // Race between initialization and timeout
      await Promise.race([
        (async () => {
          // Reset all engine statuses
          resetAllStatuses();
          
          // Initialize Enhanced Z-Score Engine (only one that needs initialization)
          await initializeEngines();

          // First, trigger live data fetch to ensure we have fresh data
          try {
            await dataService.triggerLiveDataFetch();
            console.log('Live data fetch completed');
          } catch (liveError) {
            console.warn('Live data fetch failed, using existing data:', liveError);
          }

          // Execute engines in parallel with status tracking
          await executeEngines({
            setEngineLoading,
            setEngineSuccess,
            setEngineError
          });
        })(),
        timeoutPromise
      ]);

      // Update dashboard data
      updateDashboardData();
    } catch (error) {
      console.error('Error during engine initialization/execution:', error);
      // Don't fail completely - try to update with current state
      updateDashboardData();
    }

    setLoading(false);
  }, [initializeEngines, executeEngines, updateDashboardData]);

  const updateData = useCallback(async () => {
    if (loading) return; // Skip if already updating
    
    setLoading(true);
    const UPDATE_TIMEOUT = 45000; // 45 seconds timeout
    
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Update timeout')), UPDATE_TIMEOUT);
      });

      // Race between execution and timeout
      await Promise.race([
        executeEngines({
          setEngineLoading,
          setEngineSuccess,
          setEngineError
        }),
        timeoutPromise
      ]);

      // Update dashboard data
      updateDashboardData();
    } catch (error) {
      console.error('Error updating dashboard data:', error);
      // Don't throw - allow dashboard to show last known data
      updateDashboardData(); // Update with current engine state
    }

    setLoading(false);
  }, [loading, executeEngines, updateDashboardData]);

  useEffect(() => {
    // Initialize on mount
    initializeAndUpdate();
    
    // Update every 30 seconds after initialization
    const interval = setInterval(updateData, 30000);
    
    return () => {
      clearInterval(interval);
      // Cleanup engines
      cleanupEngines();
    };
  }, [initializeAndUpdate, updateData, cleanupEngines]);

  return { 
    loading, 
    overallStatus: getOverallStatus() 
  };
};