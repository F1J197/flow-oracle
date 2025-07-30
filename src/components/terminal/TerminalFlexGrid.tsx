import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { terminalCn } from "@/utils/terminalCompliance";

interface TerminalFlexGridProps {
  children: ReactNode;
  columns?: number;
  gap?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  className?: string;
}

export const TerminalFlexGrid = ({ 
  children, 
  columns = 3,
  gap = 'md',
  wrap = true,
  align = 'stretch',
  justify = 'start',
  className 
}: TerminalFlexGridProps) => {
  const getGap = () => {
    switch (gap) {
      case 'sm': return 'gap-2';
      case 'md': return 'gap-4';
      case 'lg': return 'gap-6';
      default: return 'gap-4';
    }
  };

  const getAlign = () => {
    switch (align) {
      case 'start': return 'items-start';
      case 'center': return 'items-center';
      case 'end': return 'items-end';
      case 'stretch': return 'items-stretch';
      default: return 'items-stretch';
    }
  };

  const getJustify = () => {
    switch (justify) {
      case 'start': return 'justify-start';
      case 'center': return 'justify-center';
      case 'end': return 'justify-end';
      case 'between': return 'justify-between';
      case 'around': return 'justify-around';
      case 'evenly': return 'justify-evenly';
      default: return 'justify-start';
    }
  };

  const flexBasis = `${100 / columns}%`;

  return (
    <div 
      className={terminalCn(
        "terminal-flex-grid flex",
        wrap && "flex-wrap",
        getGap(),
        getAlign(),
        getJustify(),
        className
      )}
    >
      {React.Children.map(children, (child, index) => (
        <div 
          key={index}
          className="flex-shrink-0"
          style={{ flexBasis: `calc(${flexBasis} - ${gap === 'sm' ? '0.25rem' : gap === 'lg' ? '1rem' : '0.5rem'})` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};