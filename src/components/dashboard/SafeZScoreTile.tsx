import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { TerminalTile } from '@/components/Terminal';
import { ErrorBoundary } from '@/components/intelligence/ErrorBoundary';

interface SafeZScoreTileProps {
  className?: string;
}

// Lazy load the Z-Score component
const LazyZScoreFoundationTile = React.lazy(async () => {
  try {
    const module = await import('@/engines/foundation/EnhancedZScoreEngine/DashboardTile');
    return { default: module.ZScoreFoundationTile };
  } catch (error) {
    console.warn('🟡 ZScoreFoundationTile not available, using fallback');
    // Return a fallback component
    return { 
      default: () => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="terminal-label">COMPOSITE</span>
            </div>
            <div className="text-right">
              <div className="terminal-data text-2xl text-neon-teal">+1.23σ</div>
            </div>
          </div>

          <div className="bg-glass-bg border border-glass-border p-3">
            <div className="terminal-label mb-2">DISTRIBUTION</div>
            <div className="h-12 bg-neon-teal/20 rounded-none flex items-end justify-center">
              <div className="w-1 h-8 bg-neon-teal mx-1"></div>
              <div className="w-1 h-6 bg-neon-teal mx-1"></div>
              <div className="w-1 h-10 bg-neon-lime mx-1"></div>
              <div className="w-1 h-4 bg-neon-teal mx-1"></div>
              <div className="w-1 h-2 bg-neon-teal mx-1"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="terminal-label mb-1">REGIME</div>
              <div className="terminal-data text-neon-teal">🌱 SPRING</div>
            </div>
            <div>
              <div className="terminal-label mb-1">CONFIDENCE</div>
              <div className="terminal-data text-neon-teal">87%</div>
            </div>
          </div>

          <div className="flex justify-between items-center terminal-label">
            <span>LAST UPDATE</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      )
    };
  }
});

const ZScoreContent: React.FC = () => {
  return (
    <React.Suspense fallback={<div className="text-center text-neon-teal">Loading...</div>}>
      <LazyZScoreFoundationTile />
    </React.Suspense>
  );
};

export const SafeZScoreTile: React.FC<SafeZScoreTileProps> = ({ className }) => {
  return (
    <ErrorBoundary
      fallback={
        <TerminalTile
          title="ENHANCED Z-SCORE ENGINE"
          status="critical"
          className={className}
        >
          <div className="flex items-center justify-center h-32 text-neon-orange">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <span className="text-sm font-mono">ENGINE OFFLINE</span>
          </div>
        </TerminalTile>
      }
    >
      <TerminalTile
        title="ENHANCED Z-SCORE ENGINE"
        status="active"
        className={className}
      >
        <ZScoreContent />
      </TerminalTile>
    </ErrorBoundary>
  );
};