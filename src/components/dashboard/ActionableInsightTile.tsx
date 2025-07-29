import { GlassTile } from "@/components/shared/GlassTile";
import { Badge } from "@/components/ui/badge";
import { ActionableInsight } from "@/types/engines";
import { memo } from "react";

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
  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'lime';
      case 'SELL': return 'orange'; 
      case 'HOLD': return 'teal';
      case 'WAIT': return 'gold';
      default: return 'gold';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'text-neon-lime';
      case 'MED': return 'text-neon-teal';
      case 'LOW': return 'text-neon-gold';
      default: return 'text-neon-gold';
    }
  };

  if (loading) {
    return (
      <GlassTile title={engineName} size="normal">
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-noir-border rounded w-3/4"></div>
          <div className="h-4 bg-noir-border rounded w-1/2"></div>
        </div>
      </GlassTile>
    );
  }

  return (
    <GlassTile 
      title={engineName}
      size="normal"
      className="cursor-pointer hover:scale-[1.02] transition-all duration-300"
    >
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
            className={`h-full bg-gradient-to-r from-neon-${getActionColor(insight.marketAction)} to-neon-${getActionColor(insight.marketAction)}/60 transition-all duration-1000`}
            style={{ width: `${insight.signalStrength}%` }}
          />
        </div>
        <div className="text-right">
          <span className="text-xs text-text-secondary">{insight.signalStrength}%</span>
        </div>
      </div>

      {/* Market Action */}
      <div className="mb-4">
        <Badge 
          variant="outline" 
          className={`border-neon-${getActionColor(insight.marketAction)} text-neon-${getActionColor(insight.marketAction)} font-mono text-lg px-4 py-2`}
        >
          {insight.marketAction}
        </Badge>
      </div>

      {/* Actionable Text */}
      <p className="text-sm text-text-primary font-mono leading-relaxed">
        {insight.actionText}
      </p>

      {/* Timeframe */}
      <div className="mt-3 pt-3 border-t border-noir-border">
        <span className="text-xs text-text-secondary uppercase tracking-wider">
          {insight.timeframe.replace('_', ' ')}
        </span>
      </div>
    </GlassTile>
  );
});