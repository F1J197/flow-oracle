import { ReactNode } from "react";
import { TERMINAL_THEME } from "@/config/theme";

interface TerminalBoxProps {
  children: ReactNode;
  title?: string;
  status?: 'active' | 'warning' | 'critical' | 'offline';
  width?: string | number;
  height?: string | number;
  padding?: boolean;
  border?: boolean;
  className?: string;
}

export const TerminalBox = ({ 
  children, 
  title,
  status,
  width = 'auto',
  height = 'auto',
  padding = true,
  border = true,
  className = ''
}: TerminalBoxProps) => {
  const getStatusSymbol = () => {
    switch (status) {
      case 'active': return '●';
      case 'warning': return '▲';
      case 'critical': return '■';
      case 'offline': return '○';
      default: return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active': return TERMINAL_THEME.colors.semantic.positive;
      case 'warning': return TERMINAL_THEME.colors.semantic.warning;
      case 'critical': return TERMINAL_THEME.colors.semantic.negative;
      case 'offline': return TERMINAL_THEME.colors.text.secondary;
      default: return TERMINAL_THEME.colors.semantic.info;
    }
  };

  const boxStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    backgroundColor: TERMINAL_THEME.colors.background.secondary,
    border: border ? `1px solid ${TERMINAL_THEME.colors.border.default}` : 'none',
    fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
    fontSize: TERMINAL_THEME.typography.sizes.medium,
    color: TERMINAL_THEME.colors.text.primary,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: TERMINAL_THEME.spacing.xs,
    backgroundColor: TERMINAL_THEME.colors.background.primary,
    borderBottom: `1px solid ${TERMINAL_THEME.colors.border.default}`,
    fontSize: TERMINAL_THEME.typography.sizes.small,
    fontWeight: TERMINAL_THEME.typography.weights.semibold,
  };

  const statusStyle: React.CSSProperties = {
    color: getStatusColor(),
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const contentStyle: React.CSSProperties = {
    padding: padding ? TERMINAL_THEME.spacing.md : '0',
    height: title ? 'calc(100% - 40px)' : '100%',
    overflow: 'auto' as const,
  };

  return (
    <div style={boxStyle} className={`terminal-box ${className}`}>
      {title && (
        <div style={headerStyle}>
          <span>{title}</span>
          {status && (
            <div style={statusStyle}>
              <span>{getStatusSymbol()}</span>
              <span style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                {status}
              </span>
            </div>
          )}
        </div>
      )}
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
};