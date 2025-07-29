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
          "w-2 h-2 rounded-full",
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
      "glass-tile font-mono intelligence-grid",
      "border border-glass-border bg-glass-tile backdrop-blur-md",
      "hover:border-btc-primary/30 transition-all duration-300",
      className
    )}>
      {/* Engine Header */}
      <div className="mb-6 pb-4 border-b border-glass-border/50">
        <div className="flex items-center justify-between mb-2">
          <h2 className={cn(
            "text-lg font-bold uppercase tracking-wider",
            `text-${getStatusColor(status)}`
          )}>
            {title}
          </h2>
          <div className="flex items-center space-x-2">
            {getStatusDot(status)}
            <span className={cn(
              "text-xs font-medium uppercase tracking-wide",
              `text-${getStatusColor(status)}`
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
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};