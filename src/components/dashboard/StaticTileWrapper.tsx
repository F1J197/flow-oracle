import { memo, useState, useEffect, useRef } from "react";
import { TerminalContainer } from "@/components/Terminal";

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
      <TerminalContainer variant="tile" className="animate-pulse">
        <div className="h-4 bg-bg-secondary w-1/3 mb-4"></div>
        <div className="h-8 bg-bg-secondary w-1/2"></div>
      </TerminalContainer>
    );
  }

  return <>{children}</>;
});