import { memo, useMemo, useCallback } from 'react';
import { useTerminalTheme } from '@/hooks/useTerminalTheme';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Zap,
  Pause
} from 'lucide-react';

interface EnhancedSmartTileProps {
  id: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  status: 'active' | 'warning' | 'critical' | 'offline';
  primaryMetric: string;
  secondaryMetric?: string;
  trend: 'up' | 'down' | 'neutral';
  loading: boolean;
  lastUpdated?: Date;
  onClick: () => void;
  // Accessibility props
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const EnhancedSmartTile = memo(({
  id,
  title,
  size,
  status,
  primaryMetric,
  secondaryMetric,
  trend,
  loading,
  lastUpdated,
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}: EnhancedSmartTileProps) => {
  const { theme } = useTerminalTheme();

  // Memoized size classes for performance
  const sizeClasses = useMemo(() => {
    const baseClasses = 'transition-all duration-300 ease-out hover:scale-[1.02]';
    switch (size) {
      case 'large':
        return `col-span-1 sm:col-span-2 lg:col-span-2 row-span-2 ${baseClasses}`;
      case 'medium':
        return `col-span-1 sm:col-span-2 lg:col-span-1 row-span-1 ${baseClasses}`;
      default:
        return `col-span-1 row-span-1 ${baseClasses}`;
    }
  }, [size]);

  // Memoized status properties for performance
  const statusProps = useMemo(() => {
    const baseStyle = {
      borderWidth: '1px',
      borderStyle: 'solid',
    };

    switch (status) {
      case 'active':
        return {
          ...baseStyle,
          borderColor: theme.colors.semantic.success + '60',
          backgroundColor: theme.colors.background.tile,
          boxShadow: `0 0 8px ${theme.colors.semantic.success}20`,
        };
      case 'warning':
        return {
          ...baseStyle,
          borderColor: theme.colors.semantic.warning + '60',
          backgroundColor: theme.colors.background.tile,
          boxShadow: `0 0 8px ${theme.colors.semantic.warning}20`,
        };
      case 'critical':
        return {
          ...baseStyle,
          borderColor: theme.colors.semantic.critical + '80',
          backgroundColor: theme.colors.background.tile,
          boxShadow: `0 0 12px ${theme.colors.semantic.critical}30`,
        };
      case 'offline':
        return {
          ...baseStyle,
          borderColor: theme.colors.text.muted + '30',
          backgroundColor: theme.colors.background.secondary,
        };
      default:
        return {
          ...baseStyle,
          borderColor: theme.colors.neon.teal + '40',
          backgroundColor: theme.colors.background.tile,
        };
    }
  }, [status, theme]);

  // Trend icon component
  const getTrendIcon = useMemo(() => {
    const iconSize = 16;
    const iconProps = { size: iconSize, strokeWidth: 2 };

    switch (trend) {
      case 'up':
        return <TrendingUp {...iconProps} style={{ color: theme.colors.semantic.success }} />;
      case 'down':
        return <TrendingDown {...iconProps} style={{ color: theme.colors.semantic.critical }} />;
      default:
        return <Activity {...iconProps} style={{ color: theme.colors.text.muted }} />;
    }
  }, [trend, theme]);

  // Status icon component
  const getStatusIcon = useMemo(() => {
    const iconSize = 14;
    const iconProps = { size: iconSize, strokeWidth: 2 };

    if (loading) {
      return <Loader2 {...iconProps} className="animate-spin" style={{ color: theme.colors.neon.teal }} />;
    }

    switch (status) {
      case 'active':
        return <CheckCircle {...iconProps} style={{ color: theme.colors.semantic.success }} />;
      case 'warning':
        return <AlertTriangle {...iconProps} style={{ color: theme.colors.semantic.warning }} />;
      case 'critical':
        return <XCircle {...iconProps} style={{ color: theme.colors.semantic.critical }} />;
      case 'offline':
        return <Pause {...iconProps} style={{ color: theme.colors.text.muted }} />;
      default:
        return <Zap {...iconProps} style={{ color: theme.colors.neon.teal }} />;
    }
  }, [status, loading, theme]);

  // Optimized click handler
  const handleClick = useCallback(() => {
    if (!loading) {
      onClick();
    }
  }, [loading, onClick]);

  // Optimized keyboard handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && !loading) {
      event.preventDefault();
      onClick();
    }
  }, [loading, onClick]);

  // Format timestamp for display
  const formatTime = useCallback((date?: Date): string => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      className={`
        ${sizeClasses}
        relative p-4 cursor-pointer focus:outline-none 
        focus:ring-2 focus:ring-neon-teal focus:ring-opacity-50
        active:scale-[0.98] group
        ${status === 'critical' ? 'animate-pulse' : ''}
      `}
      style={{
        ...statusProps,
        fontFamily: theme.typography.terminal.mono.fontFamily,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel || `${title} tile: ${primaryMetric}`}
      aria-describedby={ariaDescribedBy}
      aria-live={status === 'critical' ? 'polite' : 'off'}
    >
      {/* Critical status pulse overlay */}
      {status === 'critical' && (
        <div 
          className="absolute inset-0 pointer-events-none animate-pulse" 
          style={{ 
            background: `linear-gradient(45deg, transparent, ${theme.colors.semantic.critical}10, transparent)` 
          }} 
        />
      )}

      {/* Header section */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <h3 
            className="text-xs font-bold tracking-widest uppercase truncate"
            style={{ color: theme.colors.neon.teal }}
          >
            {title}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          {getStatusIcon}
          <div className="text-xs opacity-75" style={{ color: theme.colors.text.muted }}>
            LIVE
          </div>
        </div>
      </div>

      {/* Main metric display */}
      <div className="flex flex-col space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <div 
            className="text-2xl font-bold tracking-wider font-mono"
            style={{ 
              color: theme.colors.text.data,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {primaryMetric}
          </div>
          {getTrendIcon}
        </div>
        
        {secondaryMetric && (
          <div 
            className="text-sm font-medium"
            style={{ color: theme.colors.text.secondary }}
          >
            {secondaryMetric}
          </div>
        )}
      </div>

      {/* Footer section */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div 
            className={`w-2 h-2 rounded-full ${loading ? 'animate-pulse' : ''}`}
            style={{ 
              backgroundColor: status === 'active' ? theme.colors.semantic.success : 
                              status === 'warning' ? theme.colors.semantic.warning :
                              status === 'critical' ? theme.colors.semantic.critical :
                              theme.colors.text.muted
            }}
          />
          <span 
            className="text-xs font-semibold tracking-wider uppercase"
            style={{ color: theme.colors.text.muted }}
          >
            {loading ? 'UPDATING' : status.toUpperCase()}
          </span>
        </div>
        
        {lastUpdated && (
          <div 
            className="text-xs"
            style={{ color: theme.colors.text.muted }}
          >
            {formatTime(lastUpdated)}
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20"
          style={{ backgroundColor: theme.colors.background.primary + '40' }}
        >
          <Loader2 
            className="animate-spin" 
            size={24} 
            style={{ color: theme.colors.neon.teal }} 
          />
        </div>
      )}
    </div>
  );
});

EnhancedSmartTile.displayName = 'EnhancedSmartTile';