import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DataOrchestrator } from '@/services/DataOrchestrator';
import { debugLogger } from '@/utils/debugLogger';

interface DataOrchestratorContextType {
  orchestrator: DataOrchestrator | null;
  isInitialized: boolean;
  error: string | null;
}

const DataOrchestratorContext = createContext<DataOrchestratorContextType | undefined>(undefined);

export const useDataOrchestrator = () => {
  const context = useContext(DataOrchestratorContext);
  if (context === undefined) {
    throw new Error('useDataOrchestrator must be used within a DataOrchestratorProvider');
  }
  return context;
};

interface DataOrchestratorProviderProps {
  children: ReactNode;
}

export const DataOrchestratorProvider: React.FC<DataOrchestratorProviderProps> = ({ children }) => {
  const [orchestrator, setOrchestrator] = useState<DataOrchestrator | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeOrchestrator = async () => {
      try {
        debugLogger.info('DATA_ORCHESTRATOR', 'Initializing DataOrchestrator...');
        const instance = DataOrchestrator.getInstance();
        setOrchestrator(instance);
        
        await instance.initialize();
        setIsInitialized(true);
        debugLogger.info('DATA_ORCHESTRATOR', 'DataOrchestrator initialized successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        debugLogger.error('DATA_ORCHESTRATOR', 'Failed to initialize DataOrchestrator', err);
      }
    };

    initializeOrchestrator();

    // Cleanup on unmount
    return () => {
      if (orchestrator) {
        orchestrator.shutdown().catch(err => {
          debugLogger.error('DATA_ORCHESTRATOR', 'Error shutting down DataOrchestrator', err);
        });
      }
    };
  }, []);

  const value: DataOrchestratorContextType = {
    orchestrator,
    isInitialized,
    error,
  };

  return (
    <DataOrchestratorContext.Provider value={value}>
      {children}
    </DataOrchestratorContext.Provider>
  );
};