import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { TabNavigation } from "@/components/layout/TabNavigation";
import { Dashboard } from "./Dashboard";
import { PremiumDashboard } from "./PremiumDashboard";
import { IntelligenceEngineWrapper } from "@/components/intelligence/IntelligenceEngineWrapper";
import { UnifiedChartsView } from "@/components/charts/UnifiedChartsView";
import { UnifiedDataDemo } from "./UnifiedDataDemo";
import SystemValidation from "./SystemValidation";
import { PremiumShowcase } from "./PremiumShowcase";

const Index = () => {
  console.log('🏠 Index component initializing...');
  const [activeTab, setActiveTab] = useState('dashboard');
  console.log('📊 Active tab:', activeTab);

  const renderTabContent = () => {
    console.log('🎨 Rendering tab content for:', activeTab);
    try {
      switch (activeTab) {
        case 'dashboard':
          console.log('📋 Loading Dashboard component...');
          return <Dashboard />;
        case 'engines':
          console.log('⚙️ Loading Intelligence Engine...');
          return <IntelligenceEngineWrapper />;
        case 'charts':
          console.log('📈 Loading Charts view...');
          return <UnifiedChartsView />;
        case 'showcase':
          console.log('✨ Loading Premium showcase...');
          return <PremiumShowcase />;
        default:
          console.log('🔄 Fallback to Dashboard...');
          return <Dashboard />;
      }
    } catch (error) {
      console.error('🚨 Error rendering tab content:', error);
      return (
        <div style={{ color: 'white', padding: '20px' }}>
          Error loading {activeTab}: {error instanceof Error ? error.message : String(error)}
        </div>
      );
    }
  };

  console.log('🔧 Index rendering with activeTab:', activeTab);
  
  try {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="py-6">
          {renderTabContent()}
        </main>
      </div>
    );
  } catch (error) {
    console.error('🚨 Index component error:', error);
    return (
      <div style={{ 
        color: 'white', 
        backgroundColor: 'black', 
        padding: '20px', 
        fontFamily: 'monospace',
        minHeight: '100vh'
      }}>
        <h1>Index Page Error</h1>
        <p>An error occurred:</p>
        <pre>{error instanceof Error ? error.message : String(error)}</pre>
      </div>
    );
  }
};

export default Index;