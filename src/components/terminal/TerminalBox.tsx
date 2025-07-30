import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { terminalCn } from "@/utils/terminalCompliance";

interface TerminalBoxProps {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  border?: boolean;
  background?: 'transparent' | 'glass' | 'solid';
  className?: string;
}

export const TerminalBox = ({ 
  children, 
  padding = 'md',
  border = true,
  background = 'glass',
  className 
}: TerminalBoxProps) => {
  const getPadding = () => {
    switch (padding) {
      case 'sm': return 'p-2';
      case 'md': return 'p-4';
      case 'lg': return 'p-6';
      default: return 'p-4';
    }
  };

  const getBackground = () => {
    switch (background) {
      case 'transparent': return 'bg-transparent';
      case 'glass': return 'bg-glass-bg backdrop-blur-sm';
      case 'solid': return 'bg-bg-secondary';
      default: return 'bg-glass-bg backdrop-blur-sm';
    }
  };

  return (
    <div className={terminalCn(
      "terminal-box",
      getPadding(),
      getBackground(),
      border && "border border-glass-border",
      "rounded-md",
      className
    )}>
      {children}
    </div>
  );
};