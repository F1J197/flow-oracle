import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { cn } from '@/lib/utils';

interface MomentumDataPoint {
  timestamp: number;
  value: number;
  velocity: number;
  acceleration: number;
}

interface MomentumChartProps {
  data: MomentumDataPoint[];
  timeframe: 'short' | 'medium' | 'long';
  height?: number;
  showVelocity?: boolean;
  showAcceleration?: boolean;
  className?: string;
}

export const MomentumChart = ({ 
  data, 
  timeframe, 
  height = 200, 
  showVelocity = false,
  showAcceleration = false,
  className 
}: MomentumChartProps) => {
  // Format data for chart
  const chartData = data.map((point, index) => ({
    index,
    value: point.value,
    velocity: showVelocity ? point.velocity * 1000 : undefined, // Scale for visibility
    acceleration: showAcceleration ? point.acceleration * 10000 : undefined, // Scale for visibility
    timestamp: new Date(point.timestamp).toLocaleDateString()
  }));

  const getTimeframeColor = () => {
    switch (timeframe) {
      case 'short': return 'hsl(28, 100%, 64%)'; // btc-orange-bright
      case 'medium': return 'hsl(28, 100%, 54%)'; // btc-orange  
      case 'long': return 'hsl(25, 100%, 44%)';  // btc-orange-dark
      default: return 'hsl(28, 100%, 54%)'; // btc-orange
    }
  };

  const getCurrentMomentum = () => {
    if (data.length === 0) return 0;
    return data[data.length - 1].value;
  };

  const momentum = getCurrentMomentum();
  const isPositive = momentum > 0;

  return (
    <div className={cn("bg-glass-bg rounded-lg border border-glass-border p-4", className)}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            {timeframe.toUpperCase()} MOMENTUM
          </h3>
          <div className="flex items-center space-x-2">
            <span className={cn(
              "text-lg font-bold",
              isPositive ? "text-btc-orange-bright" : "text-btc-orange-dark"
            )}>
              {momentum.toFixed(2)}%
            </span>
            <div className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              isPositive 
                ? "bg-btc-orange-bright/20 text-btc-orange-bright border border-btc-orange-bright/30"
                : "bg-btc-orange-dark/20 text-btc-orange-dark border border-btc-orange-dark/30"
            )}>
              {isPositive ? "BULLISH" : "BEARISH"}
            </div>
          </div>
        </div>
        
        {/* Momentum indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: getTimeframeColor() }}></div>
          <span className="text-xs text-text-secondary">LIVE</span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--glass-border))" 
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey="index"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--text-muted))' }}
              hide={true}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--text-muted))' }}
              domain={['dataMin - 1', 'dataMax + 1']}
            />
            
            {/* Zero reference line */}
            <ReferenceLine y={0} stroke="hsl(var(--text-muted))" strokeDasharray="2 2" />
            
            {/* Main momentum line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke={getTimeframeColor()}
              strokeWidth={2}
              dot={false}
              activeDot={{ 
                r: 4, 
                fill: getTimeframeColor(),
                stroke: 'hsl(var(--bg-primary))',
                strokeWidth: 2
              }}
            />
            
            {/* Velocity line (optional) */}
            {showVelocity && (
              <Line
                type="monotone"
                dataKey="velocity"
                stroke="hsl(var(--text-secondary))"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
              />
            )}
            
            {/* Acceleration line (optional) */}
            {showAcceleration && (
              <Line
                type="monotone"
                dataKey="acceleration"
                stroke="hsl(var(--btc-light))"
                strokeWidth={1}
                strokeDasharray="1 1"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Derivative indicators */}
      {(showVelocity || showAcceleration) && (
        <div className="mt-3 pt-3 border-t border-glass-border space-y-2">
          {showVelocity && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary">Velocity:</span>
              <span className="text-text-primary font-mono">
                {data.length > 0 ? data[data.length - 1].velocity.toExponential(2) : '0.00e+0'}
              </span>
            </div>
          )}
          {showAcceleration && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary">Acceleration:</span>
              <span className="text-text-primary font-mono">
                {data.length > 0 ? data[data.length - 1].acceleration.toExponential(2) : '0.00e+0'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Trend arrows */}
      <div className="mt-3 flex justify-center">
        <div className={cn(
          "transition-transform duration-300",
          isPositive ? "rotate-0" : "rotate-180"
        )}>
          <div className={cn(
            "w-4 h-4 border-2 border-t-0 border-l-0 transform rotate-45",
            isPositive ? "border-btc-orange-bright" : "border-btc-orange-dark"
          )}></div>
        </div>
      </div>
    </div>
  );
};