import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";

interface TabNavigationProps {
  currentPage?: 'dashboard' | 'intelligence' | 'charts' | 'system';
  onTabChange?: (tab: string) => void;
}

export const TabNavigation = ({ currentPage, onTabChange }: TabNavigationProps) => {
  const location = useLocation();

  const tabs = [
    { id: 'dashboard', label: 'DASHBOARD', path: '/' },
    { id: 'intelligence', label: 'INTELLIGENCE ENGINE', path: '/intelligence' },
    { id: 'charts', label: 'CHARTS', path: '/charts' },
    { id: 'system', label: 'SYSTEM', path: '/system' },
  ];

  const getCurrentTab = () => {
    if (currentPage) return currentPage;
    return tabs.find(tab => location.pathname === tab.path)?.id || 'dashboard';
  };

  const activeTab = getCurrentTab();

  return (
    <nav className="w-full bg-bg-secondary border-b border-neon-teal/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-0">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to={tab.path}
              onClick={() => onTabChange?.(tab.id)}
              className={cn(
                "px-6 py-3 text-sm font-bold border-b-2 transition-all duration-150",
                "hover:text-neon-teal hover:border-neon-teal/50 tracking-widest font-mono",
                "relative overflow-hidden block",
                activeTab === tab.id
                  ? "text-neon-teal border-neon-teal bg-bg-tile/30"
                  : "text-text-secondary border-transparent hover:bg-bg-tile/20"
              )}
            >
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-neon-teal/5 animate-pulse" />
              )}
              <span className="relative z-10">{tab.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};