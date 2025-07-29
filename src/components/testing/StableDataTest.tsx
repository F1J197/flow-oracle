import { useState, useEffect } from 'react';
import { useStableData } from '@/hooks/useStableData';

export const StableDataTest = () => {
  const [renderCount, setRenderCount] = useState(0);
  const [testValue, setTestValue] = useState(100);

  // Test data that changes frequently
  const stableData = useStableData(testValue, {
    changeThreshold: 0.05,
    debounceMs: 1000,
    smoothingFactor: 0.7
  });

  // Count renders to detect infinite loops
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  // Simulate changing data
  useEffect(() => {
    const interval = setInterval(() => {
      setTestValue(prev => prev + Math.random() * 10 - 5);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-tile p-4 m-4">
      <h3 className="text-text-primary mb-4">Stable Data Hook Test</h3>
      <div className="space-y-2 text-sm">
        <div>Render Count: <span className="text-neon-lime">{renderCount}</span></div>
        <div>Raw Value: <span className="text-text-data">{testValue.toFixed(2)}</span></div>
        <div>Stable Value: <span className="text-text-data">{stableData.value.toFixed(2)}</span></div>
        <div>Is Changing: <span className={stableData.isChanging ? "text-neon-orange" : "text-neon-lime"}>
          {stableData.isChanging ? "YES" : "NO"}
        </span></div>
        <div className="text-xs text-text-secondary mt-4">
          ✓ Render count should stabilize below 20-30 renders
          <br />
          ✓ No infinite re-render loops should occur
        </div>
      </div>
    </div>
  );
};