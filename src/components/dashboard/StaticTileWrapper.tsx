import { memo, useState, useEffect, useRef } from "react";

interface StaticTileWrapperProps {
  children: React.ReactNode;
  isolateFromEngines?: boolean; // Completely isolate from engine loading states
}

/**
 * Wrapper that completely isolates static tiles from rapid engine state changes
 */
export const StaticTileWrapper = memo(({ 
  children, 
  isolateFromEngines = true 
}: StaticTileWrapperProps) => {
  const [isStable, setIsStable] = useState(false);
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    if (isolateFromEngines) {
      // Give a brief moment for initial render, then stabilize
      const stabilizeTimer = setTimeout(() => {
        setIsStable(true);
      }, 1000); // 1 second to stabilize

      return () => clearTimeout(stabilizeTimer);
    } else {
      setIsStable(true);
    }
  }, [isolateFromEngines]);

  // If we're isolating from engines and not yet stable, show minimal loading
  if (isolateFromEngines && !isStable) {
    return (
      <div className="glass-tile p-6 animate-pulse">
        <div className="h-4 bg-glass-surface w-1/3 mb-4 terminal-panel"></div>
        <div className="h-8 bg-glass-bg w-1/2 terminal-panel"></div>
      </div>
    );
  }

  return <>{children}</>;
});