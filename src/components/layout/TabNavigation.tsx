import { cn } from "@/lib/utils";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'engines', label: 'INTELLIGENCE' },
  { id: 'charts', label: 'CHARTS' }
];

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <nav className="w-full bg-bg-secondary border-b border-neon-teal/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "px-6 py-3 text-sm font-bold border-b-2 transition-all duration-150",
                "hover:text-neon-teal hover:border-neon-teal/50 tracking-widest font-mono",
                "relative overflow-hidden",
                activeTab === tab.id
                  ? "text-neon-teal border-neon-teal bg-bg-tile/30"
                  : "text-text-secondary border-transparent hover:bg-bg-tile/20"
              )}
            >
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-neon-teal/5 animate-pulse" />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};