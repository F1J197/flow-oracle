import { cn } from "@/lib/utils";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', description: 'Executive overview' },
  { id: 'data', label: 'Data Ingestion', description: 'API feeds & monitoring' },
  { id: 'engines', label: 'Intelligence Engine', description: '28 processing engines' },
  { id: 'charts', label: 'Charts', description: '50+ live indicators' },
  { id: 'unified-demo', label: 'Unified Data Demo', description: 'Complete data layer showcase' }
];

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <nav className="w-full bg-noir-surface border-b border-noir-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200",
                "hover:text-primary hover:border-primary/50",
                activeTab === tab.id
                  ? "text-primary border-primary bg-noir-border/20"
                  : "text-text-secondary border-transparent"
              )}
            >
              <div className="flex flex-col items-start">
                <span className="font-semibold tracking-wide">{tab.label}</span>
                <span className="text-xs text-text-muted mt-0.5">{tab.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};