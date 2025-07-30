import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TerminalHeaderProps {
  title: string;
  subtitle?: string;
  status?: 'active' | 'warning' | 'critical' | 'offline' | 'normal';
  actions?: ReactNode;
  className?: string;
}

export const TerminalHeader = ({ 
  title, 
  subtitle, 
  status = 'normal',
  actions,
  className 
}: TerminalHeaderProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'text-neon-lime';
      case 'warning': return 'text-neon-gold';
      case 'critical': return 'text-neon-orange';
      case 'offline': return 'text-text-secondary';
      default: return 'text-text-primary';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'active': return '●';
      case 'warning': return '△';
      case 'critical': return '✕';
      case 'offline': return '○';
      default: return '◼';
    }
  };

  return (
    <div className={cn("terminal-header mb-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-wide text-text-primary">
              {title}
            </h1>
            <span className={cn("terminal-status-icon", getStatusColor())}>
              {getStatusIcon()}
            </span>
          </div>
          {subtitle && (
            <p className="text-sm text-text-secondary mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="terminal-actions">
            {actions}
          </div>
        )}
      </div>
      <div className="terminal-divider mt-4 border-b border-glass-border"></div>
    </div>
  );
};