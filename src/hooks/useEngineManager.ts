import { useState, useCallback } from "react";
import { DataIntegrityEngine } from "@/engines/DataIntegrityEngine";
import { NetLiquidityEngine } from "@/engines/NetLiquidityEngine";
import { CreditStressEngineV6 } from "@/engines/CreditStressEngineV6";
import { EnhancedZScoreEngine } from "@/engines/EnhancedZScoreEngine";
import { EnhancedMomentumEngine } from "@/engines/EnhancedMomentumEngine";

export const useEngineManager = () => {
  const [engines] = useState({
    dataIntegrity: new DataIntegrityEngine(),
    netLiquidity: new NetLiquidityEngine(),
    creditStressV6: new CreditStressEngineV6(),
    enhancedZScore: new EnhancedZScoreEngine(),
    enhancedMomentum: new EnhancedMomentumEngine(),
  });

  const initializeEngines = useCallback(async () => {
    console.log('Initializing Enhanced Z-Score Engine...');
    await engines.enhancedZScore.initialize();
    console.log('All engines initialized');
  }, [engines.enhancedZScore]);

  const executeEngines = useCallback(async () => {
    const reports = await Promise.all([
      engines.dataIntegrity.execute(),
      engines.netLiquidity.execute(),
      engines.creditStressV6.execute(),
      engines.enhancedMomentum.execute(),
      engines.enhancedZScore.execute(),
    ]);

    console.log('Engine execution reports:', reports);
    return reports;
  }, [engines]);

  const cleanupEngines = useCallback(() => {
    engines.enhancedZScore.dispose();
  }, [engines.enhancedZScore]);

  return {
    engines,
    initializeEngines,
    executeEngines,
    cleanupEngines,
  };
};