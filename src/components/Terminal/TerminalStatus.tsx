import React from 'react';
import { TERMINAL_TOKENS, hsl, hsla } from '@/config/terminal.tokens';

export interface TerminalStatusProps {
  status: 'online' | 'offline' | 'error' | 'warning' | 'loading' | 'success' | 'critical';
  label?: string;
  message?: string;
  showPulse?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed';
  uptime?: number; // in seconds
  lastUpdate?: Date;
  className?: string;
}

export const TerminalStatus: React.FC<TerminalStatusProps> = ({
  status,
  label,
  message,
  showPulse = true,
  showIcon = true,
  size = 'md',
  variant = 'default',
  uptime,
  lastUpdate,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          color: hsl(TERMINAL_TOKENS.colors.semantic.success),
          symbol: '●',
          text: 'ONLINE',
          bgColor: hsla(TERMINAL_TOKENS.colors.semantic.success, 0.1),
          borderColor: hsla(TERMINAL_TOKENS.colors.semantic.success, 0.3),
        };
      case 'offline':
        return {
          color: hsl(TERMINAL_TOKENS.colors.text.muted),
          symbol: '○',
          text: 'OFFLINE',
          bgColor: hsla(TERMINAL_TOKENS.colors.text.muted, 0.1),
          borderColor: hsla(TERMINAL_TOKENS.colors.text.muted, 0.3),
        };
      case 'error':
        return {
          color: hsl(TERMINAL_TOKENS.colors.semantic.negative),
          symbol: '✕',
          text: 'ERROR',
          bgColor: hsla(TERMINAL_TOKENS.colors.semantic.negative, 0.1),
          borderColor: hsla(TERMINAL_TOKENS.colors.semantic.negative, 0.3),
        };
      case 'warning':
        return {
          color: hsl(TERMINAL_TOKENS.colors.semantic.warning),
          symbol: '⚠',
          text: 'WARNING',
          bgColor: hsla(TERMINAL_TOKENS.colors.semantic.warning, 0.1),
          borderColor: hsla(TERMINAL_TOKENS.colors.semantic.warning, 0.3),
        };
      case 'loading':
        return {
          color: hsl(TERMINAL_TOKENS.colors.neon.blue),
          symbol: '◐',
          text: 'LOADING',
          bgColor: hsla(TERMINAL_TOKENS.colors.neon.blue, 0.1),
          borderColor: hsla(TERMINAL_TOKENS.colors.neon.blue, 0.3),
        };
      case 'success':
        return {
          color: hsl(TERMINAL_TOKENS.colors.semantic.success),
          symbol: '✓',
          text: 'SUCCESS',
          bgColor: hsla(TERMINAL_TOKENS.colors.semantic.success, 0.1),
          borderColor: hsla(TERMINAL_TOKENS.colors.semantic.success, 0.3),
        };
      case 'critical':
        return {
          color: hsl(TERMINAL_TOKENS.colors.semantic.critical),
          symbol: '⚡',
          text: 'CRITICAL',
          bgColor: hsla(TERMINAL_TOKENS.colors.semantic.critical, 0.1),
          borderColor: hsla(TERMINAL_TOKENS.colors.semantic.critical, 0.3),
        };
      default:
        return {
          color: hsl(TERMINAL_TOKENS.colors.text.secondary),
          symbol: '◦',
          text: 'UNKNOWN',
          bgColor: hsla(TERMINAL_TOKENS.colors.text.secondary, 0.1),
          borderColor: hsla(TERMINAL_TOKENS.colors.text.secondary, 0.3),
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          fontSize: TERMINAL_TOKENS.typography.scale.xs,
          iconSize: TERMINAL_TOKENS.typography.scale.xs,
          padding: TERMINAL_TOKENS.spacing.xs,
          gap: '4px',
        };
      case 'lg':
        return {
          fontSize: TERMINAL_TOKENS.typography.scale.base,
          iconSize: TERMINAL_TOKENS.typography.scale.base,
          padding: TERMINAL_TOKENS.spacing.lg,
          gap: TERMINAL_TOKENS.spacing.sm,
        };
      default: // md
        return {
          fontSize: TERMINAL_TOKENS.typography.scale.sm,
          iconSize: TERMINAL_TOKENS.typography.scale.sm,
          padding: TERMINAL_TOKENS.spacing.md,
          gap: TERMINAL_TOKENS.spacing.sm,
        };
    }
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatLastUpdate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const statusConfig = getStatusConfig();
  const sizeConfig = getSizeConfig();

  const pulseAnimation = showPulse && (status === 'loading' || status === 'critical') ? {
    animation: `${TERMINAL_TOKENS.animations.status.pulse.duration} ${TERMINAL_TOKENS.animations.status.pulse.iteration} ease-in-out infinite`
  } : {};

  if (variant === 'compact') {
    return (
      <div 
        className={`terminal-status-compact ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontFamily: TERMINAL_TOKENS.fonts.primary,
          fontSize: sizeConfig.fontSize,
        }}
      >
        {showIcon && (
          <span 
            style={{ 
              color: statusConfig.color,
              fontSize: sizeConfig.iconSize,
              ...pulseAnimation
            }}
          >
            {statusConfig.symbol}
          </span>
        )}
        <span style={{ color: statusConfig.color, fontWeight: TERMINAL_TOKENS.fonts.weights.medium }}>
          {label || statusConfig.text}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`terminal-status ${className}`}
      style={{
        display: 'flex',
        flexDirection: variant === 'detailed' ? 'column' : 'row',
        alignItems: variant === 'detailed' ? 'flex-start' : 'center',
        gap: sizeConfig.gap,
        padding: sizeConfig.padding,
        background: statusConfig.bgColor,
        border: `1px solid ${statusConfig.borderColor}`,
        fontFamily: TERMINAL_TOKENS.fonts.primary,
        fontSize: sizeConfig.fontSize,
      }}
    >
      {/* Status Icon and Label */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        {showIcon && (
          <span 
            style={{ 
              color: statusConfig.color,
              fontSize: sizeConfig.iconSize,
              ...pulseAnimation
            }}
          >
            {statusConfig.symbol}
          </span>
        )}
        
        <span 
          style={{ 
            color: statusConfig.color, 
            fontWeight: TERMINAL_TOKENS.fonts.weights.semibold,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {label || statusConfig.text}
        </span>
      </div>

      {/* Additional Information */}
      {variant === 'detailed' && (
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            fontSize: TERMINAL_TOKENS.typography.scale.xs,
            color: hsl(TERMINAL_TOKENS.colors.text.secondary),
          }}
        >
          {message && (
            <div>{message}</div>
          )}
          
          {uptime !== undefined && (
            <div>UPTIME: {formatUptime(uptime)}</div>
          )}
          
          {lastUpdate && (
            <div>UPDATED: {formatLastUpdate(lastUpdate)}</div>
          )}
        </div>
      )}

      {/* Inline Message */}
      {variant === 'default' && message && (
        <span 
          style={{ 
            color: hsl(TERMINAL_TOKENS.colors.text.secondary),
            fontSize: TERMINAL_TOKENS.typography.scale.xs
          }}
        >
          {message}
        </span>
      )}
    </div>
  );
};

export default TerminalStatus;