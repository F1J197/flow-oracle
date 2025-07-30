import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TerminalTileProps {
  title: string;
  children: ReactNode;
  status?: 'active' | 'warning' | 'critical' | 'offline' | 'normal';
  size?: 'sm' | 'md' | 'lg';
  interactive?: 'none' | 'hover' | 'clickable';
  onClick?: () => void;
  className?: string;
}

export const TerminalTile = ({ 
  title, 
  children, 
  status = 'normal',
  size = 'md',
  interactive = 'none',
  onClick,
  className 
}: TerminalTileProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'border-neon-lime/30 bg-neon-lime/5';
      case 'warning': return 'border-neon-gold/30 bg-neon-gold/5';
      case 'critical': return 'border-neon-orange/30 bg-neon-orange/5';
      case 'offline': return 'border-text-secondary/30 bg-text-secondary/5';
      default: return 'border-glass-border bg-bg-tile';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'p-3 min-h-[120px]';
      case 'lg': return 'p-8 min-h-[280px]';
      default: return 'p-6 min-h-[200px]';
    }
  };

  const getInteractiveClasses = () => {
    switch (interactive) {
      case 'hover': return 'hover:bg-bg-tile/80 transition-colors duration-200';
      case 'clickable': return 'cursor-pointer hover:bg-bg-tile/80 hover:border-neon-teal/40 transition-all duration-200 hover:shadow-lg';
      default: return '';
    }
  };

  const handleClick = () => {
    if (interactive === 'clickable' && onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={cn(
        "terminal-tile border rounded-lg backdrop-blur-sm transition-all duration-200",
        getStatusColor(),
        getSizeClasses(),
        getInteractiveClasses(),
        className
      )}
      onClick={handleClick}
    >
      <div className="terminal-tile-header mb-4">
        <h3 className="text-sm font-medium text-text-secondary tracking-wide">
          {title}
        </h3>
      </div>
      <div className="terminal-tile-content">
        {children}
      </div>
    </div>
  );
};