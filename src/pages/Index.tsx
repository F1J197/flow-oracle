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
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <PremiumDashboard />;
      case 'data':
        return <SystemValidation />;
      case 'engines':
        return <IntelligenceEngineWrapper />;
      case 'charts':
        return <UnifiedChartsView />;
      case 'unified-demo':
        return <UnifiedDataDemo />;
      case 'showcase':
        return <PremiumShowcase />;
      default:
        return <PremiumDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="py-6">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default Index;