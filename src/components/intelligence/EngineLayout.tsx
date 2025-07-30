import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EngineLayoutProps {
  title: string;
  status: 'active' | 'warning' | 'critical' | 'offline';
  children: ReactNode;
  className?: string;
}

export const EngineLayout = ({ title, status, children, className }: EngineLayoutProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'btc-primary';
      case 'warning': return 'btc-light';
      case 'critical': return 'btc-error';
      case 'offline': return 'text-muted';
      default: return 'btc-primary';
    }
  };

  const getStatusDot = (status: string) => {
    const color = getStatusColor(status);
    return (
      <div 
        className={cn(
          "w-2 h-2 terminal-panel",
          status === 'active' && "bg-btc-primary animate-pulse",
          status === 'warning' && "bg-btc-light animate-pulse",
          status === 'critical' && "bg-btc-error animate-pulse",
          status === 'offline' && "bg-text-muted"
        )}
      />
    );
  };

  return (
    <div className={cn(
      "engine-tile font-mono",
      "p-6 rounded-lg",
      "bg-glass-tile backdrop-blur-md",
      "border border-glass-border",
      "hover:border-btc-primary/30 hover:shadow-btc-glow",
      "transition-all duration-300 ease-out",
      "min-h-[400px] flex flex-col",
      className
    )}>
      {/* Engine Header */}
      <div className="mb-6 pb-4 border-b border-glass-border/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className={cn(
            "text-base font-medium uppercase tracking-wider",
            status === 'active' && "text-btc-primary",
            status === 'warning' && "text-btc-light", 
            status === 'critical' && "text-negative",
            status === 'offline' && "text-text-muted"
          )}>
            {title}
          </h2>
          <div className="flex items-center space-x-2">
            {getStatusDot(status)}
            <span className={cn(
              "text-xs font-medium uppercase tracking-wide",
              status === 'active' && "text-btc-primary",
              status === 'warning' && "text-btc-light",
              status === 'critical' && "text-negative", 
              status === 'offline' && "text-text-muted"
            )}>
              {status}
            </span>
          </div>
        </div>
        
        <div className="text-xs text-text-secondary font-mono">
          Last Updated: {new Date().toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })} UTC
        </div>
      </div>

      {/* Engine Content */}
      <div className="space-y-6 flex-grow overflow-hidden">
        {children}
      </div>
    </div>
  );
};