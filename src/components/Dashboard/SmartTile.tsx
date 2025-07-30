import { useTerminalTheme } from '@/hooks/useTerminalTheme';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartTileProps {
  id: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  status: 'active' | 'warning' | 'critical' | 'offline';
  primaryMetric: string;
  secondaryMetric?: string;
  trend: 'up' | 'down' | 'neutral';
  loading: boolean;
  lastUpdated?: Date;
  onClick?: () => void;
}

export const SmartTile = ({
  id,
  title,
  size,
  status,
  primaryMetric,
  secondaryMetric,
  trend,
  loading,
  lastUpdated,
  onClick
}: SmartTileProps) => {
  const { theme } = useTerminalTheme();

  const getSizeClasses = () => {
    switch (size) {
      case 'large':
        return 'col-span-2 row-span-2';
      case 'medium':
        return 'col-span-2 row-span-1';
      case 'small':
      default:
        return 'col-span-1 row-span-1';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return theme.colors.semantic.success;
      case 'warning':
        return theme.colors.semantic.warning;
      case 'critical':
        return theme.colors.semantic.critical;
      case 'offline':
        return theme.colors.text.muted;
      default:
        return theme.colors.neon.teal;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} style={{ color: theme.colors.semantic.positive }} />;
      case 'down':
        return <TrendingDown size={16} style={{ color: theme.colors.semantic.negative }} />;
      case 'neutral':
      default:
        return <Minus size={16} style={{ color: theme.colors.text.muted }} />;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'offline':
        return <WifiOff size={14} style={{ color: theme.colors.text.muted }} />;
      case 'critical':
        return <AlertTriangle size={14} style={{ color: theme.colors.semantic.critical }} />;
      case 'warning':
        return <AlertTriangle size={14} style={{ color: theme.colors.semantic.warning }} />;
      default:
        return <Wifi size={14} style={{ color: theme.colors.semantic.success }} />;
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden transition-all duration-200 cursor-pointer group',
        getSizeClasses()
      )}
      style={{
        backgroundColor: theme.colors.background.tile,
        border: `1px solid ${getStatusColor()}40`,
        padding: theme.layout.spacing.md,
      }}
      onClick={onClick}
    >
      {/* Background glow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200"
        style={{
          background: `linear-gradient(135deg, ${getStatusColor()}20, transparent)`,
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <h3 
            className="text-xs uppercase tracking-wider font-semibold truncate"
            style={{
              color: theme.colors.text.secondary,
              fontFamily: theme.typography.terminal.label.fontFamily,
            }}
          >
            {title}
          </h3>
        </div>
        
        {lastUpdated && (
          <div 
            className="text-xs"
            style={{
              color: theme.colors.text.muted,
              fontFamily: theme.typography.terminal.mono.fontFamily,
            }}
          >
            {formatTime(lastUpdated)}
          </div>
        )}
      </div>

      {/* Primary Metric */}
      <div className="mb-1">
        {loading ? (
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: getStatusColor() }}
            />
            <span 
              className="text-lg font-bold"
              style={{
                color: theme.colors.text.muted,
                fontFamily: theme.typography.terminal.data.fontFamily,
              }}
            >
              Loading...
            </span>
          </div>
        ) : (
          <div 
            className={cn(
              'font-bold',
              size === 'large' ? 'text-3xl' : size === 'medium' ? 'text-2xl' : 'text-xl'
            )}
            style={{
              color: theme.colors.text.primary,
              fontFamily: theme.typography.terminal.data.fontFamily,
            }}
          >
            {primaryMetric}
          </div>
        )}
      </div>

      {/* Secondary Metric & Trend */}
      {secondaryMetric && !loading && (
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span 
            className="text-sm"
            style={{
              color: trend === 'up' 
                ? theme.colors.semantic.positive 
                : trend === 'down' 
                  ? theme.colors.semantic.negative 
                  : theme.colors.text.secondary,
              fontFamily: theme.typography.terminal.mono.fontFamily,
            }}
          >
            {secondaryMetric}
          </span>
        </div>
      )}

      {/* Status indicator line */}
      <div 
        className="absolute bottom-0 left-0 w-full h-0.5 opacity-60"
        style={{ backgroundColor: getStatusColor() }}
      />

      {/* Corner accent for large tiles */}
      {size === 'large' && (
        <div 
          className="absolute top-0 right-0 w-8 h-8 opacity-20"
          style={{
            background: `linear-gradient(-45deg, ${getStatusColor()}, transparent)`,
          }}
        />
      )}
    </div>
  );
};