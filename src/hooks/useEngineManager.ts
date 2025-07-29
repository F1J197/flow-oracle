import { useState, useCallback } from "react";
import { DataIntegrityEngine } from "@/engines/DataIntegrityEngine";
import { NetLiquidityEngine } from "@/engines/NetLiquidityEngine";
import { CreditStressEngineV6 } from "@/engines/CreditStressEngineV6";
import { EnhancedZScoreEngine } from "@/engines/EnhancedZScoreEngine";
import { EnhancedMomentumEngine } from "@/engines/EnhancedMomentumEngine";
import { PrimaryDealerPositionsEngineV6 } from "@/engines/PrimaryDealerPositionsEngineV6";
import { CUSIPStealthQEEngine } from "@/engines/CUSIPStealthQEEngine";
import { useEngineTimeout } from "./useEngineTimeout";

export const useEngineManager = () => {
  const { withTimeout, withRetry } = useEngineTimeout();
  
  const [engines] = useState({
    dataIntegrity: new DataIntegrityEngine(),
    netLiquidity: new NetLiquidityEngine(),
    creditStressV6: new CreditStressEngineV6(),
    enhancedZScore: new EnhancedZScoreEngine(),
    enhancedMomentum: new EnhancedMomentumEngine(),
    primaryDealerPositions: new PrimaryDealerPositionsEngineV6(),
    cusipStealthQE: new CUSIPStealthQEEngine(),
  });

  const initializeEngines = useCallback(async () => {
    console.log('Initializing Enhanced Z-Score Engine...');
    
    try {
      await withTimeout(
        () => engines.enhancedZScore.initialize(),
        { timeout: 60000, operation: 'Z-Score Engine initialization' }
      );
      console.log('All engines initialized');
    } catch (error) {
      console.error('Engine initialization failed:', error);
      // Don't throw - allow dashboard to work with other engines
    }
  }, [engines.enhancedZScore, withTimeout]);

  const executeEngines = useCallback(async (statusCallbacks?: {
    setEngineLoading?: (id: string) => void;
    setEngineSuccess?: (id: string, report: any) => void;
    setEngineError?: (id: string, error: string) => void;
  }) => {
    // Optimized engine execution with staggering
    const engineConfigs = [
      { id: 'data-integrity', engine: engines.dataIntegrity, timeout: 10000, name: 'Data Integrity Engine', priority: 'high' as const },
      { id: 'net-liquidity', engine: engines.netLiquidity, timeout: 10000, name: 'Net Liquidity Engine', priority: 'high' as const },
      { id: 'credit-stress', engine: engines.creditStressV6, timeout: 10000, name: 'Credit Stress Engine', priority: 'medium' as const },
      { id: 'cusip-stealth-qe', engine: engines.cusipStealthQE, timeout: 15000, name: 'CUSIP Stealth QE Engine', priority: 'medium' as const },
      { id: 'primary-dealer-positions-v6', engine: engines.primaryDealerPositions, timeout: 10000, name: 'Primary Dealer Positions Engine V6', priority: 'medium' as const },
      { id: 'enhanced-momentum', engine: engines.enhancedMomentum, timeout: 20000, name: 'Enhanced Momentum Engine', priority: 'low' as const },
      { id: 'enhanced-zscore', engine: engines.enhancedZScore, timeout: 25000, name: 'Enhanced Z-Score Engine', priority: 'low' as const },
    ];

    // Set all engines to loading if status callbacks provided
    if (statusCallbacks?.setEngineLoading) {
      engineConfigs.forEach(config => statusCallbacks.setEngineLoading!(config.id));
    }

    // Execute engines with staggered start times by priority
    const engineResults = await Promise.allSettled(
      engineConfigs.map(async (config, index) => {
        // Stagger execution: high priority = immediate, medium = 1s delay, low = 2s delay
        const staggerDelay = config.priority === 'high' ? 0 : config.priority === 'medium' ? 1000 : 2000;
        if (staggerDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, staggerDelay));
        }
        
        try {
          const report = await withRetry(
            () => config.engine.execute(),
            { timeout: config.timeout, operation: config.name, retries: 1 }
          );
          
          // Update status on success
          if (statusCallbacks?.setEngineSuccess) {
            statusCallbacks.setEngineSuccess(config.id, report);
          }
          
          return { ...report, engineId: config.id };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Engine execution failed';
          
          // Update status on error
          if (statusCallbacks?.setEngineError) {
            statusCallbacks.setEngineError(config.id, errorMessage);
          }
          
          throw error;
        }
      })
    );

    // Process results and log any failures
    const reports = engineResults.map((result, index) => {
      const config = engineConfigs[index];
      
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`${config.name} failed:`, result.reason);
        // Return a fallback report
        return {
          success: false,
          confidence: 0,
          signal: 'neutral' as const,
          data: { error: result.reason?.message || 'Engine execution failed' },
          errors: [result.reason?.message || 'Engine execution failed'],
          lastUpdated: new Date(),
          engineId: config.id
        };
      }
    });

    console.log('Engine execution completed:', reports);
    return reports;
  }, [engines, withRetry]);

  const cleanupEngines = useCallback(() => {
    try {
      engines.enhancedZScore.dispose();
    } catch (error) {
      console.warn('Error during engine cleanup:', error);
    }
  }, [engines.enhancedZScore]);

  return {
    engines,
    initializeEngines,
    executeEngines,
    cleanupEngines,
  };
};