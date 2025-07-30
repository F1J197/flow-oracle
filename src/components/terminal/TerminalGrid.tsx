import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { terminalCn } from "@/utils/terminalCompliance";

interface TerminalGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TerminalGrid = ({ 
  children, 
  columns = 4, 
  spacing = 'md', 
  className 
}: TerminalGridProps) => {
  const getGridCols = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  const getSpacing = () => {
    switch (spacing) {
      case 'sm': return 'gap-3 p-3';
      case 'md': return 'gap-4 p-4';
      case 'lg': return 'gap-6 p-6';
      default: return 'gap-4 p-4';
    }
  };

  return (
    <div className={terminalCn(
      "grid auto-rows-min",
      getGridCols(),
      getSpacing(),
      className
    )}>
      {children}
    </div>
  );
};