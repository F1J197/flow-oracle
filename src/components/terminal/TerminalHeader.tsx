import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { terminalCn, getTerminalStatusColor } from "@/utils/terminalCompliance";

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
  const statusColor = getTerminalStatusColor(status);
  
  const getStatusIndicator = () => {
    switch (status) {
      case 'active': return '█';
      case 'warning': return '▲';
      case 'critical': return '✕';
      case 'offline': return '○';
      default: return '';
    }
  };

  return (
    <div className={terminalCn(
      "flex items-center justify-between border-b border-glass-border pb-2 mb-4",
      className
    )}>
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <h2 className="terminal-label text-text-primary text-sm">
            {title}
          </h2>
          {subtitle && (
            <span className="text-xs text-text-muted font-mono">
              {subtitle}
            </span>
          )}
        </div>
        
        {status !== 'normal' && (
          <span className={cn("text-sm font-mono", statusColor)}>
            {getStatusIndicator()}
          </span>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};