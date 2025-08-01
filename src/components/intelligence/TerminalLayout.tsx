import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TERMINAL_THEME } from "@/config/theme";

interface TerminalLayoutProps {
  title: string;
  status: 'active' | 'warning' | 'critical' | 'offline';
  children: ReactNode;
  className?: string;
}

export const TerminalLayout = ({ title, status, children, className }: TerminalLayoutProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'border-neon-lime';
      case 'warning': return 'border-neon-gold';  
      case 'critical': return 'border-neon-orange';
      case 'offline': return 'border-text-muted';
      default: return 'border-neon-teal';
    }
  };

  const getStatusIndicator = () => {
    switch (status) {
      case 'active': return '█';
      case 'warning': return '▲';
      case 'critical': return '✕';
      case 'offline': return '○';
      default: return '█';
    }
  };

  return (
    <div className={cn(
      "terminal-container glass-tile h-full",
      getStatusColor(),
      className
    )}>
      <div className="terminal-header">
        <span className="terminal-title">{title}</span>
        <span className={cn(
          "terminal-status",
          status === 'active' && 'text-neon-lime',
          status === 'warning' && 'text-neon-gold',
          status === 'critical' && 'text-neon-orange',
          status === 'offline' && 'text-text-muted'
        )}>
          {getStatusIndicator()}
        </span>
      </div>
      <div className="terminal-divider"></div>
      <div className="terminal-content">
        {children}
      </div>
    </div>
  );
};