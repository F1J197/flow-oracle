import { Badge } from "@/components/ui/badge";
import { TabNavigation } from './TabNavigation';

interface HeaderProps {
  currentPage?: 'dashboard' | 'intelligence' | 'charts' | 'system' | 'master-prompts';
}

export const Header = ({ currentPage = 'dashboard' }: HeaderProps) => {
  return (
    <header className="w-full bg-bg-primary border-b border-neon-teal/30 px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Terminal Platform Title */}
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-start">
            <h1 className="text-2xl font-bold text-neon-teal tracking-widest font-mono">
              LIQUIDITY²
            </h1>
            <div className="text-xs text-text-secondary font-mono tracking-wider">
              GLOBAL LIQUIDITY INTELLIGENCE TERMINAL
            </div>
          </div>
          <div className="text-neon-teal">│</div>
        </div>

        {/* Terminal Metrics Bar */}
        <div className="flex items-center space-x-8 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-text-secondary tracking-wider">NET_LIQ:</span>
            <span className="text-neon-lime font-bold tracking-wider">$5.626T</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-text-secondary tracking-wider">REGIME:</span>
            <span className="text-neon-gold font-bold tracking-wider">TRANSITION</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-text-secondary tracking-wider">ACTION:</span>
            <span className="text-neon-amber font-bold tracking-wider">HOLD_POS</span>
          </div>
        </div>

        {/* Terminal Status */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-neon-lime animate-pulse terminal-panel"></div>
            <span className="text-xs text-neon-lime font-mono font-bold tracking-wider">LIVE</span>
          </div>
          <div className="text-neon-teal">│</div>
          <span className="text-xs text-text-secondary font-mono tracking-wider">
            {new Date().toLocaleTimeString('en-US', { 
              hour12: false, 
              timeZone: 'UTC' 
            })} UTC
          </span>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <TabNavigation currentPage={currentPage} />
    </header>
  );
};