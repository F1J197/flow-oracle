import { cn } from "@/lib/utils";

interface PositionBarsProps {
  grossLong: number;
  grossShort: number;
  netPosition: number;
  historicalAverage: number;
  grossLongPct: number;
  grossShortPct: number;
  netPositionPct: number;
  historicalAvgPct: number;
  className?: string;
}

export const PositionBars = ({
  grossLong,
  grossShort,
  netPosition,
  historicalAverage,
  grossLongPct,
  grossShortPct,
  netPositionPct,
  historicalAvgPct,
  className
}: PositionBarsProps) => {
  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}T`;
    }
    return `${(value / 1000).toFixed(0)}B`;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Gross Long */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary font-mono">GROSS LONG</span>
          <span className="text-btc-orange-bright font-mono">{formatValue(grossLong)}</span>
        </div>
        <div className="h-1.5 bg-glass-bg overflow-hidden terminal-panel">
          <div 
            className="h-full bg-btc-orange-bright transition-all duration-300 terminal-panel"
            style={{ width: `${Math.max(2, grossLongPct)}%` }}
          />
        </div>
      </div>

      {/* Gross Short */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary font-mono">GROSS SHORT</span>
          <span className="text-btc-orange-dark font-mono">{formatValue(Math.abs(grossShort))}</span>
        </div>
        <div className="h-1.5 bg-glass-bg overflow-hidden terminal-panel">
          <div 
            className="h-full bg-btc-orange-dark transition-all duration-300 terminal-panel"
            style={{ width: `${Math.max(2, grossShortPct)}%` }}
          />
        </div>
      </div>

      {/* Net Position */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary font-mono">NET POSITION</span>
          <span className={cn(
            "font-mono",
            netPosition >= 0 ? "text-btc-orange-bright" : "text-btc-orange-dark"
          )}>
            {netPosition >= 0 ? '+' : ''}{formatValue(netPosition)}
          </span>
        </div>
        <div className="h-1.5 bg-glass-bg overflow-hidden relative terminal-panel">
          {/* Center line for zero */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-text-secondary opacity-30" />
          
          {/* Net position bar */}
          <div 
            className={cn(
              "h-full transition-all duration-300 terminal-panel",
              netPosition >= 0 ? "bg-btc-orange-bright" : "bg-btc-orange-dark"
            )}
            style={{ 
              width: `${Math.max(2, Math.abs(netPositionPct))}%`,
              marginLeft: netPosition >= 0 ? '50%' : 'auto',
              marginRight: netPosition < 0 ? '50%' : 'auto',
            }}
          />
        </div>
      </div>

      {/* Historical Average Reference */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary font-mono">HIST. AVG</span>
          <span className="text-btc-orange font-mono">{formatValue(historicalAverage)}</span>
        </div>
        <div className="h-1 bg-glass-bg overflow-hidden terminal-panel">
          <div 
            className="h-full bg-btc-orange opacity-60 transition-all duration-300 terminal-panel"
            style={{ width: `${Math.max(2, historicalAvgPct)}%` }}
          />
        </div>
      </div>
    </div>
  );
};