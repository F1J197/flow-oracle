import { useEffect, useState, useCallback } from "react";
import { dataService } from "@/services/dataService";

interface UsePeriodicUpdatesProps {
  initializeEngines: () => Promise<void>;
  executeEngines: () => Promise<any>;
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

  const initializeAndUpdate = useCallback(async () => {
    setLoading(true);
    
    try {
      // Initialize Enhanced Z-Score Engine (only one that needs initialization)
      await initializeEngines();

      // First, trigger live data fetch to ensure we have fresh data
      try {
        await dataService.triggerLiveDataFetch();
        console.log('Live data fetch completed');
      } catch (liveError) {
        console.warn('Live data fetch failed, using existing data:', liveError);
      }

      // Execute engines in parallel
      await executeEngines();

      // Update dashboard data
      updateDashboardData();
    } catch (error) {
      console.error('Error during engine initialization/execution:', error);
    }

    setLoading(false);
  }, [initializeEngines, executeEngines, updateDashboardData]);

  const updateData = useCallback(async () => {
    if (loading) return; // Skip if already updating
    
    setLoading(true);
    
    try {
      // Execute engines in parallel for periodic updates
      await executeEngines();

      // Update dashboard data
      updateDashboardData();
    } catch (error) {
      console.error('Error updating dashboard data:', error);
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

  return { loading };
};