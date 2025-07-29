import { cn } from "@/lib/utils";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'engines', label: 'INTELLIGENCE' },
  { id: 'charts', label: 'CHARTS' },
  { id: 'showcase', label: 'PREMIUM' }
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
                "px-8 py-4 text-lg font-bold border-b-2 transition-all duration-200",
                "hover:text-primary hover:border-primary/50 tracking-wider",
                activeTab === tab.id
                  ? "text-primary border-primary bg-noir-border/20"
                  : "text-text-secondary border-transparent"
              )}
            >
              <span className="font-mono">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};