import { useState, useEffect, useCallback } from 'react';
import { debugLogger, engineLogger } from '@/utils/debugLogger';
import { EngineRegistry } from '@/engines/EngineRegistry';
import { UnifiedEngineRegistry } from '@/engines/base/UnifiedEngineRegistry';
// Migration service removed - using simplified initialization

// Import engines
import { DataIntegrityEngine } from '@/engines/foundation/DataIntegrityEngine';
import { EnhancedZScoreEngine } from '@/engines/foundation/EnhancedZScoreEngine';
import { GlobalFinancialPlumbingEngine } from '@/engines/pillar1/GlobalFinancialPlumbingEngine';

export interface EngineInitializationStep {
  id: string;
  name: string;
  description: string;
  weight: number;
  timeout: number;
  engineCreator: () => Promise<any>;
}

export interface UseSequentialEngineInitializationReturn {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  progress: number;
  currentStep: string | null;
  registry: EngineRegistry | null;
  unifiedRegistry: UnifiedEngineRegistry | null;
  retryInitialization: () => void;
}

export function useSequentialEngineInitialization(): UseSequentialEngineInitializationReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [registry, setRegistry] = useState<EngineRegistry | null>(null);
  const [unifiedRegistry, setUnifiedRegistry] = useState<UnifiedEngineRegistry | null>(null);
  // Migration service removed

  // Define initialization steps
  const initializationSteps: EngineInitializationStep[] = [
    {
      id: 'registries',
      name: 'Initialize Registries',
      description: 'Setting up engine management systems',
      weight: 1,
      timeout: 5000,
      engineCreator: async () => {
        engineLogger.registry('Initializing engine registries');
        
        const legacyRegistry = EngineRegistry.getInstance();
        const modernRegistry = UnifiedEngineRegistry.getInstance();
        
        setRegistry(legacyRegistry);
        setUnifiedRegistry(modernRegistry);
        
        return { legacyRegistry, modernRegistry };
      }
    },
    {
      id: 'foundation-engines',
      name: 'Foundation Engines',
      description: 'Loading core data integrity and statistical engines',
      weight: 3,
      timeout: 10000,
      engineCreator: async () => {
        engineLogger.registry('Initializing foundation engines');
        
        // Data Integrity Engine
        const dataIntegrityEngine = new DataIntegrityEngine();
        
        // Enhanced Z-Score Engine
        const zScoreEngine = new EnhancedZScoreEngine();
        
        return { dataIntegrityEngine, zScoreEngine };
      }
    },
    {
      id: 'pillar1-engines',
      name: 'Pillar 1 Engines',
      description: 'Loading primary financial plumbing engines',
      weight: 2,
      timeout: 8000,
      engineCreator: async () => {
        engineLogger.registry('Initializing Pillar 1 engines');
        
        // Global Financial Plumbing Engine
        const plumbingEngine = new GlobalFinancialPlumbingEngine();
        
        return { plumbingEngine };
      }
    },
    {
      id: 'registration',
      name: 'Engine Registration',
      description: 'Registering engines with management systems',
      weight: 1,
      timeout: 3000,
      engineCreator: async () => {
        engineLogger.registry('Registering engines with both systems');
        
        if (!registry || !unifiedRegistry) {
          throw new Error('Registries not initialized');
        }
        
        // Registration will be handled by individual steps
        return { registered: true };
      }
    },
    {
      id: 'migration-setup',
      name: 'Migration Setup',
      description: 'Configuring backward compatibility',
      weight: 1,
      timeout: 3000,
      engineCreator: async () => {
        engineLogger.registry('Setting up migration and compatibility layer');
        
        // Simplified setup without migration service
        
        return { migrationReady: true };
      }
    }
  ];

  const executeInitializationStep = useCallback(async (stepId: string): Promise<void> => {
    const step = initializationSteps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Unknown initialization step: ${stepId}`);
    }

    setCurrentStep(step.name);
    engineLogger.execution(`Starting step: ${step.name}`);

    try {
      const startTime = Date.now();
      const result = await step.engineCreator();
      const duration = Date.now() - startTime;
      
      engineLogger.execution(`Completed step: ${step.name} in ${duration}ms`, result);
    } catch (error) {
      engineLogger.error(`Failed step: ${step.name}`, error);
      throw error;
    }
  }, [initializationSteps]);

  const calculateProgress = useCallback((completedSteps: number): number => {
    const totalWeight = initializationSteps.reduce((sum, step) => sum + step.weight, 0);
    const completedWeight = initializationSteps
      .slice(0, completedSteps)
      .reduce((sum, step) => sum + step.weight, 0);
    
    return totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
  }, [initializationSteps]);

  const initialize = useCallback(async (): Promise<void> => {
    if (isLoading || isInitialized) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);
    setCurrentStep(null);

    engineLogger.registry('Starting sequential engine initialization');

    try {
      // Execute steps sequentially
      for (let i = 0; i < initializationSteps.length; i++) {
        const step = initializationSteps[i];
        
        await executeInitializationStep(step.id);
        
        // Update progress
        const newProgress = calculateProgress(i + 1);
        setProgress(newProgress);
      }

      // Mark as completed
      setIsInitialized(true);
      setCurrentStep(null);
      
      engineLogger.registry('Sequential engine initialization completed successfully');

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setError(err);
      engineLogger.error('Sequential engine initialization failed', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isInitialized, executeInitializationStep, calculateProgress]);

  const retryInitialization = useCallback(() => {
    engineLogger.registry('Retrying engine initialization');
    
    setIsInitialized(false);
    setError(null);
    setProgress(0);
    setCurrentStep(null);
    
    // Reset singletons if needed
    setTimeout(initialize, 100);
  }, [initialize]);

  // Auto-start initialization
  useEffect(() => {
    if (!isInitialized && !isLoading && !error) {
      initialize();
    }
  }, [initialize, isInitialized, isLoading, error]);

  return {
    isInitialized,
    isLoading,
    error,
    progress,
    currentStep,
    registry,
    unifiedRegistry,
    retryInitialization
  };
}