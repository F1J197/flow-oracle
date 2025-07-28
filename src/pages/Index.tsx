import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { TabNavigation } from "@/components/layout/TabNavigation";
import { Dashboard } from "./Dashboard";
import { DataIngestionPanel } from "@/components/data/DataIngestionPanel";
import IntelligenceEngine from "./IntelligenceEngine";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'data':
        return (
          <div className="max-w-7xl mx-auto p-6">
            <DataIngestionPanel />
          </div>
        );
      case 'engines':
        return <IntelligenceEngine />;
      case 'charts':
        return (
          <div className="max-w-7xl mx-auto p-6">
            <div className="glass-tile p-8 text-center">
              <h2 className="text-2xl font-bold text-primary mb-4">Charts & Indicators</h2>
              <p className="text-text-secondary">50+ indicators visualization coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
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
