import { BaseTile } from "@/components/tiles";
import { Badge } from "@/components/ui/badge";
import { ActionableInsight } from "@/types/engines";
import { memo, useState, useEffect } from "react";

interface ActionableInsightTileProps {
  insight: ActionableInsight;
  engineName: string;
  loading?: boolean;
}

export const ActionableInsightTile = memo(({ 
  insight, 
  engineName,
  loading = false 
}: ActionableInsightTileProps) => {
  // Stabilize signal strength to prevent rapid glitching
  const [stableSignalStrength, setStableSignalStrength] = useState(insight.signalStrength);
  
  useEffect(() => {
    // Only update if the change is significant (>5%) to reduce visual noise
    const difference = Math.abs(insight.signalStrength - stableSignalStrength);
    if (difference > 5 || stableSignalStrength === 0) {
      const timer = setTimeout(() => {
        setStableSignalStrength(insight.signalStrength);
      }, 100); // Small delay to batch rapid updates
      
      return () => clearTimeout(timer);
    }
  }, [insight.signalStrength, stableSignalStrength]);
  const getActionColorClass = (action: string) => {
    switch (action) {
      case 'BUY': return 'btc-orange-bright';
      case 'SELL': return 'btc-orange-dark'; 
      case 'HOLD': return 'btc-orange';
      case 'WAIT': return 'btc-orange-muted';
      default: return 'btc-orange-muted';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'text-btc-orange-light';
      case 'MED': return 'text-btc-orange';
      case 'LOW': return 'text-btc-orange-muted';
      default: return 'text-btc-orange-muted';
    }
  };

  if (loading) {
    return (
      <BaseTile status="loading" className="cursor-pointer hover:scale-[1.02] transition-all duration-300">
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-noir-border rounded w-3/4"></div>
          <div className="h-4 bg-noir-border rounded w-1/2"></div>
        </div>
      </BaseTile>
    );
  }

  return (
    <BaseTile 
      className="cursor-pointer hover:scale-[1.02] transition-all duration-300"
      interactive="clickable"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs text-text-secondary uppercase tracking-wide">
          {engineName}
        </span>
        <Badge 
          variant={getActionColorClass(insight.marketAction) as any}
          className="font-mono text-xs px-2 py-1"
        >
          {insight.marketAction}
        </Badge>
      </div>

      {/* Signal Strength Meter */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-text-secondary">SIGNAL STRENGTH</span>
          <span className={`text-xs font-mono ${getConfidenceColor(insight.confidence)}`}>
            {insight.confidence}
          </span>
        </div>
        <div className="w-full bg-noir-border rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-btc-orange transition-all duration-500 ease-out"
            style={{ width: `${stableSignalStrength}%` }}
          />
        </div>
        <div className="text-right">
          <span className="text-xs text-text-secondary">{stableSignalStrength}%</span>
        </div>
      </div>

      {/* Actionable Text */}
      <p className="text-sm text-text-primary font-mono leading-relaxed mb-3">
        {insight.actionText}
      </p>

      {/* Timeframe */}
      <div className="pt-3 border-t border-noir-border">
        <span className="text-xs text-text-secondary uppercase tracking-wider">
          {insight.timeframe.replace('_', ' ')}
        </span>
      </div>
    </BaseTile>
  );
});