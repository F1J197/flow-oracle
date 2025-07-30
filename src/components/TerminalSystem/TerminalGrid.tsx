import { ReactNode } from "react";
import { TERMINAL_THEME } from "@/config/terminal.theme";

interface TerminalGridProps {
  children: ReactNode;
  columns?: number;
  gap?: string;
  className?: string;
}

export const TerminalGrid = ({ 
  children, 
  columns = 3,
  gap = TERMINAL_THEME.layout.spacing.md,
  className = ''
}: TerminalGridProps) => {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: gap,
    fontFamily: TERMINAL_THEME.typography.terminal.mono.fontFamily,
    color: TERMINAL_THEME.colors.text.primary,
  };

  return (
    <div style={gridStyle} className={`terminal-grid ${className}`}>
      {children}
    </div>
  );
};