import { Badge } from "@/components/ui/badge";

export const Header = () => {
  return (
    <header className="w-full bg-noir-bg border-b border-noir-border px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Platform Title */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-primary tracking-wider">
            Liquidity²
          </h1>
          <div className="hidden md:flex items-center space-x-2 text-sm text-secondary">
            <span>Global Intelligence Platform V6</span>
          </div>
        </div>

        {/* Key Metrics Bar */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-text-secondary">Net Liquidity:</span>
            <span className="text-metric neon-teal">$5.626T</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-text-secondary">Regime:</span>
            <Badge variant="outline" className="border-neon-orange text-neon-orange">
              TRANSITION
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-text-secondary">Primary Action:</span>
            <Badge variant="outline" className="border-neon-lime text-neon-lime">
              HOLD POSITIONS
            </Badge>
          </div>
        </div>

        {/* System Status */}
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-neon-lime rounded-full animate-pulse"></div>
          <span className="text-xs text-text-secondary">LIVE</span>
        </div>
      </div>
    </header>
  );
};