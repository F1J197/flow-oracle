import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { TabNavigation } from "@/components/layout/TabNavigation";
import { Dashboard } from "./Dashboard";
import { IntelligenceEngineWrapper } from "@/components/intelligence/IntelligenceEngineWrapper";
import { UnifiedChartsView } from "@/components/charts/UnifiedChartsView";
// Premium showcase removed
import { ProgressiveLoader, LoadingStep } from "@/components/initialization/ProgressiveLoader";
import { useSequentialEngineInitialization } from "@/hooks/useSequentialEngineInitialization";
import { AppErrorBoundary } from "@/components/error/AppErrorBoundary";
import { appLogger } from "@/utils/debugLogger";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    isInitialized,
    isLoading,
    error,
    progress,
    currentStep,
    retryInitialization
  } = useSequentialEngineInitialization();

  // Define loading steps for the progressive loader
  const loadingSteps: LoadingStep[] = [
    {
      id: 'registries',
      name: 'Engine Registries',
      description: 'Initializing engine management systems',
      weight: 1,
      timeout: 5000
    },
    {
      id: 'foundation',
      name: 'Foundation Engines', 
      description: 'Loading core data and statistical engines',
      weight: 3,
      timeout: 10000
    },
    {
      id: 'pillar1',
      name: 'Financial Engines',
      description: 'Loading financial plumbing engines',
      weight: 2,
      timeout: 8000
    },
    {
      id: 'registration',
      name: 'Registration',
      description: 'Registering engines with management systems',
      weight: 1,
      timeout: 3000
    },
    {
      id: 'migration',
      name: 'Migration Setup',
      description: 'Configuring backward compatibility',
      weight: 1,
      timeout: 3000
    }
  ];

  const handleStepComplete = async (stepId: string): Promise<void> => {
    appLogger.initialization(`Completing loading step: ${stepId}`);
    // Steps are handled by useSequentialEngineInitialization
    return Promise.resolve();
  };

  const handleLoadingComplete = () => {
    appLogger.initialization('Progressive loading completed');
  };

  const handleLoadingError = (error: Error, stepId?: string) => {
    appLogger.error(`Loading error in step ${stepId}: ${error.message}`, error);
  };

  const renderTabContent = () => {
    appLogger.routing(`Rendering tab content for: ${activeTab}`);
    try {
      switch (activeTab) {
        case 'dashboard':
          return <Dashboard />;
        case 'engines':
          return <IntelligenceEngineWrapper />;
        case 'charts':
          return <UnifiedChartsView />;
        case 'showcase':
          return <Dashboard />;
        default:
          return <Dashboard />;
      }
    } catch (error) {
      appLogger.error('Error rendering tab content', error);
      return (
        <AppErrorBoundary fallbackTitle="Tab Content Error">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-destructive mb-2">Error loading content</p>
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className="text-primary hover:underline"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </AppErrorBoundary>
      );
    }
  };

  const renderMainApp = () => {
    try {
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <TabNavigation onTabChange={setActiveTab} />
          <main className="py-6">
            <AppErrorBoundary fallbackTitle="Content Error">
              {renderTabContent()}
            </AppErrorBoundary>
          </main>
        </div>
      );
    } catch (error) {
      appLogger.error('Error rendering main app', error);
      throw error; // Let the parent error boundary handle this
    }
  };

  // Show progressive loader if not initialized
  if (!isInitialized) {
    return (
      <ProgressiveLoader
        steps={loadingSteps}
        onStepComplete={handleStepComplete}
        onComplete={handleLoadingComplete}
        onError={handleLoadingError}
        showProgress={true}
        fallbackDelay={15000} // Show fallback after 15 seconds
      >
        {renderMainApp()}
      </ProgressiveLoader>
    );
  }

  // Show main app when initialized
  return renderMainApp();
};

export default Index;