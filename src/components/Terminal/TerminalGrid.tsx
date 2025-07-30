import { ReactNode } from "react";
import { TERMINAL_THEME } from "@/config/terminal.theme";

type SpacingKey = keyof typeof TERMINAL_THEME.layout.spacing;

interface TerminalGridProps {
  children: ReactNode;
  columns?: number;
  gap?: SpacingKey;
  className?: string;
}

export const TerminalGrid = ({ 
  children, 
  columns = 3,
  gap = 'md',
  className = ''
}: TerminalGridProps) => {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: TERMINAL_THEME.layout.spacing[gap],
    fontFamily: TERMINAL_THEME.typography.terminal.mono.fontFamily,
    color: TERMINAL_THEME.colors.text.primary,
  };

  return (
    <div style={gridStyle} className={`terminal-grid ${className}`}>
      {children}
    </div>
  );
};